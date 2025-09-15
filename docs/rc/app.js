// Fixed-position parallax header
// Header is fixed at top; we shift it upward by a fraction of scroll so it exits view more slowly.
// data-parallax sets speed factor (0.0-1.0). Smaller = more lag.
(function () {
  const header = document.querySelector('.app-header');
  if (!header) return;

  // Ensure a CSS variable for layout spacing based on actual rendered height

  const footer = document.querySelector('.filter-bar');

  // Ensure CSS variables for layout spacing based on actual rendered height
  function setBarSpaces() {
    const h = header.offsetHeight;
    document.documentElement.style.setProperty('--space-header', h + 'px');
    if (footer) {
      const f = footer.offsetHeight;
      document.documentElement.style.setProperty('--space-footer', f + 'px');
    }
  }
  setBarSpaces();
  window.addEventListener('resize', setBarSpaces);

  const factorAttr = parseFloat(header.getAttribute('data-parallax-factor') || '0.5');
  const factor = isNaN(factorAttr) ? 0.5 : Math.min(Math.max(factorAttr, 0), 0.95);

  const scrollNonlinearityGammaAttr = parseFloat(header.getAttribute('data-parallax-gamma') || '2');
  const scrollNonlinearityGamma = isNaN(scrollNonlinearityGammaAttr) ? 2 : Math.max(scrollNonlinearityGammaAttr, 1);
  // Gamma > 1 means more non-linear, i.e. faster at first then slower later.
  // Gamma = 1 means linear.
  // Gamma < 1 means slower at first then faster later (not recommended, so clamp to 1).
  
  const scrollNonlinearityIdentityDistanceAttr = parseFloat(header.getAttribute('data-parallax-identity-distance') || '50');
  const scrollNonlinearityIdentityDistance = Math.max(scrollNonlinearityIdentityDistanceAttr, 5);
  // Distance in px over which the non-linearity is applied. Larger means more linear overall.
  
  let lastY = -1;
  let ticking = false;
  function onScroll() {
    const y = window.scrollY || window.pageYOffset || 0;
    if (y === lastY || ticking) return;
    lastY = y;
    ticking = true;
    requestAnimationFrame(() => {
      const headerHeight = header.offsetHeight || 0;
      // Translate upward; full hide when translate <= -headerHeight - small buffer
      const t = -Math.min(y * factor, headerHeight + 32);
      const nonlinearT = -Math.pow(-t / scrollNonlinearityIdentityDistance, scrollNonlinearityGamma) * scrollNonlinearityIdentityDistance;
      //header.style.transform = `translateY(${nonlinearT}px)`;
      header.style.top = `${nonlinearT}px`;
      ticking = false;
    });
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
