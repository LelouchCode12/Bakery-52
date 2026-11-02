$(function () {
    const $form = $('form');
    const $nameInput = $('#name');
    const $emailInput = $('#contactemail');
    const $messageInput = $('#message');
    const $success = $('#formSuccess');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!$form.length) return;

    const setState = ($field, error) => {
        $field.toggleClass('is-valid', !error).toggleClass('is-invalid', !!error);
        $field.siblings('.invalid-feedback').text(error);
        return !error;
    };

    const checkName = () => {
        const value = $nameInput.val().trim();
        if (value === '') return setState($nameInput, 'Please enter your name.');
        if (value.length < 2) return setState($nameInput, 'Name must be at least 2 characters long.');
        return setState($nameInput, '');
    };

    const checkEmail = () => {
        const value = $emailInput.val().trim();
        if (value === '') return setState($emailInput, 'Please enter your email.');
        if (!emailPattern.test(value)) return setState($emailInput, 'Please enter a valid email address, e.g. name@example.com.');
        return setState($emailInput, '');
    };

    const checkMessage = () => {
        const value = $messageInput.val().trim();
        if (value === '') return setState($messageInput, 'Please enter your message.');
        if (value.length < 10) return setState($messageInput, 'Message must be at least 10 characters long.');
        if (value.length > 500) return setState($messageInput, 'Message must not be longer than 500 characters.');
        return setState($messageInput, '');
    };

    $nameInput.on('input', () => $nameInput.hasClass('is-invalid') && checkName());
    $emailInput.on('input', () => $emailInput.hasClass('is-invalid') && checkEmail());
    $messageInput.on('input', () => $messageInput.hasClass('is-invalid') && checkMessage());

    $form.on('submit', function (event) {
        event.preventDefault();

        const results = [checkName(), checkEmail(), checkMessage()];
        const isValid = results.every(Boolean);

        if (isValid) {
            $form[0].reset();
            $form.find('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
            $success.stop(true, true).removeClass('d-none').hide().fadeIn(400);
        } else {
            $success.stop(true, true).addClass('d-none');
            $form.find('.is-invalid').first().trigger('focus');
        }
    });
});
