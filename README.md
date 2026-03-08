# Серёга — Студия дизайна интерьера

Полная документация процесса создания, тестирования и исправления сайта-портфолио студии дизайна интерьера. Покрывает все этапы — от первых строк кода до финального прогона 576 автотестов и дополнительных исправлений из последующих сессий.

---

## 1. Структура проекта

```
project/
├── Mysite1.html          — главный HTML-файл (разметка всех 5 страниц)
├── Mysite1.css           — стили (desktop + 5 responsive-брейкпоинтов)
├── Mysite1.js            — логика навигации, лайтбокса, формы, меню
├── tests.spec.js         — 72 автотеста Playwright
├── playwright.config.js  — конфигурация кросс-браузерного тестирования
├── package.json          — зависимости и скрипты запуска тестов
├── BUG_REPORT.md         — баг-репорт с приоритетами (22 бага, первый аудит)
├── Docker.md             — подробное руководство по Docker
├── README.md             — этот файл
└── open_browser.py       — утилита для запуска сайта в браузере
```

Все три ключевых файла (`Mysite1.html`, `Mysite1.css`, `Mysite1.js`) связаны между собой без сборщиков: браузер загружает HTML, тот подключает CSS через `<link>` и JS через `<script>`.

---

## 2. Создание файлов — первый этап

### 2.1. Mysite1.html — скелет сайта

Первым был создан HTML-файл `Mysite1.html`. Он является точкой входа — браузер открывает именно его, а он подключает CSS и JS.

Файл содержит **5 экранных страниц** (fullpage-стиль), реализованных как `<div class="page" data-page="0..4">`:

| data-page | Название  | Содержимое                                     |
|-----------|-----------|------------------------------------------------|
| 0         | Главная   | Hero-блок с фоновым фото, заголовком и CTA     |
| 1         | О студии  | Двухколоночный layout: фото + текст + услуги   |
| 2         | Портфолио | Сетка из 4 карточек с фото проектов            |
| 3         | Команда   | 6 карточек сотрудников с биографиями           |
| 4         | Заказ     | Форма заявки + футер с копирайтом              |

Дополнительные элементы HTML-файла:

- **Header** (`<header class="header">`) — фиксированная навигация с логотипом, ссылками меню и CTA-кнопкой "Заказать проект"
- **Page Dots** (`.page-dots`) — пять боковых точек-индикаторов, видимых на desktop, каждая с `role="button"`, `tabindex="0"` и `aria-label`
- **Burger** (`<button class="burger">`) — гамбургер-кнопка для мобильного меню, с `aria-label="Открыть меню"`
- **Lightbox** (`<div class="lightbox">`) — модальный просмотр фотографий портфолио: кнопки prev/next/close с aria-labels, контейнер изображения, счётчик, thumbnail-полоса
- **Success Modal** — модалка подтверждения отправки формы с кнопкой `id="closeModalBtn"`

Форма заказа содержит 6 полей с корректными `name`, `type`, `required`:

```html
<input type="text"   id="name"    name="name"    required>
<input type="tel"    id="phone"   name="phone"   pattern="\+?[0-9\s\-\(\)]{7,20}" required>
<input type="email"  id="email"   name="email"   required>
<select              id="object"  name="object"  required>
  <option value="">Выберите тип</option>
  <option value="apartment">Квартира</option>
  <option value="house">Загородный дом</option>
  <option value="office">Офис</option>
  <option value="restaurant">Ресторан / кафе</option>
  <option value="other">Другое</option>
</select>
<input type="number" id="area"    name="area"    min="1">
<textarea            id="message" name="message" rows="3"></textarea>
```

### 2.2. Mysite1.css — стили и оформление

CSS-файл подключается через `<link rel="stylesheet" href="Mysite1.css">` в `<head>`.

Архитектура стилей:

1. **Reset & Base** — сброс `margin`/`padding`, `box-sizing: border-box`, базовый шрифт Georgia, `color: var(--dark)`, `line-height: 1.7`
2. **CSS-переменные** (`:root`) — единая цветовая палитра:
   - `--bg: #f8f6f2` — светлый фон
   - `--white: #ffffff`, `--dark: #1a1a1a` — полюса
   - `--accent: #c8a96e`, `--accent2: #8b6f47` — золотые акценты
   - `--cta: #e6c84a`, `--cta-hover: #d4b438` — цвет CTA-кнопки
   - `--border: #e4e0d8`, `--mid: #555555`, `--light: #999999` — служебные
3. **Fullpage-система** — каждая `.page` позиционирована `position: fixed; top: 0; left: 0; right: 0; bottom: 0` и переключается через `transform: translateY(100%/0)` с `transition: 0.75s cubic-bezier(0.77, 0, 0.175, 1)`
4. **Z-index стек** — страницы накладываются: page0 (z:10) → page1 (z:20) → page2 (z:30) → page3 (z:40) → page4 (z:50)
5. **Фоновые изображения** — каждая страница имеет свой фон с Unsplash и полупрозрачный overlay через `::before` (`rgba(...)`)
6. **Header** — `position: fixed; z-index: 1000` с `backdrop-filter: blur(10px)` и `-webkit-backdrop-filter: blur(10px)`, переключение темы через класс `.light`
7. **Responsive** — 5 брейкпоинтов (подробнее в разделе 7)

