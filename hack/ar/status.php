<?php
require 'db.php'; // Подключение к базе данных

try {
    // Получаем всех пользователей
    $usersQuery = $conn->query("SELECT id, deposit, col_deposit FROM users");
    $users = $usersQuery->fetchAll(PDO::FETCH_ASSOC);

    foreach ($users as $user) {
        $status = 'Not activated';
        
        if ($user['deposit'] > 0) {
            if ($user['col_deposit'] == 0) {
                $status = 'Not activated';
            } elseif ($user['col_deposit'] == 1) {
                $status = 'Start player';
            } elseif ($user['col_deposit'] >= 2) {
                $status = 'Active player';
            }
        }
        
        // Обновляем статус пользователя
        $updateQuery = $conn->prepare("UPDATE users SET user_status = :status WHERE id = :id");
        $updateQuery->execute(['status' => $status, 'id' => $user['id']]);
    }
    
} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}
?>
