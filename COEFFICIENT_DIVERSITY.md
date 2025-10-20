# 🎲 Улучшение разнообразия коэффициентов

## Дата: 20 октября 2025 г.

---

## 🎯 Проблема:
При генерации новых коэффициентов каждые 30 секунд, иногда выпадал **тот же самый коэффициент**, что и в предыдущей генерации. Это снижало разнообразие и интерес к игре.

**Пример:**
```
[14:30:00] Easy: 1.29x (сектор 6)
[14:30:30] Easy: 1.29x (сектор 6)  ← Повторение!
[14:31:00] Easy: 1.29x (сектор 6)  ← Опять!
```

---

## ✅ Решение:

### 1. **Хранение истории последних индексов**
Добавлена переменная для отслеживания предыдущих позиций ловушек:

```javascript
let lastTrapIndexByLevel = { 
    easy: null, 
    medium: null, 
    hard: null, 
    hardcore: null 
};
```

### 2. **Умная генерация с проверкой**
Обновлена функция `generateTraps()` с дополнительным параметром `lastTrapIndex`:

```javascript
function generateTraps(level, clientIndex = 0, broadcastSeed = null, lastTrapIndex = null) {
    // ... существующий код ...
    
    let flameIndex;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Генерируем новый индекс, который отличается от предыдущего
    do {
        flameIndex = Math.ceil(random() * maxTrap);
        attempts++;
        
        // Если за 10 попыток не получилось, принудительно выбираем другой
        if (attempts >= maxAttempts && flameIndex === lastTrapIndex) {
            if (flameIndex < maxTrap) {
                flameIndex++;
            } else if (flameIndex > 1) {
                flameIndex--;
            }
            break;
        }
    } while (flameIndex === lastTrapIndex && attempts < maxAttempts);
    
    // ...
}
```

### 3. **Логирование для отладки**
Добавлены визуальные индикаторы в логах:

```javascript
const logPrefix = lastTrapIndex !== null && lastTrapIndex === flameIndex ? '⚠️ SAME' : '✅ NEW';
console.log(`${logPrefix} Client ${clientIndex}: Level: ${level}, Trap index: ${flameIndex} (prev: ${lastTrapIndex}), Coefficient: ${coefficient}x`);
```

---

## 📊 Результат:

### До изменений:
```
[14:30:00] Client 0: Level: easy, Trap index: 5, Coefficient: 1.23x
[14:30:30] Client 0: Level: easy, Trap index: 5, Coefficient: 1.23x  ← Повторение
[14:31:00] Client 0: Level: easy, Trap index: 5, Coefficient: 1.23x  ← Повторение
```

### После изменений:
```
[14:30:00] ✅ NEW Client 0: Level: easy, Trap index: 5 (prev: null), Coefficient: 1.23x
[14:30:30] ✅ NEW Client 0: Level: easy, Trap index: 3 (prev: 5), Coefficient: 1.12x
[14:31:00] ✅ NEW Client 0: Level: easy, Trap index: 7 (prev: 3), Coefficient: 1.36x
```

---

## 🔧 Механизм работы:

### Шаг 1: Генерация
1. Получаем `lastTrapIndex` из хранилища
2. Генерируем новый `flameIndex` случайным образом
3. Если совпал с предыдущим - пробуем еще раз (до 10 попыток)

### Шаг 2: Принудительная смена (fallback)
Если за 10 попыток не удалось:
- Если индекс < максимума → увеличиваем на 1
- Если индекс на максимуме → уменьшаем на 1

### Шаг 3: Сохранение
Сохраняем новый индекс для следующей генерации:
```javascript
lastTrapIndexByLevel[level] = trapData.trapIndex;
```

---

## 🎮 Преимущества:

✅ **Больше разнообразия** - каждый раунд гарантированно отличается от предыдущего

✅ **Честная генерация** - используется случайность, но без повторений

✅ **Гибкость** - если случайность даёт повторение, система автоматически корректирует

✅ **Отслеживаемость** - в логах видно, когда был предыдущий индекс

✅ **Работает для всех уровней** - Easy, Medium, Hard, Hardcore

---

## 📝 Изменённые файлы:

- `/server.js`
  - Добавлена переменная `lastTrapIndexByLevel`
  - Обновлена функция `generateTraps()` с параметром `lastTrapIndex`
  - Обновлён broadcast loop для передачи истории
  - Обновлён обработчик `request_traps`

---

## 🧪 Тестирование:

### Как проверить:
1. Запустите WebSocket сервер: `node server.js`
2. Откройте игру или hack bot
3. Наблюдайте за логами сервера каждые 30 секунд
4. Убедитесь, что появляются метки `✅ NEW`
5. Проверьте, что коэффициенты не повторяются подряд

### Ожидаемое поведение:
```bash
✅ NEW Client 0: Level: easy, Trap index: 5 (prev: null), Coefficient: 1.23x
✅ NEW Client 0: Level: medium, Trap index: 4 (prev: null), Coefficient: 1.70x
✅ NEW Client 0: Level: hard, Trap index: 2 (prev: null), Coefficient: 1.55x
✅ NEW Client 0: Level: hardcore, Trap index: 2 (prev: null), Coefficient: 2.8x
--- End broadcast ---

--- Broadcasting traps for ALL LEVELS to 1 clients ---
✅ NEW Client 0: Level: easy, Trap index: 8 (prev: 5), Coefficient: 1.44x    ← Изменился!
✅ NEW Client 0: Level: medium, Trap index: 6 (prev: 4), Coefficient: 2.33x  ← Изменился!
✅ NEW Client 0: Level: hard, Trap index: 5 (prev: 2), Coefficient: 3.36x    ← Изменился!
✅ NEW Client 0: Level: hardcore, Trap index: 5 (prev: 2), Coefficient: 15.21x ← Изменился!
--- End broadcast ---
```

---

## 💡 Дополнительные улучшения (опционально):

### 1. История на N генераций
Можно хранить не только последний индекс, но и последние 3-5:
```javascript
let lastTrapIndexHistory = { 
    easy: [], 
    medium: [], 
    hard: [], 
    hardcore: [] 
};
```

### 2. Весовая система
Можно добавить веса для редких коэффициентов (больших значений):
```javascript
const weights = {
    easy: [10, 10, 10, 8, 8, 6, 6, 4, 2, 1]  // Меньшие коэффициенты чаще
};
```

### 3. Минимальное расстояние
Можно требовать минимальное расстояние между индексами:
```javascript
const minDistance = 2;  // Минимум на 2 сектора отличается
```

---

## 📞 Дополнительная информация:
- GitHub Copilot
- Дата: 20 октября 2025 г.
- Версия: 1.0
