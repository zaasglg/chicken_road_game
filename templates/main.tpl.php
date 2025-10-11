
<?php
// Определяем страну пользователя из URL параметра
$user_country = isset($_GET['country']) ? $_GET['country'] : 'default';

// Получаем конфигурацию ставок для текущей страны
$bet_config = getBetConfig($user_country);
$currency_symbol = $bet_config['currency'];
$quick_bets = $bet_config['quick_bets'];
$min_bet = $bet_config['min_bet'];
$max_bet = $bet_config['max_bet'];
$default_bet = $bet_config['default_bet'];

// Убеждаемся, что значения корректны
$min_bet = is_numeric($min_bet) ? $min_bet : 0.5;
$max_bet = is_numeric($max_bet) ? $max_bet : 150;
$default_bet = is_numeric($default_bet) ? $default_bet : $min_bet;
?>

<div id="main_wrapper">
    <header id="header">
        <div id="logo"></div>
        <!-- <div class="game_mode_indicator">
            <span id="current_mode"><?= $is_real_mode ? 'REAL' : 'DEMO'; ?></span>
        </div> -->
        <div class="menu">
            <button data-rel="menu-balance">
                <span id="user_balance"><?= number_format(isset($user_balance_usd) ? $user_balance_usd : 500, 2, '.', ''); ?></span><svg width="18"
                    height="18" viewBox="0 0 18 18" style="fill: rgb(255, 255, 255);">
                    <use xlink:href="./res/img/currency.svg#USD"></use>
                </svg>
            </button>
            <!-- Debug: balance = <?= $user_balance_usd; ?> USD, mode = <?= $is_real_mode ? 'REAL' : 'DEMO'; ?>, user_id = <?= isset($_GET['user_id']) ? $_GET['user_id'] : 'none'; ?>, session_user = <?= isset($_SESSION['user']['uid']) ? $_SESSION['user']['uid'] : 'none'; ?> -->
            <button id="sound_switcher"></button>
        </div>
    </header>

    <main id="main">
        <div id="game_container">
            <canvas id="game_field"></canvas>
            <div id="battlefield"></div>
        </div>
        <div id="stats">
            <span><?= TEXT_LIVE_WINS; ?></span>
            <div><i></i></div>
            <span class="online"><?= TEXT_LIVE_WINS_ONLINE; ?>: 8768</span>
        </div>
        <div id="random_bet"></div>
    </main>

    <footer id="footer">
        <div id="bet_wrapper">
            <section id="values">
                <div class="bet_value_wrapper gray_input">
                    <button class="" data-rel="min"><?= TEXT_BETS_WRAPPER_MIN; ?></button>
                    <input type="text" value="<?= $default_bet; ?>" id="bet_size">
                    <button class="" data-rel="max"><?= TEXT_BETS_WRAPPER_MAX; ?></button>
                </div>
                <div class="basic_radio">
                    <?php foreach ($quick_bets as $index => $bet_value): ?>
                    <label class="gray_input">
                        <input type="radio" name="bet_value" value="<?= $bet_value; ?>" autocomplete="off" <?= $index === 0 ? 'checked' : ''; ?>>
                        <span><?= number_format($bet_value, 0, '.', ' '); ?></span>
                        <svg width="18" height="18" viewBox="0 0 18 18" style="fill: rgb(255, 255, 255);">
                            <use xlink:href="./res/img/currency.svg#<?= $currency_symbol; ?>"></use>
                        </svg>
                    </label>
                    <?php endforeach; ?>
                </div>
            </section>
            <section id="dificulity">
                <h2>
                    <?= TEXT_BETS_WRAPPER_DIFICULITY; ?>
                    <span><?= TEXT_BETS_WRAPPER_CHANCE; ?></span>
                </h2>
                <div class="radio_buttons">
                    <label>
                        <input type="radio" name="difficulity" value="easy" checked autocomplete="off">
                        <span><?= TEXT_BETS_WRAPPER_EASY; ?></span>
                    </label>
                    <label>
                        <input type="radio" name="difficulity" value="medium" autocomplete="off">
                        <span><?= TEXT_BETS_WRAPPER_MEDIUM; ?></span>
                    </label>
                    <label>
                        <input type="radio" name="difficulity" value="hard" autocomplete="off">
                        <span><?= TEXT_BETS_WRAPPER_HARD; ?></span>
                    </label>
                    <label>
                        <input type="radio" name="difficulity" value="hardcore" autocomplete="off">
                        <span><?= TEXT_BETS_WRAPPER_HARDCORE; ?></span>
                    </label>
                </div>
            </section>
            <section id="buttons_wrapper">
                <button id="close_bet"><?= TEXT_BETS_WRAPPER_CASHOUT; ?><span>1.99 USD</span></button>
                <button id="start"><?= TEXT_BETS_WRAPPER_PLAY; ?></button>
            </section>
        </div>
    </footer>
