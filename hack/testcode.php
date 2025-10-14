<?php
// Включаем отображение ошибок для отладки
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Логирование ошибок в файл
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Устанавливаем заголовок для JSON
header('Content-Type: application/json');

try {
    // Подключаем файл с настройками базы данных
    require_once 'db.php';

    // Проверяем, доступен ли объект $conn
    if (!isset($conn) || !($conn instanceof PDO)) {
        throw new Exception('Database connection ($conn) is not properly initialized in bd.php');
    }

    // Массив для результатов
    $result = [
        'searched_user' => null,
        'last_user' => null
    ];

    // Запрос последнего пользователя
    $stmt_last = $conn->prepare("SELECT * FROM users ORDER BY user_id DESC LIMIT 1");
    if (!$stmt_last) {
        throw new Exception('Failed to prepare query for last user');
    }
    $stmt_last->execute();
    $last_user = $stmt_last->fetch(PDO::FETCH_ASSOC);
    
    if ($last_user) {
        $result['last_user'] = $last_user;
    } else {
        $result['last_user'] = ['error' => 'No users found'];
    }

    // Проверяем, передана ли UTM-метка с user_id
    if (isset($_GET['utm_user_id'])) {
        $user_id = filter_var($_GET['utm_user_id'], FILTER_VALIDATE_INT);
        if ($user_id === false || $user_id <= 0) {
            throw new Exception('Invalid utm_user_id provided');
        }
        $stmt = $conn->prepare("SELECT * FROM users WHERE user_id = :user_id");
        if (!$stmt) {
            throw new Exception('Failed to prepare query for searched user');
        }
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->execute();
        $searched_user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($searched_user) {
            $result['searched_user'] = $searched_user;
        } else {
            $result['searched_user'] = ['error' => 'User not found'];
        }
    } else {
        $result['searched_user'] = ['error' => 'utm_user_id is required for searched user'];
    }

    // Выводим результат в JSON
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    // Выводим ошибку в JSON и записываем в лог
    $error_message = 'Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine();
    error_log($error_message);
    echo json_encode(['error' => $error_message], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
?>