// Функция для инициализации переключателей
function initializeSwitches() {
  const switches = document.querySelectorAll('.switch, .switch2'); // Находим все переключатели
  const language = localStorage.getItem('language') || 'eng'; // Получаем язык из localStorage или устанавливаем 'eng' по умолчанию

  switches.forEach((switchBlock) => {
    const toggle = switchBlock.querySelector('.toggle'); // Находим переключатель
    const eng = switchBlock.querySelector('.eng');      // Находим текст ENG
    const es = switchBlock.querySelector('.es');        // Находим текст ES

    // Устанавливаем начальное состояние переключателя в зависимости от языка
    if (language === 'es') {
      toggle.checked = true;
      eng.style.color = "#949790";
      es.style.color = "white";
    } else {
      toggle.checked = false;
      eng.style.color = "white";
      es.style.color = "#949790";
    }

    // Обработчик переключения языка
    toggle.addEventListener("change", function () {
      const newLanguage = this.checked ? 'es' : 'eng'; // Устанавливаем новый язык
      localStorage.setItem('language', newLanguage); // Сохраняем язык в localStorage

      // Меняем цвета для всех переключателей
      const allSwitches = document.querySelectorAll('.toggle');
      allSwitches.forEach(switchEl => {
        const engText = switchEl.closest('label').querySelector('.eng');
        const esText = switchEl.closest('label').querySelector('.es');
        if (newLanguage === 'es') {
          engText.style.color = "#949790";
          esText.style.color = "white";
        } else {
          engText.style.color = "white";
          esText.style.color = "#949790";
        }
      });
    });
  });
}

// Инициализация всех переключателей
initializeSwitches();