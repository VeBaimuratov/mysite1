# PARD Studio — Interior Design Portfolio Website

A production-grade portfolio website built from scratch: no frameworks, no boilerplate, fully tested, containerized, and deployed with CI/CD automation.

**Live:** [vebaimuratov.github.io/mysite1](https://vebaimuratov.github.io/mysite1/) &nbsp;|&nbsp; **CI:** ![CI](https://github.com/VeBaimuratov/mysite1/actions/workflows/ci.yml/badge.svg)

---

## What Was Built

A fullpage single-page application for an interior design studio — without React, Vue, or any UI framework. Every interaction was implemented manually in Vanilla JS and CSS.

| Layer | Technology | Why This Choice |
|-------|-----------|-----------------|
| Frontend | HTML5 + CSS3 + Vanilla JS | Zero runtime overhead, full control over behavior, no dependency risk |
| Transitions | CSS `transform: translateY()` | GPU-composited layer — no layout/paint reflow, 60fps guaranteed |
| Testing | Playwright | Cross-browser, headless, CI-native; single tool covers desktop + mobile + tablet |
| Container | Docker + nginx:alpine | 25 MB image, production-grade serving, reproducible across any environment |
| CI/CD | GitHub Actions → GitHub Pages | Free, zero-config deploy on green CI, hosted directly in the repository |

---

## Engineering Decisions & Rationale

### Why no framework?
A portfolio site has static content and no dynamic state management. Adding React would introduce ~40 KB of runtime JS, a build step, and an extra dependency surface — for zero functional benefit. Vanilla JS is the correct tool here.

### Why Playwright over Jest/Cypress?
Playwright runs the same test suite across Chrome, Firefox, and Safari in a single command. It covers desktop (1440px), tablet (iPad), and mobile (Pixel 5, iPhone 13, iPhone SE) — 8 browser configurations from one config file. Cypress would require separate mobile simulation tooling.

### Why Docker + nginx:alpine?
Eliminates "works on my machine" problems. The nginx:alpine image is 25 MB, has gzip enabled out of the box, and caches static assets for 30 days. Any developer or server can reproduce the exact production environment in one command.

### Why GitHub Actions + GitHub Pages?
Every push to `main` runs the full test suite on a clean Ubuntu server. GitHub Pages deploys automatically from the same repository — zero external services, zero cost, zero configuration drift.

---

## Features

- **Fullpage navigation** — GPU-accelerated `translateY` transitions, no janky scroll
- **Hero animations** — staggered fadeInUp entrance for title, subtitle, and CTA; scroll indicator with pulse animation
- **Lightbox** — project viewer with keyboard navigation, swipe gestures, and focus trap for accessibility
- **Registration / Login** — modal form with Sign Up ↔ Log In toggle, input validation, ESC/overlay close
- **Responsive** — 5 breakpoints: 360px → 480px → 768px → 1024px → 1440px
- **Accessible** — ARIA labels, roles, tabindex, full keyboard navigation
- **Contact form** — client-side regex validation (phone + email), success modal with reset
- **Cross-browser** — Chrome, Firefox, Safari (WebKit prefixes where needed)

---

## Testing: 576 Tests, 8 Configurations

```
72 test cases × 8 browser configs = 576 total tests
```

| Configuration | Viewport |
|--------------|---------|
| Chrome, Firefox, Safari | Desktop 1440px |
| iPad portrait / landscape | Tablet 768–1024px |
| Pixel 5, iPhone 13, iPhone SE | Mobile 360–390px |

**Coverage:** DOM structure, fullpage navigation, lightbox behavior, form validation, mobile menu, ARIA accessibility, responsive breakpoints, CSS correctness.

**2 manual code audits** were conducted before the automated suite was written. **27 bugs found and fixed** (classified P1–P4 by severity) before writing a single automated test.

```bash
npm install
npx playwright install
npm test
```

---

## CI/CD Pipeline

```
git push → GitHub Actions (Ubuntu) → install deps → install browsers → 576 tests
                                                                             ↓
                                                               ✅ pass → GitHub Pages deploys
                                                               ❌ fail → commit blocked
```

No manual deployment steps. No broken code reaches production.

---

## Run Locally with Docker

```bash
docker compose up -d --build
# Open: http://localhost:8080
```

nginx:alpine (~25 MB), gzip enabled, static assets cached 30 days.

---

## Business Value

| What | Impact |
|------|--------|
| 576 automated tests | Catches regressions in seconds, not hours of manual QA |
| CI/CD pipeline | Zero-touch deploys — no developer time spent on shipping |
| Docker containerization | Any environment reproduces production exactly — no onboarding friction |
| No framework dependencies | No version conflicts, no security patches, no upgrade treadmill |
| 2 audits + 27 bug fixes before automation | Clean baseline — tests validate correct behavior, not existing bugs |

A comparable setup at a company (QA engineer time + DevOps pipeline + container registry) would cost **$500–1500/month** in tooling and engineering overhead. This was built and configured as part of the project.

---

## Engineering Log

See [DEVLOG.md](DEVLOG.md) for detailed engineering decisions, metrics, and task-by-task technical reports.
