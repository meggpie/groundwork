// Component-local state; no preview controls, remote assets or dependencies.
document.querySelectorAll('[data-flashcards]').forEach(root => {
  const cards = [...root.querySelectorAll('[data-card]')];
  const seen = new Set();
  const tracking = root.dataset.tracking === 'true';
  cards.forEach((button, index) => {
    button.addEventListener('click', () => {
      const back = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(back));
      button.querySelector('.front').hidden = back;
      button.querySelector('.back').hidden = !back;
      button.querySelector('.practice-action').textContent = back ? root.dataset.return : root.dataset.reveal;
      const face = button.querySelector(back ? '.back' : '.front');
      button.setAttribute('aria-label', face.textContent.trim().replace(/\s+/g, ' ') + '. ' + (back ? root.dataset.return : root.dataset.reveal));
      if (back && tracking) seen.add(index);
      if (tracking) {
        button.querySelector('.practice-visited').textContent = seen.has(index) ? '✓ Viewed' : '';
        root.querySelector('[data-progress]').textContent = `${seen.size} of ${cards.length} viewed`;
      }
    });
  });
});
