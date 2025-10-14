<?php
session_start();
include 'overlaying.php';

// Новые данные подключения
$host = '111.90.151.49';
$dbname = 'valorgames_dbvalor';
$username = 'valorgames_dbvalor';
$password = 'fO2~lJf=4]-H';
$port = 3306;
$socket = '/var/run/mysqld/mysqld.sock';

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
    // Пробуем подключиться через TCP/IP
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 3,
    ];
    
    $db = new PDO($dsn, $username, $password, $options);
    
} catch (PDOException $e) {
    // Пробуем через socket, если TCP не работает
    try {
        $dsn = "mysql:unix_socket=$socket;dbname=$dbname;charset=utf8mb4";
        $db = new PDO($dsn, $username, $password, $options);
        
    } catch (PDOException $e) {
        die(json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $e->getMessage(),
            'solution' => 'Проверьте настройки MySQL и доступность сервера'
        ], JSON_UNESCAPED_UNICODE));
    }
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