<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateInitialTables extends Migration
{
    public function up()
    {
        // 1. Users Table
        $this->forge->addField([
            'id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'username' => ['type' => 'VARCHAR', 'constraint' => 50],
            'password' => ['type' => 'VARCHAR', 'constraint' => 255],
            'company_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'role' => ['type' => 'ENUM', 'constraint' => ['admin', 'manager', 'operator'], 'default' => 'operator'],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('users');

        // 2. Mobil (Fleet) Table - Matches legacy structure for calibration
        $this->forge->addField([
            'id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'company_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'name' => ['type' => 'VARCHAR', 'constraint' => 100],
            'plate_number' => ['type' => 'VARCHAR', 'constraint' => 20],
            'device_kode' => ['type' => 'VARCHAR', 'constraint' => 50],
            // Calibration Sensors (Methodology Part 3)
            'fuel_volt1' => ['type' => 'INT', 'constraint' => 11, 'default' => 0],
            'fuel_liter1' => ['type' => 'INT', 'constraint' => 11, 'default' => 0],
            'fuel_volt2' => ['type' => 'INT', 'constraint' => 11, 'default' => 1000],
            'fuel_liter2' => ['type' => 'INT', 'constraint' => 11, 'default' => 100],
            // Last known status
            'last_lat' => ['type' => 'DECIMAL', 'constraint' => '10,7', 'default' => 0.0000000],
            'last_lng' => ['type' => 'DECIMAL', 'constraint' => '10,7', 'default' => 0.0000000],
            'last_speed' => ['type' => 'INT', 'constraint' => 11, 'default' => 0],
            'last_dtime' => ['type' => 'DATETIME', 'null' => true],
            // Legacy Mappings for Reports
            'old_fuel' => ['type' => 'DECIMAL', 'constraint' => '10,2', 'default' => 0.00],
            'old_suhu' => ['type' => 'DECIMAL', 'constraint' => '10,2', 'default' => 0.00],
            'old_alarm' => ['type' => 'INT', 'constraint' => 11, 'default' => 0],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('mobil');

        // 3. Receiver Position (Live Sink)
        $this->forge->addField([
            'id' => ['type' => 'BIGINT', 'constraint' => 20, 'unsigned' => true, 'auto_increment' => true],
            'mobil_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'dtime' => ['type' => 'DATETIME'],
            'latitude' => ['type' => 'DECIMAL', 'constraint' => '10,7'],
            'longitude' => ['type' => 'DECIMAL', 'constraint' => '10,7'],
            'speed' => ['type' => 'INT', 'constraint' => 11],
            'heading' => ['type' => 'INT', 'constraint' => 11],
            'fuel_raw' => ['type' => 'INT', 'constraint' => 11],
            'temp_raw' => ['type' => 'INT', 'constraint' => 11],
            'onstate' => ['type' => 'INT', 'constraint' => 11],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addKey('mobil_id');
        $this->forge->createTable('receiverposition');
    }

    public function down()
    {
        $this->forge->dropTable('users');
        $this->forge->dropTable('mobil');
        $this->forge->dropTable('receiverposition');
    }
}
