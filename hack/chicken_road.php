<?php
session_start();
include 'overlaying.php';

// Get user_id from URL parameters (like in chicken-road game)
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;

// If user_id is not provided, redirect to home
if (!$user_id) {
    header("Location: index.php");
    exit();
}

// Set default trap coefficient (no database connection needed)
$trap_coefficient = 0.00;
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>🐔 Bot Hack Chicken Road</title>
    <link rel="stylesheet" href="./css/reset.css">
    <link rel="stylesheet" href="./css/normalize.css">
    <link rel="stylesheet" href="./css/style.css">
    <link rel="icon" href="./images/home-page.png" />

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            width: 100%;
            height: 100vh;
            color: white;
            background-color: #000;
            background-image: linear-gradient(315deg, #16191d 0%, #252a2e 100%);
        }

        .main__wrapper {
            max-width: 500px;
            margin: 0 auto;
            width: 100%;
            position: relative;
            padding: 0 10px;
            height: 100%;
            background: black;
        }

        .chicken-container {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .chicken-title {
            font-size: 1.8em;
            margin-bottom: 40px;
            color: #00ff88;
            font-weight: 300;
            letter-spacing: 1px;
            font-weight: bold;
        }

        /* Минималистичный дисплей коэффициента */
        .coefficient-display {
            background: #111111;
            border: 1px solid #00ff88;
            border-radius: 8px;
            padding: 30px 20px;
            margin-bottom: 30px;
            width: 300px;
        }

        .coefficient-label {
            font-size: 0.9em;
            color: #888888;
            margin-bottom: 15px;
            font-weight: 400;
        }


        .coefficient-value {
            margin: 24px 0 10px 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .coefficient-number {
            font-size: 4.2em;
            font-weight: 800;
            background: linear-gradient(90deg, #ffe066 0%, #ffb300 40%, #ff6f00 100%);
            color: #fff;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-fill-color: transparent;
            text-shadow: 0 0 16px #ffb300cc, 0 2px 8px #fff2, 0 0 2px #fff8;
            letter-spacing: 2px;
            filter: drop-shadow(0 0 8px #ffb30088);
            transition: color 0.3s, text-shadow 0.3s;
            animation: coeffGlow 2.2s infinite alternate;
        }

        .x-symbol {
            color: #ffb300;
            font-size: 1.2em;
            margin-left: 7px;
            font-weight: 700;
            text-shadow: 0 0 8px #ffb30099;
        }

        @keyframes coeffGlow {
            0% {
                text-shadow: 0 0 16px #ffb300cc, 0 2px 8px #fff2, 0 0 2px #fff8;
            }

            100% {
                text-shadow: 0 0 32px #ffb300, 0 2px 16px #fff4, 0 0 8px #fff8;
            }
        }



        .coefficient-status {
            font-size: 0.9em;
            color: #cccccc;
            line-height: 1.4;
        }

        /* Минималистичная кнопка */
        .analyze-btn {
            background: #00ff88;
            color: #000000;
            border: none;
            border-radius: 6px;
            padding: 12px 24px;
            font-size: 1em;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            width: 100%;
        }

        .analyze-btn:hover {
            background: #00cc6a;
            transform: translateY(-1px);
        }

        .analyze-btn:active {
            transform: translateY(0);
        }

        /* Анимация пульса */
        .pulse {
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% {
                opacity: 1;
            }

            50% {
                opacity: 0.6;
            }

            100% {
                opacity: 1;
            }
        }

        /* Статусы подключения */
        #ws-connection-status {
            transition: color 0.3s ease;
        }

        /* Level buttons */
        .level-btn {
            transition: all 0.15s cubic-bezier(.4, 0, .2, 1);
            background: linear-gradient(180deg, #232323 60%, #111 100%);
            border: 2.5px solid #444;
            border-radius: 7px;
            box-shadow: 0 3px 0 #222, 0 6px 12px #0006;
            color: #fff;
            font-weight: 600;
            text-shadow: 0 1px 2px #000a;
            position: relative;
            outline: none;
        }

        .level-btn:hover {
            background: linear-gradient(180deg, #333 60%, #191919 100%);
            border-color: #00ff88;
            box-shadow: 0 2px 0 #00ff88, 0 6px 16px #00ff8833;
            color: #00ff88;
        }

        .level-btn:active {
            background: linear-gradient(180deg, #191919 80%, #232323 100%);
            box-shadow: 0 1px 0 #00cc6a, 0 2px 4px #0008 inset;
            top: 2px;
        }

        .level-btn.selected {
            border-color: #00ff88;
            background: linear-gradient(180deg, #00ff88 60%, #00cc6a 100%);
            color: #000;
            box-shadow: 0 2px 0 #00cc6a, 0 6px 16px #00ff8833;
        }
    </style>
</head>

<body>
    <div class="main__wrapper">
        <div class="chicken-container">

            <div style="margin-bottom: 30px;">
                <img src="/hack/images/chicken-road-logo.svg" alt="">
            </div>

            <h1 class="chicken-title">Chicken Road Hack Bot</h1>

            <!-- Вывод user_id -->
            <div style="margin-bottom:20px; font-size:0.9em; color:#bbb;">
                User ID: <span style="color:#00ff88;"><?php echo htmlspecialchars($user_id); ?></span>
            </div>

            <!-- Level Selection -->
            <div class="level-selection" style="margin-bottom: 20px;">
                <div style="font-size: 0.9em; color: #888; margin-bottom: 10px;">Select Level:</div>
                <div class="level-buttons" id="level-buttons" style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                    <button class="level-btn selected" data-level="easy" style="background: #333; color: #fff; border: 1px solid #00ff88; border-radius: 4px; padding: 8px 12px; font-size: 0.8em; cursor: pointer;">Easy</button>
                    <button class="level-btn" data-level="medium" style="background: #333; color: #fff; border: 1px solid #666; border-radius: 4px; padding: 8px 12px; font-size: 0.8em; cursor: pointer;">Medium</button>
                    <button class="level-btn" data-level="hard" style="background: #333; color: #fff; border: 1px solid #666; border-radius: 4px; padding: 8px 12px; font-size: 0.8em; cursor: pointer;">Hard</button>
                    <button class="level-btn" data-level="hardcore" style="background: #333; color: #fff; border: 1px solid #666; border-radius: 4px; padding: 8px 12px; font-size: 0.8em; cursor: pointer;">Hardcore</button>
                </div>
            </div>


            <div class="coefficient-display" style="position:relative; overflow:visible;">
                <div style="display:flex; align-items:center; justify-content:center; margin-bottom:10px;">
                    <img id="fire-icon" src="/res/img/fire_4.png" style="width:48px; height:48px; margin-right:12px; display:none; animation: firePulse 1.2s infinite alternate;" alt="fire">

                    <span id="coefficient-number" class="coefficient-number" style="font-size:3.2em; color:#ffb300; text-shadow:0 0 8px #ffb30099;"><?php echo number_format($trap_coefficient, 2, '.', ''); ?></span><span class="x-symbol" style="color:#ffb300;">x</span>
                </div>
                <div id="coefficient-status" class="coefficient-status" style="margin-top:10px; font-size:0.9em; color:#cccccc; text-align:center;"></div>
                <div id="connection-status" style="margin-top:5px; font-size:0.8em; color:#888; text-align:center;">Connecting...</div>
                <div id="auto-refresh-timer" style="margin-top:18px; font-size:1.2em; color:#ffb300; font-weight:600; letter-spacing:1px; text-align:center;">
                    <span id="timer-seconds">15</span>
                </div>
            </div>
2
            <style>
                @keyframes firePulse {
                    0% {
                        filter: drop-shadow(0 0 0 #ffb300);
                        opacity: 1;
                    }

                    100% {
                        filter: drop-shadow(0 0 16px #ffb300cc);
                        opacity: 0.7;
                    }
                }

                .chicken-container {
                    background-image:
                        linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
                        url('/hack/images/hack_bot_bg.jpg');
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: cover;
                }

                .coefficient-display {
                    background: linear-gradient(135deg, #1a1a1a 80%, #ffb30022 100%);
                    border: 2px solid #ffb300;
                    box-shadow: 0 0 16px #ffb30033;
                    border-radius: 16px;
                    padding: 36px 20px 28px 20px;
                    margin-bottom: 30px;
                }

                .coefficient-number {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-weight: 700;
                    letter-spacing: 1px;
                }
            </style>


        </div>
    </div>

    <script>
        const userId = <?php echo $user_id; ?>;
        let currentLevel = 'easy';
        // Глобальный объект для хранения последних коэффициентов по уровням
        let lastLevelCoefficients = {};
        // Флаг получения коэффициента от WebSocket для каждого уровня
        let wsReceivedForLevel = {
            easy: false,
            medium: false,
            hard: false,
            hardcore: false
        };

        // Сохранять коэффициенты для всех уровней при traps_all_levels
        function saveAllLevelCoefficients(trapsByLevel) {
            for (const level in trapsByLevel) {
                const levelData = trapsByLevel[level];
                if (levelData && levelData.coefficient) {
                    lastLevelCoefficients[level] = levelData.coefficient;
                    wsReceivedForLevel[level] = true;
                }
            }
        }

        // Таймер для отображения времени до следующего обновления (глобально)
        let timerSeconds = 15;
        let timerSpan = null;
        let timerInterval = null;
        let isTimerRunning = false; // Флаг для предотвращения перезапуска

        // Функция для запуска/перезапуска таймера
        function startTimer(initialSeconds) {
            // Если таймер уже идёт - НЕ перезапускаем
            if (isTimerRunning) {
                console.log('⏸️ Timer already running, skipping restart');
                return;
            }

            // Очищаем старый интервал если есть
            if (timerInterval) {
                clearInterval(timerInterval);
                console.log('🛑 Cleared old timer interval');
            }

            timerSeconds = Math.max(0, parseInt(initialSeconds, 10) || 15);
            isTimerRunning = true;
            console.log('🕐 Starting timer with:', timerSeconds, 'seconds');
            
            if (timerSpan) {
                timerSpan.textContent = formatTimer(timerSeconds);
            }

            // Создаём новый интервал
            timerInterval = setInterval(() => {
                if (timerSeconds > 0) {
                    timerSeconds--;
                    if (timerSpan) {
                        timerSpan.textContent = formatTimer(timerSeconds);
                    }
                } else {
                    // Когда таймер достиг 0, НЕ останавливаем - продолжаем отсчёт
                    console.log('⏰ Timer cycle completed, continuing...');
                    timerSeconds = 15; // Сбрасываем на 15 для продолжения отсчёта
                    if (timerSpan) {
                        timerSpan.textContent = formatTimer(timerSeconds);
                    }
                }
            }, 1000);
        }

        // Функция для принудительного перезапуска таймера (при получении новых данных)
        function forceRestartTimer(initialSeconds) {
            console.log('🔄 Force restarting timer to', initialSeconds, 'seconds');
            
            // Просто сбрасываем счётчик, не останавливая интервал
            timerSeconds = initialSeconds;
            if (timerSpan) {
                timerSpan.textContent = formatTimer(timerSeconds);
            }
        }

        // Функция форматирования таймера (показываем только секунды)
        function formatTimer(sec) {
            sec = Math.max(0, parseInt(sec, 10) || 0);
            return `${sec.toString().padStart(2,'0')}`;
        }

        // WebSocket client for hack bot
        class ChickenHackWebSocket {
            constructor() {
                this.ws = null;
                this.isConnected = false;
                this.currentLevel = 'easy';
                this.lastTraps = [];
                this.isLocked = false; // Заблокирован ли коэффициент
                this.connect();
            }

            connect() {
                try {
                    console.log('🔌 Chicken Hack connecting to WebSocket server...');
                    this.ws = new WebSocket('wss://chicken.valor-games.co/ws/');
                    // this.ws = new WebSocket('ws://localhost:8081/ws/');
                    
                    this.ws.onopen = () => {
                        this.isConnected = true;
                        console.log('✅ Chicken Hack connected to WebSocket server');
                        
                        // Обновляем статус подключения
                        const statusEl = document.getElementById('connection-status');
                        if (statusEl) {
                            statusEl.textContent = '🟢 Connected';
                            statusEl.style.color = '#00ff88';
                        }
                        this.ws.send(JSON.stringify({
                            type: 'set_level',
                            level: this.currentLevel
                        }));
                        this.ws.send(JSON.stringify({
                            type: 'set_client_type',
                            isHackBot: true
                        }));

                        // Сразу запрашиваем последние ловушки несколько раз
                        setTimeout(() => {
                            this.ws.send(JSON.stringify({
                                type: 'get_last_traps'
                            }));
                            console.log('📡 Requested last traps on connection');
                        }, 100);
                        
                        // Повторный запрос через 2 секунды
                        setTimeout(() => {
                            if (this.isConnected) {
                                this.ws.send(JSON.stringify({
                                    type: 'get_last_traps'
                                }));
                                console.log('📡 Second request for last traps');
                            }
                        }, 2000);
                        
                        // Третий запрос через 5 секунд
                        setTimeout(() => {
                            if (this.isConnected) {
                                this.ws.send(JSON.stringify({
                                    type: 'request_traps',
                                    level: this.currentLevel
                                }));
                                console.log('📡 Third request for traps');
                            }
                        }, 5000);

                        // Перезапускаем таймер при подключении
                        if (typeof startTimer === 'function') {
                            startTimer(15);
                        }
                        // this.updateConnectionStatus('connected');
                    };

                    this.ws.onmessage = (event) => {
                        const data = JSON.parse(event.data);
                        console.log('📥 Chicken Hack received:', data);
                        console.log('📊 Current wsReceivedForLevel:', wsReceivedForLevel);
                        console.log('💰 Current lastLevelCoefficients:', lastLevelCoefficients);

                        // Handle the new format: traps_all_levels
                        if (data.type === 'traps_all_levels' && data.traps) {
                            console.log('⏱️ Received traps_all_levels, force restarting timer to 15 seconds');
                            console.log('📊 All levels data:', data.traps);
                            forceRestartTimer(15);
                            
                            // Получаем данные для текущего уровня
                            const levelData = data.traps[this.currentLevel];
                            console.log('🎮 Current level:', this.currentLevel);
                            console.log('📦 Level data:', levelData);
                            
                            if (levelData && levelData.trapIndex && levelData.trapIndex > 0) {
                                // Берем коэффициент на одну позицию назад от ловушки
                                const safePosition = Math.max(1, levelData.trapIndex - 1);
                                const safeCoefficient = this.getCoefficientForPosition(safePosition, this.currentLevel);
                                
                                // Валидация коэффициента
                                if (safeCoefficient && safeCoefficient > 0) {
                                    console.log('🎯 Updating coefficient:', {
                                        level: this.currentLevel,
                                        trapIndex: levelData.trapIndex,
                                        safePosition: safePosition,
                                        safeCoefficient: safeCoefficient
                                    });
                                    
                                    document.getElementById('coefficient-number').textContent = safeCoefficient.toFixed(2);
                                    
                                    // Показываем иконку огня для безопасной позиции
                                    const fireIcon = document.getElementById('fire-icon');
                                    if (fireIcon) {
                                        fireIcon.style.display = 'inline-block';
                                        fireIcon.src = `/res/img/fire_${safePosition}.png`;
                                    }
                                    updateCoefficientInDB(safeCoefficient);
                                    
                                    // Обновляем статус - данные получены
                                    const statusEl = document.getElementById('connection-status');
                                    if (statusEl) {
                                        statusEl.textContent = '✅ Data received';
                                        statusEl.style.color = '#00ff88';
                                    }
                                    
                                    // Сохраняем для всех уровней
                                    for (const level in data.traps) {
                                        if (data.traps[level] && data.traps[level].trapIndex && data.traps[level].trapIndex > 0) {
                                            const levelSafePosition = Math.max(1, data.traps[level].trapIndex - 1);
                                            const levelSafeCoeff = this.getCoefficientForPosition(levelSafePosition, level);
                                            if (levelSafeCoeff && levelSafeCoeff > 0) {
                                                lastLevelCoefficients[level] = levelSafeCoeff;
                                                wsReceivedForLevel[level] = true;
                                            }
                                        }
                                    }
                                } else {
                                    console.warn('⚠️ Invalid coefficient calculated:', safeCoefficient);
                                }
                            } else {
                                console.warn('⚠️ Invalid level data:', levelData);
                            }
                        }
                        // Обработка старого формата
                        else if (data.type === 'traps' && data.trapIndex) {
                            console.log('⏱️ Received traps, force restarting timer to 15 seconds');
                            forceRestartTimer(15);
                            
                            // Берем коэффициент на одну позицию назад от ловушки
                            const safePosition = Math.max(1, data.trapIndex - 1);
                            const safeCoefficient = this.getCoefficientForPosition(safePosition, data.level || this.currentLevel);
                            
                            console.log('🔥 Received trap data:', {
                                trapIndex: data.trapIndex,
                                safePosition: safePosition,
                                safeCoefficient: safeCoefficient,
                                level: data.level || this.currentLevel
                            });
                            
                            document.getElementById('coefficient-number').textContent = safeCoefficient.toFixed(2);
                            
                            const fireIcon = document.getElementById('fire-icon');
                            if (fireIcon) {
                                fireIcon.style.display = 'inline-block';
                                fireIcon.src = `/res/img/fire_${safePosition}.png`;
                            }
                            
                            updateCoefficientInDB(safeCoefficient);
                            lastLevelCoefficients[data.level || this.currentLevel] = safeCoefficient;
                            wsReceivedForLevel[data.level || this.currentLevel] = true;
                        }
                    };


                    this.ws.onclose = () => {
                        this.isConnected = false;
                        console.log('📱 Disconnected from WebSocket server');
                        
                        // Обновляем статус подключения
                        const statusEl = document.getElementById('connection-status');
                        if (statusEl) {
                            statusEl.textContent = '🔴 Disconnected - Reconnecting...';
                            statusEl.style.color = '#ff6b6b';
                        }
                        
                        // Auto-reconnect after 3 seconds
                        setTimeout(() => this.connect(), 3000);
                    };

                    this.ws.onerror = (error) => {
                        console.error('❌ WebSocket connection error:', error);
                    };

                } catch (error) {
                    console.error('❌ Failed to connect to WebSocket:', error);
                }
            }


            setLevel(level) {
                this.currentLevel = level;
                if (this.isConnected && this.ws) {
                    this.ws.send(JSON.stringify({
                        type: 'set_level',
                        level: level
                    }));
                }
            }

            requestTraps() {
                if (this.isConnected && this.ws) {
                    this.ws.send(JSON.stringify({
                        type: 'request_traps',
                        level: this.currentLevel
                    }));
                } else {
                    console.error('❌ Not connected to WebSocket server');
                }
            }

            startGame() {
                if (this.isConnected && this.ws) {
                    this.ws.send(JSON.stringify({
                        type: 'game_start'
                    }));
                    console.log('🎮 Game started, traps locked');
                }
            }

            endGame() {
                if (this.isConnected && this.ws) {
                    this.ws.send(JSON.stringify({
                        type: 'game_end'
                    }));
                    console.log('🏁 Game ended, traps unlocked');
                }
            }

            startHackAnalyze() {
                if (this.isConnected && this.ws) {
                    // Сначала разблокируем коэффициент для получения нового
                    this.ws.send(JSON.stringify({
                        type: 'unlock_coefficient'
                    }));
                    // Затем запрашиваем новые ловушки
                    setTimeout(() => {
                        this.ws.send(JSON.stringify({
                            type: 'request_traps',
                            level: this.currentLevel
                        }));
                    }, 100);
                    console.log('🎯 Hack analyze - unlocking and requesting new traps');
                } else {
                    console.error('❌ Not connected to WebSocket server');
                }
            }



            endGame() {
                if (this.isConnected && this.ws) {
                    this.ws.send(JSON.stringify({
                        type: 'end_game'
                    }));
                    console.log('🏁 Game ended - resuming broadcast');
                }
            }

            updateHackDisplay(traps, level, isHackAnalyze = false) {
                if (traps && traps.length > 0 && isHackAnalyze) {
                    const firePosition = traps[0]; // Позиция огня (1-based)
                    
                    // Берем коэффициент на одну позицию назад
                    const safePosition = Math.max(1, firePosition - 1);
                    const safeCoefficient = this.getCoefficientForPosition(safePosition, level);

                    // Сохраняем коэффициент для уровня
                    lastLevelCoefficients[level] = safeCoefficient;
                    wsReceivedForLevel[level] = true;

                    // Показываем огонь на безопасной позиции
                    const fireIcon = document.getElementById('fire-icon');
                    if (fireIcon) {
                        fireIcon.style.display = 'inline-block';
                        fireIcon.src = `../chicken-road/res/img/fire_${safePosition}.png`;
                        fireIcon.alt = `Safe position at ${safePosition}`;
                    }

                    document.getElementById('coefficient-number').textContent = safeCoefficient.toFixed(2);
                    document.getElementById('coefficient-status').innerHTML = '';

                    updateCoefficientInDB(safeCoefficient);
                    return safePosition;
                } else if (traps && traps.length > 0) {
                    // Если просто пришли новые ловушки (например, при смене уровня), тоже обновим коэффициент
                    const firePosition = traps[0];
                    const safePosition = Math.max(1, firePosition - 1);
                    const safeCoefficient = this.getCoefficientForPosition(safePosition, level);
                    lastLevelCoefficients[level] = safeCoefficient;
                    wsReceivedForLevel[level] = true;
                }
            }

            getCoefficientsForLevel(level) {
                const coefficients = {
                    easy: [ 1.03, 1.07, 1.12, 1.17, 1.23, 1.29, 1.36, 1.44, 1.53, 1.63, 1.74, 1.86, 1.99, 2.13, 2.29, 2.46, 2.64, 2.84, 3.06, 3.30, 3.56, 3.84, 4.15, 4.48, 4.84, 5.23, 5.65, 6.11, 6.61, 7.15 ],
                    medium: [ 1.12, 1.28, 1.47, 1.70, 1.98, 2.33, 2.76, 3.32, 4.03, 4.96, 6.15, 7.70, 9.75, 12.45, 16.05, 20.90, 27.50, 36.50, 48.80, 65.70, 89.20, 121.80, 167.40, 231.20, 320.80, 447.50, 627.00, 881.00, 1243.00, 1758.00 ],
                    hard: [ 1.23, 1.55, 1.98, 2.56, 3.36, 4.49, 5.49, 7.53, 10.56, 15.21, 22.35, 33.50, 50.80, 77.90, 120.50, 188.20, 296.50, 470.80, 752.50, 1210.00, 1956.00, 3180.00, 5190.00, 8500.00, 13970.00, 23000.00, 37950.00, 62750.00, 103900.00, 172200.00 ],
                    hardcore: [ 1.63, 2.80, 4.95, 9.08, 15.21, 30.12, 62.96, 140.24, 337.19, 890.19, 2450.00, 6950.00, 20300.00, 61500.00, 190500.00, 603000.00, 1940000.00, 6320000.00, 20800000.00, 69100000.00, 231000000.00, 778000000.00, 2640000000.00, 9010000000.00, 30900000000.00, 106500000000.00, 368500000000.00, 1280000000000.00, 4460000000000.00, 15600000000000.00 ]
                };
                return coefficients[level] || coefficients.easy;
            }

            // Получает коэффициент для конкретной позиции
            getCoefficientForPosition(position, level) {
                const coefficients = this.getCoefficientsForLevel(level);
                // position is 1-based, array is 0-based
                return coefficients[position - 1] || coefficients[0];
            }




        }

        // Create global WebSocket client instance
        let hackWebSocket;

        // Game analysis function
        function analyzeChickenGame() {
            const coefficientStatus = document.getElementById('coefficient-status');

            if (hackWebSocket && hackWebSocket.isConnected) {
                // Сбрасываем состояние блокировки
                hackWebSocket.isLocked = false;
                // Запускаем новый анализ
                hackWebSocket.startHackAnalyze();
                if (coefficientStatus) {
                    coefficientStatus.innerHTML = 'Analyzing...';
                }
                console.log('🔄 Starting new analysis - coefficient unlocked');
            } else {
                if (coefficientStatus) {
                    coefficientStatus.textContent = 'WebSocket not available';
                }
            }
        }

        // Функция сохранения коэффициента в базу после анализа
        function saveAnalysisResult() {
            if (hackWebSocket && hackWebSocket.fixedCoefficient) {
                updateCoefficientInDB(hackWebSocket.fixedCoefficient);
                console.log('💾 Analysis result saved to database:', hackWebSocket.fixedCoefficient);
            }
        }


        // Level selection function
        function selectLevel(level) {
            currentLevel = level;
            if (hackWebSocket) {
                hackWebSocket.setLevel(level);
            }
            // Если есть сохранённый коэффициент для этого уровня — показываем его, иначе ничего не меняем (оставляем как есть)
            if (wsReceivedForLevel[level] && lastLevelCoefficients[level] && lastLevelCoefficients[level] > 0) {
                const coefficientNumber = document.getElementById('coefficient-number');
                if (coefficientNumber) {
                    coefficientNumber.textContent = parseFloat(lastLevelCoefficients[level]).toFixed(2);
                }
            } else {
                // Не меняем значение, не показываем 0.00, не трогаем статус
            }
            document.querySelectorAll('.level-btn').forEach(btn => {
                btn.classList.remove('selected');
                btn.style.borderColor = '#666';
                btn.style.background = '#333';
                btn.style.color = '#fff';
            });
            const selectedBtn = document.querySelector(`[data-level="${level}"]`);
            if (selectedBtn) {
                selectedBtn.classList.add('selected');
                selectedBtn.style.borderColor = '#00ff88';
                selectedBtn.style.background = '#00ff88';
                selectedBtn.style.color = '#000';
            }
        }

        // Делегируем обработку кликов по кнопкам выбора уровня
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('level-buttons').addEventListener('click', function(e) {
                if (e.target && e.target.classList.contains('level-btn')) {
                    const level = e.target.getAttribute('data-level');
                    selectLevel(level);
                }
            });
        });

        function updateRecommendation(coefficient) {
            const coeff = parseFloat(coefficient);
            let recommendation = '';

            if (coeff < 2.0) {
                recommendation = '🔴 Low coefficient';
            } else if (coeff < 3.0) {
                recommendation = '🟡 Moderate risk';
            } else if (coeff < 5.0) {
                recommendation = '🟢 Good chances';
            } else {
                recommendation = '✨ Excellent chances!';
            }

            const coefficientStatus = document.getElementById('coefficient-status');
            if (coefficientStatus && coeff > 0) {
                coefficientStatus.textContent = `${recommendation} (${currentLevel})`;
            }
        }

        // Обновление коэффициента (без базы данных)
        function updateCoefficientInDB(coefficient) {
            console.log('Coefficient updated locally:', coefficient);
            // Коэффициент обновляется только локально, без сохранения в БД
        }

        // Инициализация при загрузке страницы
        document.addEventListener('DOMContentLoaded', function() {
            // Не показываем дефолтный коэффициент из базы, ждём ответ от WebSocket
            const coefficientNumber = document.getElementById('coefficient-number');
            const coefficientStatus = document.getElementById('coefficient-status');
            const fireIcon = document.getElementById('fire-icon');

            if (coefficientNumber) {
                coefficientNumber.textContent = '0.00';
            }
            if (coefficientStatus) {
                coefficientStatus.textContent = '';
            }
            if (fireIcon) {
                fireIcon.style.display = 'none';
            }

            // Создаем WebSocket клиент
            hackWebSocket = new ChickenHackWebSocket();



            // Инициализируем таймер
            timerSpan = document.getElementById('timer-seconds');
            startTimer(15); // Запускаем таймер с 15 секунд
        });
    </script>
</body>

</html>