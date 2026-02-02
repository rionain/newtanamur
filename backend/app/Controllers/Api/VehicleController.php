<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use CodeIgniter\API\ResponseTrait;
use App\Services\EncryptionService;
use App\Models\VehicleModel;

class VehicleController extends BaseController
{
    use ResponseTrait;

    protected $encryption;

    public function __construct()
    {
        $this->encryption = new EncryptionService();
    }

    /**
     * Add New Vehicle (Migrated from web_create_new_mobil.php logic)
     */
    public function create()
    {
        $reqHex = $this->request->getPost('req'); // Note: Form usually sends POST
        if (!$reqHex) {
            $reqHex = $this->request->getGet('req'); // Fallback to GET as per legacy
        }

        $decoded = $this->encryption->hexDecode($reqHex ?? '');
        $payload = json_decode($decoded, true);

        if (!$payload || !isset($payload['cid']) || !isset($payload['name'])) {
            return $this->fail('Invalid vehicle data', 400);
        }

        $vehicleModel = new VehicleModel();

        $data = [
            'company_id' => $payload['cid'],
            'name' => $payload['name'],
            'plate_number' => $payload['plate'] ?? '',
            'device_kode' => $payload['kode'] ?? '',
            // Calibration values from the form I built
            'fuel_volt1' => $payload['f_v1'] ?? 0,
            'fuel_liter1' => $payload['f_l1'] ?? 0,
            'fuel_volt2' => $payload['f_v2'] ?? 1000,
            'fuel_liter2' => $payload['f_l2'] ?? 100,
            'last_dtime' => date('Y-m-d H:i:s'),
        ];

        if ($vehicleModel->insert($data)) {
            $res = $this->encryption->hexEncode(json_encode([
                'status' => 'ok',
                'id' => $vehicleModel->getInsertID()
            ]));
            return $this->respond(['res' => $res]);
        }

        return $this->fail('Failed to save vehicle');
    }
}
