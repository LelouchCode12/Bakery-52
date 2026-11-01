$(function () {
    initWelcome();
    initMenu();
    initTheme();
    initSearch();
    initRecommendations();
    initFaq();
});
/* ============================================================================================================ */
function initWelcome() {
    const $sideWelcome = $("#sideWelcome");
    const $sideToggle = $("#sideToggle");
    const $userNameInput = $("#userNameInput");
    const $greetingOutput = $("#greetingOutput");
    const $greetBtn = $("#greetBtn");

    if ($sideWelcome.length && $sideToggle.length) {
        $sideToggle.on("click", function () {
            $sideWelcome.toggleClass("open");
            $sideToggle.attr("aria-expanded", String($sideWelcome.hasClass("open")));
        });
    }

    if ($greetBtn.length && $userNameInput.length && $greetingOutput.length) {
        const showGreeting = function () {
            const name = $userNameInput.val().trim();

            if (name) {
                $greetingOutput
                    .text(`Welcome, ${name}!`)
                    .removeClass("greeting-error")
                    .addClass("greeting-success");
            } else {
                $greetingOutput
                    .text("Please enter your name!")
                    .removeClass("greeting-success")
                    .addClass("greeting-error");
            }

            $greetingOutput.stop(true, true).hide().fadeIn(320);
        };

        $greetBtn.on("click", showGreeting);

        $userNameInput.on("keydown", function (e) {
            if (e.key === "Enter") {
                showGreeting();
            }
        });
    }
}
/* ============================================================================================================ */
function initFaq() {
    const $questions = $(".faq-question");
    const $status = $(".faq-status");

    if (!$questions.length) return;

    const showStatus = (text) => {
        $status.stop(true, true).text(text).fadeTo(200, 1).delay(1500).fadeTo(400, 0);
    };

    $questions.on("click", function () {
        const $btn = $(this);
        const $panel = $("#" + $btn.attr("aria-controls"));
        const willOpen = $btn.attr("aria-expanded") === "false";

        if (willOpen) {
            $questions.not($btn).each(function () {
                const $otherBtn = $(this);
                if ($otherBtn.attr("aria-expanded") === "true") {
                    $otherBtn.attr("aria-expanded", "false");
                    $("#" + $otherBtn.attr("aria-controls")).stop(true, true).slideUp(250);
                }
            });
        }

        $btn.attr("aria-expanded", String(willOpen));
        $panel.stop(true, true).slideToggle(250);
        showStatus(willOpen ? "Answer opened" : "Answer closed");
    });

    $questions.on("keydown", function (e) {
        const index = $questions.index(this);
        const last = $questions.length - 1;
        let target = null;

        if (e.key === "ArrowDown") target = index === last ? 0 : index + 1;
        else if (e.key === "ArrowUp") target = index === 0 ? last : index - 1;
        else if (e.key === "Home") target = 0;
        else if (e.key === "End") target = last;

        if (target !== null) {
            e.preventDefault();
            $questions.eq(target).trigger("focus");
        }
    });
}
/* ============================================================================================================ */
function initMenu() {
    const $menuBtn = $("#menuBtn");
    const $siteMenu = $("#siteMenu");

    if (!$menuBtn.length || !$siteMenu.length) return;

    const isOpen = () => $siteMenu.hasClass("open");

    const placeMenu = () => {
        const rect = $menuBtn[0].getBoundingClientRect();
        $siteMenu.css({
            top: rect.bottom + window.scrollY + 10,
            right: document.documentElement.clientWidth - rect.right
        });
    };

    const setMenu = (open) => {
        if (open) placeMenu();
        $siteMenu.toggleClass("open", open);
        $menuBtn.attr({
            "aria-expanded": String(open),
            "aria-label": open ? "Close menu" : "Open menu"
        });
    };

    $menuBtn.on("click", () => setMenu(!isOpen()));

    $(document).on("click", function (e) {
        const clickedOutside = $(e.target).closest("#siteMenu, #menuBtn").length === 0;
        if (isOpen() && clickedOutside) setMenu(false);
    });

    $(document).on("keydown", function (e) {
        if (e.key === "Escape" && isOpen()) setMenu(false);
    });

    $(window).on("resize", function () {
        if (isOpen()) placeMenu();
    });
}
/* ============================================================================================================ */
function initTheme() {
    const $themeButtons = $("[data-theme-choice]");
    const $html = $("html");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const isDarkNow = () => $html.hasClass("dark-theme");

    const applyTheme = (isDark) => {
        $html.toggleClass("dark-theme", isDark);

        $themeButtons.each(function () {
            const btnIsDark = $(this).data("themeChoice") === "dark";
            $(this).attr("aria-pressed", String(btnIsDark === isDark));
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
        const $root = $(root);
        root.style.setProperty("--vt-x", `${x}px`);
        root.style.setProperty("--vt-y", `${y}px`);
        root.style.setProperty("--vt-r", `${radius}px`);
        $root.addClass(isDark ? "to-dark" : "to-light");

        const transition = document.startViewTransition(() => applyTheme(isDark));

        transition.finished.finally(() => {
            $root.removeClass("to-dark to-light");
            root.style.removeProperty("--vt-x");
            root.style.removeProperty("--vt-y");
            root.style.removeProperty("--vt-r");
        });
    };

    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem("theme");
    } catch (e) {}

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(savedTheme ? savedTheme === "dark" : prefersDark);

    $themeButtons.on("click", function () {
        switchTheme($(this).data("themeChoice") === "dark", this);
    });
}
/* ============================================================================================================ */
function initSearch() {
    const $searchInput = $("#searchInput");
    const $searchCount = $("#searchCount");
    const $noResultsMsg = $("#noResults");
    const $productCards = $(".card-grid .product-card");

    if (!$searchInput.length) return;

    $searchInput.on("input", function () {
        const query = $searchInput.val().toLowerCase().trim();
        let visibleCount = 0;

        $productCards.each(function () {
            const text = $(this).find("h3").text().toLowerCase();
            const matches = text.includes(query);

            $(this).toggleClass("hidden", !matches);
            if (matches) visibleCount++;
        });

        $searchCount.text(`Found items: ${visibleCount}`);
        $noResultsMsg.toggle(visibleCount === 0);
    });
}
/* ============================================================================================================ */
function initRecommendations() {
    const $itemForm = $("#item-form");
    const $itemInput = $("#item-input");
    const $itemsList = $("#items-list");
    const $itemCount = $("#item-count");

    if (!$itemForm.length || !$itemInput.length || !$itemsList.length || !$itemCount.length) return;

    let totalItems = 0;

    const updateCount = () => $itemCount.text(totalItems);

    $itemForm.on("submit", function (event) {
        event.preventDefault();

        const text = $itemInput.val().trim();
        if (text === "") return;

        const $li = $("<li>").css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.75rem 1rem",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius)",
            marginBottom: "0.5rem"
        });

        const $span = $("<span>").text(text);

        const $deleteBtn = $("<button>")
            .attr("type", "button")
            .text("Remove")
            .addClass("btn btn-outline")
            .css({ padding: "0.25rem 0.75rem", fontSize: "0.85rem" })
            .on("click", function () {
                $li.remove();
                totalItems--;
                updateCount();
            });

        $li.append($span, $deleteBtn);
        $itemsList.append($li);

        totalItems++;
        updateCount();
        $itemInput.val("");
    });
}