<?php
session_start();
include 'overlaying.php';

$dbname = 'dbvalor';
$username = 'root2';
$password = 'xE2tZ9qH5f';
$host = '192.241.120.62';

// Очистка буфера вывода
if (ob_get_length()) ob_clean();

header('Content-Type: application/json');

// Проверка аутентификации
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Authentication required'
    ]);
    exit();
}

try {
    $db = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    try {
        if ($_POST['action'] == 'get_user_mines') {
            // Используем user_id из сессии для безопасности
            $userId = $_SESSION['user_id'];
            
            $query = $db->prepare("SELECT positions_mine FROM users WHERE user_id = :user_id");
            $query->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $query->execute();
            
            $user = $query->fetch(PDO::FETCH_ASSOC);
            
            if ($user && !empty($user['positions_mine'])) {
                $positions = array_filter(explode(',', $user['positions_mine']), function($v) {
                    return is_numeric($v) && $v >= 1 && $v <= 25;
                });
                $positions = array_map('intval', $positions);
                
                echo json_encode([
                    'success' => true,
                    'user_id' => $userId,
                    'positions_mine' => $positions
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Mine positions not set for this user'
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Invalid action'
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}

exit();
?>