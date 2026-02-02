<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use CodeIgniter\API\ResponseTrait;
use App\Services\EncryptionService;

class AuthController extends BaseController
{
    use ResponseTrait;

    protected $encryption;

    public function __construct()
    {
        $this->encryption = new EncryptionService();
    }

    /**
     * Stateless Login (Migrated from web_logon.php)
     * Receives hex-encoded JSON payload.
     */
    public function login()
    {
        $reqHex = $this->request->getGet('req');
        if (!$reqHex) {
            return $this->fail('Missing request payload', 400);
        }

        $decoded = $this->encryption->hexDecode($reqHex);
        $payload = json_decode($decoded, true);

        if (!$payload || !isset($payload['u']) || !isset($payload['p'])) {
            return $this->fail('Invalid payload structure', 400);
        }

        // Auth Logic using UserModel
        $userModel = new \App\Models\UserModel();
        $user = $userModel->findByUsername($payload['u']);

        if ($user && password_verify($payload['p'], $user['password'])) {
            $userData = [
                'uid' => bin2hex(random_bytes(16)),
                'u' => $user['username'],
                'cid' => $user['company_id'],
                'role' => $user['role']
            ];

            // In Tanamur Architecture, we return a hex-encoded response
            $response = $this->encryption->hexEncode(json_encode([
                'status' => 'ok',
                'data' => $userData
            ]));

            return $this->respond(['res' => $response]);
        }

        return $this->failUnauthorized('Invalid credentials');
    }

    /**
     * DEBUG ONLY: Generate Hex for Postman
     * Usage: /api/debug/encode?plain={"u":"admin","p":"admin123"}
     */
    public function debugEncode()
    {
        $plain = $this->request->getGet('plain');
        if (!$plain)
            return $this->fail('Provide a ?plain= string');

        return $this->respond([
            'plain' => $plain,
            'hex' => $this->encryption->hexEncode($plain)
        ]);
    }
}
