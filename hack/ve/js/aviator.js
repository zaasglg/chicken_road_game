window.addEventListener("DOMContentLoaded", function () {
  const coeffDisplay = document.querySelector(".rand_number");
  let currentGame = null;

  // Основная функция работы с коэффициентами
  async function runCoefficientCycle() {
    try {
      // Получаем данные с API
      const response = await fetch(
        "https://aviator.valor-games.com/api/cfs/current"
      );
      const data = await response.json();

      if (!data || data.length === 0) {
        console.error("Нет данных от API");
        setTimeout(runCoefficientCycle, 1000);
        return;
      }

      // Находим текущий и следующий коэффициенты
      const currentData = data.find((item) => item.status === "current");
      const nextData = data.find((item) => item.status === "next");

      if (!currentData || !nextData) {
        console.error("Не найдены текущий/следующий коэффициенты");
        setTimeout(runCoefficientCycle, 1000);
        return;
      }

      const currentCoeff = parseFloat(currentData.amount);
      const nextCoeff = parseFloat(nextData.amount);
      const gameDuration = calculateDuration(currentCoeff);

      // Отображаем текущий коэффициент
      coeffDisplay.textContent = currentCoeff.toFixed(2);

      // Запускаем таймер на время игры
      currentGame = setTimeout(() => {
        // Когда время истекло, сразу переключаем на следующий коэффициент
        coeffDisplay.textContent = nextCoeff.toFixed(2);

        // И сразу начинаем новый цикл для следующей игры
        runCoefficientCycle();
      }, gameDuration);
    } catch (error) {
      console.error("Ошибка:", error);
      setTimeout(runCoefficientCycle, 1000);
    }
  }

  // Вычисляем длительность игры в миллисекундах
  function calculateDuration(coefficient) {
    // Базовое время для коэффициента 1.00
    const baseTime = 1000; // 1 секунда

    // Каждые 0.01 коэффициента добавляем 10мс
    // Пример: 1.22 = 1000 + (0.22 * 1000) = 1220мс (1.22сек)
    return baseTime + (coefficient - 1) * 1000;
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
