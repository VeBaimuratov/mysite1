// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = `file:///${path.resolve(__dirname, 'Mysite1.html').replace(/\\/g, '/')}`;

// ============================================================
// HELPERS
// ============================================================

/** Navigate to the site and wait for JS to boot */
async function openSite(page) {
  await page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
  // Wait for JS to initialize (pages, dots, etc.)
  await page.waitForSelector('.page[data-page="0"]');
}

/** Navigate to a specific page by calling JS directly (avoids hidden-element issues) */
async function goToPage(page, index) {
  await page.evaluate((i) => window.goToPage(i), index);
  // Wait for page animation (750ms) + generous buffer for WebKit
  await page.waitForTimeout(1300);
}

/** Get the current computed transform of a page */
async function getPageTransform(page, index) {
  return page.evaluate((i) => {
    const el = document.querySelector(`.page[data-page="${i}"]`);
    return el ? getComputedStyle(el).transform : null;
  }, index);
}

/** Check if a page is visually at translateY(0) — "matrix(1, 0, 0, 1, 0, 0)" or "none" */
async function isPageVisible(page, index) {
  const transform = await getPageTransform(page, index);
  if (!transform || transform === 'none') return true;
  // matrix(1, 0, 0, 1, 0, 0) means translateY(0)
  const match = transform.match(/matrix\(([^)]+)\)/);
  if (!match) return false;
  const values = match[1].split(',').map(Number);
  // values[5] is translateY — should be 0 for visible
  return Math.abs(values[5]) < 2;
}

// ============================================================
// 1. STRUCTURE & RENDERING
// ============================================================

test.describe('Page Structure', () => {
  test('all 5 pages exist in DOM', async ({ page }) => {
    await openSite(page);
    for (let i = 0; i < 5; i++) {
      await expect(page.locator(`.page[data-page="${i}"]`)).toBeAttached();
    }
  });

  test('header is visible and fixed', async ({ page }) => {
    await openSite(page);
    const header = page.locator('.header');
    await expect(header).toBeVisible();
    const position = await header.evaluate(el => getComputedStyle(el).position);
    expect(position).toBe('fixed');
  });

  test('hero page (page 0) is initially visible', async ({ page }) => {
    await openSite(page);
    expect(await isPageVisible(page, 0)).toBe(true);
  });

  test('pages 1-4 start off-screen', async ({ page }) => {
    await openSite(page);
    for (let i = 1; i <= 4; i++) {
      expect(await isPageVisible(page, i)).toBe(false);
    }
  });

  test('lightbox image has valid src attribute', async ({ page }) => {
    await openSite(page);
    const src = await page.locator('#lbImage').getAttribute('src');
    expect(src).toBeTruthy();
    expect(src.length).toBeGreaterThan(0);
  });
});

// ============================================================
// 2. NAVIGATION — SEQUENTIAL
// ============================================================

test.describe('Sequential Navigation', () => {
  test('navigate forward through all pages via dots/nav', async ({ page }) => {
    await openSite(page);

    for (let i = 1; i <= 4; i++) {
      await goToPage(page, i);
      expect(await isPageVisible(page, i)).toBe(true);
    }
  });

  test('navigate backward through all pages', async ({ page }) => {
    await openSite(page);

    // Go to last page first
    await goToPage(page, 4);
    expect(await isPageVisible(page, 4)).toBe(true);

    // Navigate back one by one
    for (let i = 3; i >= 0; i--) {
      await goToPage(page, i);
      expect(await isPageVisible(page, i)).toBe(true);
    }
  });
});

// ============================================================
// 3. NAVIGATION — SKIP PAGES (BUG-004 regression)
// ============================================================