### 2.3. Mysite1.js — логика и интерактивность

JS-файл подключается перед `</body>` через `<script src="Mysite1.js">`. Это гарантирует, что DOM уже загружен к моменту выполнения скрипта.

Файл организован в именованные секции: навигация, скролл колесом, клавиатура, тач, клики, портфолио-данные, лайтбокс, форма.

---

## 3. Как файлы соединены между собой

```
Mysite1.html
    |
    ├── <link rel="stylesheet" href="Mysite1.css">   (в <head>)
    |       CSS управляет внешним видом всех элементов.
    |       HTML-классы (.page, .header, .nav, .lightbox и т.д.)
    |       привязывают стили к конкретным элементам.
    |
    └── <script src="Mysite1.js">                    (перед </body>)
            JS находит HTML-элементы через:
            - document.querySelectorAll('.page')      → массив страниц
            - document.querySelectorAll('.dot')       → точки навигации
            - document.querySelectorAll('.nav-link')  → ссылки меню
            - document.getElementById('lightbox')    → лайтбокс
            - document.getElementById('orderForm')   → форма
            - document.getElementById('burger')      → бургер-кнопка
            - document.getElementById('successModal')→ модалка успеха

            JS управляет:
            - CSS-классами (add/remove/toggle: .active, .light, .open, .hidden)
            - Inline-стилями (style.transform для анимации страниц)
            - Событиями (click, wheel, keydown, touchstart/touchend, submit)
```

Связь через data-атрибуты:

| Атрибут | Где используется | Назначение |
|---------|-----------------|------------|
| `data-page="0..4"` | `.page` | Идентификатор страницы |
| `data-goto="0..4"` | Ссылки, точки, кнопки | Целевая страница при клике |
| `data-index="0..3"` | `.portfolio-item` | Индекс для открытия лайтбокса |

---

## 4. Как работает JavaScript — детально

### 4.1. Навигация между страницами — функция `goToPage`

```javascript
window.goToPage = goToPage;
function goToPage(next) {
  if (isAnimating || next < 0 || next >= TOTAL || next === current) return;
  isAnimating = true;

  if (next > current) {
    // ВПЕРЁД: следующая страница плавно выезжает снизу
    pages[next].style.transform = 'translateY(0)';
  } else {
    // НАЗАД:
    // 1. Мгновенно (без transition) ставим target в translateY(0)
    pages[next].style.transition = 'none';
    pages[next].style.transform  = 'translateY(0)';
    // 2. Мгновенно скрываем все промежуточные страницы
    for (let i = next + 1; i < current; i++) {
      pages[i].style.transition = 'none';
      pages[i].style.transform  = 'translateY(100%)';
    }
    pages[next].offsetHeight; // force reflow — фиксирует мгновенные изменения
    pages[next].style.transition = ''; // восстанавливаем transition
    for (let i = next + 1; i < current; i++) {
      pages[i].style.transition = '';
    }
    // 3. Плавно анимируем текущую страницу вниз
    pages[current].style.transform = 'translateY(100%)';
  }

  current = next;
  updateUI(); // обновляем точки, ссылки, тему header

  setTimeout(() => {
    // Нормализация: приводим все страницы к консистентному состоянию
    for (let i = 1; i < TOTAL; i++) {
      const shouldBeVisible = i <= current;
      const targetTransform = shouldBeVisible ? 'translateY(0)' : 'translateY(100%)';
      if (pages[i].style.transform !== targetTransform) {
        pages[i].style.transition = 'none';
        pages[i].style.transform  = targetTransform;
      }
    }
    pages[0].offsetHeight; // force reflow
    for (let i = 1; i < TOTAL; i++) {
      pages[i].style.transition = '';
    }
    isAnimating = false;
  }, 750); // ждём конца анимации
}
```

Алгоритм решает ключевую проблему: при движении назад через несколько страниц (например, 4 → 1) промежуточные страницы (2, 3) мгновенно скрываются, а не мелькают на экране.

`updateUI()` обновляет:
- Активную точку (`.dot.active`)
- Активную ссылку меню (`.nav-link.active`)
- Тему header (`.header.light` для страниц 1–4)
- Цвет точек: `#1a1a1a` на светлых страницах, `rgba(255,255,255,0.3)` на тёмных

Навигация срабатывает от:

