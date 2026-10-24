document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('contactemail');
    const messageInput = document.getElementById('message');

    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        let isValid = true;

        if (nameInput.value.trim().length >= 2) {
            nameInput.classList.remove('is-invalid');
            nameInput.classList.add('is-valid');
        } else {
            nameInput.classList.remove('is-valid');
            nameInput.classList.add('is-invalid');
            isValid = false;
        }

        if (emailInput.checkValidity() && emailInput.value.trim() !== '') {
            emailInput.classList.remove('is-invalid');
            emailInput.classList.add('is-valid');
        } else {
            emailInput.classList.remove('is-valid');
            emailInput.classList.add('is-invalid');
            isValid = false;
        }

        const messageLength = messageInput.value.trim().length;
        if (messageLength >= 10 && messageLength <= 500) {
            messageInput.classList.remove('is-invalid');
            messageInput.classList.add('is-valid');
        } else {
            messageInput.classList.remove('is-valid');
            messageInput.classList.add('is-invalid');
            isValid = false;
        }

        if (isValid) {
            form.submit();
        }
    });
});