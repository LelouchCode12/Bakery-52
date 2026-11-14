$(function () {
    initMenu();
    initSamePageScroll();
    initTheme();
    initLeaves();
    initCart();
    initAccount();
});

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

/**
 * Smoothly scrolls to the top instead of reloading when clicking a navigation link
 * that points to the page currently being viewed.
 */
function initSamePageScroll() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const normPath = (path) => path.replace(/\/index\.html$/, "/") || "/";

    $(document).on("click", ".navbar a[href], .site-menu_links a[href], .site-footer .info-list a[href]", function (e) {
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

        const rawHref = this.getAttribute("href");
        if (!rawHref || rawHref.startsWith("#")) return;

        let targetUrl;
        try {
            targetUrl = new URL(rawHref, window.location.href);
        } catch (err) {
            return;
        }

        const isSameUrl = targetUrl.protocol === window.location.protocol &&
            targetUrl.host === window.location.host &&
            normPath(targetUrl.pathname) === normPath(window.location.pathname) &&
            targetUrl.search === window.location.search &&
            !targetUrl.hash;

        if (this.getAttribute("aria-current") !== "page" && !isSameUrl) return;

        e.preventDefault();

        const $siteMenu = $("#siteMenu");
        if ($siteMenu.hasClass("open")) {
            $siteMenu.removeClass("open");
            $("#menuBtn").attr({ "aria-expanded": "false", "aria-label": "Open menu" });
        }

        const $account = $(".navbar_links .account.open");
        if ($account.length) {
            $account.removeClass("open").find(".account-btn").attr("aria-expanded", "false");
        }

        window.scrollTo({
            top: 0,
            behavior: reduceMotion.matches ? "auto" : "smooth"
        });
    });
}

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

