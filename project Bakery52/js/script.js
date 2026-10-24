document.addEventListener("DOMContentLoaded", () => {
    // --- 1. ПРИВЕТСТВИЕ / ВИДЖЕТ ---
    const sideWelcome = document.getElementById("sideWelcome");
    const userNameInput = document.getElementById("userNameInput");
    const greetingOutput = document.getElementById("greetingOutput");
    const sideToggle = document.getElementById("sideToggle");
    const greetBtn = document.getElementById("greetBtn");

    if (sideToggle && sideWelcome) {
        sideToggle.onclick = () => {
            sideWelcome.classList.toggle("open");
        };
    }

    if (greetBtn && userNameInput && greetingOutput) {
        const handleGreet = () => {
            const name = userNameInput.value.trim();
            if (name) {
                greetingOutput.textContent = `Welcome, ${name}!`;
                greetingOutput.style.color = 'var(--color-primary)';
            } else {
                greetingOutput.textContent = 'Please enter your name!';
                greetingOutput.style.color = '#e65c4f';
            }
        };
        greetBtn.onclick = handleGreet;
    }

    // --- 2. ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ (с защитой от ошибок) ---
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        const themeIcon = themeToggleBtn.querySelector('.theme-icon');
        const themeText = themeToggleBtn.querySelector('.theme-text');

        themeToggleBtn.onclick = () => {
            const isDark = document.body.classList.toggle('dark-theme');
            
            if (isDark) {
                if (themeIcon) themeIcon.textContent = '☀️';
                if (themeText) themeText.textContent = 'Light Mode';
            } else {
                if (themeIcon) themeIcon.textContent = '🌙';
                if (themeText) themeText.textContent = 'Dark Mode';
            }
        };
    }

    // --- 3. ЖИВОЙ ПОИСК (ЗАДАЧА 3) ---
    const searchInput = document.getElementById('searchInput');
    const productCards = document.querySelectorAll('.card-grid .product-card');
    const searchCount = document.getElementById('searchCount');
    const noResultsMsg = document.getElementById('noResults');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = searchInput.value.toLowerCase().trim();
            let visibleCount = 0;

            productCards.forEach(card => {
                const titleElement = card.querySelector('h3');
                const titleText = titleElement ? titleElement.textContent.toLowerCase() : '';

                if (titleText.includes(query)) {
                    card.classList.remove('hidden');
                    visibleCount++;
                } else {
                    card.classList.add('hidden');
                }
            });

            if (searchCount) {
                searchCount.textContent = `Found items: ${visibleCount}`;
            }

            if (noResultsMsg) {
                if (visibleCount === 0) {
                    noResultsMsg.style.display = 'block';
                } else {
                    noResultsMsg.style.display = 'none';
                }
            }
        });
    }
});