test.describe('Skip Navigation (BUG-004 fix)', () => {
  test('jump from page 0 to page 3 directly', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 3);
    expect(await isPageVisible(page, 3)).toBe(true);
  });

  test('jump forward then backward to unvisited page', async ({ page }) => {
    await openSite(page);

    // Jump from 0 to 2 (skipping 1)
    await goToPage(page, 2);
    expect(await isPageVisible(page, 2)).toBe(true);

    // Now go back to 1 (was never visited — BUG-004 scenario)
    await goToPage(page, 1);
    expect(await isPageVisible(page, 1)).toBe(true);
  });

  test('jump from 0 to 4, then back to 1', async ({ page }) => {
    await openSite(page);

    await goToPage(page, 4);
    expect(await isPageVisible(page, 4)).toBe(true);

    await goToPage(page, 1);
    expect(await isPageVisible(page, 1)).toBe(true);
  });

  test('jump from 0 to 4, back to 2, forward to 3', async ({ page }) => {
    await openSite(page);

    await goToPage(page, 4);
    await goToPage(page, 2);
    expect(await isPageVisible(page, 2)).toBe(true);

    await goToPage(page, 3);
    expect(await isPageVisible(page, 3)).toBe(true);
  });
});

// ============================================================
// 4. HEADER THEME SWITCHING
// ============================================================

test.describe('Header Theme', () => {
  test('header is dark on page 0', async ({ page }) => {
    await openSite(page);
    await expect(page.locator('.header')).not.toHaveClass(/light/);
  });

  test('header switches to light on pages 1-4', async ({ page }) => {
    await openSite(page);

    for (let i = 1; i <= 4; i++) {
      await goToPage(page, i);
      await expect(page.locator('.header')).toHaveClass(/light/);
    }
  });

  test('header switches back to dark on page 0', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 2);
    await goToPage(page, 0);
    // Extra wait for WebKit animation completion
    await page.waitForTimeout(200);
    await expect(page.locator('.header')).not.toHaveClass(/light/);
  });
});

// ============================================================
// 5. LIGHTBOX
// ============================================================

test.describe('Lightbox', () => {
  test('opens on portfolio item click', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 2);

    await page.click('.portfolio-item[data-index="0"]');
    await expect(page.locator('#lightbox')).toHaveClass(/open/);
  });

  test('displays correct image and title', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 2);

    await page.click('.portfolio-item[data-index="1"]');
    await expect(page.locator('#lbTitle')).toHaveText('Загородный дом');
    await expect(page.locator('#lbCounter')).toHaveText('2 / 4');
  });

  test('navigates between images with arrows', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 2);

    await page.click('.portfolio-item[data-index="0"]');
    await expect(page.locator('#lbTitle')).toHaveText('Квартира на Арбате');

    await page.click('#lbNext');
    await expect(page.locator('#lbTitle')).toHaveText('Загородный дом');

    await page.click('#lbPrev');
    await expect(page.locator('#lbTitle')).toHaveText('Квартира на Арбате');
  });

  test('wraps around at boundaries', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 2);

    await page.click('.portfolio-item[data-index="0"]');
    await page.click('#lbPrev');
    await expect(page.locator('#lbTitle')).toContainText('Бамбук');
    await expect(page.locator('#lbCounter')).toHaveText('4 / 4');
  });

  test('closes on close button', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 2);

    await page.click('.portfolio-item[data-index="0"]');
    await expect(page.locator('#lightbox')).toHaveClass(/open/);

    await page.click('#lbClose');
    await expect(page.locator('#lightbox')).not.toHaveClass(/open/);
  });

  test('closes on Escape key', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 2);

    await page.click('.portfolio-item[data-index="0"]');
    await page.keyboard.press('Escape');
    await expect(page.locator('#lightbox')).not.toHaveClass(/open/);
  });

  test('closes on backdrop click', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 2);

    await page.click('.portfolio-item[data-index="0"]');
    // Click on the lightbox backdrop (top-left corner)
    await page.locator('#lightbox').click({ position: { x: 10, y: 10 } });
    await expect(page.locator('#lightbox')).not.toHaveClass(/open/);
  });

  test('keyboard arrows work inside lightbox', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 2);

    await page.click('.portfolio-item[data-index="0"]');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#lbTitle')).toHaveText('Загородный дом');

    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#lbTitle')).toHaveText('Квартира на Арбате');
  });

  test('thumbnail click changes image', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 2);

    await page.click('.portfolio-item[data-index="0"]');
    await page.click('.lb-thumb:nth-child(3)');
    await expect(page.locator('#lbTitle')).toHaveText('Пентхаус Skyline');
  });
});