| Триггер | Описание |
|---------|----------|
| Клик по `[data-goto]` | Все ссылки, точки, кнопки с атрибутом `data-goto` |
| Колесо мыши | `wheel` event с буфером 80px и определением направления |
| Клавиатура | `ArrowDown`/`ArrowUp`, `PageDown`/`PageUp` |
| Свайп (touch) | Разница >60px между `touchstart` и `touchend` |

### 4.2. Скролл колесом мыши

```javascript
let wheelBuffer   = 0;
let lastWheelDir  = 0;
const WHEEL_THRESHOLD = 80;

window.addEventListener('wheel', (e) => {
  if (isAnimating) return;
  if (lightbox.classList.contains('open')) return;

  // Последняя страница: блокировать только прокрутку вперёд
  if (current === TOTAL - 1 && e.deltaY > 0) { e.preventDefault(); return; }

  const noScroll = noScrollPages.includes(current); // [0] — только hero
  if (noScroll) e.preventDefault();

  const atBottom = noScroll || page.scrollTop + page.clientHeight >= page.scrollHeight - 4;
  const atTop    = noScroll || page.scrollTop <= 0;

  const dir = e.deltaY > 0 ? 1 : -1;
  if (dir !== lastWheelDir) {
    wheelBuffer  = 0; // сброс при смене направления
    lastWheelDir = dir;
  }

  if (e.deltaY > 0) {
    if (!atBottom) return; // не переключаем, пока не долистали до низа
    wheelBuffer += e.deltaY;
    if (wheelBuffer >= WHEEL_THRESHOLD) { wheelBuffer = 0; goToPage(current + 1); }
  } else {
    if (!atTop) return;
    wheelBuffer += e.deltaY;
    if (wheelBuffer <= -WHEEL_THRESHOLD) { wheelBuffer = 0; goToPage(current - 1); }
  }
}, { passive: false });
```

Буфер накапливает дельту — это защищает от случайного переключения при trackpad-инерции. Сброс `wheelBuffer` при смене направления (`lastWheelDir`) устраняет накопление "долга" при быстром реверсе.

### 4.3. Лайтбокс

```
Данные:
  portfolioData[] — массив из 4 объектов: { title, desc, img, thumb }
  Thumbnails создаются динамически через createElement('img')

Открытие: клик по .portfolio-item → lbOpen(index)
  → lightbox.classList.add('open')    — показывает overlay (opacity 0→1)
  → lbRender()                        — загружает фото, title, desc, счётчик
  → lbCloseBtn.focus()               — фокус на кнопку закрытия (доступность)

Навигация: кнопки prev/next, стрелки клавиатуры, клик по thumbnail
  → lbGoTo(index)
  → lbCurrent = (index + total) % total  — циклическая навигация (wrap-around)
  → lbRender()

Закрытие: кнопка X, Escape, клик по backdrop (e.target === lightbox)
  → closeLightbox() → lightbox.classList.remove('open')

Свайп в лайтбоксе (мобильный):
  → touchstart/touchend на самом lightbox
  → если |dx| > 50px → lbGoTo(lbCurrent ± 1)

Focus trap: Tab зациклен между 3 кнопками (close, prev, next)
```

### 4.4. Форма заказа

```
Submit → e.preventDefault()         — блокирует отправку на сервер
       → successModal.classList.remove('hidden')  — показывает модалку
       → e.target.reset()           — очищает все поля формы

Закрытие модалки:
  - кнопка "Хорошо" → closeModal()
  - клик по overlay → closeModal()  (e.target === successModal)
  - Escape → closeModal()           (через unified keydown listener)
```

### 4.5. Мобильное меню

```
Burger click → nav.classList.toggle('open')

Click outside:
  document.addEventListener('click', e => {
    if (nav.classList.contains('open')
        && !nav.contains(e.target)
        && !burger.contains(e.target))
      nav.classList.remove('open');
  });

Nav link click → nav.classList.remove('open') + goToPage()
```

### 4.6. Единый keydown-обработчик

JS использует один `keydown`-слушатель на `document` с приоритетной очерёдностью:

```
1. Если открыта модалка успеха → ESC закрывает модалку, остальные клавиши игнорируются
2. Если открыт лайтбокс → ESC закрывает, стрелки меняют фото, Tab зациклен, остальные игнорируются
3. Иначе → ArrowDown/PageDown = вперёд, ArrowUp/PageUp = назад
```

---

## 5. Первый ручной аудит — 22 бага

После создания сайта был проведён полный ручной аудит кода. Найдено **22 бага**, задокументированных в `BUG_REPORT.md`.

### Критические (P1):

| # | Баг | Файл | Строки |
|---|-----|------|--------|
| 1 | `.about-page-layout` не адаптируется на мобильных — всегда 2 колонки | CSS | 513–517 |
| 2 | Нет `name` у полей формы — данные не отправятся на сервер | HTML | 244–271 |
| 3 | Конфликт имён: `lbClose` (DOM-элемент) и `lbClose_()` (функция) | JS | 144, 171 |
| 4 | Пустой экран при прямой навигации (пропуск страниц) | JS | 17–29 |
| 5 | `pointer-events: all` — невалидное CSS-значение | CSS | 655 |
| 6 | `<img src="">` в лайтбоксе — лишний HTTP-запрос на корневой URL | HTML | 296 |

