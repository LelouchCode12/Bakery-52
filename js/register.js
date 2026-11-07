(function () {
    const form = document.getElementById('registrationForm');
    if (!form) return;

    const password = document.getElementById('password');
    const confirm = document.getElementById('confirmPassword');
    const successMessage = document.getElementById('successMessage');
    const preferCheckbox = document.getElementById('preferNotToSay');
    const switchesCard = document.getElementById('switchesCard');
    const switchItems = document.querySelectorAll('.switch-item');
    const resetBtn = document.getElementById('resetBtn');

    /* ============================================================================================================ */
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

    /* ============================================================================================================ */
    function validatePasswords() {
        if (!password || !confirm) return;
        if (password.value !== confirm.value) {
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

    /* ============================================================================================================ */
    form.addEventListener('submit', function (event) {
        validatePasswords();

        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.preventDefault();
            if (successMessage) {
                if (typeof jQuery !== 'undefined') {
                    $(successMessage).removeClass('d-none').hide().fadeIn(400);
                } else {
                    successMessage.classList.remove('d-none');
                }
            }
            form.classList.remove('was-validated');
            form.reset();
            if (switchesCard) switchesCard.classList.remove('disabled-section');
            switchItems.forEach(item => item.disabled = false);
            return;
        }

        form.classList.add('was-validated');
    }, false);

    /* ============================================================================================================ */
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            form.classList.remove('was-validated');
            if (confirm) {
                confirm.setCustomValidity("");
                confirm.classList.remove('is-invalid');
            }
            if (successMessage) {
                if (typeof jQuery !== 'undefined') {
                    $(successMessage).addClass('d-none');
                } else {
                    successMessage.classList.add('d-none');
                }
            }
            if (switchesCard) switchesCard.classList.remove('disabled-section');
            switchItems.forEach(item => item.disabled = false);
        });
    }
})();