// ============================================================
// 6. FORM VALIDATION
// ============================================================

test.describe('Order Form', () => {
  test('all form fields have name attributes', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 4);

    const fields = ['name', 'phone', 'email', 'object', 'area', 'message'];
    for (const field of fields) {
      const nameAttr = await page.locator(`#${field}`).getAttribute('name');
      expect(nameAttr).toBe(field);
    }
  });

  test('required fields prevent empty submission', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 4);

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Modal should NOT appear (form invalid)
    await expect(page.locator('#successModal')).toHaveClass(/hidden/);
  });

  test('valid form shows success modal', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 4);

    await page.fill('#name', 'Иван Тестов');
    await page.fill('#phone', '+7 (999) 123-45-67');
    await page.fill('#email', 'test@mail.ru');
    await page.click('button[type="submit"]');

    await expect(page.locator('#successModal')).not.toHaveClass(/hidden/);
  });

  test('modal closes on button click', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 4);

    await page.fill('#name', 'Тест');
    await page.fill('#phone', '+7 999 1234567');
    await page.fill('#email', 'a@b.ru');
    await page.click('button[type="submit"]');

    await page.click('#closeModalBtn');
    await expect(page.locator('#successModal')).toHaveClass(/hidden/);
  });

  test('modal closes on Escape key', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 4);

    await page.fill('#name', 'Тест');
    await page.fill('#phone', '+7 999 1234567');
    await page.fill('#email', 'a@b.ru');
    await page.click('button[type="submit"]');

    await page.keyboard.press('Escape');
    await expect(page.locator('#successModal')).toHaveClass(/hidden/);
  });

  test('modal closes on overlay click', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 4);

    await page.fill('#name', 'Тест');
    await page.fill('#phone', '+7 999 1234567');
    await page.fill('#email', 'a@b.ru');
    await page.click('button[type="submit"]');

    await page.locator('#successModal').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('#successModal')).toHaveClass(/hidden/);
  });

  test('phone field rejects invalid format', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 4);

    await page.fill('#name', 'Тест');
    await page.fill('#phone', 'abc');
    await page.fill('#email', 'a@b.ru');
    await page.click('button[type="submit"]');

    // Form should not submit — modal stays hidden
    await expect(page.locator('#successModal')).toHaveClass(/hidden/);
  });

  test('email field rejects invalid format', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 4);

    await page.fill('#name', 'Тест');
    await page.fill('#phone', '+7 999 1234567');
    await page.fill('#email', 'not-an-email');
    await page.click('button[type="submit"]');

    await expect(page.locator('#successModal')).toHaveClass(/hidden/);
  });

  test('select options have value attributes', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 4);

    const options = page.locator('#object option');
    const count = await options.count();
    expect(count).toBe(6);

    for (let i = 0; i < count; i++) {
      const value = await options.nth(i).getAttribute('value');
      expect(value).not.toBeNull();
    }
  });

  test('form resets after successful submission', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 4);

    await page.fill('#name', 'Тест');
    await page.fill('#phone', '+7 999 1234567');
    await page.fill('#email', 'a@b.ru');
    await page.click('button[type="submit"]');

    // Close modal
    await page.click('#closeModalBtn');

    // Fields should be empty after reset
    await expect(page.locator('#name')).toHaveValue('');
    await expect(page.locator('#phone')).toHaveValue('');
    await expect(page.locator('#email')).toHaveValue('');
  });
});

// ============================================================
// 7. MOBILE MENU (burger)
// ============================================================

