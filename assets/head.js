/* =========================================================
   2) SUBMIT BUTTON PROXY
========================================================= */
  
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('[wf-submit-trigger="true"]')
      ?.addEventListener("click", () => {
        const submit = document.querySelector('input[type="submit"]');
        if (!submit) return;
  
        const form = submit.closest('form');
        if (form) {
          form.setAttribute('target', '_blank');
        }
  
        submit.click();
      });
  });
  
  /* =========================================================
     3) ENTER KEY BEHAVIOR
  ========================================================= */
  
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('input[type="text"], input[type="email"]').forEach(input => {
      input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          input.blur();
        }
      });
    });
  });
  
  
  
  /* =========================================================
     4) COUNTER – Number Animation (FASTER) + UNIT ALWAYS VISIBLE
  ========================================================= */
  
  (function () {
    // schnelleres easing (weniger "ausrollen" am Ende)
    const ease = t => 1 - Math.pow(1 - t, 3);
  
    function animateNumber(el, target, duration, onComplete) {
      let startTime, start = 0;
  
      function step(ts) {
        if (!startTime) startTime = ts;
        const p = Math.min((ts - startTime) / duration, 1);
        el.textContent = String(Math.round(start + (target - start) * ease(p)));
  
        if (p < 1) requestAnimationFrame(step);
        else {
          el.textContent = String(target);
          onComplete && onComplete();
        }
      }
  
      requestAnimationFrame(step);
    }
  
    function parseNumber(el) {
      const raw = (el.textContent || '').replace(/[^\d.-]/g, '');
      const n = parseFloat(raw);
      return isNaN(n) ? 0 : n;
    }
  
    function startCounter(el) {
      if (!el || el.dataset.started) return;
      el.dataset.started = 'true';
  
      const target = parseNumber(el);
  
      // Default schneller: 1200ms statt 2000ms
      // weiterhin pro Element steuerbar: duration="900"
      const duration = parseInt(el.getAttribute('duration'), 10) || 1200;
  
      // Unit-Element finden
      const unitEl =
        el.closest('[counter-wrapper]')?.querySelector('[counter="unit"]') ||
        el.parentElement?.querySelector('[counter="unit"]');
  
      // ✅ Einheit sofort sichtbar lassen (falls irgendwo Styles dran hängen)
      if (unitEl) {
        unitEl.style.opacity = '1';
        unitEl.style.transform = 'translateY(0)';
        unitEl.style.willChange = '';
      }
  
      // ✅ zählen starten (ohne Fade-In am Ende)
      animateNumber(el, target, duration);
    }
  
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '200px 0px', threshold: 0.01 }); // etwas früher starten
  
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('[counter-element="number"]').forEach(el => {
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
  
        if (inView) startCounter(el);
        else io.observe(el);
  
        // ✅ Kein Verstecken der Unit mehr
        // (Dieser Block war vorher dafür verantwortlich, dass die Einheit erst später erscheint.)
      });
    });
  
    window.Webflow = window.Webflow || [];
    window.Webflow.push(() => {
      document.querySelectorAll('[counter-element="number"]').forEach(el => {
        if (!el.dataset.started) {
          const rect = el.getBoundingClientRect();
          const inView = rect.top < window.innerHeight && rect.bottom > 0;
          if (inView) startCounter(el);
        }
      });
    });
  })();
  
  
  
  /* =========================================================
     6) FORMULAR-SICHERHEIT – Honeypot & Bot Protection
  ========================================================= */
  
  document.addEventListener('DOMContentLoaded', function() {
    const submit = document.querySelector("#contactSubmit");
    const honeypotOne = document.querySelector("#FestnetzID");
    const honeypotTwo = document.querySelector("#StadtID");
    
    if (!submit || !honeypotOne || !honeypotTwo) {
      return;
    }
    
    const form = submit.closest('form');
    
    if (!form) {
      return;
    }
    
    // Zeit-Tracking
    let pageLoadTime = Date.now();
    const minTime = 3000;
    let formCanSubmit = false;
    let attemptCount = 0;
    const maxAttempts = 3;
    
    // Honeypot Check
    function checkHoneypots() {
      if (honeypotOne.value.length > 0 || honeypotTwo.value.length > 0) {
        submit.disabled = true;
      } else {
        submit.disabled = false;
      }
    }
    
    honeypotOne.addEventListener('input', checkHoneypots);
    honeypotTwo.addEventListener('input', checkHoneypots);
    
    // Time-Based Check
    form.addEventListener('submit', function(e) {
      // Wenn bereits validiert, durchlassen
      if (formCanSubmit) {
        return true;
      }
      
      e.preventDefault();
      e.stopPropagation();
      
      attemptCount++;
      const timeSpent = Date.now() - pageLoadTime;
      
      // Check 1: Honeypot (immer blockieren, kein zweiter Versuch)
      if (honeypotOne.value.length > 0 || honeypotTwo.value.length > 0) {
        alert("Es ist ein Fehler aufgetreten. Bitte laden Sie die Seite neu.");
        submit.disabled = true;
        return false;
      }
      
      // Check 2: Zu viele Versuche? (Bot-Verhalten)
      if (attemptCount > maxAttempts) {
        alert("Zu viele Versuche. Bitte laden Sie die Seite neu.");
        submit.disabled = true;
        return false;
      }
      
      // Check 3: Zu schnell?
      if (timeSpent < minTime) {
        // Timer zurücksetzen für nächsten Versuch
        pageLoadTime = Date.now();
        
        alert("Bitte nehmen Sie sich einen Moment Zeit, um das Formular auszufüllen.");
        return false;
      }
      
      // Alle Checks bestanden!
      formCanSubmit = true;
      form.submit();
      
      return false;
    });
  });
  /* =========================================================
     7) CUSTOM PROPS – Dynamic SVG + Image Settings
  ========================================================= */
  
  document.addEventListener('DOMContentLoaded', function() {
    let isUpdating = false;
    
    function updateIcons() {
      if (isUpdating) return;
      isUpdating = true;
      
      document.querySelectorAll('[data-svg]').forEach(container => {
        const svgCode = container.getAttribute('data-svg');
        if (svgCode && !container.querySelector('svg')) {
          container.innerHTML = svgCode;
        }
        
        const svg = container.querySelector('svg');
        if (svg) {
          const computedStyle = window.getComputedStyle(container);
          
          const customSize = container.getAttribute('data-size');
          const customColor = container.getAttribute('data-color');
          const customStroke = container.getAttribute('data-stroke');
          
          const designerColor = computedStyle.color;
          const designerStroke = parseFloat(computedStyle.borderWidth);
          
          const finalColor = customColor || designerColor || '#2e2d2c';
          const finalStroke = customStroke || designerStroke || 1;
          
          if (customSize) {
            container.style.width = customSize + 'px';
            container.style.height = customSize + 'px';
          }
          
          svg.style.width = '100%';
          svg.style.height = '100%';
          svg.setAttribute('stroke-linecap', 'round');
          svg.setAttribute('stroke-linejoin', 'round');
          
          const rootHasStroke = svg.getAttribute('stroke') === 'currentColor';
          const rootHasFill = svg.getAttribute('fill') === 'currentColor';
          
          if (rootHasStroke) {
            svg.setAttribute('stroke', finalColor);
            svg.setAttribute('stroke-width', finalStroke);
            if (!svg.getAttribute('fill')) {
              svg.setAttribute('fill', 'none');
            }
          }
          if (rootHasFill) {
            svg.setAttribute('fill', finalColor);
          }
          
          const allElements = svg.querySelectorAll('*');
          allElements.forEach(element => {
            const elementStroke = element.getAttribute('stroke');
            const elementFill = element.getAttribute('fill');
            
            if (elementStroke === 'currentColor') {
              element.setAttribute('stroke', finalColor);
              const currentWidth =
                parseFloat(element.getAttribute('stroke-width') || svg.getAttribute('stroke-width') || 1);
              element.setAttribute('stroke-width', String(finalStroke * currentWidth));
              
              if (!elementFill) {
                element.setAttribute('fill', 'none');
              }
            }
            
            if (elementFill === 'currentColor') {
              element.setAttribute('fill', finalColor);
            }
            
            if (!elementStroke && !elementFill && rootHasStroke) {
              element.setAttribute('stroke', finalColor);
              element.setAttribute('fill', 'none');
              const currentWidth =
                parseFloat(element.getAttribute('stroke-width') || svg.getAttribute('stroke-width') || 1);
              element.setAttribute('stroke-width', String(finalStroke * currentWidth));
            }
          });
        }
      });
      
      setTimeout(function() { isUpdating = false; }, 100);
    }
    
    function updateImages() {
      const imageContainers = document.querySelectorAll('[data-fit], [data-position], [data-flip]');

      // -------- Helpers --------
      const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

      function flipPercentToken(token) {
        // "20%" -> "80%" (clamped 0..100)
        const m = String(token).trim().match(/^(-?\d+(?:\.\d+)?)%$/);
        if (!m) return token;
        const x = parseFloat(m[1]);
        const flipped = clamp(100 - x, 0, 100);
        return `${flipped}%`;
      }

      function normalizeObjectPosition(pos) {
        // Ensure we always have 2 tokens: "center" -> "center center"
        const tokens = String(pos).trim().split(/\s+/).filter(Boolean);
        if (tokens.length === 0) return ['center', 'center'];
        if (tokens.length === 1) return [tokens[0], 'center'];
        return [tokens[0], tokens[1]];
      }

      function flipObjectPosition(pos, flipMode) {
        if (!pos) return pos;

        const mode = String(flipMode || '').toLowerCase().trim();
        const flipH = mode === 'horizontal' || mode === 'both';
        const flipV = mode === 'vertical' || mode === 'both';

        let [x, y] = normalizeObjectPosition(pos);

        if (flipH) {
          if (x === 'left') x = 'right';
          else if (x === 'right') x = 'left';
          else x = flipPercentToken(x);
        }

        if (flipV) {
          if (y === 'top') y = 'bottom';
          else if (y === 'bottom') y = 'top';
          else y = flipPercentToken(y);
        }

        return `${x} ${y}`;
      }

      function applyFlipTransform(img, flipMode) {
        const mode = String(flipMode || '').toLowerCase().trim();

        // If nothing set, remove transform to avoid fighting other styles
        if (!mode) {
          img.style.removeProperty('transform');
          return;
        }

        if (mode === 'horizontal') img.style.setProperty('transform', 'scaleX(-1)', 'important');
        else if (mode === 'vertical') img.style.setProperty('transform', 'scaleY(-1)', 'important');
        else if (mode === 'both') img.style.setProperty('transform', 'scale(-1, -1)', 'important');
      }

      // -------- Main --------
      imageContainers.forEach(function (container) {
        const fitValue = container.getAttribute('data-fit');
        const positionValue = container.getAttribute('data-position');
        const flipValue = container.getAttribute('data-flip');

        const images = container.tagName === 'IMG' ? [container] : container.querySelectorAll('img');

        images.forEach(function (img) {
          // 1) Werte auflösen: IMG > Container
          const fit = img.getAttribute('data-fit') ?? fitValue;
          const position = img.getAttribute('data-position') ?? positionValue;
          const flip = img.getAttribute('data-flip') ?? flipValue;

          // 2) object-fit
          if (fit && fit !== '' && fit.indexOf('{') === -1) {
            if (['fill', 'contain', 'cover', 'none', 'scale-down'].indexOf(fit) !== -1) {
              // Use !important so Webflow variant CSS cannot override
              img.style.setProperty('object-fit', fit, 'important');
            }
          }

          // 3) flip (transform)
          applyFlipTransform(img, flip);

          // 4) object-position (mirror it when flipped, so the VISUAL position stays the same)
          if (position && position !== '' && position.indexOf('{') === -1) {
            const finalPos = flipObjectPosition(position, flip);
            // Use !important so Webflow variant CSS cannot override
            img.style.setProperty('object-position', finalPos, 'important');
          }
        });
      });
    }
    
    function updateAll() {
      updateIcons();
      updateImages();
    }
    
    updateAll();
    
    let timeout;
    const observer = new MutationObserver(function() {
      clearTimeout(timeout);
      timeout = setTimeout(updateAll, 250);
    });
    
    observer.observe(document.body, { 
      attributes: true, 
      childList: true,
      subtree: true 
    });
  });
  
  /* =========================================================
     8) SMART NAVIGATION – Parent Highlight
  ========================================================= */
  
  (function() {
    const path = window.location.pathname;
    
    // Extrahiere ersten Teil der URL
    const pathParts = path.split('/').filter(part => part);
    const firstSegment = pathParts[0]; // z.B. "leistungen", "erfolge", "karriere"
    
    // Nur wenn wir auf einer Unterseite sind (mindestens 2 Segmente)
    if (pathParts.length < 2) return;
    
    window.addEventListener('DOMContentLoaded', function() {
      const navbar = document.querySelector('.navbar__nav');
      if (!navbar) return;
      
      // 1. Checke erst Dropdowns
      const dropdowns = navbar.querySelectorAll('.navbar__dropdown');
      dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.navbar__dropdown-toggle');
        const dropdownItems = dropdown.querySelectorAll('.navbar__dropdown-item');
        
        // Checke ob eines der Dropdown Items zur aktuellen URL passt
        dropdownItems.forEach(item => {
          if (item.href && item.href.includes(path)) {
            toggle?.classList.add('w--current');
          }
        });
      });
      
      // 2. Checke normale Nav-Links
      const navLinks = navbar.querySelectorAll('.navbar__link');
      navLinks.forEach(link => {
        // Wenn Link-URL ein Prefix der aktuellen URL ist
        if (link.href && path.includes(link.href.split('/').pop().replace('.html', ''))) {
          link.classList.add('w--current');
        }
      });
    });
  })();
    
    
  /* LOGIK: Höhe fixieren & Success anzeigen */
  
    document.addEventListener("DOMContentLoaded", function () {
      const wrapper = document.getElementById("newsletter-wrapper");
      const form = document.getElementById("cr-newsletter-form");
      const success = document.getElementById("newsletter-success");
  
      if (!wrapper || !form || !success) return;
  
      form.addEventListener("submit", function () {
        const height = form.offsetHeight;
        wrapper.style.height = height + "px";
  
        setTimeout(function () {
          form.style.display = "none";
          success.style.display = "flex";
        }, 100);
      });
    });