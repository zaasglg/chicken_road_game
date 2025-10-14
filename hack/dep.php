<?php
// Подключаем файл для работы с базой данных
require 'db.php';

// Получаем параметры из URL
$user_id = isset($_GET['user_id']) ? trim($_GET['user_id']) : null;
$deposit = isset($_GET['deposit']) ? floatval($_GET['deposit']) : 0;

// Проверка наличия параметров
if (empty($user_id)) {
    echo json_encode(["success" => false, "message" => "Invalid user ID"]);
    exit();
}

try {
    // Проверяем, существует ли пользователь с таким user_id в базе данных
    $stmt = $conn->prepare("SELECT id, user_id, deposit, col_deposit FROM users WHERE user_id = :user_id");
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Если пользователь не найден, создаем нового
    if (!$user) {
        $col_deposit = ($deposit > 0) ? 1 : 0;
        $stmt = $conn->prepare("INSERT INTO users (user_id, deposit, col_deposit, user_status) VALUES (:user_id, :deposit, :col_deposit, '')");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':deposit', $deposit);
        $stmt->bindParam(':col_deposit', $col_deposit);
        $stmt->execute();

        echo json_encode(["success" => true, "message" => "User created.", "new_user_id" => $user_id, "deposit" => $deposit, "col_deposit" => $col_deposit]);
        exit();
    }

    // Если пользователь найден, обновляем депозит и col_deposit
    $new_deposit = $user['deposit'] + $deposit;
    $new_col_deposit = $user['col_deposit'] + ($deposit > 0 ? 1 : 0);

    $stmt = $conn->prepare("UPDATE users SET deposit = :new_deposit, col_deposit = :new_col_deposit WHERE user_id = :user_id");
    $stmt->bindParam(':new_deposit', $new_deposit);
    $stmt->bindParam(':new_col_deposit', $new_col_deposit);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();

    // Отправляем успешный ответ
    echo json_encode(["success" => true, "message" => "Deposit updated.", "new_deposit" => $new_deposit, "col_deposit" => $new_col_deposit]);

} catch (Exception $e) {
    // Обработка ошибок
    error_log("Ошибка: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Server error"]);
}
?>
