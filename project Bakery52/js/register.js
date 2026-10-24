        const form = document.getElementById('registrationForm');
        const password = document.getElementById('password');
        const confirm = document.getElementById('confirmPassword');
        const successMessage = document.getElementById('successMessage');
        
        const preferCheckbox = document.getElementById('preferNotToSay');
        const switchesCard = document.getElementById('switchesCard');
        const switchItems = document.querySelectorAll('.switch-item');

        preferCheckbox.addEventListener('change', function() {
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

        function validatePasswords() {
            if (password.value !== confirm.value) {
                confirm.setCustomValidity("Passwords do not match.");
                confirm.classList.add('is-invalid');
            } else {
                confirm.setCustomValidity("");
                confirm.classList.remove('is-invalid');
            }
        }

        password.addEventListener('input', validatePasswords);
        confirm.addEventListener('input', validatePasswords);

        form.addEventListener('submit', function (event) {
            validatePasswords();

            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                event.preventDefault();
                successMessage.classList.remove('d-none');
                form.classList.remove('was-validated');
                form.reset();
                switchesCard.classList.remove('disabled-section');
                switchItems.forEach(item => item.disabled = false);
                return;
            }

            form.classList.add('was-validated');
        }, false);

        document.getElementById('resetBtn').addEventListener('click', function () {
            form.classList.remove('was-validated');
            confirm.setCustomValidity("");
            confirm.classList.remove('is-invalid');
            successMessage.classList.add('d-none');
            switchesCard.classList.remove('disabled-section');
            switchItems.forEach(item => item.disabled = false);
        });