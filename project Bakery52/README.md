# Bakery-52: Forms and Validation (Assignment #5)

**Topic:** Artisanal bakery and specialty coffee shop website
**Group:** MT-2504
**Live site:** https://lelouchcode12.github.io/Bakery-52/project%20Bakery52/

## Team

| Member | Contribution |
|---|---|
| Bakbolsyn Yertalgat | Contact form and HTML5 validation |
| Sabyrzhan Kenzhigarin | Bootstrap styling and validation feedback UI |
| Assanali Shaimurat | Registration form and custom JavaScript checks |
| Alikhan Yerzhanuly | Testing, documentation and deployment |

## How to open the forms

- Contact form: open `contact.html`
- Registration form: open `registration.html`
- Demo result page: `demo-result.html`

No backend or database is used. A valid submission only opens a static demonstration page or shows a demo success message.

## Forms overview

### Contact form
Fields: Name (text), Email (email), Message (textarea) and a Send Message button.

- `required` on all fields
- `type="email"` on the email input
- `minlength="2"` on the name input
- `minlength="10"` and `maxlength="500"` on the message textarea
- Every label is connected to its control with `for` and `id`
- Bootstrap classes: `form-label`, `form-control`, grid classes, `valid-feedback` and `invalid-feedback`, plus helper text

### Registration form

- First Name and Last Name: required, minimum 2 characters
- Email: required, email format
- Password and Confirm Password: required, minimum 8 characters. JavaScript checks that both values match and clears the error after correction
- Gender: optional radio group with "Prefer not to say", grouped with `fieldset` and `legend`
- Interests: optional checkboxes
- Country: required select with an empty default option
- Submit and Reset buttons. Reset clears the entered data and all validation feedback
- After valid input, a demonstration success message is shown

## Test results

| # | Case | Test input | Expected result | Actual result |
|---|---|---|---|---|
| 1 | Empty required fields | All fields left blank, Submit clicked | Submission is blocked and an error is shown | Form did not submit; the empty field was highlighted with an error message |
| 2 | Invalid email | `testemail.com` | Email error is shown | Submission blocked; the email field was marked invalid |
| 3 | Message too short | `Hello` (5 characters) | Rejected, minimum is 10 characters | Submission blocked with a minimum length message |
| 4 | Message too long | Text of 501+ characters | Rejected, maximum is 500 characters | Input was limited to 500 characters by `maxlength` |
| 5 | Password too short | `abc123` (6 characters) | Error: minimum 8 characters | Password field marked invalid; form did not submit |
| 6 | Passwords do not match | `Password1` and `Password2` | Error: passwords do not match; error disappears after correction | Mismatch error shown; it cleared when the values became equal |
| 7 | No country selected | Country left on the empty option | Error: select a country | Select field marked invalid; form did not submit |
| 8 | All required values valid | Valid sample data in every required field | Form is accepted and the success message or demo page appears | Success message was displayed |
| 9 | Reset after errors | Trigger errors, then click Reset | Fields and error styles are cleared | All fields were emptied and validation styles removed |
| 10 | Mobile layout | Screen width about 375 px | One-column layout | Fields were stacked in one column |
| 11 | Desktop layout | Screen width 992 px and above | Multi-column layout |