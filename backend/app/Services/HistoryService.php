<?php

namespace App\Services;

use Config\Database;

class HistoryService
{
    protected $db;

    public function __construct()
    {
        $this->db = Database::connect();
    }

    /**
     * Get or Create daily history table
     * Format: mypos_YYYY_MM_DD
     */
    public function ensureTable(string $date): string
    {
        $tableName = 'mypos_' . str_replace('-', '_', $date);

        if (!$this->db->tableExists($tableName)) {
            $forge = \Config\Database::forge();

            $fields = [
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
                'old_fuel' => ['type' => 'DECIMAL', 'constraint' => '10,2', 'default' => 0.00],
            ];

            $forge->addField($fields);
            $forge->addKey('id', true);
            $forge->addKey('mobil_id');
            $forge->addKey('dtime');
            $forge->createTable($tableName);

            // Log creation
            file_put_contents(WRITEPATH . 'logs/history_rotation.log', date('Y-m-d H:i:s') . " | Created Table: $tableName\n", FILE_APPEND);
        }

        return $tableName;
    }

    /**
     * Move data from receiverposition to daily tables
     */
    public function archiveReceiverPosition(): int
    {
        $builder = $this->db->table('receiverposition');
        $records = $builder->orderBy('dtime', 'ASC')->get()->getResultArray();

        if (empty($records))
            return 0;

        $processedIds = [];
        $count = 0;

        foreach ($records as $row) {
            $date = date('Y-m-d', strtotime($row['dtime']));
            $targetTable = $this->ensureTable($date);

            // In a real high-speed environment, we would batch this.
            // But to stay safe with dynamic tables, we sort by date and batch per table.

            $data = $row;
            unset($data['id']); // Let target table handle its own ID

            // Add old_fuel if missing (from live cache mapping)
            if (!isset($data['old_fuel'])) {
                $vehicle = $this->db->table('mobil')->where('id', $row['mobil_id'])->get()->getRowArray();
                $data['old_fuel'] = $vehicle['old_fuel'] ?? 0;
            }

            if ($this->db->table($targetTable)->insert($data)) {
                $processedIds[] = $row['id'];
                $count++;
            }
        }

        // Cleanup
        if (!empty($processedIds)) {
            $this->db->table('receiverposition')->whereIn('id', $processedIds)->delete();
        }

        return $count;
    }
}
