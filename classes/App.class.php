<?php

class App {
    
    /**
     * Генерирует уникальный ID
     * @param string $prefix Префикс для ID
     * @return string
     */
    public static function uid($prefix = '') {
        if (empty($prefix)) {
            return uniqid();
        }
        return $prefix . '_' . uniqid();
    }
    
    /**
     * Очищает строку от нежелательных символов
     * @param string $str Входная строка
     * @return string
     */
    public static function clean($str) {
        return htmlspecialchars(strip_tags(trim($str)), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Проверяет, является ли строка валидным email
     * @param string $email Email адрес
     * @return bool
     */
    public static function isValidEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * Генерирует случайную строку
     * @param int $length Длина строки
     * @return string
     */
    public static function randomString($length = 10) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }
    
    /**
     * Хеширует пароль
     * @param string $password Пароль
     * @return string
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }
    
    /**
     * Проверяет пароль
     * @param string $password Пароль
     * @param string $hash Хеш
     * @return bool
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
    
    /**
     * Форматирует число как валюту
     * @param float $amount Сумма
     * @param string $currency Валюта
     * @return string
     */
    public static function formatCurrency($amount, $currency = 'USD') {
        return number_format($amount, 2, '.', ',') . ' ' . $currency;
    }
    
    /**
     * Получает IP адрес клиента
     * @return string
     */
    public static function getClientIP() {
        $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
        foreach ($ipKeys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
    
    /**
     * Логирует сообщение
     * @param string $message Сообщение
     * @param string $level Уровень логирования
     */
    public static function log($message, $level = 'INFO') {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[{$timestamp}] [{$level}] {$message}" . PHP_EOL;
        error_log($logMessage, 3, BASE_DIR . 'logs/app.log');
    }
    
    /**
     * Редирект на другую страницу
     * @param string $url URL для редиректа
     * @param int $code HTTP код
     */
    public static function redirect($url, $code = 302) {
        header("Location: {$url}", true, $code);
        exit;
    }
    
    /**
     * Возвращает JSON ответ
     * @param mixed $data Данные
     * @param int $code HTTP код
     */
    public static function jsonResponse($data, $code = 200) {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    
    /**
     * Проверяет, является ли запрос AJAX
     * @return bool
     */
    public static function isAjax() {
        return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
               strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
    }
    
    /**
     * Получает значение из массива с проверкой
     * @param array $array Массив
     * @param string $key Ключ
     * @param mixed $default Значение по умолчанию
     * @return mixed
     */
    public static function getValue($array, $key, $default = null) {
        return isset($array[$key]) ? $array[$key] : $default;
    }
    
    /**
     * Безопасно получает значение из GET параметров
     * @param string $key Ключ
     * @param mixed $default Значение по умолчанию
     * @return mixed
     */
    public static function get($key, $default = null) {
        return self::getValue($_GET, $key, $default);
    }
    
    /**
     * Безопасно получает значение из POST параметров
     * @param string $key Ключ
     * @param mixed $default Значение по умолчанию
     * @return mixed
     */
    public static function post($key, $default = null) {
        return self::getValue($_POST, $key, $default);
    }
    
    /**
     * Безопасно получает значение из SESSION
     * @param string $key Ключ
     * @param mixed $default Значение по умолчанию
     * @return mixed
     */
    public static function session($key, $default = null) {
        return self::getValue($_SESSION, $key, $default);
    }
}

?>
