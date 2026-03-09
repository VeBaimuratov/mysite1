# PARD Studio — Interior Design Portfolio Website

A fully tested, containerized, and deployed portfolio website for an interior design studio.

**Live site:** [chic-valkyrie-e5fe5a.netlify.app](https://chic-valkyrie-e5fe5a.netlify.app/)
**CI status:** ![CI](https://github.com/VeBaimuratov/mysite1/actions/workflows/ci.yml/badge.svg)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JS |
| Testing | Playwright (576 tests, 8 browser configs) |
| Containerization | Docker + nginx:alpine |
| CI/CD | GitHub Actions → Netlify auto-deploy |

---

## Features

- **Fullpage navigation** — CSS `transform: translateY()` for GPU-accelerated transitions
- **Lightbox** — project viewer with keyboard navigation, swipe support, and focus trap
- **Responsive** — 5 breakpoints from 360px to 1440px
- **Accessible** — aria-labels, roles, tabindex, keyboard navigation throughout
- **Contact form** — client-side validation (regex for phone/email), success modal
- **Cross-browser** — Chrome, Firefox, Safari (including WebKit prefixes)

---

## Testing

72 tests × 8 configurations = **576 total**

| Configuration | Type |
|--------------|------|
| Chrome, Firefox, Safari | Desktop 1440px |
| iPad portrait / landscape | Tablet |
| Pixel 5, iPhone 13, iPhone SE | Mobile |

Test coverage: DOM structure, navigation, lightbox, form validation, mobile menu, accessibility, responsive breakpoints, CSS correctness.

```bash
npm install
npx playwright install
npm test
```

---

## CI/CD Pipeline

Every `git push` to `main` triggers GitHub Actions:

```
push → Ubuntu server → install deps → install browsers → 576 tests
                                                              ↓
                                                    ✅ pass → Netlify deploys
                                                    ❌ fail → commit marked red
```

---

## Run Locally with Docker

```bash
docker compose up -d --build
# → http://localhost:8080
```

nginx:alpine image (~25 MB), gzip enabled, static assets cached for 30 days.

---

## What Was Done

- Built a fullpage SPA from scratch without frameworks
- Conducted 2 manual code audits, found and fixed **27 bugs** (P1–P4)
- Wrote 72 automated Playwright tests covering the full feature set
- Containerized with Docker + nginx
- Set up CI/CD: GitHub Actions → Netlify
