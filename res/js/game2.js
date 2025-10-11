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
    currency: $('body').attr('data-currency') ? $('body').attr('data-currency')  : "USD", 
    cfs: window.CFS || {
        easy: [ 1.02, 1.04, 1.06, 1.08, 1.10, 1.12, 1.14, 1.16, 1.18, 1.20, 1.22, 1.24, 1.26, 1.28, 1.30, 1.32, 1.34, 1.36, 1.38, 1.40, 1.42, 1.44, 1.46, 1.48 ], 
        medium: [ 1.05, 1.10, 1.15, 1.20, 1.25, 1.30, 1.35, 1.40, 1.45, 1.50, 1.55, 1.60, 1.65, 1.70, 1.75, 1.80, 1.85, 1.90, 1.95, 2.00, 2.05, 2.10 ],  
        hard: [ 1.08, 1.16, 1.24, 1.32, 1.40, 1.48, 1.56, 1.64, 1.72, 1.80, 1.88, 1.96, 2.04, 2.12, 2.20, 2.28, 2.36, 2.44, 2.52, 2.60 ], 
        hardcore: [ 1.10, 1.20, 1.30, 1.40, 1.50, 1.60, 1.70, 1.80, 1.90, 2.00, 2.10, 2.20, 2.30, 2.40 ]
    },  
    chance: {
        easy: [ 3, 8 ], 
        medium: [ 2, 6 ], 
        hard: [ 1, 4 ], 
        hardcore: [ 1, 3 ]
    },
    min_bet: 0.5, 
    max_bet: 150, 
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
        var balanceParam = urlParams.get('balance');
        var userIdParam = urlParams.get('user_id');
        var demoParam = urlParams.get('demo');
        var countryParam = urlParams.get('country');
        var langParam = urlParams.get('lang');
        var accessTokenParam = urlParams.get('access_token');
        
        // Сохраняем access_token в глобальной переменной
        if (accessTokenParam) {
            window.ACCESS_TOKEN = accessTokenParam;
            console.log('Access token set from URL:', accessTokenParam);
        }
        
        // Устанавливаем валюту на основе страны
        if (countryParam) {
            var currencyMap = {
                'Venezuela': 'VES',
                'Colombia': 'COP',
                'Ecuador': 'ECS',
                'Costa Rica': 'CRC',
                'Paraguay': 'PYG',
                'Mexico': 'MXN',
                'Argentina': 'ARS',
                'Brazil': 'BRL'
            };
            var currency = currencyMap[countryParam] || 'USD';
            SETTINGS.currency = currency;
            console.log('Currency set from country:', countryParam, '->', currency);
            
            // Обновляем валюту в интерфейсе
            $('svg use').attr('xlink:href', './res/img/currency.svg#' + currency);
        }
        
        // Устанавливаем язык
        if (langParam) {
            console.log('Language set from URL:', langParam);
            // Здесь можно добавить логику смены языка
        }
        
        // Initialize balance with proper error handling
        const balanceElement = $('[data-rel="menu-balance"] span');
        const balanceText = balanceElement.length > 0 ? balanceElement.html() : '0';
        this.balance = parseFloat(balanceText) || 0;
        
        // Если это демо режим, устанавливаем 500 USD
        if (userIdParam === 'demo' || !userIdParam || demoParam === 'true') {
            this.balance = 500;
            $('[data-rel="menu-balance"] span').html( this.balance.toFixed(2) );
            console.log('Demo mode activated - balance set to 500');
        } else if (balanceParam) {
            // Если указан баланс в URL, используем его
            this.balance = parseFloat(balanceParam);
            $('[data-rel="menu-balance"] span').html( this.balance.toFixed(2) );
            console.log('Balance set from URL:', this.balance);
        }
        
        // Fallback to window.GAME_CONFIG.balance if available
        if (this.balance === 0 && window.GAME_CONFIG && window.GAME_CONFIG.balance) {
            this.balance = window.GAME_CONFIG.balance;
            console.log('Using fallback balance from GAME_CONFIG:', this.balance);
        }
        
        console.log('Game constructor - balance element found:', balanceElement.length > 0, 'balance text:', balanceText, 'parsed balance:', this.balance);
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
    } 
    // Генерируем локальные трапы на основе коэффициентов
    generateLocalTraps() {
        const cfs = SETTINGS.cfs[this.cur_lvl];
        const traps = [];
        
        // Сначала создаем все секторы как безопасные
        for (let i = 0; i < cfs.length; i++) {
            traps.push({
                position: i,
                coefficient: cfs[i],
                isTrap: false
            });
        }
        
        // Определяем количество трапов в зависимости от уровня сложности
        let trapCount;
        switch(this.cur_lvl) {
            case 'easy':
                trapCount = Math.floor(Math.random() * 4) + 3; // 3-6 трапов (увеличено)
                break;
            case 'medium':
                trapCount = Math.floor(Math.random() * 5) + 4; // 4-8 трапов (увеличено)
                break;
            case 'hard':
                trapCount = Math.floor(Math.random() * 6) + 5; // 5-10 трапов (увеличено)
                break;
            case 'hardcore':
                trapCount = Math.floor(Math.random() * 7) + 7; // 7-13 трапов (увеличено)
                break;
            default:
                trapCount = Math.floor(Math.random() * 4) + 3;
        }
        
        // Создаем массив доступных позиций
        const availablePositions = [];
        
        // Добавляем возможность трапа в первом секторе с минимальным шансом (5%)
        if (Math.random() < 0.05) {
            availablePositions.push(0); // Первый сектор (индекс 0)
            console.log('First sector trap chance activated!');
        }
        
        // Добавляем остальные позиции, начиная с 2-го сектора (индекс 1)
        for (let i = 1; i < cfs.length; i++) {
            availablePositions.push(i);
        }
        
        // Перемешиваем позиции
        for (let i = availablePositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
        }
        
        // Размещаем трапы на случайных позициях
        for (let i = 0; i < Math.min(trapCount, availablePositions.length); i++) {
            const position = availablePositions[i];
            traps[position].isTrap = true;
        }
        
        this.localTraps = traps;
        this.traps = traps.filter(t => t.isTrap).map(t => t.position + 1);
        console.log('Local traps generated for level', this.cur_lvl, ':', this.traps);
        console.log('Trap positions:', this.traps);
        
        if (this.cur_status === 'loading') {
            this.updateTraps();
        }
        // Если ждем начала игры - запускаем ее
        if (this.waitingForTraps && this.pendingGameStart) {
            this.updateTraps();
            this.actuallyStartGame();
        }
        
        return traps;
    }
    
    // Метод для правильного позиционирования курицы
    positionChicken() {
        // Ждем, пока DOM обновится
        setTimeout(() => {
            const $chick = $('#chick');
            if ($chick.length) {
                // Устанавливаем правильное позиционирование
                $chick.css({
                    'position': 'absolute',
                    'bottom': '50px',
                    'left': (SETTINGS.segw / 2) + 'px',
                    'z-index': '10'
                });
                
                // Убеждаемся, что курица видна
                $chick.show();
                console.log('Chicken positioned at:', $chick.css('left'), $chick.css('bottom'));
            }
        }, 100);
    }
    
    create(){
        this.traps = null;
        this.isMoving = false; // Сбрасываем флаг движения
        this.wrap.html('').css('left', 0);
        // Генерируем локальные трапы
        this.generateLocalTraps();
        // Создаем поле
        this.createBoard();
    }
    createBoard() {
        var $arr = SETTINGS.cfs[ this.cur_lvl ]; 
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
        if (this.traps && this.traps.length > 0) {
            flameSegments = this.traps;
            this.fire = this.traps[0];
        } else {
            // Генерируем локальные трапы если их нет
            this.generateLocalTraps();
            if (this.traps && this.traps.length > 0) {
                this.fire = this.traps[0];
                flameSegments = this.traps;
            } else {
                var chance = SETTINGS.chance[this.cur_lvl];
                var maxTrap = chance[Math.random() > 0.95 ? 1 : 0];
                this.fire = Math.ceil(Math.random() * maxTrap);
                flameSegments = [this.fire];
            }
        }
        
        console.log('Fire position:', this.fire, 'Flame segments:', flameSegments);
        
        for( var $i=0; $i<$arr.length; $i++ ){
            // Determine if this sector is a flame - сектора нумеруются с 1, но массив с 0
            var sectorId = $i + 1;
            var isFlame = flameSegments.includes(sectorId);
            var coeff = $arr[$i];
            console.log('Sector', sectorId, 'isFlame:', isFlame, 'coeff:', coeff);
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

        this.wrap.append(`<div id="chick" state="idle"><div class="inner"></div></div>`);
        this.wrap.append(`<div id="fire"></div>`); 
        var $flame_x = document.querySelector('.sector[flame="1"]'); 
        $flame_x = $flame_x ? $flame_x.offsetLeft : 0; 
        $('#fire').css('left', $flame_x +'px')

        SETTINGS.segw = parseInt( $('#battlefield .sector').css('width') );
        
        // Убеждаемся, что курица правильно позиционирована
        this.positionChicken(); 

        var $scale = (SETTINGS.segw/(250/100)*(70/100)/100);
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
        var $arr = SETTINGS.cfs[ this.cur_lvl ]; 
        this.wrap.append(`<div class="sector start" data-id="0">
                                <div class="breaks" breaks="3"></div>
                                <div class="breaks" breaks="2"></div>
                                <img src="./res/img/arc.png" class="entry" alt="">
                                <div class="border"></div>
                            </div>`); 
        var $flame_segment;
        if (window.GAME_CONFIG && window.GAME_CONFIG.is_real_mode && Math.random() < 0.2) {
            $flame_segment = 1;
        } else {
            $flame_segment = Math.ceil( Math.random() * SETTINGS.chance[ this.cur_lvl ][ Math.round( Math.random() * 100  ) > 95 ? 1 : 0 ] );
        }
        this.fire = $flame_segment; 
        for( var $i=0; $i<$arr.length; $i++ ){
            if( $i == $arr.length - 1 ){
                this.wrap.append(`<div class="sector finish" data-id="${ $i+1 }" ${ $i == $flame_segment ? 'flame="1"' : '' } style="position: relative;">
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
                this.wrap.append(`<div class="sector ${ $i ? 'far' : '' }" data-id="${ $i+1 }" ${ $i == $flame_segment ? 'flame="1"' : '' } style="position: relative;">
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

        this.wrap.append(`<div id="chick" state="idle"><div class="inner"></div></div>`);

        this.wrap.append(`<div id="fire"></div>`); 
        var $flame_x = document.querySelector('.sector[flame="1"]'); 
        $flame_x = $flame_x ? $flame_x.offsetLeft : 0; 
        $('#fire').css('left', $flame_x +'px')

        SETTINGS.segw = parseInt( $('#battlefield .sector').css('width') ); 

        var $scale = (SETTINGS.segw/(250/100)*(70/100)/100);
        $('#chick').css( 'left', ( SETTINGS.segw / 2 )+'px' );//.css('bottom', ( 60*$scale )+'px' ); 
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
        const balanceElement = $('[data-rel="menu-balance"] span');
        const balanceText = balanceElement.length > 0 ? balanceElement.html() : '0';
        this.balance = parseFloat(balanceText) || 0;
        console.log('Balance refreshed from DOM:', this.balance);
        return this.balance;
    }
    
    start(){ 
        console.log('GAME.start() called');
        // Refresh balance from DOM before starting
        this.refreshBalance();
        this.current_bet = +$('#bet_size').val();
        console.log('Current bet:', this.current_bet, 'Balance:', this.balance);
        if( this.current_bet && this.current_bet <= this.balance && this.current_bet > 0 ){ 
            console.log('Starting game...');
            // Генерируем локальные трапы перед началом игры
            this.generateLocalTraps();
            
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
        $('[data-rel="menu-balance"] span').html( this.balance.toFixed(2) ); 
        if (window.GAME_CONFIG && window.GAME_CONFIG.is_real_mode) {
            updateBalanceOnServer(this.balance);
        }
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
        
        $('#overlay').show(); 
        this.cur_status = "finish"; 
        this.alife = 0; 
        CHICKEN.alife = 0; 
        
        // Уведомляем сервер об окончании игры
        // Локальная игра - не нужно отправлять на сервер
        
        var $award = 0;
        if( $win ){ 
            this.win = 1; 
            $('#fire').addClass('active');
            $award = ( this.current_bet * SETTINGS.cfs[ this.cur_lvl ][ this.stp - 1 ] ); 
            $award = $award ? $award : 0; 
            //console.log("AWARD: "+ $award);
            this.balance += $award; 
            this.balance = Math.round(this.balance * 100) / 100; // Округляем до 2 знаков
            // Принудительно обновляем отображение баланса в интерфейсе
            $('[data-rel="menu-balance"] span').html( this.balance.toFixed(2) );
            if (window.GAME_CONFIG && window.GAME_CONFIG.is_real_mode) {
                updateBalanceOnServer(this.balance);
            }
            if( SETTINGS.volume.sound ){ SOUNDS.win.play(); } 
            $('#win_modal').css('display', 'flex');
            $('#win_modal h3').html( 'x'+ SETTINGS.cfs[ this.cur_lvl ][ this.stp - 1 ] );
            $('#win_modal h4 span').html( $award.toFixed(2) );
        } 
        else {
            // При проигрыше также обновляем баланс в интерфейсе
            this.balance = Math.round(this.balance * 100) / 100; // Округляем до 2 знаков
            $('[data-rel="menu-balance"] span').html( this.balance.toFixed(2) );
            if( SETTINGS.volume.sound ){ SOUNDS.lose.play(); } 
        }
        
        // Сохраняем результат игры в базе данных только один раз
        console.log('Game result saved flag:', this.game_result_saved);
        console.log('GAME_CONFIG:', window.GAME_CONFIG);
        console.log('Is real mode:', window.GAME_CONFIG && window.GAME_CONFIG.is_real_mode);
        
        // Всегда отправляем API запрос, если есть access_token
        if (!this.game_result_saved && window.ACCESS_TOKEN) {
            console.log('Sending API request...');
            this.game_result_saved = true;
            
            // Отправляем напрямую в API
            console.log('Calling sendGameResultToAPI...');
            this.sendGameResultToAPI($win, this.current_bet, $award, this.balance);
        } else if (!this.game_result_saved && window.GAME_CONFIG && window.GAME_CONFIG.is_real_mode) {
            console.log('Saving game result...');
            this.game_result_saved = true;
            saveGameResult($win ? 'win' : 'lose', this.current_bet, $award, this.balance);
            
            // Также отправляем напрямую в API
            console.log('Calling sendGameResultToAPI...');
            this.sendGameResultToAPI($win, this.current_bet, $award, this.balance);
        } else {
            console.log('Skipping game result save - already saved or no access token');
        }
        
        setTimeout(
            function(){ 
                $('#overlay').hide(); 
                $('#win_modal').hide(); 
                // Принудительно обновляем баланс после завершения игры
                $('[data-rel="menu-balance"] span').html( GAME.balance.toFixed(2) );
                GAME.cur_status = "loading"; 
                GAME.game_result_saved = false; // Сбрасываем флаг для новой игры
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
        
        var $chick = $('#chick'); 
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
            // Move chick to next sector
            var $nx = $cur_x + SETTINGS.segw + 'px';
            $chick.css('left', $nx);
            
            // Убеждаемся, что курица не "упала" вниз
            $chick.css('bottom', '50px');
            // Highlight sectors
            var $prevSector = $('.sector').removeClass('active');
            var $sector = $('.sector').eq(this.stp);
            $('.sector').removeClass('active');
            if(this.stp > 0) $('.sector').eq(this.stp-1).addClass('complete');
            $sector.addClass('active');
            $sector.next().removeClass('far');
            $('.trigger', $sector).addClass('activated');
            // Check for flame - проверяем, есть ли текущий шаг в списке ловушек
            var currentSectorId = this.stp + 1; // Добавляем 1, так как stp начинается с 0, а секторы с 1
            var trapsArray = [];
            if (Array.isArray(this.traps)) {
                trapsArray = this.traps;
            } else if (this.traps && this.traps.traps && Array.isArray(this.traps.traps)) {
                trapsArray = this.traps.traps;
            }
            var isFlame = trapsArray.includes(currentSectorId);
            console.log('Step:', this.stp, 'Sector ID:', currentSectorId, 'Traps:', this.traps, 'TrapsArray:', trapsArray, 'Is flame:', isFlame);
            
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
                $('#close_bet').css('display', 'flex'); 
                var $award = ( this.current_bet * SETTINGS.cfs[ this.cur_lvl ][ this.stp - 1 ] ); 
                    $award = $award ? $award.toFixed(2) : 0; 
                $('#close_bet span').html( $award +' '+ SETTINGS.currency ).css('display', 'flex');
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
        if( this.cur_status !== 'finish' ){
            $('[data-rel="menu-balance"] span').html( this.balance.toFixed(2) );
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
                $.post('./api.php', { action: 'save_sound_settings', sound: $val ? 1 : 0 });
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
                $.post('./api.php', { action: 'save_music_settings', music: $val ? 1 : 0 });
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
            
            // установка ставки в инпуте
            $('#bet_size').off().on('change', function(){ 
                if( GAME.cur_status == 'loading' ){
                    var $self=$(this); 
                    var $val= +$self.val(); 
                    $val = $val < SETTINGS.min_bet ? SETTINGS.min_bet : ( $val > SETTINGS.max_bet ? SETTINGS.max_bet : $val ); 
                    $val = $val > GAME.balance ? GAME.balance : $val; 
                    $self.val( $val ); 
                }
            });
            // установка ставки кнопками min max
            $('.bet_value_wrapper button').off().on('click', function(){ 
                if( GAME.cur_status == 'loading' ){ 
                    if( SETTINGS.volume.sound ){ SOUNDS.button.play(); } 
                    var $self=$(this); 
                    var $rel = $self.data('rel'); 
                    switch( $rel ){
                        case "min": 
                            $('#bet_size').val( SETTINGS.min_bet );
                            break; 
                        case "max": 
                            $('#bet_size').val( Math.min(SETTINGS.max_bet, GAME.balance) );
                            break; 
                    }
                }
            });
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
                var $scale = ( SETTINGS.segw/(250/100)*(70/100)/100 );
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
        
        // Проверяем токен
        if (window.ACCESS_TOKEN) {
            this.checkTokenValidity(window.ACCESS_TOKEN);
        }
        console.log('Game result:', gameResult);
        console.log('Bet amount:', betAmount);
        console.log('Win amount:', winAmount);
        console.log('Final balance:', finalBalance);
        
        if (!window.ACCESS_TOKEN) {
            console.log('No access token - skipping API call');
            return;
        }
        
        // Определяем тип операции на основе результата игры
        var operation = gameResult ? 'win' : 'loss';
        var depositAmount = gameResult ? winAmount : -betAmount; // При выигрыше добавляем, при проигрыше списываем
        
        var headers = {
            'Authorization': 'Bearer ' + window.ACCESS_TOKEN,
            'Content-Type': 'application/json',
        };
        
        var requestData = {
            deposit: depositAmount.toFixed(2),
        };
        
        console.log('Sending game result to API:', requestData);
        console.log('Headers:', headers);
        
        // Пробуем разные методы отправки
        this.tryAPIMethods(headers, requestData);
        
        console.log('=== API CALL END ===');
    }
    
    // Метод для попытки разных способов отправки API запроса
    tryAPIMethods(headers, requestData) {
        console.log('Trying different API methods...');
        
        // Метод 1: Стандартный fetch с JSON
        this.tryFetchJSON(headers, requestData)
            .catch(error => {
                console.log('Method 1 (JSON) failed:', error.message);
                
                // Метод 2: Fetch с FormData
                return this.tryFetchFormData(headers, requestData);
            })
            .catch(error => {
                console.log('Method 2 (FormData) failed:', error.message);
                
                // Метод 3: XMLHttpRequest
                return this.tryXHR(headers, requestData);
            })
            .catch(error => {
                console.log('Method 3 (XHR) failed:', error.message);
                
                // Метод 4: Сохранение в localStorage как fallback
                this.saveToLocalStorage(requestData);
            });
    }
    
    // Метод 1: Стандартный fetch с JSON
    async tryFetchJSON(headers, requestData) {
        console.log('Trying fetch with JSON...');
        
        const response = await fetch('https://api.valor-games.co/api/user/deposit/', {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(requestData)
        });
        
        console.log('JSON fetch response status:', response.status);
        
        if (!response.ok) {
            throw new Error('JSON fetch failed: ' + response.status);
        }
        
        const data = await response.json();
        console.log('JSON fetch success:', data);
        this.handleAPISuccess(data);
        return data;
    }
    
    // Метод 2: Fetch с FormData
    async tryFetchFormData(headers, requestData) {
        console.log('Trying fetch with FormData...');
        
        const formData = new FormData();
        formData.append('deposit', requestData.deposit);
        
        // Убираем Content-Type для FormData
        const formHeaders = { ...headers };
        delete formHeaders['Content-Type'];
        
        const response = await fetch('https://api.valor-games.co/api/user/deposit/', {
            method: 'PUT',
            headers: formHeaders,
            body: formData
        });
        
        console.log('FormData fetch response status:', response.status);
        
        if (!response.ok) {
            throw new Error('FormData fetch failed: ' + response.status);
        }
        
        const data = await response.json();
        console.log('FormData fetch success:', data);
        this.handleAPISuccess(data);
        return data;
    }
    
    // Метод 3: XMLHttpRequest
    tryXHR(headers, requestData) {
        console.log('Trying XMLHttpRequest...');
        
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', 'https://api.valor-games.co/api/user/deposit/', true);
            
            // Устанавливаем заголовки
            Object.keys(headers).forEach(key => {
                xhr.setRequestHeader(key, headers[key]);
            });
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log('XHR response status:', xhr.status);
                    
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            console.log('XHR success:', data);
                            this.handleAPISuccess(data);
                            resolve(data);
                        } catch (e) {
                            reject(new Error('XHR JSON parse error: ' + e.message));
                        }
                    } else {
                        reject(new Error('XHR failed: ' + xhr.status));
                    }
                }
            }.bind(this);
            
            xhr.onerror = function() {
                reject(new Error('XHR network error'));
            };
            
            xhr.send(JSON.stringify(requestData));
        });
    }
    
    // Метод 4: Сохранение в localStorage как fallback
    saveToLocalStorage(requestData) {
        console.log('Saving to localStorage as fallback...');
        
        const gameData = {
            timestamp: Date.now(),
            deposit: requestData.deposit,
            user_id: window.GAME_CONFIG ? window.GAME_CONFIG.user_id : 'unknown',
            url: window.location.href
        };
        
        // Получаем существующие данные
        const existingData = JSON.parse(localStorage.getItem('failed_api_calls') || '[]');
        existingData.push(gameData);
        
        // Сохраняем только последние 50 записей
        if (existingData.length > 50) {
            existingData.splice(0, existingData.length - 50);
        }
        
        localStorage.setItem('failed_api_calls', JSON.stringify(existingData));
        
        console.log('Saved to localStorage:', gameData);
        console.log('Total failed calls:', existingData.length);
        
        // Показываем уведомление пользователю
        this.showFallbackNotification();
    }
    
    // Обработка успешного API ответа
    handleAPISuccess(data) {
        console.log('API success, updating balance...');
        
        // Обновляем баланс в интерфейсе после успешного API запроса
        if (data && data.balance !== undefined) {
            this.balance = parseFloat(data.balance);
            $('[data-rel="menu-balance"] span').html(this.balance.toFixed(2));
            console.log('Balance updated from API:', this.balance);
        }
        
        // Отправляем сообщение родительскому окну об обновлении баланса
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'balanceUpdated',
                balance: this.balance,
                userId: window.GAME_CONFIG.user_id
            }, '*');
        }
    }
    
    // Показ уведомления о fallback
    showFallbackNotification() {
        // Создаем простое уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ffc107;
            color: #000;
            padding: 15px;
            border-radius: 5px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        notification.innerHTML = `
            <strong>⚠️ API недоступен</strong><br>
            Данные сохранены локально.<br>
            <small>Попробуйте позже или обратитесь к администратору.</small>
        `;
        
        document.body.appendChild(notification);
        
        // Убираем уведомление через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
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
    
    // Refresh balance from DOM when game opens
    if (GAME && typeof GAME.refreshBalance === 'function') {
        GAME.refreshBalance();
        console.log('Balance refreshed in open_game():', GAME.balance);
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
    }

    requestAnimationFrame( render );
}

render(); 

function updateBalanceOnServer(balance) {
    if (!window.GAME_CONFIG.is_real_mode || !window.GAME_CONFIG.user_id) {
        console.log('Demo mode - not updating server balance');
        return;
    }
    
    var headers = {
        'Content-Type': 'application/json',
    };
    
    // Добавляем access_token если он есть
    if (window.ACCESS_TOKEN) {
        headers['Authorization'] = 'Bearer ' + window.ACCESS_TOKEN;
    }
    
    fetch('./api.php?controller=users&action=update_balance', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            user_id: window.GAME_CONFIG.user_id,
            balance: balance,
            access_token: window.ACCESS_TOKEN || null
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(text => {
        try {
            const data = JSON.parse(text);
            console.log('Balance updated on server:', data);
        } catch (e) {
            console.error('Invalid JSON response:', text);
        }
    })
    .catch(error => {
        console.error('Failed to update balance on server:', error);
    });
}

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

