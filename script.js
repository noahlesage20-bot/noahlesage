document.addEventListener('DOMContentLoaded', () => {

  // ── Elements ──────────────────────────────────────────────────────────────
  const loader        = document.getElementById('loader');
  const loaderBg      = document.getElementById('loader-bg');
  const loaderBrand   = document.getElementById('loader-brand');
  const loaderPct     = document.getElementById('loader-percent');
  const site          = document.getElementById('site');
  // overlay supprimé — #page-transition n'existe plus dans le DOM
  const navLinks      = document.querySelectorAll('.js-nav');
  const pages         = document.querySelectorAll('.page');
  const cursorDot     = document.getElementById('cursor-dot');

  // ── Titres — split ligne par ligne (masque overflow:hidden + GSAP) ───────
  // Chaque ligne (séparée par un <br>, ou la totalité du texte s'il n'y en a
  // pas) est enveloppée dans .gsap-line (le masque, overflow:hidden en CSS)
  // contenant .gsap-line-inner (l'élément que GSAP fait glisser verticalement).
  const TITLE_MASK_SEL = '.mc-split-title, .pg-sub-title, .hello-line';

  function wrapMaskLines(el) {
    if (!el || el.dataset.maskDone) return;
    el.dataset.maskDone = '1';

    // Un data-i18n sur l'élément doit être relocalisé sur la ligne interne :
    // setLang() fait el.textContent = ... et détruirait sinon le masque.
    const i18nKey = el.dataset.i18n;
    if (i18nKey) el.removeAttribute('data-i18n');

    const lines = el.innerHTML.split(/<br\s*\/?>/i).map(s => s.trim()).filter(Boolean);
    el.innerHTML = lines.map(line => {
      const attr = (i18nKey && lines.length === 1) ? ` data-i18n="${i18nKey}"` : '';
      return `<span class="gsap-line"><span class="gsap-line-inner"${attr}>${line}</span></span>`;
    }).join('');
  }

  document.querySelectorAll(TITLE_MASK_SEL).forEach(wrapMaskLines);

  // ── Protection des assets visuels ────────────────────────────────────────
  document.addEventListener('contextmenu', e => {
    const isMedia = e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO';
    const inMediaContainer = e.target.closest(
      '.hero-img-wrap, .work-img-area, .voyage-photo, .voyage-gallery-item, ' +
      '.voyage-lightbox, #loader'
    );
    if (isMedia || inMediaContainer) e.preventDefault();
  });

  document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') e.preventDefault();
  });

  // ── Custom Cursor — GSAP QuickTo ─────────────────────────────────────────
  const cursorLabel = document.getElementById('cursor-label');
  let mX = window.innerWidth / 2, mY = window.innerHeight / 2;
  let cursorVisible = false;
  let magnetActive  = false;

  // Centrage via GSAP (remplace le CSS transform: translate(-50%,-50%))
  gsap.set(cursorDot, { xPercent: -50, yPercent: -50, opacity: 0 });

  // QuickTo : léger lag pour un effet premium (allégé — 0.42 se sentait lent à l'usage)
  const setX = gsap.quickTo(cursorDot, 'x', { duration: 0.18, ease: 'power3' });
  const setY = gsap.quickTo(cursorDot, 'y', { duration: 0.18, ease: 'power3' });

  document.addEventListener('mousemove', e => {
    mX = e.clientX;
    mY = e.clientY;
    if (!magnetActive) { setX(mX); setY(mY); }
    if (!cursorVisible) {
      gsap.to(cursorDot, { opacity: 1, duration: 0.3 });
      cursorVisible = true;
    }
  });

  document.addEventListener('mouseleave', () => {
    gsap.to(cursorDot, { opacity: 0, duration: 0.3 });
    cursorVisible = false;
  });

  // ── Effet magnétique — nav + boutons ─────────────────────────────────────
  const magnetTargets = [
    { sel: '#main-nav a', textEl: null },
    { sel: '.logo',       textEl: null },
  ];
  // NB : .floating-next-project est volontairement absente de cette liste.
  // Le magnétisme écrit un transform en style inline sur l'élément survolé,
  // ce qui écrase silencieusement la règle CSS .is-visible qui contrôle son
  // apparition/disparition (l'inline gagne toujours sur la classe) — la
  // carte restait visible en permanence dès qu'on la survolait pour cliquer.

  magnetTargets.forEach(({ sel, textEl }) => {
    document.querySelectorAll(sel).forEach(el => {
      const inner = textEl ? el.querySelector(textEl) : el;

      el.addEventListener('mouseenter', () => { magnetActive = true; });

      el.addEventListener('mousemove', e => {
        const r  = el.getBoundingClientRect();
        const cx = r.left + r.width  / 2;
        const cy = r.top  + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;

        // Curseur attiré vers le centre de l'élément
        setX(cx + dx * 0.28);
        setY(cy + dy * 0.28);

        // Texte suit la souris légèrement
        if (inner) gsap.to(inner, { x: dx * 0.16, y: dy * 0.16, duration: 0.35, ease: 'power2.out' });
      });

      el.addEventListener('mouseleave', () => {
        magnetActive = false;
        setX(mX); setY(mY);
        if (inner) gsap.to(inner, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.45)' });
      });
    });
  });

  // ── État VIEW — miniatures photo ─────────────────────────────────────────
  document.querySelectorAll('.pg-event-item, .pg-voyage-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorLabel.textContent = 'VIEW';
      cursorDot.classList.add('is-view');
    });
    el.addEventListener('mouseleave', () => {
      cursorDot.classList.remove('is-view');
    });
  });

  // ── Loader = Orbit ───────────────────────────────────────────────────────
  // Ordre aligné sur la roulette Work : Matière Créative, From S to XL,
  // Tapage, Palais Bulles, Pelago, Cal Smith, Poster et animation.
  const O_SRCS  = ['mc-poster.jpg', 'From S to XL anim.mp4', './Tapage/Publi TAPAGE 19:12.mp4', 'Palais bulles.jpg', 'Pelago/Affiche_teasing3.jpg', 'Cal Smith.jpg', 'Poster et animation/a2.jpg'];
  const O_TILTS = [-8, 12, -4, 9, -13, 6, -10];
  O_SRCS.forEach(src => { const i = new Image(); i.src = src; });

  const O_VW = window.innerWidth, O_VH = window.innerHeight;
  const O_N  = O_SRCS.length;
  // Mobile : cartes proportionnellement plus grosses (ratio de largeur plus
  // élevé) — sur un écran étroit, 17% de la largeur donnait des vignettes
  // minuscules ; le rayon suit pour éviter qu'elles ne se chevauchent trop.
  const O_MOBILE = O_VW <= 768;
  const O_R  = Math.min(O_VW, O_VH) * (O_MOBILE ? 0.30 : 0.26);
  const O_W  = O_MOBILE ? Math.min(O_VW * 0.30, 150) : Math.min(O_VW * 0.17, 210);
  const O_H  = O_W * 1.32;
  const O_CX = O_VW / 2;
  const O_CY = O_VH / 2;

  let orbitAngle   = 0;
  let orbitRunning = true;
  let progress     = 0;
  let done         = false;

  // Build orbit wraps inside loader (% and brand overlay on top via z-index:1)
  const orbitWraps = O_SRCS.map((src, i) => {
    const a = (i / O_N) * 2 * Math.PI;
    const x = O_CX + Math.cos(a) * O_R - O_W / 2;
    const y = O_CY + Math.sin(a) * O_R - O_H / 2;
    const wrap = document.createElement('div');
    wrap.style.cssText = `
      position:absolute;width:${O_W}px;height:${O_H}px;
      overflow:hidden;border-radius:4px;
      box-shadow:0 4px 22px rgba(0,0,0,0.12);
      will-change:transform;opacity:0;transition:opacity 0.5s ease;
      transform:translate(${x}px,${y}px) rotate(${O_TILTS[i]}deg);
    `;
    const media = src.endsWith('.mp4') ? document.createElement('video') : document.createElement('img');
    media.src = src;
    if (media.tagName === 'VIDEO') { media.muted = true; media.loop = true; media.autoplay = true; media.setAttribute('playsinline',''); }
    media.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    wrap.appendChild(media);
    loader.appendChild(wrap);
    return wrap;
  });

  // Stagger appear
  orbitWraps.forEach((w, i) => setTimeout(() => { w.style.opacity = '1'; }, 150 + i * 90));

  // Continuous orbit loop (runs all through loading)
  function orbitLoop() {
    if (!orbitRunning) return;
    orbitAngle += 0.45;
    orbitWraps.forEach((wrap, i) => {
      const a = ((i / O_N) * 360 + orbitAngle) * Math.PI / 180;
      const x = O_CX + Math.cos(a) * O_R - O_W / 2;
      const y = O_CY + Math.sin(a) * O_R - O_H / 2;
      wrap.style.transform = `translate(${x}px,${y}px) rotate(${O_TILTS[i]}deg)`;
    });
    requestAnimationFrame(orbitLoop);
  }
  requestAnimationFrame(orbitLoop);

  // % counter (orbit already running, just update text)
  const step = () => {
    if (done) return;
    progress += Math.floor(Math.random() * 4) + 2;
    if (progress >= 100) {
      progress = 100;
      done = true;
      loaderPct.textContent = '100%';
      loaderBrand.classList.add('is-visible');
      setTimeout(revealSite, 420);
      return;
    }
    loaderPct.textContent = progress + '%';
    setTimeout(step, 16 + Math.random() * 14);
  };
  setTimeout(step, 120);

  // ── Scramble typographie ──────────────────────────────────────────────────
  const SCRAMBLE_CHARS = 'abcdefghijklmnopqrstuvwxyz';

  function scrambleLine(el, text, delay) {
    if (!el) return;
    el.style.opacity = '0';
    el.textContent   = '';
    setTimeout(() => {
      el.style.opacity = '1';
      let frame = 0;
      const FPR   = 3; // frames to settle per character
      const total = text.length * FPR + 8;
      (function tick() {
        let out = '';
        for (let i = 0; i < text.length; i++) {
          if (text[i] === ' ') { out += ' '; continue; }
          out += frame >= (i + 1) * FPR
            ? text[i]
            : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
        el.textContent = out;
        if (++frame < total) requestAnimationFrame(tick);
        else el.textContent = text;
      })();
    }, delay);
  }

  function burstFunDots() {
    if (!funLayer) return;
    const isMobile = window.innerWidth <= 768;
    const count = isMobile ? 8 : 14;
    const size  = isMobile ? 60 : 80;
    const w = window.innerWidth, h = window.innerHeight;
    const tempDots = [];

    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 'fun-dot';
      dot.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*(w-size)}px;top:${Math.random()*(h-size)}px;pointer-events:none`;
      funLayer.appendChild(dot);
      tempDots.push(dot);
      setTimeout(() => dot.classList.add('is-in'), i * 60);
    }

    // Disparition automatique après 1.6s
    setTimeout(() => {
      tempDots.forEach((dot, i) => setTimeout(() => {
        dot.classList.remove('is-in');
        dot.classList.add('is-out');
        setTimeout(() => dot.remove(), 430);
      }, i * 35));
    }, 1600);
  }

  function revealSite() {
    // Suppression du loader en priorité absolue — rien ne doit bloquer ça
    setTimeout(() => { if (loader) loader.classList.add('is-gone'); }, 480);
    setTimeout(() => { orbitRunning = false; if (loader) loader.remove(); }, 1700);

    // Réveil du site
    if (site) site.classList.remove('is-hidden');
    const workPage = document.getElementById('page-work');
    if (workPage) {
      gsap.set(workPage, { y: 30, opacity: 0 });
      // Contenu immédiat pré-caché — révélé en même temps que la page, pas après
      // (même logique que navigateTo, pour éviter le flash texte/animation globale)
      gsap.set(workPage.querySelectorAll(ENTER_REVEAL_SEL), { opacity: 0, y: 22 });
      gsap.set(workPage.querySelectorAll(TITLE_LINES_SEL), { yPercent: 110 });
      workPage.classList.add('is-active');

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(workPage, { clearProps: 'transform,opacity' });
          initRevealGSAP('work');
        }
      });
      tl.addLabel('enter');
      tl.to(workPage, { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', delay: 0.1 }, 'enter');
      tl.to(workPage.querySelectorAll(TITLE_LINES_SEL), {
        yPercent: 0,
        duration: 0.95, ease: 'power4.out',
        stagger: 0.08,
        clearProps: 'transform',
      }, 'enter+=0.15');
      tl.to(workPage.querySelectorAll(ENTER_REVEAL_SEL), {
        opacity: 1, y: 0,
        duration: 0.6, ease: 'power3.out',
        stagger: 0.06,
        clearProps: 'transform,opacity',
      }, 'enter+=0.22');
    }

    // État navigation (isolé pour ne pas bloquer le reste)
    try {
      current = 'work';
      updateNavActive('work');
      // Coupe les <video autoplay> des autres pages projet : le navigateur
      // les démarre tous dès le chargement (visibility:hidden n'empêche pas
      // l'autoplay), et ce sweep n'existe normalement que dans navigateTo() —
      // cette entrée sur 'work' passe par le loader, pas par navigateTo(),
      // donc sans ça toutes les animations en boucle des autres pages
      // tournaient invisiblement en arrière-plan indéfiniment.
      pages.forEach(p => {
        if (p !== workPage) p.querySelectorAll('video').forEach(v => v.pause());
      });
    } catch (e) {}

    setTimeout(burstFunDots, 1750);
    setTimeout(() => {
      const el = document.querySelector('#work-scroll-hint .work-hint-line');
      if (el) scrambleLine(el, 'scroll ↑ ↓', 200);
    }, 700);
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  let current = 'work';
  let transitioning = false;
  let navSafetyTimer = null;

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      if (transitioning) return;
      const target   = link.dataset.target;
      const isLogo   = link.classList.contains('logo');

      if (target === current) {
        // Déjà sur la page ciblée : pour "work" (logo "Ringer Studio." ou
        // lien "work"), un clic ramène la liste de projets tout en haut, sur
        // le premier projet — plutôt que de ne rien faire.
        if (target === 'work') {
          const pageEl = document.getElementById('page-work');
          if (pageEl) pageEl.scrollTo({ top: 0, behavior: 'smooth' });
          if (workRoulette) workRoulette.reset();
        }
        return;
      }

      // Le logo "Ringer Studio." = home, et la home EST le 1er projet de
      // Work : où qu'on l'ait laissée, la roulette est remise sur le 1er
      // projet avant même la transition (invisible, la page work n'étant
      // pas encore affichée) — pour toujours atterrir sur le même état
      // depuis n'importe quelle autre page du site.
      if (isLogo && target === 'work' && workRoulette) workRoulette.reset();

      navigateTo(target);
    });
  });

  const projPages     = new Set(['matiere','stoxl','tapage','palais','calsmith','poster','pelago']);
  const photoSubPages = new Set(['photo-event','photo-street','photo-voyage']);
  const siteHeader    = document.getElementById('header');
  const pageTitles = {
    home: 'Ringer Studio.', work: 'Work — Ringer Studio.', photo: 'Photo — Ringer Studio.',
    hello: 'Contact — Ringer Studio.', matiere: 'Matière Créative — Ringer Studio.',
    stoxl: 'From S to XL — Ringer Studio.', tapage: 'Tapage — Ringer Studio.',
    palais: 'Palais Bulles — Ringer Studio.', calsmith: 'Cal Smith — Ringer Studio.',
    poster: 'Poster — Ringer Studio.', pelago: 'Pelago — Ringer Studio.',
    'photo-event': 'Évènement — Ringer Studio.',
    'photo-street': 'Street — Ringer Studio.',
    'photo-voyage': 'Voyage — Ringer Studio.',
  };

  function updateNavActive(target) {
    const workPages  = ['work','matiere','stoxl','tapage','palais','calsmith','poster','pelago'];
    const photoPages = ['photo','photo-event','photo-street','photo-voyage'];
    const mainTarget = workPages.includes(target) ? 'work'
                     : photoPages.includes(target) ? 'photo'
                     : target;
    navLinks.forEach(l => l.classList.toggle('is-active', l.dataset.target === mainTarget));
    if (pageTitles[target]) document.title = pageTitles[target];
  }

  const globalFooter = document.getElementById('global-footer');

  // ── GSAP ScrollTrigger — Reveals organiques ───────────────────────────────
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  const gsapPagesSetup = new Set();

  // Blocs "immédiats" (au-dessus de la ligne de flottaison) révélés EN SYNC avec
  // l'arrivée de la page — évite le conflit/flash avec l'animation globale de navigateTo()
  // (.hello-line en est exclu : il a son propre reveal ligne par ligne, voir TITLE_MASK_SEL)
  const ENTER_REVEAL_SEL = '.mc-proj-left, .gallery-img-wrap, .proj-roulette, .photo-list-item, .hello-form, .hello-info';
  // Médias révélés au scroll (ScrollTrigger) — pré-cachés à l'avance pour éviter
  // le flash inhérent à gsap.fromTo() quand l'élément est déjà dans le viewport
  const SCROLL_MEDIA_SEL = '.mc-proj-img img, .mc-proj-img video';
  const SCROLL_GRID_SEL  = '.pg-event-item img, .pg-voyage-item img';
  // Lignes de titre (masquées par .gsap-line) à révéler en cascade à l'arrivée de la page
  const TITLE_LINES_SEL = TITLE_MASK_SEL + ' .gsap-line-inner';

  function initRevealGSAP(pageId) {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Au 2e passage : juste recalibrer les positions
    if (gsapPagesSetup.has(pageId)) { ScrollTrigger.refresh(); return; }
    gsapPagesSetup.add(pageId);

    const pageEl = document.getElementById('page-' + pageId);
    if (!pageEl) return;

    const st = trigger => ({
      scroller:      pageEl,
      trigger,
      start:         'top 90%',
      toggleActions: 'play none none none',
    });

    // ① Images projet — zoom inversé scale 1.1→1, clippé par overflow:hidden du conteneur
    pageEl.querySelectorAll('.mc-proj-img').forEach(wrap => {
      const media = wrap.querySelector('img, video');
      if (!media) return;
      gsap.fromTo(media,
        { scale: 1.1, opacity: 0 },
        {
          scale: 1, opacity: 1,
          duration: 1.4, ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: st(wrap),
        }
      );
    });

    // ② Grilles photo — batch + micro-stagger pour un reveal en cascade naturel
    const gridImgs = [...pageEl.querySelectorAll(SCROLL_GRID_SEL)];
    if (gridImgs.length) {
      ScrollTrigger.batch(gridImgs, {
        scroller: pageEl,
        start:    'top 92%',
        onEnter: batch => gsap.fromTo(batch,
          { scale: 1.1, opacity: 0 },
          {
            scale: 1, opacity: 1,
            duration: 1.1, ease: 'power3.out',
            stagger: 0.07, clearProps: 'transform,opacity',
          }
        ),
      });
    }

    // ③ Blocs texte / méta — fondu + légère dérive verticale
    pageEl.querySelectorAll('.mc-desc, .mc-quote, .mc-fiche').forEach(el => {
      gsap.from(el, {
        opacity: 0, y: 22,
        duration: 0.95, ease: 'power3.out',
        scrollTrigger: st(el),
      });
    });

    // ④ Fallback — éléments .reveal non couverts (hello, etc.)
    const handled = new Set([
      ...pageEl.querySelectorAll(
        '.mc-proj-img, .mc-desc, .mc-quote, .mc-fiche, .pg-event-item, .pg-voyage-item'
      ),
    ]);
    pageEl.querySelectorAll('.reveal').forEach(el => {
      if (handled.has(el)) return;
      gsap.from(el, {
        opacity: 0, y: 16,
        duration: 0.85, ease: 'power3.out',
        scrollTrigger: st(el),
      });
    });

    ScrollTrigger.refresh();
  }

  // ── Bande scroll horizontale (fond noir) — composant réutilisable ────────
  // Aucun lien avec le scroll de la page : descendre la page ne bouge jamais
  // les visuels. Le panoramique ne réagit qu'à deux gestes faits directement
  // dans la case — molette/trackpad (wheel) et cliquer-glisser (drag), tous
  // deux avec preventDefault, posés sur .proj-strip. Même famille de
  // pattern que la roulette Work/Photo (initRoulette, plus haut) pour la
  // molette ; le drag suit le curseur au pixel près.
  //
  // Panoramique de GAUCHE À DROITE : la piste part entièrement décalée à
  // gauche (le DERNIER item du DOM, aligné à droite de la piste, est donc
  // visible en premier) et revient à sa position naturelle en bout de
  // course — voir l'ordre DOM (volontairement inversé) des .proj-strip-item
  // dans index.html.
  //
  // Lissage du mouvement via une boucle requestAnimationFrame (currentX
  // rattrape targetX par interpolation) — le drag, lui, suit le curseur sans
  // lissage (currentX = targetX pendant le drag) pour rester réactif au
  // pixel près pendant qu'on glisse.
  //
  // initProjStrip(pageId) s'appelle une fois par page utilisant ce
  // composant (voir les appels tout en bas de cette fonction) — chaque
  // page a sa propre instance indépendante (mesures, drag, molette).
  function initProjStrip(pageId) {
    const strip = document.querySelector('#page-' + pageId + ' .proj-strip');
    const track = document.querySelector('#page-' + pageId + ' .proj-strip-track');
    if (!strip || !track) return;
    const items = [...track.querySelectorAll('.proj-strip-item')];

    let panDist     = 0;     // distance horizontale totale à parcourir (dépend de la largeur réelle de la piste)
    let itemCenters = [];    // centre de chaque item dans le référentiel de la piste (statique, cache en dur)
    let targetX     = 0;     // position visée
    let currentX    = 0;     // position réellement appliquée (lissée hors drag, immédiate pendant le drag)
    let dragging    = false;
    let dragStartX  = 0;
    let dragFromX   = 0;
    let dragMoved   = 0;     // distance totale parcourue pendant le drag en cours — sert à distinguer un clic d'un glisser

    function measure() {
      panDist     = Math.max(0, track.scrollWidth - strip.clientWidth);
      targetX     = Math.max(-panDist, Math.min(0, targetX));
      itemCenters = items.map(el => el.offsetLeft + el.offsetWidth / 2);
    }

    function applyFocusEffect() {
      // Effet de mise au point : les visuels proches du centre de la case
      // restent pleins ; ceux qui approchent des bords s'estompent et
      // rétrécissent légèrement. Calcul pur (centres mis en cache dans
      // measure()) — pas de lecture de layout par item à chaque frame.
      const half = strip.clientWidth / 2;
      items.forEach((item, i) => {
        const screenCenter = itemCenters[i] + currentX;
        const t = Math.max(0, Math.min(1, Math.abs(screenCenter - half) / half));
        item.style.transform = `scale(${(1 - t * 0.1).toFixed(3)})`;
        item.style.opacity   = (1 - t * 0.4).toFixed(3);
      });
    }

    function render() {
      requestAnimationFrame(render);
      if (window.innerWidth <= 900) return;

      if (dragging) {
        currentX = targetX; // suit le curseur sans délai pendant le drag
      } else {
        currentX += (targetX - currentX) * 0.16;
        if (Math.abs(targetX - currentX) < 0.05) currentX = targetX;
      }
      track.style.transform = `translateX(${currentX}px)`;
      applyFocusEffect();
    }

    measure();
    targetX  = -panDist; // départ : dernier item du DOM (le hero) visible en premier
    currentX = targetX;
    requestAnimationFrame(render);

    if (window.innerWidth > 900) {
      // Molette / trackpad
      strip.addEventListener('wheel', e => {
        e.preventDefault();
        // Trackpad (swipe horizontal) ou molette classique (verticale) :
        // on prend l'axe qui porte le plus de signal.
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        targetX = Math.max(-panDist, Math.min(0, targetX + delta));
      }, { passive: false });

      // Cliquer-glisser
      strip.addEventListener('mousedown', e => {
        dragging   = true;
        dragStartX = e.clientX;
        dragFromX  = targetX;
        dragMoved  = 0;
        e.preventDefault();
      });
      window.addEventListener('mousemove', e => {
        if (!dragging) return;
        const dx = e.clientX - dragStartX;
        dragMoved = Math.max(dragMoved, Math.abs(dx));
        targetX = Math.max(-panDist, Math.min(0, dragFromX + dx));
      });
      window.addEventListener('mouseup', () => { dragging = false; });
    }

    window.addEventListener('resize', measure);

    // Les médias (surtout les vidéos) finissent de charger après coup et
    // changent scrollWidth : on remesure une fois que tout est prêt, pour ne
    // jamais couper la dernière image du panoramique.
    const media   = [...track.querySelectorAll('img, video')];
    let   pending = media.length;
    const onReady = () => { if (--pending <= 0) measure(); };
    media.forEach(m => {
      if (m.tagName === 'IMG') {
        if (m.complete) onReady(); else m.addEventListener('load', onReady, { once: true });
      } else {
        if (m.readyState >= 1) onReady(); else m.addEventListener('loadedmetadata', onReady, { once: true });
      }
    });

    // Clic sur un visuel → lightbox plein écran (images ET vidéos, voir
    // stripLbOpen) — sauf si ce "clic" est en fait la fin d'un glisser
    // (dragMoved dépasse quelques pixels), sinon on ouvrirait la lightbox à
    // chaque fin de drag, ou si l'item est une case placeholder (pas encore
    // de média — voir .proj-strip-placeholder). La liste reflète l'ordre
    // DOM réel de la piste — pas de duplication à maintenir à la main ;
    // une entrée `null` marque un placeholder, jamais ouvert en lightbox.
    const lbList = items.map(item => {
      const m = item.querySelector('img, video');
      if (!m) return null;
      return { type: m.tagName.toLowerCase(), src: m.getAttribute('src') };
    });
    items.forEach((item, i) => {
      item.addEventListener('click', () => {
        if (dragMoved > 5) return;
        if (!lbList[i]) return;
        stripLbOpen(lbList, i);
      });
    });
  }
  initProjStrip('tapage');

  // ── Cal Smith — feed Instagram fictif ─────────────────────────────────
  // Clic sur une vignette de la grille → lightbox plein écran partagée
  // (stripLbOpen, même composant que les bandes scroll horizontales).
  function initCalSmithFeed() {
    const cells = [...document.querySelectorAll('#page-calsmith .cs-ig-cell')];
    if (!cells.length) return;
    const lbList = cells.map(cell => {
      const img = cell.querySelector('img');
      return { type: 'img', src: img.getAttribute('src') };
    });
    cells.forEach((cell, i) => {
      cell.addEventListener('click', () => stripLbOpen(lbList, i));
    });
  }
  initCalSmithFeed();

  // ── Vidéos longues (son) — badge "voir en plein écran" au survol ─────────
  // Poster et animation + Cal Smith : ouvre la même lightbox partagée que les
  // bandes scroll, mais avec son + contrôles natifs (voir stripLbShow, qui
  // désactive muted/loop quand l'entrée passe muted:false).
  function initVideoExpand() {
    document.querySelectorAll('.mc-vid-expand').forEach(wrap => {
      const video = wrap.querySelector('video');
      if (!video) return;
      wrap.addEventListener('click', () => {
        stripLbOpen([{ type: 'video', src: video.getAttribute('src'), muted: false, loop: false }], 0);
      });
    });
  }
  initVideoExpand();

  // ── Lightbox plein écran (images ET vidéos) — bande scroll horizontale ───
  // Calquée sur le lightbox photo partagé (pgLb*) plus bas dans ce fichier,
  // mais dédiée puisqu'elle doit aussi savoir lire une vidéo — pgLbImg est un
  // simple <img>, incompatible avec les .mp4 des bandes scroll. Un <img> et
  // un <video> coexistent dans le DOM, un seul affiché à la fois selon le
  // type de l'entrée courante. Partagée par toutes les pages utilisant
  // .proj-strip (une seule instance, comme pgLb* pour les galeries photo).
  let stripLbEl    = null;
  let stripLbImg   = null;
  let stripLbVideo = null;
  let stripLbPrev  = null;
  let stripLbNext  = null;
  let stripLbList  = [];
  let stripLbIdx   = 0;

  function stripLbBuild() {
    stripLbEl = document.createElement('div');
    stripLbEl.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:9700',
      'background:rgba(0,0,0,0.94)',
      'display:none', 'align-items:center', 'justify-content:center',
      'cursor:zoom-out', 'opacity:0', 'transition:opacity 0.22s ease',
    ].join(';');

    const mediaCSS = [
      'max-width:92vw', 'max-height:92vh', 'object-fit:contain', 'display:none',
      'cursor:default', 'user-select:none', '-webkit-user-drag:none',
      'transition:opacity 0.18s ease',
    ].join(';');

    stripLbImg = document.createElement('img');
    stripLbImg.style.cssText = mediaCSS;
    stripLbImg.addEventListener('click', e => e.stopPropagation());

    stripLbVideo = document.createElement('video');
    stripLbVideo.muted = true;
    stripLbVideo.loop  = true;
    stripLbVideo.setAttribute('playsinline', '');
    stripLbVideo.style.cssText = mediaCSS;
    stripLbVideo.addEventListener('click', e => e.stopPropagation());

    const mkBtn = (css, html, fn) => {
      const b = document.createElement('button');
      b.innerHTML = html;
      b.style.cssText = css + 'background:none;border:none;color:#fff;cursor:pointer;opacity:0.55;transition:opacity 0.2s;';
      b.addEventListener('mouseenter', () => b.style.opacity = '1');
      b.addEventListener('mouseleave', () => b.style.opacity = '0.55');
      b.addEventListener('click', e => { e.stopPropagation(); fn(); });
      return b;
    };
    stripLbPrev = mkBtn('position:absolute;left:20px;top:50%;transform:translateY(-50%);font-size:26px;padding:14px;', '&#8592;', () => stripLbNav(-1));
    stripLbNext = mkBtn('position:absolute;right:20px;top:50%;transform:translateY(-50%);font-size:26px;padding:14px;', '&#8594;', () => stripLbNav(1));
    const close = mkBtn('position:absolute;top:16px;right:22px;font-size:30px;padding:8px;line-height:1;', '&times;', stripLbClose);

    stripLbEl.append(stripLbImg, stripLbVideo, stripLbPrev, stripLbNext, close);
    stripLbEl.addEventListener('click', stripLbClose);
    document.body.appendChild(stripLbEl);
  }

  function stripLbShow() {
    const entry = stripLbList[stripLbIdx];
    if (!entry) return;
    if (entry.type === 'video') {
      stripLbImg.style.display = 'none';
      stripLbVideo.src = entry.src;
      // Par défaut (bandes Tapage/Poster) : muet + boucle, comme en aperçu.
      // Les vidéos longues ouvertes via initVideoExpand() passent muted:false
      // pour garder le son et les contrôles natifs (pause/volume/scrub).
      stripLbVideo.muted    = entry.muted !== false;
      stripLbVideo.loop     = entry.loop  !== false;
      stripLbVideo.controls = entry.muted === false;
      stripLbVideo.style.display = 'block';
      stripLbVideo.currentTime = 0;
      stripLbVideo.play().catch(() => {});
    } else {
      stripLbVideo.pause();
      stripLbVideo.removeAttribute('src');
      stripLbVideo.style.display = 'none';
      stripLbImg.src = entry.src;
      stripLbImg.style.display = 'block';
    }
  }

  function stripLbOpen(list, idx) {
    stripLbList = list;
    stripLbIdx  = idx;
    if (!stripLbEl) stripLbBuild();
    stripLbShow();
    stripLbEl.style.display = 'flex';
    stripLbEl.style.pointerEvents = 'auto';
    // Un seul élément (ex : vidéo longue ouverte au clic) → pas de flèches
    // prev/next inutiles.
    const showNav = list.length > 1;
    stripLbPrev.style.display = showNav ? '' : 'none';
    stripLbNext.style.display = showNav ? '' : 'none';
    requestAnimationFrame(() => requestAnimationFrame(() => stripLbEl.style.opacity = '1'));
  }

  function stripLbNav(dir) {
    stripLbIdx = (stripLbIdx + dir + stripLbList.length) % stripLbList.length;
    stripLbShow();
  }

  function stripLbClose() {
    if (!stripLbEl) return;
    stripLbEl.style.opacity = '0';
    // Voir le commentaire équivalent dans pgLbClose() : coupe le clic
    // immédiatement, sinon l'overlay invisible reste cliquable 230ms.
    stripLbEl.style.pointerEvents = 'none';
    setTimeout(() => {
      if (!stripLbEl) return;
      stripLbEl.style.display = 'none';
      stripLbVideo.pause();
    }, 230);
  }

  // ── Carte flottante "projet suivant" — un projet au hasard, toutes pages projet ──
  // L'élément vit HORS de toute .page (au niveau racine du site, comme
  // #voyage-overlay etc.) pour ne jamais être piégé par un ancêtre .page qui
  // deviendrait un containing block (transform) et casserait son position:fixed.
  // Architecture volontairement SANS cycle de vie dynamique (pas d'attacher/
  // détacher un écouteur à chaque navigation, source de bugs de timing) :
  // CHAQUE page projet reçoit son écouteur de scroll UNE FOIS, en permanence,
  // dès le chargement du site. Chaque écouteur se désactive lui-même via
  // `is-active` — il ne peut donc jamais agir sur une page qui n'est plus
  // affichée, ni laisser de listener orphelin à nettoyer.
  const PROJECTS = [
    { page: 'matiere',  img: 'mc-poster.jpg',       title: 'Matière Créative' },
    { page: 'stoxl',    img: 'From S to XL.jpg',    title: 'From S to XL' },
    { page: 'tapage',   img: 'Tapage/Tapage valentines day.jpg', title: 'Tapage' },
    { page: 'palais',   img: 'Palais bulles.jpg',   title: 'Palais Bulles' },
    { page: 'calsmith', img: 'Cal Smith.jpg',       title: 'Cal Smith' },
    { page: 'poster',   img: 'Poster et animation/a2.jpg', title: 'Poster et animation' },
    { page: 'pelago',   img: 'Pelago/Affiche_1.jpg', title: 'Pelago' },
  ];

  function hideFloatingNextNow() {
    const el = document.querySelector('.floating-next-project');
    if (!el) return;
    // Sécurité : supprime tout transform écrit en inline par GSAP (ex: un
    // ancien effet magnétique) — un style inline écraserait sinon en
    // permanence la règle CSS .is-visible qui contrôle l'affichage.
    if (typeof gsap !== 'undefined') gsap.set(el, { clearProps: 'transform' });
    // Disparition INSTANTANÉE (pas la transition de 0.6s) : au moment où l'on
    // change de page, la carte ne doit plus jamais rester visible même une
    // fraction de seconde pendant la transition qui suit.
    el.style.transition = 'none';
    el.classList.remove('is-visible');
    void el.offsetHeight; // force l'application immédiate avant de rétablir la transition
    el.style.transition = '';
  }

  function pickRandomNextProject(currentPageId, previousPageId) {
    const floatingNext = document.querySelector('.floating-next-project');
    if (!floatingNext) return;
    // Exclut la page courante ET celle qu'on vient de quitter — sinon, en
    // cliquant la carte depuis A vers B, elle pouvait immédiatement
    // reproposer A (le projet qu'on venait tout juste de voir).
    let choices = PROJECTS.filter(p => p.page !== currentPageId && p.page !== previousPageId);
    if (!choices.length) choices = PROJECTS.filter(p => p.page !== currentPageId);
    const pick = choices[Math.floor(Math.random() * choices.length)];
    if (!pick) return;
    floatingNext.dataset.page = pick.page;
    const img = floatingNext.querySelector('img');
    if (img) { img.src = pick.img; img.alt = pick.title; }
    const titleEl = floatingNext.querySelector('.floating-next-project-title');
    if (titleEl) titleEl.textContent = pick.title;
  }

  // Écouteurs permanents — posés une fois pour toutes, jamais recréés/détruits.
  projPages.forEach(pid => {
    const pEl = document.getElementById('page-' + pid);
    if (!pEl) return;
    pEl.addEventListener('scroll', () => {
      // Cette page n'est plus la page affichée : ne JAMAIS toucher à la carte
      // depuis ici, quoi qu'il se passe par ailleurs (scroll résiduel, etc.).
      if (!pEl.classList.contains('is-active')) return;
      const floatingNext = document.querySelector('.floating-next-project');
      if (!floatingNext) return;
      // % de progression du scroll (pas une distance absolue) : les pages
      // projet secondaires (stoxl, tapage...) sont bien plus courtes que
      // Matière Créative — un seuil en pixels s'y déclenchait quasi
      // instantanément, sans scroll réel. Le %, lui, s'adapte à la hauteur
      // réelle de CHAQUE page.
      const maxScroll = pEl.scrollHeight - pEl.clientHeight;
      const progress  = maxScroll > 0 ? pEl.scrollTop / maxScroll : 0;
      // Seuil repoussé près du tout bas de la page (au lieu de 80%) : la
      // carte gênait la lecture en arrivant trop tôt, alors qu'il restait
      // encore du contenu de la page projet à lire.
      floatingNext.classList.toggle('is-visible', progress > 0.94);
    }, { passive: true });
  });

  function navigateTo(target) {
    if (transitioning || target === current) return;
    transitioning = true;
    const previousPage = current; // capturé avant que current ne change plus bas — sert à exclure ce projet de la prochaine suggestion de la carte flottante

    // Cache systématiquement la carte flottante, quelle que soit la page
    // quittée — jamais conditionnel, pour ne jamais risquer qu'elle reste
    // visible en arrivant sur une page non-projet (work, etc.).
    hideFloatingNextNow();

    // Idem pour le scatter photo (voyage/évènement/street) — voir le
    // commentaire de hideAllPhotoScatterNow() pour le pourquoi.
    hideAllPhotoScatterNow();

    // Reset curseur — évite un état VIEW/magnétique figé si on navigue en plein hover
    magnetActive = false;
    cursorDot.classList.remove('is-view');
    setX(mX); setY(mY);

    const curPage = document.querySelector('.page.is-active');
    const nextEl  = document.getElementById('page-' + target);
    if (!nextEl) { transitioning = false; return; }

    // Calculé AVANT la timeline : seule la 1ère visite d'une page doit "jouer"
    // le reveal de contenu — sinon on re-cacherait des éléments déjà révélés
    // (et jamais ré-affichés, puisque initRevealGSAP() ne se relance pas).
    const firstVisit = !gsapPagesSetup.has(target);

    const tl = gsap.timeline({
      onStart:    () => document.body.classList.add('is-transitioning'),
      onComplete: () => {
        document.body.classList.remove('is-transitioning');
        transitioning = false;
        clearTimeout(navSafetyTimer);
      },
    });

    // Filet de sécurité — si onComplete ne se déclenche jamais pour une
    // raison imprévue (timeline interrompue, onglet mis en arrière-plan…),
    // débloque quand même la navigation après un délai large plutôt que de
    // laisser tous les boutons (retour compris) muets jusqu'au rechargement
    // de la page. La timeline la plus longue du site ne dépasse pas ~1.6s.
    clearTimeout(navSafetyTimer);
    navSafetyTimer = setTimeout(() => {
      document.body.classList.remove('is-transitioning');
      transitioning = false;
    }, 3000);

    // ① Exit — page courante glisse vers le bas et disparaît
    if (curPage) {
      tl.to(curPage, {
        y: 60, opacity: 0,
        duration: 0.42, ease: 'power3.in',
      });
    }

    // ② Switch — nettoyage DOM, puis positionnement de la nouvelle page sous le viewport
    tl.call(() => {
      pages.forEach(p => {
        p.querySelectorAll('video').forEach(v => v.pause());
        p.classList.remove('is-active');
        gsap.set(p, { clearProps: 'transform,opacity' }); // CSS reprend (opacity:0, visibility:hidden)
        p.style.clipPath = '';
      });
      if (globalFooter) globalFooter.classList.remove('is-visible');

      // Positionner la nouvelle page invisible en dessous du viewport
      nextEl.scrollTop = 0;
      gsap.set(nextEl, { y: 80, opacity: 0 });
      nextEl.classList.add('is-active'); // CSS: visibility:visible, pointer-events:auto; GSAP inline opacity:0 gagne

      if (firstVisit) {
        // Pré-cacher le contenu "immédiat" + les médias scroll-reveal AVANT que
        // la page ne devienne visible : évite tout flash (rien n'est visible
        // puis caché puis réanimé — tout part déjà de l'état caché).
        gsap.set(nextEl.querySelectorAll(ENTER_REVEAL_SEL), { opacity: 0, y: 22 });
        gsap.set(nextEl.querySelectorAll(SCROLL_MEDIA_SEL), { opacity: 0, scale: 1.1 });
        gsap.set(nextEl.querySelectorAll(SCROLL_GRID_SEL),  { opacity: 0, scale: 1.1 });
        // Titres — chaque ligne masquée part sous son overflow:hidden
        gsap.set(nextEl.querySelectorAll(TITLE_LINES_SEL), { yPercent: 110 });
      }

      if (siteHeader) siteHeader.classList.toggle('is-proj', projPages.has(target));
      if (siteHeader) siteHeader.classList.toggle('is-hello', target === 'hello');
      current = target;
      updateNavActive(target);
    });

    // ③ Entry — nouvelle page monte depuis le bas avec fluidité
    tl.addLabel('enter');
    tl.to(nextEl, {
      y: 0, opacity: 1,
      duration: 0.65, ease: 'power3.out',
      onStart: () => {
        // Lancer les vidéos un peu après le début pour éviter le saut d'image
        setTimeout(() => {
          nextEl.querySelectorAll('video[autoplay]').forEach(v => v.play().catch(() => {}));
        }, 160);
      },
      onComplete: () => {
        // Retirer les styles inline GSAP pour que CSS reprenne (hover, clipPath footer, etc.)
        gsap.set(nextEl, { clearProps: 'transform,opacity' });
        // ScrollTrigger init une fois la page stabilisée (positions/scroll fiables)
        initRevealGSAP(target);
        // Carte flottante "projet suivant" — nouveau projet aléatoire à chaque arrivée
        // (l'écouteur de scroll qui gère son affichage est permanent, voir plus haut)
        if (projPages.has(target)) pickRandomNextProject(target, previousPage);
        if (target === 'work') setTimeout(() => {
          const el = document.querySelector('#work-scroll-hint .work-hint-line');
          if (el) scrambleLine(el, 'scroll ↑ ↓', 200);
        }, 120);
      },
    }, 'enter');

    // ④ Titres — chaque ligne remonte de son masque, en tête de la cascade
    if (firstVisit) {
      tl.to(nextEl.querySelectorAll(TITLE_LINES_SEL), {
        yPercent: 0,
        duration: 0.95, ease: 'power4.out',
        stagger: 0.08,
        clearProps: 'transform',
      }, 'enter+=0.05');
    }

    // ⑤ Contenu immédiat — révélé EN MÊME TEMPS que la page arrive (pas après),
    // pour ne jamais entrer en conflit visuel avec le mouvement global du conteneur
    if (firstVisit) {
      tl.to(nextEl.querySelectorAll(ENTER_REVEAL_SEL), {
        opacity: 1, y: 0,
        duration: 0.6, ease: 'power3.out',
        stagger: 0.06,
        clearProps: 'transform,opacity',
      }, 'enter+=0.12');
    }
  }

  // ── Roulette factory (shared by Work & Photo) ────────────────────────────
  function initRoulette(rouletteId, trackId, imgId, startIdx) {
    const roulette = document.getElementById(rouletteId);
    const track    = document.getElementById(trackId);
    const img      = document.getElementById(imgId);
    if (!roulette || !track || !img) return;

    const items = Array.from(track.querySelectorAll('.proj-roulette-item'));
    let activeIdx  = startIdx || 0;
    let currentSrc = items[activeIdx] ? (items[activeIdx].dataset.video || items[activeIdx].dataset.img) : '';
    let lastWheel  = 0;

    function applyStyles() {
      items.forEach((item, i) => {
        const dist = Math.abs(i - activeIdx);
        // Opacity: active → adjacent → distant
        const opacities = [1, 0.5, 0.28, 0.12, 0.04];
        item.style.opacity = opacities[Math.min(dist, opacities.length - 1)];
        item.classList.toggle('is-active', dist === 0);
      });
    }

    function centerTrack() {
      const activeEl = items[activeIdx];
      if (!activeEl) return;
      const roulRect   = roulette.getBoundingClientRect();
      const itemRect   = activeEl.getBoundingClientRect();
      const roulCenter = roulRect.top + roulRect.height / 2;
      const itemCenter = itemRect.top + itemRect.height / 2;
      const delta      = roulCenter - itemCenter;
      const matrix     = new DOMMatrix(getComputedStyle(track).transform);
      track.style.transform = `translateY(${matrix.m42 + delta}px)`;
    }

    // Double buffer pour crossfade fluide img↔img + img↔vid
    const absCSS = 'display:none;position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
    const wrap   = img.parentNode;
    if (wrap) wrap.style.position = 'relative';

    // imgA = img d'origine (déjà dans le DOM, on le rend absolu)
    const imgA = img;
    imgA.style.cssText = absCSS.replace('display:none', 'display:block');

    // imgB = buffer arrière pour les transitions img↔img
    const imgB = document.createElement('img');
    imgB.className   = 'gallery-img';
    imgB.style.cssText = absCSS;
    if (wrap) wrap.appendChild(imgB);

    // vid = élément vidéo
    const vid = document.createElement('video');
    vid.className = 'gallery-img';
    vid.muted = true; vid.loop = true; vid.setAttribute('playsinline', '');
    vid.style.cssText = absCSS;
    if (wrap) wrap.appendChild(vid);

    let activeImg  = 'A'; // quel buffer img est visible : 'A' | 'B'
    let showingVid = false;
    let pendingXF  = null;

    function xfade(curEl, nxtEl, dy, onDone) {
      clearTimeout(pendingXF);
      [imgA, imgB, vid].forEach(el => {
        if (el !== curEl && el !== nxtEl) {
          el.style.display = 'none'; el.classList.remove('is-fading');
          el.style.zIndex = ''; el.style.opacity = ''; el.style.transform = '';
        }
      });
      curEl.classList.remove('is-fading');
      curEl.style.display   = 'block';
      curEl.style.zIndex    = '1';
      curEl.style.opacity   = '1';
      curEl.style.transform = 'translateY(0px)';

      nxtEl.classList.remove('is-fading');
      nxtEl.style.display   = 'block';
      nxtEl.style.zIndex    = '0';
      nxtEl.style.opacity   = '0';
      nxtEl.style.transform = `translateY(${dy}px)`;

      requestAnimationFrame(() => requestAnimationFrame(() => {
        nxtEl.style.opacity   = '1';
        nxtEl.style.transform = 'translateY(0px)';
        curEl.style.opacity   = '0';
        curEl.style.transform = `translateY(${-dy}px)`;
      }));

      pendingXF = setTimeout(() => {
        curEl.style.display   = 'none';
        curEl.style.opacity   = '';
        curEl.style.transform = '';
        curEl.style.zIndex    = '';
        nxtEl.style.zIndex    = '';
        onDone && onDone();
      }, 500);
    }

    function changeMedia(item, dir) {
      const isVideo = !!(item.dataset.video);
      const newSrc  = isVideo ? item.dataset.video : item.dataset.img;
      if (!newSrc || newSrc === currentSrc) return;
      currentSrc = newSrc;
      const dy = (dir || 1) * 40;

      const curImg = activeImg === 'A' ? imgA : imgB;
      const nxtImg = activeImg === 'A' ? imgB : imgA;

      if (isVideo) {
        vid.src = newSrc; vid.load(); vid.play().catch(() => {});
        const curEl = showingVid ? vid : curImg;
        if (curEl !== vid) xfade(curEl, vid, dy, () => { showingVid = true; });
      } else {
        nxtImg.src = newSrc;
        const curEl = showingVid ? vid : curImg;
        xfade(curEl, nxtImg, dy, () => {
          if (showingVid) { vid.pause(); vid.src = ''; showingVid = false; }
          activeImg = activeImg === 'A' ? 'B' : 'A';
        });
      }
    }

    function setActive(idx) {
      idx = Math.max(0, Math.min(items.length - 1, idx));
      if (idx === activeIdx) return;
      const dir = idx > activeIdx ? 1 : -1;
      activeIdx = idx;
      applyStyles();
      centerTrack();
      setTimeout(centerTrack, 520);
      changeMedia(items[idx], dir);
    }

    // Wheel — scroll on roulette area cycles projects
    roulette.addEventListener('wheel', e => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheel < 380) return;
      lastWheel = now;
      setActive(activeIdx + (e.deltaY > 0 ? 1 : -1));
    }, { passive: false });

    // Touch roulette — preventDefault pour ne pas scroller la page
    let touchY = 0;
    roulette.addEventListener('touchstart', e => {
      touchY = e.touches[0].clientY;
    }, { passive: true });
    roulette.addEventListener('touchmove', e => {
      e.preventDefault(); // bloque le scroll vertical de la page quand on swipe la roulette
    }, { passive: false });
    roulette.addEventListener('touchend', e => {
      const diff = touchY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 20) setActive(activeIdx + (diff > 0 ? 1 : -1));
    }, { passive: true });

    // Click: inactive → activate; active + data-page → navigate
    items.forEach((item, i) => {
      item.addEventListener('click', () => {
        if (i !== activeIdx) { setActive(i); return; }
        if (item.dataset.page) navigateTo(item.dataset.page);
      });
    });

    // Image : wheel + swipe horizontal (mobile) → change de projet, tap → navigue
    const imgWrap = img.closest('.gallery-img-wrap');
    if (imgWrap) {
      imgWrap.style.cursor = 'pointer';

      imgWrap.addEventListener('click', () => {
        const page = items[activeIdx] && items[activeIdx].dataset.page;
        if (page && !transitioning) navigateTo(page);
      });

      imgWrap.addEventListener('wheel', e => {
        e.preventDefault();
        const now = Date.now();
        if (now - lastWheel < 380) return;
        lastWheel = now;
        setActive(activeIdx + (e.deltaY > 0 ? 1 : -1));
      }, { passive: false });

      // Swipe gauche/droite sur l'image pour mobile
      let swipeX0 = 0, swipeY0 = 0;
      imgWrap.addEventListener('touchstart', e => {
        swipeX0 = e.touches[0].clientX;
        swipeY0 = e.touches[0].clientY;
      }, { passive: true });
      imgWrap.addEventListener('touchend', e => {
        const dx = swipeX0 - e.changedTouches[0].clientX;
        const dy = swipeY0 - e.changedTouches[0].clientY;
        // Ne réagit que si le geste est majoritairement horizontal
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          const now = Date.now();
          if (now - lastWheel < 380) return;
          lastWheel = now;
          setActive(activeIdx + (dx > 0 ? 1 : -1));
        }
      }, { passive: true });
    }

    // Initial state
    applyStyles();
    requestAnimationFrame(() => { requestAnimationFrame(centerTrack); });
    window.addEventListener('resize', centerTrack);

    return { reset: () => setActive(0) };
  }

  // Initialise les deux roulettes
  const workRoulette = initRoulette('work-roulette',  'work-track',  'work-img',  0);
  initRoulette('photo-roulette', 'photo-track', 'photo-img', 0);

  // ── Back button (Ringer projet → Work) ───────────────────────────────────
  document.querySelectorAll('.js-back').forEach(btn => {
    btn.addEventListener('click', () => {
      if (transitioning) return;
      navigateTo('work');
    });
  });

  // ── Back button (photo sous-page → Photo) ────────────────────────────────
  document.querySelectorAll('.js-back-photo').forEach(btn => {
    btn.addEventListener('click', () => {
      if (transitioning) return;
      navigateTo('photo');
    });
  });

  // ── Projet suivant — carte flottante (toutes les pages projet) ──────────
  // La disparition instantanée est gérée par hideFloatingNextNow(), appelée
  // au tout début de navigateTo() — pas besoin de la dupliquer ici.
  document.querySelectorAll('.floating-next-project[data-page]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // État initial MC (data-version fr)
  document.querySelectorAll('.mc-v').forEach(el => {
    el.classList.toggle('is-shown', el.dataset.version === 'fr');
  });

  // Verrou partagé voyage/évènement/street : posé dès le clic qui déclenche
  // la navigation (vGoToPage/eGoToPage/sGoToPage), avant même l'appel à
  // navigateTo() — car ces fonctions attendent ~140ms (le temps du fondu de
  // sortie des miniatures) avant d'appeler navigateTo(), et `transitioning`
  // ne devient vrai qu'à CET appel. Pendant cette fenêtre de ~140ms, si la
  // souris repasse sur un des trois libellés (Voyage/Évènement/Street) en
  // route vers ailleurs, mouseenter relançait un scatter tout neuf — qui ne
  // se faisait alors plus jamais nettoyer avant l'arrivée sur la nouvelle
  // page. Ce verrou bloque tout nouveau scatter tant qu'une navigation
  // photo est en cours ; il est relâché par hideAllPhotoScatterNow(),
  // appelée sur chaque navigateTo().
  let photoListLocked = false;

  // Écrans tactiles (pas de vrai survol) : le mouseenter/mouseleave des
  // libellés Voyage/Évènement/Street ne sert alors à rien — pire, le tap
  // synthétise souvent un mouseenter juste avant le click, ce qui déclenchait
  // un flash de scatter inutile juste avant de naviguer. Sur ces appareils on
  // n'attache que le click : tap = navigation directe, sans détour.
  const CAN_HOVER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ── Voyage — scatter & gallery ────────────────────────────────────────────
  const VOYAGE_PHOTOS = [
    'Voyage/DSCF0929.JPG','Voyage/DSCF0931.JPG','Voyage/DSCF0932.JPG',
    'Voyage/DSCF0949.JPG','Voyage/DSCF0953.JPG','Voyage/DSCF0987.JPG',
    'Voyage/DSCF4796.JPG','Voyage/DSCF4861.JPG','Voyage/DSCF5823.JPG',
    'Voyage/DSCF5846.JPG','Voyage/DSCF5882.JPG','Voyage/DSCF5883.JPG',
    'Voyage/DSCF5886.JPG','Voyage/DSCF5887.JPG','Voyage/DSCF5892.JPG',
    'Voyage/DSCF5898.JPG','Voyage/DSCF5902.JPG','Voyage/DSCF8271.JPG',
  ];

  const voyageItem    = document.querySelector('.photo-list-item[data-voyage]');
  const voyageOverlay = document.getElementById('voyage-overlay');
  // state: 'off' | 'scatter' | 'gallery' | 'lightbox'
  let voyageState    = 'off';
  let vClearTimer    = null;
  let vLeaveTimer    = null;
  let vEnterTimers   = []; // setTimeout des apparitions décalées — à annuler si on cache avant la fin

  function vSetState(s) { voyageState = s; }

  function vTriggerHide() {
    // Déclenchement immédiat, lié uniquement au survol du texte "Voyage" —
    // pas de délai d'attente avant de lancer la disparition.
    if (voyageState !== 'scatter') return;
    document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
    vHideScatter(150, () => {
      if (voyageState === 'scatter') { voyageOverlay.innerHTML = ''; vSetState('off'); }
    });
  }

  function vScatter() {
    if (!voyageOverlay) return;
    clearTimeout(vClearTimer);
    clearTimeout(vLeaveTimer);
    vEnterTimers.forEach(clearTimeout);
    vEnterTimers = [];
    voyageOverlay.innerHTML = '';
    vSetState('scatter');

    VOYAGE_PHOTOS.forEach((src, i) => {
      const el  = document.createElement('div');
      el.className = 'voyage-photo';
      const img = document.createElement('img');
      img.src = src; img.alt = '';
      el.appendChild(img);

      const vw = window.innerWidth, vh = window.innerHeight;
      const w  = Math.min(190, Math.max(130, vw * 0.14));
      const h  = w * 1.5;
      const x  = 60 + Math.random() * Math.max(0, vw - w - 120);
      const y  = 60 + Math.random() * Math.max(0, vh - h - 120);
      const rot = (Math.random() - 0.5) * 22;

      el.style.left      = x + 'px';
      el.style.top       = y + 'px';
      el.style.transform = `rotate(${rot}deg) scale(0.8)`;
      el.style.opacity   = '0';
      // La disparition ne dépend que du survol du texte "Voyage" — cliquer
      // sur une miniature reste possible, mais ne prolonge plus la zone de survol.
      el.addEventListener('click', e => { e.stopPropagation(); vGoToPage(); });
      voyageOverlay.appendChild(el);

      vEnterTimers.push(setTimeout(() => {
        el.style.transform = `rotate(${rot}deg) scale(1)`;
        el.style.opacity   = '1';
      }, i * 22));
    });
  }

  function vHideScatter(ms, cb) {
    if (!voyageOverlay) return cb && cb();
    // Annule les apparitions pas encore jouées : sans ça, une photo pas
    // encore révélée peut "sauter" à opacity:1 après le lancement du fondu
    // de sortie et rester visible au lieu de disparaître.
    vEnterTimers.forEach(clearTimeout);
    vEnterTimers = [];
    voyageOverlay.querySelectorAll('.voyage-photo').forEach(el => {
      el.style.transition = `opacity ${ms}ms ease, transform ${ms}ms ease`;
      el.style.opacity    = '0';
      el.style.transform  = el.style.transform.replace(/scale\([^)]*\)/g, 'scale(0.6)');
    });
    clearTimeout(vClearTimer);
    // Ne pas toucher au innerHTML ici — le callback s'en charge
    // (évite le flash "DOM vide" entre scatter et galerie)
    vClearTimer = setTimeout(() => cb && cb(), ms + 20);
  }

  // Ré-entrée rapide pendant un fondu de sortie en cours : au lieu d'ignorer
  // le survol (l'état est encore 'scatter' tant que le nettoyage n'a pas eu
  // lieu), on annule ce nettoyage et on ramène les photos déjà en place à
  // pleine opacité — sans les recréer ni les repositionner.
  function vRestoreScatter() {
    clearTimeout(vClearTimer);
    voyageOverlay.querySelectorAll('.voyage-photo').forEach(el => {
      el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      el.style.opacity    = '1';
      el.style.transform  = el.style.transform.replace(/scale\([^)]*\)/g, 'scale(1)');
    });
  }

  function vOpenGallery() {
    if (!voyageOverlay) return;
    clearTimeout(vClearTimer);
    clearTimeout(vLeaveTimer);
    vSetState('gallery');
    voyageOverlay.innerHTML = '';
    voyageOverlay.className = 'is-gallery';

    const backdrop = document.createElement('div');
    backdrop.className = 'voyage-gallery-backdrop';
    backdrop.addEventListener('click', vClose);
    voyageOverlay.appendChild(backdrop);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'voyage-gallery-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', vClose);
    voyageOverlay.appendChild(closeBtn);

    const grid = document.createElement('div');
    grid.className = 'voyage-gallery-grid';
    VOYAGE_PHOTOS.forEach((src, i) => {
      const cell = document.createElement('div');
      cell.className = 'voyage-gallery-item';
      const img = document.createElement('img');
      img.src = src; img.alt = '';
      cell.appendChild(img);
      cell.addEventListener('click', e => { e.stopPropagation(); vLightbox(i); });
      grid.appendChild(cell);
    });
    voyageOverlay.appendChild(grid);
    requestAnimationFrame(() => requestAnimationFrame(() =>
      voyageOverlay.classList.add('is-visible')
    ));
  }

  let vLbIdx = 0;

  function vLbClose(lb) {
    lb.classList.remove('is-visible');
    setTimeout(() => { lb.remove(); vSetState('gallery'); }, 350);
  }

  function vLbNav(lb, img, dir) {
    vLbIdx = (vLbIdx + dir + VOYAGE_PHOTOS.length) % VOYAGE_PHOTOS.length;
    img.style.opacity = '0';
    setTimeout(() => { img.src = VOYAGE_PHOTOS[vLbIdx]; img.style.opacity = '1'; }, 230);
  }

  function vLightbox(idx) {
    vSetState('lightbox');
    vLbIdx = idx;

    const lb = document.createElement('div');
    lb.className = 'voyage-lightbox';

    const img = document.createElement('img');
    img.className = 'voyage-lb-img';
    img.src = VOYAGE_PHOTOS[idx]; img.alt = '';
    img.addEventListener('click', () => vLbClose(lb));

    const prev = document.createElement('button');
    prev.className = 'voyage-lb-btn voyage-lb-prev';
    prev.innerHTML = '&#8592;';
    prev.addEventListener('click', e => { e.stopPropagation(); vLbNav(lb, img, -1); });

    const next = document.createElement('button');
    next.className = 'voyage-lb-btn voyage-lb-next';
    next.innerHTML = '&#8594;';
    next.addEventListener('click', e => { e.stopPropagation(); vLbNav(lb, img, 1); });

    lb.append(img, prev, next);
    // Clic sur le fond (hors image) → ferme
    lb.addEventListener('click', e => { if (e.target === lb) vLbClose(lb); });
    document.body.appendChild(lb);
    requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add('is-visible')));
  }

  function vClose() {
    if (!voyageOverlay) return;
    clearTimeout(vClearTimer);
    clearTimeout(vLeaveTimer);
    const grid = voyageOverlay.querySelector('.voyage-gallery-grid');
    if (grid) {
      grid.style.transition = 'opacity 0.16s ease, translate 0.18s cubic-bezier(0.4,0,1,1)';
      grid.style.opacity    = '0';
      grid.style.translate  = '0 -14px';
    }
    vClearTimer = setTimeout(() => {
      voyageOverlay.classList.remove('is-visible');
      vClearTimer = setTimeout(() => {
        voyageOverlay.innerHTML = '';
        voyageOverlay.className = '';
        vSetState('off');
        document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
      }, 260);
    }, 140);
  }

  // Clic — sur le texte "Voyage" OU directement sur une miniature éparpillée :
  // cache le scatter puis navigue. Indépendant des minuteurs de survol
  // (vLeaveTimer/vClearTimer) pour ne jamais être annulé par un mouseleave
  // concurrent (ex: la miniature qui rétrécit sous le curseur au clic).
  function vGoToPage() {
    clearTimeout(vLeaveTimer);
    clearTimeout(vClearTimer);
    vEnterTimers.forEach(clearTimeout);
    vEnterTimers = [];
    photoListLocked = true; // bloque tout re-scatter tant que la navigation n'est pas lancée

    if (voyageState === 'scatter') {
      vSetState('off'); // verrouillé tout de suite : plus aucun mouseleave ne peut interférer
      document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
      voyageOverlay.querySelectorAll('.voyage-photo').forEach(el => {
        el.style.transition = 'opacity 0.12s ease, transform 0.12s ease';
        el.style.opacity = '0';
        el.style.transform = el.style.transform.replace(/scale\([^)]*\)/g, 'scale(0.6)');
      });
      setTimeout(() => { voyageOverlay.innerHTML = ''; navigateTo('photo-voyage'); }, 140);
    } else {
      navigateTo('photo-voyage');
    }
  }

  if (voyageItem && voyageOverlay) {
    if (CAN_HOVER) {
      voyageItem.addEventListener('mouseenter', () => {
        if (photoListLocked || transitioning) return;
        clearTimeout(vLeaveTimer);
        clearTimeout(vClearTimer);
        if (eventState === 'scatter')  { clearTimeout(eLeaveTimer); eHideScatter(120, () => { eventOverlay.innerHTML = ''; eSetState('off'); }); }
        if (streetState === 'scatter') { clearTimeout(sLeaveTimer); sHideScatter(120, () => { streetOverlay.innerHTML = ''; sSetState('off'); }); }
        if (voyageState === 'gallery' || voyageState === 'lightbox') return;
        document.querySelectorAll('.photo-list-item').forEach(i =>
          i.classList.toggle('is-hovered', i === voyageItem)
        );
        // Ré-entrée rapide pendant que le fondu de sortie précédent tournait
        // encore (l'état n'a pas eu le temps de repasser à 'off') : on remet
        // les photos déjà présentes à pleine opacité plutôt que d'ignorer ce survol.
        if (voyageState === 'scatter') { vRestoreScatter(); return; }
        vScatter();
      });

      voyageItem.addEventListener('mouseleave', () => {
        if (voyageState === 'gallery' || voyageState === 'lightbox') return;
        // Petit délai avant de lancer réellement la disparition : absorbe les
        // micro-sorties/entrées involontaires (jitter trackpad près du bord du
        // libellé) — mouseenter annule ce timer en premier geste, donc un vrai
        // survol continu ne voit jamais ce délai. Sans ça, une sortie/entrée
        // trop rapide pouvait laisser la disparition se terminer (état repassé
        // à 'off') juste avant le ré-survol, qui relançait alors un scatter
        // tout neuf — d'où l'impression que l'animation "se lance deux fois".
        if (voyageState === 'scatter') {
          clearTimeout(vLeaveTimer);
          vLeaveTimer = setTimeout(vTriggerHide, 90);
        }
      });
    }

    voyageItem.addEventListener('click', e => {
      e.stopPropagation();
      vGoToPage();
    });
  }

  // ── Évènement — scatter & gallery ────────────────────────────────────────
  const EVENT_PHOTOS = [
    'evenement/DSCF0259.jpg','evenement/DSCF0314.jpg','evenement/DSCF0329.jpg',
    'evenement/DSCF0345.jpg','evenement/DSCF0347.jpg','evenement/DSCF0374.jpg',
    'evenement/DSCF0459.jpg','evenement/DSCF0600.jpg','evenement/DSCF1238.jpg',
    'evenement/DSCF1261.jpg','evenement/DSCF1292.jpg','evenement/DSCF7318.jpg',
    'evenement/DSCF7320.jpg','evenement/DSCF7332.jpg','evenement/DSCF7341.jpg',
    'evenement/DSCF7384.jpg','evenement/DSCF7567.jpg','evenement/DSCF8643.jpg',
    'evenement/DSCF9342.jpg','evenement/DSCF9391.jpg','evenement/DSCF9633.jpg',
    'evenement/DSCF9867.jpg','evenement/DSCF9891.jpg',
  ];

  const eventItem    = document.querySelector('.photo-list-item[data-event]');
  const eventOverlay = document.getElementById('event-overlay');
  let eventState   = 'off';
  let eClearTimer  = null;
  let eLeaveTimer  = null;
  let eEnterTimers = []; // setTimeout des apparitions décalées — à annuler si on cache avant la fin

  function eSetState(s) { eventState = s; }

  function eTriggerHide() {
    // Déclenchement immédiat, lié uniquement au survol du texte "Évènement" —
    // pas de délai d'attente avant de lancer la disparition.
    if (eventState !== 'scatter') return;
    document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
    eHideScatter(150, () => {
      if (eventState === 'scatter') { eventOverlay.innerHTML = ''; eSetState('off'); }
    });
  }

  function eScatter() {
    if (!eventOverlay) return;
    clearTimeout(eClearTimer);
    clearTimeout(eLeaveTimer);
    eEnterTimers.forEach(clearTimeout);
    eEnterTimers = [];
    eventOverlay.innerHTML = '';
    eSetState('scatter');

    EVENT_PHOTOS.forEach((src, i) => {
      const el  = document.createElement('div');
      el.className = 'voyage-photo';
      const img = document.createElement('img');
      img.src = src; img.alt = '';
      el.appendChild(img);

      const vw = window.innerWidth, vh = window.innerHeight;
      const w  = Math.min(190, Math.max(130, vw * 0.14));
      const h  = w * 1.5;
      const x  = 60 + Math.random() * Math.max(0, vw - w - 120);
      const y  = 60 + Math.random() * Math.max(0, vh - h - 120);
      const rot = (Math.random() - 0.5) * 22;

      el.style.left      = x + 'px';
      el.style.top       = y + 'px';
      el.style.transform = `rotate(${rot}deg) scale(0.8)`;
      el.style.opacity   = '0';
      // La disparition ne dépend que du survol du texte "Évènement" — cliquer
      // sur une miniature reste possible, mais ne prolonge plus la zone de survol.
      el.addEventListener('click', e => { e.stopPropagation(); eGoToPage(); });
      eventOverlay.appendChild(el);

      eEnterTimers.push(setTimeout(() => {
        el.style.transform = `rotate(${rot}deg) scale(1)`;
        el.style.opacity   = '1';
      }, i * 16));
    });
  }

  function eHideScatter(ms, cb) {
    if (!eventOverlay) return cb && cb();
    // Annule les apparitions pas encore jouées : sans ça, une photo pas
    // encore révélée peut "sauter" à opacity:1 après le lancement du fondu
    // de sortie et rester visible au lieu de disparaître.
    eEnterTimers.forEach(clearTimeout);
    eEnterTimers = [];
    eventOverlay.querySelectorAll('.voyage-photo').forEach(el => {
      el.style.transition = `opacity ${ms}ms ease, transform ${ms}ms ease`;
      el.style.opacity    = '0';
      el.style.transform  = el.style.transform.replace(/scale\([^)]*\)/g, 'scale(0.6)');
    });
    clearTimeout(eClearTimer);
    eClearTimer = setTimeout(() => cb && cb(), ms + 20);
  }

  // Ré-entrée rapide pendant un fondu de sortie en cours : au lieu d'ignorer
  // le survol (l'état est encore 'scatter' tant que le nettoyage n'a pas eu
  // lieu), on annule ce nettoyage et on ramène les photos déjà en place à
  // pleine opacité — sans les recréer ni les repositionner.
  function eRestoreScatter() {
    clearTimeout(eClearTimer);
    eventOverlay.querySelectorAll('.voyage-photo').forEach(el => {
      el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      el.style.opacity    = '1';
      el.style.transform  = el.style.transform.replace(/scale\([^)]*\)/g, 'scale(1)');
    });
  }

  function eOpenGallery() {
    if (!eventOverlay) return;
    clearTimeout(eClearTimer);
    clearTimeout(eLeaveTimer);
    eSetState('gallery');
    eventOverlay.innerHTML = '';
    eventOverlay.className = 'is-gallery';

    const backdrop = document.createElement('div');
    backdrop.className = 'voyage-gallery-backdrop';
    backdrop.addEventListener('click', eClose);
    eventOverlay.appendChild(backdrop);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'voyage-gallery-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', eClose);
    eventOverlay.appendChild(closeBtn);

    const grid = document.createElement('div');
    grid.className = 'voyage-gallery-grid';
    EVENT_PHOTOS.forEach((src, i) => {
      const cell = document.createElement('div');
      cell.className = 'voyage-gallery-item';
      const img = document.createElement('img');
      img.src = src; img.alt = '';
      cell.appendChild(img);
      cell.addEventListener('click', e => { e.stopPropagation(); eLightbox(i); });
      grid.appendChild(cell);
    });
    eventOverlay.appendChild(grid);
    requestAnimationFrame(() => requestAnimationFrame(() =>
      eventOverlay.classList.add('is-visible')
    ));
  }

  let eLbIdx = 0;

  function eLbClose(lb) {
    lb.classList.remove('is-visible');
    setTimeout(() => { lb.remove(); eSetState('gallery'); }, 350);
  }

  function eLbNav(lb, img, dir) {
    eLbIdx = (eLbIdx + dir + EVENT_PHOTOS.length) % EVENT_PHOTOS.length;
    img.style.opacity = '0';
    setTimeout(() => { img.src = EVENT_PHOTOS[eLbIdx]; img.style.opacity = '1'; }, 230);
  }

  function eLightbox(idx) {
    eSetState('lightbox');
    eLbIdx = idx;

    const lb = document.createElement('div');
    lb.className = 'voyage-lightbox';

    const img = document.createElement('img');
    img.className = 'voyage-lb-img';
    img.src = EVENT_PHOTOS[idx]; img.alt = '';
    img.addEventListener('click', () => eLbClose(lb));

    const prev = document.createElement('button');
    prev.className = 'voyage-lb-btn voyage-lb-prev';
    prev.innerHTML = '&#8592;';
    prev.addEventListener('click', e => { e.stopPropagation(); eLbNav(lb, img, -1); });

    const next = document.createElement('button');
    next.className = 'voyage-lb-btn voyage-lb-next';
    next.innerHTML = '&#8594;';
    next.addEventListener('click', e => { e.stopPropagation(); eLbNav(lb, img, 1); });

    lb.append(img, prev, next);
    lb.addEventListener('click', e => { if (e.target === lb) eLbClose(lb); });
    document.body.appendChild(lb);
    requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add('is-visible')));
  }

  function eClose() {
    if (!eventOverlay) return;
    clearTimeout(eClearTimer);
    clearTimeout(eLeaveTimer);
    const grid = eventOverlay.querySelector('.voyage-gallery-grid');
    if (grid) {
      grid.style.transition = 'opacity 0.16s ease, translate 0.18s cubic-bezier(0.4,0,1,1)';
      grid.style.opacity    = '0';
      grid.style.translate  = '0 -14px';
    }
    eClearTimer = setTimeout(() => {
      eventOverlay.classList.remove('is-visible');
      eClearTimer = setTimeout(() => {
        eventOverlay.innerHTML = '';
        eventOverlay.className = '';
        eSetState('off');
        document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
      }, 260);
    }, 140);
  }

  // Clic — sur le texte "Évènement" OU directement sur une miniature éparpillée :
  // indépendant des minuteurs de survol (eLeaveTimer/eClearTimer) pour ne
  // jamais être annulé par un mouseleave concurrent (ex: la miniature qui
  // rétrécit sous le curseur au clic).
  function eGoToPage() {
    clearTimeout(eLeaveTimer);
    clearTimeout(eClearTimer);
    eEnterTimers.forEach(clearTimeout);
    eEnterTimers = [];
    photoListLocked = true; // bloque tout re-scatter tant que la navigation n'est pas lancée

    if (eventState === 'scatter') {
      eSetState('off'); // verrouillé tout de suite : plus aucun mouseleave ne peut interférer
      document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
      eventOverlay.querySelectorAll('.voyage-photo').forEach(el => {
        el.style.transition = 'opacity 0.12s ease, transform 0.12s ease';
        el.style.opacity = '0';
        el.style.transform = el.style.transform.replace(/scale\([^)]*\)/g, 'scale(0.6)');
      });
      setTimeout(() => { eventOverlay.innerHTML = ''; navigateTo('photo-event'); }, 140);
    } else {
      navigateTo('photo-event');
    }
  }

  if (eventItem && eventOverlay) {
    if (CAN_HOVER) {
      eventItem.addEventListener('mouseenter', () => {
        if (photoListLocked || transitioning) return;
        clearTimeout(eLeaveTimer);
        clearTimeout(eClearTimer);
        if (voyageState === 'scatter') { clearTimeout(vLeaveTimer); vHideScatter(120, () => { voyageOverlay.innerHTML = ''; vSetState('off'); }); }
        if (streetState === 'scatter') { clearTimeout(sLeaveTimer); sHideScatter(120, () => { streetOverlay.innerHTML = ''; sSetState('off'); }); }
        if (eventState === 'gallery' || eventState === 'lightbox') return;
        document.querySelectorAll('.photo-list-item').forEach(i =>
          i.classList.toggle('is-hovered', i === eventItem)
        );
        // Ré-entrée rapide pendant que le fondu de sortie précédent tournait
        // encore (l'état n'a pas eu le temps de repasser à 'off') : on remet
        // les photos déjà présentes à pleine opacité plutôt que d'ignorer ce survol.
        if (eventState === 'scatter') { eRestoreScatter(); return; }
        eScatter();
      });

      eventItem.addEventListener('mouseleave', () => {
        if (eventState === 'gallery' || eventState === 'lightbox') return;
        // Voir le commentaire équivalent sur voyageItem.mouseleave.
        if (eventState === 'scatter') {
          clearTimeout(eLeaveTimer);
          eLeaveTimer = setTimeout(eTriggerHide, 90);
        }
      });
    }

    eventItem.addEventListener('click', e => {
      e.stopPropagation();
      eGoToPage();
    });
  }

  // ── Street — scatter ─────────────────────────────────────────────────────
  const STREET_PHOTOS = [
    'street photo/DSCF6233.JPG',
    'street photo/A009615-R1-00-1.JPG',
    'street photo/DSCF6312.JPG',
    'street photo/DSCF6313.JPG',
    'street photo/A009615-R1-12-13.JPG',
    'street photo/DSCF6362.JPG',
    'street photo/DSCF6366.JPG',
    'street photo/A009615-R1-16-17.JPG',
    'street photo/DSCF6378.JPG',
    'street photo/DSCF6379.JPG',
    'street photo/DSCF6384.JPG',
    'street photo/DSCF6392.JPG',
    'street photo/DSCF6393.JPG',
  ];

  const streetItem    = document.querySelector('.photo-list-item[data-street]');
  const streetOverlay = document.getElementById('street-overlay');
  let streetState   = 'off';
  let sClearTimer   = null;
  let sLeaveTimer   = null;
  let sEnterTimers  = []; // setTimeout des apparitions décalées — à annuler si on cache avant la fin

  function sSetState(s) { streetState = s; }

  function sTriggerHide() {
    // Déclenchement immédiat, lié uniquement au survol du texte "Street photo" —
    // pas de délai d'attente avant de lancer la disparition.
    if (streetState !== 'scatter') return;
    document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
    sHideScatter(150, () => {
      if (streetState === 'scatter') { streetOverlay.innerHTML = ''; sSetState('off'); }
    });
  }

  function sScatter() {
    if (!streetOverlay) return;
    clearTimeout(sClearTimer);
    clearTimeout(sLeaveTimer);
    sEnterTimers.forEach(clearTimeout);
    sEnterTimers = [];
    streetOverlay.innerHTML = '';
    sSetState('scatter');

    STREET_PHOTOS.forEach((src, i) => {
      const el  = document.createElement('div');
      el.className = 'voyage-photo';
      const img = document.createElement('img');
      img.src = src; img.alt = '';
      el.appendChild(img);

      const vw = window.innerWidth, vh = window.innerHeight;
      const w  = Math.min(190, Math.max(130, vw * 0.14));
      const h  = w * 1.5;
      const x  = 60 + Math.random() * Math.max(0, vw - w - 120);
      const y  = 60 + Math.random() * Math.max(0, vh - h - 120);
      const rot = (Math.random() - 0.5) * 22;

      el.style.left      = x + 'px';
      el.style.top       = y + 'px';
      el.style.transform = `rotate(${rot}deg) scale(0.8)`;
      el.style.opacity   = '0';
      // La disparition ne dépend que du survol du texte "Street photo" —
      // cliquer sur une miniature reste possible, mais ne prolonge plus la zone de survol.
      el.addEventListener('click', e => { e.stopPropagation(); sGoToPage(); });
      streetOverlay.appendChild(el);

      sEnterTimers.push(setTimeout(() => {
        el.style.transform = `rotate(${rot}deg) scale(1)`;
        el.style.opacity   = '1';
      }, i * 18));
    });
  }

  function sHideScatter(ms, cb) {
    if (!streetOverlay) return cb && cb();
    // Annule les apparitions pas encore jouées : sans ça, une photo pas
    // encore révélée peut "sauter" à opacity:1 après le lancement du fondu
    // de sortie et rester visible au lieu de disparaître.
    sEnterTimers.forEach(clearTimeout);
    sEnterTimers = [];
    streetOverlay.querySelectorAll('.voyage-photo').forEach(el => {
      el.style.transition = `opacity ${ms}ms ease, transform ${ms}ms ease`;
      el.style.opacity    = '0';
      el.style.transform  = el.style.transform.replace(/scale\([^)]*\)/g, 'scale(0.6)');
    });
    clearTimeout(sClearTimer);
    sClearTimer = setTimeout(() => cb && cb(), ms + 20);
  }

  // Ré-entrée rapide pendant un fondu de sortie en cours : au lieu d'ignorer
  // le survol (l'état est encore 'scatter' tant que le nettoyage n'a pas eu
  // lieu), on annule ce nettoyage et on ramène les photos déjà en place à
  // pleine opacité — sans les recréer ni les repositionner.
  function sRestoreScatter() {
    clearTimeout(sClearTimer);
    streetOverlay.querySelectorAll('.voyage-photo').forEach(el => {
      el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      el.style.opacity    = '1';
      el.style.transform  = el.style.transform.replace(/scale\([^)]*\)/g, 'scale(1)');
    });
  }

  // Clic — sur le texte "Street photo" OU directement sur une miniature éparpillée :
  // indépendant des minuteurs de survol (sLeaveTimer/sClearTimer) pour ne
  // jamais être annulé par un mouseleave concurrent (ex: la miniature qui
  // rétrécit sous le curseur au clic).
  function sGoToPage() {
    clearTimeout(sLeaveTimer);
    clearTimeout(sClearTimer);
    sEnterTimers.forEach(clearTimeout);
    sEnterTimers = [];
    photoListLocked = true; // bloque tout re-scatter tant que la navigation n'est pas lancée

    if (streetState === 'scatter') {
      sSetState('off'); // verrouillé tout de suite : plus aucun mouseleave ne peut interférer
      document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
      streetOverlay.querySelectorAll('.voyage-photo').forEach(el => {
        el.style.transition = 'opacity 0.12s ease, transform 0.12s ease';
        el.style.opacity = '0';
        el.style.transform = el.style.transform.replace(/scale\([^)]*\)/g, 'scale(0.6)');
      });
      setTimeout(() => { streetOverlay.innerHTML = ''; navigateTo('photo-street'); }, 140);
    } else {
      navigateTo('photo-street');
    }
  }

  if (streetItem && streetOverlay) {
    if (CAN_HOVER) {
      streetItem.addEventListener('mouseenter', () => {
        if (photoListLocked || transitioning) return;
        clearTimeout(sLeaveTimer);
        clearTimeout(sClearTimer);
        if (voyageState === 'scatter') { clearTimeout(vLeaveTimer); vHideScatter(120, () => { voyageOverlay.innerHTML = ''; vSetState('off'); }); }
        if (eventState  === 'scatter') { clearTimeout(eLeaveTimer); eHideScatter(120, () => { eventOverlay.innerHTML  = ''; eSetState('off'); }); }
        document.querySelectorAll('.photo-list-item').forEach(i =>
          i.classList.toggle('is-hovered', i === streetItem)
        );
        // Ré-entrée rapide pendant que le fondu de sortie précédent tournait
        // encore (l'état n'a pas eu le temps de repasser à 'off') : on remet
        // les photos déjà présentes à pleine opacité plutôt que d'ignorer ce survol.
        if (streetState === 'scatter') { sRestoreScatter(); return; }
        sScatter();
      });

      streetItem.addEventListener('mouseleave', () => {
        // Voir le commentaire équivalent sur voyageItem.mouseleave.
        if (streetState === 'scatter') {
          clearTimeout(sLeaveTimer);
          sLeaveTimer = setTimeout(sTriggerHide, 90);
        }
      });
    }

    streetItem.addEventListener('click', e => {
      e.stopPropagation();
      sGoToPage();
    });
  }

  // Nettoyage total du scatter photo (voyage/évènement/street) — appelé à
  // chaque navigation, quel que soit le chemin emprunté (nav, logo, footer,
  // pas seulement le clic sur la miniature/le texte). Ces overlays vivent en
  // position fixed au niveau racine du DOM (hors des .page) pour ne jamais
  // être piégés par un ancêtre transformé — mais ça veut dire qu'ils restent
  // affichés sur N'IMPORTE QUELLE page tant qu'on ne les cache pas nous-même :
  // sans ce nettoyage, quitter #page-photo en pleine animation (ex: clic sur
  // le logo) laissait l'état bloqué sur 'scatter' et l'overlay affiché par
  // dessus la page suivante — puis, au retour, le survol suivant tombait sur
  // vRestoreScatter() au lieu de vScatter() et ne montrait rien (ou de vieilles
  // photos), d'où le bug "des fois ça n'apparaît pas / des fois ça reste".
  function hideAllPhotoScatterNow() {
    clearTimeout(vClearTimer); clearTimeout(vLeaveTimer);
    vEnterTimers.forEach(clearTimeout); vEnterTimers = [];
    clearTimeout(eClearTimer); clearTimeout(eLeaveTimer);
    eEnterTimers.forEach(clearTimeout); eEnterTimers = [];
    clearTimeout(sClearTimer); clearTimeout(sLeaveTimer);
    sEnterTimers.forEach(clearTimeout); sEnterTimers = [];

    if (voyageOverlay) { voyageOverlay.innerHTML = ''; voyageOverlay.className = ''; }
    if (eventOverlay)  { eventOverlay.innerHTML  = ''; eventOverlay.className  = ''; }
    if (streetOverlay) { streetOverlay.innerHTML = ''; streetOverlay.className = ''; }

    voyageState = 'off';
    eventState  = 'off';
    streetState = 'off';
    photoListLocked = false;

    document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
    document.querySelectorAll('.voyage-lightbox').forEach(lb => lb.remove());
  }

  // ── Lightbox partagé — galeries photo (évènement / street / voyage) ────────
  let pgLbSrcs = [];
  let pgLbIdx  = 0;
  let pgLbEl   = null;
  let pgLbImg  = null;

  function pgLbBuild() {
    pgLbEl = document.createElement('div');
    pgLbEl.style.cssText = [
      'position:fixed','inset:0','z-index:9600',
      'background:rgba(0,0,0,0.94)',
      'display:none','align-items:center','justify-content:center',
      'cursor:zoom-out','opacity:0','transition:opacity 0.22s ease',
    ].join(';');

    pgLbImg = document.createElement('img');
    pgLbImg.style.cssText = [
      'max-width:92vw','max-height:92vh','object-fit:contain','display:block',
      'cursor:default','user-select:none','-webkit-user-drag:none',
      'transition:opacity 0.18s ease',
    ].join(';');
    pgLbImg.addEventListener('click', e => e.stopPropagation());

    const mkBtn = (css, html, fn) => {
      const b = document.createElement('button');
      b.innerHTML = html;
      b.style.cssText = css + 'background:none;border:none;color:#fff;cursor:pointer;opacity:0.55;transition:opacity 0.2s;';
      b.addEventListener('mouseenter', () => b.style.opacity = '1');
      b.addEventListener('mouseleave', () => b.style.opacity = '0.55');
      b.addEventListener('click', e => { e.stopPropagation(); fn(); });
      return b;
    };

    const prev  = mkBtn('position:absolute;left:20px;top:50%;transform:translateY(-50%);font-size:26px;padding:14px;', '&#8592;', () => pgLbNav(-1));
    const next  = mkBtn('position:absolute;right:20px;top:50%;transform:translateY(-50%);font-size:26px;padding:14px;', '&#8594;', () => pgLbNav(1));
    const close = mkBtn('position:absolute;top:16px;right:22px;font-size:30px;padding:8px;line-height:1;', '&times;', pgLbClose);

    pgLbEl.append(pgLbImg, prev, next, close);
    pgLbEl.addEventListener('click', pgLbClose);
    document.body.appendChild(pgLbEl);
  }

  function pgLbOpen(srcs, idx) {
    pgLbSrcs = srcs;
    pgLbIdx  = idx;
    if (!pgLbEl) pgLbBuild();
    pgLbImg.src = pgLbSrcs[pgLbIdx];
    pgLbEl.style.display = 'flex';
    pgLbEl.style.pointerEvents = 'auto';
    requestAnimationFrame(() => requestAnimationFrame(() => pgLbEl.style.opacity = '1'));
  }

  function pgLbNav(dir) {
    pgLbIdx = (pgLbIdx + dir + pgLbSrcs.length) % pgLbSrcs.length;
    pgLbImg.style.opacity = '0';
    setTimeout(() => { pgLbImg.src = pgLbSrcs[pgLbIdx]; pgLbImg.style.opacity = '1'; }, 180);
  }

  function pgLbClose() {
    if (!pgLbEl) return;
    pgLbEl.style.opacity = '0';
    // pointer-events coupé immédiatement — sinon l'overlay, invisible mais
    // toujours display:flex pendant les 230ms de fondu, intercepte le clic
    // suivant (ex: bouton retour "photo" juste en dessous) au lieu de le
    // laisser passer, d'où le bug "le bouton ne répond pas parfois".
    pgLbEl.style.pointerEvents = 'none';
    setTimeout(() => { if (pgLbEl) pgLbEl.style.display = 'none'; }, 230);
  }

  // Évènement
  document.querySelectorAll('#page-photo-event .pg-event-item').forEach((item, idx, all) => {
    item.addEventListener('click', () => {
      const srcs = [...all].map(el => el.querySelector('img').src);
      pgLbOpen(srcs, idx);
    });
  });

  // Street
  document.querySelectorAll('#page-photo-street .pg-event-item').forEach((item, idx, all) => {
    item.addEventListener('click', () => {
      const srcs = [...all].map(el => el.querySelector('img').src);
      pgLbOpen(srcs, idx);
    });
  });

  // Voyage
  document.querySelectorAll('#page-photo-voyage .pg-voyage-item').forEach((item, idx, all) => {
    item.addEventListener('click', () => {
      const srcs = [...all].map(el => el.querySelector('img').src);
      pgLbOpen(srcs, idx);
    });
  });

  document.addEventListener('keydown', e => {
    // Lightbox des bandes scroll horizontales (Tapage, Poster, ...)
    if (stripLbEl && stripLbEl.style.display !== 'none' && stripLbEl.style.opacity !== '0') {
      if (e.key === 'Escape')         { stripLbClose(); return; }
      if (e.key === 'ArrowLeft')      { stripLbNav(-1); return; }
      if (e.key === 'ArrowRight')     { stripLbNav(1);  return; }
    }
    // Photo lightbox partagé
    if (pgLbEl && pgLbEl.style.display !== 'none' && pgLbEl.style.opacity !== '0') {
      if (e.key === 'Escape')         { pgLbClose(); return; }
      if (e.key === 'ArrowLeft')      { pgLbNav(-1); return; }
      if (e.key === 'ArrowRight')     { pgLbNav(1);  return; }
    }
    // Voyage lightbox
    if (voyageState === 'lightbox') {
      const lb  = document.querySelector('.voyage-lightbox');
      const img = lb?.querySelector('.voyage-lb-img');
      if (!lb) return;
      if (e.key === 'Escape')          vLbClose(lb);
      else if (e.key === 'ArrowLeft')  vLbNav(lb, img, -1);
      else if (e.key === 'ArrowRight') vLbNav(lb, img,  1);
      return;
    }
    // Évènement lightbox
    if (eventState === 'lightbox') {
      const lb  = document.querySelector('.voyage-lightbox');
      const img = lb?.querySelector('.voyage-lb-img');
      if (!lb) return;
      if (e.key === 'Escape')          eLbClose(lb);
      else if (e.key === 'ArrowLeft')  eLbNav(lb, img, -1);
      else if (e.key === 'ArrowRight') eLbNav(lb, img,  1);
      return;
    }
    if (e.key !== 'Escape') return;
    if (voyageState === 'gallery') vClose();
    else if (voyageState === 'scatter') {
      clearTimeout(vLeaveTimer);
      document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
      vHideScatter(200, () => { voyageOverlay.innerHTML = ''; vSetState('off'); });
    }
    if (eventState === 'gallery') eClose();
    else if (eventState === 'scatter') {
      clearTimeout(eLeaveTimer);
      document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
      eHideScatter(200, () => { eventOverlay.innerHTML = ''; eSetState('off'); });
    }
    if (streetState === 'scatter') {
      clearTimeout(sLeaveTimer);
      document.querySelectorAll('.photo-list-item').forEach(i => i.classList.remove('is-hovered'));
      sHideScatter(200, () => { streetOverlay.innerHTML = ''; sSetState('off'); });
    }
  });

  // ── Formulaire Say Hello — soumission AJAX ───────────────────────────────
  const helloForm = document.querySelector('.hello-form');
  if (helloForm) {
    helloForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = helloForm.querySelector('.hello-form-btn');
      btn.disabled = true;
      btn.textContent = '…';

      try {
        const res = await fetch(helloForm.action, {
          method: 'POST',
          body: new FormData(helloForm),
          headers: { Accept: 'application/json' }
        });

        if (res.ok) {
          btn.style.transition = 'opacity 0.3s ease';
          btn.style.opacity = '0';
          setTimeout(() => {
            btn.style.display = 'none';
            const confirm = document.createElement('p');
            confirm.className = 'hello-form-confirm';
            confirm.textContent = i18n[siteLang]['form.confirm'];
            helloForm.appendChild(confirm);
            requestAnimationFrame(() => requestAnimationFrame(() => confirm.classList.add('is-visible')));
          }, 320);
        } else {
          btn.disabled = false;
          btn.textContent = i18n[siteLang]['form.retry'];
        }
      } catch {
        btn.disabled = false;
        btn.textContent = 'Réessayer →';
      }
    });
  }

  // ── Traduction FR / EN ───────────────────────────────────────────────────
  const i18n = {
    fr: {
      'hello.1': 'Un projet ?', 'hello.2': 'Un besoin ?', 'hello.3': 'Parlons-en.',
      'form.name': 'Nom', 'form.name.ph': 'Votre nom',
      'form.email.ph': 'votre@email.com',
      'form.msg.ph': 'Parlez-moi de votre projet…',
      'form.send': 'Envoyer →', 'form.retry': 'Réessayer →', 'form.confirm': 'Message envoyé — à bientôt.',
      'hello.bio': 'Graphiste et directeur artistique freelance basé à Bordeaux, je conçois des identités visuelles et des directions artistiques pour des marques, lieux culturels et événements. Mon travail mêle image, print, animation et narration dans une approche minimaliste et éditoriale, influencée par la photographie.',
      'hello.social': 'Réseaux', 'hello.freelance': 'Freelance indépendant',
      'photo.voyage': 'Voyage', 'photo.event': 'Évènement',
      'stoxl.tagline': 'Direction artistique — Graphisme',
      'tapage.tagline': 'Graphisme — Affiche',
      'palais.tagline': 'Direction artistique — Identité visuelle',
      'calsmith.tagline': 'Graphisme — Identité visuelle',
      'poster.tagline': 'Graphisme',
      'poster.title': 'Poster et animation',
      'fiche.year': 'Année',
      'stoxl.type': 'Direction artistique', 'stoxl.discipline': 'Graphisme, Identité visuelle',
      'tapage.type': 'Graphisme', 'tapage.discipline': 'Affiche, Typographie, Photographie, Motion design',
      'palais.type': 'Direction artistique', 'palais.discipline': 'Identité visuelle, Photographie',
      'calsmith.type': 'Graphisme', 'calsmith.discipline': 'Identité visuelle, Réseaux sociaux',
      'poster.type': 'Graphisme', 'poster.discipline': 'Graphisme',
      'pelago.type': 'Graphisme', 'pelago.discipline': 'Identité visuelle, Photographie',
      'fun.btn': 'Amusement', 'fun.cta': 'Cliquez ici et amusez-vous',
    },
    en: {
      'hello.1': 'A project?', 'hello.2': 'A need?', 'hello.3': "Let's talk.",
      'form.name': 'Name', 'form.name.ph': 'Your name',
      'form.email.ph': 'your@email.com',
      'form.msg.ph': 'Tell me about your project…',
      'form.send': 'Send →', 'form.retry': 'Try again →', 'form.confirm': 'Message sent — talk soon.',
      'hello.bio': 'Freelance graphic designer and art director based in Bordeaux, I design visual identities and art directions for brands, cultural venues and events. My work blends image, print, animation and narrative in a minimalist and editorial approach, influenced by photography.',
      'hello.social': 'Social', 'hello.freelance': 'Independent freelance',
      'photo.voyage': 'Travel', 'photo.event': 'Event',
      'stoxl.tagline': 'Art direction — Graphic design',
      'tapage.tagline': 'Graphic design — Poster',
      'palais.tagline': 'Art direction — Visual identity',
      'calsmith.tagline': 'Graphic design — Visual identity',
      'poster.tagline': 'Graphic design',
      'poster.title': 'Poster and animation',
      'fiche.year': 'Year',
      'stoxl.type': 'Art direction', 'stoxl.discipline': 'Graphic design, Visual identity',
      'tapage.type': 'Graphic design', 'tapage.discipline': 'Poster, Typography, Photography, Motion design',
      'palais.type': 'Art direction', 'palais.discipline': 'Visual identity, Photography',
      'calsmith.type': 'Graphic design', 'calsmith.discipline': 'Visual identity, Social media',
      'poster.type': 'Graphic design', 'poster.discipline': 'Graphic design',
      'pelago.type': 'Graphic design', 'pelago.discipline': 'Visual identity, Photography',
      'fun.btn': 'Playground', 'fun.cta': 'Click here and have fun',
    }
  };

  let siteLang = 'fr';

  function setLang(lang) {
    siteLang = lang;
    const dict = i18n[lang];

    // Textes data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = dict[el.dataset.i18n];
      if (v && !el.disabled) el.textContent = v;
    });
    // Placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const v = dict[el.dataset.i18nPh];
      if (v) el.placeholder = v;
    });
    // Matière Créative data-version
    document.querySelectorAll('.mc-v').forEach(el => {
      el.classList.toggle('is-shown', el.dataset.version === lang);
    });
    document.querySelectorAll('.mc-lang-btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.lang === lang);
    });
    // Bouton footer
    document.querySelectorAll('.gf-lang-opt').forEach(s => {
      s.classList.toggle('is-active', s.dataset.lang === lang);
    });
  }

  // Footer FR|EN
  const gfLangBtn = document.getElementById('gf-lang-btn');
  if (gfLangBtn) {
    gfLangBtn.addEventListener('click', e => {
      const opt = e.target.closest('.gf-lang-opt');
      if (opt && opt.dataset.lang !== siteLang) setLang(opt.dataset.lang);
    });
  }

  // Footer "Amusement" — pastilles jaunes poussées par la souris
  const funBtn   = document.getElementById('gf-fun-btn');
  const funLayer = document.getElementById('fun-dots-layer');
  let funActive  = false;
  let funDots    = [];
  let funMouseHandler = null;

  let funDragDot = null;
  let funDragOffX = 0, funDragOffY = 0;

  function spawnFunDots() {
    const count = window.innerWidth <= 768 ? 20 : 38;
    const size  = window.innerWidth <= 768 ? 90 : 130;
    const w = window.innerWidth, h = window.innerHeight;
    funDots = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const dot = document.createElement('div');
      dot.className = 'fun-dot';
      dot.style.width  = size + 'px';
      dot.style.height = size + 'px';
      dot.style.left   = x + 'px';
      dot.style.top    = y + 'px';
      funLayer.appendChild(dot);
      const d = { el: dot, x, y, r: size / 2 };
      funDots.push(d);
      const startDrag = (clientX, clientY) => {
        funDragDot = d;
        dot.classList.add('is-dragging');
        funDragOffX = clientX - d.x;
        funDragOffY = clientY - d.y;
      };
      dot.addEventListener('mousedown', e => {
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
      });
      dot.addEventListener('touchstart', e => {
        const t = e.touches[0];
        startDrag(t.clientX, t.clientY);
      }, { passive: true });
      requestAnimationFrame(() => dot.classList.add('is-in'));
    }
  }

  function removeFunDots() {
    funDots.forEach(d => {
      d.el.classList.remove('is-in');
      d.el.classList.add('is-out');
      setTimeout(() => d.el.remove(), 450);
    });
    funDots = [];
  }

  function handleFunMouseMove(e) {
    // Support souris ET tactile — un TouchEvent n'a pas de clientX/Y à sa
    // racine, seulement sur chacun de ses .touches[].
    const point = e.touches ? e.touches[0] : e;
    if (!point) return;
    if (e.cancelable) e.preventDefault(); // évite que la page scrolle pendant qu'on joue au doigt
    const w = window.innerWidth, h = window.innerHeight;

    if (funDragDot) {
      funDragDot.x = Math.max(funDragDot.r, Math.min(w - funDragDot.r, point.clientX - funDragOffX));
      funDragDot.y = Math.max(funDragDot.r, Math.min(h - funDragDot.r, point.clientY - funDragOffY));
      funDragDot.el.style.left = funDragDot.x + 'px';
      funDragDot.el.style.top  = funDragDot.y + 'px';
    }

    const mx = point.clientX, my = point.clientY;
    const pushRadius = 220;
    funDots.forEach(d => {
      if (d === funDragDot) return;
      const dx = d.x - mx, dy = d.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < pushRadius && dist > 0.01) {
        const force = (pushRadius - dist) / pushRadius;
        const angle = Math.atan2(dy, dx);
        d.x = Math.max(d.r, Math.min(w - d.r, d.x + Math.cos(angle) * force * 42));
        d.y = Math.max(d.r, Math.min(h - d.r, d.y + Math.sin(angle) * force * 42));
        d.el.style.left = d.x + 'px';
        d.el.style.top  = d.y + 'px';
      }
    });
  }

  function handleFunMouseUp() {
    if (funDragDot) {
      funDragDot.el.classList.remove('is-dragging');
      funDragDot = null;
    }
  }

  const helloFunBtn = document.getElementById('hello-fun-btn');

  function toggleFun() {
    funActive = !funActive;
    if (funBtn) {
      funBtn.classList.toggle('is-active', funActive);
      funBtn.setAttribute('aria-pressed', String(funActive));
    }
    if (helloFunBtn) helloFunBtn.classList.toggle('is-active', funActive);
    if (funActive) {
      spawnFunDots();
      funMouseHandler = handleFunMouseMove;
      document.addEventListener('mousemove', funMouseHandler);
      document.addEventListener('mouseup', handleFunMouseUp);
      document.addEventListener('touchmove', funMouseHandler, { passive: false });
      document.addEventListener('touchend', handleFunMouseUp);
      document.addEventListener('touchcancel', handleFunMouseUp);
    } else {
      funDragDot = null;
      document.removeEventListener('mouseup', handleFunMouseUp);
      document.removeEventListener('touchend', handleFunMouseUp);
      document.removeEventListener('touchcancel', handleFunMouseUp);
      removeFunDots();
      if (funMouseHandler) {
        document.removeEventListener('mousemove', funMouseHandler);
        document.removeEventListener('touchmove', funMouseHandler);
      }
      funMouseHandler = null;
    }
  }

  if (funBtn) funBtn.addEventListener('click', toggleFun);
  if (helloFunBtn) helloFunBtn.addEventListener('click', toggleFun);

  // Boutons projet FR/EN — tous branchés sur setLang
  document.addEventListener('click', e => {
    const btn = e.target.closest('.mc-lang-btn');
    if (btn && btn.dataset.lang && btn.dataset.lang !== siteLang) setLang(btn.dataset.lang);
  });

  // ── Footer global — clip-path reveal + arrondi ───────────────────────────
  // Supprimer les anciens site-footer (remplacés par le footer global)
  pages.forEach(page => {
    const old = page.querySelector('.site-footer');
    if (old) old.remove();
  });

  // Navigation depuis le footer (délégation d'événement)
  document.addEventListener('click', e => {
    const link = e.target.closest('.gf-link[data-target]');
    if (!link || transitioning) return;
    e.preventDefault();
    const target = link.dataset.target;
    if (target === current) return;
    navigateTo(target);
  });

  // Scroll : clip-path ouvre la page par le bas + révèle le footer derrière
  // GF_H = hauteur footer révélée, dynamique selon viewport
  pages.forEach(page => {
    page.addEventListener('scroll', () => {
      const gfH = window.innerWidth <= 768 ? 460 : 300;
      const dist = page.scrollHeight - page.scrollTop - page.clientHeight;
      const progress = Math.max(0, Math.min(1, 1 - dist / gfH));
      if (progress > 0) {
        const revealed = Math.round(progress * gfH);
        const radius   = Math.round(progress * 52);
        page.style.clipPath =
          `inset(0 0 ${revealed}px 0 round 0 0 ${radius}px ${radius}px)`;
        if (globalFooter) globalFooter.classList.toggle('is-visible', progress > 0.35);
      } else {
        page.style.clipPath = '';
        if (globalFooter) globalFooter.classList.remove('is-visible');
      }
    }, { passive: true });
  });

});
