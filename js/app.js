// App entry point: renders the matrix, form and board, and handles every user event.

import { getPriority } from './priority.js';
import { IMPACT_LEVELS, URGENCY_LEVELS, CATEGORIES, STATUSES, SAMPLE_TICKETS } from './data.js';
import { loadTickets, saveTickets } from './storage.js';

const nav = document.querySelector('.site-nav');
const form = document.querySelector('#ticket-form');
const stepsPanel = document.querySelector('#steps-panel');
const stepsTitle = document.querySelector('#steps-title');
const stepsList = document.querySelector('#steps-list');
const priorityPreview = document.querySelector('#priority-preview');
const formStatus = document.querySelector('#form-status');
const board = document.querySelector('.board');
const priorityFilter = document.querySelector('#priority-filter');
const resetDemoButton = document.querySelector('#reset-demo');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Fields in the order they appear, so the first error we focus is the one highest on the page
const FORM_FIELDS = ['name', 'category', 'description', 'impact', 'urgency'];
const MIN_DESCRIPTION_LENGTH = 10;
// Keep these in step with --duration-slow and --duration-base in tokens.css
const COUNT_UP_DURATION = 450;
const CARD_LEAVE_DURATION = 250;

const PRIORITY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'P1', label: 'P1' },
  { value: 'P2', label: 'P2' },
  { value: 'P3', label: 'P3' },
  { value: 'P4', label: 'P4' },
];

let previewedPriority = null;
let activeFilter = 'all';
let tickets = [];

// textContent instead of innerHTML, so text typed into the form can never run as HTML
function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text) {
    element.textContent = text;
  }
  return element;
}

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
    const header = createElement('th', '', urgency.label);
    header.scope = 'col';
    headRow.append(header);
  }

  for (const impact of IMPACT_LEVELS) {
    const row = createElement('tr');
    const rowHeader = createElement('th', '', impact.label);
    rowHeader.scope = 'row';
    row.append(rowHeader);

    for (const urgency of URGENCY_LEVELS) {
      const priority = getPriority(impact.value, urgency.value);
      const className = 'matrix__tile priority-fill priority-fill--' + priority.toLowerCase();
      row.append(createElement('td', className, priority));
    }

    body.append(row);
  }
}

function createRadio(name, value) {
  const input = createElement('input', 'visually-hidden');
  input.type = 'radio';
  input.name = name;
  input.value = value;
  return input;
}

function renderCategoryTiles() {
  const grid = document.querySelector('#category-grid');

  for (const category of CATEGORIES) {
    const tile = createElement('label', 'category-tile');
    const block = createElement('span', 'category-tile__block category-tile__block--' + category.color);
    const check = createElement('span', 'category-tile__check');
    check.setAttribute('aria-hidden', 'true');
    block.append(check);

    tile.append(createRadio('category', category.value), block);
    tile.append(createElement('span', 'category-tile__label', category.label));
    grid.append(tile);
  }
}

function renderChoices(container, name, options) {
  for (const option of options) {
    const choice = createElement('label', 'choice');
    choice.append(createRadio(name, option.value));
    choice.append(createElement('span', 'choice__pill', option.label));
    container.append(choice);
  }
}

function findCategory(value) {
  return CATEGORIES.find((category) => category.value === value);
}

function showFirstSteps(categoryValue) {
  const category = findCategory(categoryValue);

  stepsTitle.textContent = 'Try this first: ' + category.label;
  stepsList.replaceChildren();
  for (const step of category.steps) {
    stepsList.append(createElement('li', '', step));
  }

  stepsPanel.classList.add('steps-panel--open');
}

function hideFirstSteps() {
  stepsPanel.classList.remove('steps-panel--open');
}

