<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;
use App\Services\HistoryService;

class ArchiveHistory extends BaseCommand
{
    protected $group = 'History';
    protected $name = 'history:archive';
    protected $description = 'Moves data from live sink (receiverposition) to daily detail tables.';

    public function run(array $params)
    {
        $service = new HistoryService();

        CLI::write("Starting History Archiving...", 'yellow');

        $count = $service->archiveReceiverPosition();

        if ($count > 0) {
            CLI::write("Successfully archived $count records.", 'green');
        } else {
            CLI::write("No records found in live sink to archive.", 'gray');
        }
    }
}
