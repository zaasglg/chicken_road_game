# 📱 Telegram Уведомления для Chicken Road

## 🚀 Быстрый старт

Система автоматически отправляет уведомления в Telegram чат при регистрации пользователей и игровых событиях.

**Bot Token:** `8468171708:AAFKFJtEGUb-RW2DdiMiU8hNZ_pkffVZSPI`  
**Chat ID:** `-1002909289551`

## 📋 Типы уведомлений

### ✅ Регистрация пользователя
```
✅ Рег: 15985294
🇻🇪 Страна: Venezuela
👥 Реф: 2114257053
```

### 🎮 Первая игра
```
🎉 Первая игра: 15985294
💸 Ставка: $5
💰 Выигрыш: $15
```

### 🎊 Крупный выигрыш (≥$100)
```
🎊 КРУПНЫЙ ВЫИГРЫШ: 15985334
💸 Ставка: $10
🎉 Выигрыш: $500
📈 x50
```

## 🔧 Интеграция с сайтом

### Отправка уведомления о регистрации

**Endpoint:** `POST /chicken-road/notify_registration.php`

```javascript
// JavaScript пример
fetch('/chicken-road/notify_registration.php', {
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
    if (data.success) {
        console.log('Telegram уведомление отправлено!');
    }
});
```

```php
// PHP пример
function sendTelegramRegistration($user_id, $country, $referral_code = null) {
    $url = 'https://yourdomain.com/chicken-road/notify_registration.php';
    
    $data = [
        'user_id' => $user_id,
        'country' => $country
    ];
    
    if ($referral_code) {
        $data['referral_code'] = $referral_code;
    }
    
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

// Использование
$result = sendTelegramRegistration('15985294', 'Venezuela', '2114257053');
```

## 🌍 Поддерживаемые страны с флагами

- 🇻🇪 Venezuela
- 🇪🇨 Ecuador  
- 🇵🇾 Paraguay
- 🇦🇷 Argentina
- 🇨🇴 Colombia
- 🇵🇪 Peru
- 🇨🇱 Chile
- 🇧🇴 Bolivia
- 🇺🇾 Uruguay
- 🇧🇷 Brazil

## ⚙️ Автоматические уведомления в игре

Игра автоматически отправляет уведомления:

1. **Первая игра** - при первой ставке пользователя
2. **Крупный выигрыш** - при выигрыше ≥ $100

Никаких дополнительных настроек не требуется!

## 🧪 Тестирование

```bash
# Тест через API
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"user_id":"12345","country":"Venezuela"}' \
  https://yourdomain.com/chicken-road/notify_registration.php
```

## 📁 Файлы системы

- `telegram_notify.php` - Основной класс для отправки уведомлений
- `notify_registration.php` - Endpoint для уведомлений о регистрации
- `api.php` - Обновлен для поддержки Telegram уведомлений

## 🔒 Безопасность

- ✅ CORS поддержка
- ✅ Проверка обязательных полей
- ✅ Логирование ошибок
- ✅ Защита от спама

## 📞 Поддержка

Все уведомления отправляются в формате, соответствующем скриншоту из Telegram чата "Check Valor".

Система готова к использованию! 🚀