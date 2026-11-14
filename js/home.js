$(function () {
    initWelcome();
    initCarousel();
    initTestimonials();
});

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

    const MODAL_PLACEHOLDER_SRC = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E";

    const closeModal = () => {
        $modal.removeClass("open").attr("aria-hidden", "true");
        $("#modalImg").attr({ src: MODAL_PLACEHOLDER_SRC, alt: "" });
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

function initTestimonials() {
    const container = document.getElementById("animatedTestimonials");
    if (!container) return;

    const cardsWrap = container.querySelector(".testimonials-cards");
    const dotsWrap = container.querySelector(".testimonials-dots");
    const intervalMs = parseInt(container.getAttribute("data-interval") || "6000", 10);
    const STORAGE_KEY = "bakeryGuestReviews";

    if (!cardsWrap || !dotsWrap) return;

    let cards = Array.from(cardsWrap.querySelectorAll(".testimonial-card-item"));
    let dots = Array.from(dotsWrap.querySelectorAll(".testimonials-dot"));
    let activeIndex = 0;
    let timer = null;

    const escapeHtml = (str) =>
        String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    const buildStarsHtml = (rating) => {
        const r = Math.max(1, Math.min(5, Number(rating) || 5));
        let html = "";
        for (let i = 1; i <= 5; i++) {
            const emptyClass = i > r ? " testimonial-star--empty" : "";
            html += `<svg class="testimonial-star${emptyClass}" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
        }
        return html;
    };

    const appendTestimonialToDOM = (review) => {
        const index = cards.length;
        const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));

        const article = document.createElement("article");
        article.className = "testimonial-card-item";
        article.setAttribute("data-index", String(index));
        article.setAttribute("aria-hidden", "true");
        article.innerHTML = `
            <div class="testimonial-card-box">
                <div class="testimonial-stars" aria-label="${rating} out of 5 stars">
                    ${buildStarsHtml(rating)}
                </div>
                <div class="testimonial-quote-wrap">
                    <svg class="testimonial-quote-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path>
                        <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path>
                    </svg>
                    <p class="testimonial-quote-text">"${escapeHtml(review.content)}"</p>
                </div>
                <div class="testimonial-separator" role="separator"></div>
                <div class="testimonial-author">
                    <div class="testimonial-avatar" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <h3 class="testimonial-author-name">${escapeHtml(review.name)}</h3>
                </div>
            </div>
        `;
        cardsWrap.appendChild(article);
        cards.push(article);

        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "testimonials-dot";
        dot.setAttribute("data-index", String(index));
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-selected", "false");
        dot.setAttribute("aria-label", `View testimonial ${index + 1}`);
        dot.addEventListener("click", () => {
            setActive(index);
            startAutoRotate();
        });
        dotsWrap.appendChild(dot);
        dots.push(dot);
    };

    const setActive = (index) => {
        if (!cards.length) return;
        activeIndex = (index + cards.length) % cards.length;

        cards.forEach((card, i) => {
            const isActive = i === activeIndex;
            card.classList.toggle("active", isActive);
            card.setAttribute("aria-hidden", String(!isActive));
        });

        dots.forEach((dot, i) => {
            const isActive = i === activeIndex;
            dot.classList.toggle("active", isActive);
            dot.setAttribute("aria-selected", String(isActive));
        });
    };

    const startAutoRotate = () => {
        stopAutoRotate();
        if (intervalMs > 0 && cards.length > 1) {
            timer = setInterval(() => {
                setActive(activeIndex + 1);
            }, intervalMs);
        }
    };

    const stopAutoRotate = () => {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    };

    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            setActive(i);
            startAutoRotate();
        });
    });

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}

    const introEl = document.getElementById("testimonialsIntro");
    const toggleBtn = document.getElementById("toggleReviewFormBtn");
    const cancelBtn = document.getElementById("cancelReviewFormBtn");
    const formWrap = document.getElementById("testimonialFormWrap");
    const form = document.getElementById("testimonialForm");
    const authorInput = document.getElementById("reviewAuthorInput");
    const textInput = document.getElementById("reviewTextInput");
    const errorEl = document.getElementById("reviewFormError");
    const ratingPicker = document.getElementById("reviewRatingPicker");

    let selectedRating = 5;

    if (ratingPicker) {
        const starBtns = Array.from(ratingPicker.querySelectorAll(".rating-star-btn"));

        const updateStarsUI = (rating, isHover = false) => {
            starBtns.forEach((btn) => {
                const val = Number(btn.getAttribute("data-value"));
                if (isHover) {
                    btn.classList.toggle("hover-active", val <= rating);
                    btn.classList.toggle("active", val <= rating);
                } else {
                    btn.classList.remove("hover-active");
                    btn.classList.toggle("active", val <= selectedRating);
                    btn.setAttribute("aria-checked", String(val === selectedRating));
                }
            });
        };

        starBtns.forEach((btn) => {
            const val = Number(btn.getAttribute("data-value"));
            btn.addEventListener("mouseenter", () => updateStarsUI(val, true));
            btn.addEventListener("click", () => {
                selectedRating = val;
                updateStarsUI(selectedRating, false);
            });
        });

        ratingPicker.addEventListener("mouseleave", () => {
            updateStarsUI(selectedRating, false);
        });
    }

    const openForm = () => {
        if (!formWrap) return;
        if (introEl) introEl.hidden = true;
        formWrap.hidden = false;
        if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "true");
        stopAutoRotate();

        if (authorInput && !authorInput.value.trim()) {
            const user = window.BakeryAuth && window.BakeryAuth.current && window.BakeryAuth.current();
            const fullName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim() : "";
            if (fullName) {
                authorInput.value = fullName;
            }
        }
        if (authorInput) authorInput.focus();
    };

    const closeForm = () => {
        if (!formWrap) return;
        formWrap.hidden = true;
        if (introEl) introEl.hidden = false;
        if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "false");
        if (errorEl) errorEl.textContent = "";
        startAutoRotate();
    };

    if (toggleBtn && formWrap) {
        toggleBtn.addEventListener("click", () => {
            if (formWrap.hidden) {
                openForm();
            } else {
                closeForm();
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", closeForm);
    }

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = authorInput ? authorInput.value.trim() : "";
            const content = textInput ? textInput.value.trim().replace(/^["«]+|["»]+$/g, "") : "";

            if (!name) {
                if (errorEl) errorEl.textContent = "Please enter your name.";
                if (authorInput) authorInput.focus();
                return;
            }
            if (!content || content.length < 3) {
                if (errorEl) errorEl.textContent = "Please write a short review.";
                if (textInput) textInput.focus();
                return;
            }

            const newReview = {
                name,
                content,
                rating: selectedRating
            };

            appendTestimonialToDOM(newReview);
            setActive(cards.length - 1);

            if (textInput) textInput.value = "";
            selectedRating = 5;
            if (ratingPicker) {
                ratingPicker.querySelectorAll(".rating-star-btn").forEach((btn) => {
                    btn.classList.add("active");
                    btn.setAttribute("aria-checked", String(btn.getAttribute("data-value") === "5"));
                });
            }

            closeForm();
        });
    }

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        container.classList.add("is-inview");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );
        observer.observe(container);
    } else {
        container.classList.add("is-inview");
    }

    startAutoRotate();
}
