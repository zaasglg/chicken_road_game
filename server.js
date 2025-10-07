const http = require('http');
const WebSocket = require('ws');

const SETTINGS = {
    chance: {
        easy: [7, 23],
        medium: [5, 15],
        hard: [3, 10],
        hardcore: [3, 8]
    }
};

// Создаём HTTP-сервер, чтобы можно было слушать на 0.0.0.0
const server = http.createServer();
const wss = new WebSocket.Server({ server, path: "/ws/" }); // слушаем именно /ws

let lastTrapsByLevel = { easy: [], medium: [], hard: [], hardcore: [] };
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
                const trapData = generateTraps(clientData.level, 0);
                clientData.lastTraps = trapData.traps;
                ws.send(JSON.stringify({ 
                    type: 'traps', 
                    traps: trapData.traps, 
                    level: clientData.level,
                    coefficient: trapData.coefficient,
                    trapIndex: trapData.trapIndex,
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
            const trapData = generateTraps(level, 0, broadcastSeed);
            trapsByLevel[level] = trapData;
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
                    seconds: getSecondsToNextBroadcast()
                }));
                ws.send(JSON.stringify({ type: 'traps_all_levels', traps: trapsByLevel, seconds: getSecondsToNextBroadcast() }));
            }
        });
        console.log('--- End broadcast ---\n');
    }
}, 30000);

function generateTraps(level, clientIndex = 0, broadcastSeed = null) {
    const chance = SETTINGS.chance[level];
    if (!chance) return { traps: [], coefficient: 1.0, trapIndex: 0 };

    const seed = broadcastSeed || (Date.now() + Math.floor(Math.random() * 100000) + clientIndex * 1000);
    const random = seededRandom(seed);

    const coefficients = {
        easy: [ 1.03, 1.07, 1.12, 1.17, 1.23, 1.29, 1.36, 1.44, 1.53, 1.63 ],
        medium: [ 1.12, 1.28, 1.47, 1.70, 1.98, 2.33, 2.76, 3.32, 4.03, 4.96 ],
        hard: [ 1.23, 1.55, 1.98, 2.56, 3.36, 4.49, 5.49, 7.53, 10.56, 15.21 ],
        hardcore: [ 1.63, 2.80, 4.95, 9.08, 15.21, 30.12, 62.96, 140.24, 337.19, 890.19 ]
    };

    const levelCoeffs = coefficients[level] || coefficients.easy;
    const maxTrap = chance[Math.round(random() * 100) > 95 ? 1 : 0];
    const flameIndex = Math.ceil(random() * maxTrap);
    const coefficient = levelCoeffs[flameIndex - 1] || levelCoeffs[0];

    console.log(`Client ${clientIndex}: Level: ${level}, Trap index: ${flameIndex}, Coefficient: ${coefficient}x`);

    return { traps: flameIndex > 0 ? [flameIndex] : [], coefficient, trapIndex: flameIndex };
}

function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return function() {
        x = Math.sin(x) * 10000;
        return x - Math.floor(x);
    };
}

// Слушаем на всех интерфейсах
server.listen(8080, '0.0.0.0', () => {
    console.log("WebSocket server listening on ws://0.0.0.0:8080/ws");
});
