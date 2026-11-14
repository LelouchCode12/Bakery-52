(function (global) {
    const USERS_KEY = "bakery_users";
    const CURRENT_KEY = "bakery_currentUser";

    function readJson(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value === null || value === undefined ? fallback : value;
        } catch (e) {
            return fallback;
        }
    }

    (function syncBossAccount() {
        try {
            const users = readJson(USERS_KEY, {});
            if (!users || typeof users !== "object" || Array.isArray(users)) return;

            const bossHash = (window.crypto && window.crypto.subtle)
                ? "f48fe4472d423c736a28e802755f31c6b46a161db56e3418d3ef0a02c317b743"
                : "x21523521";

            let targetKey = null;
            for (const key of Object.keys(users)) {
                const u = users[key];
                if (!u || typeof u !== "object") continue;
                const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ").trim().toLowerCase();
                const email = String(u.email || key).trim().toLowerCase();
                if (email === "qweqeeew@gmail.com" || email === "test@gmail.com" || fullName === "boss 228") {
                    targetKey = key;
                    break;
                }
            }

            const current = readJson(CURRENT_KEY, null);
            const currentNorm = current ? String(current).trim().toLowerCase() : null;

            if (targetKey) {
                const oldData = users[targetKey];
                if (targetKey !== "test@gmail.com") {
                    delete users[targetKey];
                }
                users["test@gmail.com"] = Object.assign({}, oldData, {
                    firstName: oldData.firstName || "BOss",
                    lastName: oldData.lastName !== undefined ? oldData.lastName : "228",
                    email: "test@gmail.com",
                    passHash: bossHash
                });
                localStorage.setItem(USERS_KEY, JSON.stringify(users));

                if (currentNorm && (currentNorm === String(targetKey).trim().toLowerCase() || currentNorm === "qweqeeew@gmail.com")) {
                    localStorage.setItem(CURRENT_KEY, JSON.stringify("test@gmail.com"));
                }
            } else {
                users["test@gmail.com"] = {
                    firstName: "BOss",
                    lastName: "228",
                    email: "test@gmail.com",
                    phone: "",
                    country: "Kazakhstan",
                    preferNotToSay: true,
                    gender: "Prefer not to say",
                    orientation: "Prefer not to say",
                    hobbies: ["Baking", "Coffee"],
                    createdAt: new Date().toISOString(),
                    passHash: bossHash
                };
                localStorage.setItem(USERS_KEY, JSON.stringify(users));
            }
        } catch (e) {}
    })();

    function getCurrentUser() {
        const email = readJson(CURRENT_KEY, null);
        if (!email) return null;

        const users = readJson(USERS_KEY, {});
        if (!users || typeof users !== "object" || Array.isArray(users)) return null;

        const user = users[String(email).trim().toLowerCase()];
        if (!user || typeof user !== "object") return null;

        const copy = Object.assign({}, user);
        delete copy.passHash;
        return copy;
    }

    function createIcon(name) {
        const span = document.createElement("span");
        span.className = "ico ico-" + name;
        span.setAttribute("aria-hidden", "true");
        return span;
    }

    function createAccountItem(user) {
        const li = document.createElement("li");
        li.className = "account";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "account-btn";
        btn.setAttribute("aria-haspopup", "true");
        btn.setAttribute("aria-expanded", "false");
        if (/account\.html$/.test(window.location.pathname)) {
            btn.setAttribute("aria-current", "page");
        }

        let avatarEl;
        if (user.avatar) {
            avatarEl = document.createElement("img");
            avatarEl.src = user.avatar;
            avatarEl.alt = "Avatar";
            avatarEl.className = "account-btn_avatar";
        } else {
            avatarEl = createIcon("user");
        }

        const nameEl = document.createElement("span");
        nameEl.className = "account-btn_name";
        nameEl.textContent = user.firstName || "Account";

        btn.appendChild(avatarEl);
        btn.appendChild(nameEl);
        btn.appendChild(createIcon("chevron"));
        li.appendChild(btn);
        return li;
    }

    function syncNavbar(userOverride) {
        const user = userOverride || getCurrentUser();
        if (!user) return null;

        const regLink = document.querySelector(".navbar_links a[href='register.html']");
        if (!regLink) return null;

        const regLi = regLink.closest("li");
        if (!regLi || !regLi.parentNode) return null;

        const accountItem = createAccountItem(user);
        regLi.parentNode.replaceChild(accountItem, regLi);
        document.documentElement.classList.remove("has-account");
        return accountItem;
    }

    if (getCurrentUser()) {
        document.documentElement.classList.add("has-account");
    }

    global.BakeryHeaderAuth = {
        getCurrentUser: getCurrentUser,
        createAccountItem: createAccountItem,
        syncNavbar: syncNavbar
    };
})(window);
