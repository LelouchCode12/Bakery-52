document.addEventListener("DOMContentLoaded", () => {
    initWelcome();
    initMenu();
    initTheme();
    initSearch();
    initRecommendations();
});

function initWelcome() {
    const sideWelcome = document.getElementById("sideWelcome");
    const sideToggle = document.getElementById("sideToggle");
    const userNameInput = document.getElementById("userNameInput");
    const greetingOutput = document.getElementById("greetingOutput");
    const greetBtn = document.getElementById("greetBtn");

    if (sideWelcome && sideToggle) {
        sideToggle.addEventListener("click", () => {
            sideWelcome.classList.toggle("open");
        });
    }

    if (greetBtn && userNameInput && greetingOutput) {
        greetBtn.addEventListener("click", () => {
            const name = userNameInput.value.trim();

            if (name) {
                greetingOutput.textContent = `Welcome, ${name}!`;
                greetingOutput.style.color = "var(--color-primary)";
            } else {
                greetingOutput.textContent = "Please enter your name!";
                greetingOutput.style.color = "var(--color-error)";
            }
        });
    }
}

function initMenu() {
    const menuBtn = document.getElementById("menuBtn");
    const siteMenu = document.getElementById("siteMenu");

    if (!menuBtn || !siteMenu) return;

    const isOpen = () => siteMenu.classList.contains("open");

    const placeMenu = () => {
        const rect = menuBtn.getBoundingClientRect();
        siteMenu.style.top = `${rect.bottom + window.scrollY + 10}px`;
        siteMenu.style.right = `${document.documentElement.clientWidth - rect.right}px`;
    };

    const setMenu = (open) => {
        if (open) placeMenu();
        siteMenu.classList.toggle("open", open);
        menuBtn.setAttribute("aria-expanded", String(open));
        menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    menuBtn.addEventListener("click", () => setMenu(!isOpen()));

    document.addEventListener("click", (e) => {
        const clickedOutside = !siteMenu.contains(e.target) && !menuBtn.contains(e.target);
        if (isOpen() && clickedOutside) setMenu(false);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isOpen()) setMenu(false);
    });

    window.addEventListener("resize", () => {
        if (isOpen()) placeMenu();
    });
}

function initTheme() {
    const themeButtons = document.querySelectorAll("[data-theme-choice]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const isDarkNow = () => document.body.classList.contains("dark-theme");

    const applyTheme = (isDark) => {
        document.body.classList.toggle("dark-theme", isDark);

        themeButtons.forEach((btn) => {
            const btnIsDark = btn.dataset.themeChoice === "dark";
            btn.setAttribute("aria-pressed", String(btnIsDark === isDark));
        });

        try {
            localStorage.setItem("theme", isDark ? "dark" : "light");
        } catch (e) {}
    };

    const switchTheme = (isDark, originEl) => {
        if (isDark === isDarkNow()) return;

        if (!document.startViewTransition || reduceMotion.matches) {
            applyTheme(isDark);
            return;
        }

        const rect = originEl.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const radius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const root = document.documentElement;
        root.classList.add("theme-switching");

        const transition = document.startViewTransition(() => applyTheme(isDark));

        transition.ready
            .then(() => {
                root.animate(
                    {
                        clipPath: [
                            `circle(0px at ${x}px ${y}px)`,
                            `circle(${radius}px at ${x}px ${y}px)`
                        ]
                    },
                    {
                        duration: 650,
                        easing: "ease-in-out",
                        pseudoElement: "::view-transition-new(root)"
                    }
                );
            })
            .catch(() => {});

        transition.finished.finally(() => {
            root.classList.remove("theme-switching");
        });
    };

    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem("theme");
    } catch (e) {}

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(savedTheme ? savedTheme === "dark" : prefersDark);

    themeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            switchTheme(btn.dataset.themeChoice === "dark", btn);
        });
    });
}

function initSearch() {
    const searchInput = document.getElementById("searchInput");
    const searchCount = document.getElementById("searchCount");
    const noResultsMsg = document.getElementById("noResults");
    const productCards = document.querySelectorAll(".card-grid .product-card");

    if (!searchInput) return;

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        productCards.forEach((card) => {
            const title = card.querySelector("h3");
            const text = title ? title.textContent.toLowerCase() : "";
            const matches = text.includes(query);

            card.classList.toggle("hidden", !matches);
            if (matches) visibleCount++;
        });

        if (searchCount) {
            searchCount.textContent = `Found items: ${visibleCount}`;
        }

        if (noResultsMsg) {
            noResultsMsg.style.display = visibleCount === 0 ? "block" : "none";
        }
    });
}
function initRecommendations() {
    const itemForm = document.getElementById('item-form');
    const itemInput = document.getElementById('item-input');
    const itemsList = document.getElementById('items-list');
    const itemCount = document.getElementById('item-count');

    if (!itemForm || !itemInput || !itemsList || !itemCount) return;

    let totalItems = 0;

    function updateCount() {
        itemCount.textContent = totalItems;
    }

    itemForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const text = itemInput.value.trim();
        if (text === "") return;

        const li = document.createElement('li');
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.padding = "0.75rem 1rem";
        li.style.background = "var(--color-surface)";
        li.style.border = "1px solid var(--color-border)";
        li.style.borderRadius = "var(--radius)";
        li.style.marginBottom = "0.5rem";

        const span = document.createElement('span');
        span.textContent = text;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = "Remove";
        deleteBtn.className = "btn btn-outline";
        deleteBtn.style.padding = "0.25rem 0.75rem";
        deleteBtn.style.fontSize = "0.85rem";

        deleteBtn.addEventListener('click', function() {
            li.remove();
            totalItems--;
            updateCount();
        });

        li.appendChild(span);
        li.appendChild(deleteBtn);
        itemsList.appendChild(li);

        totalItems++;
        updateCount();
        itemInput.value = "";
    });
}