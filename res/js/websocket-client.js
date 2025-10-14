// WebSocket клиент для работы с новым сервером
class TrapWebSocketClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // 1 секунда
        this.serverUrl = 'ws://localhost:8080/ws/'; // Путь к server.js
        this.currentLevel = 'easy';
    }

    // Подключение к WebSocket серверу
    connect() {
        try {
            console.log('Connecting to WebSocket server...');
            this.ws = new WebSocket(this.serverUrl);

            this.ws.onopen = () => {
                console.log('Connected to WebSocket server');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                // Запрашиваем ловушки для всех уровней при подключении
                this.getAllLevelsTraps();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.ws.onclose = () => {
                console.log('WebSocket connection closed');
                this.isConnected = false;
                this.attemptReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

        } catch (error) {
            console.error('Error connecting to WebSocket:', error);
            this.attemptReconnect();
        }
    }

    // Попытка переподключения
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached. WebSocket unavailable.');
        }
    }

    // Обработка входящих сообщений
    handleMessage(data) {
        console.log('Received WebSocket message:', data);

        switch (data.type) {
            case 'traps':
                console.log('Traps received from WebSocket:', data);
                this.onTrapsReceived(data);
                break;

            case 'traps_all_levels':
                console.log('All levels traps received from WebSocket:', data);
                this.onAllLevelsTrapsReceived(data.traps);
                break;

            default:
                console.log('Unknown message type:', data.type);
        }
    }

    // Отправка сообщения на сервер
    send(message) {
        if (this.isConnected && this.ws) {
            try {
                this.ws.send(JSON.stringify(message));
                console.log('Sent message to WebSocket:', message);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        } else {
            console.warn('WebSocket not connected. Cannot send message:', message);
        }
    }

    // Запрос ловушек для текущего уровня
    requestTraps() {
        this.send({
            type: 'request_traps'
        });
    }

    // Установка уровня сложности
    setLevel(level) {
        this.currentLevel = level;
        this.send({
            type: 'set_level',
            level: level
        });
        // Запрашиваем ловушки для нового уровня
        this.requestTraps();
    }

    // Запрос ловушек для всех уровней
    getAllLevelsTraps() {
        this.send({
            type: 'get_last_traps'
        });
    }

    // Уведомление о начале игры
    startGame() {
        this.send({
            type: 'game_start'
        });
    }

    // Уведомление об окончании игры
    endGame() {
        this.send({
            type: 'game_end'
        });
    }

    // Обработчик для полученных ловушек
    onTrapsReceived(data) {
        console.log('Traps received:', data);
        
        // Создаем полный массив секторов с коэффициентами
        const sectors = [];
        for (let i = 0; i < 24; i++) {
            sectors.push({
                id: i + 1,
                position: i,
                coefficient: 1.0 + (i * 0.05), // Базовые коэффициенты
                isTrap: false
            });
        }
        
        // Устанавливаем ловушку и коэффициент
        if (data.trapIndex && data.trapIndex > 0) {
            const trapPosition = data.trapIndex - 1; // trapIndex начинается с 1
            if (trapPosition >= 0 && trapPosition < 24) {
                sectors[trapPosition].coefficient = data.coefficient;
                sectors[trapPosition].isTrap = true;
            }
        }
        
        // Преобразуем данные в формат, ожидаемый игрой
        const trapData = {
            level: data.level,
            trapCount: data.traps ? data.traps.length : 0,
            traps: data.traps || [],
            sectors: sectors,
            coefficient: data.coefficient,
            trapIndex: data.trapIndex,
            timestamp: new Date().toISOString()
        };
        
        // Если есть глобальный объект GAME, обновляем ловушки
        if (window.GAME && typeof window.GAME.updateTrapsFromWebSocket === 'function') {
            window.GAME.updateTrapsFromWebSocket(trapData);
        }
    }

    // Обработчик для всех уровней
    onAllLevelsTrapsReceived(allLevelsData) {
        console.log('All levels traps received:', allLevelsData);
        
        // Преобразуем данные в формат, ожидаемый игрой
        const convertedData = {};
        Object.keys(allLevelsData).forEach(level => {
            const levelData = allLevelsData[level];
            
            // Создаем полный массив секторов с коэффициентами
            const sectors = [];
            for (let i = 0; i < 24; i++) {
                sectors.push({
                    id: i + 1,
                    position: i,
                    coefficient: 1.0 + (i * 0.05), // Базовые коэффициенты
                    isTrap: false
                });
            }
            
            // Устанавливаем ловушку и коэффициент
            if (levelData.trapIndex && levelData.trapIndex > 0) {
                const trapPosition = levelData.trapIndex - 1; // trapIndex начинается с 1
                if (trapPosition >= 0 && trapPosition < 24) {
                    sectors[trapPosition].coefficient = levelData.coefficient;
                    sectors[trapPosition].isTrap = true;
                }
            }
            
            convertedData[level] = {
                level: level,
                trapCount: levelData.traps ? levelData.traps.length : 0,
                traps: levelData.traps || [],
                sectors: sectors,
                coefficient: levelData.coefficient,
                trapIndex: levelData.trapIndex,
                timestamp: new Date().toISOString()
            };
        });
        
        // Если есть глобальный объект GAME, обновляем ловушки для всех уровней
        if (window.GAME && typeof window.GAME.updateAllLevelsTrapsFromWebSocket === 'function') {
            window.GAME.updateAllLevelsTrapsFromWebSocket(convertedData);
        }
    }

    // Отключение от WebSocket
    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }

    // Проверка подключения
    isWebSocketConnected() {
        return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}

// Инициализация WebSocket клиента
document.addEventListener('DOMContentLoaded', () => {
    // Создаем глобальный экземпляр WebSocket клиента
    window.trapWSClient = new TrapWebSocketClient();
    
    // Автоматически подключаемся
    window.trapWSClient.connect();
});