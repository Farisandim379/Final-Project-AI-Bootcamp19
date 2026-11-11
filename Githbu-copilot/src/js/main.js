/**
 * Berijalan — Bootcamp Batch 19 Orientation Slide
 * Progressive enhancement only: the page is fully usable without JavaScript.
 */
(function () {
  'use strict';

  /** Simulated deck position (single-slide deck). */
  const deck = { current: 1, total: 1 };

  const prevBtn = document.querySelector('[data-nav="prev"]');
  const nextBtn = document.querySelector('[data-nav="next"]');

  /** Keep navigation buttons in sync with the deck position. */
  function syncNav() {
    if (prevBtn) prevBtn.disabled = deck.current <= 1;
    if (nextBtn) nextBtn.disabled = deck.current >= deck.total;
  }

  /** Move through the deck. */
  function goTo(step) {
    const target = Math.min(deck.total, Math.max(1, deck.current + step));
    if (target === deck.current) return;

    deck.current = target;
    syncNav();

    // Placeholder hook: wire this to your presentation router.
    document.dispatchEvent(
      new CustomEvent('deck:navigate', { detail: { slide: deck.current } })
    );
  }

  prevBtn?.addEventListener('click', () => goTo(-1));
  nextBtn?.addEventListener('click', () => goTo(1));

  /** Actions for the CTA cluster. */
  document.querySelectorAll('[data-action]').forEach((el) => {
    el.addEventListener('click', (event) => {
      const action = el.getAttribute('data-action');

      if (action === 'start-orientation') {
        event.preventDefault();
        document.dispatchEvent(new CustomEvent('orientation:start'));
      }

      if (action === 'open-portal') {
        event.preventDefault();
        document.dispatchEvent(new CustomEvent('portal:open'));
      }
    });
  });

  /** Keyboard shortcuts: arrow keys / space navigate the deck. */
  document.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === 'ArrowRight' || event.key === 'PageDown') goTo(1);
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') goTo(-1);
  });

  syncNav();
})();