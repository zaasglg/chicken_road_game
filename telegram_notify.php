<?php
/**
 * Telegram Notification System
 * Отправляет уведомления о регистрации пользователей в Telegram
 */

class TelegramNotifier {
    private $bot_token = '8468171708:AAFKFJtEGUb-RW2DdiMiU8hNZ_pkffVZSPI';
    private $chat_id = '-1002909289551';
    
    /**
     * Отправка уведомления о регистрации пользователя
     */
    public function sendRegistrationNotification($user_data) {
        $message = $this->formatRegistrationMessage($user_data);
        return $this->sendMessage($message);
    }
    
    /**
     * Форматирование сообщения о регистрации
     */
    private function formatRegistrationMessage($user_data) {
        $message = "✅ Рег: {$user_data['user_id']}\n";
        
        // Определяем флаг страны
        $country_flags = [
            'Venezuela' => '🇻🇪',
            'Ecuador' => '🇪🇨', 
            'Paraguay' => '🇵🇾',
            'Argentina' => '🇦🇷',
            'Colombia' => '🇨🇴',
            'Peru' => '🇵🇪',
            'Chile' => '🇨🇱',
            'Bolivia' => '🇧🇴',
            'Uruguay' => '🇺🇾',
            'Brazil' => '🇧🇷'
        ];
        
        $country = isset($user_data['country']) ? $user_data['country'] : 'Unknown';
        $flag = isset($country_flags[$country]) ? $country_flags[$country] : '🌍';
        
        $message .= "{$flag} Страна: {$country}";
        
        // Добавляем реферальный код если есть
        if (isset($user_data['referral_code'])) {
            $message .= "\n👥 Реф: {$user_data['referral_code']}";
        }
        
        return $message;
    }
    
    /**
     * Отправка сообщения в Telegram
     */
    private function sendMessage($message) {
        $url = "https://api.telegram.org/bot{$this->bot_token}/sendMessage";
        
        $data = [
            'chat_id' => $this->chat_id,
            'text' => $message,
            'disable_web_page_preview' => true
        ];
        
        $options = [
            'http' => [
                'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                'method' => 'POST',
                'content' => http_build_query($data)
            ]
        ];
        
        $context = stream_context_create($options);
        $result = @file_get_contents($url, false, $context);
        
        if ($result === false) {
            error_log("Failed to send Telegram notification");
            return false;
        }
        
        $response = json_decode($result, true);
        return isset($response['ok']) && $response['ok'] === true;
    }
    
    /**
     * Отправка уведомления о первой игре пользователя
     */
    public function sendFirstGameNotification($user_data) {
        $emoji = isset($user_data['game_result']) && $user_data['game_result'] === 'win' ? '🎉' : '🎮';
        $message = "{$emoji} Первая игра: {$user_data['user_id']}\n";
        
        if (isset($user_data['bet_amount'])) {
            $message .= "💸 Ставка: \${$user_data['bet_amount']}\n";
        }
        
        if (isset($user_data['win_amount']) && $user_data['win_amount'] > 0) {
            $message .= "💰 Выигрыш: \${$user_data['win_amount']}";
        } else {
            $message .= "😔 Проигрыш";
        }
        
        return $this->sendMessage($message);
    }
    
    /**
     * Отправка уведомления о крупном выигрыше
     */
    public function sendBigWinNotification($user_data) {
        $message = "🎊 КРУПНЫЙ ВЫИГРЫШ: {$user_data['user_id']}\n";
        
        if (isset($user_data['bet_amount'])) {
            $message .= "💸 Ставка: \${$user_data['bet_amount']}\n";
        }
        
        if (isset($user_data['win_amount'])) {
            $message .= "🎉 Выигрыш: \${$user_data['win_amount']}\n";
        }
        
        if (isset($user_data['multiplier'])) {
            $message .= "📈 x{$user_data['multiplier']}";
        }
        
        return $this->sendMessage($message);
    }
    
    /**
     * Тестовая отправка сообщения
     */
    public function sendTestMessage() {
        $message = "🧪 Тест системы уведомлений\n✅ Система работает!";
        return $this->sendMessage($message);
    }
}

// Функция для быстрого использования
function sendTelegramNotification($type, $data) {
    $notifier = new TelegramNotifier();
    
    switch ($type) {
        case 'registration':
            return $notifier->sendRegistrationNotification($data);
        case 'first_game':
            return $notifier->sendFirstGameNotification($data);
        case 'big_win':
            return $notifier->sendBigWinNotification($data);
        case 'test':
            return $notifier->sendTestMessage();
        default:
            return false;
    }
}
?>