function updatePriorityPreview() {
  const formData = new FormData(form);
  const priority = getPriority(formData.get('impact'), formData.get('urgency'));

  // Only pop when the value really changes, not on every click
  if (priority === previewedPriority) {
    return;
  }
  previewedPriority = priority;

  if (priority === null) {
    priorityPreview.className = 'priority-badge priority-badge--empty';
    priorityPreview.textContent = 'Not set';
    return;
  }

  priorityPreview.className = 'priority-badge priority-fill priority-fill--' + priority.toLowerCase();
  priorityPreview.textContent = priority;

  // Reading offsetWidth forces a layout, which lets the pop animation restart on every change
  void priorityPreview.offsetWidth;
  priorityPreview.classList.add('priority-badge--pop');
}

function validateForm(formData) {
  const errors = {};
  const name = formData.get('name').trim();
  const description = formData.get('description').trim();

  if (name === '') {
    errors.name = 'Tell us who needs help.';
  }
  if (!formData.get('category')) {
    errors.category = "Pick the closest category. It doesn't have to be perfect.";
  }
  if (description === '') {
    errors.description = "Add a few words about what's wrong.";
  } else if (description.length < MIN_DESCRIPTION_LENGTH) {
    errors.description = 'A little more detail helps. Aim for at least ' + MIN_DESCRIPTION_LENGTH + ' characters.';
  }
  if (!formData.get('impact')) {
    errors.impact = 'Who is affected? Pick one.';
  }
  if (!formData.get('urgency')) {
    errors.urgency = 'How soon does it need fixing? Pick one.';
  }

  return errors;
}

// Radio groups have several inputs with the same name, so this always returns a list
function getFieldInputs(field) {
  return form.querySelectorAll('[name="' + field + '"]');
}

function showFieldError(field, message) {
  document.querySelector('#' + field + '-error').textContent = message;
  for (const input of getFieldInputs(field)) {
    input.setAttribute('aria-invalid', 'true');
  }
}

function clearFieldError(field) {
  document.querySelector('#' + field + '-error').textContent = '';
  for (const input of getFieldInputs(field)) {
    input.removeAttribute('aria-invalid');
  }
}

function resetForm() {
  form.reset();
  hideFirstSteps();
  updatePriorityPreview();
}

// Tickets

// Priority is saved on the ticket, so changing the matrix later won't quietly reorder old tickets
function createTicket(details, createdAt) {
  return {
    id: crypto.randomUUID(),
    name: details.name,
    category: details.category,
    description: details.description,
    impact: details.impact,
    urgency: details.urgency,
    priority: getPriority(details.impact, details.urgency),
    status: details.status,
    createdAt: createdAt,
  };
}

function createSampleTickets() {
  const now = Date.now();
  const samples = [];
  for (const sample of SAMPLE_TICKETS) {
    samples.push(createTicket(sample, now - sample.minutesAgo * 60 * 1000));
  }
  return samples;
}

function findTicket(id) {
  return tickets.find((ticket) => ticket.id === id);
}

function findStatusIndex(value) {
  return STATUSES.findIndex((status) => status.value === value);
}

function updateTickets(newTickets) {
  tickets = newTickets;
  saveTickets(tickets);
}

function formatTimeAgo(timestamp) {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return minutes + ' min ago';
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? '1 hr ago' : hours + ' hrs ago';
  }
  const days = Math.floor(hours / 24);
  return days === 1 ? '1 day ago' : days + ' days ago';
}

// Board

// Highest priority first, then oldest first, so the top card is always the one to work on next
function compareTickets(a, b) {
  if (a.priority !== b.priority) {
    return a.priority < b.priority ? -1 : 1;
  }
  return a.createdAt - b.createdAt;
}

function getColumnTickets(status) {
  const columnTickets = tickets.filter((ticket) => {
    const matchesFilter = activeFilter === 'all' || ticket.priority === activeFilter;
    return ticket.status === status && matchesFilter;
  });
  columnTickets.sort(compareTickets);
  return columnTickets;
}

