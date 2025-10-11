# Примеры запуска игры

## URL параметры

### Демо режим
```
http://127.0.0.1:8000/?demo=true
```

### С балансом
```
http://127.0.0.1:8000/?balance=5000
```

### С пользователем
```
http://127.0.0.1:8000/?user_id=12345&balance=1000
```

### С валютой
```
http://127.0.0.1:8000/?user_id=12345&balance=1000&country=Venezuela
```

### Полный набор
```
http://127.0.0.1:8000/?user_id=12345&balance=1000&country=Venezuela&lang=en&access_token=abc123
```

### С токеном доступа
```
http://127.0.0.1:8000/?user_id=12345&balance=1000&access_token=your_access_token_here
```

## Параметры

- `demo=true` - демо режим с балансом 500$
- `balance=5000` - установить баланс
- `user_id=12345` - ID пользователя
- `country=Venezuela` - страна для валюты (VES, COP, ECS, CRC, PYG, MXN, ARS, BRL)
- `lang=en` - язык интерфейса
- `access_token=abc123` - токен доступа для аутентификации

## Поддерживаемые страны и валюты

- Venezuela → VES
- Colombia → COP  
- Ecuador → ECS
- Costa Rica → CRC
- Paraguay → PYG
- Mexico → MXN
- Argentina → ARS
- Brazil → BRL

## API интеграция

### Автоматические запросы к API

После каждой игры (выигрыш или проигрыш) игра автоматически отправляет запрос к API:

```
PUT http://api.valor-games.co/api/user/deposit/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "deposit": "150.50",        // Положительное при выигрыше, отрицательное при проигрыше
  "game_result": "win",        // "win" или "loss"
  "bet_amount": 10.0,         // Размер ставки
  "win_amount": 150.50,       // Сумма выигрыша (0 при проигрыше)
  "final_balance": 1000.50,   // Финальный баланс
  "user_id": 12345            // ID пользователя
}
```

### Тестирование API

```bash
# Запуск тестов
python test_deposit_api.py

# Показать только curl примеры
python test_deposit_api.py --curl
```

### Устранение ошибок

#### Ошибка 401 (Unauthorized)
- Проверьте, что `access_token` действителен и не истек
- Убедитесь, что токен имеет права на выполнение операций с балансом

#### Ошибка CORS (Cross-Origin Request Blocked)
- Настройте CORS на сервере API для домена игры
- Добавьте заголовки: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`

#### Проверка токена
```javascript
// В консоли браузера
console.log('Access token:', window.ACCESS_TOKEN);
console.log('Token preview:', window.ACCESS_TOKEN ? window.ACCESS_TOKEN.substring(0, 20) + '...' : 'none');
```

### Примеры curl запросов

```bash
# Выигрыш
curl -X PUT "http://api.valor-games.co/api/user/deposit/" \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{"deposit": "150.50", "game_result": "win", "bet_amount": 10.0, "win_amount": 150.50, "final_balance": 1000.50, "user_id": 12345}'

# Проигрыш
curl -X PUT "http://api.valor-games.co/api/user/deposit/" \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{"deposit": "-10.00", "game_result": "loss", "bet_amount": 10.0, "win_amount": 0.0, "final_balance": 990.00, "user_id": 12345}'
```
