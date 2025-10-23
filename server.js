const http = require('http');
const WebSocket = require('ws');

const SETTINGS = {
    chance: {
        easy: [1, 30],      // Easy: ловушка на 1-30 секторе (легко)
        medium: [1, 15],    // Medium: ловушка на 1-15 секторе (сложнее)
        hard: [1, 10],      // Hard: ловушка на 1-10 секторе (очень сложно)
        hardcore: [1, 8]    // Hardcore: ловушка на 1-8 секторе (экстремально)
    }
};

// Создаём HTTP-сервер, чтобы можно было слушать на 0.0.0.0
const server = http.createServer();
const wss = new WebSocket.Server({ server, path: "/ws/" }); // слушаем именно /ws

let lastTrapsByLevel = { easy: [], medium: [], hard: [], hardcore: [] };
let lastTrapIndexByLevel = { easy: null, medium: null, hard: null, hardcore: null }; // Храним последний индекс ловушки
let lastBroadcastTime = Date.now();
const BROADCAST_INTERVAL = 30000;

function getSecondsToNextBroadcast() {
    const now = Date.now();
    const elapsed = now - lastBroadcastTime;
    const left = BROADCAST_INTERVAL - (elapsed % BROADCAST_INTERVAL);
    return Math.ceil(left / 1000);
}
const clients = new Map(); // ws -> { level, gameActive, lastTraps }
const sessionTraps = new Map(); // ws -> { level: trapIndex }
const activeGames = new Set();

wss.on('connection', (ws) => {
    clients.set(ws, { level: 'easy', gameActive: false, lastTraps: [], connectedAt: Date.now() });
    sessionTraps.set(ws, {});
    console.log('Client connected, total clients:', clients.size);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            const clientData = clients.get(ws);

            if (data.type === 'set_level') {
                clientData.level = data.level;
            } else if (data.type === 'set_client_type') {
                clientData.isHackBot = data.isHackBot || false;
            } else if (data.type === 'request_traps') {
                // Отдаем ПОСЛЕДНИЕ сгенерированные ловушки, а не создаем новые
                const level = clientData.level;
                let trapData = lastTrapsByLevel[level];
                
                // Если еще не было broadcast, генерируем первый раз
                if (!trapData) {
                    const broadcastSeed = Date.now();
                    const lastIndex = lastTrapIndexByLevel[level];
                    trapData = generateTraps(level, 0, broadcastSeed, lastIndex);
                    lastTrapsByLevel[level] = trapData;
                    lastTrapIndexByLevel[level] = trapData.trapIndex;
                    console.log(`First generation for level ${level}:`, trapData.trapIndex);
                }
                
                clientData.lastTraps = trapData.traps;
                ws.send(JSON.stringify({ 
                    type: 'traps', 
                    traps: trapData.traps, 
                    level: trapData.level || level,
                    coefficient: trapData.coefficient,
                    trapIndex: trapData.trapIndex,
                    sectors: trapData.sectors,
                    seconds: getSecondsToNextBroadcast()
                }));
            } else if (data.type === 'get_last_traps') {
                ws.send(JSON.stringify({ type: 'traps_all_levels', traps: lastTrapsByLevel, seconds: getSecondsToNextBroadcast() }));
            } else if (data.type === 'end_game') {
                sessionTraps.forEach((session, ws) => {
                    sessionTraps.set(ws, {});
                });
            } else if (data.type === 'game_start') {
                activeGames.add(ws);
                clientData.gameActive = true;
                console.log(`Game started for client. Active games: ${activeGames.size}`);
            } else if (data.type === 'game_end') {
                activeGames.delete(ws);
                clientData.gameActive = false;
                console.log(`Game ended for client. Active games: ${activeGames.size}`);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        sessionTraps.delete(ws);
        activeGames.delete(ws);
        console.log('Client disconnected, total clients:', clients.size, 'active games:', activeGames.size);
    });

    ws.on('error', (error) => console.error('WebSocket error:', error));
});

// Генерация ловушек каждые 30 секунд (если нет активных игр)
setInterval(() => {
    if (clients.size > 0) {
        if (activeGames.size > 0) {
            console.log(`Skipping broadcast - ${activeGames.size} active games in progress`);
            return;
        }
    lastBroadcastTime = Date.now();
    console.log('--- Broadcasting traps for ALL LEVELS to', clients.size, 'clients ---');
        const broadcastSeed = Date.now();
        const allLevels = ['easy', 'medium', 'hard', 'hardcore'];
        const trapsByLevel = {};

        allLevels.forEach(level => {
            const lastIndex = lastTrapIndexByLevel[level];
            const trapData = generateTraps(level, 0, broadcastSeed, lastIndex);
            trapsByLevel[level] = trapData;
            // Сохраняем новый индекс для следующей генерации
            lastTrapIndexByLevel[level] = trapData.trapIndex;
        });

        Object.assign(lastTrapsByLevel, trapsByLevel);

        clients.forEach((clientData, ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                const clientLevelData = trapsByLevel[clientData.level];
                ws.send(JSON.stringify({ 
                    type: 'traps', 
                    traps: clientLevelData.traps, 
                    level: clientData.level,
                    coefficient: clientLevelData.coefficient,
                    trapIndex: clientLevelData.trapIndex,
                    sectors: clientLevelData.sectors, // Добавляем массив коэффициентов для всех секторов
                    seconds: getSecondsToNextBroadcast()
                }));
                ws.send(JSON.stringify({ type: 'traps_all_levels', traps: trapsByLevel, seconds: getSecondsToNextBroadcast() }));
            }
        });
        console.log('--- End broadcast ---\n');
    }
}, 30000);

