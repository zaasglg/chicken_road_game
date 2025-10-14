<?php
$host = '192.241.120.62';
$dbname = 'dbvalor';
$username = 'root2';
$password = 'xE2tZ9qH5f'; 

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(["success" => false, "message" => "Ошибка подключения к базе данных"]));
}
// Добавьте этот код в db.php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'check_deposit') {
    header('Content-Type: application/json');
    
    try {
        $stmt = $conn->prepare("SELECT deposit FROM users WHERE user_id = :user_id");
        $stmt->bindParam(':user_id', $_POST['user_id'], PDO::PARAM_INT);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'deposit' => $result['deposit'] ?? 0
        ]);
        exit();
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
        exit();
    }
}
?>
