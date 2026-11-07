$(function () {
    initWelcome();
    initMenu();
    initTheme();
    initSearch();
    initRecommendations();
    initFaq();
    initCarousel();
    initCart();
    initCustomCakeForm();
});
/* ============================================================================================================ */
function initWelcome() {
    const $sideWelcome    = $("#sideWelcome");
    const $sideToggle     = $("#sideToggle");
    const $userNameInput  = $("#userNameInput");
    const $greetingOutput = $("#greetingOutput");
    const $greetBtn       = $("#greetBtn");

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
            if (e.key === "Enter") showGreeting();
        });
    }
}

/* ============================================================================================================ */
function initFaq() {
    const $questions = $(".faq-question");
    const $status    = $(".faq-status");

    if (!$questions.length) return;

    const showStatus = (text) => {
        $status.stop(true, true).text(text).fadeTo(200, 1).delay(1500).fadeTo(400, 0);
    };

    $questions.on("click", function () {
        const $btn    = $(this);
        const $panel  = $("#" + $btn.attr("aria-controls"));
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
        const index  = $questions.index(this);
        const last   = $questions.length - 1;
        let target   = null;

        if      (e.key === "ArrowDown") target = index === last ? 0 : index + 1;
        else if (e.key === "ArrowUp")   target = index === 0 ? last : index - 1;
        else if (e.key === "Home")      target = 0;
        else if (e.key === "End")       target = last;

        if (target !== null) {
            e.preventDefault();
            $questions.eq(target).trigger("focus");
        }
    });
}

