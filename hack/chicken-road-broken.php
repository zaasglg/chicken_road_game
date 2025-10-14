<?php
session_start();
include 'overlaying.php';

// Проверяем, вошел ли пользователь
if (!isset($_SESSION['user_id'])) {
    header("Location: index.php"); // Перенаправление на страницу входа
    exit();
}
?>

<!DOCTYPE html>
<html lang="en" translate="no">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="google" content="notranslate" />
  <link rel="stylesheet" href="./css/main.css" />
  <link rel="stylesheet" href="./css/chicken-road.css" />
  <link rel="stylesheet" href="./css/icons.css" />
  <link rel="stylesheet" href="./css/style.css" />
  <title>🐔 Chicken Road Bot - Hack Predictor</title>
  <link rel="icon" href="./images/chicken-road-fav.png" />
  <link rel="canonical" href />
  <script src="./js/jquery.js"></script>
  <script>
    // Дополнительная подстраховка для загрузки
    window.addEventListener('load', function() {
      [].slice.call(document.querySelectorAll('.chicken, .road-block')).forEach(function(el) {
        el.style.backgroundImage = el.style.backgroundImage;
      });
    });

    (function() {
      const images = [
        '../images/chicken.png',
        '../images/road-block.png'
      ];
  
      images.forEach(img => {
        new Image().src = img;
      });
    })();
  </script>
  <style>
    .game-tile._win {
      background-image: url("../images/chicken.png") !important;
    }
    .game-tile._lose {
      background-image: url("../images/road-block.png") !important;
    }

    html,
    body {
      overflow-y: auto !important;
      height: auto !important;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f0f23, #1a1a2e, #16213e);
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    body {
      position: relative;
      padding-bottom: 80px;
    }

    #tbg {
      position: absolute;
      z-index: -1;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0f0f23, #1a1a2e, #16213e);
    }

    #app {
      position: relative;
      z-index: 5;
    }

    #post-message-size {
      max-width: 420px;
      margin: 0 auto;
    }

    .game-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 15px 20px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .game-header img {
      max-width: 200px;
      height: auto;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
    }

    .game-header h1 {
      color: #4CAF50;
      text-align: center;
      margin: 10px 0 0 0;
      font-size: 20px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
      letter-spacing: 1px;
    }    .tabs__item {
      width: 100%;
      margin: 0;
    }

    .tabs__item-inner {
      width: 100%;
      min-height: 60px;
      display: flex;
      flex-flow: row-nowrap;
      justify-content: center;
      align-items: center;
      padding: 10px 20px;
    }

    .difficulty-selector {
      display: flex;
      gap: 8px;
      width: 100%;
      justify-content: center;
    }

    .difficulty-btn {
      flex: 1;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 12px 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
      font-size: 12px;
      text-align: center;
      backdrop-filter: blur(10px);
    }

    .difficulty-btn.active {
      background: rgba(76, 175, 80, 0.3);
      border-color: #4CAF50;
      color: #4CAF50;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
    }

    /* Action Buttons */
    .action-btn {
      width: 100%;
      padding: 15px 20px;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .action-btn.primary {
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
    }

    .action-btn.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
    }

    .action-btn.secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .action-btn.secondary:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }

    .action-btn.confirm {
      background: linear-gradient(135deg, #2196F3, #1976D2);
      color: white;
      box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
      width: 80%;
      margin: 10px auto;
    }

    .action-btn.confirm:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
    }

    /* Session Input */
    .session-input {
      width: 90%;
      padding: 12px 15px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
      font-size: 14px;
      text-align: center;
      margin: 10px auto;
    }

    .session-input:focus {
      outline: none;
      border-color: #2196F3;
      box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
    }

    .session-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    /* Instruction Panel */
    .instruction-panel {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      margin: 15px 0;
      text-align: left;
      backdrop-filter: blur(10px);
    }

    .instruction-title {
      color: #4CAF50;
      margin: 0 0 15px 0;
      font-size: 14px;
      font-weight: 600;
    }

    .instruction-list {
      color: rgba(255, 255, 255, 0.9);
      font-size: 12px;
      margin: 0;
      padding-left: 20px;
      line-height: 1.6;
    }

    .instruction-list li {
      margin: 5px 0;
    }

    .tip-box {
      margin-top: 15px;
      padding: 12px;
      background: rgba(255, 193, 7, 0.1);
      border-radius: 8px;
      border-left: 4px solid #FFC107;
    }

    .tip-text {
      margin: 0;
      font-size: 11px;
      color: #FFC107;
      font-weight: 500;
    }

    /* Chicken Road Specific Styles */
    .chicken-road-path {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 20px;
      max-height: 300px;
      overflow-y: auto;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .road-segment {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 15px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .road-segment.safe-step {
      background: rgba(76, 175, 80, 0.2);
      border-color: #4CAF50;
      transform: translateX(5px);
    }

    .road-segment.danger-step {
      background: rgba(244, 67, 54, 0.2);
      border-color: #f44336;
      transform: translateX(-5px);
    }

    .road-segment.optimal-cashout {
      background: rgba(255, 193, 7, 0.2);
      border-color: #FFC107;
      transform: scale(1.02);
      box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
    }

    .segment-info {
      display: flex;
      align-items: center;
      gap: 10px;
      color: white;
      font-size: 14px;
    }

    .step-number {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 12px;
    }

    .multiplier {
      font-weight: 600;
      color: #4CAF50;
    }

    .danger-indicator {
      font-size: 16px;
    }

    .segment-prediction {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .safe-icon, .danger-icon, .cashout-icon {
      font-size: 18px;
      animation: pulse 1.5s infinite;
    }

    .safe-icon {
      color: #4CAF50;
    }

    .danger-icon {
      color: #f44336;
    }

    .cashout-icon {
      color: #FFC107;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .chicken-prediction-result {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      margin-top: 15px;
      backdrop-filter: blur(10px);
    }

    .result-title {
      color: #4CAF50;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 15px;
      text-align: center;
    }

    .result-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-item {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      padding: 5px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    /* Дополнительные стили для реальной логики */
    .predicted-flame {
      background: rgba(244, 67, 54, 0.15) !important;
      border: 2px solid #f44336 !important;
    }

    .flame-warning {
      background: rgba(244, 67, 54, 0.2);
      border: 1px solid #f44336;
      border-radius: 8px;
      padding: 10px;
      margin: 10px 0;
      color: #f44336;
      font-weight: 600;
      text-align: center;
      animation: pulse 2s infinite;
    }

    .real-prediction-result {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      margin-top: 15px;
      backdrop-filter: blur(10px);
    }

    .real-prediction-result .result-title {
      color: #4CAF50;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 15px;
      text-align: center;
    }

    .real-prediction-result .result-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .real-prediction-result .detail-item {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      padding: 5px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .real-prediction-result .detail-item:last-child {
      border-bottom: none;
    }

    /* Анимация для предупреждений */
    @keyframes pulse {
      0%, 100% { 
        transform: scale(1); 
        opacity: 1; 
      }
      50% { 
        transform: scale(1.02); 
        opacity: 0.8; 
      }
    }

    .chart-wrapper {
      margin: 10px 20px;
      margin-bottom: 10px;
      padding: 15px;
      background: url(./images/bg_game_block.png);
      background-repeat: no-repeat;
      background-position: center;
      background-size: 130%;
    }

    @media screen and (max-height: 667px) {
      .chart-wrapper {
        margin: 10px 40px 0px 40px;
      }
    }

    .game-container {
      display: flex;
      flex-flow: column nowrap;
      justify-content: start;
      align-items: stretch;
      gap: 10px;
      padding: 0px;
      margin: 0px;
    }

    .button__inner .button__text {
      font-size: 24px;
    }

    .stats-panel {
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-around;
      align-items: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      padding: 10px;
      margin: 10px 20px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .stat-item {
      text-align: center;
      flex: 1;
    }

    .stat-value {
      font-size: 20px;
      font-weight: bold;
      color: #4CAF50;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .stat-label {
      font-size: 10px;
      opacity: 0.7;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #fff;
    }

    #game_field {
      display: grid;
      grid-gap: 12px;
      grid-template-columns: repeat(5, 1fr);
      max-width: 350px;
      margin: 20px auto;
      padding: 20px;
    }

    .game-tile {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      text-align: center;
      line-height: 60px;
      background: url("./images/icon_game.png");
      background-size: contain;
      border-radius: 13px;
      aspect-ratio: 1;
      cursor: pointer;
      transition: all 0.3s ease;
      min-height: 60px;
    }

    .game-tile:hover {
      transform: scale(1.05);
    }

    .game-tile._win {
      background-color: #4CAF50;
      animation: pulse 2s infinite;
    }

    .game-tile._lose {
      background-color: #f44336;
      animation: shake 0.5s ease-in-out;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    #main_proc {
      width: 98%;
      height: 50px;
      color: #fff;
      text-shadow: -1px -1px 2px rgb(1, 43, 104);
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      border: 0;
      background: rgb(244, 102, 24);
      background: linear-gradient(90deg,
          rgba(244, 102, 24, 1) 0%,
          rgba(248, 144, 51, 1) 50%,
          rgba(253, 186, 77, 1) 100%);
      background-size: 150%;
      cursor: pointer;
      transition: all 0.5s linear;
      border-radius: 10px;
      margin: 5px 0;
    }

    #main_proc:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(244, 102, 24, 0.4);
    }

    #main_proc:disabled {
      background: #666;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
      opacity: 0.6;
    }

    #next_proc {
      width: 98%;
      height: 50px;
      color: #fff;
      text-shadow: -1px -1px 2px rgb(1, 43, 104);
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      border: 0;
      background: rgb(24, 244, 102);
      background: linear-gradient(90deg,
          rgba(24, 244, 102, 1) 0%,
          rgba(51, 248, 144, 1) 50%,
          rgba(77, 253, 186, 1) 100%);
      background-size: 150%;
      cursor: pointer;
      transition: all 0.5s linear;
      border-radius: 10px;
      margin: 5px 0;
    }

    #next_proc:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(24, 244, 102, 0.4);
    }

    #session-code {
      width: 80%;
      padding: 10px 15px;
      border: 2px solid #3a3a5e;
      border-radius: 10px;
      background: #2a2a3e;
      color: white;
      margin: 10px;
      font-size: 16px;
      text-align: center;
    }

    #session-code:focus {
      outline: none;
      border-color: #4CAF50;
      box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
    }

    #signal-result {
      margin-top: 20px;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      padding: 15px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(5px);
      color: #fff;
    }

    /* Mobile responsive */
    @media screen and (max-width: 480px) {
      .game-header img {
        width: 30%;
      }
      
      #game_field {
        grid-template-columns: repeat(4, 1fr);
        max-width: 280px;
        gap: 8px;
        padding: 15px;
      }
      
      .game-tile {
        font-size: 20px;
        min-height: 45px;
      }
      
      .difficulty-selector {
        flex-direction: column;
        gap: 8px;
      }
      
      .stats-panel {
        flex-direction: row;
        gap: 5px;
        margin: 10px;
        padding: 8px;
      }
      
      .stat-value {
        font-size: 18px;
      }
      
      .stat-label {
        font-size: 9px;
      }
      
      #session-code {
        width: 90%;
        font-size: 14px;
      }
      
      .tabs__item-inner {
        height: 70px;
      }
      
      #main_proc, #next_proc {
        height: 45px;
        font-size: 16px;
      }
    }
  </style>
