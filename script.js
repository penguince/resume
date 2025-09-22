'use strict'; // to prevent errors

// helper functions  qs = querySelector, qsa = querySelectorAll
function qs(selector, root) {
  if (!root) root = document;
  return root.querySelector(selector);
}
function qsa(selector, root) {
  if (!root) root = document;
  return Array.from(root.querySelectorAll(selector));
}

window.addEventListener('DOMContentLoaded', function () {
  initFormValidation();
  initScrollReveal();
  initFooterYear();
  initThemeToggle();
});

//  form validation: name (>=2), email (basic pattern), message (>=10) 
function initFormValidation() {
  const form = qs('#contact form');
  if (!form) return;

  const nameEl = qs('#name', form);
  const emailEl = qs('#email', form);
  const msgEl = qs('#message', form);

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  function validateName() {
    if (!nameEl) return;
    nameEl.setCustomValidity('');
    if (nameEl.value.trim().length < 2) {
      nameEl.setCustomValidity('Please enter at least 2 characters for your name.');
    }
  }

  function validateEmail() {
    if (!emailEl) return;
    emailEl.setCustomValidity('');
    if (!emailRe.test(emailEl.value.trim())) {
      emailEl.setCustomValidity('Please enter a valid email address (e.g., name@example.com).');
    }
  }

  function validateMessage() {
    if (!msgEl) return;
    msgEl.setCustomValidity('');
    if (msgEl.value.trim().length < 10) {
      msgEl.setCustomValidity('Please enter at least 10 characters so I have context.');
    }
  }

  if (nameEl) {
    nameEl.addEventListener('input', function () { validateName(); nameEl.reportValidity(); });
  }
  if (emailEl) {
    emailEl.addEventListener('input', function () { validateEmail(); emailEl.reportValidity(); });
  }
  if (msgEl) {
    msgEl.addEventListener('input', function () { validateMessage(); msgEl.reportValidity(); });
  }

  form.addEventListener('submit', function (e) {
    validateName();
    validateEmail();
    validateMessage();

    if (!form.checkValidity()) {
      e.preventDefault();
      form.reportValidity();
      return;
    }

    e.preventDefault();
    alert('Thanks! Your message has been captured locally (no backend).');
    form.reset();
  });
}

// scroll reveal for main > section
function initScrollReveal() {
  const sections = qsa('main section');
  if (!sections.length) return;

  // Initial hidden state
  sections.forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 600ms ease, transform 600ms ease';
    el.setAttribute('data-revealed', '0');
  });

  function revealVisible() {
    const vh = window.innerHeight || document.documentElement.clientHeight;

    sections.forEach((el) => {
      if (el.getAttribute('data-revealed') === '1') return;

      const rect = el.getBoundingClientRect();
      // reveal when the top is within 85% of the viewport height
      if (rect.top < vh * 0.85) {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.setAttribute('data-revealed', '1');
      }
    });
  }

  // run on load and on scroll
  window.addEventListener('load', revealVisible);
  window.addEventListener('scroll', revealVisible, { passive: true });
  revealVisible();
}

// footer year: replace any YYYY with the current year 
function initFooterYear() {
  const p = qs('footer .container p');
  if (!p) return;

  const year = String(new Date().getFullYear());
  p.textContent = p.textContent.replace(/\b(19|20)\d{2}\b/, year);
}

// theme toggle: respects system default until user picks, then persists choice
function initThemeToggle() {
  const btn = qs('#theme-toggle');
  if (!btn) return;

  const root = document.documentElement;
  const storageKey = 'theme'; // 'light' | 'dark'
  const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

  function getCurrentTheme() {
    let stored = null;
    try { stored = localStorage.getItem(storageKey); } catch (_) {}
    if (stored === 'light' || stored === 'dark') return stored;
    return mq && mq.matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    // set attribute so CSS vars update
    root.setAttribute('data-theme', theme);
    // update button state/icon
    const isDark = theme === 'dark';
    btn.setAttribute('aria-pressed', String(isDark));
    if (btn.firstChild) btn.firstChild.nodeValue = isDark ? '☀️ ' : '🌙 ';
  }

  // initial setup
  applyTheme(getCurrentTheme());

  // handle click
  btn.addEventListener('click', function () {
    const next = (getCurrentTheme() === 'dark') ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(storageKey, next); } catch (_) {}
  });

  // if system preference changes and user has not set a choice, reflect it
  if (mq && mq.addEventListener) {
    mq.addEventListener('change', function (e) {
      let stored = null;
      try { stored = localStorage.getItem(storageKey); } catch (_) {}
      if (stored !== 'light' && stored !== 'dark') {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}