/* ============================================================================================================ */
function initMenu() {
    const $menuBtn  = $("#menuBtn");
    const $siteMenu = $("#siteMenu");

    if (!$menuBtn.length || !$siteMenu.length) return;

    const isOpen = () => $siteMenu.hasClass("open");

    const placeMenu = () => {
        const rect = $menuBtn[0].getBoundingClientRect();
        $siteMenu.css({
            top:   rect.bottom + 10,
            right: document.documentElement.clientWidth - rect.right
        });
    };

    const setMenu = (open) => {
        if (open) placeMenu();
        $siteMenu.toggleClass("open", open);
        $menuBtn.attr({
            "aria-expanded": String(open),
            "aria-label":    open ? "Close menu" : "Open menu"
        });
    };

    $menuBtn.on("click", () => setMenu(!isOpen()));

    $(document).on("click", function (e) {
        if (isOpen() && $(e.target).closest("#siteMenu, #menuBtn").length === 0) setMenu(false);
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
    const $html         = $("html");
    const reduceMotion  = window.matchMedia("(prefers-reduced-motion: reduce)");

    const isDarkNow = () => $html.hasClass("dark-theme");

    const applyTheme = (isDark) => {
        $html.toggleClass("dark-theme", isDark);
        $themeButtons.each(function () {
            const btnIsDark = $(this).data("themeChoice") === "dark";
            $(this).attr("aria-pressed", String(btnIsDark === isDark));
        });
        try { localStorage.setItem("theme", isDark ? "dark" : "light"); } catch (e) {}
    };

    const switchTheme = (isDark, originEl) => {
        if (isDark === isDarkNow()) return;

        if (!document.startViewTransition || reduceMotion.matches) {
            applyTheme(isDark);
            return;
        }

        const rect   = originEl.getBoundingClientRect();
        const x      = rect.left + rect.width  / 2;
        const y      = rect.top  + rect.height / 2;
        const radius = Math.hypot(
            Math.max(x, window.innerWidth  - x),
            Math.max(y, window.innerHeight - y)
        );

        const root  = document.documentElement;
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
    try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(savedTheme ? savedTheme === "dark" : prefersDark);

    $themeButtons.on("click", function () {
        switchTheme($(this).data("themeChoice") === "dark", this);
    });
}

/* ============================================================================================================ */
function initSearch() {
    const $searchInput   = $("#searchInput");
    const $searchCount   = $("#searchCount");
    const $noResultsMsg  = $("#noResults");
    const $productCards  = $(".card-grid .product-card");
    const $catBtns       = $("#categoryFilters .cat-btn");

    if (!$searchInput.length) return;

    let activeCategory = "all";

    const applyFilters = () => {
        const query = $searchInput.val().toLowerCase().replace(/\s+/g, " ").trim();
        let visibleCount = 0;

        $productCards.each(function () {
            const $card = $(this);

            const cardText = $card.find("h3, p").text().toLowerCase();

            const cardCategory = $card.data("category") || "";
            const matchesCategory = (activeCategory === "all") || (cardCategory === activeCategory);

            const matchesQuery = (query === "") || cardText.includes(query);

            const isVisible = matchesCategory && matchesQuery;
            $card.toggleClass("hidden", !isVisible);
            if (isVisible) visibleCount++;
        });

        $searchCount.text(`Found items: ${visibleCount}`);
        $noResultsMsg.toggle(visibleCount === 0);
    };

    $searchInput.on("input", applyFilters);

    $catBtns.on("click", function () {

        $catBtns.removeClass("active").attr("aria-pressed", "false");
        $(this).addClass("active").attr("aria-pressed", "true");

        activeCategory = $(this).data("category");
        applyFilters();
    });

    applyFilters();
}

/* ============================================================================================================ */
function initRecommendations() {
    const $itemForm     = $("#item-form");
    const $itemInput    = $("#item-input");
    const $itemsList    = $("#items-list");
    const $itemCount    = $("#item-count");
    const $itemError    = $("#item-error");
    const $emptyMsg     = $("#empty-list-msg");

    if (!$itemForm.length || !$itemsList.length) return;

    let totalItems = 0;

    const updateUI = () => {
        $itemCount.text(totalItems);
        $emptyMsg.toggle(totalItems === 0);
    };

    $itemForm.on("submit", function (event) {
        event.preventDefault();

        const text = $itemInput.val().trim();

        if (text === "") {
            $itemError.stop(true, true).fadeIn(200);
            $itemInput.addClass("input-invalid").trigger("focus");
            return;
        }


        $itemError.hide();
        $itemInput.removeClass("input-invalid");


        const $li = $("<li>").addClass("rec-item").attr("data-text", text);

        const $span = $("<span>").addClass("rec-item__text").text(text);

        const $deleteBtn = $("<button>")
            .attr("type", "button")
            .text("Remove")
            .addClass("btn-remove");

        $li.append($span, $deleteBtn);

        $li.hide();
        $itemsList.append($li);
        $li.fadeIn(280);

        totalItems++;
        updateUI();
        $itemInput.val("").trigger("focus");
    });

    $itemInput.on("input", function () {
        if ($(this).val().trim() !== "") {
            $itemError.hide();
            $(this).removeClass("input-invalid");
        }
    });

    $itemsList.on("click", ".btn-remove", function () {
        const $li = $(this).closest("li");

        $li.fadeOut(250, function () {
            $(this).remove();
            totalItems--;
            updateUI();
        });
    });

    updateUI();
}
/* ============================================================================================================ */
function initCarousel() {
    const $track = $("#cakeTrack");
    const $modal = $("#cakeModal");
    if (!$track.length) return;
    if (!$track.data("cloned")) {
        $track.data("cloned", true);
        const $items = $track.children();
        for (let i = 0; i < 3; i++) {
            $items.clone().attr("aria-hidden", "true").appendTo($track);
        }
    }
    $track.parent().on("mouseenter", function () {
        $track[0].getAnimations().forEach(a => a.updatePlaybackRate(0.5));
    }).on("mouseleave", function () {
        $track[0].getAnimations().forEach(a => a.updatePlaybackRate(1));
    });

    if (!$modal.length) return;

    const closeModal = () => {
        $modal.removeClass("open").attr("aria-hidden", "true");
    };

    $track.on("click", ".product-card", function () {
        const $card = $(this);
        const $img = $card.find("img");
        $("#modalImg").attr({ src: $img.attr("src"), alt: $img.attr("alt") });
        $("#modalTitle").text($card.find("h3").text());
        $("#modalDesc").text($card.data("desc") || "");
        $("#modalKcal").text($card.data("kcal") || "—");
        $("#modalProtein").text(($card.data("protein") || "—") + "g");
        $("#modalFat").text(($card.data("fat") || "—") + "g");
        $("#modalCarbs").text(($card.data("carbs") || "—") + "g");
        $modal.addClass("open").attr("aria-hidden", "false");
    });

    $("#modalClose").on("click", closeModal);
    $modal.on("click", function (e) {
        if (e.target === this) closeModal();
    });
    $(document).on("keydown", function (e) {
        if (e.key === "Escape" && $modal.hasClass("open")) closeModal();
    });
}
/* ============================================================================================================ */
function initCart() {
    const $cartBtn   = $("#cartBtn");
    const $cartCount = $("#cartCount");
    if (!$cartBtn.length) return;

    let cart = {};
    try {
        const stored = JSON.parse(localStorage.getItem("bakeryCart"));
        if (stored && typeof stored === "object" && !Array.isArray(stored)) {
            cart = stored;
        } else if (Array.isArray(stored)) {
            stored.forEach(item => {
                if (item && item.name) {
                    cart[item.name] = { price: item.price || 0, qty: item.qty || 1 };
                }
            });
        }
    } catch (e) {
        cart = {};
    }

    let usdtRate = 495.0;
    const fetchUsdtRate = () => {
        fetch("https://open.er-api.com/v6/latest/USD")
            .then(res => res.json())
            .then(data => {
                if (data && data.rates && data.rates.KZT) {
                    usdtRate = parseFloat(data.rates.KZT);
                    updateCryptoAmount();
                }
            })
            .catch(() => {
                fetch("https://api.exchangerate-api.com/v4/latest/USD")
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.rates && data.rates.KZT) {
                            usdtRate = parseFloat(data.rates.KZT);
                            updateCryptoAmount();
                        }
                    })
                    .catch(() => {});
            });
    };

    const updateCryptoAmount = (sum) => {
        if (typeof sum === "undefined") {
            sum = 0;
            $.each(cart, function (_, item) {
                if (item && item.qty > 0) sum += (item.price || 0) * item.qty;
            });
        }
        const usdt = sum > 0 ? (sum / usdtRate).toFixed(2) : "0.00";
        $("#cryptoUsdtAmount").text(usdt + " USDT");
        $("#cryptoKztSub").text("(" + sum.toLocaleString("ru-RU") + "₸)");
        $("#cryptoUsdtRate").text(usdtRate.toFixed(2));
        $("#cryptoPayBtn").text("Pay " + usdt + " USDT");
    };

    fetchUsdtRate();

    const $dialog = $(`
        <dialog id="cartDialog">
            <div class="cart-dialog_head">
                <h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -3px; margin-right: 6px;"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Cart (<span class="cart-head-count">0</span>)
                </h3>
                <button type="button" class="cart-dialog_close" id="cartCloseBtn" aria-label="Close cart">&times;</button>
            </div>
            <p id="cartEmptyMsg" class="cart-empty-msg">Your cart is empty.</p>
            <ul id="cartList" class="cart-list"></ul>
            <div class="cart-total-bar">
                <span>Total</span>
                <strong><span id="cartTotal">0</span>₸</strong>
            </div>
            <div class="cart-dialog_footer">
                <button type="button" class="btn-checkout" id="cartCheckoutBtn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    Checkout
                </button>
                <button type="button" class="cart-clear-link" id="cartClearBtn">Clear Cart</button>
            </div>
        </dialog>
    `).appendTo("body");

    const $checkout = $(`
        <dialog id="checkoutDialog">
            <div class="checkout-head">
                <div>
                    <h3>Payment Details</h3>
                    <p class="checkout-sub">Complete your purchase securely</p>
                </div>
                <button type="button" class="cart-dialog_close" id="checkoutCloseBtn" aria-label="Close">&times;</button>
            </div>

            <div class="pay-methods">
                <button type="button" class="pay-tab active" data-tab="card">
                    <svg width="18" height="14" viewBox="0 0 24 18" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;"><rect x="1" y="1" width="22" height="16" rx="3"/><line x1="1" y1="6" x2="23" y2="6"/></svg>
                    <span>Card</span>
                </button>
                <button type="button" class="pay-tab pay-apple" data-tab="apple">
                    <svg width="14" height="16" viewBox="0 0 170 170" fill="currentColor" style="vertical-align: -2px; margin-right: 2px;"><path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.98-5.99-9.13-10.74-19.64-14.26-31.54-3.52-11.9-5.28-23.2-5.28-33.91 0-16.14 4.16-29.41 12.49-39.81 8.32-10.4 18.59-15.69 30.82-15.86 4.35 0 9.27 1.15 14.76 3.44 5.49 2.29 9.07 3.47 10.74 3.55 1.45 0 5.26-1.25 11.45-3.77 6.18-2.52 11.45-3.68 15.79-3.48 13.9.77 24.96 5.86 33.18 15.28-12.21 7.39-18.17 17.58-17.88 30.56.32 10.15 4.27 18.61 11.86 25.39 7.58 6.78 16.54 10.66 26.88 11.64-2.28 7.07-5.18 14.28-8.72 21.65zm-33.11-105.81c0-7.85 2.8-15.22 8.39-22.11 5.59-6.89 12.49-11.13 20.7-12.73.43 2.18.64 4.25.64 6.2 0 7.85-2.95 15.39-8.86 22.62-5.91 7.23-12.83 11.38-20.75 12.46-.12-1.89-.12-3.89-.12-6.44z"/></svg><span>Pay</span>
                </button>
                <button type="button" class="pay-tab pay-crypto" data-tab="crypto">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 3px;"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M8 10h8M8 14h8"/></svg>
                    <span>USDT</span>
                </button>
            </div>

            <div class="checkout-panel" id="payPanelCard">
                <div class="checkout-form">
                    <div class="form-group">
                        <label>Card Number</label>
                        <div class="input-icon-wrap">
                            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                            <input type="text" id="payCardNum" placeholder="4242 4242 4242 4242" maxlength="19">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Expiry Date</label>
                            <div class="input-icon-wrap">
                                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                <input type="text" id="payExpiry" placeholder="MM/YY" maxlength="5">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>CVC</label>
                            <div class="input-icon-wrap">
                                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                <input type="text" id="payCvc" placeholder="123" maxlength="3">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Cardholder Name</label>
                        <input type="text" id="payName" placeholder="Enter name on card">
                    </div>
                    <button type="button" class="btn-pay" id="checkoutPayBtn">Pay <span class="checkout-total-val">0₸</span></button>
                </div>
            </div>

            <div class="checkout-panel" id="payPanelApple" style="display: none;">
                <div class="apple-pay-preview">
                    <div class="apple-pay-row">
                        <span>Card</span>
                        <strong> Apple Card (•••• 8842)</strong>
                    </div>
                    <div class="apple-pay-row">
                        <span>Merchant</span>
                        <strong>Bakery-52 Coffee & Treats</strong>
                    </div>
                    <div class="apple-pay-row">
                        <span>Total Amount</span>
                        <strong style="font-size: 1.05rem;" class="checkout-total-val">0₸</strong>
                    </div>
                </div>
                <button type="button" class="btn-apple-pay" id="applePayTriggerBtn">
                    <svg width="20" height="22" viewBox="0 0 170 170" fill="currentColor"><path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.98-5.99-9.13-10.74-19.64-14.26-31.54-3.52-11.9-5.28-23.2-5.28-33.91 0-16.14 4.16-29.41 12.49-39.81 8.32-10.4 18.59-15.69 30.82-15.86 4.35 0 9.27 1.15 14.76 3.44 5.49 2.29 9.07 3.47 10.74 3.55 1.45 0 5.26-1.25 11.45-3.77 6.18-2.52 11.45-3.68 15.79-3.48 13.9.77 24.96 5.86 33.18 15.28-12.21 7.39-18.17 17.58-17.88 30.56.32 10.15 4.27 18.61 11.86 25.39 7.58 6.78 16.54 10.66 26.88 11.64-2.28 7.07-5.18 14.28-8.72 21.65zm-33.11-105.81c0-7.85 2.8-15.22 8.39-22.11 5.59-6.89 12.49-11.13 20.7-12.73.43 2.18.64 4.25.64 6.2 0 7.85-2.95 15.39-8.86 22.62-5.91 7.23-12.83 11.38-20.75 12.46-.12-1.89-.12-3.89-.12-6.44z"/></svg>
                    <span>Pay</span>
                </button>
            </div>

            <div class="checkout-panel" id="payPanelCrypto" style="display: none;">
                <div class="crypto-preview">
                    <div class="crypto-amount-badge">
                        <span style="font-size: 0.85rem; color: var(--color-text-light);">To Pay:</span>
                        <div>
                            <strong id="cryptoUsdtAmount">0.00 USDT</strong>
                            <span id="cryptoKztSub" style="font-size: 0.82rem; color: var(--color-text-light); margin-left: 4px;">(0₸)</span>
                        </div>
                    </div>
                    <div class="crypto-rate-tag">
                        <span class="dot"></span>
                        <span>Live Rate: 1 USDT ≈ <strong id="cryptoUsdtRate">495.00</strong> ₸</span>
                    </div>
                    <div style="font-size: 0.8rem; font-weight: 600; margin-top: 4px;">USDT Deposit Address (TRC-20):</div>
                    <div class="crypto-address-wrap">
                        <input type="text" class="crypto-address-input" id="cryptoAddressInput" value="TPyE8j7wK3gUq7dM9Z2xNb4K8L9mZ9L4X" readonly>
                        <button type="button" class="btn-copy-address" id="cryptoCopyBtn">Copy</button>
                    </div>
                </div>
                <button type="button" class="btn-pay" id="cryptoPayBtn" style="background: #009393; color: #fff;">
                    Pay with USDT
                </button>
            </div>

            <p class="secure-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Payments are secure and encrypted
            </p>

            <div id="checkoutSuccess" style="display: none; text-align: center; padding: 1.5rem 0.5rem;">
                <div style="width: 52px; height: 52px; border-radius: 50%; background: #e8f5e9; color: #2e7d32; display: inline-flex; align-items: center; justify-content: center; font-size: 26px; font-weight: bold; margin-bottom: 0.75rem;">✓</div>
                <h4 style="margin: 0 0 0.4rem 0;">Payment Successful!</h4>
                <p style="margin: 0 0 0.4rem 0; font-size: 0.9rem; color: var(--color-text-light);">
                    Order <strong id="successOrderId" style="color: var(--color-text);">#BK-1000</strong> confirmed.
                </p>
                <p id="successPaymentMethod" style="font-size: 0.82rem; color: var(--color-text-light); margin: 0 0 1rem 0;"></p>
                <button type="button" class="btn-pay" id="checkoutDoneBtn">Done</button>
            </div>
        </dialog>
    `).appendTo("body");

    const openCart = () => {
        saveAndRender();
        const dialogEl = $dialog[0];
        if (!dialogEl) return;
        if (typeof dialogEl.showModal === "function") {
            if (!dialogEl.open) dialogEl.showModal();
        } else {
            $dialog.attr("open", true).show();
        }
    };

    const closeCart = () => {
        const dialogEl = $dialog[0];
        if (!dialogEl) return;
        if (typeof dialogEl.close === "function" && dialogEl.open) {
            dialogEl.close();
        } else {
            $dialog.removeAttr("open").hide();
        }
    };

    const openCheckout = () => {
        closeCart();
        $("#checkoutSuccess").hide();
        $(".pay-tab").removeClass("active").filter("[data-tab='card']").addClass("active");
        $(".checkout-panel").hide();
        $("#payPanelCard").show();
        $(".pay-methods").show();
        fetchUsdtRate();
        updateCryptoAmount();
        const el = $checkout[0];
        if (!el) return;
        if (typeof el.showModal === "function") {
            if (!el.open) el.showModal();
        } else {
            $checkout.attr("open", true).show();
        }
    };

    const closeCheckout = () => {
        const el = $checkout[0];
        if (!el) return;
        if (typeof el.close === "function" && el.open) {
            el.close();
        } else {
            $checkout.removeAttr("open").hide();
        }
    };

    const bumpCart = () => {
        $cartBtn.addClass("cart-bump");
        setTimeout(() => $cartBtn.removeClass("cart-bump"), 300);
    };

    const saveAndRender = () => {
        try {
            localStorage.setItem("bakeryCart", JSON.stringify(cart));
        } catch (e) {}

        let totalQty = 0;
        let totalSum = 0;
        const $list  = $("#cartList").empty();

        $.each(cart, function (name, item) {
            if (!item || item.qty <= 0) return;
            totalQty += item.qty;
            const lineTotal = (item.price || 0) * item.qty;
            totalSum += lineTotal;

            const $li = $("<li>").addClass("cart-item").attr("data-name", name).append(
                $("<div class='cart-item_top'>").append(
                    $("<span class='cart-item_name'>").text(name),
                    $("<button type='button' class='cart-btn-del' aria-label='Remove'>✕</button>")
                ),
                $("<div class='cart-item_bottom'>").append(
                    $("<div class='cart-item_qty'>").append(
                        $("<button type='button' class='cart-btn-qty cart-dec' aria-label='Decrease'>−</button>"),
                        $("<input type='number' class='cart-item_qty-input' min='1' max='100' aria-label='Quantity'>").val(item.qty),
                        $("<button type='button' class='cart-btn-qty cart-inc' aria-label='Increase'>+</button>")
                    ),
                    $("<span class='cart-item_price'>").text(`${lineTotal.toLocaleString("ru-RU")}₸`)
                )
            );
            $list.append($li);
        });

        $cartCount.text(totalQty);
        $(".cart-head-count").text(totalQty);
        $("#cartTotal").text(totalSum.toLocaleString("ru-RU"));
        $(".checkout-total-val").text(totalSum.toLocaleString("ru-RU") + "₸");
        updateCryptoAmount(totalSum);
        $("#cartEmptyMsg").toggle(totalQty === 0);
        $(".cart-total-bar").toggle(totalQty > 0);
        $(".cart-dialog_footer").toggle(totalQty > 0);

        $(".card-grid .product-card").each(function () {
            const $card     = $(this);
            const name      = $card.find("h3").text().trim();
            const qty       = (cart[name] && cart[name].qty) ? cart[name].qty : 0;
            const $addBtn   = $card.find(".add-to-cart-btn");
            const $controls = $card.find(".card-qty-controls");

            if (qty > 0) {
                $addBtn.hide();
                $controls.show().css("display", "inline-flex");
                $controls.find(".item-cart-qty").text(qty);
            } else {
                $controls.hide();
                $addBtn.show().css("display", "inline-block");
            }
        });
    };

    $(document).on("click", ".add-to-cart-btn", function () {
        const $card = $(this).closest(".product-card");
        const name  = $card.find("h3").text().trim();
        const price = parseInt($card.find(".card_price").text().replace(/\D/g, ""), 10) || 0;

        if (!cart[name]) {
            cart[name] = { price: price, qty: 0 };
        }
        cart[name].qty += 1;
        saveAndRender();
        bumpCart();
    });

    $(document).on("click", ".card-qty-inc", function () {
        const $card = $(this).closest(".product-card");
        const name  = $card.find("h3").text().trim();
        const price = parseInt($card.find(".card_price").text().replace(/\D/g, ""), 10) || 0;

        if (!cart[name]) {
            cart[name] = { price: price, qty: 0 };
        }
        cart[name].qty += 1;
        saveAndRender();
        bumpCart();
    });

    $(document).on("click", ".card-qty-dec", function () {
        const $card = $(this).closest(".product-card");
        const name  = $card.find("h3").text().trim();

        if (cart[name]) {
            cart[name].qty -= 1;
            if (cart[name].qty <= 0) {
                delete cart[name];
            }
            saveAndRender();
            bumpCart();
        }
    });

    $cartBtn.on("click", function () {
        if ($dialog[0] && $dialog[0].open) closeCart();
        else openCart();
    });

    $(document).on("click", "#cartCloseBtn", closeCart);

    $dialog.on("click", function (e) {
        if (e.target === this) closeCart();
    });

    $("#cartClearBtn").on("click", function () {
        cart = {};
        saveAndRender();
    });

    $dialog.on("click", ".cart-inc", function () {
        const name = $(this).closest("li").attr("data-name");
        if (cart[name]) {
            cart[name].qty += 1;
            saveAndRender();
            bumpCart();
        }
    });

    $dialog.on("click", ".cart-dec", function () {
        const name = $(this).closest("li").attr("data-name");
        if (cart[name]) {
            cart[name].qty -= 1;
            if (cart[name].qty <= 0) delete cart[name];
            saveAndRender();
            bumpCart();
        }
    });

    $dialog.on("click", ".cart-btn-del, .cart-del", function () {
        const name = $(this).closest("li").attr("data-name");
        delete cart[name];
        saveAndRender();
        bumpCart();
    });

    $dialog.on("change", ".cart-item_qty-input", function () {
        const name = $(this).closest("li").attr("data-name");
        let val = parseInt($(this).val(), 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 100) val = 100;
        $(this).val(val);
        if (cart[name]) {
            cart[name].qty = val;
            saveAndRender();
            bumpCart();
        }
    });

    $dialog.on("keydown", ".cart-item_qty-input", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            $(this).trigger("change").blur();
        }
    });

    $(document).on("click", "#cartCheckoutBtn", openCheckout);
    $(document).on("click", "#checkoutCloseBtn, #checkoutDoneBtn", closeCheckout);

    $checkout.on("click", function (e) {
        if (e.target === this) closeCheckout();
    });

    $checkout.on("click", ".pay-tab", function () {
        const tab = $(this).data("tab");
        $(".pay-tab").removeClass("active");
        $(this).addClass("active");

        $(".checkout-panel").hide();
        if (tab === "card") {
            $("#payPanelCard").show();
        } else if (tab === "apple") {
            $("#payPanelApple").show();
        } else if (tab === "crypto") {
            $("#payPanelCrypto").show();
            fetchUsdtRate();
        }
    });

    $checkout.on("input", "#payCardNum", function () {
        let val = this.value.replace(/\D/g, "").slice(0, 16);
        this.value = val.replace(/(.{4})/g, "$1 ").trim();
    });

    $checkout.on("input", "#payExpiry", function () {
        let val = this.value.replace(/\D/g, "").slice(0, 4);
        if (val.length >= 3) {
            this.value = val.slice(0, 2) + "/" + val.slice(2);
        } else {
            this.value = val;
        }
    });

    $checkout.on("input", "#payCvc", function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 3);
    });

    $checkout.on("click", "#cryptoCopyBtn", function () {
        const addr = $("#cryptoAddressInput").val();
        const $btn = $(this);
        const setCopied = () => {
            $btn.text("Copied! ✓");
            setTimeout(() => $btn.text("Copy"), 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(addr).then(setCopied).catch(setCopied);
        } else {
            $("#cryptoAddressInput").select();
            document.execCommand("copy");
            setCopied();
        }
    });

    const processPayment = (methodName, extraData = {}) => {
        let totalSum = 0;
        $.each(cart, function (_, item) {
            if (item && item.qty > 0) totalSum += (item.price || 0) * item.qty;
        });
        if (totalSum <= 0) return Promise.resolve();

        const orderPayload = Object.assign({
            total: totalSum,
            method: methodName,
            items: cart
        }, extraData);

        const handleSuccess = (orderId) => {
            $("#successOrderId").text("#" + orderId);
            $("#successPaymentMethod").text("Paid with: " + methodName);
            $(".pay-methods, .checkout-panel").hide();
            $("#checkoutSuccess").fadeIn(200);
            cart = {};
            saveAndRender();
        };

        const apiUrl = (window.location.protocol.startsWith("http") && window.location.port === "3000")
            ? "/api/checkout"
            : "http://localhost:3000/api/checkout";

        return fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload)
        })
        .then(res => {
            return res.json().then(data => {
                if (!res.ok || !data.success) {
                    throw new Error((data && data.error) ? data.error : "Payment failed");
                }
                return data;
            });
        })
        .then(data => {
            handleSuccess(data.orderId || ("BK-" + Math.floor(1000 + Math.random() * 9000)));
        })
        .catch(err => {
            alert(err.message || "Payment service unavailable. Please check that server is running.");
        });
    };

    $(document).on("click", "#checkoutPayBtn", function () {
        const $payBtn = $(this);
        $payBtn.prop("disabled", true).text("Processing payment...");
        processPayment("Bank Card", {
            cardHolder: $("#payName").val().trim() || "Customer",
            cardLast4: ($("#payCardNum").val().replace(/\D/g, "") || "4242").slice(-4)
        }).finally(() => {
            let totalSum = 0;
            $.each(cart, function (_, item) {
                if (item && item.qty > 0) totalSum += (item.price || 0) * item.qty;
            });
            $payBtn.prop("disabled", false).html(`Pay <span class="checkout-total-val">${totalSum.toLocaleString("ru-RU")}₸</span>`);
        });
    });

    const showApplePaySheet = (totalSum, onConfirmed, onCancel) => {
        const $sheet = $(`
            <div class="apple-sheet-overlay" id="appleSheetOverlay">
                <div class="apple-sheet-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                        <span style="font-weight: 700; font-size: 1.15rem; display: flex; align-items: center; gap: 4px;">
                            <svg width="18" height="20" viewBox="0 0 170 170" fill="currentColor"><path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.98-5.99-9.13-10.74-19.64-14.26-31.54-3.52-11.9-5.28-23.2-5.28-33.91 0-16.14 4.16-29.41 12.49-39.81 8.32-10.4 18.59-15.69 30.82-15.86 4.35 0 9.27 1.15 14.76 3.44 5.49 2.29 9.07 3.47 10.74 3.55 1.45 0 5.26-1.25 11.45-3.77 6.18-2.52 11.45-3.68 15.79-3.48 13.9.77 24.96 5.86 33.18 15.28-12.21 7.39-18.17 17.58-17.88 30.56.32 10.15 4.27 18.61 11.86 25.39 7.58 6.78 16.54 10.66 26.88 11.64-2.28 7.07-5.18 14.28-8.72 21.65zm-33.11-105.81c0-7.85 2.8-15.22 8.39-22.11 5.59-6.89 12.49-11.13 20.7-12.73.43 2.18.64 4.25.64 6.2 0 7.85-2.95 15.39-8.86 22.62-5.91 7.23-12.83 11.38-20.75 12.46-.12-1.89-.12-3.89-.12-6.44z"/></svg> Pay
                        </span>
                        <button type="button" class="cart-dialog_close" id="appleSheetCancel" style="font-size: 1.2rem; cursor: pointer;">&times;</button>
                    </div>
                    <div style="border-top: 1px solid #e5e5ea; border-bottom: 1px solid #e5e5ea; padding: 12px 0; margin-bottom: 16px; font-size: 0.88rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
                            <span style="color:#8e8e93;">CARD</span>
                            <strong> Card (•••• 8842)</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
                            <span style="color:#8e8e93;">STORE</span>
                            <strong>Bakery-52</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; font-size: 1.05rem; margin-top: 8px;">
                            <span style="color:#8e8e93;">PAY</span>
                            <strong style="color: #000;">${totalSum.toLocaleString("ru-RU")}₸</strong>
                        </div>
                    </div>
                    <div id="appleSheetStatus" style="text-align: center; padding: 6px 0;">
                        <div style="margin: 0 auto 10px; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #000; border-top-color: transparent; animation: spin 0.8s linear infinite;"></div>
                        <div style="font-size: 0.88rem; font-weight: 500; color: #1d1d1f;">Double Click Side Button or Confirm with Touch ID</div>
                    </div>
                </div>
            </div>
        `).appendTo("body");

        let timer1 = null;
        let timer2 = null;

        const cancelSheet = () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            $sheet.remove();
            if (typeof onCancel === "function") onCancel();
        };

        $sheet.find("#appleSheetCancel").on("click", cancelSheet);
        $sheet.on("click", function(e) { if (e.target === this) cancelSheet(); });

        timer1 = setTimeout(() => {
            $sheet.find("#appleSheetStatus").html(`
                <div style="width: 38px; height: 38px; border-radius: 50%; background: #34c759; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 6px;">✓</div>
                <div style="font-size: 0.95rem; font-weight: 600; color: #34c759;">Done</div>
            `);
            timer2 = setTimeout(() => {
                $sheet.fadeOut(200, function() {
                    $(this).remove();
                    if (typeof onConfirmed === "function") onConfirmed();
                });
            }, 600);
        }, 1200);
    };

    let isApplePayActive = false;
    $(document).on("click", "#applePayTriggerBtn", function () {
        if (isApplePayActive) return;
        let totalSum = 0;
        $.each(cart, function (_, item) {
            if (item && item.qty > 0) totalSum += (item.price || 0) * item.qty;
        });
        if (totalSum <= 0) return;

        isApplePayActive = true;
        showApplePaySheet(totalSum, function () {
            processPayment("Apple Pay").finally(() => {
                isApplePayActive = false;
            });
        }, function () {
            isApplePayActive = false;
        });
    });

    $(document).on("click", "#cryptoPayBtn", function () {
        const $btn = $(this);
        $btn.prop("disabled", true).text("Verifying on-chain transaction...");
        let totalSum = 0;
        $.each(cart, function (_, item) {
            if (item && item.qty > 0) totalSum += (item.price || 0) * item.qty;
        });
        const usdt = (totalSum / usdtRate).toFixed(2);
        processPayment("Cryptocurrency (USDT TRC-20)", {
            cardHolder: "USDT Wallet",
            usdtAmount: usdt,
            usdtRate: usdtRate
        }).finally(() => {
            $btn.prop("disabled", false).text("Pay " + usdt + " USDT");
        });
    });

    window.addEventListener("storage", function (e) {
        if (e.key === "bakeryCart") {
            try {
                const updated = JSON.parse(e.newValue || "{}");
                cart = (updated && typeof updated === "object") ? updated : {};
            } catch (err) {
                cart = {};
            }
            saveAndRender();
        }
    });

    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) {
            try {
                const stored = JSON.parse(localStorage.getItem("bakeryCart") || "{}");
                if (stored && typeof stored === "object") {
                    cart = stored;
                    saveAndRender();
                }
            } catch (err) {}
        }
    });

    saveAndRender();
}

