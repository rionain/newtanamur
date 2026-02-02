<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use CodeIgniter\API\ResponseTrait;
use App\Services\EncryptionService;
use App\Services\CacheService;

class TrackingController extends BaseController
{
    use ResponseTrait;

    protected $encryption;
    protected $cache;

    public function __construct()
    {
        $this->encryption = new EncryptionService();
        $this->cache = new CacheService();
    }

    /**
     * High-Speed Live Tracking (Migrated from web_LastPos.php)
     * Implements "Turbo Speed" cache-first strategy.
     */
    public function lastPos()
    {
        $reqHex = $this->request->getGet('req');
        $decoded = $this->encryption->hexDecode($reqHex ?? '');
        $payload = json_decode($decoded, true);

        if (!$payload || !isset($payload['cid'])) {
            return $this->fail('Unauthorized access', 401);
        }

        $companyId = (int) $payload['cid'];
        $lastCheck = (int) ($payload['last'] ?? 0);

        // TURBO SPEED CHECK: Hit filesystem first
        if (!$this->cache->hasUpdates($companyId, $lastCheck)) {
            // Return empty response instantly if no updates
            return $this->respond(['status' => 'no_change', 'time' => time()]);
        }

        // Fetch updates from DB
        $vehicleModel = new \App\Models\VehicleModel();
        $vehicles = $vehicleModel->getByCompany($companyId);

        $res = $this->encryption->hexEncode(json_encode([
            'status' => 'ok',
            'data' => $vehicles,
            'time' => time()
        ]));

        return $this->respond(['res' => $res]);
    }

    /**
     * Swiss-Army Knife API (Migrated from web_ReadTbl.php)
     */
    public function readTable()
    {
        $type = $this->request->getGet('tname'); // position, mobil, fuelhis, etc.

        switch ($type) {
            case 'mobil':
                return $this->getFleet();
            case 'alerts':
                return $this->getAlerts();
            case 'history':
                return $this->getHistory();
            case 'trips':
                return $this->getTrips();
            case 'stops':
                return $this->getStops();
            case 'fuelhis':
                return $this->getFuelHistory();
            default:
                return $this->fail("Unknown table type: $type");
        }
    }

    private function getHistory()
    {
        $reqHex = $this->request->getGet('req');
        $decoded = $this->encryption->hexDecode($reqHex ?? '');
        $payload = json_decode($decoded, true);

        if (!$payload || !isset($payload['cid']) || !isset($payload['date']) || !isset($payload['mid'])) {
            return $this->fail('Invalid request. CID, Date (YYYY-MM-DD), and MID required.', 400);
        }

        $date = str_replace('-', '_', $payload['date']);
        $tableName = "mypos_" . $date;

        $db = \Config\Database::connect();

        // Check if table exists
        if (!$db->tableExists($tableName)) {
            return $this->respond(['status' => 'ok', 'data' => [], 'msg' => 'No historical data for this date']);
        }

        $history = $db->table($tableName)
            ->where('mobil_id', $payload['mid'])
            ->orderBy('dtime', 'ASC')
            ->get()
            ->getResultArray();

        $res = $this->encryption->hexEncode(json_encode([
            'status' => 'ok',
            'data' => $history
        ]));

        return $this->respond(['res' => $res]);
    }

    private function getAlerts()
    {
        $reqHex = $this->request->getGet('req');
        $decoded = $this->encryption->hexDecode($reqHex ?? '');
        $payload = json_decode($decoded, true);

        if (!$payload || !isset($payload['cid'])) {
            return $this->fail('Unauthorized access', 401);
        }

        $db = \Config\Database::connect();
        $alerts = $db->table('alert_logs')
            ->select('alert_logs.*, mobil.name as vehicle_name, mobil.plate_number')
            ->join('mobil', 'mobil.id = alert_logs.mobil_id')
            ->where('mobil.company_id', $payload['cid'])
            ->orderBy('alert_logs.created_at', 'DESC')
            ->limit(100)
            ->get()
            ->getResultArray();

        $res = $this->encryption->hexEncode(json_encode([
            'status' => 'ok',
            'data' => $alerts
        ]));

        return $this->respond(['res' => $res]);
    }

    private function getFleet()
    {
        $reqHex = $this->request->getGet('req');
        $decoded = $this->encryption->hexDecode($reqHex ?? '');
        $payload = json_decode($decoded, true);

        if (!$payload || !isset($payload['cid'])) {
            return $this->fail('Unauthorized access', 401);
        }

        $vehicleModel = new \App\Models\VehicleModel();
        $vehicles = $vehicleModel->getByCompany((int) $payload['cid']);

        $res = $this->encryption->hexEncode(json_encode([
            'status' => 'ok',
            'data' => $vehicles
        ]));

        return $this->respond(['res' => $res]);
    }

    private function getTrips()
    {
        return $this->getSummaries('trip_summary');
    }

    private function getStops()
    {
        return $this->getSummaries('stop_summary');
    }

    private function getSummaries(string $table)
    {
        $reqHex = $this->request->getGet('req');
        $decoded = $this->encryption->hexDecode($reqHex ?? '');
        $payload = json_decode($decoded, true);

        if (!$payload || !isset($payload['cid']) || !isset($payload['mid']) || !isset($payload['date'])) {
            return $this->fail('Invalid request. MID and Date required.', 400);
        }

        $db = \Config\Database::connect();
        $items = $db->table($table)
            ->where('mobil_id', $payload['mid'])
            ->where('DATE(start_time)', $payload['date'])
            ->orderBy('start_time', 'ASC')
            ->get()
            ->getResultArray();

        $res = $this->encryption->hexEncode(json_encode([
            'status' => 'ok',
            'data' => $items
        ]));

        return $this->respond(['res' => $res]);
    }

    private function getFuelHistory()
    {
        $reqHex = $this->request->getGet('req');
        $decoded = $this->encryption->hexDecode($reqHex ?? '');
        $payload = json_decode($decoded, true);

        if (!$payload || !isset($payload['cid'])) {
            return $this->fail('Unauthorized access', 401);
        }

        $db = \Config\Database::connect();
        $logs = $db->table('alert_logs')
            ->select('alert_logs.*, mobil.name as vehicle_name, mobil.plate_number')
            ->join('mobil', 'mobil.id = alert_logs.mobil_id')
            ->where('mobil.company_id', $payload['cid'])
            ->where('alert_type', 'low_fuel')
            ->orderBy('alert_logs.created_at', 'DESC')
            ->limit(50)
            ->get()
            ->getResultArray();

        $res = $this->encryption->hexEncode(json_encode([
            'status' => 'ok',
            'data' => $logs
        ]));

        return $this->respond(['res' => $res]);
    }
}
