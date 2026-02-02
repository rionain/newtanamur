<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use CodeIgniter\API\ResponseTrait;
use App\Services\EncryptionService;

class DashboardController extends BaseController
{
    use ResponseTrait;

    protected $encryption;
    protected $db;

    public function __construct()
    {
        $this->encryption = new EncryptionService();
        $this->db = \Config\Database::connect();
    }

    /**
     * Get Real-Time Dashboard Metrics
     */
    public function getMetrics()
    {
        $reqHex = $this->request->getGet('req');
        $decoded = $this->encryption->hexDecode($reqHex ?? '');
        $payload = json_decode($decoded, true);

        if (!$payload || !isset($payload['cid'])) {
            return $this->fail('Unauthorized access', 401);
        }

        $companyId = (int) $payload['cid'];

        // 1. Fleet Stats
        $totalVehicles = $this->db->table('mobil')->where('company_id', $companyId)->countAllResults();
        $movingCount = $this->db->table('mobil')
            ->where('company_id', $companyId)
            ->where('last_speed >', 0)
            ->countAllResults();

        $offlineThreshold = date('Y-m-d H:i:s', time() - 3600); // 1 hour
        $offlineCount = $this->db->table('mobil')
            ->where('company_id', $companyId)
            ->where('last_dtime <', $offlineThreshold)
            ->countAllResults();

        // 2. Alert Stats (Last 24h)
        $alertCount = $this->db->table('alert_logs')
            ->join('mobil', 'mobil.id = alert_logs.mobil_id')
            ->where('mobil.company_id', $companyId)
            ->where('alert_logs.created_at >', date('Y-m-d H:i:s', time() - 86400))
            ->countAllResults();

        $metrics = [
            'total' => $totalVehicles,
            'moving' => $movingCount,
            'offline' => $offlineCount,
            'alerts' => $alertCount,
            'active' => $totalVehicles - $offlineCount
        ];

        $res = $this->encryption->hexEncode(json_encode([
            'status' => 'ok',
            'data' => $metrics
        ]));

        return $this->respond(['res' => $res]);
    }
}
