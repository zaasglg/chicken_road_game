var SETTINGS = {
    w: 800, // будет обновлено при инициализации
    h: 600, // будет обновлено при инициализации 
    start: {
        x: 0, 
        y: 0 
    }, 
    timers: {  
    }, 
    volume: {
        active: +$('body').data('sound'), 
        music: +$('body').data('sound') ? 0.2 : 0, 
        sound: +$('body').data('sound') ? 0.9 : 0
    }, 
    currency: window.GAME_CONFIG ? window.GAME_CONFIG.currency_symbol : ($('body').attr('data-currency') ? $('body').attr('data-currency') : "USD"), 
    cfs: window.CFS || {
        easy: [ 1.03, 1.07, 1.12, 1.17, 1.23, 1.29, 1.36, 1.44, 1.53, 1.63 ],
        medium: [ 1.12, 1.28, 1.47, 1.70, 1.98, 2.33, 2.76, 3.32, 4.03, 4.96 ],
        hard: [ 1.23, 1.55, 1.98, 2.56, 3.36, 4.49, 5.49, 7.53, 10.56, 15.21 ],
        hardcore: [ 1.63, 2.80, 4.95, 9.08, 15.21, 30.12, 62.96, 140.24, 337.19, 890.19 ]
    },  
    chance: {
        easy: [ 7, 23 ], 
        medium: [ 3, 8 ],   // Сложнее: ловушка раньше
        hard: [ 3, 7 ],     // Чуть легче: ловушка чуть позже
        hardcore: [ 2, 5 ]  // Чуть легче: ловушка чуть позже
    },
    min_bet: window.GAME_CONFIG ? window.GAME_CONFIG.min_bet : 0.5, 
    max_bet: window.GAME_CONFIG ? window.GAME_CONFIG.max_bet : 150, 
    segw: parseInt( $('#battlefield .sector').css('width') ),
    // Локальные коэффициенты вместо WebSocket
} 

var SOUNDS = {
    music: new Howl({
        src: ['res/sfx/music.webm'], 
        //autoplay: true, 
        preload: true, 
        html5: true, 
        loop: true, 
        volume: SETTINGS.volume.music 
    }), 
    button: new Howl({
        src: ['res/sfx/button.webm'], 
        //autoplay: true, 
        preload: true, 
        html5: true, 
        loop: false, 
        volume: SETTINGS.volume.sound 
    }), 
    win: new Howl({
        src: ['res/sfx/win.webm'], 
        //autoplay: true, 
        preload: true, 
        html5: true, 
        loop: false, 
        volume: SETTINGS.volume.sound 
    }), 
    lose: new Howl({
        src: ['res/sfx/lose.webm'], 
        //autoplay: true, 
        preload: true, 
        html5: true, 
        loop: false, 
        volume: SETTINGS.volume.sound 
    }), 
    step: new Howl({
        src: ['res/sfx/step.webm'], 
        //autoplay: true, 
        preload: true, 
        html5: true, 
        loop: false, 
        volume: SETTINGS.volume.sound 
    })
}

class Game{
    constructor( $obj ){ 
        // Получаем параметры из URL
        var urlParams = new URLSearchParams(window.location.search);
        var accessTokenParam = urlParams.get('access_token');
        var demoMode = urlParams.get('demo') === 'true';
        var countryParam = urlParams.get('country');
        
        console.log('URL parameters:', {
            access_token: accessTokenParam,
            demo: demoMode,
            country: countryParam,
            full_url: window.location.href
        });
        
        // Сохраняем access_token в глобальной переменной
        if (accessTokenParam) {
            window.ACCESS_TOKEN = accessTokenParam;
            console.log('Access token set from URL:', accessTokenParam);
        }
        
        // Инициализируем window.GAME_CONFIG только если он не существует
        if (!window.GAME_CONFIG) {
            window.GAME_CONFIG = {};
        }
        
        // Настраиваем демо режим
        if (demoMode) {
            console.log('Demo mode activated for country:', countryParam);
            this.setupDemoMode(countryParam);
        } else {
            console.log('Demo mode not activated, checking for fallback...');
            // Проверяем, есть ли другие признаки демо режима
            if (!accessTokenParam && (!window.GAME_CONFIG.is_real_mode && !window.GAME_CONFIG.is_demo_mode)) {
                console.log('No access token and no mode set - activating default demo mode');
                this.setupDemoMode('default');
            }
        }
        
        // Устанавливаем дефолтный баланс (будет обновлен из API)
        this.balance = SETTINGS.balance || this.getDefaultBalanceForCountry();
        
        console.log('Game initialized with access token:', !!window.ACCESS_TOKEN);
        
        this.currency = SETTINGS.currency; 
        this.stp = 0;  
        this.cur_cfs = 'easy'; 
        this.cur_lvl = 'easy'; 
        this.current_bet = 0; 
        this.cur_status = "loading"; 
        this.wrap = $('#battlefield'); 
        this.sectors = []; 
        this.alife = 0; 
        this.win = 0; 
        this.fire = 0; 
        this.traps = null; // for local traps
        this.localTraps = null;
        this.create(); 
        this.bind(); 
        $('#game_container').css('min-height', parseInt( $('#main').css('height') )+'px' );
        
        // Инициализируем кнопки уровней
        this.initializeLevelButtons();
        
        // Принудительно сбрасываем все кнопки при инициализации
        this.resetAllLevelButtons();
        
        // Проверяем кнопки уровней через некоторое время (возможно, они загружаются позже)
        setTimeout(() => {
            console.log('=== DELAYED LEVEL BUTTONS CHECK ===');
            this.initializeLevelButtons();
        }, 2000);
        
        setTimeout(() => {
            console.log('=== SECOND DELAYED LEVEL BUTTONS CHECK ===');
            this.initializeLevelButtons();
        }, 5000);
        
        // Получаем актуальную информацию о пользователе при инициализации
        if (window.ACCESS_TOKEN) {
            console.log('Fetching user info on game initialization...');
            this.fetchUserInfo().then(userInfo => {
                if (!userInfo) {
                    console.log('Failed to fetch user info - falling back to demo mode');
                    // Fallback к демо режиму если API недоступен
                    this.updateSettingsFromConfig();
                }
            });
        } else {
            console.log('No access token - using demo mode');
            // Демо режим - используем дефолтные настройки
            this.updateSettingsFromConfig();
        }
        
        // Принудительная проверка демо режима в конце
        if (demoMode && window.GAME_CONFIG && !window.GAME_CONFIG.is_demo_mode) {
            console.log('Force activating demo mode at the end of constructor');
            this.setupDemoMode(countryParam);
        }
        
        // Инициализируем WebSocket подключение
        this.ws = null;
        this.isWebSocketConnected = false;
        this.reconnectAttempts = 0;
        
        // Подключаемся к WebSocket серверу
        this.connectWebSocket();
        
        // Запускаем периодическое получение ловушек от WebSocket
        this.startWebSocketTrapPolling();
    }
    
