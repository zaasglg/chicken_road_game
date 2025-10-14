document.addEventListener("DOMContentLoaded", function () {
    // Простой скрипт для hack бота
    console.log("Hack bot script loaded successfully");
    
    // Проверяем наличие формы логина
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        console.log("Login form found");
        
        // Обработка отправки формы уже есть в самом HTML, не дублируем
    }
    
    // Проверяем элементы переключения языка
    const toggleElements = document.querySelectorAll('.toggle');
    if (toggleElements.length > 0) {
        console.log("Language toggles found:", toggleElements.length);
    }
    
    // Убеждаемся, что нет ошибок с несуществующими элементами
    try {
        // Любая дополнительная логика может быть добавлена здесь
        console.log("Script initialization completed");
    } catch (error) {
        console.error("Error in script initialization:", error);
    }
});