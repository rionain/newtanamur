<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;
use App\Services\GpsIngestionService;

class TestIngestion extends BaseCommand
{
    protected $group = 'Test';
    protected $name = 'test:ingest';
    protected $description = 'Tests the GPS ingestion and rollover logic.';

    public function run(array $params)
    {
        $ingestion = new GpsIngestionService();

        CLI::write("GPS ROLLOVER REPAIR TEST", 'blue');

        $testCases = [
            ['dtime' => (new \DateTime())->modify('+29360 days')->format('Y-m-d H:i:s'), 'lng' => 106.8, 'desc' => 'Future date (+80y)'],
            ['dtime' => (new \DateTime())->modify('+7170 days')->format('Y-m-d H:i:s'), 'lng' => 106.8, 'desc' => 'Future date (+19.6y)'],
            ['dtime' => (new \DateTime())->modify('-7168 days')->format('Y-m-d H:i:s'), 'lng' => 106.8, 'desc' => 'Past date (-19.6y)'],
            ['dtime' => '2026-02-02 12:00:00', 'lng' => 0, 'desc' => 'Zero Longitude'],
        ];

        foreach ($testCases as $tc) {
            $fixed = $ingestion->repairTimestamp($tc['dtime'], $tc['lng']);
            CLI::write("Desc: {$tc['desc']}");
            CLI::write("Raw : {$tc['dtime']}");
            CLI::write("Fixed: $fixed", 'green');
            CLI::write("-------------------");
        }

        CLI::write("Simulating Real Pulse for TRK001...", 'yellow');
        $data = [
            'kode' => 'TRK001',
            'lat' => -6.1,
            'lng' => 106.8,
            'speed' => 95, // High speed for overspeed alert
            'fuel' => 2125, // Mid-point for TRK001 (Should result in ~205L)
            'dtime' => date('Y-m-d H:i:s')
        ];

        if ($ingestion->ingest($data)) {
            CLI::write("Ingestion Success!", 'green');

            // Verify DB update
            $updated = (new \App\Models\VehicleModel())->where('device_kode', 'TRK001')->first();
            CLI::write("Fuel Result for TRK001 (Raw: 2125): {$updated['old_fuel']} Liters", 'cyan');
        } else {
            CLI::error("Ingestion Failed!");
        }
    }
}
