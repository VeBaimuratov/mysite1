# Dev Engineering Log

> This file tracks every significant engineering task on the project.
> Each entry is a structured report: problem → solution → metrics → business impact.
> Format kept consistent so any future employer or team member can audit the work history.

---

## How to fill a new entry

When starting a task, run:

```
Fill DEVLOG.md for the current task as an engineering report:
- problem
- solution
- commands used
- technologies
- metrics before
- metrics after
- result
- business impact
```

---

## Entry Template

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
