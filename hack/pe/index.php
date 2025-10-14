<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Autorización</title>
    <link rel="stylesheet" href="./css/reset.css">
    <link rel="stylesheet" href="./css/normalize.css">
    <link rel="stylesheet" href="./css/style.css">
    <link rel="icon" href="./images/authorization.png" />
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/notify/0.4.2/notify.min.js"></script>
</head>
<body style="background: #000;">

    <div class="main__wrapper">
        <img class="money__top--left" src="./images/money_top_left.webp" alt="money">
        <img class="money__top--right" src="./images/money_top_right.webp" alt="money">
        <img class="money__left--center" src="./images/money_left_center.webp" alt="money">
        <img class="money__right--center" src="./images/money_right_center.webp" alt="money">
        <div class="main">
            <h1 class="translate" data-key="welcome">¡Bienvenido!</h1>   

            <form id="loginForm" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                <input class="translate-placeholder" data-key="input_id" style="margin-bottom: 10px;" type="text" name="account_id" id="account_id" placeholder="Introduce tu ID de cuenta" required>
                <button style="background: #FFD900" class="btn translate" type="submit" data-key="sign_in">Iniciar sesión</button>
            </form>
            <p id="errorMessage" style="color: red; display: none;"></p>
            <a href="https://t.me/Fabio_Dominguez_oficial_bot" class="translate" data-key="how_to_sign_in">Cómo iniciar sesión</a>
            
             <script>
    $(document).ready(function() {
        $("#loginForm").submit(function(event) {
            event.preventDefault();

            let account_id = $("#account_id").val();

            let formData = new FormData();
            formData.append("account_id", account_id);

            fetch("login.php", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    $.notify("¡Inicio de sesión exitoso!", "success");
                    setTimeout(() => window.location.href = "home.php", 1000);
                } else {
                    $.notify(data.message, "error");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                $.notify("Error del servidor. Inténtalo más tarde.", "error");
            });
        });
    });
</script>

            <label class="switch">
                <p class="es">ES</p>
                <input type="checkbox" class="toggle">
                <span class="slider round"></span>
                <p class="eng">ENG</p>
            </label>
        </div>
    </div>


    <script src="./js/toggle.js"></script>
    <script src="./js/script.js"></script>
    <script src="./js/lang.js"></script> <!-- Скрипт перевода -->
</body>
</html>