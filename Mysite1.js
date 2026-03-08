// ===================== СТЕК СТРАНИЦ =====================
const pages    = Array.from(document.querySelectorAll('.page'));
const dots     = Array.from(document.querySelectorAll('.dot'));
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const header   = document.querySelector('.header');
const nav      = document.getElementById('nav');
const lightbox      = document.getElementById('lightbox');
const successModal  = document.getElementById('successModal');

const TOTAL     = pages.length;
const ANIM_MS   = 750;
let current     = 0;
let isAnimating = false;

const lightPages    = [1, 2, 3, 4];
const noScrollPages = [0];

window.goToPage = goToPage;
function goToPage(next) {
  if (isAnimating || next < 0 || next >= TOTAL || next === current) return;
  isAnimating = true;

  if (next > current) {
    pages[next].style.transform = 'translateY(0)';
  } else {
    // Instantly hide target page and all intermediate pages (no transition)
    pages[next].style.transition = 'none';
    pages[next].style.transform = 'translateY(0)';
    for (let i = next + 1; i < current; i++) {
      pages[i].style.transition = 'none';
      pages[i].style.transform = 'translateY(100%)';
    }
    pages[next].offsetHeight; // force reflow
    pages[next].style.transition = '';
    for (let i = next + 1; i < current; i++) {
      pages[i].style.transition = '';
    }
    pages[current].style.transform = 'translateY(100%)';
  }

  current = next;
  updateUI();

  setTimeout(() => {
    // Normalize all pages to consistent state
    for (let i = 1; i < TOTAL; i++) {
      const shouldBeVisible = i <= current;
      const targetTransform = shouldBeVisible ? 'translateY(0)' : 'translateY(100%)';
      if (pages[i].style.transform !== targetTransform) {
        pages[i].style.transition = 'none';
        pages[i].style.transform = targetTransform;
      }
    }
    pages[0].offsetHeight; // force reflow
    for (let i = 1; i < TOTAL; i++) {
      pages[i].style.transition = '';
    }
    isAnimating = false;
  }, ANIM_MS);
}

function updateUI() {
  dots.forEach((d, i) => d.classList.toggle('active', i === current));
  navLinks.forEach((l, i) => l.classList.toggle('active', i === current));
  header.classList.toggle('light', lightPages.includes(current));

  const isLight = lightPages.includes(current);
  dots.forEach(d => {
    if (d.classList.contains('active')) {
      d.style.background = isLight ? '#1a1a1a' : '#ffffff';
    } else {
      d.style.background = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
    }
  });
}

// ===================== СКРОЛЛ МЫШЬЮ =====================
let wheelBuffer = 0;
let lastWheelDir = 0;
const WHEEL_THRESHOLD = 80;

window.addEventListener('wheel', (e) => {
  if (isAnimating) return;
  if (lightbox.classList.contains('open')) return;
  if (current === TOTAL - 1 && e.deltaY > 0) { e.preventDefault(); return; } // last page — block forward scroll only

  const page     = pages[current];
  const noScroll = noScrollPages.includes(current);

  if (noScroll) e.preventDefault();

  const atBottom = noScroll || page.scrollTop + page.clientHeight >= page.scrollHeight - 4;
  const atTop    = noScroll || page.scrollTop <= 0;

  const dir = e.deltaY > 0 ? 1 : -1;
  if (dir !== lastWheelDir) {
    wheelBuffer = 0;
    lastWheelDir = dir;
  }

  if (e.deltaY > 0) {
    if (!atBottom) return;
    wheelBuffer += e.deltaY;
    if (wheelBuffer >= WHEEL_THRESHOLD) { wheelBuffer = 0; goToPage(current + 1); }
  } else {
    if (!atTop) return;
    wheelBuffer += e.deltaY;
    if (wheelBuffer <= -WHEEL_THRESHOLD) { wheelBuffer = 0; goToPage(current - 1); }
  }
}, { passive: false });

// ===================== КЛАВИАТУРА (unified) =====================
document.addEventListener('keydown', (e) => {
  // Success modal: ESC to close
  if (!successModal.classList.contains('hidden')) {
    if (e.key === 'Escape') closeModal();
    return;
  }

  // Lightbox controls + focus trap
  if (lightbox.classList.contains('open')) {
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  lbGoTo(lbCurrent - 1);
    if (e.key === 'ArrowRight') lbGoTo(lbCurrent + 1);

    if (e.key === 'Tab') {
      const focusable = lightbox.querySelectorAll('button');
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    return;
  }

  // Page navigation
  if (e.key === 'ArrowDown' || e.key === 'PageDown') goToPage(current + 1);
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   goToPage(current - 1);
});

// ===================== ТАЧ (МОБИЛЬНЫЙ) =====================
let touchStartY = 0;

window.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
  if (isAnimating) return;
  if (lightbox.classList.contains('open')) return;

  const dy = touchStartY - e.changedTouches[0].clientY;
  const page     = pages[current];
  const noScroll = noScrollPages.includes(current);
  const atBottom = noScroll || page.scrollTop + page.clientHeight >= page.scrollHeight - 4;
  const atTop    = noScroll || page.scrollTop <= 0;

  if (dy > 60 && atBottom && current < TOTAL - 1)  goToPage(current + 1);
  if (dy < -60 && atTop)                           goToPage(current - 1);
}, { passive: true });

