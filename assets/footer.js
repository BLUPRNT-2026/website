
  /* =========================================================
     FOOTER CUSTOM CODE – Übersicht

     1) Navigation: Active States
     2) Tabs: Expandable Sync (Multi-Pass)
     3) Tabs (<=991px): Klick deaktivieren nur für .tab-card--image
     4) Tabs (<=991px): Tab/Bildwechsel per Horizontal-Scroll (>=60% sichtbar)
     5) Tabs (<=991px): Bilder vorladen + Höhe fixieren (gegen „Hüpfen“)
     6) Lottie: Init + Toggle + Resize + BFCache (ohne Console-Ausgaben)
  ========================================================= */

  /* =========================================================
     1) NAVIGATION – Active States
  ========================================================= */
  document.addEventListener('DOMContentLoaded', function () {
    const erfolgeLink = document.querySelector('a[href="/erfolge"]');
    const karriereLink = document.querySelector('a[href="/karriere"]');
    const leistungenDropdown = document.querySelector('.navbar__dropdown-toggle');

    if (window.location.pathname.includes('/erfolge')) {
      if (erfolgeLink) erfolgeLink.classList.add('current');
    }

    if (window.location.pathname.includes('/leistungen/')) {
      if (leistungenDropdown) leistungenDropdown.classList.add('current');
    }

    if (window.location.pathname.includes('/karriere/')) {
      if (karriereLink) karriereLink.classList.add('current');
    }

    /* =========================================================
       A11Y – Header CTA Duplicate (Desktop vs Mobile)
       Goal: Keep both buttons for layout, but ensure only ONE is focusable
       and exposed to assistive tech at a time (WAVE redundancy).

       Desktop CTA: .navbar__cta
       Mobile CTA:  .navbar__cta-mobile (visible <=478px)
    ========================================================= */
    (function headerCtaA11yToggle() {
      const mqMobile = window.matchMedia('(max-width: 478px)');

      function setA11y(el, enabled) {
        if (!el) return;
        if (enabled) {
          el.removeAttribute('aria-hidden');
          el.removeAttribute('tabindex');
          el.style.pointerEvents = '';
        } else {
          el.setAttribute('aria-hidden', 'true');
          el.setAttribute('tabindex', '-1');
          el.style.pointerEvents = 'none';
        }
      }

      function apply() {
        const desktopCta = document.querySelector('.navbar__cta');
        const mobileCta = document.querySelector('.navbar__cta-mobile');

        // Mobile viewport: mobile CTA is the real one; desktop CTA becomes inert
        if (mqMobile.matches) {
          setA11y(desktopCta, false);
          setA11y(mobileCta, true);
        } else {
          setA11y(desktopCta, true);
          setA11y(mobileCta, false);
        }
      }

      apply();

      // React to breakpoint changes
      try {
        mqMobile.addEventListener('change', apply);
      } catch (_) {
        mqMobile.addListener(apply);
      }

      // Webflow can re-render nav; re-apply a couple of times defensively
      setTimeout(apply, 120);
      setTimeout(apply, 350);
      window.addEventListener('orientationchange', () => setTimeout(apply, 220), { passive: true });
      window.addEventListener('pageshow', () => setTimeout(apply, 50));
    })();
  });

  /* =========================================================
     2) TABS – Expandable Content (Webflow)
  ========================================================= */
  window.Webflow = window.Webflow || [];
  window.Webflow.push(() => {
    function setIconRotation(linkEl, expanded) {
      const icon = linkEl?.querySelector('.faq-vertical');
      if (!icon) return;
      icon.style.transformOrigin = 'center';
      icon.style.transition = 'transform 280ms ease';
      icon.style.transform = expanded ? 'rotate(90deg)' : 'rotate(0deg)';
    }

    function openBottom(linkEl, bottomEl) {
      linkEl.classList.add('is-expanded');
      bottomEl.style.maxHeight = bottomEl.scrollHeight + 'px';
    }

    function closeBottom(linkEl, bottomEl) {
      linkEl.classList.remove('is-expanded');
      bottomEl.style.maxHeight = '0px';
    }

    function syncTabsLinks(tabsEl) {
      const links = Array.from(tabsEl.querySelectorAll('.w-tab-menu .w-tab-link'));
      if (!links.length) return;

      links.forEach(link => {
        const isCurrent = link.classList.contains('w--current');
        const bottoms = link.querySelectorAll('.expandable-bottom');

        bottoms.forEach(bottom => {
          bottom.style.height = '';
          bottom.style.opacity = '';
          bottom.style.transform = '';
          if (isCurrent) openBottom(link, bottom);
          else closeBottom(link, bottom);
        });

        setIconRotation(link, isCurrent);
      });
    }

    function syncAll() {
      document.querySelectorAll('.w-tabs').forEach(syncTabsLinks);
    }

    function runMultiPass() {
      syncAll();
      setTimeout(syncAll, 80);
      setTimeout(syncAll, 180);
      setTimeout(syncAll, 350);
      setTimeout(syncAll, 700);
    }

    requestAnimationFrame(() => requestAnimationFrame(runMultiPass));

    document.addEventListener(
      'click',
      e => {
        if (e.target.closest('.w-tab-link')) setTimeout(runMultiPass, 30);
      },
      true
    );

    window.addEventListener(
      'resize',
      () => {
        document.querySelectorAll('.w-tab-link.w--current .expandable-bottom').forEach(bottom => {
          bottom.style.maxHeight = bottom.scrollHeight + 'px';
        });
      },
      { passive: true }
    );

    window.addEventListener(
      'orientationchange',
      () => setTimeout(runMultiPass, 220),
      { passive: true }
    );

    /* =========================================================
       3) TAB-CARDS (mit Bild) – Tablet: Klick deaktivieren
       Nur für .tab-card--image, andere Tabs bleiben klickbar
    ========================================================= */
    (function disableTabCardImageClickOnTablet() {
      const mq = window.matchMedia('(max-width: 991px)');

      function apply() {
        const isTablet = mq.matches;

        document.querySelectorAll('.w-tab-link.tab-card--image').forEach(a => {
          if (isTablet) {
            a.setAttribute('aria-disabled', 'true');
            a.setAttribute('tabindex', '-1');

            // pointer-events wird im CSS gesetzt; hier nur Accessibility + defensive blocking
            if (!a.dataset.clickBlocked) {
              a.dataset.clickBlocked = '1';

              const stop = e => {
                // allow programmatic tab switching (used by scroll-sync)
                if (e && e.isTrusted === false) return;
                if (!mq.matches) return; // Desktop wieder normal
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation?.();
                return false;
              };

              a.addEventListener('click', stop, true);
              a.addEventListener('pointerdown', stop, true);
              a.addEventListener('touchstart', stop, { capture: true, passive: false });

              a.addEventListener(
                'keydown',
                e => {
                  if (e && e.isTrusted === false) return;
                  if (!mq.matches) return;
                  // Enter/Space blocken
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                },
                true
              );
            }
          } else {
            a.removeAttribute('aria-disabled');
            // tabindex zurückgeben, damit es wieder normal funktioniert
            a.removeAttribute('tabindex');
          }
        });
      }

      // initial
      apply();

      // breakpoint change
      try {
        mq.addEventListener('change', apply);
      } catch (_) {
        mq.addListener(apply);
      }

      // safety for Webflow updates
      setTimeout(apply, 120);
      setTimeout(apply, 350);

      window.addEventListener('resize', () => setTimeout(apply, 50), { passive: true });
      window.addEventListener('orientationchange', () => setTimeout(apply, 220), { passive: true });
      window.addEventListener('pageshow', () => setTimeout(apply, 50));
    })();

    /* =========================================================
       4) TAB-CARDS (mit Bild) – Tablet: Bildwechsel per Horizontal-Scroll
       Switch bei >=60% Sichtbarkeit (mit Hysterese gegen Flackern)
    ========================================================= */
    (function scrollSwitchTabCardImagesOnTablet() {
      const mq = window.matchMedia('(max-width: 991px)');

      function setupOneTabs(tabsEl) {
        const menu = tabsEl.querySelector('.tabs_menu-cards.w-tab-menu');
        const content = tabsEl.querySelector('.tabs_content-cards.w-tab-content');
        if (!menu || !content) return;

        const links = Array.from(menu.querySelectorAll('a.w-tab-link.tab-card--image'));
        if (!links.length) return;

        // Prevent duplicate observers
        if (menu.__scrollTabsObserver) {
          try {
            menu.__scrollTabsObserver.disconnect();
          } catch (_) {}
          menu.__scrollTabsObserver = null;
        }

        let lastSwitchTs = 0;
        let currentId = links.find(l => l.classList.contains('w--current'))?.id || '';

        function activateLink(link) {
          if (!link) return;
          if (!mq.matches) return;
          if (link.classList.contains('w--current')) return;

          const now = Date.now();
          // small cooldown to avoid flicker near boundaries
          if (now - lastSwitchTs < 220) return;

          lastSwitchTs = now;
          currentId = link.id || currentId;

          // programmatic click (allowed via isTrusted guard)
          try {
            link.click();
          } catch (_) {}
        }

        const io = new IntersectionObserver(
          entries => {
            if (!mq.matches) return;

            // pick the most visible card
            let best = null;
            let bestRatio = 0;

            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              const r = entry.intersectionRatio || 0;
              if (r > bestRatio) {
                bestRatio = r;
                best = entry.target;
              }
            }

            // threshold/hysteresis: switch only if clearly dominant
            if (best && bestRatio >= 0.60) {
              // if two are close, keep the current one
              const current =
                links.find(l => l.id === currentId) ||
                links.find(l => l.classList.contains('w--current'));

              if (current && current !== best) {
                const curEntry = entries.find(e => e.target === current);
                const curRatio = curEntry?.intersectionRatio || 0;
                if (curRatio >= 0.55 && bestRatio - curRatio < 0.10) return;
              }

              activateLink(best);
            }
          },
          {
            root: menu,
            threshold: [0, 0.25, 0.5, 0.55, 0.6, 0.65, 0.75, 1]
          }
        );

        links.forEach(l => io.observe(l));
        menu.__scrollTabsObserver = io;

        // Also: on scroll end, ensure we activate the best visible card
        let t;
        menu.addEventListener(
          'scroll',
          () => {
            if (!mq.matches) return;
            clearTimeout(t);
            t = setTimeout(() => {
              // compute visibility manually as a fallback
              const mRect = menu.getBoundingClientRect();
              let best = null;
              let bestRatio = 0;

              links.forEach(link => {
                const r = link.getBoundingClientRect();
                const visibleW = Math.max(
                  0,
                  Math.min(r.right, mRect.right) - Math.max(r.left, mRect.left)
                );
                const ratio = r.width ? visibleW / r.width : 0;
                if (ratio > bestRatio) {
                  bestRatio = ratio;
                  best = link;
                }
              });

              if (best && bestRatio >= 0.60) activateLink(best);
            }, 120);
          },
          { passive: true }
        );

        // initial sync (after layout)
        setTimeout(() => {
          if (!mq.matches) return;
          const mRect = menu.getBoundingClientRect();
          let best = null;
          let bestRatio = 0;
          links.forEach(link => {
            const r = link.getBoundingClientRect();
            const visibleW = Math.max(
              0,
              Math.min(r.right, mRect.right) - Math.max(r.left, mRect.left)
            );
            const ratio = r.width ? visibleW / r.width : 0;
            if (ratio > bestRatio) {
              bestRatio = ratio;
              best = link;
            }
          });
          if (best && bestRatio >= 0.60) activateLink(best);
        }, 60);
      }

      function boot() {
        if (!mq.matches) return;
        document.querySelectorAll('.w-tabs').forEach(setupOneTabs);
      }

      // initial + multipass (Webflow can re-render)
      boot();
      setTimeout(boot, 120);
      setTimeout(boot, 350);

      // breakpoint change
      try {
        mq.addEventListener('change', () => {
          // when entering tablet: re-bind
          boot();
        });
      } catch (_) {
        mq.addListener(() => boot());
      }
    })();

    /* =========================================================
       5) TABS (Cards) – Tablet: Bilder vorladen + Höhe einfrieren
       Fix gegen „Hüpfen“ beim ersten Durchscrollen
    ========================================================= */
    (function stabilizeTabImagesOnTablet() {
      const isTablet = () => window.matchMedia('(max-width: 991px)').matches;

      // robust src selection (currentSrc ist oft leer bevor das Bild gerendert wurde)
      const getBestSrc = img => img.getAttribute('src') || img.currentSrc || '';

      function stabilizeOne(content) {
        if (!content) return;

        const panes = Array.from(content.querySelectorAll('.tab_pane--cards.w-tab-pane'));
        const imgs = panes.flatMap(p => Array.from(p.querySelectorAll('img')));
        if (!imgs.length) return;

        // 1) Tablet: Lazy-Load aus (verursacht den First-Pass Jump)
        if (isTablet()) {
          imgs.forEach((img, i) => {
            try {
              img.setAttribute('loading', 'eager');
              img.loading = 'eager';
              img.decoding = 'async';
              if (i < 2) img.setAttribute('fetchpriority', 'high');
            } catch (_) {}
          });
        }

        // 2) Höhe „hart“ stabilisieren: Webflows inline height (falls vorhanden)
        //    und frieren sie als height+min-height ein, damit beim Pane-Wechsel nichts kurz auf auto springt.
        let locked = false;
        const lockHeightNow = () => {
          if (!isTablet()) {
            // Desktop: nichts anfassen
            content.style.minHeight = '';
            // height nur zurücksetzen, wenn wir sie zuvor gelockt haben
            if (locked) content.style.height = '';
            locked = false;
            return;
          }

          // bevorzugt: inline style height von Webflow
          const inlineH = (content.getAttribute('style') || '').match(/height:\s*(\d+)px/);
          const baseH = inlineH ? parseInt(inlineH[1], 10) : content.offsetHeight;

          if (baseH && baseH > 0) {
            content.style.height = baseH + 'px';
            content.style.minHeight = baseH + 'px';
            locked = true;
          }
        };

        // mehrstufig (Webflow setzt height oft erst nach dem ersten Paint)
        requestAnimationFrame(() => requestAnimationFrame(lockHeightNow));
        setTimeout(lockHeightNow, 120);
        setTimeout(lockHeightNow, 350);

        // 3) Preload/Decode: sorgt dafür, dass beim ersten Tab-Wechsel nicht erst dann dekodiert wird
        const preloadPromises = imgs.map(img => {
          const src = getBestSrc(img);
          if (!src) return Promise.resolve();

          // wenn schon geladen: decode falls möglich
          if (img.complete && img.naturalWidth > 0) {
            if (img.decode) return img.decode().catch(() => {});
            return Promise.resolve();
          }

          // preload via Image()
          return new Promise(resolve => {
            const im = new Image();
            im.onload = () => resolve();
            im.onerror = () => resolve();
            im.src = src;
          });
        });

        Promise.all(preloadPromises).then(() => {
          // nach decode: nochmal locken
          requestAnimationFrame(() => requestAnimationFrame(lockHeightNow));
        });

        // 4) Wenn einzelne Images später loaden -> erneut locken
        imgs.forEach(img => {
          if (!img.complete) {
            img.addEventListener(
              'load',
              () => {
                requestAnimationFrame(() => requestAnimationFrame(lockHeightNow));
              },
              { once: true }
            );
          }
        });

        // 5) Pane-Wechsel beobachten (Webflow toggelt display/opacity) -> sofort wieder locken
        const mo = new MutationObserver(() => {
          // nur auf Tablet
          if (!isTablet()) return;
          lockHeightNow();
        });
        panes.forEach(p => mo.observe(p, { attributes: true, attributeFilter: ['class', 'style'] }));

        // 6) Resize/Orientation: neu locken
        let t;
        window.addEventListener(
          'resize',
          () => {
            clearTimeout(t);
            t = setTimeout(() => {
              // kurz unlocken, neu messen, wieder locken
              if (isTablet()) {
                content.style.minHeight = '';
                content.style.height = '';
              }
              lockHeightNow();
            }, 150);
          },
          { passive: true }
        );

        window.addEventListener('orientationchange', () => setTimeout(lockHeightNow, 220), {
          passive: true
        });

        // 7) BFCache restore
        window.addEventListener('pageshow', e => {
          if (!e.persisted) return;
          lockHeightNow();
        });
      }

      function boot() {
        document
          .querySelectorAll('.tabs_content-cards.w-tab-content')
          .forEach(stabilizeOne);
      }

      // initial + multipass (Webflow baut Tabs teils nachträglich)
      boot();
      setTimeout(boot, 120);
      setTimeout(boot, 350);
    })();
  });

  /* =========================================================
     6) LOTTIE – Init + Controls + Resize + BFCache (ohne Console)
  ========================================================= */
  (function () {
    let attempts = 0;
    const MAX = 40;

    function initAll() {
      // Safety: if lottie-web failed to load for any reason, do nothing (prevents ReferenceError)
      if (typeof window.lottie === 'undefined') return;
      const wrappers = document.querySelectorAll('.lottie-wrapper[data-lottie-src]');

      wrappers.forEach(wrapper => {
        if (wrapper.dataset.lottieInited === '1') return;
        wrapper.dataset.lottieInited = '1';

        const container = wrapper.querySelector('.lottie-container');
        if (!container) return;

        // sauber starten
        container.innerHTML = '';

        const btn = wrapper.querySelector('.lottie-toggle');
        const icon = btn?.querySelector('span');

        // Ensure the icon is rendered via CSS (no emoji glyphs)
        if (icon) {
          icon.classList.add('lottie-icon');
          icon.setAttribute('aria-hidden', 'true');
          // Remove any emoji/text to avoid iOS/Safari replacements
          icon.textContent = '';
        }

        const src = wrapper.getAttribute('data-lottie-src');
        const noAnim = wrapper.getAttribute('data-no-anim') === 'true';

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const shouldLoop = !noAnim && !prefersReducedMotion;
        const shouldAutoplay = !prefersReducedMotion;

        const anim = window.lottie.loadAnimation({
          container,
          renderer: 'svg',
          loop: shouldLoop,
          autoplay: shouldAutoplay,
          path: src,
          rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
        });

        wrapper.__lottieAnim = anim;

        // Button optional
        if (!noAnim && btn && icon) {
          let isPlaying = shouldAutoplay;

          const setUI = playing => {
            // State is used by CSS to show Play/Pause icon
            btn.dataset.state = playing ? 'playing' : 'paused';
            btn.setAttribute('aria-pressed', playing ? 'false' : 'true');
            btn.setAttribute('aria-label', playing ? 'Animation pausieren' : 'Animation abspielen');
          };

          setUI(isPlaying);

          if (!btn.dataset.wired) {
            btn.dataset.wired = '1';
            btn.addEventListener('click', () => {
              isPlaying = !isPlaying;
              setUI(isPlaying);

              if (isPlaying) {
                anim.setLoop(true);
                anim.play();
              } else {
                anim.setLoop(false);
                anim.pause();
              }
            });
          }
        }

        anim.addEventListener('DOMLoaded', () => {
          const svg = container.querySelector('svg');
          if (!svg) return;

          svg.removeAttribute('width');
          svg.removeAttribute('height');
          svg.style.width = '100%';
          svg.style.height = 'auto';
          svg.style.display = 'block';
          svg.style.shapeRendering = 'geometricPrecision';
          svg.style.textRendering = 'geometricPrecision';
          svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

          requestAnimationFrame(() => {
            try {
              anim.resize();
            } catch (e) {}
          });
        });
      });
    }

    function boot() {
      attempts++;

      if (typeof lottie === 'undefined') {
        if (attempts < MAX) return setTimeout(boot, 150);
        return;
      }

      initAll();
    }

    // 1) Normal load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }

    // 2) Webflow ready (nur resize/late init)
    window.Webflow = window.Webflow || [];
    window.Webflow.push(() => {
      initAll();
      document.querySelectorAll('.lottie-wrapper').forEach(w => {
        try {
          w.__lottieAnim?.resize?.();
        } catch (_) {}
      });
    });

    // 3) Resize nur 1x global_jobs (debounced)
    let t;
    window.addEventListener(
      'resize',
      () => {
        clearTimeout(t);
        t = setTimeout(() => {
          document.querySelectorAll('.lottie-wrapper').forEach(w => {
            try {
              w.__lottieAnim?.resize?.();
            } catch (_) {}
          });
        }, 200);
      },
      { passive: true }
    );

    // 4) BFCache fix (Safari/Chrome Back/Forward Cache)
    window.addEventListener('pageshow', e => {
      if (!e.persisted) return;

      document.querySelectorAll('.lottie-wrapper').forEach(w => {
        try {
          w.__lottieAnim?.destroy?.();
        } catch (_) {}
        w.__lottieAnim = null;
        w.dataset.lottieInited = '';
        const c = w.querySelector('.lottie-container');
        if (c) c.innerHTML = '';
      });

      boot();
    });
  })();
