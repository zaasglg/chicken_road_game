const translations = {
  eng: {
    welcome: "Welcome!",
    sign_in: "Sign in",
    how_to_sign_in: "How to sign in",
    input_id: "Input your account ID",
    input_password: "Input your password",
    login_success: "Login successful!",
    login_error: "Incorrect credentials. Please try again.",
    server_error: "Server error. Try again later.",
    your_id: "Your ID:", // Только текст перед значением
    your_status: "Your Status:", // Только текст перед значением
    make_deposit: "Make a deposit",
    contact_me: "Contact me",
    overlay_text:
      "Welcome, to unlock all features make a deposit 55.000 COP to your 1xBet accountt",
    home: "Home",
    aviator: "Aviator",
    mines: "Mines",
  },
  es: {
    welcome: "¡Bienvenido!",
    sign_in: "Iniciar sesión",
    how_to_sign_in: "Cómo iniciar sesión",
    input_id: "Introduce tu ID de cuenta",
    input_password: "Introduce tu contraseña",
    login_success: "¡Inicio de sesión exitoso!",
    login_error: "Credenciales incorrectas. Inténtalo de nuevo.",
    server_error: "Error del servidor. Inténtalo más tarde.",
    your_id: "Tu ID:", // Только текст перед значением
    your_status: "Tu estado:", // Только текст перед значением
    make_deposit: "Hacer un depósito",
    contact_me: "Contáctame",
    overlay_text:
      "Bienvenido, para desbloquear todas las funciones haz un depósito de 55.000 COP en tu cuenta 1xBet",
    home: "Inicio",
    aviator: "Aviador",
    mines: "Minas",
  },
};

function updateLanguage() {
  const language = localStorage.getItem("language") || "es";

  // Обновляем только текст, не весь HTML
  document.querySelectorAll(".translate").forEach((element) => {
    const key = element.getAttribute("data-key");
    if (translations[language] && translations[language][key]) {
      // Для элементов с user info сохраняем span
      if (element.classList.contains("user-info-text")) {
        const span = element.querySelector("span");
        if (span) {
          element.innerHTML =
            translations[language][key] + " " + span.outerHTML;
        } else {
          element.textContent = translations[language][key];
        }
      } else {
        element.textContent = translations[language][key];
      }
    }
  });

  // Обновление placeholder
  document.querySelectorAll(".translate-placeholder").forEach((element) => {
    const key = element.getAttribute("data-key");
    if (translations[language] && translations[language][key]) {
      element.setAttribute("placeholder", translations[language][key]);
    }
  });

  // Обновление состояния переключателя
  document.querySelectorAll(".toggle").forEach((toggle) => {
    toggle.checked = language === "eng";
  });
}

document.addEventListener("DOMContentLoaded", function () {
  updateLanguage();

  document.querySelectorAll(".toggle").forEach((toggle) => {
    toggle.addEventListener("change", function () {
      const newLanguage = this.checked ? "eng" : "es";
      localStorage.setItem("language", newLanguage);
      updateLanguage();
    });
  });
});
