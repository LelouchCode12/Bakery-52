$(function () {
    initSearch();
    initQuickViewModal();
    initRecommendations();
    initCustomCakeForm();
    initFavorites();
});

function initSearch() {
    const $searchInput     = $("#searchInput");
    const $searchClearBtn  = $("#searchClearBtn");
    const $sortSelect      = $("#sortSelect");
    const $searchCount     = $("#searchCount");
    const $categoryTitle   = $("#activeCategoryTitle");
    const $noResultsMsg    = $("#noResults");
    const $cardGrid        = $("#menuCardGrid").length ? $("#menuCardGrid") : $(".card-grid").first();
    const $productCards    = $cardGrid.find(".product-card");
    const $catBtns         = $("#categoryFilters .cat-btn");
    const $resetFiltersBtn = $("#resetFiltersBtn");
    const $emptyResetBtn   = $("#emptyResetBtn");
    const $loadMoreWrap    = $("#catalogLoadMore");
    const $loadStatus      = $("#catalogLoadStatus");
    const $showMoreBtn     = $("#showMoreBtn");

    if (!$searchInput.length) return;

    const PAGE_SIZE = 24;
    let activeCategory = "all";
    let visibleLimit = PAGE_SIZE;

    const categoryCounts = { all: $productCards.length };
    $productCards.each(function (idx) {
        const $card = $(this);
        const cat = String($card.attr("data-category") || "");
        const priceVal = parseInt($card.find(".card_price").text().replace(/\D/g, ""), 10) || 0;
        const nameVal = $card.find("h3").text().trim().toLowerCase();

        $card.data("order", idx);
        $card.data("priceVal", priceVal);
        $card.data("nameVal", nameVal);

        if (cat) {
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }
    });

    $catBtns.each(function () {
        const cat = String($(this).data("category") || "");
        const $count = $(this).find(".cat-btn_count");
        if ($count.length && Object.prototype.hasOwnProperty.call(categoryCounts, cat)) {
            $count.text(categoryCounts[cat]);
        }
    });

    const sortCards = (mode) => {
        if (!$cardGrid.length) return;
        const sorted = $productCards.get().sort((a, b) => {
            const $a = $(a);
            const $b = $(b);
            if (mode === "price-asc") {
                return ($a.data("priceVal") - $b.data("priceVal")) || ($a.data("order") - $b.data("order"));
            }
            if (mode === "price-desc") {
                return ($b.data("priceVal") - $a.data("priceVal")) || ($a.data("order") - $b.data("order"));
            }
            if (mode === "name-asc") {
                return String($a.data("nameVal")).localeCompare(String($b.data("nameVal")));
            }
            return $a.data("order") - $b.data("order");
        });
        $cardGrid.append(sorted);
    };

    const syncToolbarMeta = () => {
        const rawQuery = $searchInput.val() || "";
        const sortMode = $sortSelect.length ? $sortSelect.val() : "featured";
        const hasFilters = activeCategory !== "all" || rawQuery.trim() !== "" || sortMode !== "featured";

        if ($searchClearBtn.length) {
            $searchClearBtn.prop("hidden", rawQuery.length === 0);
        }
        if ($resetFiltersBtn.length) {
            $resetFiltersBtn.prop("hidden", !hasFilters);
        }
        if ($categoryTitle.length) {
            const $activeBtn = $catBtns.filter(`[data-category="${activeCategory}"]`).first();
            const label = $activeBtn.find(".cat-btn_label").text().trim() || $activeBtn.text().trim() || "All Menu";
            $categoryTitle.text(label);
        }
    };

    const applyFilters = () => {
        const query = ($searchInput.val() || "").toLowerCase().replace(/\s+/g, " ").trim();
        let matchedCount = 0;
        let shownCount = 0;

        $cardGrid.find(".product-card").each(function () {
            const $card = $(this);
            const cardText = $card.find("h3, p").text().toLowerCase();
            const cardCategory = $card.data("category") || "";
            const matchesCategory = (activeCategory === "all") || (cardCategory === activeCategory);
            const matchesQuery = (query === "") || cardText.includes(query);

            let isVisible = false;
            if (matchesCategory && matchesQuery) {
                matchedCount++;
                if (matchedCount <= visibleLimit) {
                    isVisible = true;
                    shownCount++;
                }
            }

            $card.toggleClass("hidden", !isVisible);
        });

        $searchCount.text(`Found items: ${matchedCount}`);
        $noResultsMsg.toggleClass("is-visible", matchedCount === 0);

        if ($loadMoreWrap.length) {
            const showBar = matchedCount > PAGE_SIZE;
            const hasMore = shownCount < matchedCount;

            $loadMoreWrap.toggleClass("is-hidden", !showBar);
            $showMoreBtn.toggleClass("is-hidden", !hasMore);

            if (showBar) {
                $loadStatus.text(`Showing ${shownCount} of ${matchedCount} items`);
            }
        }

        syncToolbarMeta();
    };

    const setCategory = (category, shouldScroll = false) => {
        const $targetBtn = $catBtns.filter(`[data-category="${category}"]`).first();
        if (!$targetBtn.length) return;

        $catBtns.removeClass("active").attr("aria-pressed", "false");
        $targetBtn.addClass("active").attr("aria-pressed", "true");

        activeCategory = category;
        visibleLimit = PAGE_SIZE;
        applyFilters();

        if (shouldScroll) {
            const catalogEl = document.getElementById("catalog");
            if (catalogEl) {
                catalogEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };

    const resetAllFilters = () => {
        $searchInput.val("");
        if ($sortSelect.length && $sortSelect.val() !== "featured") {
            $sortSelect.val("featured");
            sortCards("featured");
        }
        setCategory("all", false);
    };

    $searchInput.on("input", function () {
        visibleLimit = PAGE_SIZE;
        applyFilters();
    });

    $searchClearBtn.on("click", function () {
        $searchInput.val("").trigger("focus");
        visibleLimit = PAGE_SIZE;
        applyFilters();
    });

    $sortSelect.on("change", function () {
        sortCards($(this).val());
        visibleLimit = PAGE_SIZE;
        applyFilters();
    });

    $catBtns.on("click", function () {
        setCategory($(this).data("category"), false);
    });

    $("[data-jump-category]").on("click", function () {
        const cat = $(this).data("jumpCategory");
        if (cat) setCategory(cat, true);
    });

    $resetFiltersBtn.on("click", resetAllFilters);
    $emptyResetBtn.on("click", resetAllFilters);

    $showMoreBtn.on("click", function () {
        const wasFocused = document.activeElement === this;
        visibleLimit += PAGE_SIZE;
        applyFilters();

        if (wasFocused && $showMoreBtn.hasClass("is-hidden") && $loadStatus.length) {
            $loadStatus.attr("tabindex", "-1").trigger("focus");
        }
    });

    try {
        const params = new URLSearchParams(window.location.search);
        const initialCat = params.get("category");
        if (initialCat && $catBtns.filter(`[data-category="${initialCat}"]`).length) {
            setCategory(initialCat, false);
            return;
        }
    } catch (e) {}

    applyFilters();
}

function initQuickViewModal() {
    const $modal = $("#menuItemModal");
    if (!$modal.length) return;

    const PLACEHOLDER_SRC = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E";
    const $imgWrap     = $("#menuModalImgWrap");
    const $img         = $("#menuModalImg");
    const $cat         = $("#menuModalCat");
    const $title       = $("#menuModalTitle");
    const $desc        = $("#menuModalDesc");
    const $price       = $("#menuModalPrice");
    const $addBtn      = $("#menuModalAdd");
    const $qtyControls = $("#menuModalQtyControls");
    const $qtyVal      = $("#menuModalQtyVal");
    const $favBtn      = $("#menuModalFav");
    const $closeBtn    = $("#menuModalClose");

    let $activeCard = null;
    let lastTrigger = null;

    const syncModalState = () => {
        if (!$activeCard || !$activeCard.length) return;

        const isInCart = $activeCard.find(".card-qty-controls").hasClass("is-visible");
        const qtyText  = $activeCard.find(".item-cart-qty").text().trim() || "0";
        const isFav    = $activeCard.find(".btn-fav").hasClass("active");

        $addBtn.toggleClass("is-hidden", isInCart);
        $qtyControls.toggleClass("is-visible", isInCart);
        $qtyVal.text(qtyText);
        $favBtn.toggleClass("active", isFav)
               .attr("aria-label", isFav ? "Remove from favorites" : "Add to favorites");
    };

    const openModal = ($card, triggerEl) => {
        $activeCard = $card;
        lastTrigger = triggerEl || null;

        const $cardImg    = $card.find(".placeholder img");
        const isContain   = $card.find(".placeholder").hasClass("placeholder_contain");
        const catText     = $card.find(".card_cat").text().trim() || String($card.attr("data-category") || "");
        const titleText   = $card.find("h3").text().trim();
        const descText    = $card.find(".card_content p").text().trim();
        const priceText   = $card.find(".card_price").text().trim();

        $imgWrap.toggleClass("is-contain", isContain).toggleClass("is-cover", !isContain);
        $img.attr({ src: $cardImg.attr("src") || PLACEHOLDER_SRC, alt: $cardImg.attr("alt") || titleText });
        $cat.text(catText);
        $title.text(titleText);
        $desc.text(descText);
        $price.text(priceText);

        syncModalState();
        $modal.addClass("open").attr("aria-hidden", "false");
        $closeBtn.trigger("focus");
    };

    const closeModal = () => {
        if (!$modal.hasClass("open")) return;
        $modal.removeClass("open").attr("aria-hidden", "true");
        $img.attr({ src: PLACEHOLDER_SRC, alt: "" });
        $activeCard = null;
        if (lastTrigger && typeof lastTrigger.focus === "function") {
            lastTrigger.focus();
        }
        lastTrigger = null;
    };

    $(".menu-layout .product-card h3").each(function () {
        const title = $(this).text().trim();
        $(this).attr({
            tabindex: "0",
            role: "button",
            "aria-label": title ? "Quick view " + title : "Quick view"
        });
    });

    $(document).on("click", ".menu-layout .product-card .placeholder, .menu-layout .product-card h3", function (e) {
        if ($(e.target).closest(".btn-fav").length) return;
        openModal($(this).closest(".product-card"), this);
    });

    $(document).on("keydown", ".menu-layout .product-card h3[tabindex='0']", function (e) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openModal($(this).closest(".product-card"), this);
        }
    });

    $addBtn.on("click", function () {
        if (!$activeCard) return;
        $activeCard.find(".add-to-cart-btn").trigger("click");
        syncModalState();
    });

    $("#menuModalInc").on("click", function () {
        if (!$activeCard) return;
        $activeCard.find(".card-qty-inc").trigger("click");
        syncModalState();
    });

    $("#menuModalDec").on("click", function () {
        if (!$activeCard) return;
        $activeCard.find(".card-qty-dec").trigger("click");
        syncModalState();
    });

    $favBtn.on("click", function () {
        if (!$activeCard) return;
        $activeCard.find(".btn-fav").trigger("click");
        syncModalState();
    });

    $(document).on("click", ".cart-inc, .cart-dec, .cart-btn-del, .cart-del, #cartClearBtn", function () {
        if ($modal.hasClass("open")) {
            setTimeout(syncModalState, 0);
        }
    });

    $closeBtn.on("click", closeModal);
    $modal.on("click", function (e) {
        if (e.target === this) closeModal();
    });
    $(document).on("keydown", function (e) {
        if (e.key === "Escape" && $modal.hasClass("open")) closeModal();
    });
}

