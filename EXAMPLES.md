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
http://127.0.0.1:8000/?user_id=12345&balance=1000&country=Venezuela&lang=en
```

## Параметры

- `demo=true` - демо режим с балансом 500$
- `balance=5000` - установить баланс
- `user_id=12345` - ID пользователя
- `country=Venezuela` - страна для валюты (VES, COP, ECS, CRC, PYG, MXN, ARS, BRL)
- `lang=en` - язык интерфейса

## Поддерживаемые страны и валюты

- Venezuela → VES
- Colombia → COP  
- Ecuador → ECS
- Costa Rica → CRC
- Paraguay → PYG
- Mexico → MXN
- Argentina → ARS
- Brazil → BRL
