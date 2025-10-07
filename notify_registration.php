<?php
/**
 * Registration Notification Endpoint
 * Этот файл можно вызывать с основного сайта для отправки уведомлений о регистрации
 */

// Разрешаем CORS для вызовов с других доменов
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Обрабатываем preflight запросы
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

define('BASE_DIR', __DIR__ . '/');
require_once BASE_DIR . 'telegram_notify.php';

$response = ['success' => false, 'message' => 'Invalid request'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Получаем данные из POST запроса
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        $input = $_POST;
    }
    
    // Проверяем обязательные поля
    if (!isset($input['user_id'])) {
        $response = ['success' => false, 'message' => 'user_id is required'];
    } else {
        // Подготавливаем данные для уведомления
        $notification_data = [
            'user_id' => $input['user_id'],
            'username' => isset($input['username']) ? $input['username'] : 'Unknown',
            'email' => isset($input['email']) ? $input['email'] : 'Not provided',
            'country' => isset($input['country']) ? $input['country'] : 'Unknown',
            'balance' => isset($input['balance']) ? floatval($input['balance']) : 0,
            'ip' => isset($input['ip']) ? $input['ip'] : $_SERVER['REMOTE_ADDR'],
            'user_agent' => isset($input['user_agent']) ? $input['user_agent'] : $_SERVER['HTTP_USER_AGENT']
        ];
        
        // Отправляем уведомление
        $result = sendTelegramNotification('registration', $notification_data);
        
        if ($result) {
            $response = ['success' => true, 'message' => 'Registration notification sent successfully'];
        } else {
            $response = ['success' => false, 'message' => 'Failed to send notification'];
        }
    }
} else {
    $response = ['success' => false, 'message' => 'Only POST method allowed'];
}

echo json_encode($response);
exit();
?>