function createTicketButton(ticket) {
  const status = STATUSES[findStatusIndex(ticket.status)];
  let button;

  if (status.action) {
    button = createElement('button', 'button button--secondary button--small', status.action);
    button.dataset.action = 'move';
  } else {
    button = createElement('button', 'button button--ghost button--small', 'Delete');
    button.dataset.action = 'delete';
  }

  button.type = 'button';
  button.dataset.id = ticket.id;
  // Every card has the same button text, so screen readers also hear which ticket it belongs to
  button.append(createElement('span', 'visually-hidden', ': ' + ticket.description));
  return button;
}

function createTicketCard(ticket) {
  const priorityClass = 'priority-fill--' + ticket.priority.toLowerCase();
  const card = createElement('li', 'card ticket-card');
  const body = createElement('div', 'ticket-card__body');
  const header = createElement('div', 'ticket-card__header');
  const meta = createElement('p', 'ticket-card__meta', ticket.name + ' · ');
  const time = createElement('time', 'ticket-card__time', formatTimeAgo(ticket.createdAt));
  const actions = createElement('div', 'ticket-card__actions');

  time.dateTime = new Date(ticket.createdAt).toISOString();
  time.dataset.timestamp = ticket.createdAt;

  header.append(createElement('span', 'priority-badge priority-fill ' + priorityClass, ticket.priority));
  header.append(createElement('span', 'ticket-card__category', findCategory(ticket.category).label));
  meta.append(time);
  actions.append(createTicketButton(ticket));
  body.append(header, createElement('p', 'ticket-card__title', ticket.description), meta, actions);
  card.append(createElement('div', 'ticket-card__stripe ' + priorityClass), body);
  return card;
}

// Redraws every column. enteringId marks the one card that should animate in.
function renderBoard(enteringId) {
  for (const status of STATUSES) {
    const list = document.querySelector('#list-' + status.value);
    const columnTickets = getColumnTickets(status.value);

    list.replaceChildren();
    for (const ticket of columnTickets) {
      const card = createTicketCard(ticket);
      if (ticket.id === enteringId) {
        card.classList.add('ticket-card--enter');
      }
      list.append(card);
    }

    if (columnTickets.length === 0) {
      const message = activeFilter === 'all' ? 'No tickets here.' : 'No ' + activeFilter + ' tickets here.';
      list.append(createElement('li', 'board__empty', message));
    }

    document.querySelector('#count-' + status.value).textContent = columnTickets.length;
  }
}

// Keeps "5 min ago" honest while the page stays open, without redrawing the cards
function refreshTimes() {
  for (const time of board.querySelectorAll('.ticket-card__time')) {
    time.textContent = formatTimeAgo(Number(time.dataset.timestamp));
  }
}

function animateNumber(element, target) {
  const start = Number(element.textContent);
  if (start === target) {
    return;
  }
  if (reducedMotion.matches) {
    element.textContent = target;
    return;
  }

  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / COUNT_UP_DURATION, 1);
    element.textContent = Math.round(start + (target - start) * progress);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

// Stats always count every ticket, whatever the board filter is showing
function renderStats() {
  let open = 0;
  let inProgress = 0;
  let resolved = 0;
  let p1Open = 0;

  for (const ticket of tickets) {
    if (ticket.status === 'open') {
      open++;
    } else if (ticket.status === 'in-progress') {
      inProgress++;
    } else {
      resolved++;
    }
    // A P1 still counts while someone is working on it; it only stops being urgent once resolved
    if (ticket.priority === 'P1' && ticket.status !== 'resolved') {
      p1Open++;
    }
  }

  animateNumber(document.querySelector('#stat-open'), open);
  animateNumber(document.querySelector('#stat-in-progress'), inProgress);
  animateNumber(document.querySelector('#stat-resolved'), resolved);
  animateNumber(document.querySelector('#stat-p1'), p1Open);
}

function showTicketChanges(enteringId) {
  renderBoard(enteringId);
  renderStats();
}

