<?php
session_start();

header("Content-Type: application/json");

try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $user_id = isset($_POST['user_id']) ? trim($_POST['user_id']) : '';

        if (empty($user_id)) {
            echo json_encode(["success" => false, "message" => "Fill in the account ID"]);
            exit();
        }

        // Проверяем пользователя через API
        $api_url = "https://api.valor-games.co/api/user/lookup/{$user_id}/";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $api_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json'
        ]);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curl_error = curl_error($ch);
        curl_close($ch);

        if ($curl_error) {
            echo json_encode(["success" => false, "message" => "API connection error: " . $curl_error]);
            exit();
        }

        if ($http_code !== 200) {
            echo json_encode(["success" => false, "message" => "API error: HTTP {$http_code}"]);
            exit();
        }

        $data = json_decode($response, true);
        
        if (!$data || !$data['success']) {
            echo json_encode(["success" => false, "message" => $data['message'] ?? "User not found"]);
            exit();
        }

        // Сохраняем данные пользователя в сессии
        $_SESSION['user_id'] = $data['user']['user_id'];
        $_SESSION['user_data'] = $data['user'];
        
        echo json_encode([
            "success" => true, 
            "user" => $data['user']
        ]);
    }
} catch (Exception $e) {
    error_log("Ошибка: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Server error"]);
}
