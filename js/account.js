(function () {
    const auth = window.BakeryAuth;
    const user = auth && auth.current();
    if (!user) {
        window.location.replace('register.html');
        return;
    }

    const $ = (id) => document.getElementById(id);
    const viewSection = $('accViewSection');
    const editSection = $('accEditSection');
    const heroActions = $('accHeroActions');
    const form = $('accEditForm');
    const errorEl = $('accError');
    const phoneInput = $('accPhone');
    const presetHobbies = ['Baking', 'Coffee'];

    if (phoneInput && typeof window.attachPhoneMask === 'function') {
        window.attachPhoneMask(phoneInput);
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatActivityDate(dateInput) {
        if (!dateInput) return '—';
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return '—';

        const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(d);
        const day = d.getDate();
        const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(d);
        const year = d.getFullYear();
        const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(d);

        return `${weekday}, ${day} ${month} ${year}, ${time}`;
    }

    function formatElapsed(fromInput, toInput) {
        if (!fromInput) return '';
        const from = new Date(fromInput).getTime();
        const to = toInput ? new Date(toInput).getTime() : Date.now();
        if (isNaN(from)) return '';

        let diffSec = Math.max(0, Math.floor((to - from) / 1000));

        if (diffSec < 10) return '(just now)';
        if (diffSec < 60) return `(${diffSec} secs)`;

        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return `(${diffMin} min${diffMin > 1 ? 's' : ''})`;

        const diffHours = Math.floor(diffMin / 60);
        const remMin = diffMin % 60;
        if (diffHours < 24) {
            return remMin > 0
                ? `(${diffHours} hour${diffHours > 1 ? 's' : ''} ${remMin} min${remMin > 1 ? 's' : ''})`
                : `(${diffHours} hour${diffHours > 1 ? 's' : ''})`;
        }

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 365) {
            return `(${diffDays} day${diffDays > 1 ? 's' : ''})`;
        }

        const diffYears = Math.floor(diffDays / 365);
        const remDays = diffDays % 365;
        if (remDays > 0) {
            return `(${diffYears} year${diffYears > 1 ? 's' : ''} ${remDays} day${remDays > 1 ? 's' : ''})`;
        }
        return `(${diffYears} year${diffYears > 1 ? 's' : ''})`;
    }

    function render() {
        const u = auth.current();
        if (!u) return;

        const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || 'Bakery Guest';
        $('accName').textContent = fullName;
        $('accEmail').textContent = u.email || '';

        const avatarContainer = $('accAvatar');
        const removeAvatarBtn = $('accAvatarRemoveBtn');
        if (avatarContainer) {
            if (u.avatar) {
                avatarContainer.innerHTML = `<img src="${u.avatar}" alt="${escapeHtml(fullName)}" class="account-avatar_img">`;
                if (removeAvatarBtn) removeAvatarBtn.classList.remove('d-none');
            } else {
                avatarContainer.innerHTML = `<span class="ico ico-user" aria-hidden="true"></span>`;
                if (removeAvatarBtn) removeAvatarBtn.classList.add('d-none');
            }
        }

        const hobbies = (u.hobbies || []).filter(Boolean);
        const hobbiesHtml = hobbies.length
            ? hobbies.map((h) => `<span class="account-tag">${escapeHtml(h)}</span>`).join('')
            : '<span class="text-muted">—</span>';

        const genderVal = u.preferNotToSay ? 'Prefer not to say' : (u.gender || '—');
        const orientationVal = u.preferNotToSay ? 'Prefer not to say' : (u.orientation || '—');

        const grid = $('accInfoGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="account-info-card">
                    <div class="account-info-icon"><span class="ico ico-user" aria-hidden="true"></span></div>
                    <div class="account-info-text">
                        <span class="account-info-label">Full Name</span>
                        <span class="account-info-val">${escapeHtml(fullName)}</span>
                    </div>
                </div>
                <div class="account-info-card">
                    <div class="account-info-icon"><span class="ico ico-mail" aria-hidden="true"></span></div>
                    <div class="account-info-text">
                        <span class="account-info-label">Email Address</span>
                        <span class="account-info-val">${escapeHtml(u.email || '—')}</span>
                    </div>
                </div>
                <div class="account-info-card">
                    <div class="account-info-icon"><span class="ico ico-phone" aria-hidden="true"></span></div>
                    <div class="account-info-text">
                        <span class="account-info-label">Phone Number</span>
                        <span class="account-info-val">${escapeHtml(u.phone || '—')}</span>
                    </div>
                </div>
                <div class="account-info-card">
                    <div class="account-info-icon"><span class="ico ico-country" aria-hidden="true"></span></div>
                    <div class="account-info-text">
                        <span class="account-info-label">Country</span>
                        <span class="account-info-val">${escapeHtml(u.country || '—')}</span>
                    </div>
                </div>
                <div class="account-info-card">
                    <div class="account-info-icon"><span class="ico ico-user" aria-hidden="true"></span></div>
                    <div class="account-info-text">
                        <span class="account-info-label">Gender</span>
                        <span class="account-info-val">${escapeHtml(genderVal)}</span>
                    </div>
                </div>
                <div class="account-info-card">
                    <div class="account-info-icon"><span class="ico ico-heart" aria-hidden="true"></span></div>
                    <div class="account-info-text">
                        <span class="account-info-label">Orientation</span>
                        <span class="account-info-val">${escapeHtml(orientationVal)}</span>
                    </div>
                </div>
                <div class="account-info-card account-info-card_full">
                    <div class="account-info-icon"><span class="ico ico-interests" aria-hidden="true"></span></div>
                    <div class="account-info-text">
                        <span class="account-info-label">Hobbies &amp; Interests</span>
                        <div class="account-tags-wrap">${hobbiesHtml}</div>
                    </div>
                </div>
            `;
        }

        const firstAccessDate = u.firstAccess || u.createdAt || new Date().toISOString();
        const lastAccessDate = u.lastAccess || new Date().toISOString();

        const firstAccessEl = $('accFirstAccess');
        if (firstAccessEl) {
            firstAccessEl.innerHTML = `${formatActivityDate(firstAccessDate)} <span class="account-activity-elapsed">${formatElapsed(firstAccessDate)}</span>`;
        }

        const lastAccessEl = $('accLastAccess');
        if (lastAccessEl) {
            lastAccessEl.innerHTML = `${formatActivityDate(lastAccessDate)} <span class="account-activity-elapsed">${formatElapsed(lastAccessDate)}</span>`;
        }

        renderFavorites(u.favorites || []);
        renderOrders(u.orders || []);

        const nameBtn = document.querySelector('.account-btn_name');
        if (nameBtn) nameBtn.textContent = u.firstName || 'Account';
    }

    function resolveOrderStatus() {
        return 'Completed';
    }

    function renderOrders(orders) {
        const container = $('accOrdersList');
        if (!container) return;

        if (!orders || !orders.length) {
            container.innerHTML = `
                <div class="account-empty-state">
                    <span class="ico ico-orders" aria-hidden="true"></span>
                    <h3 class="account-empty-title">No orders yet.</h3>
                    <p class="account-empty-desc">Place an order from our <a href="services.html" class="account-empty-link">Menu</a> via the shopping cart and your purchase history will appear here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map((order, idx) => {
            const statusLabel = resolveOrderStatus(order);
            const items = Array.isArray(order.items) ? order.items : [];
            const itemsHtml = items.map((it) => {
                const qty = Number(it.qty) || 1;
                const lineTotal = (Number(it.price) || 0) * qty;
                return `<span class="account-order-item-tag">${escapeHtml(it.name)} × ${qty} <em>(${lineTotal.toLocaleString('ru-RU')}₸)</em></span>`;
            }).join('');
            const totalFormatted = Number(order.total || 0).toLocaleString('ru-RU') + '₸';

            return `
                <div class="account-order-row" data-order-idx="${idx}">
                    <div class="account-order-head">
                        <div class="account-order-id-wrap">
                            <span class="account-order-id">#${escapeHtml(order.id || 'BK-0000')}</span>
                            <span class="account-order-date">${formatActivityDate(order.date)}</span>
                        </div>
                        <div class="account-order-right">
                            <span class="account-order-status is-completed">
                                <span class="account-order-status_dot" aria-hidden="true"></span>
                                <span>${statusLabel}</span>
                            </span>
                            <span class="account-order-total">${totalFormatted}</span>
                        </div>
                    </div>
                    <div class="account-order-items">
                        ${itemsHtml || '<span class="text-muted">No items listed</span>'}
                    </div>
                </div>
            `;
        }).join('');
    }

    window.addEventListener('bakery:orderPlaced', function () {
        render();
    });

    function renderFavorites(favs) {
        const container = $('accFavoritesList');
        if (!container) return;

        if (!favs || !favs.length) {
            container.innerHTML = `
                <div class="account-empty-state">
                    <span class="ico ico-heart" aria-hidden="true"></span>
                    <h3 class="account-empty-title">No favorite items yet.</h3>
                    <p class="account-empty-desc">Browse our <a href="services.html" class="account-empty-link">Menu</a> and click the heart on any pastry or cake to add it here!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = favs.map((item, idx) => `
            <article class="account-fav-card" data-fav-idx="${idx}">
                <img src="${escapeHtml(item.img || 'images/catalog/pastries/frenchcroissant.webp')}" alt="${escapeHtml(item.name)}" class="account-fav-card_img" loading="lazy">
                <div class="account-fav-card_body">
                    <h3 class="account-fav-card_title">${escapeHtml(item.name)}</h3>
                    <span class="account-fav-card_price">${escapeHtml(item.price || '')}</span>
                    <div class="account-fav-card_actions">
                        <a href="services.html" class="btn btn-outline btn-sm">View in Menu</a>
                        <button type="button" class="btn btn-sm btn-outline remove-fav-btn" data-name="${escapeHtml(item.name)}" title="Remove from favorites">
                            <span class="ico ico-close" aria-hidden="true"></span>
                        </button>
                    </div>
                </div>
            </article>
        `).join('');
    }

    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.remove-fav-btn');
        if (!btn) return;
        const name = btn.getAttribute('data-name');
        if (!name) return;

        const u = auth.current();
        if (!u || !Array.isArray(u.favorites)) return;

        const updated = u.favorites.filter((f) => f.name !== name);
        auth.update({ favorites: updated });
        render();
    });

    const avatarInput = $('accAvatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', function (e) {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (evt) {
                const img = new Image();
                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    const maxDim = 200;
                    let w = img.width;
                    let h = img.height;
                    if (w > h) {
                        if (w > maxDim) {
                            h = Math.round((h * maxDim) / w);
                            w = maxDim;
                        }
                    } else {
                        if (h > maxDim) {
                            w = Math.round((w * maxDim) / h);
                            h = maxDim;
                        }
                    }
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

                    auth.update({ avatar: dataUrl });
                    render();
                };
                img.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    const removeAvatarBtn = $('accAvatarRemoveBtn');
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', function () {
            auth.update({ avatar: '' });
            render();
        });
    }

    const preferInput = $('accPreferNotToSay');
    const switchesCard = $('accSwitchesCard');
    const genderToggle = $('accGenderToggle');
    const orientationToggle = $('accOrientationToggle');

    function syncPersonalSwitches(prefer) {
        if (switchesCard) switchesCard.classList.toggle('disabled-section', Boolean(prefer));
        [genderToggle, orientationToggle].forEach((input) => {
            if (!input) return;
            input.disabled = Boolean(prefer);
            if (prefer) input.checked = false;
        });
    }

    if (preferInput) {
        preferInput.addEventListener('change', () => syncPersonalSwitches(preferInput.checked));
    }

    function setEditing(editing) {
        if (viewSection) viewSection.classList.toggle('d-none-account', editing);
        if (editSection) editSection.classList.toggle('d-none-account', !editing);
        if (heroActions) heroActions.classList.toggle('d-none-account', editing);
        if (errorEl) errorEl.textContent = '';
        if (!editing) return;

        const u = auth.current();
        const hobbies = u.hobbies || [];
        const prefer = Boolean(u.preferNotToSay);
        $('accFirstName').value = u.firstName || '';
        $('accLastName').value = u.lastName || '';
        $('accPhone').value = u.phone || '';
        $('accCountry').value = u.country || '';
        $('accHobbyBaking').checked = hobbies.includes('Baking');
        $('accHobbyCoffee').checked = hobbies.includes('Coffee');
        $('accHobbyCustom').value = hobbies.filter((h) => !presetHobbies.includes(h)).join(', ');
        if (preferInput) preferInput.checked = prefer;
        if (genderToggle) genderToggle.checked = !prefer && u.gender === 'Female';
        if (orientationToggle) orientationToggle.checked = !prefer && u.orientation === 'Gay';
        syncPersonalSwitches(prefer);
        $('accFirstName').focus();
    }

    const editBtn = $('accEditBtn');
    const cancelBtn = $('accCancelBtn');
    if (editBtn) editBtn.addEventListener('click', () => setEditing(true));
    if (cancelBtn) cancelBtn.addEventListener('click', () => setEditing(false));

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (phoneInput) {
                const phoneVal = phoneInput.value.trim();
                if (phoneVal) {
                    const digits = phoneVal.replace(/\D/g, '');
                    const isKz = phoneVal.startsWith('+7');
                    const phoneOk = isKz ? digits.length === 11 : (digits.length >= 10 && digits.length <= 15);
                    phoneInput.setCustomValidity(phoneOk ? '' : 'Invalid phone number.');
                } else {
                    phoneInput.setCustomValidity('');
                }
            }
            if (!form.checkValidity()) {
                if (errorEl) errorEl.textContent = 'Please check the required fields and phone number format (e.g. +7 (777) 123-45-67).';
                return;
            }
            const hobbies = [];
            if ($('accHobbyBaking').checked) hobbies.push('Baking');
            if ($('accHobbyCoffee').checked) hobbies.push('Coffee');
            $('accHobbyCustom').value
                .split(',')
                .map((h) => h.trim())
                .filter(Boolean)
                .forEach((h) => hobbies.push(h));

            const preferNotToSay = Boolean(preferInput && preferInput.checked);
            const gender = preferNotToSay
                ? 'Prefer not to say'
                : (genderToggle && genderToggle.checked ? 'Female' : 'Male');
            const orientation = preferNotToSay
                ? 'Prefer not to say'
                : (orientationToggle && orientationToggle.checked ? 'Gay' : 'Straight');

            auth.update({
                firstName: $('accFirstName').value.trim(),
                lastName: $('accLastName').value.trim(),
                phone: $('accPhone').value.trim(),
                country: $('accCountry').value,
                preferNotToSay: preferNotToSay,
                gender: gender,
                orientation: orientation,
                hobbies: hobbies
            });
            render();
            setEditing(false);
        });
    }

    const passwordForm = $('accPasswordForm');
    const passwordMsg = $('accPasswordMsg');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const oldPass = $('accOldPassword') ? $('accOldPassword').value : '';
            const newPass = $('accNewPassword') ? $('accNewPassword').value : '';

            if (passwordMsg) {
                passwordMsg.className = 'account-edit_error';
                passwordMsg.textContent = '';
            }

            if (!oldPass) {
                if (passwordMsg) passwordMsg.textContent = 'Please enter your current password.';
                return;
            }
            if (!newPass || newPass.length < 8) {
                if (passwordMsg) passwordMsg.textContent = 'New password must be at least 8 characters long.';
                return;
            }
            if (!/[A-Z]/.test(newPass) || !/[a-z]/.test(newPass) || !/[0-9]/.test(newPass)) {
                if (passwordMsg) passwordMsg.textContent = 'New password must include uppercase, lowercase, and at least one number.';
                return;
            }
            if (oldPass === newPass) {
                if (passwordMsg) passwordMsg.textContent = 'New password must be different from the current password.';
                return;
            }

            const result = await auth.changePassword(oldPass, newPass);
            if (!result || !result.ok) {
                if (passwordMsg) {
                    passwordMsg.className = 'account-edit_error';
                    passwordMsg.textContent = (result && result.error) || 'Could not update password.';
                }
                return;
            }

            passwordForm.reset();
            if (passwordMsg) {
                passwordMsg.className = 'account-msg-success';
                passwordMsg.textContent = 'Your password has been updated successfully.';
            }
        });
    }

    const deleteInitBtn = $('accDeleteInitBtn');
    const deleteCancelBtn = $('accDeleteCancelBtn');
    const deleteConfirmBtn = $('accDeleteConfirmBtn');
    const deletePrompt = $('accDeletePrompt');
    const deleteConfirmWrap = $('accDeleteConfirmWrap');

    if (deleteInitBtn) {
        deleteInitBtn.addEventListener('click', function () {
            if (deletePrompt) deletePrompt.classList.add('d-none-account');
            if (deleteConfirmWrap) deleteConfirmWrap.classList.remove('d-none-account');
        });
    }

    if (deleteCancelBtn) {
        deleteCancelBtn.addEventListener('click', function () {
            if (deleteConfirmWrap) deleteConfirmWrap.classList.add('d-none-account');
            if (deletePrompt) deletePrompt.classList.remove('d-none-account');
        });
    }

    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', function () {
            auth.deleteAccount();
            window.location.replace('index.html');
        });
    }

    render();
})();