// ===================== НАВИГАЦИЯ (КЛИКИ) =====================
document.querySelectorAll('[data-goto]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    goToPage(Number(el.dataset.goto));
    nav.classList.remove('open');
  });
  // Keyboard activation for dots and other non-link elements
  if (el.tagName !== 'A' && el.tagName !== 'BUTTON') {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToPage(Number(el.dataset.goto));
      }
    });
  }
});

document.getElementById('burger').addEventListener('click', () => {
  nav.classList.toggle('open');
});

// Close mobile menu on click outside
document.addEventListener('click', (e) => {
  if (
    nav.classList.contains('open') &&
    !nav.contains(e.target) &&
    !document.getElementById('burger').contains(e.target)
  ) {
    nav.classList.remove('open');
  }
});

// ===================== ДАННЫЕ ПОРТФОЛИО =====================
const portfolioData = [
  {
    title: 'Downtown Vancouver Condo',
    desc:  'Vancouver, BC · 1,290 sq ft · Contemporary Classic',
    img:   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=60',
  },
  {
    title: 'Lakehouse Retreat',
    desc:  'Muskoka, ON · 3,660 sq ft · Eco Style',
    img:   'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=200&q=60',
  },
  {
    title: 'Skyline Penthouse',
    desc:  'Toronto, ON · 2,150 sq ft · Minimalism',
    img:   'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=200&q=60',
  },
  {
    title: 'Oak & Pine Restaurant',
    desc:  'Montreal, QC · 3,010 sq ft · Japandi',
    img:   'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=60',
  },
];

// ===================== ЛАЙТБОКС =====================
const lbCloseBtn = document.getElementById('lbClose');
const lbPrev     = document.getElementById('lbPrev');
const lbNext     = document.getElementById('lbNext');
const lbImage    = document.getElementById('lbImage');
const lbTitle    = document.getElementById('lbTitle');
const lbDesc     = document.getElementById('lbDesc');
const lbCounter  = document.getElementById('lbCounter');
const lbThumbs   = document.getElementById('lbThumbs');

let lbCurrent = 0;

portfolioData.forEach((item, i) => {
  const thumb = document.createElement('img');
  thumb.className = 'lb-thumb';
  thumb.src = item.thumb;
  thumb.alt = item.title;
  thumb.addEventListener('click', () => lbGoTo(i));
  lbThumbs.appendChild(thumb);
});

function lbOpen(index) {
  lbCurrent = index;
  lightbox.classList.add('open');
  lbRender();
  lbCloseBtn.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
}

function lbGoTo(index) {
  lbCurrent = (index + portfolioData.length) % portfolioData.length;
  lbRender();
}

function lbRender() {
  const item = portfolioData[lbCurrent];
  lbImage.src = item.img;
  lbImage.alt = item.title;
  lbTitle.textContent   = item.title;
  lbDesc.textContent    = item.desc;
  lbCounter.textContent = `${lbCurrent + 1} / ${portfolioData.length}`;
  document.querySelectorAll('.lb-thumb').forEach((t, i) => {
    t.classList.toggle('active', i === lbCurrent);
  });
}

document.querySelectorAll('.portfolio-item').forEach(item => {
  item.addEventListener('click', () => lbOpen(Number(item.dataset.index)));
});

lbCloseBtn.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click',  () => lbGoTo(lbCurrent - 1));
lbNext.addEventListener('click',  () => lbGoTo(lbCurrent + 1));

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// ===================== ФОРМА =====================
document.getElementById('orderForm').addEventListener('submit', e => {
  e.preventDefault();
  successModal.classList.remove('hidden');
  e.target.reset();
});

function closeModal() {
  successModal.classList.add('hidden');
}

document.getElementById('closeModalBtn').addEventListener('click', closeModal);

// Close modal on overlay click
successModal.addEventListener('click', (e) => {
  if (e.target === successModal) closeModal();
});

// ===================== LIGHTBOX SWIPE (MOBILE) =====================
let lbTouchStartX = 0;
lightbox.addEventListener('touchstart', (e) => {
  lbTouchStartX = e.touches[0].clientX;
}, { passive: true });
lightbox.addEventListener('touchend', (e) => {
  const dx = lbTouchStartX - e.changedTouches[0].clientX;
  if (Math.abs(dx) > 50) lbGoTo(lbCurrent + (dx > 0 ? 1 : -1));
}, { passive: true });

// Init UI on page load (dots colour for page 0)
updateUI();
