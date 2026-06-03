/**
 * Main Application Script
 * Karla Colin Maya | v1.0
 *
 * Modules:
 * - Navigation (sticky, hamburger, active link)
 * - Scroll-to-top button
 * - Intersection Observer (reveal animations)
 * - Gallery lightbox
 * - Social feed tabs
 * - Smooth scroll for anchor links
 * - Accessible skip link
 */

(function App() {
  'use strict';

  /* ══════════════════════════════════════
     1. NAVIGATION
     ══════════════════════════════════════ */
  (function Nav() {
    var nav         = document.querySelector('.nav_wrapper');
    var hamburger   = document.querySelector('.nav_hamburger');
    var menu        = document.querySelector('.nav_menu');
    var navLinks    = document.querySelectorAll('.nav_link');
    var SCROLLED_CLASS = 'is-scrolled';
    var OPEN_CLASS     = 'is-open';

    if (!nav) return;

    // Sticky class on scroll
    function handleScroll() {
      if (window.scrollY > 20) {
        nav.classList.add(SCROLLED_CLASS);
      } else {
        nav.classList.remove(SCROLLED_CLASS);
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Hamburger toggle
    if (hamburger && menu) {
      hamburger.addEventListener('click', function () {
        var isOpen = menu.classList.toggle(OPEN_CLASS);
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.style.overflow = isOpen ? 'hidden' : '';
        if (isOpen) {
          // Focus first link
          var firstLink = menu.querySelector('.nav_link');
          if (firstLink) firstLink.focus();
        }
      });

      // Close on nav link click
      navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          menu.classList.remove(OPEN_CLASS);
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });

      // Close on Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains(OPEN_CLASS)) {
          menu.classList.remove(OPEN_CLASS);
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
          hamburger.focus();
        }
      });

      // Close on overlay click (outside menu)
      document.addEventListener('click', function (e) {
        if (
          menu.classList.contains(OPEN_CLASS) &&
          !menu.contains(e.target) &&
          !hamburger.contains(e.target)
        ) {
          menu.classList.remove(OPEN_CLASS);
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    }

    // Active link via IntersectionObserver on sections
    var sections = document.querySelectorAll('section[id]');

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.remove('is-active');
            if (link.getAttribute('href') === '#' + entry.target.id) {
              link.classList.add('is-active');
            }
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }());

  /* ══════════════════════════════════════
     2. SCROLL TO TOP
     ══════════════════════════════════════ */
  (function ScrollTop() {
    var btn = document.querySelector('.scroll-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 600) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }());

  /* ══════════════════════════════════════
     3. REVEAL ANIMATIONS (IntersectionObserver)
     ══════════════════════════════════════ */
  (function Reveal() {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('[data-animate]').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('[data-animate]').forEach(function (el) {
      observer.observe(el);
    });
  }());

  /* ══════════════════════════════════════
     4. GALLERY LIGHTBOX
     ══════════════════════════════════════ */
  (function Lightbox() {
    var lightbox  = document.querySelector('.lightbox');
    if (!lightbox) return;

    var lightImg  = lightbox.querySelector('.lightbox_image');
    var closeBtn  = lightbox.querySelector('.lightbox_close');
    var prevBtn   = lightbox.querySelector('.lightbox_nav--prev');
    var nextBtn   = lightbox.querySelector('.lightbox_nav--next');
    var counter   = lightbox.querySelector('.lightbox_counter');

    var items     = [];   // array of { src, alt, trigger }
    var current   = 0;

    /* ── Build items list from gallery ── */
    document.querySelectorAll('.gallery_item').forEach(function (item) {
      var img = item.querySelector('img');
      if (!img) return;

      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', 'Ver imagen: ' + (img.alt || 'Galería'));

      var index = items.length;
      items.push({ src: img.src, alt: img.alt, trigger: item });

      function handleOpen(e) {
        e.preventDefault();
        openAt(index);
      }
      item.addEventListener('click', handleOpen);
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') handleOpen(e);
      });
    });

    /* ── Show image at index with optional transition ── */
    function showImage(index, animate) {
      var item = items[index];
      if (!item) return;

      if (animate) {
        lightImg.classList.add('is-transitioning');
        setTimeout(function () {
          lightImg.src = item.src;
          lightImg.alt = item.alt || '';
          lightImg.classList.remove('is-transitioning');
        }, 200);
      } else {
        lightImg.src = item.src;
        lightImg.alt = item.alt || '';
      }

      // Update counter
      if (counter) {
        counter.textContent = (index + 1) + ' / ' + items.length;
      }

      // Update nav button states
      if (prevBtn) prevBtn.disabled = (index === 0);
      if (nextBtn) nextBtn.disabled = (index === items.length - 1);

      // Update aria-label on lightbox
      lightbox.setAttribute('aria-label', 'Imagen ' + (index + 1) + ' de ' + items.length + ': ' + (item.alt || 'Galería'));
    }

    /* ── Open at a specific index ── */
    function openAt(index) {
      current = index;
      showImage(current, false);
      lightbox.classList.add('is-open');
      lightbox.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      lightbox.setAttribute('aria-hidden', 'false');
      closeBtn.focus();
    }

    /* ── Navigate ── */
    function goTo(index) {
      if (index < 0 || index >= items.length) return;
      current = index;
      showImage(current, true);
    }

    function goPrev() { goTo(current - 1); }
    function goNext() { goTo(current + 1); }

    /* ── Close ── */
    function close() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('hidden', '');
      document.body.style.overflow = '';
      lightbox.setAttribute('aria-hidden', 'true');
      var trigger = items[current] && items[current].trigger;
      if (trigger) trigger.focus();
    }

    /* ── Bind controls ── */
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (prevBtn)  prevBtn.addEventListener('click', goPrev);
    if (nextBtn)  nextBtn.addEventListener('click', goNext);

    // Click outside image → close
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target === lightImg) {
        if (e.target === lightbox) close();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      switch (e.key) {
        case 'Escape':     close();   break;
        case 'ArrowLeft':  goPrev();  break;
        case 'ArrowRight': goNext();  break;
      }
    });

    // Touch / swipe support
    var touchStartX = null;
    lightbox.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 50) {
        delta < 0 ? goNext() : goPrev();
      }
      touchStartX = null;
    }, { passive: true });
  }());


  /* ══════════════════════════════════════
     6. SMOOTH SCROLL (anchor links)
     ══════════════════════════════════════ */
  (function SmoothScroll() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href   = link.getAttribute('href');
        var target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        var offset  = 80; // nav height
        var top     = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });

        // Update URL without triggering scroll
        history.pushState(null, '', href);

        // Move focus to section (accessibility)
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }());

  /* ══════════════════════════════════════
     7. COUNTER ANIMATION
     ══════════════════════════════════════ */
  (function Counters() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el     = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-count-suffix') || '';
        var start  = 0;
        var duration = 1800;
        var startTime = null;

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
          var value    = Math.floor(eased * target);
          el.textContent = value + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }

        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) { observer.observe(counter); });
  }());


  /* ══════════════════════════════════════
     9. LAZY LOAD IFRAMES (performance)
     ══════════════════════════════════════ */
  (function LazyIframes() {
    var iframes = document.querySelectorAll('iframe[data-src]');
    if (!iframes.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var iframe = entry.target;
        iframe.src = iframe.getAttribute('data-src');
        iframe.removeAttribute('data-src');
        observer.unobserve(iframe);
      });
    }, { rootMargin: '200px' });

    iframes.forEach(function (iframe) { observer.observe(iframe); });
  }());

}());
