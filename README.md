# PARD Studio — Interior Design Portfolio Website

My first learning project — a portfolio website for a fictional interior design studio.

**Live site:** [view on Netlify](https://chic-valkyrie-e5fe5a.netlify.app/)

---

## What Was Built

A static website in pure HTML, CSS, and JavaScript — no frameworks, no build tools.

5 pages with fullpage navigation:
- Home (hero section)
- About (two-column layout, stats, services)
- Portfolio (project grid with lightbox)
- Team (staff cards)
- Request form

---

## Tech Stack

- **HTML5, CSS3, Vanilla JS** — markup and logic
- **Playwright** — automated testing
- **Docker + nginx** — containerization
- **GitHub Actions** — CI pipeline (auto-runs tests on every push)
- **GitHub + Netlify** — code storage and deployment

---

## Testing

72 tests covering navigation, lightbox, form, mobile menu, and responsiveness.
Tests run across 8 configurations: Chrome, Firefox, Safari, iPad, iPhone, and more.

```
576 tests — all passing
```

```bash
npm install
npx playwright install
npm test
```

---

## CI/CD Pipeline

Every `git push` to `main` automatically:
1. Spins up a clean Ubuntu server on GitHub
2. Installs Node.js and project dependencies
3. Installs Playwright browsers (Chrome, Firefox, Safari)
4. Runs all 576 tests
5. Saves an HTML test report as an artifact (kept for 7 days)

If tests fail — the commit is marked red. If tests pass — Netlify auto-deploys.

---

## Run with Docker

```bash
docker compose up -d --build
# Site: http://localhost:8080
```

---

## What I Learned

- Building a responsive website from scratch (5 breakpoints — 360px to 1440px)
- CSS variables, grid, flexbox, transform, transition
- Vanilla JavaScript — navigation, animations, event handling, touch support
- Finding and fixing bugs (found and fixed 27 of them)
- Writing automated tests with Playwright
- Docker: Dockerfile, nginx, docker-compose
- Git and GitHub: commits, push, repository workflow
- Deploying to Netlify
- GitHub Actions: writing a CI pipeline from scratch
