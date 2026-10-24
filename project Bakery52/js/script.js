document.addEventListener('DOMContentLoaded', () => {
    const sideWidget = document.getElementById('sideWidget');
    const widgetToggle = document.getElementById('widgetToggle');
    const closeBtn = document.getElementById('closeBtn'); // Кнопка крестика
    
    const nameInput = document.getElementById('userNameInput');
    const greetBtn = document.querySelector('#greetBtn');
    const greetingOutput = document.getElementById('greetingOutput');

    // 1. Открытие/закрытие по клику на бирочку
    widgetToggle.addEventListener('click', () => {
        sideWidget.classList.toggle('open');
    });

    // 2. Закрытие по клику на крестик
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sideWidget.classList.remove('open');
        });
    }

    // 3. Логика Task 0 (Приветствие)
    function handleGreeting() {
        if (!nameInput || !greetingOutput) return;

        const trimmedValue = nameInput.value.trim();

        if (trimmedValue === '') {
            greetingOutput.textContent = 'Please enter your name!';
            greetingOutput.style.color = '#c93b2b';
        } else {
            greetingOutput.textContent = `Welcome, ${trimmedValue}! 🥐`;
            greetingOutput.style.color = '#6f4e37';
        }
    }

    if (greetBtn) {
        greetBtn.addEventListener('click', handleGreeting);
    }
});