<?php
    //$_SESSION['user'] = Users::GI()->get([ 'uid'=>UID ]);
    //include_once BASE_DIR ."common.php";  
?>
<div id="main_wrapper"> 
    <header id="header">
        <a href="/" id="logo"></a>
        <div class="menu">
            <button data-rel="menu-balance"> 
                <span>500</span><svg width="18" height="18" viewBox="0 0 18 18" style="fill: rgb(255, 255, 255);"><use xlink:href="./res/img/currency.svg#USD"></use></svg>
            </button>
            <button id="sound_switcher"></button>
        </div>
    </header>

    <main id="main"> 
        <div id="game_container"> 
            <canvas id="game_field"></canvas>
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
                    <input type="text" value="0.5" id="bet_size">
                    <button class="" data-rel="max"><?= TEXT_BETS_WRAPPER_MAX; ?></button>
                </div>
                <div class="basic_radio">
                    <label class="gray_input">
                        <input type="radio" name="bet_value" value="0.5" autocomplete="off">
                        <span>0.5</span> 
                        <svg width="18" height="18" viewBox="0 0 18 18" style="fill: rgb(255, 255, 255);"><use xlink:href="./res/img/currency.svg#USD"></use></svg>
                    </label>
                    <label class="gray_input">
                        <input type="radio" name="bet_value" value="1" autocomplete="off">
                        <span>1</span> 
                        <svg width="18" height="18" viewBox="0 0 18 18" style="fill: rgb(255, 255, 255);"><use xlink:href="./res/img/currency.svg#USD"></use></svg>
                    </label>
                    <label class="gray_input">
                        <input type="radio" name="bet_value" value="2" autocomplete="off">
                        <span>2</span> 
                        <svg width="18" height="18" viewBox="0 0 18 18" style="fill: rgb(255, 255, 255);"><use xlink:href="./res/img/currency.svg#USD"></use></svg>
                    </label>
                    <label class="gray_input">
                        <input type="radio" name="bet_value" value="7" autocomplete="off">
                        <span>7</span> 
                        <svg width="18" height="18" viewBox="0 0 18 18" style="fill: rgb(255, 255, 255);"><use xlink:href="./res/img/currency.svg#USD"></use></svg>
                    </label>
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
        <h4>+<span>10000</span> <svg width="25" height="25" viewBox="0 0 18 18" style="fill:#2bfd80;"><use xlink:href="./res/img/currency.svg#USD"></use></svg></h4>
    </div>
</div>
<div id="splash">
    <span id="loader"></span>
    <div class="disclaimer">
        <h4><img src="./res/img/icon-help.svg" alt=""></h4>
        <p><?= TEXT_ETRY_MODAL_MAIN; ?></p>
        <button><?= TEXT_ENTRY_MODAL_BTN_OK; ?></button>
    </div>
</div>
<div id="overlay"></div>
<script src="./res/js/game.js?<?= rand(0, 99999); ?>"></script>