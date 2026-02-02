<?php

namespace App\Services;

use Config\Database;

class AlertService
{
    protected $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    /**
     * Check for alerts in a single pulse
     */
    public function checkAlerts(array $pulse, array $vehicle): void
    {
        // 1. Overspeed Alert
        // We'll use a hardcoded 80 km/h for now, or fetch from vehicle limits
        $speedLimit = 80;
        if ($pulse['speed'] > $speedLimit) {
            $this->logAlert($vehicle['id'], 'overspeed', "Kecepatan terdeteksi {$pulse['speed']} km/h (Limit: $speedLimit)");
        }

        // 2. SOS Alert (Example: alarm code from GPS hardware)
        if (isset($pulse['alarm']) && $pulse['alarm'] == 'sos') {
            $this->logAlert($vehicle['id'], 'sos', "Tombol SOS Ditekan!");
        }

        // 3. Low Fuel Alert (from calibration result)
        if (isset($vehicle['last_fuel']) && $vehicle['last_fuel'] < 5) {
            // Avoid spamming low fuel alerts (Check if already alerted recently)
            $this->logAlert($vehicle['id'], 'low_fuel', "Bahan bakar kritis: {$vehicle['last_fuel']} Liter");
        }
    }

    /**
     * Generic alert Logger
     */
    protected function logAlert(int $mobilId, string $type, string $msg): void
    {
        // Check for cooldown to prevent alert spamming (e.g., 5 minutes)
        $threshold = date('Y-m-d H:i:s', time() - 300);
        $recent = $this->db->table('alert_logs')
            ->where('mobil_id', $mobilId)
            ->where('alert_type', $type)
            ->where('created_at >', $threshold)
            ->countAllResults();

        if ($recent > 0)
            return;

        $this->db->table('alert_logs')->insert([
            'mobil_id' => $mobilId,
            'alert_type' => $type,
            'message' => $msg,
            'is_read' => 0,
            'created_at' => date('Y-m-d H:i:s')
        ]);

        // Here we would also trigger SMS/Email via external gateways
        file_put_contents(WRITEPATH . 'logs/alerts.log', date('Y-m-d H:i:s') . " | Vehicle $mobilId | Alert: $type | $msg\n", FILE_APPEND);
    }
}
