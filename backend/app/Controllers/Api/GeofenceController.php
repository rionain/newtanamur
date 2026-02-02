<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use CodeIgniter\API\ResponseTrait;
use App\Models\GeofenceModel;
use App\Services\EncryptionService;

class GeofenceController extends BaseController
{
    use ResponseTrait;

    protected $geofenceModel;
    protected $encryption;

    public function __construct()
    {
        $this->geofenceModel = new GeofenceModel();
        $this->encryption = new EncryptionService();
    }

    /**
     * List all geofences for the company
     */
    public function index()
    {
        $reqHex = $this->request->getGet('req');
        $decoded = $this->encryption->hexDecode($reqHex ?? '');
        $payload = json_decode($decoded, true);

        if (!$payload || !isset($payload['cid'])) {
            return $this->fail('Unauthorized. Company ID required.', 401);
        }

        $items = $this->geofenceModel->getByCompany((int) $payload['cid']);

        $res = $this->encryption->hexEncode(json_encode([
            'status' => 'ok',
            'data' => $items
        ]));

        return $this->respond(['res' => $res]);
    }

    /**
     * Save/Update a Geofence
     */
    public function save()
    {
        $json = $this->request->getJSON(true);
        $reqHex = $json['req'] ?? '';
        $decoded = $this->encryption->hexDecode($reqHex);
        $payload = json_decode($decoded, true);

        if (!$payload || !isset($payload['cid']) || !isset($payload['name'])) {
            return $this->fail('Invalid data. Name and coordinates required.', 400);
        }

        $data = [
            'company_id' => $payload['cid'],
            'name' => $payload['name'],
            'type' => $payload['type'] ?? 'polygon',
            'coordinates' => json_encode($payload['coordinates']),
            'color' => $payload['color'] ?? '#3B82F6'
        ];

        if (isset($payload['id']) && $payload['id'] > 0) {
            $this->geofenceModel->update($payload['id'], $data);
            $id = $payload['id'];
        } else {
            $id = $this->geofenceModel->insert($data);
        }

        $res = $this->encryption->hexEncode(json_encode([
            'status' => 'ok',
            'id' => $id,
            'msg' => 'Geofence saved successfully'
        ]));

        return $this->respond(['res' => $res]);
    }

    /**
     * Delete a Geofence
     */
    public function delete()
    {
        $json = $this->request->getJSON(true);
        $reqHex = $json['req'] ?? '';
        $decoded = $this->encryption->hexDecode($reqHex);
        $payload = json_decode($decoded, true);

        if (!$payload || !isset($payload['id'])) {
            return $this->fail('ID required', 400);
        }

        $this->geofenceModel->delete($payload['id']);

        $res = $this->encryption->hexEncode(json_encode([
            'status' => 'ok',
            'msg' => 'Geofence removed'
        ]));

        return $this->respond(['res' => $res]);
    }
}
