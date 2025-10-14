<?php
session_start();
require 'db.php';

header("Content-Type: application/json");

try {
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $user_id = isset($_POST['user_id']) ? trim($_POST['user_id']) : '';

        if (empty($user_id)) {
            echo json_encode(["success" => false, "message" => "Fill in the account ID"]);
            exit();
        }

        // Проверяем, существует ли пользователь
        $stmt = $conn->prepare("SELECT user_id FROM users WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            echo json_encode(["success" => false, "message" => "User not found"]);
            exit();
        }

        // Сохраняем user_id в сессии
        $_SESSION['user_id'] = $user['user_id'];
        echo json_encode(["success" => true]);
    }
} catch (Exception $e) {
    error_log("Ошибка: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Server error"]);
}
