<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddGeofencesAndSummaries extends Migration
{
    public function up()
    {
        // 1. Geofences
        $this->forge->addField([
            'id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true, 'auto_increment' => true],
            'company_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'name' => ['type' => 'VARCHAR', 'constraint' => 100],
            'type' => ['type' => 'ENUM', 'constraint' => ['polygon', 'circle'], 'default' => 'polygon'],
            'coordinates' => ['type' => 'TEXT'], // Dynamic JSON storage
            'color' => ['type' => 'VARCHAR', 'constraint' => 20, 'default' => '#3B82F6'],
            'is_active' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 1],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addKey('company_id');
        $this->forge->createTable('geofences');

        // 2. Trip Summaries (Aggregated Driving)
        $this->forge->addField([
            'id' => ['type' => 'BIGINT', 'constraint' => 20, 'unsigned' => true, 'auto_increment' => true],
            'mobil_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'start_time' => ['type' => 'DATETIME'],
            'end_time' => ['type' => 'DATETIME'],
            'duration_sec' => ['type' => 'INT', 'constraint' => 11],
            'distance_km' => ['type' => 'DECIMAL', 'constraint' => '10,2'],
            'start_lat' => ['type' => 'DECIMAL', 'constraint' => '10,7'],
            'start_lng' => ['type' => 'DECIMAL', 'constraint' => '10,7'],
            'end_lat' => ['type' => 'DECIMAL', 'constraint' => '10,7'],
            'end_lng' => ['type' => 'DECIMAL', 'constraint' => '10,7'],
            'max_speed' => ['type' => 'INT', 'constraint' => 11],
            'avg_speed' => ['type' => 'DECIMAL', 'constraint' => '10,2'],
            'fuel_used' => ['type' => 'DECIMAL', 'constraint' => '10,2'],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addKey('mobil_id');
        $this->forge->createTable('trip_summary');

        // 3. Stop Summaries (Aggregated Parking)
        $this->forge->addField([
            'id' => ['type' => 'BIGINT', 'constraint' => 20, 'unsigned' => true, 'auto_increment' => true],
            'mobil_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'start_time' => ['type' => 'DATETIME'],
            'end_time' => ['type' => 'DATETIME'],
            'duration_sec' => ['type' => 'INT', 'constraint' => 11],
            'latitude' => ['type' => 'DECIMAL', 'constraint' => '10,7'],
            'longitude' => ['type' => 'DECIMAL', 'constraint' => '10,7'],
            'fuel_consumed' => ['type' => 'DECIMAL', 'constraint' => '10,2', 'default' => 0.00],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addKey('mobil_id');
        $this->forge->createTable('stop_summary');
    }

    public function down()
    {
        $this->forge->dropTable('geofences');
        $this->forge->dropTable('trip_summary');
        $this->forge->dropTable('stop_summary');
    }
}