function generateTraps(level, clientIndex = 0, broadcastSeed = null, lastTrapIndex = null) {
    const chance = SETTINGS.chance[level];
    if (!chance) return { traps: [], coefficient: 1.0, trapIndex: 0, sectors: [] };

    const seed = broadcastSeed || (Date.now() + Math.floor(Math.random() * 100000) + clientIndex * 1000);
    const random = seededRandom(seed);

    const coefficients = {
        easy: [ 1.03, 1.07, 1.12, 1.17, 1.23, 1.29, 1.36, 1.44, 1.53, 1.63, 1.74, 1.86, 1.99, 2.13, 2.29, 2.46, 2.64, 2.84, 3.06, 3.30, 3.56, 3.84, 4.15, 4.48, 4.84, 5.23, 5.65, 6.11, 6.61, 7.15 ],
        medium: [ 1.12, 1.28, 1.47, 1.70, 1.98, 2.33, 2.76, 3.32, 4.03, 4.96, 6.15, 7.70, 9.75, 12.45, 16.05, 20.90, 27.50, 36.50, 48.80, 65.70, 89.20, 121.80, 167.40, 231.20, 320.80, 447.50, 627.00, 881.00, 1243.00, 1758.00 ],
        hard: [ 1.23, 1.55, 1.98, 2.56, 3.36, 4.49, 5.49, 7.53, 10.56, 15.21, 22.35, 33.50, 50.80, 77.90, 120.50, 188.20, 296.50, 470.80, 752.50, 1210.00, 1956.00, 3180.00, 5190.00, 8500.00, 13970.00, 23000.00, 37950.00, 62750.00, 103900.00, 172200.00 ],
        hardcore: [ 1.63, 2.80, 4.95, 9.08, 15.21, 30.12, 62.96, 140.24, 337.19, 890.19, 2450.00, 6950.00, 20300.00, 61500.00, 190500.00, 603000.00, 1940000.00, 6320000.00, 20800000.00, 69100000.00, 231000000.00, 778000000.00, 2640000000.00, 9010000000.00, 30900000000.00, 106500000000.00, 368500000000.00, 1280000000000.00, 4460000000000.00, 15600000000000.00 ]
    };

    const levelCoeffs = coefficients[level] || coefficients.easy;
    const minTrap = chance[0];
    const maxTrap = chance[1];
    
    let flameIndex;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Генерируем новый индекс, который отличается от предыдущего
    do {
        flameIndex = minTrap + Math.floor(random() * (maxTrap - minTrap + 1));
        attempts++;
        
        // Если за 10 попыток не получилось сгенерировать другой индекс,
        // принудительно выбираем следующий или предыдущий
        if (attempts >= maxAttempts && flameIndex === lastTrapIndex) {
            if (flameIndex < maxTrap) {
                flameIndex++;
            } else if (flameIndex > minTrap) {
                flameIndex--;
            }
            break;
        }
    } while (flameIndex === lastTrapIndex && attempts < maxAttempts);
    
    const coefficient = levelCoeffs[flameIndex - 1] || levelCoeffs[0];

    // Создаем массив секторов с коэффициентами
    const sectors = [];
    for (let i = 0; i < levelCoeffs.length; i++) {
        sectors.push({
            id: i + 1,
            position: i,
            coefficient: levelCoeffs[i],
            isTrap: (i + 1) === flameIndex
        });
    }

    const logPrefix = lastTrapIndex !== null && lastTrapIndex === flameIndex ? '⚠️ SAME' : '✅ NEW';
    console.log(`${logPrefix} Client ${clientIndex}: Level: ${level}, Trap index: ${flameIndex} (prev: ${lastTrapIndex}), Coefficient: ${coefficient}x`);

    return { 
        level: level,
        traps: flameIndex > 0 ? [flameIndex] : [], 
        coefficient, 
        trapIndex: flameIndex,
        sectors: sectors
    };
}

function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return function() {
        x = Math.sin(x) * 10000;
        return x - Math.floor(x);
    };
}

// Слушаем на всех интерфейсах
server.listen(8081, '0.0.0.0', () => {
    console.log("WebSocket server listening");
});
