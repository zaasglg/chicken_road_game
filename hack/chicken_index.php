<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>🐔 Chicken Road Hack Bot - Autorización</title>
    <link rel="stylesheet" href="./css/reset.css?v=1.0">
    <link rel="stylesheet" href="./css/normalize.css?v=1.0">
    <link rel="stylesheet" href="./css/style.css?v=1.0">
    <link rel="icon" href="./images/authorization.png" />
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/notify/0.4.2/notify.min.js"></script>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>

<body style="background: #000;">
    <!-- Loader -->
    <div id="loader" style="position:fixed;z-index:9999;top:0;left:0;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;background:#000;">
        <div style="display:flex;flex-direction:column;align-items:center;">
            <div class="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <span style="color:#FFD900;margin-top:16px;font-weight:bold;">Loading...</span>
        </div>
    </div>
    <style>
        .lds-ellipsis {
            display: inline-block;
            position: relative;
            width: 80px;
            height: 24px;
        }

        .lds-ellipsis div {
            position: absolute;
            top: 8px;
            width: 13px;
            height: 13px;
            border-radius: 50%;
            background: #FFD900;
            animation-timing-function: cubic-bezier(0, 1, 1, 0);
        }

        .lds-ellipsis div:nth-child(1) {
            left: 8px;
            animation: lds-ellipsis1 0.6s infinite;
        }

        .lds-ellipsis div:nth-child(2) {
            left: 8px;
            animation: lds-ellipsis2 0.6s infinite;
        }

        .lds-ellipsis div:nth-child(3) {
            left: 32px;
            animation: lds-ellipsis2 0.6s infinite;
        }

        .lds-ellipsis div:nth-child(4) {
            left: 56px;
            animation: lds-ellipsis3 0.6s infinite;
        }

        @keyframes lds-ellipsis1 {
            0% {
                transform: scale(0);
            }

            100% {
                transform: scale(1);
            }
        }

        @keyframes lds-ellipsis2 {
            0% {
                transform: translateX(0);
            }

            100% {
                transform: translateX(24px);
            }
        }

        @keyframes lds-ellipsis3 {
            0% {
                transform: scale(1);
            }

            100% {
                transform: scale(0);
            }
        }
    </style>

    <div class="main__wrapper">
        <div class="main">
            <h1 class="translate" data-key="welcome">🐔 ¡Bienvenido al Chicken Road Hack Bot!</h1>

            <form id="chickenLoginForm" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                <input class="translate-placeholder" data-key="input_id" style="margin-bottom: 10px;"
                    type="text" name="user_id" id="user_id" placeholder="Introduce tu ID de usuario" required>
                <button class="btn translate three-d-btn" type="submit" data-key="sign_in">
                    Acceder al Hack Bot
                </button>
            </form>
            <style>
                .main__wrapper {
                    background-image:
                        linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
                        url('/hack/images/hack_bot_bg.jpg');
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: cover;
                }

                .three-d-btn {
                    background: linear-gradient(180deg, #FFD900 60%, #bfa100 100%);
                    color: #222;
                    border: none;
                    border-radius: 8px;
                    box-shadow: 0 4px 0 #bfa100, 0 8px 16px #0003;
                    font-size: 1.1em;
                    font-weight: 700;
                    padding: 13px 32px;
                    cursor: pointer;
                    transition: all 0.13s cubic-bezier(.4, 0, .2, 1);
                    outline: none;
                    position: relative;
                    margin-top: 8px;
                    text-shadow: 0 1px 0 #fff8;
                }

                .three-d-btn:active {
                    box-shadow: 0 2px 0 #bfa100, 0 2px 8px #0002 inset;
                    background: linear-gradient(180deg, #e6c200 80%, #bfa100 100%);
                    top: 2px;
                }
            </style>
            </form>
            <p id="errorMessage" style="color: red; display: none;"></p>


            <script>
                // Telegram Mini App SDK init
                function tgReady() {
                    if (window.Telegram && window.Telegram.WebApp) {
                        window.Telegram.WebApp.ready();
                        // Optionally expand the app
                        if (window.Telegram.WebApp.expand) window.Telegram.WebApp.expand();
                    }
                }
                tgReady();

                // Hide loader after DOM and Telegram SDK are ready
                function hideLoader() {
                    const loader = document.getElementById('loader');
                    if (loader) loader.style.display = 'none';
                }

                // Helper: translate common server/client messages and show notification
                function showNotify(msg, type) {
                    try {
                        var lang = (localStorage.getItem('language') || 'es');

                        // Local mapping for common server/client English messages -> localized strings
                        var localMap = {
                            'Fill in the account ID': { eng: 'Fill in the account ID', es: 'Introduce tu ID de cuenta' },
                            'Invalid user ID': { eng: 'Invalid user ID', es: 'ID de usuario no válido' },
                            'User not found': { eng: 'User not found', es: 'Usuario no encontrado' },
                            'Server error': { eng: 'Server error', es: 'Error del servidor' },
                            'API connection error': { eng: 'API connection error', es: 'Error de conexión con la API' },
                            'API error': { eng: 'API error', es: 'Error de la API' }
                        };

                        // If translations object is loaded, try to find a mapped key
                        var translated = null;
                        if (typeof translations === 'object') {
                            // try to match by known keys in translations
                            // if the msg already equals a translation value, keep it
                            Object.keys(translations).forEach(function(l) { /* noop: just to be safe */ });

                            // Simple heuristics: map English server messages to translation keys
                            if (/Fill in the account ID/i.test(msg) || /Invalid user ID/i.test(msg)) {
                                translated = translations[lang] && translations[lang]['input_id'] ? translations[lang]['input_id'] : null;
                            } else if (/User not found/i.test(msg) || /incorrect/i.test(msg) || /not found/i.test(msg)) {
                                translated = translations[lang] && translations[lang]['login_error'] ? translations[lang]['login_error'] : null;
                            } else if (/Server error/i.test(msg) || /API connection error/i.test(msg) || /API error/i.test(msg)) {
                                translated = translations[lang] && translations[lang]['server_error'] ? translations[lang]['server_error'] : null;
                            }
                        }

                        // If no translations object or no mapping found, fall back to localMap
                        if (!translated) {
                            Object.keys(localMap).forEach(function(k) {
                                if (new RegExp(k, 'i').test(msg)) {
                                    translated = localMap[k][lang] || msg;
                                }
                            });
                        }

                        if (translated) msg = translated;
                    } catch (e) {
                        console.error('showNotify translate error', e);
                    }

                    if (window.$ && $.notify) {
                        $.notify(msg, type);
                    } else if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.showPopup) {
                        window.Telegram.WebApp.showPopup({
                            title: type === 'success' ? 'OK' : 'Error',
                            message: msg
                        });
                    } else {
                        alert(msg);
                    }
                }

                // DOMContentLoaded
                document.addEventListener('DOMContentLoaded', function() {
                    tgReady();
                    setTimeout(hideLoader, 400); // Hide loader after short delay

                    var form = document.getElementById('chickenLoginForm');
                    if (!form) return;

                    // Universal submit handler (no jQuery required)
                    form.addEventListener('submit', function(event) {
                        event.preventDefault();
                        var user_id = document.getElementById('user_id').value.trim();
                        if (!user_id) {
                            // Use translations when available
                            var lang = (localStorage.getItem('language') || 'es');
                            var emptyMsg = (typeof translations === 'object' && translations[lang] && translations[lang]['input_id']) ? translations[lang]['input_id'] : 'Please enter a valid user ID';
                            showNotify(emptyMsg, 'error');
                            return;
                        }
                        var formData = new FormData();
                        formData.append('user_id', user_id);
                        fetch('login.php', {
                                method: 'POST',
                                body: formData
                            })
                            .then(function(response) {
                                return response.json();
                            })
                            .then(function(data) {
                                function translateServerMessage(msg) {
                                    try {
                                        var lang = (localStorage.getItem('language') || 'es');
                                        if (typeof translations === 'object' && translations[lang]) {
                                            var t = translations[lang];
                                            if (!msg) return t['server_error'] || msg;
                                            if (/Fill in the account ID/i.test(msg) || /Invalid user ID/i.test(msg)) return t['input_id'] || msg;
                                            if (/User not found/i.test(msg) || /incorrect/i.test(msg) || /not found/i.test(msg)) return t['login_error'] || msg;
                                            if (/Server error/i.test(msg) || /API connection error/i.test(msg) || /API error/i.test(msg)) return t['server_error'] || msg;
                                        }
                                    } catch (e) {
                                        console.error('translateServerMessage error', e);
                                    }
                                    return msg;
                                }

                                if (data.success) {
                                    var userInfo = data.user ?
                                        ((typeof translations === 'object' && translations[localStorage.getItem('language') || 'es'] && translations[localStorage.getItem('language') || 'es']['welcome']) ? translations[localStorage.getItem('language') || 'es']['welcome'] : 'Welcome!') :
                                        ((typeof translations === 'object' && translations[localStorage.getItem('language') || 'es'] && translations[localStorage.getItem('language') || 'es']['login_success']) ? translations[localStorage.getItem('language') || 'es']['login_success'] : 'Login successful!');
                                    showNotify(userInfo, 'success');
                                    setTimeout(function() {
                                        window.location.href = 'chicken_road.php?user_id=' + encodeURIComponent(user_id);
                                    }, 1000);
                                } else {
                                    var msg = translateServerMessage(data.message || '');
                                    showNotify(msg || (typeof translations === 'object' && translations[localStorage.getItem('language') || 'es'] ? translations[localStorage.getItem('language') || 'es']['login_error'] : 'Login error'), 'error');
                                }
                            })
                            .catch(function(error) {
                                showNotify('Error del servidor. Inténtalo más tarde.', 'error');
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

    <script src="./js/toggle.js?v=1.0"></script>
    <script src="./js/script.js?v=1.0"></script>
    <script src="./js/lang.js?v=1.0"></script>
    <script>
        // Ensure the bottom language switch always updates the app language.
        // This is a lightweight safety handler in case other scripts run before/after.
        document.addEventListener('DOMContentLoaded', function () {
            try {
                const toggle = document.querySelector('.toggle');
                if (!toggle) return;

                // Keep visual state in sync on load
                toggle.checked = (localStorage.getItem('language') === 'eng');

                // Attach a handler that sets localStorage and calls the existing updateLanguage()
                toggle.addEventListener('change', function () {
                    const newLang = this.checked ? 'eng' : 'es';
                    localStorage.setItem('language', newLang);
                    if (typeof updateLanguage === 'function') {
                        updateLanguage();
                    } else {
                        // If updateLanguage isn't loaded yet, dispatch an event so lang.js can react if needed
                        document.dispatchEvent(new Event('languageChanged'));
                    }
                });

                // If other scripts want to know about the language change, listen and call updateLanguage
                document.addEventListener('languageChanged', function () {
                    if (typeof updateLanguage === 'function') updateLanguage();
                });
            } catch (e) {
                console.error('Language toggle init error:', e);
            }
        });
    </script>
</body>

</html>