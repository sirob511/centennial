export function initHotspots(explorer) {
  const popup = explorer.querySelector('#feature-panel');
  const buttons = [...explorer.querySelectorAll('[data-feature]')];
  const markers = [...explorer.querySelectorAll('.hotspot')];
  const panels = [...popup.querySelectorAll('[data-feature-panel]')];
  const nativePopover = typeof popup.showPopover === 'function';
  let trigger = null;
  let anchor = null;
  let positionFrame = 0;

  popup.classList.add('feature-popover');
  popup.setAttribute('role', 'dialog');
  popup.removeAttribute('aria-live');
  popup.removeAttribute('aria-atomic');
  if (nativePopover) popup.setAttribute('popover', 'auto');
  else popup.hidden = true;

  const header = document.createElement('div');
  header.className = 'feature-popover-header';
  header.innerHTML = '<span>EXPLORE THE FOUNTAIN</span><button type="button" class="feature-close" aria-label="Close fountain detail">×</button>';
  popup.prepend(header);
  const closeButton = header.querySelector('button');

  panels.forEach(panel => {
    panel.querySelector('h2').id = `feature-title-${panel.dataset.featurePanel}`;
  });
  buttons.forEach(button => {
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-pressed', 'false');
  });

  const isOpen = () => nativePopover ? popup.matches(':popover-open') : !popup.hidden;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const intersects = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

  function syncButtons() {
    buttons.forEach(button => {
      const selected = isOpen() && button.dataset.feature === anchor?.dataset.feature;
      button.setAttribute('aria-expanded', String(selected));
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function close(restoreFocus = false) {
    if (!isOpen()) return;
    if (nativePopover) popup.hidePopover();
    else popup.hidden = true;
    syncButtons();
    if (restoreFocus) trigger?.focus({ preventScroll: true });
  }

  function position() {
    if (!isOpen() || !anchor) return;
    const marker = anchor.getBoundingClientRect();
    const viewport = window.visualViewport;
    const leftEdge = (viewport?.offsetLeft ?? 0) + 12;
    const topEdge = (viewport?.offsetTop ?? 0) + 12;
    const rightEdge = leftEdge + (viewport?.width ?? innerWidth) - 24;
    const bottomEdge = topEdge + (viewport?.height ?? innerHeight) - 24;
    const gap = 14;

    // A card should never remain floating after its marker leaves the screen.
    if (marker.bottom < topEdge || marker.top > bottomEdge) {
      close();
      return;
    }

    popup.style.width = `${Math.min(360, rightEdge - leftEdge)}px`;
    popup.style.maxHeight = `${bottomEdge - topEdge}px`;
    const { width, height } = popup.getBoundingClientRect();
    const centerX = marker.left + marker.width / 2;
    const centerY = marker.top + marker.height / 2;
    const sideTop = clamp(marker.top - 16, topEdge, bottomEdge - height);
    const centeredLeft = clamp(centerX - width / 2, leftEdge, rightEdge - width);
    const candidates = [
      { left: marker.right + gap, top: sideTop, side: 'right' },
      { left: marker.left - gap - width, top: sideTop, side: 'left' },
      { left: centeredLeft, top: marker.bottom + gap, side: 'bottom' },
      { left: centeredLeft, top: marker.top - gap - height, side: 'top' },
    ].map(candidate => ({ ...candidate, right: candidate.left + width, bottom: candidate.top + height }));
    const otherMarkers = markers.filter(m => m !== anchor).map(m => m.getBoundingClientRect());
    const fitting = candidates.filter(c => c.left >= leftEdge && c.right <= rightEdge && c.top >= topEdge && c.bottom <= bottomEdge);
    // Prefer a placement that also leaves the other numbered controls exposed.
    fitting.sort((a, b) => otherMarkers.filter(m => intersects(a, m)).length - otherMarkers.filter(m => intersects(b, m)).length);
    let placement = fitting[0];

    if (!placement) {
      // Narrow screens: fit above or below without covering the selected marker.
      const below = bottomEdge - marker.bottom - gap;
      const above = marker.top - gap - topEdge;
      const useBelow = below >= above;
      popup.style.maxHeight = `${Math.max(80, useBelow ? below : above)}px`;
      const actualHeight = popup.getBoundingClientRect().height;
      placement = {
        left: centeredLeft,
        top: useBelow ? marker.bottom + gap : marker.top - gap - actualHeight,
        side: useBelow ? 'bottom' : 'top',
      };
    }

    popup.style.left = `${placement.left}px`;
    popup.style.top = `${placement.top}px`;
    popup.dataset.placement = placement.side;
    popup.style.transformOrigin = `${clamp(centerX - placement.left, 0, width)}px ${clamp(centerY - placement.top, 0, height)}px`;
  }

  function queuePosition(event) {
    // Scrolling within a compact card does not move its marker.
    if (event?.target instanceof Node && popup.contains(event.target)) return;
    if (!isOpen()) return;
    cancelAnimationFrame(positionFrame);
    positionFrame = requestAnimationFrame(position);
  }

  function open(button) {
    trigger = button;
    anchor = markers.find(marker => marker.dataset.feature === button.dataset.feature);
    const rect = anchor.getBoundingClientRect();
    if (rect.top < 32 || rect.bottom > innerHeight - 32) {
      anchor.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    panels.forEach(panel => { panel.hidden = panel.dataset.featurePanel !== button.dataset.feature; });
    popup.setAttribute('aria-labelledby', `feature-title-${button.dataset.feature}`);
    popup.scrollTop = 0;
    if (!isOpen()) {
      if (nativePopover) popup.showPopover();
      else popup.hidden = false;
    }
    position();
    syncButtons();
    closeButton.focus({ preventScroll: true });
  }

  buttons.forEach(button => button.addEventListener('click', () => open(button)));
  closeButton.addEventListener('click', () => close(true));
  popup.addEventListener('toggle', syncButtons);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isOpen()) {
      event.preventDefault();
      close(true);
    }
  });
  // Native popovers handle light dismissal. This also supports older browsers.
  if (!nativePopover) document.addEventListener('pointerdown', event => {
    if (!popup.contains(event.target) && !buttons.some(button => button.contains(event.target))) close();
  });
  window.addEventListener('scroll', queuePosition, { capture: true, passive: true });
  window.addEventListener('resize', queuePosition);
  window.visualViewport?.addEventListener('resize', queuePosition);
  window.visualViewport?.addEventListener('scroll', queuePosition);
  new ResizeObserver(() => queuePosition()).observe(explorer.querySelector('.hotspot-stage'));
}
