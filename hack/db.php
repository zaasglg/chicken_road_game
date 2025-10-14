<?php
$host = 'localhost';
$dbname = 'volurgame';
$username = 'root';
$password = 'p@ssword';
$port = 3306;
$socket = '/var/run/mysqld/mysqld.sock'; // Уточните путь на сервере

try {
    // Пробуем подключиться через TCP/IP
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 3,
    ];
    
    $conn = new PDO($dsn, $username, $password, $options);
    // Подключение успешно, но ничего не выводим
    
} catch (PDOException $e) {
    // Пробуем через socket, если TCP не работает
    try {
        $dsn = "mysql:unix_socket=$socket;dbname=$dbname;charset=utf8mb4";
        $conn = new PDO($dsn, $username, $password, $options);
        // Подключение через socket успешно, но ничего не выводим
        
    } catch (PDOException $e) {
        // Выводим ошибку только если оба способа не сработали
        die(json_encode([
            "success" => false,
            "error" => $e->getMessage(),
            "solution" => "Проверьте настройки MySQL и доступность сервера"
        ], JSON_UNESCAPED_UNICODE));
    }
}
?>