// App entry point: wires up page behavior (rendering and events).

import { getPriority } from './priority.js';
import { IMPACT_LEVELS, URGENCY_LEVELS, CATEGORIES } from './data.js';

const nav = document.querySelector('.site-nav');
const form = document.querySelector('#ticket-form');
const stepsPanel = document.querySelector('#steps-panel');
const stepsTitle = document.querySelector('#steps-title');
const stepsList = document.querySelector('#steps-list');
const priorityPreview = document.querySelector('#priority-preview');
const formStatus = document.querySelector('#form-status');

// Fields in the order they appear, so the first error we focus is the one highest on the page
const FORM_FIELDS = ['name', 'category', 'description', 'impact', 'urgency'];
const MIN_DESCRIPTION_LENGTH = 10;

let previewedPriority = null;

// textContent instead of innerHTML, so text can never be read as HTML
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

function renderChoices(containerId, name, options) {
  const container = document.querySelector(containerId);

  for (const option of options) {
    const choice = createElement('label', 'choice');
    choice.append(createRadio(name, option.value));
    choice.append(createElement('span', 'choice__pill', option.label));
    container.append(choice);
  }
}

function findCategory(value) {
  return CATEGORIES.find(function (category) {
    return category.value === value;
  });
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

  const name = formData.get('name').trim();
  const priority = getPriority(formData.get('impact'), formData.get('urgency'));
  formStatus.textContent = 'Thanks, ' + name + '. Your ticket is logged as ' + priority + '.';
  resetForm();
}

window.addEventListener('scroll', updateNavShadow, { passive: true });
form.addEventListener('input', handleFormInput);
form.addEventListener('submit', handleFormSubmit);

updateNavShadow();
renderPriorityMatrix();
renderCategoryTiles();
renderChoices('#impact-choices', 'impact', IMPACT_LEVELS);
renderChoices('#urgency-choices', 'urgency', URGENCY_LEVELS);