    // Метод для получения адаптивного масштаба курицы
    getChickenScale() {
        // Базовая формула масштабирования
        var baseScale = (SETTINGS.segw / (250/100) * (70/100) / 100);
        
        // Определяем, является ли устройство мобильным
        var isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Для мобильных устройств используем более мягкое уменьшение
            var mobileScale = baseScale * 0.8; // Уменьшаем только на 20%
            
            // На очень маленьких экранах делаем еще меньше, но не слишком
            if (window.innerWidth <= 480) {
                mobileScale = baseScale * 0.98; // Уменьшаем на 30%
            }
            
            // На средних мобильных экранах используем почти полный размер
            if (window.innerWidth > 480 && window.innerWidth <= 768) {
                mobileScale = baseScale * 0.85; // Уменьшаем только на 15%
            }
            
            console.log(`Mobile device detected. Base scale: ${baseScale.toFixed(3)}, Mobile scale: ${mobileScale.toFixed(3)}`);
            return mobileScale;
        } else {
            // Для десктопа используем базовую формулу
            console.log(`Desktop device. Scale: ${baseScale.toFixed(3)}`);
            return baseScale;
        }
    }
    
    // Метод для получения дефолтного баланса для страны
    getDefaultBalanceForCountry() {
        const country = window.GAME_CONFIG ? window.GAME_CONFIG.user_country : 'default';
        
        const countryBalances = {
            'Colombia': 2500000,
            'Paraguay': 5000000,
            'Ecuador': 500,
            'Brazil': 2000,
            'Argentina': 15000,
            'Mexico': 10000,
            'Peru': 2000,
            'Chile': 500000,
            'Uruguay': 20000,
            'Bolivia': 3500,
            'Venezuela': 5000000,
            'Guyana': 100000,
            'Suriname': 200000,
            'default': 500
        };
        
        const balance = countryBalances[country] || countryBalances['default'];
        console.log(`Default balance for ${country}: ${balance}`);
        return balance;
    }
    
    // Метод для подключения к WebSocket серверу
    connectWebSocket() {
        try {
            console.log('🔌 Connecting to WebSocket server...');
            // Определяем URL WebSocket сервера
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.hostname;
            const port = window.location.port || (protocol === 'wss:' ? '443' : '80');
            const wsUrl = "wss://chicken.valor-games.com/ws/";
            
            console.log('Connecting to WebSocket:', wsUrl);
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('✅ Connected to WebSocket server');
                this.isWebSocketConnected = true;
                this.reconnectAttempts = 0;
                
                // Устанавливаем уровень по умолчанию
                this.setWebSocketLevel(this.cur_lvl);
                
                // Запрашиваем последние ловушки со всех уровней
                this.requestLastTraps();
                
                // Запрашиваем ловушки для текущего уровня
                this.requestWebSocketTraps();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('📨 WebSocket message received:', data);
                    
                    if (data.type === 'traps') {
                        this.handleWebSocketTrapsData(data);
                    } else if (data.type === 'traps_all_levels') {
                        this.handleWebSocketAllLevelsData(data);
                    }
                } catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error);
                }
            };

            this.ws.onclose = () => {
                console.log('📱 Disconnected from WebSocket server');
                this.isWebSocketConnected = false;
                this.attemptWebSocketReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('❌ WebSocket connection error:', error);
            };

        } catch (error) {
            console.error('❌ Failed to connect to WebSocket:', error);
            this.attemptWebSocketReconnect();
        }
    }

    // Метод для переподключения к WebSocket
    attemptWebSocketReconnect() {
        if (this.reconnectAttempts < 5) {
            this.reconnectAttempts++;
            console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/5)...`);
            
            setTimeout(() => {
                this.connectWebSocket();
            }, 3000);
        } else {
            console.log('❌ Max reconnection attempts reached');
        }
    }

    // Метод для установки уровня в WebSocket
    setWebSocketLevel(level) {
        this.cur_lvl = level;
        if (this.isWebSocketConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.sendWebSocketMessage({
                type: 'set_level',
                level: level
            });
        }
    }

    // Метод для запроса последних ловушек со всех уровней
    requestLastTraps() {
        if (this.isWebSocketConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.sendWebSocketMessage({
                type: 'get_last_traps'
            });
        }
    }

    // Метод для запроса ловушек от WebSocket
    requestWebSocketTraps() {
        if (this.isWebSocketConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.sendWebSocketMessage({
                type: 'request_traps'
            });
        }
    }

    // Метод для отправки сообщения в WebSocket
    sendWebSocketMessage(data) {
        if (this.isWebSocketConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.error('❌ WebSocket not connected, cannot send message');
        }
    }

    // Метод для обработки данных ловушек от WebSocket
    handleWebSocketTrapsData(data) {
        console.log('🎯 Traps data received:', data);
        console.log('Current level in game:', this.cur_lvl);
        console.log('Level from WebSocket:', data.level);
        console.log('Current game status:', this.cur_status);
        
        // Если игра активна, НЕ обновляем данные - сохраняем состояние игры
        if (this.cur_status === 'game') {
            console.log('Game is active, ignoring WebSocket updates to preserve game state');
            return;
        }
        
        // Обновляем ловушки только если игра не активна
        if (data.traps && data.traps.length > 0) {
            if (this.cur_status === 'loading' || this.cur_status === 'ready') {
            this.traps = data.traps;
            this.localTraps = data.traps;
            console.log('Traps updated from WebSocket:', this.traps);
            } else {
                console.log('Game is active, not updating traps. Current status:', this.cur_status);
                console.log('Ignoring new traps:', data.traps);
            }
        }
        
        // Обновляем коэффициенты из sectors данных
        if (data.sectors && data.sectors.length > 0) {
            console.log('Processing sectors data from WebSocket:', data.sectors);
            this.websocketCoefficients = {};
            
            data.sectors.forEach(sector => {
                // sector.position это индекс массива (0-based)
                this.websocketCoefficients[sector.position] = sector.coefficient;
                console.log(`Sector ${sector.position + 1}: coefficient ${sector.coefficient}, isTrap: ${sector.isTrap}`);
            });
            
            console.log('WebSocket coefficients saved:', this.websocketCoefficients);
            console.log('Coefficients array:', Object.values(this.websocketCoefficients));
            
            // Пересоздаем доску только если игра не активна
            if (this.cur_status === 'loading' || this.cur_status === 'ready') {
            console.log('Recreating board with updated WebSocket coefficients...');
            this.createBoard();
            } else {
                console.log('Game is active, not recreating board. Current status:', this.cur_status);
            }
        } else {
            console.log('No sectors data received from WebSocket');
        }
        
        // Принудительно обновляем уровень если он изменился
        if (data.level && data.level !== this.cur_lvl) {
            console.log('Level changed from', this.cur_lvl, 'to', data.level);
            this.cur_lvl = data.level;
        }
    }

    // Метод для обработки данных всех уровней от WebSocket
    handleWebSocketAllLevelsData(data) {
        console.log('🎯 All levels traps data received:', data);
        this.updateAllLevelsTrapsFromWebSocket(data.traps);
    }

    // Метод для периодического получения ловушек от WebSocket
    startWebSocketTrapPolling() {
        console.log('Starting WebSocket trap polling...');
        
        // Сервер автоматически отправляет новые ловушки каждые 30 секунд
        // если нет активных игр, поэтому клиенту не нужно их запрашивать
        console.log('Relying on server automatic broadcasts instead of polling');
        
        // Оставляем интервал для возможных будущих нужд, но не запрашиваем ловушки
        this.trapPollingInterval = setInterval(() => {
            if (this.isWebSocketConnected) {
                console.log('WebSocket connection is active, waiting for server broadcasts...');
            } else {
                console.log('WebSocket not connected');
            }
        }, 30000); // 30 секунд
        
        // Также запрашиваем ловушки при смене уровня
        this.originalSetLevel = this.setLevel;
        this.setLevel = (level) => {
            console.log('=== SETLEVEL CALLED ===');
            console.log('Level changed to:', level);
            console.log('Previous level:', this.cur_lvl);
            this.cur_lvl = level;
            
            // Очищаем существующие WebSocket данные для нового уровня
            this.websocketCoefficients = {};
            this.traps = [];
            this.localTraps = [];
            this.pendingWebSocketData = null;
            console.log('Cleared old data for new level');
            
            // НЕ устанавливаем локальные коэффициенты - ждем WebSocket
            
            if (this.isWebSocketConnected) {
                console.log('WebSocket connected, requesting traps for level:', level);
                this.setWebSocketLevel(level);
                this.requestWebSocketTraps();
            } else {
                // Если WebSocket не подключен, ждем подключения
                console.log('WebSocket not connected, waiting for connection for level:', level);
                this.waitForWebSocketConnection();
            }
            
            // Обновляем активные классы для radio кнопок
            $('input[name="difficulity"]').each(function(){
                var $label = $(this).closest('label');
                $label.removeClass('active selected');
                console.log('setLevel: Removed active classes from:', $label.find('span').text());
            });
            var $selectedLabel = $(`input[name="difficulity"][value="${level}"]`).closest('label');
            $selectedLabel.addClass('active selected');
            console.log('setLevel: Added active classes to:', $selectedLabel.find('span').text());
            console.log('Radio button active classes updated for level:', level);
            
            // Дополнительно принудительно сбрасываем все классы и устанавливаем только нужный
            $('input[name="difficulity"]').prop('checked', false);
            $(`input[name="difficulity"][value="${level}"]`).prop('checked', true);
            
            // Убираем все активные классы со всех лейблов - более агрессивно
            $('#dificulity .radio_buttons label').removeClass('active selected');
            $('#dificulity .radio_buttons label span').css({
                'background': 'transparent',
                'color': 'rgb(142, 143, 154)'
            });
            
            // Добавляем активные классы только к выбранному лейблу
            var $selectedLabel = $(`input[name="difficulity"][value="${level}"]`).closest('label');
            $selectedLabel.addClass('active selected');
            $selectedLabel.find('span').css({
                'background': 'rgb(95, 97, 113)',
                'color': 'rgb(255, 255, 255)'
            });
            
            console.log('Force updated radio button states for level:', level);
            console.log('Selected label:', $selectedLabel.find('span').text());
            
            // Принудительно пересоздаем доску с новыми коэффициентами для уровня
            console.log('Forcing board recreation for level:', level);
            this.createBoard();
            
            // Дополнительно принудительно обновляем коэффициенты
            setTimeout(() => {
                console.log('=== FORCING COEFFICIENT UPDATE AFTER SETLEVEL ===');
                var levelCoeffs = SETTINGS.cfs[level] || SETTINGS.cfs.easy;
                this.websocketCoefficients = {};
                levelCoeffs.forEach((coeff, index) => {
                    this.websocketCoefficients[index] = coeff;
                });
                console.log('Final coefficients for level', level, ':', this.websocketCoefficients);
                this.createBoard();
            }, 100);
            
            console.log('=== SETLEVEL COMPLETED ===');
        };
    }
    
    // Метод для принудительного сброса всех кнопок уровней
    resetAllLevelButtons() {
        console.log('=== RESETTING ALL LEVEL BUTTONS ===');
        
        // Сбрасываем все radio кнопки
        $('input[name="difficulity"]').prop('checked', false);
        
        // Убираем все активные классы
        $('#dificulity .radio_buttons label').removeClass('active selected');
        
        // Принудительно устанавливаем прозрачный фон для всех кнопок
        $('#dificulity .radio_buttons label span').css({
            'background': 'transparent',
            'color': 'rgb(142, 143, 154)'
        });
        
        // Устанавливаем только Easy как активную
        $('input[name="difficulity"][value="easy"]').prop('checked', true);
        $('input[name="difficulity"][value="easy"]').closest('label').addClass('active selected');
        $('input[name="difficulity"][value="easy"]').closest('label').find('span').css({
            'background': 'rgb(95, 97, 113)',
            'color': 'rgb(255, 255, 255)'
        });
        
        console.log('All level buttons reset, Easy set as active');
    }
    
    // Метод для инициализации кнопок уровней
    initializeLevelButtons() {
        console.log('=== INITIALIZING LEVEL BUTTONS ===');
        
        // Проверяем какие кнопки уровней существуют в DOM
        var levelSelectors = [
            '.level-btn',
            '[data-level]',
            '.difficulty-btn',
            '.level-button',
            'button[data-level]',
            '.btn[data-level]'
        ];
        
        levelSelectors.forEach(function(selector) {
            var elements = $(selector);
            console.log(`Selector "${selector}": found ${elements.length} elements`);
            if (elements.length > 0) {
                elements.each(function(index) {
                    var level = $(this).data('level') || $(this).attr('data-level');
                    console.log(`  Element ${index}: level="${level}", text="${$(this).text()}"`);
                });
            }
        });
        
        // Устанавливаем активную radio кнопку для текущего уровня
        $('input[name="difficulity"]').prop('checked', false);
        
        // Снимаем активные классы со всех radio кнопок
        $('input[name="difficulity"]').each(function(){
            var $label = $(this).closest('label');
            $label.removeClass('active selected');
            console.log('Initialization: Removed active classes from:', $label.find('span').text());
        });
        
        var currentLevelRadio = $(`input[name="difficulity"][value="${this.cur_lvl}"]`);
        if (currentLevelRadio.length > 0) {
            currentLevelRadio.prop('checked', true);
            // Добавляем активный класс к выбранной кнопке
            var $selectedLabel = currentLevelRadio.closest('label');
            $selectedLabel.addClass('active selected');
            console.log('Initialization: Added active classes to:', $selectedLabel.find('span').text());
            console.log('Active level radio button set for:', this.cur_lvl);
        } else {
            console.log('No level radio button found for level:', this.cur_lvl);
        }
        
        // Также обновляем обычные кнопки если они есть
        $('.level-btn').removeClass('selected').css({
            'background': '#333',
            'color': '#fff',
            'border-color': '#666'
        });
        
        var currentLevelBtn = $(`.level-btn[data-level="${this.cur_lvl}"]`);
        if (currentLevelBtn.length > 0) {
            currentLevelBtn.addClass('selected').css({
                'background': '#00ff88',
                'color': '#000',
                'border-color': '#00ff88'
            });
            console.log('Active level button set for:', this.cur_lvl);
        }
        
        console.log('Level buttons initialized for level:', this.cur_lvl);
        console.log('=== LEVEL BUTTONS INITIALIZATION COMPLETED ===');
    }
    
    // Метод для остановки периодического получения ловушек
    stopWebSocketTrapPolling() {
        if (this.trapPollingInterval) {
            clearInterval(this.trapPollingInterval);
            this.trapPollingInterval = null;
        }
    }
    
    // Метод для настройки демо режима
    setupDemoMode(country) {
        console.log('=== SETUP DEMO MODE START ===');
        console.log('Country parameter:', country);
        
        const demoConfigs = {
            'Colombia': {
                currency: 'COP',
                balance: 2500000,
                quick_bets: [25000, 50000, 100000, 350000],
                min_bet: 1000,
                max_bet: 700000,
                default_bet: 25000
            },
            'Paraguay': {
                currency: 'PYG',
                balance: 5000000,
                quick_bets: [50000, 100000, 200000, 700000],
                min_bet: 1000,
                max_bet: 1500000,
                default_bet: 50000
            },
            'Ecuador': {
                currency: 'USD',
                balance: 500,
                quick_bets: [0.5, 1, 2, 7],
                min_bet: 0.5,
                max_bet: 150,
                default_bet: 0.5
            },
            'Brazil': {
                currency: 'BRL',
                balance: 2000,
                quick_bets: [20, 50, 100, 350],
                min_bet: 10,
                max_bet: 1000,
                default_bet: 20
            },
            'Argentina': {
                currency: 'ARS',
                balance: 15000,
                quick_bets: [150, 300, 600, 2100],
                min_bet: 50,
                max_bet: 5000,
                default_bet: 150
            },
            'Mexico': {
                currency: 'MXN',
                balance: 10000,
                quick_bets: [100, 200, 400, 1400],
                min_bet: 50,
                max_bet: 3000,
                default_bet: 100
            },
            'Peru': {
                currency: 'PEN',
                balance: 2000,
                quick_bets: [20, 50, 100, 350],
                min_bet: 10,
                max_bet: 1000,
                default_bet: 20
            },
            'Chile': {
                currency: 'CLP',
                balance: 500000,
                quick_bets: [5000, 10000, 20000, 70000],
                min_bet: 1000,
                max_bet: 200000,
                default_bet: 5000
            },
            'Uruguay': {
                currency: 'UYU',
                balance: 20000,
                quick_bets: [200, 400, 800, 2800],
                min_bet: 100,
                max_bet: 10000,
                default_bet: 200
            },
            'Bolivia': {
                currency: 'BOB',
                balance: 3500,
                quick_bets: [35, 70, 140, 490],
                min_bet: 10,
                max_bet: 2000,
                default_bet: 35
            },
            'Venezuela': {
                currency: 'VES',
                balance: 5000000,
                quick_bets: [50000, 100000, 200000, 700000],
                min_bet: 10000,
                max_bet: 2000000,
                default_bet: 50000
            },
            'Guyana': {
                currency: 'GYD',
                balance: 100000,
                quick_bets: [1000, 2000, 4000, 14000],
                min_bet: 500,
                max_bet: 50000,
                default_bet: 1000
            },
            'Suriname': {
                currency: 'SRD',
                balance: 200000,
                quick_bets: [2000, 4000, 8000, 28000],
                min_bet: 1000,
                max_bet: 100000,
                default_bet: 2000
            },
            'default': {
                currency: 'USD',
                balance: 500,
                quick_bets: [0.5, 1, 2, 7],
                min_bet: 0.5,
                max_bet: 150,
                default_bet: 0.5
            }
        };
        
        const config = demoConfigs[country] || demoConfigs['default'];
        console.log('Selected config:', config);
        
        // Устанавливаем демо конфигурацию
        window.GAME_CONFIG = {
            is_real_mode: false,
            is_demo_mode: true,
            user_country: country || 'default',
            currency_symbol: config.currency,
            initial_balance: config.balance,
            demo_config: config
        };
        
        // Устанавливаем глобальную переменную для быстрой проверки
        window.IS_DEMO_MODE = true;
        
        // Устанавливаем баланс
        this.balance = config.balance;
        console.log('Balance set in setupDemoMode:', this.balance);
        
        // Обновляем настройки игры
        SETTINGS.currency = config.currency;
        SETTINGS.min_bet = config.min_bet;
        SETTINGS.max_bet = config.max_bet;
        
        console.log('Demo mode configured:', {
            country: country,
            currency: config.currency,
            balance: config.balance,
            config: config,
            GAME_CONFIG: window.GAME_CONFIG,
            SETTINGS_currency: SETTINGS.currency
        });
        
        // Обновляем интерфейс
        this.updateDemoInterface(config);
        
        // Принудительно обновляем баланс в интерфейсе
        this.updateBalanceDisplay();
        
        console.log('=== SETUP DEMO MODE END ===');
    }
    
    // Метод для обновления интерфейса в демо режиме
    updateDemoInterface(config) {
        console.log('=== UPDATE DEMO INTERFACE START ===');
        console.log('Config:', config);
        
        // Обновляем отображение баланса
        var formattedBalance = this.formatBalance(config.balance, config.currency);
        console.log('Formatted balance:', formattedBalance);
        // Не обновляем здесь, чтобы избежать дублирования с updateBalanceDisplay
        
        // Обновляем SVG символы валюты
        $('svg use').attr('xlink:href', './res/img/currency.svg#' + config.currency);
        console.log('Updated currency SVG to:', config.currency);
        
        // Обновляем быстрые ставки
        this.updateQuickBets(config.currency, config.quick_bets);
        
        // Обновляем кнопки MIN/MAX
        this.updateMinMaxButtons(config);
        
        // Обновляем поле ставки
        $('#bet_size').val(config.default_bet);
        
        console.log('Demo interface updated for currency:', config.currency);
        console.log('=== UPDATE DEMO INTERFACE END ===');
    }
    
    // Метод для форматирования баланса в зависимости от валюты
    formatBalance(balance, currency) {
        if (currency === 'USD') {
            return balance.toFixed(2);
        } else {
            // Для COP и PYG показываем полное число без десятичных знаков
            return balance.toLocaleString('en-US', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0,
                useGrouping: true
            });
        }
    }
    
    // Метод для обновления отображения баланса с правильным форматированием
    updateBalanceDisplay() {
        var currency = SETTINGS.currency;
        var formattedBalance = this.formatBalance(this.balance, currency);
        
        // Обновляем только если значение изменилось
        var currentDisplay = $('[data-rel="menu-balance"] span').html();
        if (currentDisplay !== formattedBalance) {
            console.log('Updating balance display:', {
                old: currentDisplay,
                new: formattedBalance,
                balance: this.balance,
                currency: currency,
                is_demo: window.IS_DEMO_MODE
            });
            $('[data-rel="menu-balance"] span').html(formattedBalance);
        }
    }
    
    // Метод для обновления настроек из конфигурации
    updateSettingsFromConfig() {
        // Не обновляем настройки если уже установлен демо режим
        if (window.GAME_CONFIG && window.GAME_CONFIG.is_demo_mode) {
            console.log('Demo mode already active, skipping updateSettingsFromConfig');
            return;
        }
        
        if (window.GAME_CONFIG && window.GAME_CONFIG.is_real_mode) {
            // Получаем настройки ставок для страны из API
            var country = window.GAME_CONFIG.user_country || 'default';
            var betConfig = this.getBetConfigForCountry(country);
            
            SETTINGS.min_bet = betConfig.min_bet;
            SETTINGS.max_bet = betConfig.max_bet;
            SETTINGS.currency = window.GAME_CONFIG.currency_symbol || betConfig.currency;
            
            console.log('Settings updated from config (real mode):', {
                country: country,
                min_bet: SETTINGS.min_bet,
                max_bet: SETTINGS.max_bet,
                currency: SETTINGS.currency,
                game_config: window.GAME_CONFIG
            });
            
            // Обновляем значения кнопок MIN/MAX
            this.updateMinMaxButtons();
        } else {
            // Демо режим - используем дефолтные настройки USD
            console.log('Demo mode - using default USD settings');
            SETTINGS.min_bet = 0.5;
            SETTINGS.max_bet = 150;
            SETTINGS.currency = 'USD';
            
            // Обновляем значения кнопок MIN/MAX
            this.updateMinMaxButtons();
            
            // Обновляем быстрые ставки для демо режима
            this.updateQuickBets('USD');
        }
    }
    
    // Метод для получения конфигурации ставок для страны
    getBetConfigForCountry(country) {
        const betConfigs = {
            'Colombia': {
                currency: 'COP',
                quick_bets: [2500, 5000, 10000, 35000],
                min_bet: 1000,
                max_bet: 700000,
                default_bet: 2500
            },
            'Paraguay': {
                currency: 'PYG',
                quick_bets: [5000, 10000, 20000, 70000],
                min_bet: 1000,
                max_bet: 1500000,
                default_bet: 5000
            },
            'default': {
                currency: 'USD',
                quick_bets: [0.5, 1, 2, 7],
                min_bet: 0.5,
                max_bet: 150,
                default_bet: 0.5
            }
        };
        
        return betConfigs[country] || betConfigs['default'];
    }
    
    // Метод для обновления быстрых ставок
    updateQuickBets(currency, customQuickBets = null) {
        var country = window.GAME_CONFIG ? window.GAME_CONFIG.user_country : 'default';
        var betConfig = this.getBetConfigForCountry(country);
        var quickBets = customQuickBets || betConfig.quick_bets;
        
        console.log('Updating quick bets for country:', country, 'currency:', currency, 'bets:', quickBets);
        
        // Обновляем быстрые ставки в интерфейсе
        $('.basic_radio').empty();
        
        quickBets.forEach((betValue, index) => {
            var formattedValue = this.formatBetValue(betValue, currency);
            var quickBetHtml = `
                <label class="gray_input">
                    <input type="radio" name="bet_value" value="${betValue}" autocomplete="off" ${index === 0 ? 'checked' : ''}>
                    <span>${formattedValue}</span>
                    <svg width="18" height="18" viewBox="0 0 18 18" style="fill: rgb(255, 255, 255);">
                        <use xlink:href="./res/img/currency.svg#${currency}"></use>
                    </svg>
                </label>
            `;
            $('.basic_radio').append(quickBetHtml);
        });
        
        // Переустанавливаем обработчики событий для новых быстрых ставок
        this.bindQuickBetHandlers();
        
        console.log('Quick bets updated successfully');
    }
    
    // Метод для форматирования значения ставки
    formatBetValue(value, currency) {
        if (currency === 'USD') {
            return value.toFixed(2);
        } else {
            // Для COP и PYG показываем полное число без десятичных знаков
            return value.toLocaleString('en-US', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0,
                useGrouping: true
            });
        }
    }
    
    // Метод для установки обработчиков быстрых ставок
    bindQuickBetHandlers() {
        $('.basic_radio input[name="bet_value"]').off().on('change', function(){
            if( GAME.cur_status == 'loading' ){
                if( SETTINGS.volume.sound ){ SOUNDS.button.play(); } 
                var $self=$(this); 
                var $val = parseFloat($self.val());
                $('#bet_size').val( $val );
                console.log('Quick bet selected:', $val);
            }
        });
    }
    
    // Метод для обновления кнопок MIN/MAX
    updateMinMaxButtons(customConfig = null) {
        // Получаем значения из API или data-атрибутов HTML
        var country = window.GAME_CONFIG ? window.GAME_CONFIG.user_country : 'default';
        var betConfig = customConfig || this.getBetConfigForCountry(country);
        
        var minBet = betConfig.min_bet;
        var maxBet = betConfig.max_bet;
        var defaultBet = betConfig.default_bet;
        
        // Обновляем data-атрибуты с новыми значениями
        $('#bet_size').attr('data-min-bet', minBet);
        $('#bet_size').attr('data-max-bet', maxBet);
        $('#bet_size').attr('data-default-bet', defaultBet);
        
        // Обновляем поле ввода ставки правильным значением по умолчанию
        $('#bet_size').val(defaultBet);
        
        // Обновляем обработчики кнопок с новыми значениями
        $('.bet_value_wrapper button[data-rel="min"]').off('click').on('click', function() {
            if (GAME.cur_status == 'loading') {
                if (SETTINGS.volume.sound) SOUNDS.button.play();
                $('#bet_size').val(minBet);
                console.log('MIN button clicked, setting bet to:', minBet);
            }
        });
        
        $('.bet_value_wrapper button[data-rel="max"]').off('click').on('click', function() {
            if (GAME.cur_status == 'loading') {
                if (SETTINGS.volume.sound) SOUNDS.button.play();
                var finalMaxBet = Math.min(maxBet, GAME.balance);
                $('#bet_size').val(finalMaxBet);
                console.log('MAX button clicked, setting bet to:', finalMaxBet);
            }
        });
        
        console.log('Min/Max buttons updated with values from HTML:', {
            min: minBet,
            max: maxBet,
            default: defaultBet,
            country: window.GAME_CONFIG ? window.GAME_CONFIG.user_country : 'unknown'
        });
    } 
    // Отключено - используем только WebSocket ловушки
    generateLocalTraps() {
        console.log('Local trap generation disabled - using only WebSocket traps');
        // Не генерируем локальные ловушки
            return;
        }
        
    // Генерируем сложные ловушки для Hard, Medium и Hardcore уровней
    generateFallbackTraps() {
        console.log('Generating difficult traps for level:', this.cur_lvl);
        
        // Генерируем ловушки только для сложных уровней
        if (['medium', 'hard', 'hardcore'].includes(this.cur_lvl)) {
            var chanceSettings = SETTINGS.chance[this.cur_lvl];
            var traps = [];
            
            // Генерируем основную ловушку
            var mainTrap = Math.ceil(Math.random() * (chanceSettings[1] - chanceSettings[0] + 1)) + chanceSettings[0] - 1;
            traps.push(mainTrap);
            
            // Для Hard добавляем дополнительную ловушку (50% шанс)
            if (this.cur_lvl === 'hard' && Math.random() < 0.5) {
                var secondTrap = Math.ceil(Math.random() * (chanceSettings[1] - chanceSettings[0] + 1)) + chanceSettings[0] - 1;
                // Убеждаемся, что вторая ловушка не совпадает с первой
                while (secondTrap === mainTrap) {
                    secondTrap = Math.ceil(Math.random() * (chanceSettings[1] - chanceSettings[0] + 1)) + chanceSettings[0] - 1;
                }
                traps.push(secondTrap);
            }
            
            // Для Hardcore добавляем вторую ловушку (70% шанс)
            if (this.cur_lvl === 'hardcore' && Math.random() < 0.7) {
                var secondTrap = Math.ceil(Math.random() * (chanceSettings[1] - chanceSettings[0] + 1)) + chanceSettings[0] - 1;
                // Убеждаемся, что вторая ловушка не совпадает с первой
                while (secondTrap === mainTrap) {
                    secondTrap = Math.ceil(Math.random() * (chanceSettings[1] - chanceSettings[0] + 1)) + chanceSettings[0] - 1;
                }
                traps.push(secondTrap);
            }
            
            this.traps = traps;
            this.localTraps = traps;
            console.log(`Generated ${traps.length} traps for ${this.cur_lvl}:`, traps);
        } else {
            console.log('Easy level - no additional traps generated');
        }
    }
    
    
    waitForWebSocketConnection() {
        console.log('Waiting for WebSocket connection...');
        
        // Проверяем подключение каждые 500ms
        const checkConnection = () => {
            if (this.isWebSocketConnected) {
                console.log('WebSocket connected! Requesting traps...');
                this.requestWebSocketTraps();
            } else {
                // Продолжаем ждать подключения
                setTimeout(checkConnection, 500);
            }
        };
        
        checkConnection();
    }
    
    getCoefficientArray() {
        // Используем только коэффициенты из WebSocket
        if (this.websocketCoefficients && Object.keys(this.websocketCoefficients).length > 0) {
            return Object.values(this.websocketCoefficients);
        }
        
        // Если WebSocket коэффициентов нет, возвращаем пустой массив
        console.warn('No WebSocket coefficients available in getCoefficientArray()');
        return [];
    }
    
    getCoefficient(step) {
        // Проверяем на отрицательные значения
        if (step < 0) {
            step = 0;
        }
        
        // Используем только коэффициент из WebSocket
        if (this.websocketCoefficients && this.websocketCoefficients[step] !== undefined) {
            return this.websocketCoefficients[step];
        }
        
        // Если WebSocket коэффициента нет, возвращаем 0
        console.warn(`No WebSocket coefficient available for step ${step}`);
        return 0;
    }
    
    // Метод для правильного позиционирования курицы
    positionChicken() {
        // Ждем, пока DOM обновится
        setTimeout(() => {
            // Сначала удаляем все существующие элементы курицы
            $('#chick').remove();
            
            // Создаем новую курицу
            this.wrap.append(`<div id="chick" state="idle"><div class="inner"></div></div>`);
            
            const $chick = $('#chick');
            if ($chick.length) {
                // Получаем адаптивный масштаб
                var scale = this.getChickenScale();
                
                // Устанавливаем правильное позиционирование
                $chick.css({
                    'position': 'absolute',
                    'bottom': '50px',
                    'left': (SETTINGS.segw / 2) + 'px',
                    'z-index': '10'
                });
                
                // Применяем масштабирование
                $chick.find('.inner').css('transform', 'translateX(-50%) scale(' + scale + ')');
                
                // Убеждаемся, что курица видна и в правильном состоянии
                $chick.show().attr('state', 'idle');
                console.log('Chicken positioned at:', $chick.css('left'), $chick.css('bottom'), 'Scale:', scale);
            } else {
                console.error('Chicken element not found in DOM');
            }
        }, 100);
    }
    
    // Метод для очистки дубликатов курицы
    cleanupDuplicateChickens() {
        var $allChicks = $('#chick');
        if ($allChicks.length > 1) {
            console.warn('Found', $allChicks.length, 'chicken elements, removing duplicates');
            $allChicks.slice(1).remove(); // Удаляем все кроме первого
            return true; // Возвращаем true если были найдены дубликаты
        }
        return false; // Возвращаем false если дубликатов не было
    }
    
    create(){
        console.log('Creating game board...');
        this.traps = null;
        this.isMoving = false; // Сбрасываем флаг движения
        this.wrap.html('').css('left', 0);
        
        // Удаляем все существующие элементы курицы и огня
        $('#chick').remove();
        $('#fire').remove();
        
        // Проверяем WebSocket подключение
        if (this.isWebSocketConnected) {
            console.log('Using WebSocket for trap generation');
            this.requestWebSocketTraps();
            // Создаем поле сразу, ловушки обновятся через WebSocket
            this.createBoard();
        } else {
            console.log('WebSocket not connected - waiting for connection...');
            // Ждем подключения к WebSocket
            this.waitForWebSocketConnection();
            // Создаем поле с пустыми ловушками, они обновятся когда WebSocket подключится
        this.createBoard();
        }
        console.log('Game board creation completed');
    }
    createBoard() {
        console.log('=== CREATEBOARD CALLED ===');
        console.log('Current level:', this.cur_lvl);
        console.log('WebSocket coefficients available:', !!(this.websocketCoefficients && Object.keys(this.websocketCoefficients).length > 0));
        
        // Используем только WebSocket коэффициенты
        if (this.websocketCoefficients && Object.keys(this.websocketCoefficients).length > 0) {
            console.log('Using WebSocket coefficients for board creation');
            console.log('WebSocket coefficients:', this.websocketCoefficients);
            console.log('WebSocket coefficients array:', Object.values(this.websocketCoefficients));
        } else {
            console.log('No WebSocket coefficients available - waiting for WebSocket data');
            // Не создаем fallback коэффициенты - ждем WebSocket
            return;
        }
        
        // Проверяем, что коэффициенты правильно применены
        console.log('Final coefficients being used:', this.websocketCoefficients);
        console.log('Final coefficients array:', Object.values(this.websocketCoefficients));
        
        // Проверяем, что ловушки сгенерированы
        if (!this.traps || this.traps.length === 0) {
            // Используем пустой массив ловушек
            this.traps = [];
        }
        
        var $arr = this.getCoefficientArray(); 
        
        this.stp = 0; // Reset step on new board
        this.alife = 0;
        this.win = 0;
        this.fire = 0;
        // Remove old chick and fire if present
        $('#chick').remove();
        $('#fire').remove();
        this.wrap.html('');
        this.wrap.append(`<div class="sector start" data-id="0">
                                <div class="breaks" breaks="3"></div>
                                <div class="breaks" breaks="2"></div>
                                <img src="./res/img/arc.png" class="entry" alt="">
                                <div class="border"></div>
                            </div>`); 
        var flameSegments = [];
        console.log('Current traps array:', this.traps);
        console.log('Current localTraps array:', this.localTraps);
        
        // Используем WebSocket ловушки или генерируем локальные для сложных уровней
        if (this.traps && this.traps.length > 0) {
            flameSegments = this.traps;
            this.fire = this.traps[0];
            console.log('Using traps from WebSocket:', flameSegments);
        } else if (['medium', 'hard', 'hardcore'].includes(this.cur_lvl)) {
            // Генерируем локальные ловушки для сложных уровней
            this.generateFallbackTraps();
            if (this.traps && this.traps.length > 0) {
                flameSegments = this.traps;
                this.fire = this.traps[0];
                console.log('Using generated difficult traps:', flameSegments);
            } else {
                flameSegments = [];
                this.fire = 0;
                console.log('Failed to generate difficult traps');
            }
        } else {
            // Для Easy уровня создаем доску без ловушек
            flameSegments = [];
            this.fire = 0;
            console.log('Easy level - creating board without traps');
        }
        
        console.log('Fire position:', this.fire, 'Flame segments:', flameSegments);
        
        for( var $i=0; $i<$arr.length; $i++ ){
            // Determine if this sector is a flame - сектора нумеруются с 1, но массив с 0
            var sectorId = $i + 1;
            // Проверяем ловушки: flameSegments содержит позиции ловушек (1-based)
            var isFlame = flameSegments.includes(sectorId);
            var coeff = $arr[$i];
            console.log('Sector', sectorId, 'isFlame:', isFlame, 'coeff:', coeff, 'flameSegments:', flameSegments);
            this.wrap.append(`<div class="sector${ $i == $arr.length-1 ? ' finish' : ($i ? ' far' : '') }" data-id="${ $i+1 }"${ isFlame ? ' flame="1"' : '' } style="position: relative;">
                <div class="coincontainer" style="position: absolute; bottom: 30%; left: 0; width: 100%;">
                    ${$i == $arr.length-1 ? `
                        <img src="./res/img/bet5.png" alt="" class="coin e">
                        <img src="./res/img/bet6.png" alt="" class="coin f">
                        <img src="./res/img/bet7.png" alt="" class="coin g">
                    ` : `
                        <img src="./res/img/betbg.png" alt="" class="coinwrapper">
                        <img src="./res/img/bet1.png" alt="" class="coin a" data-id="1">
                        <img src="./res/img/bet2.png" alt="" class="coin b" data-id="2">
                        <img src="./res/img/bet3.png" alt="" class="coin c" data-id="3">
                        <img src="./res/img/bet4.png" alt="" class="coin d" data-id="4">
                    `}
                    <span>${ coeff }x</span>
                </div>
                ${$i == $arr.length-1 ? `
                    <div class="breaks" breaks="6"></div>
                    <div class="breaks" breaks="5"></div>
                    <img src="./res/img/arc2.png" class="arc" alt="">
                    <img src="./res/img/stand.png" class="cup" alt="">
                    <div class="finish_light"></div>
                    <img src="./res/img/trigger.png" class="trigger" alt="">
                    <div class="flame"></div>
                    <div class="border"></div>
                ` : `
                    <div class="breaks" breaks="4"></div>
                    <div class="breaks" breaks="5"></div>
                    <div class="breaks"></div>
                    <img src="./res/img/frame.png" class="frame" alt="">
                    <img src="./res/img/trigger.png" class="trigger" alt="">
                    <div class="place_light"></div>
                    <div class="flame"></div>
                    <div class="border"></div>
                `}
            </div>`);
        }
        this.wrap.append(`<div class="sector closer" data-id="${ $arr.length+1 }">
                            <div class="border"></div>
                        </div>`); 

        // Курица уже создана в методе create(), не создаем повторно
        this.wrap.append(`<div id="fire"></div>`); 
        var $flame_x = document.querySelector('.sector[flame="1"]'); 
        $flame_x = $flame_x ? $flame_x.offsetLeft : 0; 
        $('#fire').css('left', $flame_x +'px')

        SETTINGS.segw = parseInt( $('#battlefield .sector').css('width') );
        
        // Убеждаемся, что курица правильно позиционирована
        this.positionChicken(); 

        var $scale = this.getChickenScale();
        $('#chick').css( 'left', ( SETTINGS.segw / 2 )+'px' );
        $('#chick .inner').css( 'transform', 'translateX(-50%) scale('+ $scale +')' ); 
        var $bottom = 50; 
        if( SETTINGS.w <= 1200 ){ $bottom = 35; }
        if( SETTINGS.w <= 1100 ){ $bottom = 30; }
        if( SETTINGS.w <= 1000 ){ $bottom = 25; }
        if( SETTINGS.w <= 900 ){ $bottom = 5; }
        if( SETTINGS.w <= 800 ){ $bottom = -15; }
        $('#chick').css('bottom', $bottom+'px');

        // Reset all sector classes
        $('.sector').removeClass('active complete dead win lose');
        // Set start sector as active
        $('.sector.start').addClass('active');

        $('.sector').each(function(){
            var $self = $(this); 
            var $id = $self.data('id');
            $('.breaks', $self).each(function(){
                var $br = $id ? ( Math.round( Math.random() * 12 ) + 4 ) : ( Math.round( Math.random() * 3 ) );
                $(this).attr('breaks', $br );
            });
        });
    }
    createFallback(){
        // Используем только WebSocket коэффициенты
        var $arr = this.getCoefficientArray(); 
        if ($arr.length === 0) {
            console.log('No WebSocket coefficients available for createFallback - skipping');
            return;
        } 
        this.wrap.append(`<div class="sector start" data-id="0">
                                <div class="breaks" breaks="3"></div>
                                <div class="breaks" breaks="2"></div>
                                <img src="./res/img/arc.png" class="entry" alt="">
                                <div class="border"></div>
                            </div>`); 
        // Используем WebSocket ловушки или генерируем локальные для сложных уровней
        var flameSegments = [];
        if (this.traps && this.traps.length > 0) {
            flameSegments = this.traps;
            this.fire = this.traps[0];
            console.log('createFallback - Using traps from WebSocket:', flameSegments);
        } else if (['medium', 'hard', 'hardcore'].includes(this.cur_lvl)) {
            // Генерируем локальные ловушки для сложных уровней
            this.generateFallbackTraps();
            if (this.traps && this.traps.length > 0) {
                flameSegments = this.traps;
                this.fire = this.traps[0];
                console.log('createFallback - Using generated difficult traps:', flameSegments);
        } else {
                flameSegments = [];
                this.fire = 0;
                console.log('createFallback - Failed to generate difficult traps');
            }
        } else {
            // Для Easy уровня создаем доску без ловушек
            flameSegments = [];
            this.fire = 0;
            console.log('createFallback - Easy level, creating board without traps');
        }
        
        console.log('createFallback - Fire position:', this.fire, 'Flame segments:', flameSegments); 
        for( var $i=0; $i<$arr.length; $i++ ){
            // Проверяем, является ли этот сектор ловушкой
            var sectorId = $i + 1;
            var isFlame = flameSegments.includes(sectorId);
            
            if( $i == $arr.length - 1 ){
                this.wrap.append(`<div class="sector finish" data-id="${ $i+1 }" ${ isFlame ? 'flame="1"' : '' } style="position: relative;">
                                        <div class="coincontainer" style="position: absolute; bottom: 30%; left: 0; width: 100%;">
                                            <img src="./res/img/bet5.png" alt="" class="coin e">
                                            <img src="./res/img/bet6.png" alt="" class="coin f">
                                            <img src="./res/img/bet7.png" alt="" class="coin g">
                                            <span>${ $arr[ $i ] }x</span>
                                        </div>
                                        <div class="breaks" breaks="6"></div>
                                        <div class="breaks" breaks="5"></div>
                                        <img src="./res/img/arc2.png" class="arc" alt="">
                                        <img src="./res/img/stand.png" class="cup" alt="">
                                        <div class="finish_light"></div>
                                        <img src="./res/img/trigger.png" class="trigger" alt="">
                                        <div class="flame"></div>
                                        <div class="border"></div>
                                    </div>`);
            } 
            else {
                this.wrap.append(`<div class="sector ${ $i ? 'far' : '' }" data-id="${ $i+1 }" ${ isFlame ? 'flame="1"' : '' } style="position: relative;">
                                        <div class="breaks" breaks="4"></div>
                                        <div class="breaks" breaks="5"></div>
                                        <div class="coincontainer" style="position: absolute; bottom: 0; left: 0; width: 100%;">
                                            <img src="./res/img/betbg.png" alt="" class="coinwrapper">
                                            <img src="./res/img/bet1.png" alt="" class="coin a" data-id="1">
                                            <img src="./res/img/bet2.png" alt="" class="coin b" data-id="2">
                                            <img src="./res/img/bet3.png" alt="" class="coin c" data-id="3">
                                            <img src="./res/img/bet4.png" alt="" class="coin d" data-id="4"> 
                                            <span>${ $arr[ $i ] }x</span>
                                        </div>
                                        <div class="breaks"></div>
                                        <img src="./res/img/frame.png" class="frame" alt="">
                                        <img src="./res/img/trigger.png" class="trigger" alt="">
                                        <!--img src="./res/img/lights2.png" class="lights" alt=""-->
                                        <div class="place_light"></div>
                                        <div class="flame"></div>
                                        <div class="border"></div>
                                    </div>`); 
            }
        } 
        this.wrap.append(`<div class="sector closer" data-id="${ $arr.length+1 }">
                            <div class="border"></div>
                        </div>`); 

        // Курица уже создана в методе create(), не создаем повторно
        this.wrap.append(`<div id="fire"></div>`); 
        var $flame_x = document.querySelector('.sector[flame="1"]'); 
        $flame_x = $flame_x ? $flame_x.offsetLeft : 0; 
        $('#fire').css('left', $flame_x +'px')

        SETTINGS.segw = parseInt( $('#battlefield .sector').css('width') ); 

        var $scale = this.getChickenScale();
        $('#chick').css( 'left', ( SETTINGS.segw / 2 )+'px' );
        $('#chick .inner').css( 'transform', 'translateX(-50%) scale('+ $scale +')' ); 
        var $bottom = 50; 
        if( SETTINGS.w <= 1200 ){ $bottom = 35; }
        if( SETTINGS.w <= 1100 ){ $bottom = 30; }
        if( SETTINGS.w <= 1000 ){ $bottom = 25; }
        if( SETTINGS.w <= 900 ){ $bottom = 5; }
        if( SETTINGS.w <= 800 ){ $bottom = -15; }
        $('#chick').css('bottom', $bottom+'px');

        $('.sector').each(function(){
            var $self = $(this); 
            var $id = $self.data('id');
            $('.breaks', $self).each(function(){
                var $br = $id ? ( Math.round( Math.random() * 12 ) + 4 ) : ( Math.round( Math.random() * 3 ) );
                $(this).attr('breaks', $br );
            });
        });
    }
    refreshBalance() {
        // Не обновляем баланс из DOM если активен демо режим
        if (window.IS_DEMO_MODE || (window.GAME_CONFIG && window.GAME_CONFIG.is_demo_mode)) {
            console.log('Demo mode active, skipping balance refresh from DOM');
            return this.balance;
        }
        
        // Дополнительная проверка - если баланс больше 1000, вероятно это демо режим
        if (this.balance && this.balance > 1000) {
            console.log('Large balance detected, likely demo mode - skipping refresh');
            return this.balance;
        }
        
        const balanceElement = $('[data-rel="menu-balance"] span');
        const balanceText = balanceElement.length > 0 ? balanceElement.html() : '0';
        this.balance = parseFloat(balanceText) || 0;
        console.log('Balance refreshed from DOM:', this.balance);
        return this.balance;
    }
    
    start(){ 
        console.log('GAME.start() called');
        // Refresh balance from DOM before starting (only if not in demo mode)
        if (!window.IS_DEMO_MODE && (!window.GAME_CONFIG || !window.GAME_CONFIG.is_demo_mode)) {
        this.refreshBalance();
        } else {
            console.log('Demo mode active, skipping balance refresh in start()');
        }
        this.current_bet = +$('#bet_size').val();
        
        // Проверяем и исправляем баланс в демо режиме
        if (window.IS_DEMO_MODE && (!this.balance || this.balance === undefined)) {
            console.log('Balance is undefined in demo mode, fixing...');
            this.balance = this.getDefaultBalanceForCountry();
            this.updateBalanceDisplay();
        }
        
        console.log('Current bet:', this.current_bet, 'Balance:', this.balance);
        if( this.current_bet && this.current_bet <= this.balance && this.current_bet > 0 ){ 
            console.log('Starting game...');
        // Проверяем, есть ли уже полученные WebSocket данные
        if (this.websocketCoefficients && Object.keys(this.websocketCoefficients).length > 0 && this.traps && this.traps.length > 0) {
            console.log('Using existing WebSocket data for new game');
            console.log('WebSocket coefficients:', this.websocketCoefficients);
            console.log('WebSocket traps:', this.traps);
        } else if (this.pendingWebSocketData) {
            console.log('Using pending WebSocket data for new game');
            this.updateTrapsFromWebSocket(this.pendingWebSocketData);
            this.pendingWebSocketData = null;
        } else {
            // Генерируем локальные трапы перед началом игры
            this.generateLocalTraps();
        }
            
            // Устанавливаем pendingGameStart для actuallyStartGame
            this.pendingGameStart = {
                current_bet: this.current_bet,
                balance: this.balance
            };
            
            this.actuallyStartGame();
        } else {
            console.log('Cannot start game: invalid bet or insufficient balance');
        }
    }
    
    actuallyStartGame(){
        console.log('actuallyStartGame() called, pendingGameStart:', this.pendingGameStart);
        if (!this.pendingGameStart) {
            console.log('No pendingGameStart, returning');
            return;
        }
        
        this.current_bet = this.pendingGameStart.current_bet;
        this.cur_status = 'game';
        console.log('Game status changed to:', this.cur_status); 
        this.stp = 0; 
        this.alife = 1; 
        CHICKEN.alife = 1; 
        this.game_result_saved = false; // Сбрасываем флаг для новой игры
        this.balance -= this.current_bet;
        
        // Сохраняем текущие ловушки для этой игры
        this.gameTraps = this.traps ? [...this.traps] : [];
        console.log('Game traps locked:', this.gameTraps);
        
        // Уведомляем WebSocket о начале игры
        if (this.isWebSocketConnected) {
            this.sendWebSocketMessage({
                type: 'game_start'
            });
        }
        this.updateBalanceDisplay(); 
        // Баланс теперь обновляется через API напрямую, не нужно вызывать updateBalanceOnServer
        $('.sector').off().on('click', function(){ 
            // Проверяем, что курица может двигаться
            if (GAME.cur_status === 'game' && GAME.alife && CHICKEN.alife) {
                GAME.move(); 
            }
        });
        // Уведомляем сервер о начале игры
        // Локальная игра - не нужно отправлять на сервер
        
        this.waitingForTraps = false;
        this.pendingGameStart = null;
        // Balance updated above
        
        // Убеждаемся, что курица правильно позиционирована перед началом игры
        this.positionChicken();
        
        // Делаем первый шаг автоматически - курица идет на первый сектор и там стоит
        // this.move(); 
    } 
    finish( $win ){
        console.log('=== FINISH FUNCTION CALLED ===');
        console.log('Win result:', $win);
        console.log('Current bet:', this.current_bet);
        console.log('Balance before:', this.balance);
        
        console.log('=== FINISH METHOD START ===');
        console.log('Game result:', $win);
        console.log('Current bet:', this.current_bet);
        console.log('Balance before calculation:', this.balance); 
        
        // Сбрасываем флаг в начале каждой игры
        this.game_result_saved = false;
        console.log('Game result saved flag reset to:', this.game_result_saved); 
        
        // Уведомляем сервер об окончании игры
        // Локальная игра - не нужно отправлять на сервер
        
        var $award = 0;
        if( $win ){ 
            this.win = 1; 
            $('#fire').addClass('active');
            $award = ( this.current_bet * this.getCoefficient( this.stp - 1 ) ); 
            $award = $award ? $award : 0; 
            console.log("WIN: Award calculated:", $award, "Balance before:", this.balance);
            this.balance += $award; 
            this.balance = Math.round(this.balance * 100) / 100; // Округляем до 2 знаков
            console.log("WIN: Final balance after award:", this.balance);
            // Принудительно обновляем отображение баланса в интерфейсе
            this.updateBalanceDisplay();
            // Баланс теперь обновляется через API напрямую, не нужно вызывать updateBalanceOnServer
            if( SETTINGS.volume.sound ){ SOUNDS.win.play(); } 
            $('#win_modal').css('display', 'flex');
            $('#win_modal h3').html( 'x'+ this.getCoefficient( this.stp - 1 ) );
            $('#win_modal h4 span').html( $award.toFixed(2) );
        } 
        else {
            // При проигрыше также обновляем баланс в интерфейсе
            console.log("LOSE: Balance remains:", this.balance, "(bet was already deducted at start)");
            this.balance = Math.round(this.balance * 100) / 100; // Округляем до 2 знаков
            this.updateBalanceDisplay();
            if( SETTINGS.volume.sound ){ SOUNDS.lose.play(); } 
            
            // Не отправляем сообщение в WebSocket - просто используем последнюю ловушку
            console.log("Chicken burned, using current WebSocket trap data");
        }
        
        // Сохраняем результат игры в базе данных только один раз
        console.log('Game result saved flag:', this.game_result_saved);
        console.log('GAME_CONFIG:', window.GAME_CONFIG);
        console.log('Is real mode:', window.GAME_CONFIG && window.GAME_CONFIG.is_real_mode);
        
        // Всегда отправляем API запрос, если есть access_token
        if (!this.game_result_saved && window.ACCESS_TOKEN) {
            console.log('Sending API request...');
            
            // Отправляем напрямую в API
            console.log('Calling sendGameResultToAPI...');
            // Рассчитываем правильный итоговый баланс для API
            var apiFinalBalance = $win ? (this.balance) : (this.balance); // При проигрыше баланс уже правильный (ставка вычтена)
            console.log('Balance calculation for API (first call):', {
                win: $win,
                current_bet: this.current_bet,
                award: $award,
                current_balance: this.balance,
                api_final_balance: apiFinalBalance
            });
            this.sendGameResultToAPI($win, this.current_bet, $award, apiFinalBalance);
            
            // Устанавливаем флаг только после отправки
            this.game_result_saved = true;
        } else if (!this.game_result_saved && window.GAME_CONFIG && window.GAME_CONFIG.is_real_mode) {
            console.log('Saving game result...');
            saveGameResult($win ? 'win' : 'lose', this.current_bet, $award, this.balance);
            
            // Также отправляем напрямую в API
            console.log('Calling sendGameResultToAPI...');
            // Рассчитываем правильный итоговый баланс для API
            var apiFinalBalance = $win ? (this.balance) : (this.balance); // При проигрыше баланс уже правильный (ставка вычтена)
            console.log('Balance calculation for API (second call):', {
                win: $win,
                current_bet: this.current_bet,
                award: $award,
                current_balance: this.balance,
                api_final_balance: apiFinalBalance
            });
            this.sendGameResultToAPI($win, this.current_bet, $award, apiFinalBalance);
            
            // Устанавливаем флаг только после отправки
            this.game_result_saved = true;
        } else {
            console.log('Skipping game result save - already saved or no access token');
        }
        
        // Сбрасываем флаг сразу после обработки результата игры
        this.game_result_saved = false;
        
        // Очищаем только pending WebSocket данные, но сохраняем текущие
        this.pendingWebSocketData = null;
        
        setTimeout(
            function(){ 
                $('#overlay').hide(); 
                $('#win_modal').hide(); 
                // Принудительно обновляем баланс после завершения игры
                GAME.updateBalanceDisplay();
                GAME.cur_status = "loading"; 
                // Флаг уже сброшен выше
                
                // Уведомляем WebSocket об окончании игры
                if (GAME.isWebSocketConnected) {
                    GAME.sendWebSocketMessage({
                        type: 'game_end'
                    });
                }
                
                // Получаем актуальную информацию о пользователе после завершения игры
                if (window.GAME_CONFIG && window.GAME_CONFIG.is_real_mode) {
                    console.log('Fetching user info after game completion...');
                    // Добавляем задержку, чтобы внешний API успел обновить баланс
                    setTimeout(() => {
                        console.log('Fetching user info with delay...');
                        GAME.fetchUserInfo();
                    }, 2000); // 2 секунды задержки
                }
                
                GAME.create();  
            }, $win ? 5000 : 3000  
        ); 
    }
    move(){
        // Проверяем, что игра активна и курица жива
        if (this.cur_status !== 'game' || !this.alife || !CHICKEN.alife) {
            console.log('Cannot move: game not active or chicken not alive');
            return;
        }
        
        // Проверяем флаг движения для предотвращения множественных вызовов
        if (this.isMoving) {
            console.log('Chicken is already moving, ignoring move() call');
            return;
        }
        
        // Удаляем все дубликаты курицы перед движением
        var $allChicks = $('#chick');
        if ($allChicks.length > 1) {
            console.warn('Multiple chicken elements found, removing duplicates');
            $allChicks.slice(1).remove(); // Удаляем все кроме первого
        }
        
        var $chick = $('#chick'); 
        
        // Проверяем, что курица существует
        if (!$chick.length) {
            console.error('Chicken element not found');
            return;
        }
        
        var $state = $chick.attr('state'); 
        
        // Проверяем, что курица в состоянии idle (не в движении)
        if( $state !== "idle" ){
            console.log('Chicken is already moving, state:', $state);
            return;
        }
        
        // Устанавливаем флаг движения
        this.isMoving = true;
        
        var $cur_x = parseInt( $chick.css('left') );
        if( $state == "idle" ){
            this.stp += 1;
            if( SETTINGS.volume.sound ){ SOUNDS.step.play(); }
            $chick.attr('state', "go");
            // Сначала проверяем ловушки ПЕРЕД движением
            var currentSectorId = this.stp + 1; // Добавляем 1, так как stp начинается с 0, а секторы с 1
            var trapsArray = [];
            
            // Используем зафиксированные ловушки игры
            if (this.gameTraps && this.gameTraps.length > 0) {
                trapsArray = this.gameTraps;
                console.log('Using locked game traps:', trapsArray);
            } else if (Array.isArray(this.traps)) {
                trapsArray = this.traps;
            } else if (this.traps && this.traps.traps && Array.isArray(this.traps.traps)) {
                trapsArray = this.traps.traps;
            }
            
            // Не используем fallback ловушки - только WebSocket
            
            // Также проверяем атрибут flame в DOM
            var $sector = $('.sector').eq(this.stp);
            var isFlameInDOM = $sector.attr('flame') === '1';
            var isFlameInArray = trapsArray.includes(currentSectorId);
            var isFlame = isFlameInDOM || isFlameInArray;
            
            console.log('Step:', this.stp, 'Sector ID:', currentSectorId, 'Traps:', this.traps, 'TrapsArray:', trapsArray, 'Is flame (DOM):', isFlameInDOM, 'Is flame (Array):', isFlameInArray, 'Is flame (Final):', isFlame);
            
            // Move chick to next sector
            var $nx = $cur_x + SETTINGS.segw + 'px';
            $chick.css('left', $nx);
            
            // Убеждаемся, что курица не "упала" вниз
            $chick.css('bottom', '50px');
            // Highlight sectors
            var $prevSector = $('.sector').removeClass('active');
            $('.sector').removeClass('active');
            if(this.stp > 0) $('.sector').eq(this.stp-1).addClass('complete');
            $sector.addClass('active');
            $sector.next().removeClass('far');
            $('.trigger', $sector).addClass('activated');
            
            if( isFlame ){
                // Позиционируем огонь на текущем секторе
                var $flame_x = $sector[0].offsetLeft;
                $('#fire').css('left', $flame_x + 'px').addClass('active');
                CHICKEN.alife = 0;
                $chick.attr('state', 'dead');
                $sector.removeClass('active').removeClass('complete').addClass('dead');
                $('.sector.finish').addClass('lose');
                GAME.finish();
            } else {
                if( $sector.hasClass('finish') ){
                    GAME.finish(1);
                    $sector.addClass('win');
                }
            }
            setTimeout(function(){
                if( CHICKEN.alife ){
                    $chick.attr('state', 'idle');
                }
                // Сбрасываем флаг движения
                GAME.isMoving = false;
                
                // Принудительно обновляем интерфейс после шага
                GAME.update();
            }, 500);
        }
        // Battlefield scroll
        if(
            $cur_x > ( SETTINGS.w / 3 ) &&
            parseInt( $('#battlefield').css('left') ) > -( parseInt( $('#battlefield').css('width') ) - SETTINGS.w -SETTINGS.segw )
        ){
            var $field_x = parseInt( $('#battlefield').css('left') );
            var $nfx = $field_x - SETTINGS.segw +'px';
            $('#battlefield').css('left', $nfx);
        }
    }
    getCurrentSector() { 
        var parent = document.querySelector('#battlefield'); 
        var player = document.querySelector('#chick'); 
        if (!player) return null;
        var sectors = document.querySelectorAll('#battlefield .sector'); 
        var playerRect = player.getBoundingClientRect();
        var parentRect = parent.getBoundingClientRect(); 
        var playerPosX = playerRect.left - parentRect.left;
        var sectorIndex = Math.floor( playerPosX / SETTINGS.segw ); 
        if( sectorIndex >= 0 && sectorIndex < sectors.length ){ 
            return sectorIndex; 
        } 
        else { return null; }
    } 
    random_str( length = 8 ){
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt( Math.floor( Math.random() * chars.length ) );
        }
        return result;
    } 
    random_bet(){
        var $user_id = Math.ceil( Math.random() * 70 ); 
        var $user_name = this.random_str(); 
        var $user_win = Math.random() * 1000; 
        var $tmps = `<div class="inner">
                        <img src="./res/img/users/av-${ $user_id }.png" alt="">
                        <h2>${ $user_name }</h2>
                        <h3>+${ $user_win.toFixed(2) } ${ SETTINGS.currency }</h3>
                    </div>`; 
        $('#random_bet').html( $tmps ).css('height', '40px'); 
        setTimeout( function(){ $('#random_bet').html('').css('height', '0px'); }, 6000 );
    } 
    selectValue(mainArray, chanceArray) {
        var randomChance = Math.random();
        var limit = randomChance <= 0.1 ? chanceArray[1] : chanceArray[0];
        var filteredArray = mainArray.filter(value => value <= limit); 
        if( filteredArray.length === 0 ){
           return null;
        }
        var randomIndex = Math.floor( Math.random() * filteredArray.length );
        return randomIndex;
    } 
    selectValueHybridIndex(mainArray, chanceArray) {
        var limit = Math.random() <= 0.1 ? chanceArray[1] : chanceArray[0]; 
        var filteredIndices = mainArray
            .map( ( val, index) => ( { val, index } ) ) 
            .filter( ( { val, index } ) => val <= limit && ( index <= 1 || Math.random() < 0.3 ) )
            .map( ( { index } ) => index ); 
        if( filteredIndices.length === 0 ){
            var fallbackIndex = mainArray.findIndex( val => val <= limit );
            return fallbackIndex !== -1 ? fallbackIndex : null;
        } 
        console.log( filteredIndices[ Math.floor( Math.random() * filteredIndices.length ) ] );
        return filteredIndices[ Math.floor( Math.random() * filteredIndices.length ) ];
    }
    update(){
        switch( this.cur_status ){
            case 'loading': 
                $('#close_bet').css('display', 'none');
                $('#close_bet span').html( 0+' '+GAME.currency ).css('display', 'none');
                $('#start').html( LOCALIZATION.TEXT_BETS_WRAPPER_PLAY );
                $('#dificulity i').hide(); 
                break; 
            case 'game': 
                // Показываем кнопку CASH OUT только после первого шага курицы (stp > 0)
                if (this.stp > 0) {
                $('#close_bet').css('display', 'flex'); 
                var $award = ( this.current_bet * this.getCoefficient( Math.max(0, this.stp - 1) ) ); 
                    $award = $award ? $award.toFixed(2) : 0; 
                $('#close_bet span').html( $award +' '+ SETTINGS.currency ).css('display', 'flex');
                } else {
                    // Скрываем кнопку CASH OUT до первого шага
                    $('#close_bet').css('display', 'none');
                    $('#close_bet span').css('display', 'none');
                }
                $('#start').html( LOCALIZATION.TEXT_BETS_WRAPPER_GO ); 
                $('#dificulity i').show();
                break; 
            case 'finish': 
                $('#close_bet').css('display', 'none');
                $('#close_bet span').html( 0+' '+GAME.currency ).css('display', 'none'); 
                $('#start').html( LOCALIZATION.TEXT_BETS_WRAPPER_WAIT ); 
                $('#dificulity i').hide();
                break;  
        } 
        // Обновляем отображение баланса только если игра не в состоянии финиша
        if( this.cur_status !== 'finish' && this.balance !== undefined && this.balance !== null ){
            this.updateBalanceDisplay();
        } 

        var $sector = GAME.getCurrentSector(); 
        if( $sector > 1 ){ 
            $('.sector').eq( $sector-1 ).removeClass('active').addClass('complete'); 
        }
        $('.sector').each(function(){
            var $self=$(this);
            if( !$self.hasClass('flame') && !$self.hasClass('closer') && !$self.hasClass('start') && !$self.hasClass('active') ){
                var $start = Math.round( Math.random() * 1000 ) > 997 ? true : false; 
                if( $start ){
                    $self.addClass('flame');
                    setTimeout( function(){ $self.removeClass('flame') }, 1000 );
                }
            }
        });

        if( Math.round( Math.random() * 100 ) > 99 ){ 
            $('#stats span.online').html( LOCALIZATION.TEXT_LIVE_WINS_ONLINE + ': '+ Math.round( Math.random() * 10000 ));
            GAME.random_bet(); 
        } 
    }
    bind(){
        $(document).ready(function(){ 
            // переключение звука 
            $('#switch_sound').off().on('change', function(){
                var $self=$(this); 
                var $val = $self.is(':checked'); 
                if( !$val ){ SETTINGS.volume.sound = 0; } 
                else { SETTINGS.volume.music = 0.9; } 
            });
            $('#switch_music').off().on('change', function(){
                var $self=$(this); 
                var $val = $self.is(':checked'); 
                if( !$val ){
                    SOUNDS.music.stop(); 
                    SETTINGS.volume.music = 0; 
                } 
                else {
                    SOUNDS.music.play(); 
                    SETTINGS.volume.music = 0.2;
                } 
                
            });
            
            // переключение звука через кнопку в хедере
            $('#sound_switcher').off().on('click', function(){
                var $self=$(this); 
                $self.toggleClass('off'); 
                if( $self.hasClass('off') ){
                    SOUNDS.music.stop(); 
                    SETTINGS.volume.active = 0; 
                } 
                else {
                    SETTINGS.volume.active = 1; 
                    SOUNDS.music.play(); 
                }
                // Сохраняем настройки
                $('body').attr('data-sound', SETTINGS.volume.active ? '1' : '0');
            });
            
            // Универсальные обработчики для кнопок уровней сложности
            // Пробуем разные селекторы для кнопок уровней
            var levelSelectors = [
                '.level-btn',
                '[data-level]',
                '.difficulty-btn',
                '.level-button',
                'button[data-level]',
                '.btn[data-level]'
            ];
            
            levelSelectors.forEach(function(selector) {
                $(selector).off().on('click', function(){
                    var level = $(this).data('level') || $(this).attr('data-level');
                    if (!level) return; // Пропускаем если нет уровня
                    
                    console.log('=== LEVEL BUTTON CLICKED ===');
                    console.log('Selector:', selector);
                    console.log('Level button clicked:', level);
                    console.log('GAME object exists:', !!GAME);
                    console.log('GAME.setLevel exists:', !!(GAME && GAME.setLevel));
                    
                    // Обновляем визуальное состояние кнопок
                    $(selector).removeClass('selected').css({
                        'background': '#333',
                        'color': '#fff',
                        'border-color': '#666'
                    });
                    $(this).addClass('selected').css({
                        'background': '#00ff88',
                        'color': '#000',
                        'border-color': '#00ff88'
                    });
                    console.log('Visual state updated for level:', level);
                    
                    // Вызываем setLevel для обновления коэффициентов
                    if (GAME && GAME.setLevel) {
                        console.log('Calling GAME.setLevel with level:', level);
                        GAME.setLevel(level);
                    } else {
                        console.log('ERROR: GAME or GAME.setLevel not available!');
                    }
                    console.log('=== LEVEL BUTTON CLICK COMPLETED ===');
                });
            });
            
            // Также добавляем обработчик через делегирование событий
            $(document).off('click.level').on('click.level', '[data-level]', function(){
                var level = $(this).data('level');
                console.log('=== DELEGATED LEVEL BUTTON CLICKED ===');
                console.log('Level:', level);
                console.log('Element:', this);
                
                if (GAME && GAME.setLevel) {
                    console.log('Calling GAME.setLevel via delegation with level:', level);
                    GAME.setLevel(level);
                }
            });
            
            // Добавляем универсальный обработчик для всех возможных кнопок уровней
            $(document).off('click.levelUniversal').on('click.levelUniversal', function(e){
                var $target = $(e.target);
                var level = null;
                
                // Проверяем разные способы определения уровня
                if ($target.hasClass('level-btn') || $target.hasClass('difficulty-btn')) {
                    level = $target.data('level') || $target.attr('data-level');
                } else if ($target.text().toLowerCase() === 'easy') {
                    level = 'easy';
                } else if ($target.text().toLowerCase() === 'medium') {
                    level = 'medium';
                } else if ($target.text().toLowerCase() === 'hard') {
                    level = 'hard';
                } else if ($target.text().toLowerCase() === 'hardcore') {
                    level = 'hardcore';
                }
                
                if (level && GAME && GAME.setLevel) {
                    console.log('=== UNIVERSAL LEVEL BUTTON CLICKED ===');
                    console.log('Level detected:', level);
                    console.log('Element:', e.target);
                    console.log('Element text:', $target.text());
                    console.log('Element classes:', $target.attr('class'));
                    
                    // Обновляем визуальное состояние кнопок
                    $('.level-btn, .difficulty-btn, [data-level]').removeClass('selected active').css({
                        'background': '#333',
                        'color': '#fff',
                        'border-color': '#666'
                    });
                    $target.addClass('selected active').css({
                        'background': '#00ff88',
                        'color': '#000',
                        'border-color': '#00ff88'
                    });
                    
                    console.log('Calling GAME.setLevel with level:', level);
                    GAME.setLevel(level);
                }
            });
            
            // Специальный обработчик для radio кнопок уровней
            $('input[name="difficulity"]').off().on('change', function(){
                var level = $(this).val();
                console.log('=== RADIO LEVEL BUTTON CHANGED ===');
                console.log('Level:', level);
                console.log('Element:', this);
                
                // Снимаем активные классы со всех radio кнопок
                $('input[name="difficulity"]').each(function(){
                    var $label = $(this).closest('label');
                    $label.removeClass('active selected');
                    console.log('Removed active classes from:', $label.find('span').text());
                });
                
                // Добавляем активный класс к выбранной кнопке
                var $selectedLabel = $(this).closest('label');
                $selectedLabel.addClass('active selected');
                console.log('Added active classes to:', $selectedLabel.find('span').text());
                
                console.log('Active classes updated for level:', level);
                
                if (GAME && GAME.setLevel) {
                    console.log('Calling GAME.setLevel with level:', level);
                    GAME.setLevel(level);
                }
            });
            
            // установка ставки в инпуте
            $('#bet_size').off().on('change', function(){ 
                if( GAME.cur_status == 'loading' ){
                    var $self=$(this); 
                    var $val= +$self.val(); 
                    var country = window.GAME_CONFIG ? window.GAME_CONFIG.user_country : 'default';
                    var betConfig = GAME.getBetConfigForCountry(country);
                    var minBet = betConfig.min_bet;
                    var maxBet = betConfig.max_bet;
                    $val = $val < minBet ? minBet : ( $val > maxBet ? maxBet : $val ); 
                    $val = $val > GAME.balance ? GAME.balance : $val; 
                    $self.val( $val ); 
                }
            });
            // установка ставки кнопками min max - обработчики будут установлены в updateMinMaxButtons()
            // установка ставки кнопками со значением
            $('.basic_radio input[name="bet_value"]').off().on('change', function(){ 
                if( GAME.cur_status == 'loading' ){
                    if( SETTINGS.volume.sound ){ SOUNDS.button.play(); } 
                    var $self=$(this); 
                    var $val = +$self.val();  
                    $val = $val > GAME.balance ? GAME.balance : $val;
                    $('#bet_size').val( $val ); 
                }
            }); 
            // установка уровня сложности
            $('[name="difficulity"]').off().on('change', function(){ 
                if( GAME.cur_status == 'loading' ){ 
                    if( SETTINGS.volume.sound ){ SOUNDS.button.play(); } 
                    var $self=$(this); 
                    var $val = $self.val(); 
                    GAME.cur_lvl = $val; 
                    // Генерируем новые трапы для нового уровня
                    GAME.generateLocalTraps();
                    GAME.create(); 
                } 
                else {
                    return false; 
                }
            });
            // забрать ставку
            $('#close_bet').off().on('click', function(){ 
                if( GAME.stp ){ 
                    if( SETTINGS.volume.sound ){ SOUNDS.button.play(); } 
                    var $self=$(this); 
                    $self.hide(); 
                    GAME.finish(1); 
                }
            });
            // начать игру или сделать ход
            $('#start').off().on('click', function(){ 
                console.log('Start button clicked, GAME.cur_status:', GAME.cur_status);
                if( SETTINGS.volume.sound ){ SOUNDS.button.play(); } 
                var $self=$(this);
                switch( GAME.cur_status ){
                    case 'loading': 
                        $self.html( LOCALIZATION.TEXT_BETS_WRAPPER_GO ); 
                        if( +$('#bet_size').val() > 0 ){ 
                            GAME.start(); 
                        }
                        break; 
                    case 'game': 
                        if( CHICKEN.alife ){ 
                            $self.html( LOCALIZATION.TEXT_BETS_WRAPPER_GO ); 
                            // Вызываем move() при клике на GO во время игры
                            GAME.move();
                        }
                        break; 
                    case 'finish': 
                        $self.html( LOCALIZATION.TEXT_BETS_WRAPPER_WAIT );
                        //GAME.cur_status = "loading";
                        break;  
                }
            }); 
            $('window').on('resize', function(){
                $('#game_container').hide();
                $('#game_container').css('min-height', parseInt( $('#main').css('height') )+'px' );
                $('#game_container').show(); 
                SETTINGS.w = document.querySelector('#game_container').offsetWidth; 
                SETTINGS.segw = parseInt( $('.sector').eq(0).css('width') );
                var $scale = GAME.getChickenScale();
                $('#chick').css( 'left', ( SETTINGS.segw / 2 )+'px' ); 
                $('#chick .inner').css( 'transform', 'translateX(-50%) scale('+ $scale +')' ); 
                var $bottom = 50; 
                if( SETTINGS.w <= 1200 ){ $bottom = 35; }
                if( SETTINGS.w <= 1100 ){ $bottom = 30; }
                if( SETTINGS.w <= 1000 ){ $bottom = 25; }
                if( SETTINGS.w <= 900 ){ $bottom = 5; }
                if( SETTINGS.w <= 800 ){ $bottom = -15; }
                $('#chick').css('bottom', $bottom+'px');

            });
        }); 
    }
    updateTraps(){
        console.log('Updating traps:', this.traps);
        $('.sector').removeAttr('flame');
        if (this.traps && this.traps.length > 0) {
            this.traps.forEach(trapIndex => {
                // Ловушки приходят как индексы секторов (1-основанные)
                var $sector = $('.sector[data-id="' + trapIndex + '"]');
                if ($sector.length > 0) {
                    $sector.attr('flame', '1');
                    console.log('Applied flame to sector', trapIndex);
                }
            });
        }
        var $flame_x = document.querySelector('.sector[flame="1"]'); 
        $flame_x = $flame_x ? $flame_x.offsetLeft : 0; 
        $('#fire').css('left', $flame_x +'px');
        this.fire = this.traps && this.traps.length > 0 ? this.traps[0] : 0;
    }
    
    // Метод для отправки запроса к API после игры
    sendGameResultToAPI(gameResult, betAmount, winAmount, finalBalance) {
        console.log('=== API CALL START ===');
        console.log('Access token available:', !!window.ACCESS_TOKEN);
        console.log('Access token preview:', window.ACCESS_TOKEN ? window.ACCESS_TOKEN.substring(0, 20) + '...' : 'none');
        console.log('Game result:', gameResult);
        console.log('Bet amount:', betAmount);
        console.log('Win amount:', winAmount);
        console.log('Final balance:', finalBalance);
        console.log('Sending final balance to API:', finalBalance);
        
        if (!window.ACCESS_TOKEN) {
            console.log('No access token - skipping API call');
            return;
        }
        
        // Определяем тип операции на основе результата игры
        var operation = gameResult ? 'win' : 'loss';
        
        var headers = {
            'Authorization': 'Bearer ' + window.ACCESS_TOKEN,
            'Content-Type': 'application/json',
        };
        
        var requestData = {
            deposit: finalBalance.toFixed(2), // Отправляем итоговый баланс как deposit
        };
        
        console.log('Sending game result to API:', requestData);
        console.log('Headers:', headers);
        console.log('Request body:', JSON.stringify(requestData));
        console.log('Request URL:', 'https://api.valor-games.co/api/user/deposit/');
        
        fetch('https://api.valor-games.co/api/user/deposit/', {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(requestData)
        })
        .then(response => {
            console.log('API response status:', response.status);
            console.log('API response:', response);
        if (!response.ok) {
                throw new Error('API response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('API response data:', data);
            console.log('API response data type:', typeof data);
            console.log('API response data keys:', Object.keys(data || {}));
            console.log('API response balance field:', data ? data.balance : 'undefined');
            console.log('API response deposit field:', data ? data.deposit : 'undefined');
            console.log('API response new_deposit field:', data ? data.new_deposit : 'undefined');
            console.log('API response old_deposit field:', data ? data.old_deposit : 'undefined');
            console.log('API response success field:', data ? data.success : 'undefined');
            console.log('API response message field:', data ? data.message : 'undefined');
        
        // Обновляем баланс в интерфейсе после успешного API запроса
        if (data && data.balance !== undefined) {
            this.balance = parseFloat(data.balance);
            this.updateBalanceDisplay();
            console.log('Balance updated from API:', this.balance);
        } else if (data && data.new_deposit !== undefined) {
            // Используем new_deposit из API ответа
            var apiBalance = parseFloat(data.new_deposit);
            
            // Проверяем, действительно ли API обновил баланс
            if (data.old_deposit === data.new_deposit) {
                console.warn('WARNING: API did not update balance! old_deposit === new_deposit:', data.old_deposit);
                console.warn('Using local balance instead:', this.balance);
                // Не обновляем баланс, если API не изменил его
                this.updateBalanceDisplay();
            } else {
                this.balance = apiBalance;
                this.updateBalanceDisplay();
                console.log('Balance updated from API new_deposit:', this.balance);
            }
        } else {
            console.log('No balance field in API response, keeping current balance:', this.balance);
            // Принудительно обновляем отображение баланса в интерфейсе
            this.updateBalanceDisplay();
            console.log('Balance display updated to:', this.balance.toFixed(2));
        }
        
        // Получаем актуальную информацию о пользователе после игры
        if (window.GAME_CONFIG && window.GAME_CONFIG.is_real_mode) {
            console.log('Fetching updated user info after game...');
            this.fetchUserInfo().then(userInfo => {
                if (userInfo) {
                    console.log('User info updated successfully:', userInfo);
                    
                    // Отправляем сообщение родительскому окну об обновлении баланса
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage({
                            type: 'balanceUpdated',
                            balance: this.balance,
                            userId: userInfo.user_id
                        }, '*');
                    }
                }
            });
                    } else {
            // Отправляем сообщение родительскому окну об обновлении баланса
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'balanceUpdated',
                    balance: this.balance,
                    userId: window.GAME_CONFIG?.user_id
                }, '*');
            }
        }
            })
            .catch(error => {
            console.error('Failed to send game result to API:', error);
            
            // Проверяем тип ошибки
            if (error.message.includes('Load failed') || error.message.includes('CORS')) {
                console.error('CORS or network error - check API server configuration');
            } else if (error.message.includes('401')) {
                console.error('Authentication error - access token may be invalid or expired');
            } else {
                console.error('Unknown error:', error.message);
            }
            
            // Можно добавить уведомление об ошибке
            // Принудительно обновляем отображение баланса в интерфейсе даже при ошибке API
            this.updateBalanceDisplay();
            console.log('Balance display updated after API error:', this.balance.toFixed(2));
        });
        
        console.log('=== API CALL END ===');
    }
    
    // Метод для получения информации о пользователе и обновления баланса
    async fetchUserInfo() {
        if (!window.ACCESS_TOKEN) {
            console.log('No access token - cannot fetch user info');
            return;
        }
        
        console.log('=== FETCHING USER INFO ===');
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (window.ACCESS_TOKEN) {
            headers['Authorization'] = 'Bearer ' + window.ACCESS_TOKEN;
        }
        
        try {
            // Пробуем сначала с слэшем в конце
            let response = await fetch('https://api.valor-games.co/api/user/info/', {
                method: 'GET',
                headers: headers
            });
            
            // Если получили редирект, попробуем без слэша
            if (response.status === 301 || response.status === 302) {
                console.log('Got redirect, trying without trailing slash...');
                response = await fetch('https://api.valor-games.co/api/user/info', {
                    method: 'GET',
                    headers: headers
                });
            }
        
        if (!response.ok) {
                throw new Error('API response was not ok: ' + response.status);
        }
        
        const data = await response.json();
            console.log('User info response:', data);
            
            // Обновляем баланс из API
            if (data && data.deposit !== undefined) {
                var apiBalance = parseFloat(data.deposit);
                var currentBalance = this.balance;
                
                // Не перезаписываем баланс, если текущий больше (игра еще не завершена на сервере)
                if (apiBalance < currentBalance) {
                    console.log('API balance is lower than current balance, keeping current:', {
                        api_balance: apiBalance,
                        current_balance: currentBalance
                    });
                    // Обновляем только отображение, но не сам баланс
                    $('[data-rel="menu-balance"] span').html(this.formatBalance(currentBalance, SETTINGS.currency));
                    } else {
                    this.balance = apiBalance;
                    this.updateBalanceDisplay();
                    console.log('Balance updated from user info API:', this.balance);
                }
                
                // Обновляем конфигурацию игры с данными из API
                if (data.country) {
                    console.log('Country from API:', data.country);
                    
                    // Обновляем window.GAME_CONFIG с данными из API
                    if (!window.GAME_CONFIG) {
                        window.GAME_CONFIG = {};
                    }
                    
                    window.GAME_CONFIG.user_country = data.country;
                    window.GAME_CONFIG.user_id = data.user_id;
                    window.GAME_CONFIG.is_real_mode = true;
                    
                    console.log('Real mode activated - user data loaded from API');
                    
                    // Обновляем валюту если есть country_info
                    if (data.country_info && data.country_info.currency) {
                        window.GAME_CONFIG.currency_symbol = data.country_info.currency;
                        console.log('Currency updated from API:', data.country_info.currency);
                        
                        // Обновляем отображение валюты в интерфейсе
                        $('[data-rel="menu-balance"]').attr('data-currency', data.country_info.currency);
                        
                        // Обновляем SVG символы валюты
                        $('svg use').attr('xlink:href', './res/img/currency.svg#' + data.country_info.currency);
                        console.log('Currency SVG updated to:', data.country_info.currency);
                    }
                    
                    // Обновляем настройки игры с новыми данными
                    this.updateSettingsFromConfig();
                    this.updateMinMaxButtons();
                    this.updateQuickBets(data.country_info.currency);
                    
                    console.log('Game config updated from API:', window.GAME_CONFIG);
                }
                
                return data;
            } else {
                console.log('No deposit field in user info response');
                return null;
            }
            
        } catch (error) {
            console.error('Failed to fetch user info:', error);
            
            // Если CORS ошибка, попробуем альтернативный подход
            if (error.message.includes('CORS') || error.message.includes('Load failed')) {
                console.log('CORS error detected, trying alternative approach...');
                // Можно попробовать использовать JSONP или другой метод
                return null;
            }
            
            return null;
        }
    }
}

var GAME = new Game({}); 

class Chicken{
    constructor( $obj ){
        this.x = $obj.x ? $obj.x : 0; 
        this.y = $obj.y ? $obj.y : 0; 
        this.w = $obj.w ? $obj.w : SETTINGS.segw * 0.9; 
        this.h = $obj.h ? $obj.w : this.w; 
        this.alife = 0; 
        this.state = 'idle'; 
        this.wrapper = $('#chick');
    }  
}

var CHICKEN = new Chicken({}); 

function open_game(){ 
    // Обновляем размеры контейнера
    SETTINGS.w = document.querySelector('#game_container').offsetWidth;
    SETTINGS.h = document.querySelector('#game_container').offsetHeight;
    SETTINGS.segw = parseInt( $('#battlefield .sector').css('width') );
    
    // Refresh balance from DOM when game opens (only if not in demo mode)
    if (GAME && typeof GAME.refreshBalance === 'function') {
        if (!window.IS_DEMO_MODE && (!window.GAME_CONFIG || !window.GAME_CONFIG.is_demo_mode)) {
        GAME.refreshBalance();
        console.log('Balance refreshed in open_game():', GAME.balance);
        } else {
            console.log('Demo mode active, skipping balance refresh in open_game()');
        }
    }
    
    $('#splash').addClass('show_modal');
    var $music_settings = SETTINGS.volume.music; 
    var $sound_settings = SETTINGS.volume.sound; 
    $('#splash button').off().on('click', function(){
        $('#splash').remove(); 
        if( SETTINGS.volume.sound ){ 
            SOUNDS.button.play(); 
            $('#switch_sound').removeAttr('checked'); 
        } 
        else {
            $('#switch_sound').attr('checked', 'checked'); 
        }
        if( SETTINGS.volume.music ){ 
            SOUNDS.music.play(); 
            $('#switch_music').removeAttr('checked'); 
        }
        else {
            $('#switch_music').attr('checked', 'checked'); 
        }
    }); 
} 

function render(){ 
    if( GAME ){
        GAME.update(); 
        // Периодически проверяем и очищаем дубликаты курицы
        GAME.cleanupDuplicateChickens();
    }

    requestAnimationFrame( render );
}

render(); 

function saveGameResult(result, bet, award, balance) {
    if (!window.GAME_CONFIG.is_real_mode || !window.GAME_CONFIG.user_id) {
        console.log('Demo mode - not saving game result');
        return;
    }
    
    // Отправляем результат игры в API
    if (window.GAME && window.GAME.sendGameResultToAPI) {
        window.GAME.sendGameResultToAPI(result === 'win', bet, award, balance);
    } else {
        console.log('GAME object not found or sendGameResultToAPI method not available');
    }
}

// WebSocket методы для генерации ловушек
Game.prototype.updateTrapsFromWebSocket = function(websocketData) {
    console.log('=== UPDATING TRAPS FROM WEBSOCKET ===');
    console.log('WebSocket data:', websocketData);
    console.log('Current game status:', this.cur_status);
    
    if (websocketData && websocketData.traps) {
        // Обновляем ловушки из WebSocket
        if (websocketData.traps && websocketData.traps.length > 0) {
            this.localTraps = websocketData.traps;
            this.traps = websocketData.traps;
            console.log('Traps updated from WebSocket:', this.traps);
        } else {
            console.log('WebSocket traps are empty, keeping existing traps:', this.traps);
        }
        
        // Обновляем коэффициенты из WebSocket sectors данных
        if (websocketData.sectors) {
            console.log('Using coefficients from WebSocket sectors data');
            this.updateSectorCoefficients(websocketData.sectors);
        }
        
        // Пересоздаем доску если игра не активна
        if (this.cur_status === 'loading' || this.cur_status === 'ready') {
            console.log('Game not active, recreating board with WebSocket data...');
            this.createBoard();
        } else if (this.cur_status === 'game') {
            console.log('Game is active, saving WebSocket data for next game');
            this.pendingWebSocketData = websocketData;
        }
    } else {
        console.log('No valid WebSocket data received');
    }
};

Game.prototype.updateSectorCoefficients = function(sectors) {
    console.log('=== UPDATING SECTOR COEFFICIENTS FROM WEBSOCKET ===');
    console.log('Sectors data:', sectors);
    console.log('Current game status:', this.cur_status);
    
    // Создаем массив коэффициентов из WebSocket данных
    this.websocketCoefficients = {};
    
    // Обрабатываем секторы из WebSocket данных
    if (sectors && sectors.length > 0) {
        sectors.forEach(sector => {
            // Сохраняем коэффициент из WebSocket
            // sector.position это индекс массива (0-based), используем его как есть
            this.websocketCoefficients[sector.position] = sector.coefficient;
            console.log(`Sector ${sector.position + 1}: coefficient ${sector.coefficient}, isTrap: ${sector.isTrap}`);
        });
        
        // Всегда используем WebSocket коэффициенты, так как сервер отправляет правильные для каждого уровня
        console.log('Using WebSocket coefficients for level', this.cur_lvl);
        console.log('WebSocket coefficients received:', Object.values(this.websocketCoefficients));
        
        console.log('Final coefficients saved:', this.websocketCoefficients);
        console.log('Coefficients array:', Object.values(this.websocketCoefficients));
    } else {
        console.log('No sectors data received from WebSocket - using local coefficients');
        // Используем локальные коэффициенты если WebSocket данные пустые
        var levelCoeffs = SETTINGS.cfs[this.cur_lvl] || SETTINGS.cfs.easy;
        this.websocketCoefficients = {};
        levelCoeffs.forEach((coeff, index) => {
            this.websocketCoefficients[index] = coeff;
        });
        console.log('Local coefficients applied for level', this.cur_lvl, ':', this.websocketCoefficients);
    }
    
    // Не пересоздаем доску здесь - это делается в updateTrapsFromWebSocket
};

Game.prototype.requestTrapsFromWebSocket = function(level = null) {
    if (this.isWebSocketConnected) {
        const requestLevel = level || this.cur_lvl || 'easy';
        console.log('Requesting traps from WebSocket for level:', requestLevel);
        
        // Устанавливаем уровень и запрашиваем ловушки
        this.setWebSocketLevel(requestLevel);
        this.requestWebSocketTraps();
    } else {
        console.log('WebSocket not connected, waiting for connection...');
        this.waitForWebSocketConnection();
    }
};

Game.prototype.toggleWebSocketMode = function() {
    if (this.isWebSocketConnected) {
            console.log('WebSocket mode enabled');
            return true;
    } else {
            console.log('WebSocket not connected, attempting to connect...');
        this.connectWebSocket();
        return false;
    }
};

// Метод для обновления ловушек для всех уровней из WebSocket
Game.prototype.updateAllLevelsTrapsFromWebSocket = function(allLevelsData) {
    console.log('Updating traps for all levels from WebSocket:', allLevelsData);
    
    // Сохраняем данные для всех уровней
    if (!this.allLevelsTraps) {
        this.allLevelsTraps = {};
    }
    
    // Обновляем данные для каждого уровня
    Object.keys(allLevelsData).forEach(level => {
        const levelData = allLevelsData[level];
        this.allLevelsTraps[level] = {
            traps: levelData.traps,
            sectors: levelData.sectors,
            trapCount: levelData.trapCount,
            timestamp: levelData.timestamp
        };
        
        console.log(`Updated traps for level ${level}:`, levelData.traps);
    });
    
    // Если текущий уровень совпадает с одним из обновленных, применяем изменения только если игра не активна
    if (this.allLevelsTraps[this.cur_lvl]) {
        if (this.cur_status === 'game') {
            console.log(`Game is active, saving traps for current level ${this.cur_lvl} for next game`);
        } else {
            console.log(`Applying auto-generated traps for current level: ${this.cur_lvl}`);
            this.updateTrapsFromWebSocket(this.allLevelsTraps[this.cur_lvl]);
        }
    }
    
    var headers = {
        'Content-Type': 'application/json',
    };
    
    // Добавляем access_token если он есть
    if (window.ACCESS_TOKEN) {
        headers['Authorization'] = 'Bearer ' + window.ACCESS_TOKEN;
    }
    
}

// Инициализация состояния кнопки звука
$(document).ready(function(){
    if (SETTINGS.volume.active) {
        $('#sound_switcher').removeClass('off');
    } else {
        $('#sound_switcher').addClass('off');
    }
});

setTimeout( function(){ open_game(); }, 1000 );

// Обновляем кнопки MIN/MAX после загрузки конфигурации
$(document).ready(function(){
    // Ждем загрузки GAME_CONFIG и обновляем кнопки
    setTimeout(function() {
        if (window.GAME_CONFIG && window.GAME) {
            window.GAME.updateMinMaxButtons();
            console.log('Min/Max buttons updated after page load');
        }
    }, 1500);
});

