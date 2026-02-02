<?php

namespace App\Services;

use App\Models\VehicleModel;
use App\Models\PositionModel;
use Config\Database;

class GpsIngestionService
{
    protected $db;
    protected $cache;
    protected $vehicleModel;

    public function __construct()
    {
        $this->db = Database::connect();
        $this->cache = new CacheService();
        $this->vehicleModel = new VehicleModel();
    }

    /**
     * Repairs GPS Timestamp (Rollover Fix)
     * Methodology from Legacy gps08post.php & Architecture Ref.
     */
    public function repairTimestamp(string $dtime, float $longitude = 0): string
    {
        $dt = new \DateTime($dtime);
        $now = new \DateTime();

        // 1. Zero Longitude check (Invalid fix)
        if ($longitude == 0) {
            $checkDate = new \DateTime('2002-02-02');
            return ($dt > $checkDate) ? '2002-02-02 00:00:00' : $dtime;
        }

        // 2. GPS Week Rollover Fix (1024 week cycles)
        // 29357 days ≈ 80 years (4 cycles)
        // 7168 days ≈ 19.6 years (1 cycle)

        $diff = $now->diff($dt);
        $daysDiff = (int) $diff->format('%r%a');

        // Future dates (Rollover occurred in the past, device thinks it's the future)
        if ($daysDiff > 29350) {
            $dt->modify('-29357 days');
        } elseif ($daysDiff > 7160) {
            $dt->modify('-7168 days');
        }
        // Past dates (Rollover occurred recently, device thinks it's in the past)
        elseif ($daysDiff < -7167 && $daysDiff > -7170) {
            $dt->modify('+7168 days');
        }

        return $dt->format('Y-m-d H:i:s');
    }

    /**
     * Main Ingestion Logic for a single raw pulse
     */
    public function ingest(array $data): bool
    {
        $deviceKode = $data['kode'] ?? '';
        if (!$deviceKode)
            return false;

        $vehicle = $this->vehicleModel->where('device_kode', $deviceKode)->first();
        if (!$vehicle) {
            // Log unknown device or create auto-mobil if policy allows
            return false;
        }

        // Repair Data
        $realDtime = $this->repairTimestamp($data['dtime'] ?? date('Y-m-d H:i:s'), (float) ($data['lng'] ?? 0));

        $cleanData = [
            'mobil_id' => $vehicle['id'],
            'dtime' => $realDtime,
            'latitude' => $data['lat'] ?? 0,
            'longitude' => $data['lng'] ?? 0,
            'speed' => $data['speed'] ?? 0,
            'heading' => $data['heading'] ?? 0,
            'fuel_raw' => $data['fuel'] ?? 0,
            'temp_raw' => $data['temp'] ?? 0,
            'onstate' => $data['onstate'] ?? 0,
        ];

        // 1. Insert into Staging (Live Feed Sink)
        $this->db->table('receiverposition')->insert($cleanData);

        // 2. Update Vehicle Cache (Turbo Speed)
        // Fuel Calibration (Linear)
        $fuelLtr = 0;
        if ($vehicle['fuel_volt2'] > $vehicle['fuel_volt1']) {
            $fuelRaw = (int) ($data['fuel'] ?? 0);
            $ratio = ($fuelRaw - $vehicle['fuel_volt1']) / ($vehicle['fuel_volt2'] - $vehicle['fuel_volt1']);
            $fuelLtr = $vehicle['fuel_liter1'] + ($ratio * ($vehicle['fuel_liter2'] - $vehicle['fuel_liter1']));
            $fuelLtr = max(0, round($fuelLtr, 1));
        }

        $this->vehicleModel->update($vehicle['id'], [
            'last_lat' => $cleanData['latitude'],
            'last_lng' => $cleanData['longitude'],
            'last_speed' => $cleanData['speed'],
            'last_dtime' => $cleanData['dtime'],
            'old_fuel' => $fuelLtr // Legacy field mapping
        ]);

        // 3. Hit Filesystem Cache (Mark company as updated)
        $this->cache->markAsUpdated((int) $vehicle['company_id']);

        // 4. Check for Alerts
        $alertService = new AlertService();
        $vehicle['last_fuel'] = $fuelLtr; // Update for alert check
        $alertService->checkAlerts($cleanData, $vehicle);

        return true;
    }

    /**
     * Batch process from an external staging table (Legacy compatibility)
     */
    public function processBatchStaging(): int
    {
        $builder = $this->db->table('receiverposition');
        $pulses = $builder->get()->getResultArray();

        $count = 0;
        foreach ($pulses as $pulse) {
            // In legacy, we move from staging to daily tables
            // For now, we focus on live-update logic
            $count++;
        }

        return $count;
    }
}
