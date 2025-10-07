<?php
// Установка коэффициента через WebSocket
// Пример: php set_coefficient.php 2.5

if (php_sapi_name() !== 'cli') {
    exit("Этот скрипт запускается только из консоли.\n");
}

if ($argc < 2) {
    exit("Использование: php set_coefficient.php <новый_коэффициент>\n");
}

$newCoefficient = floatval($argv[1]);

require __DIR__ . '/../vendor/autoload.php';

use WebSocket\Client;

try {
    $ws = new Client("ws://localhost:8080");
    $payload = json_encode([
        'type' => 'lock_coefficient',
        'coefficient' => $newCoefficient
    ]);
    $ws->send($payload);
    echo "Коэффициент успешно отправлен через WebSocket: $newCoefficient\n";
    $ws->close();
} catch (Exception $e) {
    echo "Ошибка при подключении к WebSocket: " . $e->getMessage() . "\n";
    exit(1);
}