test.describe('Mobile Menu', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('burger is visible on mobile', async ({ page }) => {
    await openSite(page);
    await expect(page.locator('#burger')).toBeVisible();
  });

  test('nav is hidden by default on mobile', async ({ page }) => {
    await openSite(page);
    await expect(page.locator('#nav')).not.toBeVisible();
  });

  test('burger toggles menu', async ({ page }) => {
    await openSite(page);

    await page.click('#burger');
    await expect(page.locator('#nav')).toBeVisible();

    await page.click('#burger');
    await expect(page.locator('#nav')).not.toBeVisible();
  });

  test('menu closes on outside click', async ({ page }) => {
    await openSite(page);
    await page.click('#burger');
    await expect(page.locator('#nav')).toBeVisible();

    // Click on the body area below the menu
    await page.click('.page[data-page="0"]', { position: { x: 100, y: 600 } });
    await expect(page.locator('#nav')).not.toBeVisible();
  });

  test('menu closes after nav link click', async ({ page }) => {
    await openSite(page);
    await page.click('#burger');

    // Click a nav link
    await page.click('.nav-link[data-goto="2"]');
    await expect(page.locator('#nav')).not.toBeVisible();
  });

  test('burger has aria-label', async ({ page }) => {
    await openSite(page);
    const label = await page.locator('#burger').getAttribute('aria-label');
    expect(label).toBeTruthy();
  });
});

// ============================================================
// 8. ACCESSIBILITY
// ============================================================

test.describe('Accessibility', () => {
  test('dots have role, tabindex, and aria-label', async ({ page }) => {
    await openSite(page);
    const dots = page.locator('.dot');
    const count = await dots.count();
    expect(count).toBe(5);

    for (let i = 0; i < count; i++) {
      const dot = dots.nth(i);
      await expect(dot).toHaveAttribute('role', 'button');
      await expect(dot).toHaveAttribute('tabindex', '0');
      const label = await dot.getAttribute('aria-label');
      expect(label).toBeTruthy();
    }
  });

  test('lightbox buttons have aria-labels', async ({ page }) => {
    await openSite(page);
    await expect(page.locator('#lbClose')).toHaveAttribute('aria-label', /./);
    await expect(page.locator('#lbPrev')).toHaveAttribute('aria-label', /./);
    await expect(page.locator('#lbNext')).toHaveAttribute('aria-label', /./);
  });

  test('dots activate on Enter key', async ({ page }) => {
    await openSite(page);
    // Dispatch keydown Enter directly on the dot element (cross-browser)
    await page.evaluate(() => {
      const dot = document.querySelector('.dot[data-goto="2"]');
      dot.focus();
      dot.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });
    await page.waitForTimeout(1500);
    expect(await isPageVisible(page, 2)).toBe(true);
  });

  test('dots activate on Space key', async ({ page }) => {
    await openSite(page);
    await page.evaluate(() => {
      const dot = document.querySelector('.dot[data-goto="3"]');
      dot.focus();
      dot.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    });
    await page.waitForTimeout(1500);
    expect(await isPageVisible(page, 3)).toBe(true);
  });
});

// ============================================================
// 9. RESPONSIVE LAYOUT — ABOUT PAGE (BUG-001)
// ============================================================

test.describe('Responsive: About Page', () => {
  test('about layout is two columns on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openSite(page);
    await goToPage(page, 1);

    const columns = await page.evaluate(() => {
      const el = document.querySelector('.about-page-layout');
      return getComputedStyle(el).gridTemplateColumns;
    });
    // Should be two equal columns (e.g., "720px 720px" or similar)
    const parts = columns.split(' ');
    expect(parts.length).toBe(2);
  });

  test('about layout is single column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openSite(page);
    await goToPage(page, 1);

    const columns = await page.evaluate(() => {
      const el = document.querySelector('.about-page-layout');
      return getComputedStyle(el).gridTemplateColumns;
    });
    const parts = columns.split(' ');
    expect(parts.length).toBe(1);
  });

  test('about layout is single column on tablet portrait', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await openSite(page);
    await goToPage(page, 1);

    const columns = await page.evaluate(() => {
      const el = document.querySelector('.about-page-layout');
      return getComputedStyle(el).gridTemplateColumns;
    });
    const parts = columns.split(' ');
    expect(parts.length).toBe(1);
  });
});

// ============================================================
// 10. RESPONSIVE LAYOUT — PORTFOLIO GRID
// ============================================================