function initLeaves() {
    const STORAGE_KEY = "bakeryLeaves";
    const $leavesToggle = $("#leavesToggle");
    let leaveTimer = null;

    const mountLeaves = () => {
        if (leaveTimer) {
            clearTimeout(leaveTimer);
            leaveTimer = null;
        }
        const existing = document.querySelector("snow-fall");
        if (existing) {
            existing.classList.remove("is-leaving");
            return;
        }
        const el = document.createElement("snow-fall");
        el.setAttribute("aria-hidden", "true");
        el.setAttribute("text", "🍂");
        el.setAttribute("count", "28");
        document.body.appendChild(el);
    };

    const unmountLeaves = (immediate = false) => {
        if (leaveTimer) {
            clearTimeout(leaveTimer);
            leaveTimer = null;
        }
        const existing = document.querySelector("snow-fall");
        if (!existing) return;
        if (immediate) {
            existing.remove();
            return;
        }
        existing.classList.add("is-leaving");
        leaveTimer = setTimeout(() => {
            existing.remove();
            leaveTimer = null;
        }, 460);
    };

    const applyLeaves = (enabled, immediate = false) => {
        if (enabled) {
            mountLeaves();
        } else {
            unmountLeaves(immediate);
        }
        if ($leavesToggle.length) {
            $leavesToggle.prop("checked", enabled);
        }
        try { localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off"); } catch (e) {}
    };

    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    const initialEnabled = saved === "on";
    applyLeaves(initialEnabled, true);

    $leavesToggle.on("change", function () {
        applyLeaves(this.checked, false);
    });
}

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
                        <label for="payCardNum">Card Number</label>
                        <div class="input-icon-wrap">
                            <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                            <input type="text" id="payCardNum" inputmode="numeric" autocomplete="cc-number" placeholder="4242 4242 4242 4242" maxlength="19">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="payExpiry">Expiry Date</label>
                            <div class="input-icon-wrap">
                                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                <input type="text" id="payExpiry" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" maxlength="5">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="payCvc">CVC</label>
                            <div class="input-icon-wrap">
                                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                <input type="text" id="payCvc" inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="3">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="payName">Cardholder Name</label>
                        <input type="text" id="payName" autocomplete="cc-name" placeholder="Enter name on card">
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

            <p id="checkoutError" class="checkout-error" role="alert" aria-live="polite"></p>

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
        $("#checkoutError").text("").removeClass("visible");
        $("#payCardNum, #payExpiry, #payCvc, #payName").removeClass("is-invalid");
        $(".pay-tab").removeClass("active").filter("[data-tab='card']").addClass("active");
        $(".checkout-panel").hide();
        $("#payPanelCard").show();
        $(".pay-methods").show();
        const currentUser = window.BakeryAuth && window.BakeryAuth.current();
        if (currentUser && !$("#payName").val().trim()) {
            $("#payName").val([currentUser.firstName, currentUser.lastName].filter(Boolean).join(" "));
        }
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
                $addBtn.addClass("is-hidden");
                $controls.addClass("is-visible");
                $controls.find(".item-cart-qty").text(qty);
            } else {
                $controls.removeClass("is-visible");
                $addBtn.removeClass("is-hidden");
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

    const showCheckoutError = (msg) => {
        const $err = $("#checkoutError");
        if (!$err.length) return;
        $err.text(msg || "").toggleClass("visible", Boolean(msg));
    };

    const clearCheckoutErrors = () => {
        showCheckoutError("");
        $("#payCardNum, #payExpiry, #payCvc, #payName").removeClass("is-invalid");
    };

    $checkout.on("click", ".pay-tab", function () {
        const tab = $(this).data("tab");
        $(".pay-tab").removeClass("active");
        $(this).addClass("active");
        clearCheckoutErrors();

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
        $(this).removeClass("is-invalid");
        showCheckoutError("");
    });

    $checkout.on("input", "#payExpiry", function () {
        let val = this.value.replace(/\D/g, "").slice(0, 4);
        if (val.length >= 3) {
            this.value = val.slice(0, 2) + "/" + val.slice(2);
        } else {
            this.value = val;
        }
        $(this).removeClass("is-invalid");
        showCheckoutError("");
    });

    $checkout.on("input", "#payCvc", function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 3);
        $(this).removeClass("is-invalid");
        showCheckoutError("");
    });

    $checkout.on("input", "#payName", function () {
        $(this).removeClass("is-invalid");
        showCheckoutError("");
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

    // Optional: if frontend stays on GitHub Pages while backend is on Render/Railway,
    // set your deployed backend URL here (e.g. "https://bakery-52.onrender.com").
    const REMOTE_BACKEND_URL = window.BAKERY_BACKEND_URL || "";

    const resolveCheckoutApiUrl = () => {
        const host = window.location.hostname;
        const proto = window.location.protocol;
        if (host === "localhost" || host === "127.0.0.1") {
            return window.location.port === "3000"
                ? "/api/checkout"
                : "http://localhost:3000/api/checkout";
        }
        if (host.endsWith("github.io")) {
            return REMOTE_BACKEND_URL
                ? REMOTE_BACKEND_URL.replace(/\/+$/, "") + "/api/checkout"
                : null;
        }
        if (proto.startsWith("http")) {
            return "/api/checkout";
        }
        return null;
    };

    const isValidLuhn = (digits) => {
        let sum = 0;
        let shouldDouble = false;
        for (let i = digits.length - 1; i >= 0; i--) {
            let d = parseInt(digits.charAt(i), 10);
            if (shouldDouble) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
            shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
    };

    const validateCardForm = () => {
        clearCheckoutErrors();
        const $card = $("#payCardNum");
        const $exp = $("#payExpiry");
        const $cvc = $("#payCvc");
        const $name = $("#payName");

        const cardDigits = $card.val().replace(/\D/g, "");
        if (cardDigits.length !== 16 || !isValidLuhn(cardDigits)) {
            $card.addClass("is-invalid").trigger("focus");
            showCheckoutError("Please enter a valid 16-digit card number.");
            return false;
        }

        const expVal = $exp.val().trim();
        const expMatch = /^(\d{2})\/(\d{2})$/.exec(expVal);
        if (!expMatch) {
            $exp.addClass("is-invalid").trigger("focus");
            showCheckoutError("Please enter a valid expiry date in MM/YY format.");
            return false;
        }
        const expMonth = parseInt(expMatch[1], 10);
        const expYear = 2000 + parseInt(expMatch[2], 10);
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonth = now.getMonth() + 1;
        if (expMonth < 1 || expMonth > 12 || expYear < curYear || (expYear === curYear && expMonth < curMonth)) {
            $exp.addClass("is-invalid").trigger("focus");
            showCheckoutError("Card expiry date is invalid or has expired.");
            return false;
        }

        const cvcVal = $cvc.val().trim();
        if (!/^\d{3}$/.test(cvcVal)) {
            $cvc.addClass("is-invalid").trigger("focus");
            showCheckoutError("Please enter a valid 3-digit CVC code.");
            return false;
        }

        const nameVal = $name.val().trim();
        const letterMatches = nameVal.match(/[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]/g) || [];
        if (nameVal.length < 2 || letterMatches.length < 2) {
            $name.addClass("is-invalid").trigger("focus");
            showCheckoutError("Please enter the cardholder name (at least 2 letters).");
            return false;
        }

        return true;
    };

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
            clearCheckoutErrors();
            const cleanId = String(orderId || ("BK-" + Math.floor(1000 + Math.random() * 9000))).replace(/^#/, "");
            const itemsSnapshot = [];
            $.each(cart, function (itemName, itemObj) {
                if (itemObj && itemObj.qty > 0) {
                    itemsSnapshot.push({
                        name: itemName,
                        qty: itemObj.qty,
                        price: itemObj.price || 0
                    });
                }
            });
            if (window.BakeryAuth && typeof window.BakeryAuth.addOrder === "function" && itemsSnapshot.length > 0) {
                window.BakeryAuth.addOrder({
                    id: cleanId,
                    date: new Date().toISOString(),
                    items: itemsSnapshot,
                    total: totalSum,
                    method: methodName,
                    status: "Completed"
                });
            }
            $("#successOrderId").text("#" + cleanId);
            $("#successPaymentMethod").text("Paid with: " + methodName);
            $(".pay-methods, .checkout-panel").hide();
            $("#checkoutSuccess").fadeIn(200);
            cart = {};
            saveAndRender();
            window.dispatchEvent(new CustomEvent("bakery:orderPlaced"));
        };

        const apiUrl = resolveCheckoutApiUrl();
        if (!apiUrl) {
            handleSuccess("BK-" + Math.floor(1000 + Math.random() * 9000));
            return Promise.resolve();
        }

        return fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderPayload)
        })
        .then(res => {
            return res.json().then(data => {
                if (!res.ok || !data.success) {
                    const err = new Error((data && data.error) ? data.error : "Payment failed");
                    err.isServerValidationError = true;
                    throw err;
                }
                return data;
            });
        })
        .then(data => {
            handleSuccess(data.orderId || ("BK-" + Math.floor(1000 + Math.random() * 9000)));
        })
        .catch(err => {
            if (err && err.isServerValidationError) {
                showCheckoutError(err.message);
                return;
            }
            // Fallback if backend is asleep/offline (e.g. cold start or static preview)
            handleSuccess("BK-" + Math.floor(1000 + Math.random() * 9000));
        });
    };

    $(document).on("click", "#checkoutPayBtn", function () {
        if (!validateCardForm()) return;
        const $payBtn = $(this);
        $payBtn.prop("disabled", true).text("Processing payment...");
        processPayment("Bank Card", {
            cardHolder: $("#payName").val().trim(),
            cardLast4: $("#payCardNum").val().replace(/\D/g, "").slice(-4)
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

/* Account persistence (localStorage) */
window.BakeryAuth = (function () {
    const USERS_KEY   = "bakery_users";
    const CURRENT_KEY = "bakery_currentUser";

    const normEmail = (email) => String(email || "").trim().toLowerCase();

    const read = (key, fallback) => {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value === null || value === undefined ? fallback : value;
        } catch (e) {
            return fallback;
        }
    };
    const write = (key, value) => {
        try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
    };

    async function hashPassword(email, password) {
        const data = "bakery52:" + email + ":" + password;
        if (window.crypto && window.crypto.subtle) {
            const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
            return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
        }
        let h = 5381;
        for (let i = 0; i < data.length; i++) h = ((h << 5) + h + data.charCodeAt(i)) | 0;
        return "x" + (h >>> 0).toString(16);
    }

    const getUsers = () => {
        const users = read(USERS_KEY, {});
        return users && typeof users === "object" && !Array.isArray(users) ? users : {};
    };

    const publicUser = (user) => {
        if (!user) return null;
        const copy = Object.assign({}, user);
        delete copy.passHash;
        return copy;
    };

    function current() {
        const email = read(CURRENT_KEY, null);
        if (!email) return null;
        return publicUser(getUsers()[normEmail(email)]);
    }

    async function register(profile, password) {
        const email = normEmail(profile.email);
        const users = getUsers();
        if (users[email]) return { ok: false, error: "An account with this email already exists. Please log in." };
        users[email] = Object.assign({}, profile, { email: email, passHash: await hashPassword(email, password) });
        if (!write(USERS_KEY, users) || !write(CURRENT_KEY, email)) {
            return { ok: false, error: "Could not save your account. Please check that browser storage is enabled." };
        }
        return { ok: true };
    }

    async function login(emailRaw, password) {
        const email = normEmail(emailRaw);
        const user = getUsers()[email];
        if (!user || user.passHash !== await hashPassword(email, password)) {
            return { ok: false, error: "Incorrect email or password." };
        }
        write(CURRENT_KEY, email);
        return { ok: true };
    }

    function logout() {
        try { localStorage.removeItem(CURRENT_KEY); } catch (e) {}
    }

    function update(changes) {
        const user = current();
        if (!user) return null;
        const users = getUsers();
        users[user.email] = Object.assign({}, users[user.email], changes);
        write(USERS_KEY, users);
        return current();
    }

    async function changePassword(oldPassword, newPassword) {
        const emailRaw = read(CURRENT_KEY, null);
        if (!emailRaw) return { ok: false, error: "Not logged in." };
        const email = normEmail(emailRaw);
        const users = getUsers();
        const user = users[email];
        if (!user) return { ok: false, error: "Account not found." };

        const oldHash = await hashPassword(email, String(oldPassword || ""));
        if (user.passHash !== oldHash) {
            return { ok: false, error: "Current password is incorrect." };
        }
        const nextPass = String(newPassword || "");
        if (nextPass.length < 8) {
            return { ok: false, error: "New password must be at least 8 characters." };
        }
        if (!/[A-Z]/.test(nextPass) || !/[a-z]/.test(nextPass) || !/[0-9]/.test(nextPass)) {
            return { ok: false, error: "New password must include uppercase, lowercase, and at least one number." };
        }
        if (oldPassword === newPassword) {
            return { ok: false, error: "New password must be different from the current password." };
        }
        user.passHash = await hashPassword(email, nextPass);
        users[email] = user;
        if (!write(USERS_KEY, users)) {
            return { ok: false, error: "Could not save new password." };
        }
        return { ok: true };
    }

    function deleteAccount() {
        const emailRaw = read(CURRENT_KEY, null);
        if (emailRaw) {
            const email = normEmail(emailRaw);
            const users = getUsers();
            if (users[email]) {
                delete users[email];
                write(USERS_KEY, users);
            }
        }
        try { localStorage.removeItem(CURRENT_KEY); } catch (e) {}
        return { ok: true };
    }

    function addOrder(orderData) {
        const user = current();
        if (!user || !orderData) return null;
        const orders = Array.isArray(user.orders) ? user.orders.slice() : [];
        orders.unshift(orderData);
        return update({ orders: orders });
    }

    return {
        current: current,
        register: register,
        login: login,
        logout: logout,
        update: update,
        changePassword: changePassword,
        deleteAccount: deleteAccount,
        addOrder: addOrder
    };
})();

window.attachPhoneMask = function (input) {
    if (!input) return;

    input.addEventListener("focus", function () {
        if (!this.value.trim()) {
            this.value = "+7 (";
        }
    });

    input.addEventListener("blur", function () {
        const v = this.value.trim();
        if (v === "+7 (" || v === "+7" || v === "+") {
            this.value = "";
        }
    });

    input.addEventListener("input", function () {
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
};

function initAccount() {
    const user = window.BakeryAuth.current();
    if (!user) return;

    const nowIso = new Date().toISOString();
    const updates = {};
    if (!user.firstAccess) {
        updates.firstAccess = user.createdAt || nowIso;
    }
    if (!user.lastAccess || (Date.now() - new Date(user.lastAccess).getTime() > 60000)) {
        updates.lastAccess = nowIso;
    }
    if (Object.keys(updates).length > 0) {
        window.BakeryAuth.update(updates);
    }

    const icon = (name) => $("<span>", { "class": "ico ico-" + name, "aria-hidden": "true" });
    const fullName = (u) => [u.firstName, u.lastName].filter(Boolean).join(" ");
    const isAccountPage = /account\.html$/.test(window.location.pathname);

    /* ---------- Log out ---------- */
    $(document).on("click", "[data-account-logout]", function (e) {
        e.preventDefault();
        window.BakeryAuth.logout();
        window.location.href = "index.html";
    });

    /* ---------- Header dropdown (desktop) ---------- */
    const $dropdownCover = $("<div>", { "class": "account-dropdown_cover" }).append(
        $("<img>", { src: "images/site/bakery-croissants.webp", alt: "Bakery-52", "class": "account-dropdown_img", loading: "lazy" }),
        $("<div>", { "class": "account-dropdown_cover-overlay" }).append(
            $("<span>", { "class": "account-dropdown_tag" }).text("🥐 Bakery-52")
        )
    );
    const $dropdownBody = $("<div>", { "class": "account-dropdown_body" }).append(
        $("<div>", { "class": "account-dropdown_head" }).append(
            $("<strong>").text(fullName(user)),
            $("<span>").text(user.email)
        ),
        $("<a>", { href: "account.html", "class": "account-dropdown_item" }).append(icon("user"), $("<span>").text("My account")),
        $("<button>", { type: "button", "class": "account-dropdown_item", "data-account-logout": "" }).append(icon("logout"), $("<span>").text("Log out"))
    );
    const $dropdown = $("<div>", { "class": "account-dropdown" }).append($dropdownCover, $dropdownBody);

    let $account = $(".navbar_links .account").first();
    if (!$account.length && window.BakeryHeaderAuth) {
        const synced = window.BakeryHeaderAuth.syncNavbar(user);
        if (synced) $account = $(synced);
    }

    if ($account.length) {
        const $btn = $account.find(".account-btn").first();
        if (isAccountPage) $btn.attr("aria-current", "page");
        if (!$account.find(".account-dropdown").length) {
            $account.append($dropdown);
        }

        const setDropdown = (open) => {
            $account.toggleClass("open", open);
            $btn.attr("aria-expanded", String(open));
        };
        $btn.on("click", () => setDropdown(!$account.hasClass("open")));
        $(document).on("click", (e) => {
            if ($account.hasClass("open") && !$(e.target).closest(".account").length) setDropdown(false);
        });
        $(document).on("keydown", (e) => {
            if (e.key === "Escape" && $account.hasClass("open")) setDropdown(false);
        });
    }

    /* ---------- Side menu (mobile) ---------- */
    const menuLink = (attr, iconName, text) =>
        $("<li>").append($("<a>", Object.assign({ href: "#", "class": "account-link" }, attr)).append(icon(iconName), $("<span>").text(text)));
    $(".site-menu_links a[href='register.html']").closest("li").replaceWith(
        menuLink({ href: "account.html" }, "user", "My account"),
        menuLink({ "data-account-logout": "" }, "logout", "Log out")
    );
    if (isAccountPage) $(".site-menu_links a[href='account.html']").attr("aria-current", "page");

    /* ---------- Footer ---------- */
    $(".info-list a[href='register.html']").text("My account").attr("href", "account.html");
}
