window.addEventListener("DOMContentLoaded", function () {
  const coeffDisplay = document.querySelector(".rand_number");
  let currentGame = null;
  let checkInterval = 1000; // Интервал проверки API в миллисекундах
  let lastActiveGameId = null; // Запоминаем ID последней активной игры

  async function runCoefficientCycle() {
    try {
      const response = await fetch(
        "https://avia.valor-games.com/api/cfs/current"
      );
      const data = await response.json();

      if (!data || data.length === 0) {
        console.error("Нет данных от API");
        setTimeout(runCoefficientCycle, checkInterval);
        return;
      }

      // Находим все возможные игры
      const activeGame = data.find((item) => item.game_status === "active");
      const loadingGame = data.find((item) => item.game_status === "loading");
      const nextGame = data.find((item) => item.game_status === "next");
      const finishedGame = data.find((item) => item.game_status === "finished");

      // Логика отображения:
      // 1. Если есть активная игра (status=active) - показываем её коэффициент
      // 2. Если активной нет, но есть loading - показываем loading
      // 3. Только если есть finished игра - переключаемся на next игру

      if (activeGame) {
        // Запоминаем ID активной игры
        lastActiveGameId = activeGame.game;
        coeffDisplay.textContent = parseFloat(activeGame.cf).toFixed(2);
      } else if (loadingGame) {
        // Показываем loading игру, если активной нет
        coeffDisplay.textContent = parseFloat(loadingGame.cf).toFixed(2);
      } else if (finishedGame && nextGame) {
        // Проверяем, что finished игра - это предыдущая активная
        if (finishedGame.game === lastActiveGameId) {
          // Только тогда переключаемся на next игру
          coeffDisplay.textContent = parseFloat(nextGame.cf).toFixed(2);
          lastActiveGameId = null; // Сбрасываем, чтобы не переключать повторно
        }
      } else if (nextGame) {
        // Если других игр нет, но есть next - показываем её
        coeffDisplay.textContent = parseFloat(nextGame.cf).toFixed(2);
      }

      // Всегда продолжаем проверку
      setTimeout(runCoefficientCycle, checkInterval);
    } catch (error) {
      console.error("Ошибка:", error);
      setTimeout(runCoefficientCycle, checkInterval);
    }
  }

  // Запускаем систему
  runCoefficientCycle();

  // Очистка при выходе
  window.addEventListener("beforeunload", function () {
    if (currentGame) {
      clearTimeout(currentGame);
    }
  });
});