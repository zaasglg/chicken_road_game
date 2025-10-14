<?php
session_start();
include 'overlaying.php';

// Проверяем, вошел ли пользователь
if (!isset($_SESSION['user_id'])) {
    header("Location: index.php"); // Перенаправление на страницу входа
    exit();
}
?>

<!doctype html>
<html lang="en">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Aviator Signals</title>
    
    <link rel="icon" href="./images/aviator_fav.png" />
    
    <link rel="stylesheet" href="./css/aviator.css">
    <link rel="stylesheet" href="./css/normalize.css">
    <link rel="stylesheet" href="./css/reset.css">
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet" href="./css/main-aviator.css">

</head>
<body>

<div class="aviator-container zoom-move">
<div class="wrapper" id="error_block" style="display: none">
      <div class="container">
        <div class="box finish">
          <a href="#" class="logo"><img src="./imgs/aviator_logo.png" alt /></a>
          

          <div class="deposit">
            <div class="dep_item">
              <div class="dep_title">MİNİMUM DEPOZİTO</div>
              <div class="dep_val">
                <input
                  type="text"
                  value="200+ TL"
                  readonly
                  style="width: 100%"
                />
              </div>
            </div>
            <div class="dep_text">
              Ödeme yapıldıktan sonra Aviator botu otomatik olarak çalışacaktır
            </div>
            <div class="dep_bottom">
              <a href="https://t.me/ayberk_erturk" class="help_a"
                >Yardıma ihtiyaç olursa?</a
              >
              <a href="https://t.me/ayberk_erturk" class="support_btn"
                >Desteğe yazın</a
              >
            </div>
          </div>
        </div>

        <div class="clouds_bottom"></div>
      </div>
    </div>

    <div class="wrapper" id="game_block">
      <div class="container">
        <div class="box">
          <div class="cloudTop">
            <img width="100%" height="300px" src="./imgs/cloudTop.png" alt />
          </div>
          <div class="cloudMiddleTop">
            <img width="426px" src="./imgs/cloudMiddleTop.png" alt />
          </div>
          <!-- Модальное окно -->
          <div id="coefficientModal" class="modal">
            <div class="modal-content">
              <span class="close">&times;</span>
              <h2>Редактирование коэффициентов</h2>
              <div id="coefficientList"></div>
              <button id="addCoefficientBtn">Добавить коэффициент</button>
              <button id="saveCoefficientsBtn">Сохранить коэффициенты</button>
            </div>
          </div>

          <div class="cloudMiddleBottom">
            <img width="130px" src="./imgs/cloudMiddleBottom.png" alt />
          </div>
          <div class="cloudBottom">
            <img width="150px" src="./imgs/cloudBottom.png" alt />
          </div>

          <a href="#" class="logo"><img src="./imgs/aviator_logo.png" alt /></a>

      <div class="overlaying">
        <p>
          <span class="translate" data-key="overlay_text_p" id="overlay-text-p">Para activar la versión funcional es
            necesario realizar un depósito, por favor escribe a Fabio</span>
        </p>
        <button class="btn__overlaying translate" type="button" data-key="make_deposit"
          data-url="https://t.me/Dominguez_Fabio_Bot">
          Escríbeme
        </button>
        <script>
          // Получаем все кнопки с классом btn__overlaying
          const buttons = document.querySelectorAll('.btn__overlaying');

          // Добавляем обработчик событий для каждой кнопки
          buttons.forEach(button => {
            button.addEventListener('click', function () {
              // Получаем URL из атрибута data-url
              const url = this.getAttribute('data-url');
              // Переходим по указанному URL
              if (url) {
                window.location.href = url;
              }
            });
          });</script>
      </div>
          <div class="circle--wrapper">
            <div class="circle">
              <div class="first_step">
                <img class="circle_img" src="./imgs/cir.png" alt />
                <span><span class="rand_number"></span>X</span>
              </div>
              <div class="animating_vint">
                <div class="info">
                  <div class="collecting_info">Bilgi toplanmas...</div>

                  <div class="yellow_dots">
                    <span></span>
                    <span class="to_active"></span>
                    <span class="active"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="deposit">
            <div class="dep_item">
              <div class="dep_title">MİNİMUM DEPOZİTO</div>
              <div class="dep_val">
                <input
                  type="text"
                  value="200TL+ "
                  readonly
                  style="width: 100%"
                />
              </div>
            </div>
            <div class="dep_text">
              Ödeme yapıldıktan sonra Aviator botu otomatik olarak çalışacaktır
            </div>
            <div class="dep_bottom">
              <a href="https://t.me/ayberk_erturk" class="help_a"
                >Yardıma ihtiyaç olursa?</a
              >
              <a href="https://t.me/ayberk_erturk" class="support_btn"
                >Desteğe yazın</a
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <footer class="footer" style="position: absolute;width: 100%;bottom: 0; z-index: 200; background: #FFD900;">
        <a class="footer__link home" href="home.php">
            <img src="./images/home.webp" alt="home" />
            <p class="translate" data-key="home">Home</p>
        </a>
        <a class="footer__link aviator active_footer" href="aviator.php">
            <img src="./images/aviator.webp" alt="aviator" />
            <p class="translate" data-key="aviator">Aviator</p>
        </a>
        <a class="footer__link mines" href="mines.php">
            <img src="./images/mines.webp" alt="mines" />
            <p class="translate" data-key="mines">Mines</p>
        </a>
    </footer>
</div>

<!-- <script>
const userId = <?= json_encode($_SESSION['user_id']); ?>;

document.addEventListener("DOMContentLoaded", async function() {
  const overlaying = document.querySelector('.overlaying');
  const overlayTextP = document.getElementById('overlay-text-p');
  const overlayButton = document.querySelector('.btn__overlaying');
  
  try {
    const deposit = await checkUserDeposit();
    
    if (deposit < 10) {
      overlayTextP.textContent = "To activate the full version you need to make a deposit, please contact Fabio";
      overlayButton.textContent = "Write me";
      
      overlaying.style.display = "flex";
    }
    
  } catch (error) {
    console.error("Deposit check failed:", error);
  }
  
  overlayButton.addEventListener('click', function() {
    const url = this.getAttribute('data-url');
    if (url) {
      window.open(url, '_blank');
    }
  });
});

async function checkUserDeposit() {
  const response = await fetch('db.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `action=check_deposit&user_id=${userId}`
  });
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || "Deposit check failed");
  }
  
  return parseFloat(data.deposit) || 0;
}
</script> -->

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

    <script src="./js/aviator.js"></script>
    <script src="./js/lang.js"></script>
</body>
</html>
