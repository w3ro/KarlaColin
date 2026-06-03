/**
 * Theme Manager — Dark / Light Mode
 * Karla Colin Maya | v1.0
 *
 * - Persists preference in localStorage
 * - Respects prefers-color-scheme
 * - Syncs toggle button ARIA state
 */

(function ThemeManager() {
  'use strict';

  const STORAGE_KEY = 'kcm-theme';
  const DARK        = 'dark';
  const LIGHT       = 'light';

  /** Determine initial theme */
  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === DARK || stored === LIGHT) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
  }

  /** Apply theme to <html> element */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateToggleButtons(theme);
    updateMetaThemeColor(theme);
  }

  /** Update all toggle button states */
  function updateToggleButtons(theme) {
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-label', theme === DARK ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
      btn.setAttribute('aria-pressed', theme === DARK ? 'true' : 'false');
    });
  }

  /** Update <meta name="theme-color"> for mobile browser chrome */
  function updateMetaThemeColor(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === DARK ? '#0D0A1E' : '#FFFFFF');
    }
  }

  /** Toggle between dark and light */
  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || LIGHT;
    applyTheme(current === DARK ? LIGHT : DARK);
  }

  /** Bind toggle buttons (runs after DOM ready) */
  function bindButtons() {
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
      // Keyboard: Space / Enter already handled by button
    });
  }

  /** Watch OS preference change */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? DARK : LIGHT);
    }
  });

  /* ── Init ── */
  // Apply theme immediately (before paint) to avoid flash
  applyTheme(getPreferredTheme());

  // Bind buttons when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindButtons);
  } else {
    bindButtons();
  }

  // Expose for external use
  window.ThemeManager = { toggle: toggleTheme, apply: applyTheme, get: getPreferredTheme };
}());
