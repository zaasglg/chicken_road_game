<?php
session_start();
include 'overlaying.php';
require_once 'db.php'; // Подключаем файл с подключением к БД

// Проверяем, вошел ли пользователь
if (!isset($_SESSION['user_id'])) {
    header("Location: index.php"); // Перенаправление на страницу входа
    exit();
}

$user_id = $_SESSION['user_id']; // Получаем user_id из сессии

try {
    // Получаем user_status для данного user_id
    $stmt = $conn->prepare("SELECT user_status FROM users WHERE user_id = :user_id");
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    
    $user_status = $stmt->fetchColumn(); // Получаем значение user_status

    if ($user_status === false) {
        $user_status = "Usuario no encontrado"; // Изменено на испанский
    }
} catch (PDOException $e) {
    die("Error de consulta: " . $e->getMessage()); // Изменено на испанский
}
?>

<!DOCTYPE html>
<html lang="es"> <!-- Изменено на es -->
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Página principal</title> <!-- Изменено на испанский -->
    <link rel="stylesheet" href="./css/reset.css">
    <link rel="stylesheet" href="./css/normalize.css">
    <link rel="stylesheet" href="./css/style.css">
    <link rel="icon" href="./images/home-page.png" />
</head>
<body style="background: #000;">
    <div class="main__wrapper">
        <img class="money__top--left" src="./images/money_top_left.webp" alt="money">
        <img class="money__top--right" src="./images/money_top_right.webp" alt="money">
        <img class="money__left--center" src="./images/money_left_center.webp" alt="money">
        <img class="money__right--center" src="./images/money_right_center.webp" alt="money">
        <div class="main">
            <h1 class="translate" data-key="welcome">¡Bienvenido!</h1> <!-- Изменено на испанский -->
            <div class="user__info">
    <p class="translate user-info-text" data-key="your_id">Tu ID: <span style="color: lightgreen;"><?php echo htmlspecialchars($user_id); ?></span></p>
    <!-- <p class="translate user-info-text" data-key="your_status">Tu estado: <span style="color: lightgreen;"><?php echo htmlspecialchars($user_status); ?></span></p> -->
</div>

       

            <label class="switch">
                <p class="es">ES</p> <!-- Изменено порядок - ES слева -->
                <input type="checkbox" class="toggle">
                <span class="slider round"></span>
                <p class="eng">ENG</p> <!-- ENG справа -->
            </label>
        </div>
    </div>

    <div class="overlaying" style="<?php echo $overlaying_style; ?>">
<p>
    <span class="translate" data-key="overlay_text_p" id="overlay-text-p"></span>
    <span class="translate" data-key="overlay_text_span" id="overlay-text-span" style="color: #41EB42;font-family: &quot;Inter&quot;, sans-serif;font-style: normal;"></span>
</p>

     <script>        // Получаем все кнопки с классом btn__overlaying
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
        });</script>

        <label class="switch2">
            <p class="es">ES</p> <!-- Изменено порядок - ES слева -->
            <input type="checkbox" class="toggle">
            <span class="slider round"></span>
            <p class="eng">ENG</p> <!-- ENG справа -->
        </label>
    </div>

    <div style="max-width: 500px; margin: 0 auto; position: relative; z-index: 200;">
        <footer class="footer">
            <div class="footer__wrapper2">
                <a class="footer__link home active_footer" href="home.php">
                    <img src="./images/home.webp" alt="home">
                    <p class="translate" data-key="home">Inicio</p> <!-- Изменено на испанский -->
                </a>
                <a class="footer__link aviator" href="aviator.php">
                    <img src="./images/aviator.webp" alt="aviator">
                    <p class="translate" data-key="aviator">Aviador</p> <!-- Изменено на испанский -->
                </a>
                <a class="footer__link mines" href="mines.php">
                    <img src="./images/mines.webp" alt="mines">
                    <p class="translate" data-key="mines">Minas</p> <!-- Изменено на испанский -->
                </a>
            </div>
        </footer>
    </div>
    
    <script>
    // Получаем тексты из PHP через json_encode
    const overlayText = <?php echo $overlay_text_js; ?>;
    const allOverlayText = <?php echo $all_overlay_text_js; ?>;
    const userId = <?php echo $user_id_js; ?>;
    const userStatus = <?php echo $user_status_js; ?>;

    // Устанавливаем испанский текст по умолчанию
    document.getElementById('overlay-text-p').innerText = overlayText.es.p;
    document.getElementById('overlay-text-span').innerText = overlayText.es.span;

    const translations = {
        eng: {
            welcome: "Welcome!",
            get_signal: "GET SIGNAL",
            next_game: "NEXT GAME",
            enter_session_code: "Enter your Session code",
            confirm: "Confirm",
            waiting: "waiting",
            overlay_text_p: overlayText.eng.p,
            overlay_text_span: overlayText.eng.span,
            make_deposit: "Make a deposit",
            contact_me: "Contact me",
            home: "Home",
            aviator: "Aviator",
            mines: "Mines",
            predict_now: "Predict now",
            traps: "3 traps",
            your_id: `Your ID: <span style="color: lightgreen;">${userId}</span>`,
            your_status: `Your Status: <span style="color: lightgreen;">${userStatus}</span>`
        },
        es: {
            welcome: "¡Bienvenido!",
            get_signal: "OBTENER SEÑAL",
            next_game: "SIGUIENTE JUEGO",
            enter_session_code: "Ingresa tu código de sesión",
            confirm: "Confirmar",
            waiting: "esperando",
            overlay_text_p: overlayText.es.p,
            overlay_text_span: overlayText.es.span,
            make_deposit: "Hacer un depósito",
            contact_me: "Contáctame",
            home: "Inicio",
            aviator: "Aviador",
            mines: "Minas",
            predict_now: "Predecir ahora",
            traps: "3 trampas",
            your_id: `Tu ID: <span style="color: lightgreen;">${userId}</span>`,
            // your_status: `Tu estado: <span style="color: lightgreen;">${userStatus}</span>`
        }
    };

    function updateLanguage() {
        const language = localStorage.getItem("language") || "es";
        
        // Обновляем тексты в блоке <p>
        document.getElementById('overlay-text-p').innerText = translations[language].overlay_text_p;
        document.getElementById('overlay-text-span').innerText = translations[language].overlay_text_span;

        // Обновляем остальные тексты
        document.querySelectorAll(".translate").forEach(element => {
            const key = element.getAttribute("data-key");
            if (translations[language] && translations[language][key]) {
                element.innerHTML = translations[language][key];
            }
        });

        // Обновляем переключатель
        document.querySelectorAll(".toggle").forEach(toggle => {
            toggle.checked = language === "eng";
        });
    }

    document.addEventListener("DOMContentLoaded", function() {
        // Инициализируем язык
        updateLanguage();
        
        // Обработчик переключателя языка
        document.querySelectorAll(".toggle").forEach(toggle => {
            toggle.addEventListener("change", function() {
                const newLanguage = this.checked ? "eng" : "es";
                localStorage.setItem("language", newLanguage);
                updateLanguage();
            });
            
            // Устанавливаем начальное состояние переключателя
            const currentLanguage = localStorage.getItem("language") || "es";
            toggle.checked = currentLanguage === "eng";
        });
    });
</script>
    <script src="./js/toggle.js"></script>
    <script src="./js/script.js"></script>
    <script src="./js/lang.js"></script>
</body>
</html>