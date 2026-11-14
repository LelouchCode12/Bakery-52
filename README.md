# Bakery-52: Bakery Website with jQuery, Forms, Cart & Checkout Server

**Topic:** Artisanal bakery and specialty coffee shop website
**Group:** MT-2504
**Live site:** https://lelouchcode12.github.io/Bakery-52/
**Repository:** https://github.com/LelouchCode12/Bakery-52

## About the project

Bakery-52 is a multi-page website of an artisanal bakery and specialty coffee shop built with HTML, CSS (Bootstrap utilities on form/account pages), jQuery, vanilla JavaScript modules, and a lightweight Node.js backend (`server.js`). Key features include light and dark themes, a persistent shopping cart and checkout drawer, `localStorage`-based customer accounts and favorites, live menu search with category filters, a custom cake price estimator, an FAQ accordion, customer testimonials, and responsive layouts across mobile, tablet, and desktop breakpoints.

## Project structure

```text
Bakery-52/
├── .gitignore
├── README.md
├── server.js
├── index.html
├── services.html
├── about.html
├── contact.html
├── register.html
├── account.html
├── demo-result.html
├── 404.html
├── css/
│   ├── style.css
│   ├── home.css
│   ├── account.css
│   ├── cssregister.css
│   └── responsive.css
├── js/
│   ├── header-auth.js
│   ├── core.js
│   ├── snow-fall.js
│   ├── home.js
│   ├── services.js
│   ├── faq.js
│   ├── validation.js
│   ├── register.js
│   └── account.js
└── images/
    ├── catalog/
    ├── site/
    └── leaf.png
```

> Note: Runtime and local config files (`.env`, `orders.json`, `.DS_Store`, `.vscode/`) are excluded via `.gitignore`. `server.js` automatically creates an empty `orders.json` on startup if one does not already exist.

## How to run

1. Clone the repository: `git clone https://github.com/LelouchCode12/Bakery-52.git`
2. **With Node.js backend (recommended):** run `node server.js` from the project root and open `http://localhost:3000`. The server serves static assets, custom `404.html`, `POST /api/checkout`, and `GET /api/orders`. Optionally configure `PORT` and `STRIPE_SECRET_KEY` in `.env` (without a Stripe key, checkout runs in mock mode).
3. **Static preview:** open `index.html` via a static server (e.g., Live Server or GitHub Pages). When the Node backend is unavailable, checkout falls back to client-side demo order history in `localStorage`.
4. An internet connection is needed for Google Fonts, jQuery CDN, and Bootstrap CSS (`register.html`, `account.html`).

## Deployment

The static frontend is published with GitHub Pages. After pushing updated files to the repository, the public link above serves the latest static build.

## JavaScript module map

| File | Key functions / exports | What it does | Pages |
|---|---|---|---|
| `js/header-auth.js` | `BakeryHeaderAuth` (`getCurrentUser()`, `createAccountItem()`, `syncNavbar()`) | Synchronously renders the logged-in navbar account button before first paint | all pages |
| `js/core.js` | `initMenu()`, `initSamePageScroll()`, `initTheme()`, `initLeaves()`, `initCart()`, `BakeryAuth`, `initAccount()` | Site menu, smooth same-page scroll, light/dark theme toggle, leaf animation toggle, cart & checkout drawer, `localStorage` auth/orders, account dropdown sync | all pages |
| `js/snow-fall.js` | `<snow-fall>` Web Component | Autumn leaf particle overlay | all pages |
| `js/home.js` | `initWelcome()`, `initCarousel()`, `initTestimonials()` | Home side welcome panel, hero/product carousel, interactive testimonials slider & review form | `index.html` |
| `js/services.js` | `initSearch()`, `initRecommendations()`, `initCustomCakeForm()`, `initFavorites()` | Live menu search & category filters, recommendations list, custom cake calculator modal, favorites toggle | `services.html` |
| `js/faq.js` | `initFaq()` | Accessible FAQ accordion with `slideToggle`, `aria-expanded`, arrow keys, `Home`/`End`, status feedback | `contact.html` |
| `js/validation.js` | `checkName()`, `checkEmail()`, `checkMessage()` | Contact form validation with error feedback and redirect to `demo-result.html` | `contact.html` |
| `js/register.js` | `saveAccount()`, `showLoginMode()`, `validatePasswords()` | Registration & login form handling, phone mask, gender/orientation toggle switches, password match check, reset | `register.html` |
| `js/account.js` | Account IIFE (`render()`, profile/password/delete handlers) | Profile editing (including gender/orientation switches & avatar upload), password change, order history, favorites, account deletion | `account.html` |

An inline script in the `<head>` of every page also applies the saved `theme` before first paint to prevent theme flash.

## Team

| Member | Contribution |
|---|---|
| Bakbolsyn Yertalgat | Contact form and HTML5 validation |
| Sabyrzhan Kenzhigarin | Bootstrap styling and validation feedback UI |
| Assanali Shaimurat | Registration form and custom JavaScript checks |
| Alikhan Yerzhanuly | Testing, documentation and deployment |

## How to open the forms

- Contact form: open `contact.html`
- Registration & login form: open `register.html`
- Account dashboard: open `account.html` (redirects to `register.html` when signed out)
- Demo result page: `demo-result.html`

The contact form redirects to `demo-result.html` without backend storage; registration and profile state persist in browser `localStorage`, while cart checkout submits to `/api/checkout` when `server.js` is running.

## Forms overview

### Contact form
Fields: Name (text), Email (email), Message (textarea) and a Send Message button.

- `required` on all fields
- `type="email"` on the email input
- `minlength="2"` on the name input
- `minlength="10"` and `maxlength="500"` on the message textarea
- Every label is connected to its control with `for` and `id`
- Validation states: `form-control`, `valid-feedback` and `invalid-feedback`

### Registration form
- First Name and Last Name: required, minimum 2 characters
- Email: required email format
- Phone: optional masked phone input
- Password and Confirm Password: required, minimum 8 characters with live match validation
- Personal Details: optional `"Prefer not to say"` checkbox controlling Gender (`Male` / `Female`) and Orientation (`Straight` / `Gay`) toggle switches grouped with `fieldset` and `legend`
- Hobbies & Interests: optional checkboxes plus custom text input
- Country: required select with an empty default option
- Submit, Reset, and `"Log in"` mode toggle buttons

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
| 8 | All required values valid | Valid sample data in every required field | Form is accepted and the success message or demo page appears | Account created or demo page displayed |
| 9 | Reset after errors | Trigger errors, then click Reset | Fields and error styles are cleared | All fields were emptied and validation styles removed |
| 10 | Mobile layout | Screen width about 375 px | One-column layout | Fields were stacked in one column |
| 11 | Desktop layout | Screen width 992 px and above | Multi-column layout | Fields arranged in multiple columns |