function moveTicket(id) {
  const ticket = findTicket(id);
  const nextStatus = STATUSES[findStatusIndex(ticket.status) + 1];
  ticket.status = nextStatus.value;
  updateTickets(tickets);
  showTicketChanges(id);

  // The old button is gone, so give keyboard users focus on the same ticket in its new column
  board.querySelector('[data-id="' + id + '"]').focus();
}

function deleteTicket(id) {
  updateTickets(tickets.filter((ticket) => ticket.id !== id));
  showTicketChanges(null);
}

function setFilter(value) {
  activeFilter = value;
  priorityFilter.querySelector('[value="' + value + '"]').checked = true;
  renderBoard(null);
}

// Event handlers

function handleFormInput(event) {
  const field = event.target.name;

  // Clear an error as soon as the user starts fixing it, instead of waiting for the next submit
  clearFieldError(field);
  formStatus.textContent = '';

  if (field === 'category') {
    showFirstSteps(event.target.value);
  }
  if (field === 'impact' || field === 'urgency') {
    updatePriorityPreview();
  }
}

function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(form);
  const errors = validateForm(formData);
  let firstInvalidField = null;

  for (const field of FORM_FIELDS) {
    if (errors[field]) {
      showFieldError(field, errors[field]);
      if (firstInvalidField === null) {
        firstInvalidField = field;
      }
    } else {
      clearFieldError(field);
    }
  }

  if (firstInvalidField !== null) {
    getFieldInputs(firstInvalidField)[0].focus();
    return;
  }

  const ticket = createTicket({
    name: formData.get('name').trim(),
    category: formData.get('category'),
    description: formData.get('description').trim(),
    impact: formData.get('impact'),
    urgency: formData.get('urgency'),
    status: 'open',
  }, Date.now());

  updateTickets(tickets.concat(ticket));
  // Show all priorities again, otherwise the new ticket could be hidden by the filter
  setFilter('all');
  showTicketChanges(ticket.id);

  formStatus.textContent = 'Thanks, ' + ticket.name + '. Your ' + ticket.priority + ' ticket is on the board.';
  resetForm();
}

// Fade the card out first, then change the data, so the move is easy to follow
function handleBoardClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) {
    return;
  }

  const card = button.closest('.ticket-card');
  // Stops a quick double click from moving the same ticket twice
  button.disabled = true;
  card.classList.add('ticket-card--leave');

  // A timer rather than animationend, which never fires if the browser skips the animation
  const delay = reducedMotion.matches ? 0 : CARD_LEAVE_DURATION;
  setTimeout(() => {
    if (button.dataset.action === 'move') {
      moveTicket(button.dataset.id);
    } else {
      deleteTicket(button.dataset.id);
    }
  }, delay);
}

function handleFilterChange(event) {
  setFilter(event.target.value);
}

function handleResetDemo() {
  updateTickets(createSampleTickets());
  showTicketChanges(null);
}

// Start up

function loadInitialTickets() {
  const saved = loadTickets();
  if (saved === null) {
    // First visit: seed the board so it is never empty during a demo
    updateTickets(createSampleTickets());
  } else {
    tickets = saved;
  }
}

window.addEventListener('scroll', updateNavShadow, { passive: true });
form.addEventListener('input', handleFormInput);
form.addEventListener('submit', handleFormSubmit);
board.addEventListener('click', handleBoardClick);
priorityFilter.addEventListener('change', handleFilterChange);
resetDemoButton.addEventListener('click', handleResetDemo);

updateNavShadow();
renderPriorityMatrix();
renderCategoryTiles();
renderChoices(document.querySelector('#impact-choices'), 'impact', IMPACT_LEVELS);
renderChoices(document.querySelector('#urgency-choices'), 'urgency', URGENCY_LEVELS);
renderChoices(priorityFilter, 'priority-filter', PRIORITY_FILTERS);
loadInitialTickets();
setFilter('all');
renderStats();
setInterval(refreshTimes, 60 * 1000);
