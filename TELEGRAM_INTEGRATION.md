# Telegram Integration Guide

## Настройка бота

**Bot Token:** `8468171708:AAFKFJtEGUb-RW2DdiMiU8hNZ_pkffVZSPI`  
**Chat ID:** `-1002909289551`

Убедитесь, что бот добавлен в чат и имеет права на отправку сообщений.

## API Endpoints

### 1. Уведомление о регистрации

**URL:** `/chicken-road/notify_registration.php`  
**Method:** POST  
**Content-Type:** application/json

**Пример запроса:**
```javascript
fetch('https://yourdomain.com/chicken-road/notify_registration.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        user_id: '15985294',
        country: 'Venezuela',
        referral_code: '2114257053'  // опционально
    })
})
.then(response => response.json())
.then(data => {
    console.log('Notification sent:', data);
});
```

**Пример ответа:**
```json
{
    "success": true,
    "message": "Registration notification sent successfully"
}
```

### 2. Уведомления через API игры

**Base URL:** `/chicken-road/api.php?controller=telegram`

#### Тест соединения
```
POST /chicken-road/api.php?controller=telegram&action=test_telegram
```

#### Уведомление о первой игре
```
POST /chicken-road/api.php?controller=telegram&action=notify_first_game
Content-Type: application/json

{
    "user_id": 12345,
    "bet_amount": 5.00,
    "game_result": "win",
    "win_amount": 15.00,
    "balance": 110.00
}
```

#### Уведомление о крупном выигрыше
```
POST /chicken-road/api.php?controller=telegram&action=notify_big_win
Content-Type: application/json

{
    "user_id": 12345,
    "bet_amount": 10.00,
    "win_amount": 500.00,
    "multiplier": 50.0,
    "balance": 600.00
}
```

## Интеграция с основным сайтом

### PHP пример (для регистрации)

```php
<?php
function notifyTelegramRegistration($user_data) {
    $url = 'https://yourdomain.com/chicken-road/notify_registration.php';
    
    $data = [
        'user_id' => $user_data['id'],
        'username' => $user_data['username'],
        'email' => $user_data['email'],
        'country' => $user_data['country'],
        'balance' => $user_data['initial_balance'],
        'ip' => $_SERVER['REMOTE_ADDR']
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/json\r\n",
            'method' => 'POST',
            'content' => json_encode($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    return json_decode($result, true);
}

// Использование при регистрации пользователя
$user_data = [
    'id' => 12345,
    'username' => 'new_user',
    'email' => 'user@example.com',
    'country' => 'Argentina',
    'initial_balance' => 100.00
];

$notification_result = notifyTelegramRegistration($user_data);
if ($notification_result['success']) {
    echo "Telegram notification sent!";
}
?>
```

### JavaScript пример (для фронтенда)

```javascript
async function sendRegistrationNotification(userData) {
    try {
        const response = await fetch('/chicken-road/notify_registration.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userData.id,
                username: userData.username,
                email: userData.email,
                country: userData.country,
                balance: userData.balance
            })
        });
        
        const result = await response.json();
        console.log('Telegram notification:', result);
        return result.success;
    } catch (error) {
        console.error('Failed to send Telegram notification:', error);
        return false;
    }
}

// Использование
sendRegistrationNotification({
    id: 12345,
    username: 'new_user',
    email: 'user@example.com',
    country: 'Argentina',
    balance: 100.00
});
```

## Автоматические уведомления в игре

Игра автоматически отправляет уведомления в следующих случаях:

1. **Первая игра пользователя** - отправляется при первой ставке
2. **Крупный выигрыш** - отправляется при выигрыше ≥ $100

## Типы уведомлений

### ✅ Регистрация
Формат: `✅ Рег: [USER_ID]`
`🇻🇪 Страна: Venezuela`
`👥 Реф: [REFERRAL_CODE]` (если есть)

Пример: 
```
✅ Рег: 15985294
🇻🇪 Страна: Venezuela
👥 Реф: 2114257053
```

### 🎮 Первая игра
Формат: `🎮 Первая игра: [USER_ID]`
`💸 Ставка: $[AMOUNT]`
`💰 Выигрыш: $[WIN_AMOUNT]` или `😔 Проигрыш`

### 🎊 Крупный выигрыш
Формат: `🎊 КРУПНЫЙ ВЫИГРЫШ: [USER_ID]`
`💸 Ставка: $[AMOUNT]`
`🎉 Выигрыш: $[WIN_AMOUNT]`
`📈 x[MULTIPLIER]`

## Безопасность

- Все запросы поддерживают CORS
- Проверка обязательных полей
- Логирование ошибок
- Ограничение длины сообщений
- HTML-экранирование для безопасности