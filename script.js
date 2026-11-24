/* ============================================================
   LES 31°12′ — интерактив лендинга
   ============================================================ */
(function () {
  'use strict';

  const $ = (selector, context) => (context || document).querySelector(selector);
  const $$ = (selector, context) => Array.from((context || document).querySelectorAll(selector));
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1. Золотые искорки
     --------------------------------------------------------- */
  function initSparks() {
    const layer = $('#sparks');
    if (!layer || reduceMotion) return;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 46; i += 1) {
      const spark = document.createElement('span');
      spark.className = 'spark';
      spark.style.left = (Math.random() * 100).toFixed(2) + '%';
      spark.style.setProperty('--size', (2 + Math.random() * 2.5).toFixed(1) + 'px');
      spark.style.setProperty('--dur', (11 + Math.random() * 15).toFixed(1) + 's');
      spark.style.setProperty('--delay', (-Math.random() * 26).toFixed(1) + 's');
      spark.style.setProperty('--alpha', (.35 + Math.random() * .6).toFixed(2));
      fragment.appendChild(spark);
    }
    layer.appendChild(fragment);
  }

  /* ---------------------------------------------------------
     2. Переключатель темы
     --------------------------------------------------------- */
  function initTheme() {
    const input = $('#winter-toggle');
    const label = $('#seasonLabel');
    if (!input) return;

    let winter = true;
    try { winter = localStorage.getItem('les-season') !== 'summer'; } catch (e) { /* private mode */ }

    function apply(winterState) {
      body.classList.toggle('winter-theme', winterState);
      body.classList.toggle('summer-theme', !winterState);
      input.checked = winterState;
      if (label) label.textContent = winterState ? 'Зима' : 'Лето';
    }

    apply(winter);
    input.addEventListener('change', () => {
      winter = input.checked;
      apply(winter);
      try { localStorage.setItem('les-season', winter ? 'winter' : 'summer'); } catch (e) { /* ignore */ }
    });
  }

  /* ---------------------------------------------------------
     3. Панель, плавающая кнопка, появление блоков, наклон карточек
     --------------------------------------------------------- */
  function initScrollUI() {
    const topbar = $('#topbar');
    const hero = $('#hero');
    let ticking = false;

    function update() {
      ticking = false;
      const y = window.scrollY || window.pageYOffset;
      const heroHeight = hero ? hero.offsetHeight : window.innerHeight;
      if (topbar) topbar.classList.toggle('is-scrolled', y > heroHeight - 110);
      body.classList.toggle('dock-visible', y > heroHeight * .65);
    }
    function onScroll() {
      // Прямой вызов + rAF: работает даже когда анимации фреймов зажаты браузером
      update();
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();

    // Появление при скролле
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });

    $$('.cards-grid').forEach((grid) => {
      $$('.reveal', grid).forEach((card, index) => {
        card.style.transitionDelay = (index * .12) + 's';
      });
    });
    $$('.reveal').forEach((element) => revealObserver.observe(element));
  }

  /* ---------------------------------------------------------
     4. Динамический текст кнопки
     --------------------------------------------------------- */
  function initDynamicCTA() {
    const defaultLabel = 'ЗАБРОНИРОВАТЬ ДОМИК СО СКИДКОЙ 15%';
    const buttons = $$('[data-open-booking]');
    const zones = $$('[data-cta]');
    let currentLabel = defaultLabel;

    function update() {
      const center = window.innerHeight / 2;
      let next = defaultLabel;
      for (const zone of zones) {
        const rect = zone.getBoundingClientRect();
        if (rect.top <= center && rect.bottom >= center) { next = zone.dataset.cta; break; }
      }
      if (next !== currentLabel) {
        currentLabel = next;
        buttons.forEach((button) => { button.textContent = next; });
      }
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------------------------------------------------------
     5. Обратный отсчёт до 01.12.2026 23:59:59
     --------------------------------------------------------- */
  function initTimer() {
    const deadline = new Date('2026-12-01T23:59:59').getTime();
    const fields = {
      d: $('#timer-d'), h: $('#timer-h'), m: $('#timer-m'), s: $('#timer-s')
    };
    if (!Object.values(fields).every(Boolean)) return;
    const pad = (number) => String(number).padStart(2, '0');

    function tick() {
      const diff = Math.max(0, deadline - Date.now());
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      fields.d.textContent = pad(days);
      fields.h.textContent = pad(hours);
      fields.m.textContent = pad(minutes);
      fields.s.textContent = pad(seconds);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------
     6. Модальное окно бронирования
     --------------------------------------------------------- */
  function initBooking() {
    const modal = $('#bookingModal');
    const form = $('#bookingForm');
    const formWrap = $('#bookingFormWrap');
    const success = $('#modalSuccess');
    const close = $('#closeModal');
    const successClose = $('#successClose');
    if (!modal) return;
    let lastFocused = null;

    function open() {
      lastFocused = document.activeElement;
      formWrap.hidden = false;
      success.hidden = true;
      modal.classList.add('active');
      body.style.overflow = 'hidden';
      setTimeout(() => { const first = $('#name'); if (first) first.focus(); }, 60);
    }
    function hide() {
      modal.classList.remove('active');
      body.style.overflow = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    $$('[data-open-booking]').forEach((button) => button.addEventListener('click', open));
    if (close) close.addEventListener('click', hide);
    if (successClose) successClose.addEventListener('click', hide);
    modal.addEventListener('click', (event) => { if (event.target === modal) hide(); });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('active')) hide();
    });

    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        formWrap.hidden = true;
        success.hidden = false;
      });
    }
  }

  /* ---------------------------------------------------------
     7. Подсветка фонаря
     --------------------------------------------------------- */
  function initSmallInteractions() {
    const setLamp = (on) => body.classList.toggle('lamp-on', on);
    $$('[data-open-booking]').forEach((button) => {
      button.addEventListener('mouseenter', () => setLamp(true));
      button.addEventListener('mouseleave', () => setLamp(false));
      button.addEventListener('focus', () => setLamp(true));
      button.addEventListener('blur', () => setLamp(false));
    });
  }


  /* ---------------------------------------------------------
     9. Запуск
     --------------------------------------------------------- */
  initSparks();
  initTheme();
  initScrollUI();
  initDynamicCTA();
  initTimer();
  initBooking();
  initSmallInteractions();

})();
