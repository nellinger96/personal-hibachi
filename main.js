/* Personal Hibachi: home page */
(() => {
  const { $, $$, hasGsap, reduced } = window.PH;
  const PH = window.PH;

  /* ---------------- latest from Instagram (one tile per reel, newest first) ---------------- */
  const latestRow = $('#latestRow');
  if (latestRow && window.PH_CLIPS) {
    const seen = new Set();
    const latest = PH_CLIPS.filter((c) => c.ig && !c.extra && !seen.has(c.ig) && seen.add(c.ig)).slice(0, 6);
    const fmt = (d) => new Date(d + 'T12:00').toLocaleDateString(PH.lang === 'es' ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric' });
    const render = () => {
      latestRow.innerHTML = latest.map((c, i) => `
        <button class="reel" type="button" data-i="${i}" data-cursor="Sound" data-hover-host>
          <video data-src="assets/video/${c.id}.mp4" poster="assets/img/${c.id}.jpg" muted loop playsinline preload="none" data-hover></video>
          <span class="reel__date">${fmt(c.date)}</span>
          <span class="reel__sound" aria-hidden="true">♪</span>
          <span class="reel__title">${c[PH.lang]}</span>
        </button>`).join('');
      PH.observeVideos(latestRow);
    };
    render();
    document.addEventListener('ph:lang', render);
    latestRow.addEventListener('click', (e) => {
      const b = e.target.closest('.reel');
      if (b) PH.lightbox(latest, +b.dataset.i);
    });
  }

  /* show-track clips open their full version too */
  $$('.clip[data-clip]').forEach((el, i, all) => {
    el.addEventListener('click', () => {
      const items = all.map((n) => PH_CLIPS.find((c) => c.id === n.dataset.clip)).filter(Boolean);
      PH.lightbox(items, items.findIndex((c) => c.id === el.dataset.clip));
    });
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); } });
  });

  /* ---------------- quote calculator ---------------- */
  const PKG = {
    special: { en: "Chef's Special", es: 'Especial del Chef', min: 60, max: 60 },
    famous: { en: 'The Famous', es: 'El Famoso', min: 80, max: 80 },
    seafood: { en: 'Seafood Lover', es: 'Amante del Mar', min: 65, max: 100 },
  };
  const T = {
    en: {
      guests: 'Guests', billed: 'billed', setup: 'Full setup', travel: 'Travel fee', tbd: 'TBD',
      min: 'Parties under 15 guests are billed at the 15-guest minimum.',
      buffet: 'Over 30 guests is served buffet style. An extra chef can be added.',
      range: 'Final seafood price depends on your two picks.',
      travelNote: 'Travel fee varies by city. Chef Jorge will confirm.',
      tip: 'Gratuity not included (optional).',
      order: 'ORDER', noDate: 'DATE TBD',
      sms: (q) => `Hi Chef Jorge! I'd like to book a hibachi party.\nDate: ${q.date || 'TBD'}\nCity: ${q.city}\nGuests: ${q.guests}\nPackage: ${q.pkg}\nFull setup: ${q.setup ? 'Yes' : 'No'}\nWebsite estimate: ${q.total}`,
    },
    es: {
      guests: 'Invitados', billed: 'cobrados', setup: 'Montaje completo', travel: 'Traslado', tbd: 'Por confirmar',
      min: 'Fiestas de menos de 15 se cobran con el mínimo de 15 invitados.',
      buffet: 'Más de 30 invitados se sirve estilo buffet. Se puede agregar otro chef.',
      range: 'El precio final de mariscos depende de tus dos elecciones.',
      travelNote: 'El traslado varía por ciudad. El Chef Jorge lo confirmará.',
      tip: 'Propina no incluida (opcional).',
      order: 'ORDEN', noDate: 'FECHA POR CONFIRMAR',
      sms: (q) => `¡Hola Chef Jorge! Quiero reservar una fiesta hibachi.\nFecha: ${q.date || 'Por confirmar'}\nCiudad: ${q.city}\nInvitados: ${q.guests}\nPaquete: ${q.pkg}\nMontaje completo: ${q.setup ? 'Sí' : 'No'}\nEstimado del sitio: ${q.total}`,
    },
  };
  const guestsEl = $('#guests'), guestsOut = $('#guestsOut');
  const dateEl = $('#date'), cityEl = $('#city'), setupEl = $('#setupFee');
  const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const shown = { min: 0, max: 0 };
  const now = new Date();
  dateEl.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  function renderQuote() {
    const lang = PH.lang;
    const t = T[lang];
    const g = +guestsEl.value;
    const p = PKG[$('input[name="pkg"]:checked').value];
    const billed = Math.max(g, 15);
    const setup = setupEl.checked ? 250 : 0;
    const min = p.min * billed + setup;
    const max = p.max * billed + setup;

    guestsOut.textContent = g;
    guestsEl.style.setProperty('--p', ((g - guestsEl.min) / (guestsEl.max - guestsEl.min)) * 100 + '%');

    const priceTxt = p.min === p.max ? fmt(p.min) : `${fmt(p.min)}–${p.max}`;
    const line = (a, b) => `<div class="tl"><span>${a}</span><span>${b}</span></div>`;
    $('#tLines').innerHTML =
      line(p[lang], `${priceTxt} × ${billed}`) +
      line(t.guests, g < 15 ? `${g} (${billed} ${t.billed})` : g) +
      (setup ? line(t.setup, fmt(250)) : '') +
      line(t.travel, t.tbd);

    const notes = [];
    if (g < 15) notes.push(`<li class="warn">${t.min}</li>`);
    if (g > 30) notes.push(`<li class="warn">${t.buffet}</li>`);
    if (p.min !== p.max) notes.push(`<li>${t.range}</li>`);
    notes.push(`<li>${t.travelNote}</li>`, `<li>${t.tip}</li>`);
    $('#tNotes').innerHTML = notes.join('');

    const d = dateEl.value ? new Date(dateEl.value + 'T12:00') : null;
    const dateTxt = d ? d.toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '';
    $('#tDate').textContent = dateTxt || `${t.order} #${String(g).padStart(3, '0')} · ${t.noDate}`;

    const totalEl = $('#tTotal');
    const paint = () => { totalEl.textContent = Math.round(shown.min) === Math.round(shown.max) ? fmt(shown.min) : `${fmt(shown.min)}–${fmt(shown.max).slice(1)}`; };
    if (hasGsap && !reduced) gsap.to(shown, { min, max, duration: 0.6, ease: 'power3.out', onUpdate: paint, overwrite: true });
    else { shown.min = min; shown.max = max; paint(); }

    const totalTxt = min === max ? fmt(min) : `${fmt(min)}–${fmt(max).slice(1)}`;
    const city = cityEl.value === 'other' ? (lang === 'es' ? 'Otra' : 'Other') : cityEl.value;
    const body = t.sms({ date: dateTxt, city, guests: g, pkg: p[lang], setup, total: totalTxt + ' + ' + t.travel.toLowerCase() });
    $('#smsBtn').href = `sms:${PH.PHONE}?&body=${encodeURIComponent(body)}`;
  }
  $$('.stepper button').forEach((b) => b.addEventListener('click', () => {
    guestsEl.value = Math.min(+guestsEl.max, Math.max(+guestsEl.min, +guestsEl.value + +b.dataset.step));
    renderQuote();
  }));
  [guestsEl, dateEl, cityEl, setupEl, ...$$('input[name="pkg"]')].forEach((el) => el.addEventListener('input', renderQuote));
  document.addEventListener('ph:lang', renderQuote);
  renderQuote();

  /* ---------------- embers (hero) ---------------- */
  function embers(canvas) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, run = false, raf = 0;
    const P = [];
    const N = innerWidth < 700 ? 45 : 110;
    const reset = (p, init) => {
      p.x = Math.random() * W;
      p.y = init ? Math.random() * H : H + 20;
      p.r = Math.random() * 1.8 + 0.5;
      p.vy = -(Math.random() * 1.1 + 0.35);
      p.vx = (Math.random() - 0.5) * 0.4;
      p.ph = Math.random() * 6.28;
      p.hue = 20 + Math.random() * 25;
    };
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    for (let i = 0; i < N; i++) { const p = {}; reset(p, true); P.push(p); }
    addEventListener('resize', size);
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of P) {
        p.ph += 0.025;
        p.x += p.vx + Math.sin(p.ph) * 0.35;
        p.y += p.vy;
        if (p.y < -20) reset(p, false);
        const a = Math.max(0, Math.min(1, p.y / H)) * 0.9;
        ctx.fillStyle = `hsla(${p.hue},100%,55%,${a * 0.07})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, 6.283); ctx.fill();
        ctx.fillStyle = `hsla(${p.hue + 15},100%,72%,${a})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !run) { run = true; tick(); }
      else if (!e.isIntersecting && run) { run = false; cancelAnimationFrame(raf); }
    }).observe(canvas);
  }

  /* ---------------- scroll-scrubbed image sequence ---------------- */
  const SEQ_N = 150;
  const seqCanvas = $('.setup__canvas');
  const seqCtx = seqCanvas.getContext('2d');
  const frames = new Array(SEQ_N);
  const seq = { f: 0 };
  const frameSrc = (i) => `assets/seq/f${String(i + 1).padStart(3, '0')}.jpg`;
  function sizeSeq() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    seqCanvas.width = seqCanvas.clientWidth * dpr;
    seqCanvas.height = seqCanvas.clientHeight * dpr;
    drawSeq();
  }
  function drawSeq() {
    const i = Math.round(seq.f);
    let img = frames[i];
    // fall back to the nearest loaded frame while the sequence streams in
    for (let d = 1; (!img || !img.complete || !img.naturalWidth) && d < SEQ_N; d++) img = frames[i - d] || frames[i + d];
    if (!img || !img.naturalWidth) return;
    const cw = seqCanvas.width, ch = seqCanvas.height;
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    seqCtx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }
  function loadSeq() {
    // every 5th frame first so scrubbing works early, then fill in
    const order = [];
    for (let i = 0; i < SEQ_N; i += 5) order.push(i);
    for (let i = 0; i < SEQ_N; i++) if (i % 5) order.push(i);
    order.forEach((i) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => { if (Math.abs(i - seq.f) < 6) drawSeq(); };
      img.src = frameSrc(i);
      frames[i] = img;
    });
  }
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    o.disconnect();
    if (reduced) seq.f = 100;
    loadSeq();
    sizeSeq();
  }, { rootMargin: '1500px 0px' }).observe(seqCanvas);
  addEventListener('resize', sizeSeq);

  /* ---------------- everything below is motion only ---------------- */
  if (!hasGsap || reduced) {
    $('.loader')?.remove();
    $$('.step').forEach((s) => s.classList.add('is-active'));
    return;
  }

  const splitChars = (el) => {
    el.innerHTML = [...el.textContent].map((c) => (c === ' ' ? ' ' : `<span class="ch">${c}</span>`)).join('');
  };
  const splitWords = (el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    return $$('.w', el);
  };
  $$('.hero__title .li').forEach(splitChars);

  /* the intro owns the first screen: start at the top, unless arriving on a #section link */
  const startHash = location.hash && location.hash.length > 1 ? location.hash : '';
  ScrollTrigger.clearScrollMemory('manual');
  // drop the hash so the browser stops re-trying its own jump; we land on it ourselves after layout settles
  if (startHash) history.replaceState(null, '', location.pathname + location.search);
  scrollTo(0, 0);

  /* ---------------- loader → hero intro ---------------- */
  PH.lenis?.stop();
  const temp = { v: 0 };
  const intro = gsap.timeline({ delay: 0.15 });
  intro
    .from('.loader__logo', { scale: 0.4, rotate: -120, opacity: 0, duration: 0.8, ease: 'back.out(1.6)' })
    .to(temp, { v: 400, duration: 1.3, ease: 'power2.inOut', onUpdate: () => { $('#temp').textContent = Math.round(temp.v); } }, 0.1)
    .to('.loader', { yPercent: -100, duration: 0.9, ease: 'power4.inOut' }, '+=0.15')
    .from('.hero__stage', { scale: 1.25, duration: 1.6, ease: 'power3.out' }, '-=0.6')
    .from('.hero__title .li', { yPercent: 105, duration: 1.1, stagger: 0.12, ease: 'power4.out' }, '-=1.3')
    .from('.hero__eyebrow, .hero__sub, .hero__ctas, .hero__jp, .hero__scroll', { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, '-=0.8')
    .add(() => { $('.loader')?.remove(); PH.lenis?.start(); });
  // safety: never trap the page behind the loader
  setTimeout(() => { if ($('.loader')) intro.progress(1, false); }, 6000);

  embers($('.embers'));

  const mm = gsap.matchMedia();
  mm.add({ desk: '(min-width: 900px)', mob: '(max-width: 899px)' }, (ctx) => {
    const { desk } = ctx.conditions;

    /* hero: stage folds into a framed card, statement rises */
    gsap.set('.hero__statement', { opacity: 1 });
    const statementLines = $$('.hero__statement .li');
    gsap.set(statementLines, { yPercent: 110 });
    const htl = gsap.timeline({
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=130%', pin: true, scrub: 0.7, anticipatePin: 1 },
    });
    htl
      .to('.hero__title .ch', { yPercent: -115, stagger: { each: 0.025, from: 'center' }, ease: 'power2.in', duration: 0.5 }, 0)
      .to('.hero__eyebrow, .hero__sub, .hero__ctas, .hero__scroll, .hero__jp', { opacity: 0, y: -30, duration: 0.3 }, 0)
      .to('.hero__stage', { clipPath: desk ? 'inset(12% 8% 12% 8% round 28px)' : 'inset(10% 5% 14% 5% round 22px)', ease: 'none', duration: 1 }, 0.05)
      .to('.hero__shade', { opacity: 0.5, duration: 1 }, 0.05)
      .to(statementLines, { yPercent: 0, stagger: 0.12, ease: 'power3.out', duration: 0.45 }, 0.45)
      .to({}, { duration: 0.25 });
    if (desk) {
      htl.to('.hero__panel--l', { xPercent: -18, opacity: 0.35, ease: 'none', duration: 1 }, 0.05)
         .to('.hero__panel--r', { xPercent: 18, opacity: 0.35, ease: 'none', duration: 1 }, 0.05)
         .to('.hero__panel--c', { scale: 1.08, ease: 'none', duration: 1 }, 0.05);
    }

    /* chef */
    $$('.chef .count').forEach((el) => {
      const o = { v: 0 };
      gsap.to(o, { v: +el.dataset.to, ease: 'none', onUpdate: () => { el.textContent = Math.round(o.v); },
        scrollTrigger: { trigger: '.chef', start: 'top 80%', end: 'top 20%', scrub: 0.5 } });
    });
    $$('.reveal-words > span').forEach((s) => {
      gsap.fromTo(splitWords(s), { opacity: 0.12 }, { opacity: 1, stagger: 0.05, ease: 'none',
        scrollTrigger: { trigger: '.chef__bio', start: 'top 80%', end: 'bottom 45%', scrub: true } });
    });
    gsap.fromTo('.chef__mask', { clipPath: 'inset(100% 0% 0% 0% round 22px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 22px)', ease: 'power3.inOut', duration: 1.4,
      scrollTrigger: { trigger: '.chef__media', start: 'top 80%' },
    });
    gsap.fromTo('.chef__mask img', { yPercent: -12, scale: 1.25 }, { yPercent: 0, scale: 1, ease: 'none',
      scrollTrigger: { trigger: '.chef__media', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.chef__jp', { yPercent: 40, opacity: 0 }, { yPercent: -30, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.chef__media', start: 'top 85%', end: 'bottom top', scrub: true } });
    gsap.fromTo('.chef__family', { y: 120, rotate: 14 }, { y: -40, rotate: 4, ease: 'none',
      scrollTrigger: { trigger: '.chef', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* the show: horizontal pinned track */
    const track = $('.show__track');
    const dist = () => track.scrollWidth - innerWidth;
    const skewSet = gsap.quickSetter('.clip', 'skewX', 'deg');
    const skewProxy = { s: 0 };
    const clampSkew = gsap.utils.clamp(-7, 7);
    const hs = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.show', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8,
        invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (self) => {
          gsap.set('.show__progress span', { scaleX: self.progress });
          const s = clampSkew(self.getVelocity() / -350);
          if (Math.abs(s) > Math.abs(skewProxy.s)) {
            skewProxy.s = s;
            gsap.to(skewProxy, { s: 0, duration: 0.8, ease: 'power3', overwrite: true, onUpdate: () => skewSet(skewProxy.s) });
          }
        },
      },
    });
    $$('.clip').forEach((clip) => {
      gsap.fromTo(clip.querySelector('.clip__vid'), { scale: 0.82, rotate: desk ? 3 : 0 }, {
        scale: 1, rotate: 0, ease: 'none',
        scrollTrigger: { trigger: clip, containerAnimation: hs, start: 'left right', end: 'center 55%', scrub: true },
      });
    });

    /* setup: scroll-scrubbed sequence */
    const steps = $$('.step');
    let cur = 0;
    gsap.to(seq, {
      f: SEQ_N - 1, ease: 'none', onUpdate: drawSeq,
      scrollTrigger: {
        trigger: '.setup', start: 'top top', end: '+=260%', pin: true, scrub: 0.4,
        onUpdate: (self) => {
          const p = self.progress;
          const i = p < 0.33 ? 0 : p < 0.6 ? 1 : 2;
          if (i !== cur) { steps[cur].classList.remove('is-active'); steps[i].classList.add('is-active'); cur = i; }
          gsap.set('.setup__bar span', { scaleX: p });
        },
      },
    });
    gsap.from('.setup__price', { scale: 0.6, opacity: 0, duration: 0.8, ease: 'back.out(2)',
      scrollTrigger: { trigger: '.setup', start: () => 'top+=' + innerHeight * 1.6 + ' top', toggleActions: 'play none none reverse' } });

    /* menu */
    gsap.from('.pkg', { y: 120, rotateX: -18, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.pkgs', start: 'top 82%' } });
    gsap.from('.extra', { y: 40, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '.extras', start: 'top 88%' } });
    if (desk) {
      $$('.pkg').forEach((card) => {
        const rx = gsap.quickTo(card, 'rotateX', { duration: 0.6, ease: 'power3' });
        const ry = gsap.quickTo(card, 'rotateY', { duration: 0.6, ease: 'power3' });
        card.addEventListener('pointermove', (e) => {
          const r = card.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 8);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
        });
        card.addEventListener('pointerleave', () => { rx(0); ry(0); });
      });
    }

    /* section headings */
    $$('.sec-head, .quote__form > .h2, .faq .h2, .show__intro, .latest__head').forEach((el) => {
      gsap.from(el.children, { y: 50, opacity: 0, duration: 1, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    gsap.from('.ticket', { y: 100, rotate: 8, opacity: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: '.quote__grid', start: 'top 75%' } });

    /* latest reels slide in */
    gsap.from('#latestRow', { x: 160, opacity: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: '#latestRow', start: 'top 85%' } });

    /* love */
    $$('.stats .count').forEach((el) => {
      const o = { v: 0 };
      gsap.to(o, { v: +el.dataset.to, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); },
        scrollTrigger: { trigger: '.stats', start: 'top 85%' } });
    });
    gsap.from('.review', { y: 80, opacity: 0, duration: 1.1, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: '.reviews', start: 'top 85%' } });
    gsap.from('.faq details', { y: 30, opacity: 0, duration: 0.7, stagger: 0.05, ease: 'power3.out',
      scrollTrigger: { trigger: '.faq__list', start: 'top 85%' } });

    /* finale: fire through the letters */
    gsap.fromTo('.finale__title', { scale: 1.5, letterSpacing: '0.08em' }, { scale: 1, letterSpacing: '-0.01em', ease: 'none',
      scrollTrigger: { trigger: '.finale__knock', start: 'top bottom', end: 'center center', scrub: true } });
  });

  // pins add scroll space after the browser's own anchor jump, so re-aim #links once layout settles
  addEventListener('load', () => {
    ScrollTrigger.refresh();
    let target = null;
    try { target = startHash ? $(startHash) : null; } catch (e) {}
    if (!target) return;
    intro.progress(1, false);
    // ScrollTrigger knows every pin's added scroll space, so let it compute where the section starts
    const land = () => {
      const st = ScrollTrigger.create({ trigger: target, start: 'top top+=10' });
      const y = st.start;
      st.kill();
      if (PH.lenis) PH.lenis.scrollTo(y, { immediate: true, force: true });
      else scrollTo(0, y);
    };
    requestAnimationFrame(land);
    // late font/video layout can nudge pins; check once more
    setTimeout(() => { if (Math.abs(target.getBoundingClientRect().top - 10) > 30) { ScrollTrigger.refresh(); land(); } }, 700);
    history.replaceState(null, '', location.pathname + location.search + startHash);
  });
})();
