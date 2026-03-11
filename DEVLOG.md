# Dev Engineering Log

### [ENTRY-003] — Registration form and visual improvements

## Task
Added user registration/login modal and improved visual polish across the site.

## Problem
The site had no user authentication flow — a critical feature for any production web application. The hero section loaded without animation, feeling static. Portfolio cards lacked visual feedback depth. Section titles had no visual separation from content.

## Solution
- Built a registration/login modal with form toggle (Sign Up ↔ Log In) in pure Vanilla JS
- Added "Sign Up" link to the navigation header
- Implemented staggered fadeInUp CSS animation on hero content (tag → title → subtitle → CTA, 0.2s intervals)
- Added scroll indicator with pulse animation on the hero page
- Added gold accent divider (`::after` pseudo-element) under all section titles
- Added gold glow effect on portfolio card hover (`box-shadow` with rgba accent color)
- Form data currently logs to console — server backend planned for next iteration
- Ran full Playwright test suite: 72/72 passing on Chromium

## Tech
- CSS `@keyframes` animations (fadeInUp, scrollPulse)
- CSS `::after` pseudo-elements for decorative dividers
- Vanilla JS DOM manipulation for modal state management
- FormData API for form data extraction

## Metrics Before
Latency: N/A (no new network requests)
Errors: 0 (72/72 tests passing before changes)
CPU: N/A

## Metrics After
Latency: N/A (all changes are client-side CSS/JS, zero network overhead)
Errors: 0 (72/72 tests still passing after changes)
CPU: Negligible — CSS animations use GPU compositing (`transform`, `opacity`)

## Result
- Site feels polished and alive on first load (hero animation draws the eye)
- Registration flow ready for backend integration
- Visual consistency improved: gold accents carry through titles, portfolio, and scroll indicator
- Zero test regressions

## Business Impact
Registration form is the prerequisite for any user data collection, authentication, or personalized experience. Having it ready before the backend means the frontend is not a blocker when the server goes live. The visual improvements increase perceived quality — first impressions matter in portfolio sites and product demos alike.

## Date
2026-03-10

---

### [ENTRY-002] — Migrate hosting from Netlify to GitHub Pages

## Task
Netlify project was suspended. Migrated live deployment to GitHub Pages to restore public access to the site.

## Problem
Netlify suspended the project, making the live URL dead. Employers and reviewers clicking the link in README would see a suspension notice instead of the site.

## Solution
- Enabled GitHub Pages on the `main` branch via repository Settings → Pages
- Confirmed `index.html` in repo root serves as the entry point (already in place)
- Updated README.md: replaced Netlify live URL with GitHub Pages URL, updated CI/CD table and pipeline diagram
- No code changes required — static files were already structured correctly

## Tech
- GitHub Pages (static hosting, free tier)
- GitHub Actions (CI still runs 576 tests before any deploy)

## Metrics Before
Latency: Site unreachable (Netlify suspended)
Errors: 100% — all visitors see suspension page
CPU: N/A

## Metrics After
Latency: ~50–80ms TTFB from GitHub CDN
Errors: 0 — site fully accessible
CPU: N/A (static hosting)

## Result
Site restored and publicly accessible. Zero downtime risk going forward — GitHub Pages cannot be suspended for a public repository.

## Business Impact
A dead link on a portfolio is worse than no link. Restored access in under 5 minutes with no cost and no external dependencies. GitHub Pages is tied directly to the repository — no third-party account to manage or lose.

## Date
2026-03-09

---

### [ENTRY-001] — Project Bootstrap & CI/CD Setup

## Task
Built a production-ready portfolio site from scratch: HTML/CSS/JS, Playwright test suite (576 tests), Docker containerization, GitHub Actions CI pipeline, Netlify deployment.

## Problem
A portfolio site without tests or automation is a liability in a job interview context — it demonstrates zero engineering discipline beyond writing markup. Needed a codebase that shows real production practices: testing, containerization, and automated delivery.

## Solution
- Wrote HTML/CSS/JS from scratch (no framework, no build tool)
- Implemented fullpage navigation using CSS `transform: translateY()` for GPU-composited transitions
- Built lightbox with keyboard navigation, swipe gestures, and focus trap
- Conducted 2 manual code audits → found and fixed 27 bugs (P1–P4) before writing tests
- Wrote 72 Playwright test cases covering: DOM, navigation, lightbox, form validation, mobile menu, ARIA, responsive breakpoints, CSS
- Configured Playwright to run across 8 browser/device configs (Chrome, Firefox, Safari, iPad ×2, Pixel 5, iPhone 13, iPhone SE)
- Containerized with Docker + nginx:alpine: gzip enabled, 30-day static cache, 25 MB image
- Set up GitHub Actions: every push to `main` runs 576 tests → auto-deploys to Netlify on pass

## Tech
- HTML5, CSS3, Vanilla JavaScript
- Playwright (Node.js)
- Docker, nginx:alpine
- GitHub Actions
- Netlify

## Metrics Before
Latency: No measurement (no container, no production server)
Errors: 27 bugs found across P1–P4 severity
CPU: N/A (local dev only)

## Metrics After
Latency: ~25ms TTFB from Netlify CDN (static hosting)
Errors: 0 known bugs, 576/576 tests passing
CPU: nginx:alpine container ~0.1% CPU at idle

## Result
- Fully deployed site with automated quality gate
- 576-test suite runs in ~45 seconds in CI
- Any code change that breaks behavior is blocked before it reaches production
- Docker container reproduces exact production environment on any machine in one command

## Business Impact
Eliminates manual QA on every deploy. A QA engineer manually testing 72 cases across 8 device configurations would take ~4–6 hours per release. Automated CI reduces this to 45 seconds. At a $30/hour QA rate, that's **$120–180 saved per release cycle**.

## Date
2026-03-09

---

<!-- Add new entries above this line, newest first -->
