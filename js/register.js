(function () {
    const form = document.getElementById('registrationForm');
    if (!form) return;

    const password = document.getElementById('password');
    const confirm = document.getElementById('confirmPassword');
    const preferCheckbox = document.getElementById('preferNotToSay');
    const switchesCard = document.getElementById('switchesCard');
    const switchItems = document.querySelectorAll('.switch-item');
    const resetBtn = document.getElementById('resetBtn');
    const phoneInput = document.getElementById('phone');
    if (phoneInput && typeof window.attachPhoneMask === 'function') {
        window.attachPhoneMask(phoneInput);
    }

    if (preferCheckbox && switchesCard) {
        preferCheckbox.addEventListener('change', function () {
            if (this.checked) {
                switchesCard.classList.add('disabled-section');
                switchItems.forEach(item => {
                    item.disabled = true;
                    item.checked = false;
                });
            } else {
                switchesCard.classList.remove('disabled-section');
                switchItems.forEach(item => {
                    item.disabled = false;
                });
            }
        });
    }

    const registerError = document.getElementById('registerError');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const heading = document.querySelector('.register-card h1');
    const subtitle = document.querySelector('.register-subtitle');
    const headingText = heading ? heading.textContent : '';
    const subtitleText = subtitle ? subtitle.textContent : '';

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const emailInput = document.getElementById('email');
    const loginEmailInput = document.getElementById('loginEmail');
    const passwordFeedback = document.getElementById('passwordFeedback');

    function showError(el, message) {
        if (!el) return;
        el.textContent = message;
        el.classList.toggle('d-none', !message);
    }

    function goToAccount() {
        window.location.href = 'account.html';
    }

    function validateEmailInput(input) {
        if (!input) return true;
        const val = input.value.trim();
        if (!val) {
            input.setCustomValidity('Please enter your email address.');
            return false;
        }
        if (!EMAIL_REGEX.test(val)) {
            input.setCustomValidity('Please enter a valid email address, e.g. name@example.com.');
            return false;
        }
        input.setCustomValidity('');
        return true;
    }

    function validatePhoneField() {
        if (!phoneInput) return true;
        const val = phoneInput.value.trim();
        if (!val) {
            phoneInput.setCustomValidity('');
            return true;
        }
        const digits = val.replace(/\D/g, '');
        const isKz = val.startsWith('+7');
        const isValid = isKz ? digits.length === 11 : (digits.length >= 10 && digits.length <= 15);
        phoneInput.setCustomValidity(isValid ? '' : 'Please enter a valid phone number.');
        return isValid;
    }

    function getPasswordError(val) {
        if (!val) return 'Please enter a password.';
        if (val.length < 8) return 'Password must be at least 8 characters long.';
        if (!/[A-Z]/.test(val)) return 'Password must include at least one uppercase letter.';
        if (!/[a-z]/.test(val)) return 'Password must include at least one lowercase letter.';
        if (!/[0-9]/.test(val)) return 'Password must include at least one number.';
        return '';
    }

    function validatePasswordStrength() {
        if (!password) return true;
        const err = getPasswordError(password.value);
        password.setCustomValidity(err);
        if (passwordFeedback) {
            passwordFeedback.textContent = err || 'Password must be at least 8 characters and include uppercase, lowercase, and a number.';
        }
        return !err;
    }

    async function saveAccount() {
        const hobbies = [];
        ['hobbyBaking', 'hobbyCoffee'].forEach(id => {
            const box = document.getElementById(id);
            if (box && box.checked) hobbies.push(box.value);
        });
        const custom = document.getElementById('hobbyCustom');
        if (custom && custom.value.trim()) hobbies.push(custom.value.trim());

        const genderToggle = document.getElementById('genderToggle');
        const orientationToggle = document.getElementById('orientationToggle');
        const preferNotToSay = Boolean(preferCheckbox && preferCheckbox.checked);
        const gender = preferNotToSay
            ? 'Prefer not to say'
            : (genderToggle && genderToggle.checked ? 'Female' : 'Male');
        const orientation = preferNotToSay
            ? 'Prefer not to say'
            : (orientationToggle && orientationToggle.checked ? 'Gay' : 'Straight');

        const profile = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            country: document.getElementById('country').value,
            preferNotToSay: preferNotToSay,
            gender: gender,
            orientation: orientation,
            hobbies: hobbies,
            createdAt: new Date().toISOString()
        };

        const result = await window.BakeryAuth.register(profile, password.value);
        if (!result.ok) {
            showError(registerError, result.error);
            return;
        }

        showError(registerError, '');
        goToAccount();
    }

    function showLoginMode(isLogin) {
        form.classList.toggle('d-none', isLogin);
        if (loginForm) loginForm.classList.toggle('d-none', !isLogin);
        showError(registerError, '');
        showError(loginError, '');
        if (heading) heading.textContent = isLogin ? 'Log in' : headingText;
        if (subtitle) subtitle.textContent = isLogin ? 'Welcome back! Enter your email and password to open your account.' : subtitleText;
    }

    const showLoginBtn = document.getElementById('showLogin');
    const showRegisterBtn = document.getElementById('showRegister');
    if (showLoginBtn) showLoginBtn.addEventListener('click', () => showLoginMode(true));
    if (showRegisterBtn) showRegisterBtn.addEventListener('click', () => showLoginMode(false));

    if (emailInput) {
        emailInput.addEventListener('input', () => validateEmailInput(emailInput));
        emailInput.addEventListener('blur', () => validateEmailInput(emailInput));
    }

    if (loginEmailInput) {
        loginEmailInput.addEventListener('input', () => validateEmailInput(loginEmailInput));
        loginEmailInput.addEventListener('blur', () => validateEmailInput(loginEmailInput));
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', validatePhoneField);
        phoneInput.addEventListener('blur', validatePhoneField);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            validateEmailInput(loginEmailInput);
            if (!loginForm.checkValidity()) {
                loginForm.classList.add('was-validated');
                return;
            }
            const result = await window.BakeryAuth.login(
                loginEmailInput.value,
                document.getElementById('loginPassword').value
            );
            if (!result.ok) {
                showError(loginError, result.error);
                return;
            }
            goToAccount();
        });
    }

    function validatePasswords() {
        validatePasswordStrength();
        if (!password || !confirm) return;
        if (confirm.value && password.value !== confirm.value) {
            confirm.setCustomValidity("Passwords do not match.");
            confirm.classList.add('is-invalid');
        } else if (!confirm.value) {
            confirm.setCustomValidity("Please confirm your password.");
            confirm.classList.remove('is-invalid');
        } else if (password.value !== confirm.value) {
            confirm.setCustomValidity("Passwords do not match.");
            confirm.classList.add('is-invalid');
        } else {
            confirm.setCustomValidity("");
            confirm.classList.remove('is-invalid');
        }
    }

    if (password && confirm) {
        password.addEventListener('input', validatePasswords);
        confirm.addEventListener('input', validatePasswords);
    }

    form.addEventListener('submit', function (event) {
        validateEmailInput(emailInput);
        validatePhoneField();
        validatePasswords();

        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            saveAccount();
            return;
        }

        form.classList.add('was-validated');
    }, false);

    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            form.classList.remove('was-validated');
            [emailInput, phoneInput, password, confirm].forEach(el => {
                if (el) {
                    el.setCustomValidity("");
                    el.classList.remove('is-invalid');
                }
            });
            if (passwordFeedback) {
                passwordFeedback.textContent = 'Password must be at least 8 characters and include uppercase, lowercase, and a number.';
            }
            showError(registerError, '');
            if (switchesCard) switchesCard.classList.remove('disabled-section');
            switchItems.forEach(item => item.disabled = false);
        });
    }
})();
