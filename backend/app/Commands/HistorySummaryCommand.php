<?php

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;
use App\Services\SummaryService;
use App\Models\VehicleModel;

class HistorySummaryCommand extends BaseCommand
{
    protected $group = 'GPS';
    protected $name = 'history:summarize';
    protected $description = 'Process archived daily tables into Trip/Stop summaries.';

    public function run(array $params)
    {
        $date = CLI::getOption('date') ?? date('Y-m-d', strtotime('-1 day'));
        CLI::write("Summarizing GPS history for date: $date", 'yellow');

        $vehicleModel = new VehicleModel();
        $vehicles = $vehicleModel->findAll();

        $summaryService = new SummaryService();

        foreach ($vehicles as $v) {
            CLI::write("Processing Vehicle: {$v['name']} ({$v['plate_number']})...", 'cyan');
            $res = $summaryService->process((int) $v['id'], $date);

            if ($res['status'] === 'ok') {
                CLI::write("  - Trips: {$res['trips_found']}, Stops: {$res['stops_found']}", 'green');
            } else {
                CLI::write("  - Error: {$res['msg']}", 'red');
            }
        }

        CLI::write("History Summarization Complete!", 'green');
    }
}
