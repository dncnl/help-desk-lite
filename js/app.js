// App entry point: wires up page behavior (rendering and events).

import { getPriority } from './priority.js';
import { IMPACT_LEVELS, URGENCY_LEVELS } from './data.js';

const nav = document.querySelector('.site-nav');

// A small threshold so the shadow doesn't flicker on tiny trackpad nudges
function updateNavShadow() {
  if (window.scrollY > 8) {
    nav.classList.add('site-nav--scrolled');
  } else {
    nav.classList.remove('site-nav--scrolled');
  }
}

// Built from the same lookup the form uses, so the chart can never disagree with the app
function renderPriorityMatrix() {
  const headRow = document.querySelector('#matrix-head');
  const body = document.querySelector('#matrix-body');

  for (const urgency of URGENCY_LEVELS) {
    const header = document.createElement('th');
    header.scope = 'col';
    header.textContent = urgency.label;
    headRow.append(header);
  }

  for (const impact of IMPACT_LEVELS) {
    const row = document.createElement('tr');
    const rowHeader = document.createElement('th');
    rowHeader.scope = 'row';
    rowHeader.textContent = impact.label;
    row.append(rowHeader);

    for (const urgency of URGENCY_LEVELS) {
      const priority = getPriority(impact.value, urgency.value);
      const tile = document.createElement('td');
      tile.className = 'matrix__tile priority-fill priority-fill--' + priority.toLowerCase();
      tile.textContent = priority;
      row.append(tile);
    }

    body.append(row);
  }
}

window.addEventListener('scroll', updateNavShadow, { passive: true });
updateNavShadow();
renderPriorityMatrix();
