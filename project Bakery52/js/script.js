document.addEventListener("DOMContentLoaded", () => {
    const sideWelcome = document.getElementById("sideWelcome");
    const userNameInput = document.getElementById("userNameInput");
    const greetingOutput = document.getElementById("greetingOutput");
    const sideToggle = document.getElementById("sideToggle");
    const greetBtn = document.getElementById("greetBtn");

sideToggle.onclick = () => {
    sideWelcome.classList.toggle("open");
};
const handleGreet = () => {
    const name = userNameInput.value.trim();
    if(name){
    greetingOutput.textContent = `Welcome bro nigga, ${name}!`;
    greetingOutput.style.color = 'var(--color-primary)';
    } else {
    greetingOutput.textContent = 'Please enter your name BRO';
    greetingOutput.style.color = '#e65c4f';}
};

greetBtn.onclick = handleGreet;
});

const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = themeToggleBtn.querySelector('.theme-icon');
const themeText = themeToggleBtn.querySelector('.theme-text');

themeToggleBtn.onclick = () => {
    // 1. Переключаем класс темы у body
    const isDark = document.body.classList.toggle('dark-theme');
    
    // 2. Красиво меняем иконку и текст кнопки
    if (isDark) {
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light Mode';
    } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark Mode';
    }
};