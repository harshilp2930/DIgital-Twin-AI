/**
 * Digital Twin AI — theme.js
 * Handles: dark/light mode toggle, countUp animations,
 *          progress bar fills, Chart.js gradient defaults,
 *          sidebar toggle, score ring animation
 */

/* ============================================================
   1. THEME TOGGLE (runs immediately, before DOM ready)
   ============================================================ */
(function () {
  const html = document.documentElement;
  const KEY = 'dt-ai-theme';
  const saved = localStorage.getItem(KEY);
  // Default to dark mode on first visit
  const initial = saved || 'dark';
  html.setAttribute('data-theme', initial);
})();

/* ============================================================
   EVERYTHING ELSE: waits for DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  /* ----------------------------------------------------------
     2. THEME TOGGLE BUTTON
        Works on #themeToggleBtn and any .dt-theme-btn
     ---------------------------------------------------------- */
  const html = document.documentElement;
  const KEY = 'dt-ai-theme';

  document.querySelectorAll('#themeToggleBtn, .dt-theme-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem(KEY, next);
      updateChartTheme(next);
    });
  });

  /* ----------------------------------------------------------
     3. NAVBAR SCROLL — add .scrolled class on scroll
     ---------------------------------------------------------- */
  var navbar = document.getElementById('dtNavbar');
  if (navbar) {
    function handleNavbarScroll() {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll(); // run on load
  }

  /* ----------------------------------------------------------
     4. COUNT-UP ANIMATION
        Elements need data-count-up="<target>" data-count-prefix="₹" etc.
        OR class="count-up" with data-target="<number>"
     ---------------------------------------------------------- */
  function animateCountUp(el, from, to, duration, prefix, suffix, decimals) {
    from = parseFloat(from) || 0;
    to = parseFloat(to) || 0;
    duration = parseInt(duration) || 1200;
    prefix = prefix || '';
    suffix = suffix || '';
    decimals = parseInt(decimals) || 0;

    const start = performance.now();
    const range = to - from;

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + range * eased;
      const fmt = current.toFixed(decimals);
      el.textContent = prefix + fmt + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Method 1: data-count-up attribute
  document.querySelectorAll('[data-count-up]').forEach(function (el) {
    const target = el.getAttribute('data-count-up');
    const prefix = el.getAttribute('data-count-prefix') || '';
    const suffix = el.getAttribute('data-count-suffix') || '';
    const decimals = el.getAttribute('data-count-decimals') || '0';
    const duration = el.getAttribute('data-count-duration') || '1200';
    animateCountUp(el, 0, target, duration, prefix, suffix, decimals);
  });

  // Method 2: class="count-up" with data-target (fallback)
  document.querySelectorAll('.count-up').forEach(function (el) {
    const target = el.getAttribute('data-target') || el.textContent;
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const decimals = el.getAttribute('data-decimals') || '0';
    animateCountUp(el, 0, target, 1200, prefix, suffix, decimals);
  });

  /* ----------------------------------------------------------
     5. PROGRESS BAR FILL ANIMATION
        Mark progress bars with class "dt-anim-bar" and
        set data-width="<percentage>" on the fill element.
     ---------------------------------------------------------- */
  setTimeout(function () {
    document.querySelectorAll('.dt-progress-fill[data-width]').forEach(function (fill) {
      fill.style.width = fill.getAttribute('data-width') + '%';
    });
    // Also handle existing progress-fill / gpa-fill elements that have inline width set
    document.querySelectorAll('.progress-fill, .gpa-fill').forEach(function (fill) {
      const inlineWidth = fill.style.width;
      if (inlineWidth) {
        fill.style.setProperty('width', '0', 'important');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            fill.style.setProperty('width', inlineWidth, '');
          });
        });
      }
    });
  }, 200);

  /* ----------------------------------------------------------
     6. SVG SCORE RING ANIMATION
     ---------------------------------------------------------- */
  const scoreRings = document.querySelectorAll('.dt-score-ring[data-score]');
  scoreRings.forEach(function (ring) {
    const score = parseFloat(ring.getAttribute('data-score')) || 0;
    const fillEl = ring.querySelector('.ring-fill');
    const numEl = ring.querySelector('.ring-num');

    if (!fillEl) return;

    // Circumference of circle r=50 => 2*PI*50 ≈ 314.16
    const r = 50;
    const c = 2 * Math.PI * r;
    fillEl.setAttribute('stroke-dasharray', c);
    fillEl.setAttribute('stroke-dashoffset', c); // start at 0%

    // Determine color by score
    var color;
    if (score >= 70) color = '#22C55E'; // green
    else if (score >= 40) color = '#F59E0B'; // amber
    else color = '#EF4444'; // red

    fillEl.style.stroke = color;

    // Animate to target after a short delay
    setTimeout(function () {
      const offset = c - (score / 100) * c;
      fillEl.style.strokeDashoffset = offset;
    }, 300);

    // CountUp the number
    if (numEl) {
      animateCountUp(numEl, 0, score, 1400, '', '', 0);
    }
  });

  /* ----------------------------------------------------------
     7. INTERSECTION OBSERVER — fade-in-up on scroll
     ---------------------------------------------------------- */
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.observe-me').forEach(function (el) {
    observer.observe(el);
  });

  /* ----------------------------------------------------------
     8. CHART.JS GLOBAL DEFAULTS + GRADIENT HELPER
     ---------------------------------------------------------- */
  if (typeof Chart !== 'undefined') {
    applyChartDefaults();
  }

  function applyChartDefaults() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const tickColor = isDark ? '#6B7280' : '#9CA3AF';
    const legendColor = isDark ? '#D1D5DB' : '#374151';

    Chart.defaults.font.family = "'Inter', 'Segoe UI', system-ui, sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.color = tickColor;

    Chart.defaults.plugins.legend.labels.color = legendColor;
    Chart.defaults.plugins.tooltip.backgroundColor = isDark ? '#20242F' : 'rgba(255,255,255,0.97)';
    Chart.defaults.plugins.tooltip.titleColor = isDark ? '#F0F2F5' : '#111827';
    Chart.defaults.plugins.tooltip.bodyColor = isDark ? '#9CA3AF' : '#6B7280';
    Chart.defaults.plugins.tooltip.borderColor = isDark ? '#2D3139' : '#E5E7EB';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.cornerRadius = 10;
    Chart.defaults.plugins.tooltip.padding = 10;

    Chart.defaults.scale.grid.color = gridColor;
    Chart.defaults.scale.ticks.color = tickColor;

    // Rounded bar corners
    if (Chart.overrides && Chart.overrides.bar) {
      Chart.overrides.bar.borderRadius = 6;
      Chart.overrides.bar.borderSkipped = 'bottom';
    }
  }

  function updateChartTheme(theme) {
    if (typeof Chart === 'undefined') return;
    applyChartDefaults();
    // Re-render all registered charts
    Object.values(Chart.instances || {}).forEach(function (chart) {
      chart.update('none');
    });
  }

  /* ----------------------------------------------------------
     9. GRADIENT FILL HELPER for Chart.js line charts
        Call: applyLineGradient(ctx, chart, datasetIndex, hexColor)
        Returns a CanvasGradient for backgroundColor.
     ---------------------------------------------------------- */
  window.dtMakeGradient = function (ctx, chartArea, hexColor, alpha1, alpha2) {
    if (!chartArea) return hexColor;
    alpha1 = alpha1 !== undefined ? alpha1 : 0.35;
    alpha2 = alpha2 !== undefined ? alpha2 : 0.0;
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, hexToRgba(hexColor, alpha1));
    gradient.addColorStop(1, hexToRgba(hexColor, alpha2));
    return gradient;
  };

  function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (h) { return h + h; }).join('');
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  /* ----------------------------------------------------------
     10. AUTO-DISMISS FLASH ALERTS after 5 seconds
     ---------------------------------------------------------- */
  setTimeout(function () {
    document.querySelectorAll('.alert.alert-dismissible').forEach(function (alert) {
      var bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      if (bsAlert) bsAlert.close();
    });
  }, 5000);

});
