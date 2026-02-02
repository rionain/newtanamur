<?php

namespace App\Services;

use Config\Database;

class SummaryService
{
    protected $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    /**
     * Process summaries for a specific vehicle and date
     */
    public function process(int $mobilId, string $date): array
    {
        $cleanDate = str_replace('-', '_', $date);
        $tableName = "mypos_" . $cleanDate;

        if (!$this->db->tableExists($tableName)) {
            return ['status' => 'error', 'msg' => "Archived table $tableName not found"];
        }

        $pulses = $this->db->table($tableName)
            ->where('mobil_id', $mobilId)
            ->orderBy('dtime', 'ASC')
            ->get()
            ->getResultArray();

        if (empty($pulses)) {
            return ['status' => 'ok', 'trips_found' => 0, 'stops_found' => 0];
        }

        $trips = [];
        $stops = [];

        $currentTrip = null;
        $currentStop = null;

        $stopThreshold = 300; // 5 minutes in seconds

        foreach ($pulses as $idx => $p) {
            $speed = (float) $p['speed'];
            $time = strtotime($p['dtime']);

            if ($speed > 0) {
                // Moving - Trip logic
                if ($currentStop) {
                    $this->closeStop($currentStop, $p);
                    $stops[] = $currentStop;
                    $currentStop = null;
                }

                if (!$currentTrip) {
                    $currentTrip = $this->startTrip($p);
                } else {
                    $this->updateTrip($currentTrip, $p);
                }
            } else {
                // Stopped - Stop logic
                if ($currentTrip) {
                    $this->closeTrip($currentTrip, $p);
                    $trips[] = $currentTrip;
                    $currentTrip = null;
                }

                if (!$currentStop) {
                    $currentStop = $this->startStop($p);
                } else {
                    $this->updateStop($currentStop, $p);
                }
            }
        }

        // Close dangling segments
        if ($currentTrip) {
            $this->closeTrip($currentTrip, end($pulses));
            $trips[] = $currentTrip;
        }
        if ($currentStop) {
            $this->closeStop($currentStop, end($pulses));
            $stops[] = $currentStop;
        }
        // Save to DB
        $this->saveSummaries($mobilId, $trips, $stops);

        return [
            'status' => 'ok',
            'trips_found' => count($trips),
            'stops_found' => count($stops)
        ];
    }

    private function startTrip($p)
    {
        return [
            'mobil_id' => $p['mobil_id'],
            'start_time' => $p['dtime'],
            'start_lat' => $p['latitude'],
            'start_lng' => $p['longitude'],
            'max_speed' => $p['speed'],
            'pulses' => [$p],
            'distance' => 0,
            'fuel_start' => $p['fuel_raw'] // Assuming calibration done later or raw stored
        ];
    }

    private function updateTrip(&$trip, $p)
    {
        $lastPulse = end($trip['pulses']);
        $trip['distance'] += $this->calculateDistance($lastPulse['latitude'], $lastPulse['longitude'], $p['latitude'], $p['longitude']);
        if ($p['speed'] > $trip['max_speed'])
            $trip['max_speed'] = $p['speed'];
        $trip['pulses'][] = $p;
    }

    private function closeTrip(&$trip, $p)
    {
        $trip['end_time'] = $p['dtime'];
        $trip['end_lat'] = $p['latitude'];
        $trip['end_lng'] = $p['longitude'];
        $trip['duration_sec'] = strtotime($trip['end_time']) - strtotime($trip['start_time']);
        $trip['avg_speed'] = ($trip['duration_sec'] > 0) ? $trip['distance'] / ($trip['duration_sec'] / 3600) : 0;
        unset($trip['pulses']); // Don't save raw pulses in summary table
    }

    private function startStop($p)
    {
        return [
            'mobil_id' => $p['mobil_id'],
            'start_time' => $p['dtime'],
            'latitude' => $p['latitude'],
            'longitude' => $p['longitude'],
            'duration_sec' => 0
        ];
    }

    private function updateStop(&$stop, $p)
    {
        $stop['end_time'] = $p['dtime'];
        $stop['duration_sec'] = strtotime($stop['end_time']) - strtotime($stop['start_time']);
    }

    private function closeStop(&$stop, $p)
    {
        // Already updated via updateStop
    }

    private function saveSummaries(int $mobilId, array $trips, array $stops)
    {
        $this->db->transStart();

        // Remove existing summaries for this period to allow re-runs
        if (!empty($trips)) {
            $this->db->table('trip_summary')
                ->where('mobil_id', $mobilId)
                ->where('DATE(start_time)', date('Y-m-d', strtotime($trips[0]['start_time'])))
                ->delete();
        }
        if (!empty($stops)) {
            $this->db->table('stop_summary')
                ->where('mobil_id', $mobilId)
                ->where('DATE(start_time)', date('Y-m-d', strtotime($stops[0]['start_time'])))
                ->delete();
        }
        foreach ($trips as $t) {
            if ($t['duration_sec'] < 10)
                continue; // Filter out noise
            $this->db->table('trip_summary')->insert([
                'mobil_id' => $t['mobil_id'],
                'start_time' => $t['start_time'],
                'end_time' => $t['end_time'],
                'duration_sec' => $t['duration_sec'],
                'distance_km' => round($t['distance'], 2),
                'start_lat' => $t['start_lat'],
                'start_lng' => $t['start_lng'],
                'end_lat' => $t['end_lat'],
                'end_lng' => $t['end_lng'],
                'max_speed' => $t['max_speed'],
                'avg_speed' => round($t['avg_speed'], 2),
                'fuel_used' => 0 // Future logic
            ]);
        }

        foreach ($stops as $s) {
            if ($s['duration_sec'] < 300)
                continue; // Noise/Traffic lights filtered (5 mins)
            $this->db->table('stop_summary')->insert([
                'mobil_id' => $s['mobil_id'],
                'start_time' => $s['start_time'],
                'end_time' => $s['end_time'] ?? $s['start_time'],
                'duration_sec' => $s['duration_sec'],
                'latitude' => $s['latitude'],
                'longitude' => $s['longitude']
            ]);
        }

        $this->db->transComplete();
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $theta = $lon1 - $lon2;
        $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
        $dist = acos($dist);
        $dist = rad2deg($dist);
        $miles = $dist * 60 * 1.1515;
        return $miles * 1.609344;
    }
}
