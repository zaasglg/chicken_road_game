// WebSocket клиент для подключения к server.js
class TrapWebSocketClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.currentLevel = 'easy';
    }

    connect() {
        try {
            console.log('🔌 Connecting to WebSocket server...');
            this.ws = new WebSocket('ws://127.0.0.1:8080/ws/');
            
            this.ws.onopen = () => {
                console.log('✅ Connected to WebSocket server');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                
                // Устанавливаем уровень по умолчанию
                this.setLevel(this.currentLevel);
                
                // Запрашиваем последние ловушки
                this.requestTraps();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('📨 WebSocket message received:', data);
                    
                    if (data.type === 'traps') {
                        this.handleTrapsData(data);
                    } else if (data.type === 'traps_all_levels') {
                        this.handleAllLevelsData(data);
                    }
                } catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error);
                }
            };

            this.ws.onclose = () => {
                console.log('📱 Disconnected from WebSocket server');
                this.isConnected = false;
                this.attemptReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('❌ WebSocket connection error:', error);
            };

        } catch (error) {
            console.error('❌ Failed to connect to WebSocket:', error);
            this.attemptReconnect();
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay);
        } else {
            console.log('❌ Max reconnection attempts reached');
        }
    }

    setLevel(level) {
        this.currentLevel = level;
        if (this.isConnected) {
            this.send({
                type: 'set_level',
                level: level
            });
        }
    }

    requestTraps() {
        if (this.isConnected) {
            this.send({
                type: 'request_traps'
            });
        }
    }

    startGame() {
        if (this.isConnected) {
            this.send({
                type: 'game_start'
            });
        }
    }

    endGame() {
        if (this.isConnected) {
            this.send({
                type: 'game_end'
            });
        }
    }

    send(data) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.error('❌ WebSocket not connected, cannot send message');
        }
    }

    isWebSocketConnected() {
        return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    handleTrapsData(data) {
        console.log('🎯 Traps data received:', data);
        
        // Уведомляем игру о новых ловушках
        if (window.GAME && window.GAME.updateTrapsFromWebSocket) {
            window.GAME.updateTrapsFromWebSocket(data);
        }
    }

    handleAllLevelsData(data) {
        console.log('🎯 All levels traps data received:', data);
        
        // Уведомляем игру о ловушках для всех уровней
        if (window.GAME && window.GAME.updateAllLevelsTrapsFromWebSocket) {
            window.GAME.updateAllLevelsTrapsFromWebSocket(data.traps);
        }
    }
}

// Создаем глобальный экземпляр WebSocket клиента
window.trapWSClient = new TrapWebSocketClient();

// Автоматически подключаемся при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing WebSocket client...');
    window.trapWSClient.connect();
});

console.log('📡 WebSocket client loaded');