/* ============================================================================================================ */
function initCustomCakeForm() {
    const $form = $("#customCakeForm");
    if (!$form.length) return;
    const $name = $("#feedbackName");
    const $phone = $("#feedbackPhone");
    const $btn = $("#feedbackSubmitBtn");
    const $success = $("#feedbackSuccess");

    $phone.on("focus", function () {
        if (!this.value.trim()) {
            this.value = "+7 (";
        }
    });

    $phone.on("blur", function () {
        const v = this.value.trim();
        if (v === "+7 (" || v === "+7" || v === "+") {
            this.value = "";
        }
    });

    $phone.on("input", function () {
        const val = this.value;
        if (!val) return;

        const hasPlus = val.startsWith("+");
        const digits = val.replace(/\D/g, "");

        if (!digits.length) {
            this.value = hasPlus ? "+" : "";
            return;
        }

        if (val.startsWith("+7") || (!hasPlus && (digits.startsWith("7") || digits.startsWith("8")))) {
            let d = digits;
            if (d.startsWith("7") || d.startsWith("8")) {
                d = d.slice(1);
            }
            d = d.slice(0, 10);
            let res = "+7";
            if (d.length > 0) res += " (" + d.slice(0, 3);
            if (d.length >= 3) res += ") " + d.slice(3, 6);
            if (d.length >= 6) res += "-" + d.slice(6, 8);
            if (d.length >= 8) res += "-" + d.slice(8, 10);
            this.value = res;
            return;
        }

        this.value = "+" + digits.slice(0, 15);
    });

    $form.on("submit", function (e) {
        e.preventDefault();
        const name = $name.val().trim();
        const phone = $phone.val().trim();
        const phoneDigits = phone.replace(/\D/g, "");

        if (!name) {
            $name.trigger("focus");
            return;
        }
        if (!phone || phoneDigits.length < 5) {
            $phone.trigger("focus");
            return;
        }

        $btn.prop("disabled", true).find("span").text("Sending...");
        setTimeout(() => {
            $btn.prop("disabled", false).find("span").text("Send Request");
            $form[0].reset();
            $success.addClass("visible");
            setTimeout(() => {
                $success.removeClass("visible");
            }, 5000);
        }, 400);
    });
}
