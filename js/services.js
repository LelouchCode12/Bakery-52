$(function () {
    initSearch();
    initRecommendations();
    initCustomCakeForm();
    initFavorites();
});

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
        $noResultsMsg.toggleClass("is-visible", visibleCount === 0);
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
            $itemError.addClass("is-visible");
            $itemInput.addClass("input-invalid").trigger("focus");
            return;
        }

        $itemError.removeClass("is-visible");
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
            $itemError.removeClass("is-visible");
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

function initCustomCakeForm() {
    const $form = $("#customCakeForm");
    if (!$form.length) return;
    const $name = $("#feedbackName");
    const $phone = $("#feedbackPhone");
    const $nameError = $("#feedbackNameError");
    const $phoneError = $("#feedbackPhoneError");
    const $btn = $("#feedbackSubmitBtn");
    const $success = $("#feedbackSuccess");

    const setFieldError = ($input, $errorEl, msg) => {
        const hasErr = Boolean(msg);
        $input.toggleClass("is-invalid", hasErr).attr("aria-invalid", hasErr ? "true" : "false");
        $errorEl.text(msg || "").toggleClass("visible", hasErr);
        return !hasErr;
    };

    const validateName = () => {
        const name = $name.val().trim();
        if (!name) return setFieldError($name, $nameError, "Please enter your name.");
        if (name.length < 2) return setFieldError($name, $nameError, "Name must be at least 2 characters long.");
        return setFieldError($name, $nameError, "");
    };

    const validatePhone = () => {
        const phone = $phone.val().trim();
        const digits = phone.replace(/\D/g, "");
        if (!phone || phone === "+7 (" || phone === "+7" || phone === "+") {
            return setFieldError($phone, $phoneError, "Please enter your phone number.");
        }
        const isKz = phone.startsWith("+7");
        const valid = isKz ? digits.length === 11 : (digits.length >= 10 && digits.length <= 15);
        if (!valid) {
            return setFieldError($phone, $phoneError, "Please enter a full phone number (e.g. +7 (777) 123-45-67).");
        }
        return setFieldError($phone, $phoneError, "");
    };

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
        if ($phone.hasClass("is-invalid")) {
            validatePhone();
        }
    });

    $name.on("input", function () {
        if ($name.hasClass("is-invalid") || $name.val().trim().length >= 2) {
            validateName();
        }
    });

    $phone.on("input", function () {
        const val = this.value;
        if (!val) {
            if ($phone.hasClass("is-invalid")) validatePhone();
            return;
        }

        const hasPlus = val.startsWith("+");
        const digits = val.replace(/\D/g, "");

        if (!digits.length) {
            this.value = hasPlus ? "+" : "";
            if ($phone.hasClass("is-invalid")) validatePhone();
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
            if ($phone.hasClass("is-invalid")) validatePhone();
            return;
        }

        this.value = "+" + digits.slice(0, 15);
        if ($phone.hasClass("is-invalid")) validatePhone();
    });

    $form.on("submit", function (e) {
        e.preventDefault();
        $success.removeClass("visible");

        const nameOk = validateName();
        const phoneOk = validatePhone();

        if (!nameOk) {
            $name.trigger("focus");
            return;
        }
        if (!phoneOk) {
            $phone.trigger("focus");
            return;
        }

        $btn.prop("disabled", true).find("span").text("Sending...");
        setTimeout(() => {
            $btn.prop("disabled", false).find("span").text("Send Request");
            $form[0].reset();
            setFieldError($name, $nameError, "");
            setFieldError($phone, $phoneError, "");
            $success.addClass("visible");
            setTimeout(() => {
                $success.removeClass("visible");
            }, 5000);
        }, 400);
    });
}

function showPageToast(message, actionText, actionHref) {
    let $toast = $("#bakeryPageToast");
    if (!$toast.length) {
        $toast = $(`
            <div id="bakeryPageToast" class="bakery-toast" role="status" aria-live="polite">
                <span class="bakery-toast_msg"></span>
                <a class="bakery-toast_action" href="register.html"></a>
                <button type="button" class="bakery-toast_close" aria-label="Dismiss notification">&times;</button>
            </div>
        `).appendTo("body");

        $toast.on("click", ".bakery-toast_close", function () {
            $toast.removeClass("is-visible");
        });
    }

    $toast.find(".bakery-toast_msg").text(message);
    const $action = $toast.find(".bakery-toast_action");
    if (actionText && actionHref) {
        $action.text(actionText).attr("href", actionHref).show();
    } else {
        $action.hide();
    }

    $toast.addClass("is-visible");
    clearTimeout($toast.data("hideTimer"));
    const timer = setTimeout(() => {
        $toast.removeClass("is-visible");
    }, 5000);
    $toast.data("hideTimer", timer);
}

function initFavorites() {
    const $favBtns = $(".btn-fav");
    if (!$favBtns.length) return;

    const renderActiveFavorites = () => {
        const user = window.BakeryAuth && window.BakeryAuth.current();
        const favNames = new Set(
            (user && Array.isArray(user.favorites)) ? user.favorites.map(f => f.name) : []
        );
        $(".product-card").each(function () {
            const name = $(this).find("h3").text().trim();
            $(this).find(".btn-fav").toggleClass("active", favNames.has(name));
        });
    };

    renderActiveFavorites();

    $(document).on("click", ".btn-fav", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const user = window.BakeryAuth && window.BakeryAuth.current();
        if (!user) {
            showPageToast(
                "Please log in or register to save items to your favorites.",
                "Log in / Register",
                "register.html"
            );
            return;
        }

        const $card = $(this).closest(".product-card");
        const name = $card.find("h3").text().trim();
        const price = $card.find(".card_price").text().trim();
        const img = $card.find(".placeholder img").attr("src") || "";
        const category = $card.attr("data-category") || "";

        let favs = Array.isArray(user.favorites) ? user.favorites.slice() : [];
        const existingIdx = favs.findIndex(f => f.name === name);

        if (existingIdx >= 0) {
            favs.splice(existingIdx, 1);
            $(this).removeClass("active");
        } else {
            favs.push({ name, price, img, category });
            $(this).addClass("active");
        }

        window.BakeryAuth.update({ favorites: favs });
    });
}
