<?php
/**
 * Проверка состояния базы данных
 */

$host = 'localhost';
$dbname = 'valorgames_dbvalor';
$username = 'root';
$password = 'root';
$port = 8889; // Порт MAMP по умолчанию

echo "=== Проверка базы данных ===\n\n";

try {
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5,
    ];
    
    $pdo = new PDO($dsn, $username, $password, $options);
    echo "✓ Подключение к базе данных успешно\n\n";
    
    // Показываем все таблицы
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Существующие таблицы:\n";
    foreach ($tables as $table) {
        echo "- $table\n";
    }
    
    if (empty($tables)) {
        echo "❌ Таблицы не найдены\n";
        echo "Нужно запустить setup_database.php для создания таблиц\n";
    } else {
        echo "\n=== Информация о таблицах ===\n";
        foreach ($tables as $table) {
            try {
                $stmt = $pdo->query("SELECT COUNT(*) FROM `$table`");
                $count = $stmt->fetchColumn();
                echo "$table: $count записей\n";
            } catch (PDOException $e) {
                echo "$table: ошибка чтения\n";
            }
        }
    }
    
} catch (PDOException $e) {
    echo "❌ Ошибка подключения: " . $e->getMessage() . "\n";
    echo "Проверьте настройки базы данных\n";
}

echo "\n=== Завершено ===\n";
?>