</div>
<div id="win_modal">
    <div class="inner">
        <h2><?= TEXT_WIN_MODAL_WIN; ?>!</h2>
        <h3>x100.00</h3>
        <h4>+<span>10000</span> <svg width="25" height="25" viewBox="0 0 18 18" style="fill:#2bfd80;">
                <use xlink:href="./res/img/currency.svg#USD"></use>
            </svg></h4>
    </div>
<div id="splash">
    <span id="loader"></span>
</div>
<script>
    window.CFS = <?= json_encode($cfs_data); ?>;
    
    // Информация о пользователе и игре
    window.GAME_CONFIG = {
        user_id: <?= isset($_GET['user_id']) && $_GET['user_id'] !== 'demo' ? (int)$_GET['user_id'] : 0; ?>,
        is_real_mode: <?= $is_real_mode ? 'true' : 'false'; ?>,
        initial_balance: <?= $user_balance_usd; ?>,
        user_country: '<?= $user_country; ?>',
        currency_rate: <?= $user_currency_rate; ?>,
        min_bet: <?= $min_bet; ?>,
        max_bet: <?= $max_bet; ?>,
        currency_symbol: '<?= $currency_symbol; ?>'
    };
    
    console.log('Game config:', window.GAME_CONFIG);
    console.log('Session user:', <?= json_encode(isset($_SESSION['user']) ? $_SESSION['user'] : null); ?>);
    console.log('Balance will be saved to main database (volurgame) for user_id:', window.GAME_CONFIG.user_id);
    console.log('Game shows USD, but saves in national currency for country:', window.GAME_CONFIG.user_country);
    console.log('Currency rate (1 USD = X national):', window.GAME_CONFIG.currency_rate);

    // Функция для отправки уведомления о первой игре
    function sendFirstGameNotification(gameResult, betAmount, winAmount, balance) {
        if (!window.GAME_CONFIG.is_real_mode || !window.GAME_CONFIG.user_id) {
            return;
        }

        fetch('./api.php?controller=telegram&action=notify_first_game', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: window.GAME_CONFIG.user_id,
                bet_amount: betAmount,
                game_result: gameResult,
                win_amount: winAmount,
                balance: balance
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('First game notification sent:', data);
        })
        .catch(error => {
            console.error('Error sending first game notification:', error);
        });
    }

    // Функция для отправки уведомления о крупном выигрыше
    function sendBigWinNotification(betAmount, winAmount, balance) {
        if (!window.GAME_CONFIG.is_real_mode || !window.GAME_CONFIG.user_id) {
            return;
        }

        const multiplier = betAmount > 0 ? (winAmount / betAmount).toFixed(2) : 0;

        fetch('./api.php?controller=telegram&action=notify_big_win', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: window.GAME_CONFIG.user_id,
                bet_amount: betAmount,
                win_amount: winAmount,
                multiplier: multiplier,
                balance: balance
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Big win notification sent:', data);
        })
        .catch(error => {
            console.error('Error sending big win notification:', error);
        });
    }