</head>

<body class="chicken-road _loaded">
  <div id="app" class="chicken-road" style="overflow-y: auto !important; position: relative">
    <div id="post-message-size" class="game-wrapper" style="overflow-y: auto !important; z-index: 6; min-height: 100vh; padding-bottom: 100px;">
      <div id="tbg"></div>
      <div class="game-header">
        <img id="logo" src="./images/chicken-road-logo.svg" alt="Chicken Road Logo" />
        <h1 style="color: white; text-align: center; margin: 10px 0; font-size: 24px; font-weight: bold;">
          🐔 CHICKEN ROAD PREDICTOR
        </h1>
      </div>

      <!-- Stats Panel -->
      <div class="stats-panel">
        <div class="stat-item">
          <div class="stat-value" id="success-rate">85%</div>
          <div class="stat-label translate" data-key="success_rate">Success Rate</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" id="predictions-count">1,247</div>
          <div class="stat-label translate" data-key="predictions">Predictions</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" id="win-streak">12</div>
          <div class="stat-label translate" data-key="win_streak">Win Streak</div>
        </div>
      </div>

      <div class="game-container">
        <!-- Difficulty Selector -->
        <div class="tabs__item">
          <div class="tabs__item-inner">
            <div class="difficulty-selector">
              <button class="difficulty-btn active" data-difficulty="easy">
                <span class="translate" data-key="easy">Fácil</span> (24 pasos)
              </button>
              <button class="difficulty-btn" data-difficulty="medium">
                <span class="translate" data-key="medium">Medio</span> (22 pasos)
              </button>
              <button class="difficulty-btn" data-difficulty="hard">
                <span class="translate" data-key="hard">Difícil</span> (20 pasos)
              </button>
            </div>
          </div>
        </div>

        <div class="chart-wrapper">
          <div class="table-holder" style="position: relative">
            <div class="game-tiles" id="game_field"></div>
          </div>
        </div>

        <!-- Control Buttons -->
        <div class="tabs__item">
          <div class="tabs__item-inner" style="flex-direction: column; gap: 15px;">
            <button id="main_proc" class="action-btn primary translate" data-key="get_signal">
              🐔 ANALIZAR CAMINO
            </button>
            <button id="next_proc" class="action-btn secondary translate" data-key="next_game">
              🔄 NUEVO ANÁLISIS
            </button>
            <div id="websocket-status" style="padding: 10px; font-weight: bold; margin-bottom: 10px;">🔄 Подключение к серверу...</div>
            <div id="signal-result"></div>
          </div>
        </div>

        <!-- Session Code Input -->
        <div class="tabs__item">
          <div class="tabs__item-inner" style="flex-direction: column; gap: 10px;">
            <h3 class="translate" data-key="enter_session_code" style="color: #fff; margin: 0;">
              Ingresa tu código de sesión:
            </h3>
            
            <!-- Instructions Panel -->
            <div class="instruction-panel">
              <h4 class="instruction-title">
                <span class="translate" data-key="how_to_get_session">🔍 Cómo obtener el ID de sesión:</span>
              </h4>
              <ol class="instruction-list">
                <li class="translate" data-key="step1">Abre la página del juego Chicken Road</li>
                <li class="translate" data-key="step2">Presiona F12 para abrir las herramientas de desarrollador</li>
                <li class="translate" data-key="step3">Ve a la pestaña "Network" (Red)</li>
                <li class="translate" data-key="step4">Haz una apuesta o inicia el juego</li>
                <li class="translate" data-key="step5">Busca las peticiones que contienen tu ID de usuario</li>
                <li class="translate" data-key="step6">Copia el valor del session ID de la URL o headers</li>
              </ol>
              
              <div class="tip-box">
                <p class="tip-text">
                  <span class="translate" data-key="session_tip">💡 Consejo: El session ID suele aparecer en las URLs como ?user_id=TU_ID o en los headers de las peticiones HTTP</span>
                </p>
              </div>
            </div>
            
            <input type="text" id="session-code" class="session-input translate-placeholder" 
                   placeholder="Ejemplo: user123456" data-key="session_code_placeholder">
            <button id="confirm-btn" class="action-btn confirm translate" data-key="confirm">
              ✓ CONFIRMAR
            </button>
            
            <!-- Demo Mode Note -->
            <div style="background: rgba(76, 175, 80, 0.1); border-radius: 8px; padding: 10px; margin-top: 10px;">
              <p style="margin: 0; font-size: 11px; color: #4CAF50; text-align: center;">
                <span class="translate" data-key="demo_note">🎮 Modo Demo: Puedes usar cualquier ID para probar el bot</span>
              </p>
            </div>
          </div>
        </div>

      </div>

      <!-- Overlay -->
      <div class="overlaying" style="<?php echo $overlaying_style; ?>">
        <p>
          <span class="translate" data-key="overlay_text_p" id="overlay-text-p"></span>
          <span class="translate" data-key="overlay_text_span" id="overlay-text-span" style="color: #41EB42;"></span>
        </p>
        
        <script>
          // Получаем все кнопки с классом btn__overlaying
          const buttons = document.querySelectorAll('.btn__overlaying');

          // Добавляем обработчик событий для каждой кнопки
          buttons.forEach(button => {
            button.addEventListener('click', function() {
              // Получаем URL из атрибута data-url
              const url = this.getAttribute('data-url');
              // Переходим по указанному URL
              if (url) {
                window.location.href = url;
              }
            });
          });
        </script>

        <label class="switch2">
          <p class="es">ES</p>
          <input type="checkbox" class="toggle">
          <span class="slider round"></span>
          <p class="eng">ENG</p>
        </label>
      </div>

      <footer class="footer" style="position: fixed; width: 100%; bottom: 0; z-index: 200; left: 0;">
        <a class="footer__link home" href="home.php">
          <img src="./images/home.webp" alt="home" />
          <p class="translate" data-key="home">Inicio</p>
        </a>
        <a class="footer__link chicken-road active_footer" href="chicken-road.php">
          <img src="./images/chicken-road.webp" alt="chicken-road" />
          <p class="translate" data-key="chicken_road">Chicken Road</p>
        </a>
      </footer>
    </div>
  </div>

  <script>
    // Chicken Road Bot - Реальная логика на основе оригинального game2.js
    let currentDifficulty = 'easy';
    let gameActive = false;
    let sessionId = null;
    let predictionResult = null;

    // Реальные конфигурации из оригинальной игры
    const REAL_GAME_SETTINGS = {
      cfs: {
        easy: [1.03, 1.07, 1.12, 1.17, 1.23, 1.29, 1.36, 1.44, 1.53, 1.63, 1.75, 1.88, 2.04, 2.22, 2.45, 2.72, 3.06, 3.50, 4.08, 4.90, 6.13, 6.61, 9.81, 19.44],
        medium: [1.12, 1.28, 1.47, 1.70, 1.98, 2.33, 2.76, 3.32, 4.03, 4.96, 6.20, 6.91, 8.90, 11.74, 15.99, 22.61, 33.58, 53.20, 92.17, 182.51, 451.71, 1788.80],
        hard: [1.23, 1.55, 1.98, 2.56, 3.36, 4.49, 5.49, 7.53, 10.56, 15.21, 22.59, 34.79, 55.97, 94.99, 172.42, 341.40, 760.46, 2007.63, 6956.47, 41321.43],
        hardcore: [1.63, 2.80, 4.95, 9.08, 15.21, 30.12, 62.96, 140.24, 337.19, 890.19, 2643.89, 9161.08, 39301.05, 233448.29]
      },
      chance: {
        easy: [7, 23],
        medium: [5, 15], 
        hard: [3, 10],
        hardcore: [2, 6]
      }
    };

    // WebSocket клиент для хак-бота
    class HackWebSocketClient {
      constructor() {
        this.ws = null;
        this.isConnected = false;
        this.currentLevel = 'easy';
        this.lastTraps = [];
        this.connect();
      }

      connect() {
        try {
          console.log('🔌 Hack bot connecting to WebSocket server...');
          this.ws = new WebSocket('ws://localhost:8080');
          
          this.ws.onopen = () => {
            this.isConnected = true;
            console.log('✅ Hack bot connected to WebSocket server');
            this.ws.send(JSON.stringify({type: 'set_level', level: this.currentLevel}));
            this.updateConnectionStatus('connected');
          };

          this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('📥 Hack bot received:', data);
            
            if (data.type === 'traps') {
              this.lastTraps = data.traps;
              this.updateTrapsDisplay(data.traps, data.level);
            } else if (data.type === 'game_traps') {
              console.log('🎮 Game traps received:', data.traps);
              this.lastTraps = data.traps;
              this.updateTrapsDisplay(data.traps, data.level);
            }
          };

          this.ws.onclose = () => {
            this.isConnected = false;
            console.log('📱 Disconnected from WebSocket server');
            this.updateConnectionStatus('disconnected');
            // Автоматическое переподключение через 3 секунды
            setTimeout(() => this.connect(), 3000);
          };

          this.ws.onerror = (error) => {
            console.error('❌ WebSocket connection error:', error);
            this.updateConnectionStatus('error');
          };

        } catch (error) {
          console.error('❌ Failed to connect to WebSocket:', error);
          this.updateConnectionStatus('error');
        }
      }

      setLevel(level) {
        this.currentLevel = level;
        if (this.isConnected && this.ws) {
          this.ws.send(JSON.stringify({type: 'set_level', level: level}));
        }
      }

      requestTraps() {
        if (this.isConnected && this.ws) {
          this.ws.send(JSON.stringify({type: 'request_traps', level: this.currentLevel}));
        } else {
          console.error('❌ Not connected to WebSocket server');
        }
      }

      startGame() {
        if (this.isConnected && this.ws) {
          this.ws.send(JSON.stringify({type: 'game_start'}));
          console.log('🎮 Game started, traps locked');
        } else {
          console.error('❌ Not connected to WebSocket server');
        }
      }

      endGame() {
        if (this.isConnected && this.ws) {
          this.ws.send(JSON.stringify({type: 'game_end'}));
          console.log('🏁 Game ended, traps unlocked');
        }
      }

      updateTrapsDisplay(traps, level) {
        console.log(`🔥 WebSocket Traps for ${level}:`, traps);
        
        if (traps && traps.length > 0) {
          const trapIndex = traps[0];
          const cfsArray = REAL_GAME_SETTINGS.cfs[level] || REAL_GAME_SETTINGS.cfs.easy;
          const coefficient = cfsArray[trapIndex - 1] || cfsArray[0];
          
          // Обновляем предсказание с реальными данными от WebSocket
          const resultElement = document.getElementById('signal-result');
          if (resultElement) {
            resultElement.innerHTML = `
              <div class="real-prediction-result">
                <div class="result-title">🎯 WebSocket Реальная ловушка</div>
                <div class="flame-warning">🔥 ЛОВУШКА ПОЛУЧЕНА ОТ СЕРВЕРА!</div>
                <div class="result-details">
                  <div class="detail-item">🔥 Огонь на сегменте: ${trapIndex}</div>
                  <div class="detail-item">📈 Коэффициент: ×${coefficient.toFixed(2)}</div>
                  <div class="detail-item">🎲 Уровень: ${level}</div>
                  <div class="detail-item">✅ Безопасно до: ${trapIndex - 1} шага</div>
                  <div class="detail-item">💰 Выходить на: ${Math.max(1, trapIndex - 1)} шаге</div>
                </div>
              </div>
            `;
          }

          // Обновляем визуализацию
          this.updateGameField(trapIndex, level);
        }
      }

      updateGameField(flameIndex, level) {
        const roadContainer = document.getElementById('game_field');
        if (!roadContainer) return;

        const cfsArray = REAL_GAME_SETTINGS.cfs[level] || REAL_GAME_SETTINGS.cfs.easy;
        
        // Очищаем и пересоздаем поле
        roadContainer.innerHTML = '';
        
        for (let i = 0; i < cfsArray.length; i++) {
          const segment = document.createElement('div');
          segment.className = 'road-segment';
          segment.dataset.step = i + 1;
          segment.dataset.multiplier = cfsArray[i];
          
          const isFlameSegment = (i + 1) === flameIndex;
          const isSafe = (i + 1) < flameIndex;
          const isOptimalCashout = (i + 1) === Math.max(1, flameIndex - 1);
          
          if (isFlameSegment) {
            segment.classList.add('predicted-flame', 'danger-step');
          } else if (isSafe) {
            segment.classList.add('safe-step');
          }
          
          if (isOptimalCashout) {
            segment.classList.add('optimal-cashout');
          }
          
          let predictionIcon = '';
          if (isFlameSegment) {
            predictionIcon = '<span class="danger-icon">🔥</span>';
          } else if (isOptimalCashout) {
            predictionIcon = '<span class="cashout-icon">💰</span>';
          } else if (isSafe) {
            predictionIcon = '<span class="safe-icon">🐔</span>';
          }
          
          segment.innerHTML = `
            <div class="segment-info">
              <span class="step-number">${i + 1}</span>
              <span class="multiplier">×${cfsArray[i].toFixed(2)}</span>
              ${isFlameSegment ? '<span class="danger-indicator">🔥</span>' : ''}
            </div>
            <div class="segment-prediction">${predictionIcon}</div>
          `;
          
          roadContainer.appendChild(segment);
        }
      }

      updateConnectionStatus(status) {
        const statusElement = document.getElementById('websocket-status');
        if (statusElement) {
          switch(status) {
            case 'connected':
              statusElement.textContent = '✅ Подключен к серверу';
              statusElement.style.color = '#4CAF50';
              break;
            case 'disconnected':
              statusElement.textContent = '❌ Отключен от сервера';
              statusElement.style.color = '#FF9800';
              break;
            case 'error':
              statusElement.textContent = '⚠️ Ошибка подключения';
              statusElement.style.color = '#f44336';
              break;
          }
        }
      }
    }

    // Создаем глобальный экземпляр WebSocket клиента
    let hackWebSocket;

    // Реплика алгоритма генерации огненного сегмента из оригинальной игры
    function calculateFlameSegment(difficulty) {
      const chanceArray = REAL_GAME_SETTINGS.chance[difficulty];
      const cfsArray = REAL_GAME_SETTINGS.cfs[difficulty];
      
      // Реальная логика из game2.js:
      // Math.random() * 100 < 20 ? 0 : Math.ceil( Math.random() * SETTINGS.chance[ this.cur_lvl ][ Math.round( Math.random() * 100  ) > 95 ? 1 : 0 ] );
      
      // 20% шанс сгореть на первом шаге (позиция 0)
      if (Math.random() * 100 < 20) {
        return 0;
      }
      
      // 80% шанс использовать обычную логику
      const isHighChance = Math.round(Math.random() * 100) > 95; // 5% шанс высокой сложности
      const chanceIndex = isHighChance ? 1 : 0;
      const maxFlamePosition = chanceArray[chanceIndex];
      
      return Math.ceil(Math.random() * maxFlamePosition);
    }

    // Реплика selectValueHybridIndex из оригинальной игры
    function selectValueHybridIndex(mainArray, chanceArray) {
      const limit = Math.random() <= 0.1 ? chanceArray[1] : chanceArray[0];
      
      const filteredIndices = mainArray
        .map((val, index) => ({ val, index }))
        .filter(({ val, index }) => val <= limit && (index <= 1 || Math.random() < 0.3))
        .map(({ index }) => index);
        
      if (filteredIndices.length === 0) {
        const fallbackIndex = mainArray.findIndex(val => val <= limit);
        return fallbackIndex !== -1 ? fallbackIndex : null;
      }
      
      return filteredIndices[Math.floor(Math.random() * filteredIndices.length)];
    }

    // Инициализация визуализации с реальной логикой
    function initRealChickenRoadVisualization() {
      const roadContainer = document.getElementById('game_field');
      if (!roadContainer) {
        console.error('Road container not found!');
        return;
      }
      
      roadContainer.innerHTML = '';
      roadContainer.className = 'chicken-road-path';
      
      const cfsArray = REAL_GAME_SETTINGS.cfs[currentDifficulty];
      const segmentCount = cfsArray.length;
      
      // Генерируем flame segment используя реальный алгоритм
      const flameSegment = calculateFlameSegment(currentDifficulty);
      
      console.log(`Flame segment for ${currentDifficulty}:`, flameSegment);
      
      // Создаем сегменты дороги
      for (let i = 0; i < segmentCount; i++) {
        const segment = document.createElement('div');
        segment.className = 'road-segment';
        segment.dataset.step = i + 1;
        segment.dataset.multiplier = cfsArray[i];
        
        const isFlameSegment = (i + 1) === flameSegment;
        const multiplier = cfsArray[i];
        
        if (isFlameSegment) {
          segment.classList.add('predicted-flame');
        }
        
        segment.innerHTML = `
          <div class="segment-info">
            <span class="step-number">${i + 1}</span>
            <span class="multiplier">×${multiplier.toFixed(2)}</span>
            ${isFlameSegment ? '<span class="danger-indicator">🔥</span>' : ''}
          </div>
          <div class="segment-prediction"></div>
        `;
        
        roadContainer.appendChild(segment);
      }
      
      // Сохраняем данные о flame segment для дальнейшего использования
      roadContainer.dataset.flameSegment = flameSegment;
      
      console.log(`Создана реальная визуализация Chicken Road: ${segmentCount} сегментов, огонь на ${flameSegment}`);
    }

    // Анализ пути используя реальные алгоритмы игры
    function analyzeRealChickenPath() {
      const cfsArray = REAL_GAME_SETTINGS.cfs[currentDifficulty];
      const chanceArray = REAL_GAME_SETTINGS.chance[currentDifficulty];
      const roadContainer = document.getElementById('game_field');
      const flameSegment = parseInt(roadContainer.dataset.flameSegment) || 0;
      
      const safeSteps = [];
      const dangerSteps = [];
      
      // Анализируем каждый сегмент
      for (let step = 1; step <= cfsArray.length; step++) {
        if (step === flameSegment) {
          dangerSteps.push(step);
        } else {
          safeSteps.push(step);
        }
      }
      
      // Определяем оптимальную точку выхода
      // Используем логику: выходить до flame segment или на 70% от общего количества
      let optimalCashout;
      if (flameSegment > 0) {
        optimalCashout = Math.max(1, flameSegment - 1);
      } else {
        optimalCashout = Math.floor(cfsArray.length * 0.7);
      }
      
      // Рассчитываем вероятность успеха на основе позиции flame segment
      let successProbability;
      if (flameSegment === 0) {
        successProbability = 5; // Очень низкий шанс если огонь на старте
      } else if (flameSegment <= 3) {
        successProbability = 35;
      } else if (flameSegment <= 10) {
        successProbability = 70;
      } else {
        successProbability = 85;
      }
      
      return {
        safeSteps,
        dangerSteps,
        flameSegment,
        optimalCashout,
        successProbability,
        totalSteps: cfsArray.length,
        maxMultiplier: cfsArray[optimalCashout - 1] || 1.0
      };
    }

    // Показ предсказания с реальными данными
    function showRealChickenRoadPrediction() {
      const prediction = analyzeRealChickenPath();
      const segments = document.querySelectorAll('.road-segment');
      
      // Очищаем предыдущие предсказания
      segments.forEach(segment => {
        segment.classList.remove('safe-step', 'danger-step', 'optimal-cashout');
        const predictionEl = segment.querySelector('.segment-prediction');
        predictionEl.innerHTML = '';
      });
      
      // Показываем безопасные шаги
      prediction.safeSteps.forEach((step, index) => {
        setTimeout(() => {
          const segment = document.querySelector(`[data-step="${step}"]`);
          if (segment && step !== prediction.flameSegment) {
            segment.classList.add('safe-step');
            const predictionEl = segment.querySelector('.segment-prediction');
            predictionEl.innerHTML = '<span class="safe-icon">🐔</span>';
          }
        }, index * 100);
      });
      
      // Показываем опасный сегмент (flame segment)
      setTimeout(() => {
        const flameSegment = document.querySelector(`[data-step="${prediction.flameSegment}"]`);
        if (flameSegment) {
          flameSegment.classList.add('danger-step');
          const predictionEl = flameSegment.querySelector('.segment-prediction');
          predictionEl.innerHTML = '<span class="danger-icon">🔥</span>';
        }
      }, prediction.safeSteps.length * 100);
      
      // Выделяем оптимальную точку выхода
      setTimeout(() => {
        const cashoutSegment = document.querySelector(`[data-step="${prediction.optimalCashout}"]`);
        if (cashoutSegment) {
          cashoutSegment.classList.add('optimal-cashout');
          const predictionEl = cashoutSegment.querySelector('.segment-prediction');
          predictionEl.innerHTML = '<span class="cashout-icon">💰</span>';
        }
      }, (prediction.safeSteps.length + 1) * 100 + 300);
      
      // Обновляем результат
      const resultElement = document.getElementById('signal-result');
      if (resultElement) {
        let flameWarning = '';
        if (prediction.flameSegment === 0) {
          flameWarning = '<div class="flame-warning">⚠️ ОПАСНО: Огонь может быть на старте!</div>';
        } else if (prediction.flameSegment <= 3) {
          flameWarning = '<div class="flame-warning">⚠️ ОСТОРОЖНО: Ранний огонь!</div>';
        }
        
        resultElement.innerHTML = `
          <div class="real-prediction-result">
            <div class="result-title">🎯 Реальный анализ Chicken Road</div>
            ${flameWarning}
            <div class="result-details">
              <div class="detail-item">🔥 Огонь на сегменте: ${prediction.flameSegment || 'Неизвестно'}</div>
              <div class="detail-item">✅ Безопасных шагов: ${prediction.safeSteps.length - 1}</div>
              <div class="detail-item">💰 Выходить на шаге: ${prediction.optimalCashout}</div>
              <div class="detail-item">📈 Множитель: ×${prediction.maxMultiplier.toFixed(2)}</div>
              <div class="detail-item">🎲 Вероятность: ${prediction.successProbability}%</div>
            </div>
          </div>
        `;
      }
      
      // Обновляем статистику
      updateStats(prediction.successProbability);
      
      predictionResult = prediction;
    }

    // Обновление статистики
    function updateStats(successRate) {
      const successRateEl = document.getElementById('success-rate');
      const predictionsEl = document.getElementById('predictions-count');
      const winStreakEl = document.getElementById('win-streak');
      
      if (successRateEl) {
        successRateEl.textContent = `${successRate}%`;
      }
      
      if (predictionsEl) {
        const current = parseInt(predictionsEl.textContent.replace(/,/g, '')) || 1247;
        predictionsEl.textContent = (current + 1).toLocaleString();
      }
      
      if (winStreakEl) {
        const current = parseInt(winStreakEl.textContent) || 12;
        const change = successRate > 60 ? 1 : -Math.floor(Math.random() * 2);
        const newStreak = Math.max(1, current + change);
        winStreakEl.textContent = newStreak;
      }
    }
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM загружен, инициализируем Chicken Road бот...');
      
      // Создаем WebSocket клиент для получения реальных данных от сервера
      hackWebSocket = new HackWebSocketClient();
      
      // Проверяем наличие всех элементов
      console.log('main_proc button:', document.getElementById('main_proc'));
      console.log('next_proc button:', document.getElementById('next_proc'));
      console.log('game_field:', document.getElementById('game_field'));
      console.log('difficulty buttons:', document.querySelectorAll('.difficulty-btn'));
      
      // Инициализация игры
      initRealChickenRoadVisualization();

      // Обработчики событий
      const mainProcBtn = document.getElementById('main_proc');
      if (mainProcBtn) {
        console.log('Найдена кнопка main_proc, добавляем обработчик');
        mainProcBtn.addEventListener('click', function() {
          console.log('Кнопка анализа нажата');
          if (!gameActive) {
            gameActive = true;
            this.disabled = true;
            
            // Уведомляем WebSocket сервер о начале игры
            if (hackWebSocket && hackWebSocket.isConnected) {
              hackWebSocket.startGame();
            }
            
            const resultElement = document.getElementById('signal-result');
            if (resultElement) {
              resultElement.innerHTML = `🔄 Получаем реальные данные от WebSocket сервера...`;
            }
            
            // Запрашиваем актуальные ловушки от WebSocket сервера
            if (hackWebSocket && hackWebSocket.isConnected) {
              hackWebSocket.requestTraps();
            } else {
              // Fallback к локальной логике если WebSocket недоступен
              setTimeout(() => {
                showRealChickenRoadPrediction();
                this.disabled = false;
                gameActive = false;
              }, 2000);
            }
            
            setTimeout(() => {
              this.disabled = false;
              gameActive = false;
              
              // Уведомляем WebSocket сервер об окончании игры
              if (hackWebSocket && hackWebSocket.isConnected) {
                hackWebSocket.endGame();
              }
            }, 5000);
          }
        });
      } else {
        console.error('Кнопка main_proc не найдена!');
      }

      const nextProcBtn = document.getElementById('next_proc');
      if (nextProcBtn) {
        console.log('Найдена кнопка next_proc, добавляем обработчик');
        nextProcBtn.addEventListener('click', function() {
          console.log('Кнопка нового анализа нажата');
          gameActive = false;
          initRealChickenRoadVisualization();
          const resultElement = document.getElementById('signal-result');
          if (resultElement) {
            resultElement.innerHTML = '';
          }
          const mainBtn = document.getElementById('main_proc');
          if (mainBtn) {
            mainBtn.disabled = false;
          }
        });
      } else {
        console.error('Кнопка next_proc не найдена!');
      }

      // Выбор сложности
      document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          console.log('Сложность изменена на:', this.dataset.difficulty);
          document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          currentDifficulty = this.dataset.difficulty;
          
          // Обновляем уровень в WebSocket клиенте
          if (hackWebSocket && hackWebSocket.isConnected) {
            hackWebSocket.setLevel(currentDifficulty);
            hackWebSocket.requestTraps(); // Запрашиваем новые ловушки для выбранного уровня
          }
          
          initRealChickenRoadVisualization();
          gameActive = false;
          const resultElement = document.getElementById('signal-result');
          if (resultElement) {
            resultElement.innerHTML = '';
          }
          const mainBtn = document.getElementById('main_proc');
          if (mainBtn) {
            mainBtn.disabled = false;
          }
        });
      });

      // Подтверждение кода сессии
      const confirmBtn = document.getElementById('confirm-btn');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
          const code = document.getElementById('session-code').value;
          if (code.trim()) {
            sessionId = code.trim();
            alert('¡Código de sesión confirmado! El bot Chicken Road está activo.');
            document.getElementById('session-code').value = '';
          } else {
            alert('Por favor ingresa un código de sesión válido.');
          }
        });
      }
      if (nextProcBtn) {
        nextProcBtn.addEventListener('click', function() {
          console.log('Next game button clicked');
          gameActive = false;
          initGame();
          const resultElement = document.getElementById('signal-result');
          if (resultElement) {
            resultElement.innerHTML = '';
          }
          const mainBtn = document.getElementById('main_proc');
          if (mainBtn) {
            mainBtn.disabled = false;
          }
        });
      }

      // Difficulty selection
      document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          console.log('Difficulty changed to:', this.dataset.difficulty);
          document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          currentDifficulty = this.dataset.difficulty;
          initGame();
          gameActive = false;
          const resultElement = document.getElementById('signal-result');
          if (resultElement) {
            resultElement.innerHTML = '';
          }
          const mainBtn = document.getElementById('main_proc');
          if (mainBtn) {
            mainBtn.disabled = false;
          }
        });
      });

      // Language handling
      const overlayText = <?php echo $overlay_text_js; ?>;
      const allOverlayText = <?php echo $all_overlay_text_js; ?>;
      const userId = <?php echo $user_id_js; ?>;
      const userStatus = <?php echo $user_status_js; ?>;

      // Set initial overlay text
      const overlayTextP = document.getElementById('overlay-text-p');
      const overlayTextSpan = document.getElementById('overlay-text-span');
      if (overlayTextP) overlayTextP.innerText = overlayText.es.p;
      if (overlayTextSpan) overlayTextSpan.innerText = overlayText.es.span;

      const translations = {
        eng: {
          success_rate: "Success Rate",
          predictions: "Predictions", 
          win_streak: "Win Streak",
          easy: "Easy",
          medium: "Medium", 
          hard: "Hard",
          get_signal: "🐔 ANALYZE PATH",
          next_game: "🔄 NEW ANALYSIS",
          enter_session_code: "Enter your Session code:",
          how_to_get_session: "🔍 How to get Session ID:",
          step1: "Open Chicken Road game page",
          step2: "Press F12 to open developer tools",
          step3: "Go to 'Network' tab",
          step4: "Make a bet or start the game",
          step5: "Look for requests containing your user ID",
          step6: "Copy the session ID value from URL or headers",
          session_tip: "💡 Tip: Session ID usually appears in URLs as ?user_id=YOUR_ID or in HTTP request headers",
          session_code_placeholder: "Example: user123456",
          confirm: "✓ CONFIRM",
          demo_note: "🎮 Demo Mode: You can use any ID to test the bot",
          overlay_text_p: overlayText.eng.p,
          overlay_text_span: overlayText.eng.span,
          home: "Home",
          aviator: "Aviator", 
          mines: "Mines",
          chicken_road: "Chicken Road"
        },
        es: {
          success_rate: "Tasa de Éxito",
          predictions: "Predicciones",
          win_streak: "Racha Ganadora",
          easy: "Fácil",
          medium: "Medio",
          hard: "Difícil", 
          get_signal: "🐔 ANALIZAR CAMINO",
          next_game: "🔄 NUEVO ANÁLISIS",
          enter_session_code: "Ingresa tu código de sesión:",
          how_to_get_session: "🔍 Cómo obtener el ID de sesión:",
          step1: "Abre la página del juego Chicken Road",
          step2: "Presiona F12 para abrir las herramientas de desarrollador",
          step3: "Ve a la pestaña 'Network' (Red)",
          step4: "Haz una apuesta o inicia el juego",
          step5: "Busca las peticiones que contienen tu ID de usuario",
          step6: "Copia el valor del session ID de la URL o headers",
          session_tip: "💡 Consejo: El session ID suele aparecer en las URLs como ?user_id=TU_ID o en los headers de las peticiones HTTP",
          session_code_placeholder: "Ejemplo: user123456",
          confirm: "✓ CONFIRMAR",
          demo_note: "🎮 Modo Demo: Puedes usar cualquier ID para probar el bot",
          overlay_text_p: overlayText.es.p,
          overlay_text_span: overlayText.es.span,
          home: "Inicio",
          aviator: "Aviador",
          mines: "Minas", 
          chicken_road: "Chicken Road"
        }
      };

      function updateLanguage() {
        const language = localStorage.getItem("language") || "es";
        
        const overlayTextP = document.getElementById('overlay-text-p');
        const overlayTextSpan = document.getElementById('overlay-text-span');
        if (overlayTextP) overlayTextP.innerText = translations[language].overlay_text_p;
        if (overlayTextSpan) overlayTextSpan.innerText = translations[language].overlay_text_span;

        document.querySelectorAll(".translate").forEach(element => {
          const key = element.getAttribute("data-key");
          if (translations[language] && translations[language][key]) {
            element.innerHTML = translations[language][key];
          }
        });

        document.querySelectorAll(".translate-placeholder").forEach(element => {
          const key = element.getAttribute("data-key");
          if (translations[language] && translations[language][key]) {
            element.placeholder = translations[language][key];
          }
        });

        document.querySelectorAll(".toggle").forEach(toggle => {
          toggle.checked = language === "eng";
        });
      }

      // Initialize language
      updateLanguage();
      
      // Language toggle handlers
      document.querySelectorAll(".toggle").forEach(toggle => {
        toggle.addEventListener("change", function() {
          const newLanguage = this.checked ? "eng" : "es";
          localStorage.setItem("language", newLanguage);
          updateLanguage();
        });
        
        const currentLanguage = localStorage.getItem("language") || "es";
        toggle.checked = currentLanguage === "eng";
      });

      // Auto-update stats
      setInterval(() => {
        const successRate = document.getElementById('success-rate');
        const predictionsCount = document.getElementById('predictions-count');
    });

    // Функция переключения языка
    function switchLanguage(lang) {
      console.log('Switching to language:', lang);
      document.querySelectorAll('.translate').forEach(element => {
        const key = element.getAttribute('data-key');
        if (translations[lang] && translations[lang][key]) {
          element.textContent = translations[lang][key];
        }
      });

      document.querySelectorAll('.translate-placeholder').forEach(element => {
        const key = element.getAttribute('data-key');
        if (translations[lang] && translations[lang][key]) {
          element.placeholder = translations[lang][key];
        }
      });
    }

    // Переключатель языка
    const toggle = document.querySelector('.toggle');
    if (toggle) {
      toggle.addEventListener('change', function() {
        const language = this.checked ? 'eng' : 'es';
        switchLanguage(language);
      });
    }

    // Начальная настройка языка
    switchLanguage('es');

    // Обновление статистики каждые 5 секунд для большей реалистичности
    setInterval(() => {
      const successRate = document.getElementById('success-rate');
      const predictionsCount = document.getElementById('predictions-count');
      const winStreak = document.getElementById('win-streak');
      
      if (successRate) successRate.textContent = (85 + Math.random() * 10).toFixed(0) + '%';
      if (predictionsCount) predictionsCount.textContent = (1247 + Math.floor(Math.random() * 100)).toLocaleString();
      if (winStreak) winStreak.textContent = (12 + Math.floor(Math.random() * 5)).toString();
    }, 5000);
  });
  </script>

  <script src="./js/toggle.js"></script>
  <script src="./js/script.js"></script>
  <script src="./js/lang.js"></script>

</body>
</html>