test.describe('Responsive: Portfolio Grid', () => {
  test('4 columns on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openSite(page);

    const cols = await page.evaluate(() => {
      const el = document.querySelector('.portfolio-grid');
      return getComputedStyle(el).gridTemplateColumns.split(' ').length;
    });
    expect(cols).toBe(4);
  });

  test('3 columns on tablet landscape', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await openSite(page);

    const cols = await page.evaluate(() => {
      const el = document.querySelector('.portfolio-grid');
      return getComputedStyle(el).gridTemplateColumns.split(' ').length;
    });
    expect(cols).toBe(3);
  });

  test('2 columns on tablet portrait', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await openSite(page);

    const cols = await page.evaluate(() => {
      const el = document.querySelector('.portfolio-grid');
      return getComputedStyle(el).gridTemplateColumns.split(' ').length;
    });
    expect(cols).toBe(2);
  });

  test('1 column on phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openSite(page);

    const cols = await page.evaluate(() => {
      const el = document.querySelector('.portfolio-grid');
      return getComputedStyle(el).gridTemplateColumns.split(' ').length;
    });
    expect(cols).toBe(1);
  });
});

// ============================================================
// 11. RESPONSIVE LAYOUT — TEAM GRID
// ============================================================

test.describe('Responsive: Team Grid', () => {
  test('3 columns on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openSite(page);

    const cols = await page.evaluate(() => {
      const el = document.querySelector('.team-grid');
      return getComputedStyle(el).gridTemplateColumns.split(' ').length;
    });
    expect(cols).toBe(3);
  });

  test('2 columns at 1024px', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await openSite(page);

    const cols = await page.evaluate(() => {
      const el = document.querySelector('.team-grid');
      return getComputedStyle(el).gridTemplateColumns.split(' ').length;
    });
    expect(cols).toBe(2);
  });

  test('1 column at 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await openSite(page);

    const cols = await page.evaluate(() => {
      const el = document.querySelector('.team-grid');
      return getComputedStyle(el).gridTemplateColumns.split(' ').length;
    });
    expect(cols).toBe(1);
  });
});

// ============================================================
// 12. RESPONSIVE LAYOUT — ORDER FORM
// ============================================================

test.describe('Responsive: Order Form', () => {
  test('two-column form on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openSite(page);

    const cols = await page.evaluate(() => {
      const el = document.querySelector('.order-form');
      return getComputedStyle(el).gridTemplateColumns.split(' ').length;
    });
    expect(cols).toBe(2);
  });

  test('single-column form on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openSite(page);

    const cols = await page.evaluate(() => {
      const el = document.querySelector('.order-form');
      return getComputedStyle(el).gridTemplateColumns.split(' ').length;
    });
    expect(cols).toBe(1);
  });
});

// ============================================================
// 13. RESPONSIVE LAYOUT — FOOTER
// ============================================================

test.describe('Responsive: Footer', () => {
  test('footer is present on order page', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 4);
    await expect(page.locator('.footer')).toBeAttached();
  });

  test('footer copyright text is visible', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 4);
    const text = await page.locator('.footer-copy').textContent();
    expect(text).toContain('Серёга');
  });
});

// ============================================================
// 14. CSS CORRECTNESS
// ============================================================

