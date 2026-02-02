<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateAlertLogsTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'BIGINT', 'constraint' => 20, 'unsigned' => true, 'auto_increment' => true],
            'mobil_id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => true],
            'alert_type' => ['type' => 'VARCHAR', 'constraint' => 50],
            'message' => ['type' => 'TEXT'],
            'is_read' => ['type' => 'TINYINT', 'constraint' => 1, 'default' => 0],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addKey('mobil_id');
        $this->forge->createTable('alert_logs');
    }

    public function down()
    {
        $this->forge->dropTable('alert_logs');
    }
}
