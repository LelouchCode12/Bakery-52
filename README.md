# Bakery-52: Bakery Website with jQuery, Forms and Validation

**Topic:** Artisanal bakery and specialty coffee shop website
**Group:** MT-2504
**Live site:** https://lelouchcode12.github.io/Bakery-52/
**Repository:** https://github.com/LelouchCode12/Bakery-52

## About the project

Bakery-52 is a multi-page website of an artisanal bakery and specialty coffee shop. It is built with HTML, CSS (Bootstrap for forms) and jQuery. User journey: Home, Services, Contact, Register and back to Home. The site has a light and dark theme, a product search with category filters, an FAQ accordion, a recommendations list and two validated forms. It is responsive for about 375 px, 768 px and 1440 px.

## Project structure

```
Bakery-52/
├── .gitignore
├── .vscode/    settings.json
├── index.html, services.html, about.html, contact.html, register.html, demo-result.html
├── README.md
├── css/        style.css, responsive.css, cssregister.css
├── js/         script.js, validation.js, register.js
└── images/     (including webp/)
```

## How to run

1. Clone the repository: `git clone https://github.com/LelouchCode12/Bakery-52.git`
2. Open `index.html` in a browser, or start a local server (for example the VS Code Live Server extension, port 5500).
4. An internet connection is needed for jQuery, Bootstrap and Google Fonts, which are loaded from a CDN.

## Deployment

The site is published with GitHub Pages. After the latest changes are pushed to the repository, the public link above shows the updated version.

## jQuery function map

| File | Function | What it does | Pages |
|---|---|---|---|
| `js/script.js` | `initWelcome()` | Side panel toggle, personalized greeting with error and success states, Enter key support | index |
| `js/script.js` | `initMenu()` | Opens and closes the site menu, closes on outside click and Escape, repositions on resize | all pages |
| `js/script.js` | `initTheme()` | Light and dark theme switch, saves the choice in `localStorage` | all pages |
| `js/script.js` | `initSearch()` | Live product search combined with category filter buttons, shows the result counter and "no results" message | index, services |
| `js/script.js` | `initRecommendations()` | Add and remove list items with fade animation, empty field validation, item counter and empty state | services |
| `js/script.js` | `initFaq()` | Accordion with `slideToggle`, only one open answer, `aria-expanded`, arrow keys, Home and End, status message | contact |
| `js/validation.js` | `checkName()`, `checkEmail()`, `checkMessage()` | Contact form validation with clear error messages, `preventDefault` and a demo success message | contact |
| `js/register.js` | submit and reset handlers | Registration form: password match check, demo success message with fade, reset | register |

Inline script in the `<head>` of every page applies the saved theme before the page is drawn, so there is no flash of the wrong theme.

## Team

| Member | Contribution |
|---|---|
| Bakbolsyn Yertalgat | Contact form and HTML5 validation |
| Sabyrzhan Kenzhigarin | Bootstrap styling and validation feedback UI |
| Assanali Shaimurat | Registration form and custom JavaScript checks |
| Alikhan Yerzhanuly | Testing, documentation and deployment |

## How to open the forms

- Contact form: open `contact.html`
- Registration form: open `register.html`
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