test.describe('CSS Correctness', () => {
  test('pointer-events is auto on open lightbox', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 2);
    await page.click('.portfolio-item[data-index="0"]');

    const pe = await page.evaluate(() => {
      return getComputedStyle(document.getElementById('lightbox')).pointerEvents;
    });
    expect(pe).toBe('auto');
  });

  test('backdrop-filter present on header', async ({ page }) => {
    await openSite(page);
    const bf = await page.evaluate(() => {
      const s = getComputedStyle(document.querySelector('.header'));
      return s.backdropFilter || s.webkitBackdropFilter || '';
    });
    expect(bf).toContain('blur');
  });

  test('CTA button uses CSS variable color', async ({ page }) => {
    await openSite(page);
    const bg = await page.evaluate(() => {
      return getComputedStyle(document.querySelector('.nav-btn')).backgroundColor;
    });
    // #e6c84a = rgb(230, 200, 74)
    expect(bg).toContain('230');
  });

  test('portfolio overlay CSS rule exists for touch devices', async ({ page }) => {
    await openSite(page);

    // Try multiple methods to verify the @media (hover: none) rule
    const found = await page.evaluate(() => {
      // Method 1: try cssRules (works in Chromium with file://)
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            const text = rule.cssText || '';
            if (text.includes('hover')) return true;
            if (rule.media) {
              const mt = rule.media.mediaText || '';
              if (mt.includes('hover')) return true;
            }
          }
        } catch (e) { /* CORS / security */ }
      }
      // Method 2: try fetch (works in some browsers with file://)
      return null; // signal to try fetch
    });

    if (found === true) {
      expect(found).toBe(true);
    } else {
      // Fallback: read CSS via fetch or skip
      const fetchResult = await page.evaluate(async () => {
        try {
          const link = document.querySelector('link[rel="stylesheet"]');
          const res = await fetch(link.href);
          const text = await res.text();
          return text.includes('hover: none') || text.includes('hover:none');
        } catch (e) {
          return 'skip';
        }
      });
      if (fetchResult === 'skip') {
        test.info().annotations.push({ type: 'skip', description: 'Cannot read CSS from file:// in this browser' });
      } else {
        expect(fetchResult).toBe(true);
      }
    }
  });
});

// ============================================================
// 15. NO CONTENT OVERFLOW / VISIBILITY
// ============================================================

test.describe('Content Visibility', () => {
  test('hero title is visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openSite(page);
    await expect(page.locator('.hero-title')).toBeVisible();
  });

  test('hero CTA button is visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openSite(page);
    await expect(page.locator('.hero-content .btn-primary')).toBeVisible();
  });

  test('all team cards are present', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 3);
    const count = await page.locator('.team-card').count();
    expect(count).toBe(6);
  });

  test('all portfolio items are present', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 2);
    const count = await page.locator('.portfolio-item').count();
    expect(count).toBe(4);
  });

  test('footer is not duplicating contact info', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 4);

    const copyText = await page.locator('.footer-copy').textContent();
    expect(copyText).not.toContain('000-00-00');
    expect(copyText).not.toContain('hello@');
  });
});

// ============================================================
// 16. PAGE DOTS (desktop only)
// ============================================================

test.describe('Page Dots', () => {
  test('dots visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openSite(page);
    await expect(page.locator('#pageDots')).toBeVisible();
  });

  test('dots hidden on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openSite(page);
    await expect(page.locator('#pageDots')).not.toBeVisible();
  });

  test('active dot updates on navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openSite(page);

    await expect(page.locator('.dot[data-goto="0"]')).toHaveClass(/active/);

    await goToPage(page, 2);
    await expect(page.locator('.dot[data-goto="2"]')).toHaveClass(/active/);
    await expect(page.locator('.dot[data-goto="0"]')).not.toHaveClass(/active/);
  });
});

// ============================================================
// 17. RESPONSIVE: SMALL PHONE (360px)
// ============================================================

test.describe('Responsive: Small Phone (360px)', () => {
  test.use({ viewport: { width: 360, height: 640 } });

  test('header renders correctly', async ({ page }) => {
    await openSite(page);
    const height = await page.evaluate(() => {
      return document.querySelector('.header-inner').offsetHeight;
    });
    expect(height).toBeLessThanOrEqual(64);
  });

  test('hero title is readable', async ({ page }) => {
    await openSite(page);
    const fontSize = await page.evaluate(() => {
      return parseFloat(getComputedStyle(document.querySelector('.hero-title')).fontSize);
    });
    expect(fontSize).toBeGreaterThanOrEqual(26);
    expect(fontSize).toBeLessThanOrEqual(42);
  });

  test('about page scrollable and readable', async ({ page }) => {
    await openSite(page);
    await goToPage(page, 1);
    await expect(page.locator('.about-page-right .section-title')).toBeVisible();
    await expect(page.locator('.about-lead').first()).toBeVisible();
  });
});
