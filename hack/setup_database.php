<?php
/**
 * Скрипт для создания базы данных системы /hack
 * Дата: 4 сентября 2025 г.
 */

// Подключение к локальному серверу MySQL (MAMP)
$host = 'localhost';
$username = 'root';
$password = 'root';
$port = 8889; // Порт MAMP по умолчанию
$dbname = 'valorgames_dbvalor';

echo "=== Создание базы данных для системы /hack ===\n\n";

try {
    // Подключаемся к серверу MySQL
    $dsn = "mysql:host=$host;port=$port;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 10,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ];
    
    $pdo = new PDO($dsn, $username, $password, $options);
    echo "✓ Подключение к серверу MySQL успешно\n";
    
    // Читаем SQL файл
    $sqlFile = __DIR__ . '/create_database.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("SQL файл не найден: $sqlFile");
    }
    
    $sql = file_get_contents($sqlFile);
    echo "✓ SQL файл загружен\n";
    
    // Разбиваем на отдельные запросы
    $queries = array_filter(array_map('trim', explode(';', $sql)));
    
    $successCount = 0;
    $errorCount = 0;
    
    foreach ($queries as $query) {
        if (empty($query) || strpos($query, '--') === 0) {
            continue;
        }
        
        try {
            $pdo->exec($query);
            $successCount++;
            
            // Выводим информацию о выполненном запросе
            if (stripos($query, 'CREATE DATABASE') !== false) {
                echo "✓ База данных создана\n";
            } elseif (stripos($query, 'CREATE TABLE') !== false) {
                preg_match('/CREATE TABLE[^`]*`([^`]+)`/', $query, $matches);
                $tableName = $matches[1] ?? 'неизвестная';
                echo "✓ Таблица '$tableName' создана\n";
            } elseif (stripos($query, 'INSERT INTO') !== false) {
                preg_match('/INSERT INTO[^`]*`([^`]+)`/', $query, $matches);
                $tableName = $matches[1] ?? 'неизвестная';
                echo "✓ Данные добавлены в таблицу '$tableName'\n";
            }
            
        } catch (PDOException $e) {
            $errorCount++;
            echo "✗ Ошибка выполнения запроса: " . $e->getMessage() . "\n";
            echo "Запрос: " . substr($query, 0, 100) . "...\n";
        }
    }
    
    echo "\n=== Результат ===\n";
    echo "Успешно выполнено: $successCount запросов\n";
    echo "Ошибок: $errorCount\n";
    
    if ($errorCount === 0) {
        echo "\n✓ База данных успешно создана и настроена!\n";
        
        // Проверяем созданные таблицы
        $pdo->exec("USE `$dbname`");
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        echo "\nСозданные таблицы:\n";
        foreach ($tables as $table) {
            echo "- $table\n";
        }
        
        // Проверяем количество записей в основных таблицах
        $checkTables = ['hack_users', 'country_settings', 'game_coefficients'];
        echo "\nДанные в таблицах:\n";
        foreach ($checkTables as $table) {
            try {
                $stmt = $pdo->query("SELECT COUNT(*) FROM `$table`");
                $count = $stmt->fetchColumn();
                echo "- $table: $count записей\n";
            } catch (PDOException $e) {
                echo "- $table: ошибка проверки\n";
            }
        }
        
    } else {
        echo "\n⚠ База данных создана с ошибками. Проверьте логи выше.\n";
    }
    
} catch (Exception $e) {
    echo "✗ Критическая ошибка: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n=== Завершено ===\n";
?>
