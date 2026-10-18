/* Personal Hibachi: shared site behavior (every page) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || !hasGsap;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const PHONE = '+19097255030';
  const PHONE_LABEL = '(909) 725-5030';

  root.classList.remove('no-js');
  if (reduced) root.classList.add('reduced');
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const PH = (window.PH = { $, $$, store, hasGsap, reduced, finePointer, PHONE, lenis: null, lang: 'en' });

  /* ---------------- language ---------------- */
  const browserEs = (navigator.language || '').toLowerCase().startsWith('es');
  PH.setLang = (l) => {
    PH.lang = l;
    root.dataset.lang = l;
    root.lang = l;
    store.set('ph-lang', l);
    document.dispatchEvent(new CustomEvent('ph:lang', { detail: l }));
    if (hasGsap && ScrollTrigger.getAll().length) ScrollTrigger.refresh();
  };
  PH.lang = store.get('ph-lang') || (browserEs ? 'es' : 'en');
  root.dataset.lang = PH.lang;
  root.lang = PH.lang;
  $('#langBtn')?.addEventListener('click', () => PH.setLang(PH.lang === 'en' ? 'es' : 'en'));
  PH.t = (en, es) => (PH.lang === 'es' ? es : en);

  /* ---------------- videos: load near view; play while visible (or on hover for [data-hover]) ---------------- */
  const loadIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const v = e.target;
      v.src = v.dataset.src;
      v.removeAttribute('data-src');
      loadIO.unobserve(v);
    });
  }, { rootMargin: '600px 600px' });
  const play = (v) => { const p = v.play(); if (p) p.catch(() => {}); };
  const playIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting && !reduced) play(v); else v.pause();
    });
  }, { threshold: 0.2 });
  PH.observeVideos = (scope = document) => {
    $$('video', scope).forEach((v) => {
      if (v.closest('.lb')) return;
      if (v.dataset.src) loadIO.observe(v);
      if (v.hasAttribute('data-hover') && finePointer) {
        const host = v.closest('[data-hover-host]') || v.parentElement;
        host.addEventListener('pointerenter', () => play(v));
        host.addEventListener('pointerleave', () => { v.pause(); });
      } else {
        playIO.observe(v);
      }
    });
  };
  PH.observeVideos();

  /* ---------------- smooth scroll + in-page anchors ---------------- */
  if (hasGsap && !reduced && window.Lenis) {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    root.classList.add('lenis');
    PH.lenis = lenis;
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const el = id === '#top' ? 0 : $(id);
    if (el === null) return;
    e.preventDefault();
    if (PH.lenis) PH.lenis.scrollTo(el, { offset: id === '#top' ? 0 : -10, duration: 1.6 });
    else (el || document.body).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }));

  /* ---------------- nav + mobile action bar ---------------- */
  const navEl = $('.nav'), mbar = $('.mbar');
  const solidAt = () => ($('.hero') ? innerHeight * 0.6 : 40);
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    navEl?.classList.toggle('is-solid', y > solidAt());
    navEl?.classList.toggle('is-hidden', y > innerHeight && y > lastY && !reduced);
    mbar?.classList.toggle('is-on', y > ($('.hero') ? innerHeight * 0.8 : 200) || reduced);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- marquees: drift, speed up + flip with scroll ---------------- */
  $$('.marquee').forEach((m) => {
    const track = $('.marquee__track', m);
    track.innerHTML += track.innerHTML;
    if (!hasGsap || reduced) return;
    const base = +m.dataset.dir || 1;
    let x = 0, dir = base, boost = 0;
    const wrap = gsap.utils.wrap(-50, 0);
    PH.lenis?.on('scroll', (e) => { if (e.direction) dir = base * e.direction; boost = Math.min(Math.abs(e.velocity), 60); });
    gsap.ticker.add((t, dt) => {
      boost *= 0.92;
      x = wrap(x - (0.0035 + boost * 0.0009) * dir * dt);
      gsap.set(track, { xPercent: x });
    });
  });

  /* ---------------- cursor (delegated so dynamic content works) ---------------- */
  const cursor = $('.cursor');
  if (cursor && hasGsap && finePointer) {
    const label = $('.cursor__label', cursor);
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
    const words = { Live: 'En vivo', 'Hungry?': '¿Hambre?', Play: 'Ver', Sound: 'Sonido' };
    addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); cursor.style.opacity = 1; }, { passive: true });
    document.addEventListener('pointerleave', () => { cursor.style.opacity = 0; });
    document.addEventListener('pointerover', (e) => {
      const el = e.target.closest('[data-cursor]');
      if (!el || !el.dataset.cursor) { cursor.classList.remove('is-big'); return; }
      const txt = el.dataset.cursor;
      label.textContent = PH.lang === 'es' ? (words[txt] || txt) : txt;
      cursor.classList.add('is-big');
    });
  }

  /* ---------------- modal helpers ---------------- */
  let lastFocus = null;
  function openLayer(el) {
    lastFocus = document.activeElement;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('is-open'));
    PH.lenis?.stop();
    document.body.style.overflow = 'hidden';
    $('[data-close]', el)?.focus();
  }
  function closeLayer(el) {
    el.classList.remove('is-open');
    PH.lenis?.start();
    document.body.style.overflow = '';
    setTimeout(() => { el.hidden = true; }, 350);
    lastFocus?.focus?.();
  }
  function trapTab(el, e) {
    if (e.key !== 'Tab') return;
    const f = $$('a[href], button:not([disabled]), video[controls]', el).filter((n) => n.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------------- lightbox: full-length videos with sound ---------------- */
  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.hidden = true;
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Video');
  lb.innerHTML = `
    <button class="lb__btn lb__close" type="button" data-close aria-label="Close">✕</button>
    <button class="lb__btn lb__prev" type="button" aria-label="Previous">←</button>
    <button class="lb__btn lb__next" type="button" aria-label="Next">→</button>
    <figure class="lb__stage">
      <video class="lb__video" controls playsinline preload="auto"></video>
      <figcaption class="lb__cap">
        <span class="lb__count"></span>
        <b class="lb__title"></b>
        <a class="lb__ig" target="_blank" rel="noopener"></a>
      </figcaption>
    </figure>`;
  document.body.appendChild(lb);
  const lbVideo = $('.lb__video', lb);
  let lbItems = [], lbIndex = 0;
  const fmtDate = (d) => new Date(d + 'T12:00').toLocaleDateString(PH.lang === 'es' ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  function showLb(i) {
    lbIndex = (i + lbItems.length) % lbItems.length;
    const c = lbItems[lbIndex];
    lbVideo.poster = `assets/img/${c.id}.jpg`;
    lbVideo.src = `assets/full/${c.full}.mp4`;
    lbVideo.muted = false;
    play(lbVideo);
    $('.lb__title', lb).textContent = c[PH.lang] || c.en;
    $('.lb__count', lb).textContent = `${String(lbIndex + 1).padStart(2, '0')} / ${String(lbItems.length).padStart(2, '0')}${c.date ? ' · ' + fmtDate(c.date) : ''}`;
    const ig = $('.lb__ig', lb);
    ig.hidden = !c.ig;
    if (c.ig) { ig.href = `https://www.instagram.com/reel/${c.ig}/`; ig.textContent = PH.t('View on Instagram ↗', 'Ver en Instagram ↗'); }
    const multi = lbItems.length > 1;
    $('.lb__prev', lb).hidden = !multi;
    $('.lb__next', lb).hidden = !multi;
  }
  PH.lightbox = (items, i = 0) => { lbItems = items; showLb(i); openLayer(lb); };
  const closeLb = () => { lbVideo.pause(); lbVideo.removeAttribute('src'); lbVideo.load(); closeLayer(lb); };
  $('.lb__close', lb).addEventListener('click', closeLb);
  $('.lb__prev', lb).addEventListener('click', () => showLb(lbIndex - 1));
  $('.lb__next', lb).addEventListener('click', () => showLb(lbIndex + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowRight' && lbItems.length > 1) showLb(lbIndex + 1);
    else if (e.key === 'ArrowLeft' && lbItems.length > 1) showLb(lbIndex - 1);
    else trapTab(lb, e);
  });
  let tx = null;
  lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (tx === null || lbItems.length < 2) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 60) showLb(lbIndex + (dx < 0 ? 1 : -1));
    tx = null;
  });

  /* ---------------- desktop texting: QR code + copy, since sms: links rarely work on computers ---------------- */
  const tm = document.createElement('div');
  tm.className = 'tm';
  tm.hidden = true;
  tm.setAttribute('role', 'dialog');
  tm.setAttribute('aria-modal', 'true');
  tm.setAttribute('aria-labelledby', 'tmTitle');
  tm.innerHTML = `
    <div class="tm__card">
      <button class="lb__btn tm__close" type="button" data-close aria-label="Close">✕</button>
      <p class="eyebrow tm__eyebrow"></p>
      <h3 id="tmTitle" class="tm__title"></h3>
      <div class="tm__body">
        <div class="tm__qr" aria-hidden="true"></div>
        <div class="tm__side">
          <p class="tm__how"></p>
          <pre class="tm__msg"></pre>
        </div>
      </div>
      <div class="tm__btns">
        <button class="btn tm__copy" type="button"></button>
        <a class="btn btn--ghost tm__call" href="tel:${PHONE}">${PHONE_LABEL}</a>
      </div>
      <a class="tm__open" href="#"></a>
    </div>`;
  document.body.appendChild(tm);
  let tmMsg = '';
  function openText(body) {
    tmMsg = body || PH.t('Hi Chef Jorge! I am interested in booking a hibachi party.', '¡Hola Chef Jorge! Me interesa reservar una fiesta hibachi.');
    $('.tm__eyebrow', tm).textContent = PH.t('Book by text', 'Reserva por texto');
    $('.tm__title', tm).textContent = PH.t('Text Chef Jorge', 'Escríbele al Chef Jorge');
    $('.tm__how', tm).textContent = PH.t('Point your phone camera at the code. Your message is already written, just hit send.', 'Apunta la cámara de tu teléfono al código. Tu mensaje ya está escrito, solo envíalo.');
    $('.tm__msg', tm).textContent = tmMsg;
    $('.tm__copy', tm).textContent = PH.t('Copy message', 'Copiar mensaje');
    const open = $('.tm__open', tm);
    open.href = `sms:${PHONE}?&body=${encodeURIComponent(tmMsg)}`;
    open.textContent = PH.t('Have Messages on this computer? Open it here', '¿Tienes Mensajes en esta computadora? Ábrelo aquí');
    const box = $('.tm__qr', tm);
    if (window.qrcode) {
      qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
      const qr = qrcode(0, 'M');
      qr.addData(`SMSTO:${PHONE}:${tmMsg}`, 'Byte');
      qr.make();
      box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
    } else {
      box.innerHTML = `<p>${PHONE_LABEL}</p>`;
    }
    openLayer(tm);
  }
  PH.openText = openText;
  $('.tm__close', tm).addEventListener('click', () => closeLayer(tm));
  tm.addEventListener('click', (e) => { if (e.target === tm) closeLayer(tm); });
  tm.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLayer(tm); else trapTab(tm, e); });
  $('.tm__copy', tm).addEventListener('click', async (e) => {
    const b = e.currentTarget;
    try { await navigator.clipboard.writeText(`${tmMsg}\n\n${PHONE_LABEL}`); b.textContent = PH.t('Copied ✓', 'Copiado ✓'); }
    catch (err) { b.textContent = PHONE_LABEL; }
  });
  const isPhone = matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isPhone) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="sms:"]');
      if (!a || a.closest('.tm')) return;
      e.preventDefault();
      const m = a.getAttribute('href').match(/body=([^&]*)/);
      openText(m ? decodeURIComponent(m[1]) : '');
    });
  }
})();
