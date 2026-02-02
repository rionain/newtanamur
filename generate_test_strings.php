<?php
// Script to generate test hex strings for the user
require_once 'backend/app/Services/EncryptionService.php';
$enc = new \App\Services\EncryptionService();

$payloads = [
    'login' => json_encode(['u' => 'admin', 'p' => 'admin123']),
    'tracking' => json_encode(['cid' => 1, 'last' => 0]),
    'pulse' => json_encode([
        'kode' => 'HINO01',
        'lat' => -6.1,
        'lng' => 106.8,
        'speed' => 50,
        'dtime' => '2026-02-02 10:00:00'
    ])
];

echo "TANAMUR API TEST STRINGS\n";
echo "========================\n\n";

foreach ($payloads as $name => $json) {
    echo "Payload ($name): $json\n";
    echo "Hex Encoded: " . $enc->hexEncode($json) . "\n\n";
}