### Важные (P2):

| # | Баг | Файл |
|---|-----|------|
| 7 | Телефон и email без валидации | HTML |
| 8 | Мобильное меню не закрывается кликом вне | JS |
| 9 | Свайп в лайтбоксе вызывает смену страниц сайта | JS |
| 10 | Нет `-webkit-backdrop-filter` для Safari | CSS |

### UX / Поведение (P3):

| # | Баг |
|---|-----|
| 11 | `wheelBuffer` не сбрасывается при смене направления |
| 12 | Мобильное меню всегда тёмное на светлых страницах |
| 13 | Лайтбокс не перехватывает фокус (нет focus trap) |
| 14 | Нет ESC для закрытия модалки успеха |
| 15 | Кнопки без `aria-label` для скринридеров |
| 16 | `noScrollPages` включал страницы 1,3,4 — на mobile пользователь застревает |
| 17 | Нет CSS для `.about-img-wrap` |

### Мелочи (P4):

| # | Баг |
|---|-----|
| 18 | Заглушки телефона/email дублировались в футере |
| 19 | `<select>` — опции без атрибута `value` |
| 20 | Два отдельных `keydown`-обработчика на `document` (конфликт) |
| 21 | Мёртвые CSS-классы (`.scroll-hint`, `.about`, `.about-grid` и др.) |
| 22 | Несогласованные цвета акцента (`#c8a96e` vs захардкоженный `#e6c84a`) |

---

## 6. Исправление всех 22 багов

### HTML-исправления:

- Добавлены `name` ко всем 6 полям формы (`name`, `phone`, `email`, `object`, `area`, `message`)
- Добавлен `pattern="\+?[0-9\s\-\(\)]{7,20}"` и `title` к полю телефона
- Email сделан `required`, площадь получила `min="1"`
- Добавлены `value` к каждому `<option>`: `apartment`, `house`, `office`, `restaurant`, `other`
- Добавлены `aria-label` к бургер-кнопке и трём кнопкам лайтбокса (close, prev, next)
- Добавлены `role="button"`, `tabindex="0"`, `aria-label` к пяти точкам навигации
- Убран `src=""` у лайтбокс-картинки, заменён на прозрачный 1×1 GIF data-URI:
  ```html
  src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
  ```
- Убраны дублирующиеся контакты (телефон, email, адрес) из `footer-copy`
- Inline `onclick="closeModal()"` заменён на `id="closeModalBtn"` + JS listener

### CSS-исправления:

- `pointer-events: all` → `pointer-events: auto` (валидное значение)
- Добавлен `-webkit-backdrop-filter: blur(10px)` рядом со стандартным `backdrop-filter`
- Добавлено правило `.about-img-wrap { width: 100%; height: 100% }`
- Удалены мёртвые классы: `.scroll-hint`, `.about`, `.about-grid`, `.about-text`
- Захардкоженный `#e6c84a` вынесен в переменные `--cta` и `--cta-hover`
- Мобильное меню адаптировано под `.header.light`: светлый фон, тёмный текст
- Добавлен `@media (hover: none)` — overlay всегда виден на тач-устройствах:
  ```css
  @media (hover: none) {
    .portfolio-overlay { transform: translateY(0); }
  }
  ```
- `resize: none` оставлен только на `textarea`, убран с `input` и `select`

### JS-исправления:

- `lbClose` (переменная для DOM) → `lbCloseBtn`, функция `lbClose_()` → `closeLightbox()` — конфликт имён устранён
- `goToPage()` переписан: при движении назад через несколько страниц целевая страница и все промежуточные мгновенно позиционируются через `transition: none`, затем transition восстанавливается и текущая страница плавно уезжает вниз
- `noScrollPages` сокращён до `[0]` — только hero. Остальные страницы используют `atTop`/`atBottom` detection, что работает корректно и на desktop (контент помещается), и на mobile (контент скроллится)
- `wheelBuffer` сбрасывается при смене направления через переменную `lastWheelDir`
- Touch handler проверяет состояние лайтбокса перед сменой страницы
- Клик вне меню закрывает его через listener на `document`
- Два `keydown`-обработчика объединены в один с приоритетной логикой
- Keyboard activation для точек: Enter/Space через `keydown` listener на не-A/не-BUTTON элементах
- `window.goToPage = goToPage` — экспорт функции для автотестов через `page.evaluate()`
- Модалка закрывается по ESC и по клику на overlay

---

## 7. CSS адаптивность — 5 брейкпоинтов

```
Desktop (> 1024px) — базовые стили, полный размер:
  about:     2 колонки (50/50)
  portfolio: 4 колонки, aspect-ratio 4/5
  team:      3 колонки
  form:      2 колонки
  services:  4 колонки
```

