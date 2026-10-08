import {createDemo, toggleStep, complete, totalPoints} from './model.mjs';
let state = createDemo();
let lastRequest;
let sequence = 0;
const $ = selector => document.querySelector(selector);
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function render() {
  const list = $('#chore-list'); list.replaceChildren();
  for (const chore of state.chores.filter(c => c.status === 'open')) {
    const article = element('article', undefined, 'chore');
    const heading = element('div', undefined, 'chore-heading');
    heading.append(element('h3', chore.title), element('span', `+${chore.minutes} pts`, 'reward'));
    article.append(heading, element('p', `Assigned to ${state.profiles.find(p => p.id === chore.assignedTo).name} · ${chore.minutes} min · ${chore.id.endsWith('-next') ? 'Fresh repeat' : 'First occurrence'}`, 'subtle'));
    for (const step of chore.steps) {
      const label = element('label', undefined, 'step');
      const input = element('input'); input.type = 'checkbox'; input.checked = step.done;
      input.addEventListener('change', () => {toggleStep(state, chore.id, step.id);});
      label.append(input, element('span', step.title)); article.append(label);
    }
    const controls = element('div', undefined, 'completion');
    const label = element('label', 'Completed by ');
    const select = element('select');
    for (const profile of state.profiles) {const option = element('option', profile.name); option.value = profile.id; option.selected = profile.id === chore.assignedTo; select.append(option);}
    label.append(select);
    const button = element('button', 'Complete chore →', 'primary');
    button.addEventListener('click', () => {
      const request = {choreId: chore.id, profileId: select.value, revision: chore.revision, requestId: `request-${++sequence}`};
      try {const result = complete(state, request); lastRequest = request; render(); $('#status').textContent = `Nice work. ${state.profiles.find(p => p.id === result.profileId).name} earned ${result.points} points. The next checklist is fresh.`; $('#status').focus();}
      catch (error) {$('#status').textContent = error.message;}
    });
    controls.append(label, button); article.append(controls); list.append(article);
  }
  const profiles = $('#profiles'); profiles.replaceChildren();
  for (const profile of state.profiles) {
    const person = element('div', undefined, 'person');
    person.append(element('span', profile.name[0], 'avatar'), element('strong', profile.name), element('span', String(totalPoints(state, profile.id)), 'score'), element('small', 'demo chore points'));
    profiles.append(person);
  }
  $('#retry').disabled = !lastRequest;
  $('#award-count').textContent = `${state.ledger.length} recorded award${state.ledger.length === 1 ? '' : 's'}`;
  const history = $('#history-list'); history.replaceChildren();
  if (!state.completions.length) history.append(element('p', 'No completions yet.'));
  for (const item of state.completions.toReversed()) {
    const row = element('div', undefined, 'history-row');
    const copy = element('div'); copy.append(element('strong', item.snapshot.title), element('small', `${state.profiles.find(p => p.id === item.profileId).name} · ${item.snapshot.steps.length} completed steps captured`));
    row.append(copy, element('strong', `+${item.points} pts`)); history.append(row);
  }
}
$('#status').tabIndex = -1;
$('#retry').addEventListener('click', () => {
  const result = complete(state, lastRequest);
  $('#status').textContent = `Same result: ${result.points} points. ${state.ledger.length} award${state.ledger.length === 1 ? '' : 's'} in the ledger. No duplicate.`;
});
$('#reset').addEventListener('click', () => {state = createDemo(); lastRequest = undefined; render(); $('#status').textContent = 'Fresh start. All demo progress cleared.'; $('#reset').focus();});
$('#theme').addEventListener('click', () => {const active = document.body.classList.toggle('graphite'); $('#theme').setAttribute('aria-pressed', String(active)); $('#theme').textContent = active ? 'Light mode' : 'Graphite mode';});
render();
