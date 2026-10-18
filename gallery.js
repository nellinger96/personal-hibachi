/* Personal Hibachi: gallery page */
(() => {
  const { $, $$, hasGsap, reduced } = window.PH;
  const PH = window.PH;
  const grid = $('#galGrid');
  const clips = window.PH_CLIPS || [];
  const CAT = { fire: ['Fire', 'Fuego'], food: ['Food', 'Comida'], party: ['Party', 'Fiesta'] };
  const match = (c, f) => f === 'all' || (f === 'new' ? !!c.ig : c.cat === f);
  let filter = 'all';

  grid.innerHTML = clips.map((c, i) => `
    <button class="tile" type="button" data-i="${i}" data-cat="${c.cat}" ${c.ig ? 'data-new' : ''} data-cursor="Sound" data-hover-host>
      <video data-src="assets/video/${c.id}.mp4" poster="assets/img/${c.id}.jpg" muted loop playsinline preload="none" data-hover></video>
      ${c.ig ? '<span class="tile__new"></span>' : ''}
      <span class="tile__cat"></span>
      <span class="tile__title"></span>
    </button>`).join('');
  const tiles = $$('.tile', grid);
  PH.observeVideos(grid);

  function paintText() {
    const es = PH.lang === 'es';
    tiles.forEach((t) => {
      const c = clips[+t.dataset.i];
      $('.tile__title', t).textContent = c[PH.lang];
      $('.tile__cat', t).textContent = CAT[c.cat][es ? 1 : 0];
      const n = $('.tile__new', t);
      if (n) n.textContent = new Date(c.date + 'T12:00').toLocaleDateString(es ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric' });
      t.setAttribute('aria-label', c[PH.lang]);
    });
    const newest = clips.filter((c) => c.date).map((c) => c.date).sort().pop();
    const when = new Date(newest + 'T12:00').toLocaleDateString(es ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    $('#galCount').textContent = es ? `${clips.length} videos · actualizado ${when}` : `${clips.length} videos · updated ${when}`;
  }
  paintText();
  document.addEventListener('ph:lang', paintText);

  $$('#filters button').forEach((b) => {
    $('sup', b).textContent = clips.filter((c) => match(c, b.dataset.f)).length;
    b.addEventListener('click', () => setFilter(b.dataset.f));
  });

  function setFilter(f) {
    if (f === filter) return;
    filter = f;
    $$('#filters button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === f)));
    const useFlip = hasGsap && !reduced && window.Flip;
    const state = useFlip ? Flip.getState(tiles) : null;
    tiles.forEach((t) => { t.hidden = !match(clips[+t.dataset.i], f); });
    if (useFlip) {
      Flip.from(state, {
        duration: 0.6, ease: 'power3.inOut', scale: true, absolute: true, stagger: 0.015,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.02 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.35 }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    }
  }

  grid.addEventListener('click', (e) => {
    const t = e.target.closest('.tile');
    if (!t) return;
    const visible = tiles.filter((n) => !n.hidden);
    PH.lightbox(visible.map((n) => clips[+n.dataset.i]), visible.indexOf(t));
  });

  if (!hasGsap || reduced) return;
  if (window.Flip) gsap.registerPlugin(Flip);

  gsap.from('.gal-hero__title > span', { yPercent: 40, opacity: 0, duration: 1.2, ease: 'power4.out', delay: 0.1 });
  gsap.from('.gal-hero__row, .filters', { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.35, stagger: 0.1 });
  gsap.set(tiles, { opacity: 0, y: 60 });
  ScrollTrigger.batch(tiles, {
    start: 'top 92%',
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, stagger: 0.07, ease: 'power3.out', overwrite: true }),
  });
  addEventListener('load', () => ScrollTrigger.refresh());
})();