function initRecommendations() {
    const $itemForm     = $("#item-form");
    const $itemInput    = $("#item-input");
    const $itemsList    = $("#items-list");
    const $itemCount    = $("#item-count");
    const $itemError    = $("#item-error");
    const $emptyMsg     = $("#empty-list-msg");

    if (!$itemForm.length || !$itemsList.length) return;

    const STORAGE_KEY = "bakeryRecommendations";
    let items = [];
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (Array.isArray(saved)) {
            items = saved.map(x => String(x || "").trim()).filter(Boolean);
        }
    } catch (e) {
        items = [];
    }

    const persist = () => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) {}
    };

    const updateUI = () => {
        $itemCount.text(items.length);
        $emptyMsg.toggle(items.length === 0);
    };

    const appendItemRow = (text, animate = true) => {
        const $li = $("<li>").addClass("rec-item").attr("data-text", text);
        const $span = $("<span>").addClass("rec-item__text").text(text);
        const $deleteBtn = $("<button>")
            .attr("type", "button")
            .text("Remove")
            .addClass("btn-remove");

        $li.append($span, $deleteBtn);
        if (animate) {
            $li.hide();
            $itemsList.append($li);
            $li.fadeIn(260);
        } else {
            $itemsList.append($li);
        }
    };

    items.forEach(text => appendItemRow(text, false));
    updateUI();

    const addSuggestion = (text) => {
        const clean = String(text || "").trim();
        if (!clean) {
            $itemError.addClass("is-visible");
            $itemInput.addClass("input-invalid").trigger("focus");
            return false;
        }
        $itemError.removeClass("is-visible");
        $itemInput.removeClass("input-invalid");

        items.push(clean);
        persist();
        appendItemRow(clean, true);
        updateUI();
        return true;
    };

    $itemForm.on("submit", function (event) {
        event.preventDefault();
        if (addSuggestion($itemInput.val())) {
            $itemInput.val("").trigger("focus");
        }
    });

    $(".rec-preset-btn[data-preset]").on("click", function () {
        const preset = $(this).data("preset");
        if (preset) addSuggestion(preset);
    });

    $itemInput.on("input", function () {
        if ($(this).val().trim() !== "") {
            $itemError.removeClass("is-visible");
            $(this).removeClass("input-invalid");
        }
    });

    $itemsList.on("click", ".btn-remove", function () {
        const $li = $(this).closest("li");
        const index = $li.index();

        $li.fadeOut(220, function () {
            if (index >= 0 && index < items.length) {
                items.splice(index, 1);
                persist();
            }
            $(this).remove();
            updateUI();
        });
    });
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
