(() => {
  'use strict';

  const root = document.documentElement;
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const navigation = document.querySelector('[data-navigation]');
  const header = document.querySelector('[data-header]');

  root.classList.add('js');

  const getTheme = () => root.dataset.theme || 'light';

  const updateThemeControl = () => {
    if (!themeToggle) return;
    const nextTheme = getTheme() === 'dark' ? 'light' : 'dark';
    themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
    themeToggle.setAttribute('title', `Switch to ${nextTheme} theme`);
  };

  updateThemeControl();

  themeToggle?.addEventListener('click', () => {
    const nextTheme = getTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = nextTheme;
    try {
      localStorage.setItem('portfolio-theme', nextTheme);
    } catch (_) {
      // The selected theme still applies for this page view.
    }
    updateThemeControl();
  });

  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  systemTheme.addEventListener?.('change', (event) => {
    try {
      if (localStorage.getItem('portfolio-theme')) return;
    } catch (_) {
      return;
    }
    root.dataset.theme = event.matches ? 'dark' : 'light';
    updateThemeControl();
  });

  const menuLinks = Array.from(navigation?.querySelectorAll('a') || []);
  const isMenuOpen = () => menuToggle?.getAttribute('aria-expanded') === 'true';

  const closeMenu = (restoreFocus = false) => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    if (restoreFocus) menuToggle.focus();
  };

  menuToggle?.addEventListener('click', () => {
    if (!navigation) return;
    if (isMenuOpen()) {
      closeMenu();
      return;
    }

    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close navigation');
    navigation.classList.add('is-open');
    document.body.classList.add('menu-open');
    window.requestAnimationFrame(() => menuLinks[0]?.focus());
  });

  menuLinks.forEach((link) => {
    link.addEventListener('click', () => closeMenu());
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isMenuOpen()) {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key === 'Tab' && isMenuOpen() && menuToggle) {
      const focusableMenuItems = [...menuLinks, menuToggle].filter((element) => element.getClientRects().length > 0);
      const currentIndex = focusableMenuItems.indexOf(document.activeElement);
      const lastIndex = focusableMenuItems.length - 1;

      if (currentIndex === -1 || (event.shiftKey && currentIndex === 0)) {
        event.preventDefault();
        focusableMenuItems[lastIndex]?.focus();
      } else if (!event.shiftKey && currentIndex === lastIndex) {
        event.preventDefault();
        focusableMenuItems[0]?.focus();
      }
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (isMenuOpen() && header && !header.contains(event.target)) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll('[data-pipeline]').forEach((pipeline) => {
    const buttons = Array.from(pipeline.querySelectorAll('[data-stage]'));
    const panel = pipeline.querySelector('[role="tabpanel"]');
    const title = pipeline.querySelector('[data-pipeline-title]');
    const copy = pipeline.querySelector('[data-pipeline-copy]');
    const index = pipeline.querySelector('.panel-index');

    if (!panel || !title || !copy || !buttons.length) return;

    const selectStage = (button, moveFocus = false) => {
      buttons.forEach((item) => {
        const isSelected = item === button;
        item.setAttribute('aria-selected', String(isSelected));
        item.tabIndex = isSelected ? 0 : -1;
      });

      title.textContent = button.dataset.title || button.textContent.trim();
      copy.textContent = button.dataset.copy || '';
      panel.setAttribute('aria-labelledby', button.id);
      if (index) {
        const position = buttons.indexOf(button) + 1;
        index.textContent = String(position).padStart(2, '0');
      }
      if (moveFocus) button.focus();
    };

    buttons.forEach((button, buttonIndex) => {
      button.tabIndex = button.getAttribute('aria-selected') === 'true' ? 0 : -1;
      button.addEventListener('click', () => selectStage(button));
      button.addEventListener('keydown', (event) => {
        let nextIndex = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (buttonIndex + 1) % buttons.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (buttonIndex - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = buttons.length - 1;
        if (nextIndex === null) return;
        event.preventDefault();
        selectStage(buttons[nextIndex], true);
      });
    });
  });

  const copyButton = document.querySelector('[data-copy-email]');
  const copyStatus = document.querySelector('[data-copy-status]');

  const fallbackCopy = (value) => {
    const input = document.createElement('textarea');
    input.value = value;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    const successful = document.execCommand('copy');
    input.remove();
    return successful;
  };

  copyButton?.addEventListener('click', async () => {
    const email = copyButton.dataset.email;
    if (!email) return;

    let copied = false;
    try {
      await navigator.clipboard.writeText(email);
      copied = true;
    } catch (_) {
      copied = fallbackCopy(email);
    }

    if (copyStatus) copyStatus.textContent = copied ? 'Email copied to clipboard.' : `Email: ${email}`;
    copyButton.textContent = copied ? 'Copied' : 'Copy email';
    window.setTimeout(() => {
      copyButton.textContent = 'Copy email';
      if (copyStatus) copyStatus.textContent = '';
    }, 3000);
  });

  const demoButton = document.querySelector('[data-load-demo]');
  const demoContainer = document.querySelector('[data-demo-container]');
  const demoPlaceholder = document.querySelector('[data-demo-placeholder]');
  const demoStatus = document.querySelector('[data-demo-status]');
  const demoControls = demoContainer?.querySelector('.demo-controls');
  let activeDemoImage = null;

  demoButton?.addEventListener('click', () => {
    const demoUrl = demoButton.dataset.demoUrl;
    if (!demoUrl || !demoContainer || !demoPlaceholder || !demoControls) return;

    if (demoContainer.dataset.demoLoaded === 'true') {
      demoContainer.dataset.demoLoaded = 'false';
      if (activeDemoImage) activeDemoImage.src = '';
      demoContainer.querySelector('.demo-media')?.remove();
      demoPlaceholder.hidden = false;
      demoButton.textContent = 'Load animated demo';
      if (demoStatus) demoStatus.textContent = 'Animation stopped.';
      activeDemoImage = null;
      return;
    }

    const shouldRestoreFocus = document.activeElement === demoButton;
    demoButton.disabled = true;
    demoButton.textContent = 'Loading…';
    demoContainer.setAttribute('aria-busy', 'true');
    if (demoStatus) demoStatus.textContent = 'Loading animated demo…';

    const image = new Image();
    image.alt = 'Animated multi-camera tracking demonstrator with synchronized camera and Bird’s-Eye View panels';
    image.decoding = 'async';

    image.addEventListener('load', () => {
      const figure = document.createElement('figure');
      figure.className = 'demo-media';
      const caption = document.createElement('figcaption');
      caption.textContent = 'Official project demonstrator. Use “Stop animation” below whenever you want to pause the motion.';
      figure.append(image, caption);
      demoPlaceholder.hidden = true;
      demoContainer.insertBefore(figure, demoControls);
      demoContainer.removeAttribute('aria-busy');
      demoContainer.dataset.demoLoaded = 'true';
      demoButton.disabled = false;
      demoButton.textContent = 'Stop animation';
      activeDemoImage = image;
      if (demoStatus) demoStatus.textContent = 'Animated demo loaded. Use Stop animation to end the motion.';
      if (shouldRestoreFocus) demoButton.focus();
    });

    image.addEventListener('error', () => {
      if (demoContainer.dataset.demoLoaded === 'false') return;
      demoButton.disabled = false;
      demoButton.textContent = 'Try loading demo again';
      demoContainer.removeAttribute('aria-busy');
      if (demoStatus) demoStatus.textContent = 'The preview could not be loaded. You can still open it from the GitHub repository.';
      if (shouldRestoreFocus) demoButton.focus();
    });

    image.src = demoUrl;
  });

  const internalNavLinks = Array.from(document.querySelectorAll('[data-nav-link][href^="#"]'));
  const observedSections = internalNavLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && observedSections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        internalNavLinks.forEach((link) => {
          const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('is-active', isCurrent);
          if (isCurrent) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-36% 0px -54% 0px', threshold: 0 });

    observedSections.forEach((section) => sectionObserver.observe(section));
  }
})();