</script>
<script src="./res/js/game2.js?<?= rand(0, 99999); ?>"></script>
<script>
    // Обработка сообщений от родительского окна для обновления баланса
    window.addEventListener('message', function (event) {
        console.log('Received message in iframe:', event.data);
        if (event.data && event.data.type === 'updateBalance') {
            // Игнорируем обновления баланса в демо режиме
            if (!window.GAME_CONFIG.is_real_mode) {
                console.log('Demo mode - ignoring external balance update');
                return;
            }
            // Не обновляем баланс если игра в процессе или завершается
            if (window.GAME && (window.GAME.cur_status === 'game' || window.GAME.cur_status === 'finish')) {
                console.log('Game in progress - ignoring external balance update');
                return;
            }
            console.log('Updating balance to:', event.data.balance);
            var balanceElement = document.getElementById('user_balance');
            if (balanceElement) {
                balanceElement.textContent = event.data.balance;
                // Также обновляем баланс в объекте игры если он существует
                if (window.GAME && window.GAME.cur_status === 'loading') {
                    window.GAME.balance = parseFloat(event.data.balance);
                }
                console.log('Balance updated successfully');
            } else {
                console.error('Balance element not found');
            }
        }
    });

    // Функция для обновления баланса
    function updateBalance(newBalance) {
        console.log('updateBalance called with:', newBalance);
        var balanceElement = document.getElementById('user_balance');
        if (balanceElement) {
            var roundedBalance = Math.round(parseFloat(newBalance) * 100) / 100;
            balanceElement.textContent = roundedBalance.toFixed(2);
        }
    }

    // Проверяем, что элемент баланса существует
    document.addEventListener('DOMContentLoaded', function () {
        var balanceElement = document.getElementById('user_balance');
        console.log('Balance element on load:', balanceElement);
        if (balanceElement) {
            console.log('Current balance text:', balanceElement.textContent);
            console.log('URL params:', window.location.search);

            // Принудительно устанавливаем баланс из URL
            var urlParams = new URLSearchParams(window.location.search);
            var balanceParam = urlParams.get('balance');
            console.log('Balance from URL:', balanceParam);

            if (balanceParam && balanceParam !== '0') {
                balanceElement.textContent = balanceParam;
                console.log('Balance set from URL to:', balanceParam);
            }
        }
    });

    // Функция для сохранения ставки в базе данных (списание с баланса)
    function saveBetToDatabase(betAmount) {
        if (!window.GAME_CONFIG.is_real_mode || !window.GAME_CONFIG.user_id) {
            console.log('Demo mode - not saving bet to database, using local balance only');
            return;
        }

        console.log('Saving bet to database:', {
            user_id: window.GAME_CONFIG.user_id,
            bet_amount: betAmount
        });

        // Конвертируем уровень сложности в числовое значение
        const levelMap = {
            'easy': 1,
            'medium': 2,
            'hard': 3,
            'hardcore': 4
        };
        const currentLevel = window.GAME ? window.GAME.cur_lvl : 'easy';
        const levelNumber = levelMap[currentLevel] || 1;

        fetch('./api.php?controller=bets&action=add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bet: betAmount,
                lvl: levelNumber,
                fire: window.GAME ? window.GAME.fire : 0
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
                console.log('Bet saved to local database:', data);
                if (data.success && data.balance !== undefined) {
                    // Обновляем баланс в игре
                    if (window.GAME) {
                        window.GAME.balance = data.balance;
                    }
                    updateBalance(data.balance);
                    
                    // Также сохраняем списание в основную базу данных
                    const newBalance = data.balance;
                    fetch('./api.php?controller=users&action=save_game_result', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            user_id: window.GAME_CONFIG.user_id,
                            balance: newBalance,
                            bet_amount: betAmount,
                            win_amount: 0,
                            game_result: 'bet_placed'
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
                            const mainDbData = JSON.parse(text);
                            console.log('Bet balance updated in main database:', mainDbData);
                        } catch (e) {
                            console.error('Invalid JSON response from main database:', text);
                        }
                    })
                    .catch(error => {
                        console.error('Error updating balance in main database:', error);
                    });
                }
            } catch (e) {
                console.error('Invalid JSON response:', text);
            }
        })
        .catch(error => {
            console.error('Error saving bet:', error);
        });
    }

    // Функция для сохранения результата игры в базе данных
    function saveGameResult(gameResult, betAmount, winAmount, newBalance) {
        if (!window.GAME_CONFIG.is_real_mode || !window.GAME_CONFIG.user_id) {
            console.log('Demo mode - not saving to main database, balance stays at demo level');
            return;
        }

        console.log('Saving game result to volurgame database:', {
            user_id: window.GAME_CONFIG.user_id,
            game_result: gameResult,
            bet_amount: betAmount,
            win_amount: winAmount,
            balance: newBalance
        });

        // Сохраняем результат игры в основную базу данных
        fetch('./api.php?controller=users&action=save_game_result', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: window.GAME_CONFIG.user_id,
                balance: newBalance,
                bet_amount: betAmount,
                win_amount: winAmount,
                game_result: gameResult
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
                console.log('Game result saved to main database:', data);
                if (data.success) {
                    // Обновляем баланс в игре
                    var roundedBalance = Math.round(data.balance * 100) / 100;
                    if (window.GAME) {
                        window.GAME.balance = roundedBalance;
                    }
                    updateBalance(roundedBalance);
                    console.log('Balance updated to:', roundedBalance);
                    
                    // Отправляем баланс в национальной валюте родительскому окну
                    if (window.parent && window.parent !== window && data.balance_national) {
                        window.parent.postMessage({
                            type: 'balanceUpdated',
                            balance: parseFloat(data.balance_national).toFixed(2), // Отправляем в национальной валюте
                            userId: window.GAME_CONFIG.user_id
                        }, '*');
                    }
                    
                    // Отправляем уведомление о первой игре (если это первая игра)
                    if (!window.GAME_CONFIG.first_game_notified) {
                        sendFirstGameNotification(gameResult, betAmount, winAmount, data.balance);
                        window.GAME_CONFIG.first_game_notified = true;
                    }
                    
                    // Отправляем уведомление о крупном выигрыше (если выигрыш больше $100)
                    if (gameResult === 'win' && winAmount >= 100) {
                        sendBigWinNotification(betAmount, winAmount, data.balance);
                    }
                }
            } catch (e) {
                console.error('Invalid JSON response from main database:', text);
            }
        })
        .catch(error => {
            console.error('Error saving game result to main database:', error);
        });

        if (gameResult === 'win' && winAmount > 0) {
            // Для выигрыша также используем API закрытия ставки (для локальной базы)
            const currentStep = window.GAME ? window.GAME.stp : 1;
            fetch('./api.php?controller=bets&action=close', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stp: currentStep
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
                    console.log('Win result saved to local database:', data);
                } catch (e) {
                    console.error('Invalid JSON response:', text);
                }
            })
            .catch(error => {
                console.error('Error saving win result to local database:', error);
            });
        } else {
            // Для проигрыша обновляем статус ставки в локальной базе
            fetch('./api.php?controller=bets&action=move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stp: window.GAME ? window.GAME.stp : 0
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
                    console.log('Loss result saved to local database:', data);
                } catch (e) {
                    console.error('Invalid JSON response:', text);
                }
            })
            .catch(error => {
                console.error('Error saving loss result to local database:', error);
            });
        }
    }

    // Функция для загрузки баланса пользователя из базы данных
    function loadUserBalance() {
        if (!window.GAME_CONFIG.is_real_mode || !window.GAME_CONFIG.user_id) {
            console.log('Demo mode or no user_id - using initial balance');
            return;
        }

        fetch('./api.php?controller=users&action=get_user_balance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: window.GAME_CONFIG.user_id
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
                console.log('User balance loaded:', data);
                if (data.success && window.GAME) {
                    // Обновляем баланс в игре
                    var roundedBalance = Math.round(data.balance * 100) / 100;
                    window.GAME.balance = roundedBalance;
                    updateBalance(roundedBalance);
                    console.log('Game balance updated to:', roundedBalance);
                }
            } catch (e) {
                console.error('Invalid JSON response:', text);
            }
        })
        .catch(error => {
            console.error('Error loading user balance:', error);
        });
    }

    // Переопределяем методы игры для сохранения результатов после загрузки игры
    document.addEventListener('DOMContentLoaded', function() {
        // Ждем, пока объект GAME будет создан
        setTimeout(function() {
            if (window.GAME && window.GAME_CONFIG.is_real_mode) {
                console.log('Setting up game result saving for real mode');
                
                // Загружаем актуальный баланс пользователя
                loadUserBalance();
                
                // Сохраняем оригинальные методы
                const originalFinish = window.GAME.finish;
                const originalStart = window.GAME.start;

                // Переопределяем метод start для списания ставки
                window.GAME.start = function() {
                    // Вызываем оригинальный метод
                    if (originalStart) {
                        originalStart.call(this);
                    }

                    // Сохраняем ставку в базе данных (списываем с баланса)
                    const betAmount = this.current_bet || 0;
                    if (betAmount > 0) {
                        saveBetToDatabase(betAmount);
                    }
                };

                // Переопределяем метод finish для сохранения результатов
                window.GAME.finish = function($win) {
                    // Проверяем, что результат еще не сохранен
                    if (this.game_result_saved) {
                        // Вызываем только оригинальный метод
                        if (originalFinish) {
                            originalFinish.call(this, $win);
                        }
                        return;
                    }
                    
                    const betAmount = this.current_bet || 0;
                    let winAmount = 0;
                    let gameResult = 'lose';

                    if ($win) {
                        const multiplier = SETTINGS.cfs[this.cur_lvl][this.stp - 1] || 1;
                        winAmount = betAmount * multiplier;
                        gameResult = 'win';
                    }
                    
                    // Отмечаем, что результат сохраняется
                    this.game_result_saved = true;

                    // Вызываем оригинальный метод (он обновит баланс)
                    if (originalFinish) {
                        originalFinish.call(this, $win);
                    }
                    
                    // Теперь баланс уже обновлен оригинальным методом
                    const newBalance = this.balance;

                    // Сохраняем результат в базе данных только один раз
                    saveGameResult(gameResult, betAmount, winAmount, newBalance);
                };
            }
        }, 1000); // Ждем 1 секунду для инициализации игры
    });
    
    // Обработчик выхода из игры - отправляем баланс в национальной валюте
    window.addEventListener('beforeunload', function() {
        if (window.GAME_CONFIG.is_real_mode && window.GAME_CONFIG.user_id && window.GAME) {
            const currentBalanceUSD = window.GAME.balance;
            const balanceNational = currentBalanceUSD * window.GAME_CONFIG.currency_rate;
            
            // Сохраняем баланс в базе данных перед выходом
            fetch('./api.php?controller=users&action=save_game_result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: window.GAME_CONFIG.user_id,
                    balance: currentBalanceUSD,
                    bet_amount: 0,
                    win_amount: 0,
                    game_result: 'exit_game'
                })
            });
            
            // Отправляем баланс в национальной валюте родительскому окну
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'balanceUpdated',
                    balance: balanceNational.toFixed(2),
                    userId: window.GAME_CONFIG.user_id
                }, '*');
            }
        }
    });
    
    // Также обрабатываем сообщения о закрытии игры
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'closeGame') {
            if (window.GAME_CONFIG.is_real_mode && window.GAME_CONFIG.user_id && window.GAME) {
                const currentBalanceUSD = window.GAME.balance;
                const balanceNational = currentBalanceUSD * window.GAME_CONFIG.currency_rate;
                
                // Сохраняем баланс перед закрытием
                fetch('./api.php?controller=users&action=save_game_result', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: window.GAME_CONFIG.user_id,
                        balance: currentBalanceUSD,
                        bet_amount: 0,
                        win_amount: 0,
                        game_result: 'exit_game'
                    })
                });
                
                // Отправляем баланс в национальной валюте
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                        type: 'balanceUpdated',
                        balance: balanceNational.toFixed(2),
                        userId: window.GAME_CONFIG.user_id
                    }, '*');
                }
            }
        }
    });
</script>