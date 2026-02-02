<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use CodeIgniter\API\ResponseTrait;
use App\Services\EncryptionService;
use App\Services\GpsIngestionService;

class GpsPulseController extends BaseController
{
    use ResponseTrait;

    protected $encryption;
    protected $ingestion;

    public function __construct()
    {
        $this->encryption = new EncryptionService();
        $this->ingestion = new GpsIngestionService();
    }

    /**
     * Inbound Pulse Handler
     * Receives hex-encoded or binary pulses from GPS hardware gateways.
     */
    public function receive()
    {
        $reqHex = $this->request->getPost('req') ?? $this->request->getGet('req');

        if (!$reqHex) {
            return $this->fail('Empty pulse', 400);
        }

        // Tanamur uses Hex-Encoded JSON for modern gateways
        $decoded = $this->encryption->hexDecode($reqHex);
        $payload = json_decode($decoded, true);

        if (!$payload) {
            // Check if it's the "Hemat Bandwidth" Binary Protocol
            $decoded = $this->encryption->binDecode($reqHex);
            $payload = json_decode($decoded ?? '', true);
        }

        if (!$payload || !isset($payload['kode'])) {
            return $this->fail('Invalid pulse format', 400);
        }

        // Process Ingestion
        if ($this->ingestion->ingest($payload)) {
            return $this->respond(['status' => 'ok', 'msg' => 'Pulse processed']);
        }

        return $this->fail('Processing failed', 500);
    }
}