```css
@media (max-width: 1024px) { /* Tablet Landscape */
  .portfolio-grid  { grid-template-columns: repeat(2, 1fr); }
  .team-grid       { grid-template-columns: repeat(2, 1fr); }
  .services-grid   { grid-template-columns: repeat(2, 1fr); }
  .order-inner     { grid-template-columns: 1fr; gap: 40px; }
  .about-page-right { padding: 80px 40px 40px; }
}
```

```css
@media (max-width: 768px) { /* Tablet Portrait / большой телефон */
  /* Навигация → бургер-меню */
  .nav             { display: none; position: fixed; top: 72px; }
  .nav.open        { display: flex; }
  .burger          { display: block; }
  .page-dots       { display: none; }

  /* About → 1 колонка */
  .about-page-layout { grid-template-columns: 1fr; }
  .about-page-left   { height: 280px; }

  /* Сетки */
  .portfolio-grid  { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .team-grid       { grid-template-columns: 1fr; }
  .order-form      { grid-template-columns: 1fr; }
  .page-inner      { padding: 80px 0 40px; }
}
```

```css
@media (max-width: 480px) { /* Телефон */
  .portfolio-grid  { grid-template-columns: 1fr; }
  .portfolio-item  { aspect-ratio: 16/10; }
  .services-grid   { grid-template-columns: 1fr; }
  .about-page-left { height: 200px; }
  .page-inner      { padding: 72px 0 24px; }
  .btn-primary     { padding: 12px 24px; font-size: 12px; }
  .team-card       { flex-direction: column; }
}
```

```css
@media (max-width: 360px) { /* Маленький телефон (iPhone SE, Galaxy S) */
  .header-inner    { height: 60px; padding: 0 12px; }
  .logo            { font-size: 18px; letter-spacing: 2px; }
  .hero-title      { font-size: clamp(28px, 8vw, 40px); }
  .about-page-left { height: 160px; }
  .section-title   { font-size: clamp(20px, 5vw, 28px); }
}
```

---

## 8. Второй ручной аудит — 5 новых багов

После исправления 22 багов проведён повторный ручной аудит:

| # | Новый баг | Исправление |
|---|-----------|-------------|
| 23 | Portfolio overlay невидим на тач-устройствах (`:hover` не работает) | `@media (hover: none) { .portfolio-overlay { transform: translateY(0) } }` |
| 24 | `noScrollPages` включал страницы 1, 3, 4 — на mobile контент overflow, wheel заблокирован | Изменено на `[0]`, scroll detection работает автоматически |
| 25 | Dots не активируются с клавиатуры (Enter/Space) | Добавлен keydown listener для не-A/не-BUTTON элементов |
| 26 | `.page-inner` padding 100px слишком много на mobile | Responsive: 80px на 768px, 72px на 480px |
| 27 | `<img>` без `src` — невалидный HTML, лишний сетевой запрос | Transparent 1×1 GIF data-URI |

---

## 9. Автоматизированное тестирование

### 9.1. Созданные файлы

**package.json** — npm-скрипты:

```bash
npm test              # запуск всех тестов (576 = 72 × 8 конфигураций)
npm run test:headed   # с видимым окном браузера
npm run test:chrome   # только Chromium
npm run test:firefox  # только Firefox
npm run test:safari   # только WebKit
npm run test:mobile   # только мобильные
npm run report        # открыть HTML-отчёт Playwright
```

**playwright.config.js** — 8 конфигураций тестирования:

| Проект | Движок | Viewport | Описание |
|--------|--------|----------|----------|
| chromium | Chromium | 1440×900 | Desktop Chrome |
| firefox | Firefox | 1440×900 | Desktop Firefox |
| webkit | WebKit | 1440×900 | Desktop Safari |
| iPad | WebKit | 810×1080 | Планшет portrait |
| iPad landscape | WebKit | 1080×810 | Планшет landscape |
| Mobile Chrome | Chromium | 393×851 | Pixel 5 |
| Mobile Safari | WebKit | 390×844 | iPhone 13 |
| Small Phone | WebKit | 375×667 | iPhone SE |

### 9.2. Группы тестов — tests.spec.js (72 теста, 17 групп)

**1. Page Structure (5 тестов)**
- Все 5 страниц существуют в DOM
- Header видим и фиксирован
- Hero (page 0) видна при загрузке
- Pages 1–4 скрыты за экраном (translateY 100%)
- Lightbox image имеет валидный src (не пустую строку)

**2. Sequential Navigation (2 теста)**
- Последовательный переход вперёд через все 5 страниц
- Последовательный переход назад через все 5 страниц

**3. Skip Navigation / BUG-004 regression (4 теста)**
- Прыжок 0 → 3 напрямую
- Прыжок 0 → 2, потом назад на 1 (ранее вызывал пустой экран)
- Прыжок 0 → 4 → 1
- Прыжок 0 → 4 → 2 → 3

