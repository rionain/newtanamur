<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class InitialSeeder extends Seeder
{
    public function run()
    {
        // 1. Create Default Admin
        $userData = [
            'username' => 'admin',
            'password' => password_hash('admin123', PASSWORD_BCRYPT),
            'company_id' => 1,
            'role' => 'admin',
        ];
        $this->db->table('users')->insert($userData);

        // 2. Create Sample Vehicles
        $vehicles = [
            [
                'company_id' => 1,
                'name' => 'HINO RANGER 500',
                'plate_number' => 'B 9912 TYA',
                'device_kode' => 'TRK001',
                'fuel_volt1' => 450,
                'fuel_liter1' => 10,
                'fuel_volt2' => 3800,
                'fuel_liter2' => 400,
                'last_lat' => -6.2,
                'last_lng' => 106.8,
                'last_speed' => 45,
                'last_dtime' => date('Y-m-d H:i:s'),
            ],
            [
                'company_id' => 1,
                'name' => 'TOYOTA AVANZA',
                'plate_number' => 'B 4122 PSF',
                'device_kode' => 'TRK002',
                'fuel_volt1' => 200,
                'fuel_liter1' => 5,
                'fuel_volt2' => 1200,
                'fuel_liter2' => 45,
                'last_lat' => -6.3,
                'last_lng' => 106.9,
                'last_speed' => 0,
                'last_dtime' => date('Y-m-d H:i:s'),
            ]
        ];
        $this->db->table('mobil')->insertBatch($vehicles);
    }
}