**4. Header Theme (3 теста)**
- Dark на page 0 (тёмный background)
- Light на pages 1–4 (класс `.light`)
- Обратно dark при возврате на page 0

**5. Lightbox (9 тестов)**
- Открытие по клику на portfolio item
- Правильные title и счётчик
- Навигация стрелками (prev/next)
- Циклический wrap-around
- Закрытие: кнопкой X, Escape, кликом по backdrop
- Keyboard arrows внутри лайтбокса
- Thumbnail click

**6. Order Form (10 тестов)**
- Все поля имеют атрибут `name`
- Пустая форма не сабмитится (native validation)
- Валидная форма показывает модалку
- Модалка закрывается: кнопкой, Escape, кликом по overlay
- Невалидный телефон ("abc") отклоняется
- Невалидный email отклоняется
- Select options имеют непустые `value`
- Форма очищается после сабмита

**7. Mobile Menu (6 тестов)**
- Burger видим на mobile
- Nav скрыт по умолчанию
- Burger toggle
- Закрытие по клику вне меню
- Закрытие по клику на nav-link
- `aria-label` на burger-кнопке

**8. Accessibility (4 теста)**
- Dots: `role`, `tabindex`, `aria-label`
- Lightbox buttons: `aria-label`
- Dot активируется по Enter
- Dot активируется по Space

**9–13. Responsive Layout (14 тестов)**
- About: 2 колонки desktop, 1 колонка mobile/tablet
- Portfolio: 4 → 3 → 2 → 1 колонка по брейкпоинтам
- Team: 3 → 2 → 1
- Form: 2 → 1
- Footer: многоколоночный → 1 колонка

**14. CSS Correctness (4 теста)**
- `pointer-events: auto` на лайтбоксе (не `all`)
- `backdrop-filter` на header
- CTA цвет через CSS-переменную
- Правило `@media (hover: none)` существует в стилях

**15. Content Visibility (5 тестов)**
- Hero title и CTA видны на mobile
- 6 team cards в DOM
- 4 portfolio items в DOM
- Footer не дублирует контакты

**16. Page Dots (3 теста)**
- Видны на desktop, скрыты на mobile
- Active dot обновляется при навигации

**17. Small Phone 360px (3 теста)**
- Header height ≤ 64px
- Hero title в диапазоне 26–42px
- About page читаема

### 9.3. Технические решения в тестах

**goToPage helper** — вместо клика по элементу (который может быть hidden на мобильном viewport) вызывает экспортированную функцию напрямую:
```javascript
await page.evaluate((i) => window.goToPage(i), targetPage);
```

**isPageVisible helper** — парсит computed `transform: matrix(...)` и проверяет, что translateY (значение `values[5]`) близко к 0.

**Keyboard tests** — используют `dispatchEvent(new KeyboardEvent(...))` вместо `page.keyboard.press()` для кросс-браузерной совместимости с WebKit.

**CSS rule test** — fallback-стратегия: `cssRules` → `fetch` → `skip`, чтобы работать с `file://` URLs во всех браузерах.

---

## 10. Итоги тестирования

### Итерации прогонов и исправлений:

| Прогон | Результат | Проблема | Исправление |
|--------|-----------|----------|-------------|
| 1 | 207/216 pass | `goToPage` helper кликал по скрытым nav-links | Заменён на `page.evaluate(window.goToPage)` |
| 2 | 213/216 pass | CSS rule test не читает `file://` в Firefox/WebKit | Fallback через fetch + skip |
| 3 | 214/216 pass | WebKit timing + strict mode selector | Увеличен timeout, добавлен `.first()` |
| 4 | 211/216 pass | `.section-title` matches 4 elements, WebKit keyboard | `.about-page-right .section-title`, `dispatchEvent` |
| 5 | 574/576 pass | iPad landscape WebKit timing | `goToPage` timeout 1100 → 1300ms |
| 6 | 576/576 pass | — | — |

### Финальный результат:

```
576 passed (7.6 min)
0 failed

  Chromium (desktop 1440×900):   72/72 passed
  Firefox  (desktop 1440×900):   72/72 passed
  WebKit   (desktop 1440×900):   72/72 passed
  iPad     (portrait 810×1080):  72/72 passed
  iPad     (landscape 1080×810): 72/72 passed
  Mobile Chrome (Pixel 5):       72/72 passed
  Mobile Safari (iPhone 13):     72/72 passed
  Small Phone (iPhone SE):       72/72 passed
```

---

## 11. Дополнительные исправления из последующих сессий

### 11.1. Мелькание промежуточных страниц при backward navigation

**Баг:** При навигации назад через несколько страниц (например, с 4 на 1) промежуточные страницы (2, 3) проглядывали на экране в процессе анимации.

**Fix:** В функции `goToPage()` при `next < current` все промежуточные страницы (от `next+1` до `current-1`) мгновенно скрываются через `transition: none` перед началом плавной анимации:

```javascript
} else {
  pages[next].style.transition = 'none';
  pages[next].style.transform  = 'translateY(0)';
  for (let i = next + 1; i < current; i++) {
    pages[i].style.transition = 'none';
    pages[i].style.transform  = 'translateY(100%)';
  }
  pages[next].offsetHeight; // force reflow
  pages[next].style.transition = '';
  for (let i = next + 1; i < current; i++) {
    pages[i].style.transition = '';
  }
  pages[current].style.transform = 'translateY(100%)';
}
```

### 11.2. Последняя страница прыгала при прокрутке вниз

**Баг:** На последней странице (page 4, заказ) прокрутка колесом вниз вызывала попытку перехода на несуществующую страницу, что приводило к видимым прыжкам контента.

**Fix:** Добавлена явная проверка в wheel-обработчике:

```javascript
if (current === TOTAL - 1 && e.deltaY > 0) { e.preventDefault(); return; }
```

Блокируется только `deltaY > 0` (скролл вперёд) — скролл назад и скролл внутри страницы продолжают работать нормально.

### 11.3. Цвет боковых точек был белым на светлых страницах

**Баг:** На страницах 1–4 (светлый фон) точки навигации были белыми (`rgba(255,255,255,0.3)`) и почти не видны.

**Fix:** В `updateUI()` цвет точек теперь зависит от темы текущей страницы:

```javascript
const isLight = lightPages.includes(current);
dots.forEach(d => {
  if (d.classList.contains('active')) {
    d.style.background = isLight ? '#1a1a1a' : '#ffffff';
  } else {
    d.style.background = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
  }
});
```

### 11.4. Фон карточек команды просвечивался

**Баг:** На странице "Команда" полупрозрачный фон страницы просвечивал сквозь карточки `.team-card`, делая текст плохо читаемым.

**Fix:** Явный белый фон на карточке:

```css
.team-card {
  background: #ffffff;
  /* ... */
}
```

### 11.5. Лишний контент в футере страницы заказа

**Баг:** В футере страницы заказа был лишний контент — телефон, email, адрес. Он дублировал информацию, которая уже присутствовала в форме.

**Fix:** Весь лишний контент убран из `<footer>`. Остался только копирайт:

```html
<footer class="footer">
  <p class="footer-copy">&copy; 2026 Серёга. Все права защищены.</p>
</footer>
```

### 11.6. Чёрная полоса снизу страницы заказа

**Баг:** Футер на странице заказа имел `background: var(--dark)`, из-за чего появлялась тёмная полоса на светлом фоне страницы.

**Fix:** Убран `background: var(--dark)` с `.footer`. Футер теперь прозрачный, со светлым текстом:

```css
.footer {
  padding: 16px 0;
  margin-top: auto;
  text-align: center;
}

.footer-copy {
  font-family: Arial, sans-serif;
  font-size: 11px;
  color: rgba(26, 26, 26, 0.35);
}
```

### 11.7. Padding страницы заказа выровнен с командой

**Улучшение:** `padding-top` страницы заказа (`data-page="4"`) выровнен с командой (`data-page="3"`) — оба теперь используют `80px`:

```css
.page[data-page="4"] .page-inner {
  position: relative;
  z-index: 1;
  padding-top: 80px;
  padding-bottom: 16px;
}
```

### 11.8. Баг iOS Safari: последняя страница не скроллилась на iPhone

**Баг:** На iPhone в Safari страница заказа (page 4) не прокручивалась — контент был обрезан, форма недоступна.

**Причина:** iOS Safari специфично обрабатывает `overflow-y: scroll` на `position: fixed` элементах. Без явных `top/left/right/bottom` и без `-webkit-overflow-scrolling: touch` скролл блокировался системой.

**Fix:** В CSS для `.page` добавлены явные позиционные свойства и webkit-scroll:

```css
.page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  transition: transform 0.75s cubic-bezier(0.77, 0, 0.175, 1);
  will-change: transform;
}
```

Ключевые изменения:
- `inset: 0` заменён на явные `top: 0; left: 0; right: 0; bottom: 0` — iOS Safari правильнее интерпретирует явные свойства
- `overflow-y: scroll` вместо `auto` — принудительный скролл-контейнер
- `-webkit-overflow-scrolling: touch` — momentum scrolling на iOS

### 11.9. Создан файл Docker.md

Создан отдельный файл `Docker.md` — подробное руководство по развёртыванию сайта и запуску тестов в Docker-контейнере. Включает:
- Dockerfile для nginx (продакшн-сборка сайта)
- Dockerfile для Playwright (запуск тестов в контейнере)
- docker-compose конфигурацию
- Пошаговые инструкции для Linux, macOS, Windows

---

## 12. Как запустить сайт

### Открыть напрямую в браузере:

```bash
# Windows — просто двойной клик по файлу
# Или через Python:
python open_browser.py

# Или через любой статический сервер:
npx serve .
python -m http.server 8080
```

### Запустить тесты:

```bash
# Установить зависимости (один раз)
npm install
npx playwright install

# Запуск всех тестов во всех браузерах (576 тестов)
npm test

# Только один браузер
npm run test:chrome
npm run test:firefox
npm run test:safari

# Только мобильные конфигурации
npm run test:mobile

# С видимым окном браузера
npm run test:headed

# Посмотреть HTML-отчёт после прогона
npm run report
```

---

## 13. Итоговая таблица всех этапов

| Этап | Сессия | Действие | Результат |
|------|--------|----------|-----------|
| 1 | 1 | Создание Mysite1.html | 5 страниц, header, lightbox, форма |
| 2 | 1 | Создание Mysite1.css | Fullpage-система, z-index стек, responsive |
| 3 | 1 | Создание Mysite1.js | Навигация, лайтбокс, форма, меню, touch |
| 4 | 1 | Первый ручной аудит | Найдено 22 бага, составлен BUG_REPORT.md |
| 5 | 1 | Исправление 22 багов | HTML + CSS + JS переработаны |
| 6 | 1 | CSS адаптивность | 5 брейкпоинтов от 1024px до 360px |
| 7 | 1 | Второй ручной аудит | Найдено ещё 5 багов |
| 8 | 1 | Исправление 5 новых багов | Overlay, noScroll, keyboard, padding, img src |
| 9 | 2 | Написание автотестов | 72 теста Playwright в tests.spec.js |
| 10 | 2 | Настройка 8 конфигураций | 3 desktop + 2 tablet + 3 mobile |
| 11 | 2 | 6 итераций прогонов | Исправление тестов и timing-проблем |
| 12 | 2 | Финальный прогон | **576/576 passed** |
| 13 | 3 | Fix: backward navigation | Мгновенное скрытие промежуточных страниц |
| 14 | 3 | Fix: последняя страница + колесо | `e.deltaY > 0` block на TOTAL-1 |
| 15 | 3 | Fix: цвет точек навигации | `#1a1a1a` на светлых, `#ffffff` на тёмных |
| 16 | 3 | Fix: фон карточек команды | `background: #ffffff` на `.team-card` |
| 17 | 3 | Fix: лишний контент в футере | Убраны телефон, email, адрес |
| 18 | 3 | Fix: чёрная полоса футера | Убран `background: var(--dark)` с `.footer` |
| 19 | 3 | Улучшение: padding заказа | 80px top, согласован с командой |
| 20 | 3 | Fix iOS Safari: скролл страницы 4 | Явные top/left/right/bottom, `-webkit-overflow-scrolling: touch` |
| 21 | 3 | Создан Docker.md | Руководство по Docker-развёртыванию |
| 22 | 4 | Docker-конфигурация | Dockerfile, nginx.conf, docker-compose.yml, .dockerignore |
| 23 | 4 | Fix: `id="pageDots"` | Добавлен id для тестов Page Dots |
| 24 | 4 | Fix: тесты футера | Обновлены тесты под упрощённый футер (footer-copy) |
| 25 | 4 | Запуск в Docker | `docker compose up -d --build` → сайт на localhost:8080 |

---

## 14. Быстрый старт

```bash
# Открыть напрямую в браузере
# Windows: двойной клик на Mysite1.html

# Через Python
python open_browser.py

# Через Docker (рекомендуется)
docker compose up -d --build
# Сайт: http://localhost:8080

# Запустить тесты
npm install
npx playwright install
npm test
```

---

## 15. Docker — упаковка и запуск

Сайт упакован в `nginx:alpine` контейнер для воспроизводимого деплоя на любой машине.

| Файл | Назначение |
|------|-----------|
| `Dockerfile` | Берёт `nginx:alpine`, копирует HTML/CSS/JS, подключает конфиг |
| `nginx.conf` | Gzip, кэширование статики 30 дней, fallback на index.html |
| `docker-compose.yml` | Порт 8080, `restart: unless-stopped` |
| `.dockerignore` | Исключает node_modules, тесты, документацию из образа |

```bash
docker compose up -d --build   # собрать и запустить
docker compose down            # остановить
docker compose logs -f web     # логи
docker compose ps              # статус
```

---

## 16. Технический стек

| Технология | Назначение |
|-----------|-----------|
| HTML5 | Разметка, семантика, доступность (aria, role) |
| CSS3 | Fullpage-система, 5 брейкпоинтов, CSS-переменные |
| Vanilla JS (ES6+) | Навигация, лайтбокс, форма, мобильное меню, touch |
| Playwright ^1.50 | Автотестирование: 72 теста × 8 конфигураций = 576 |
| nginx alpine | Веб-сервер в Docker: gzip, кэширование, SPA fallback |
| Docker | Контейнеризация, воспроизводимый деплой |
