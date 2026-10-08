import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDemo, toggleStep, complete, totalPoints} from './model.mjs';

function ready(state, id = 'dishes-1') {
  for (const step of state.chores.find(c => c.id === id).steps) toggleStep(state, id, step.id);
}
const request = {choreId: 'dishes-1', profileId: 'sam', revision: 1, requestId: 'demo-request'};

test('unfinished checklist leaves awards, history and repeats unchanged', () => {
  const state = createDemo();
  assert.throws(() => complete(state, request), /Finish every/);
  assert.equal(state.ledger.length, 0);
  assert.equal(state.completions.length, 0);
  assert.equal(state.chores.length, 2);
});
test('retry returns one outcome and one award', () => {
  const state = createDemo(); ready(state);
  assert.equal(complete(state, request).points, 15);
  assert.equal(complete(state, request).replayed, true);
  assert.equal(totalPoints(state, 'sam'), 15);
  assert.equal(state.ledger.length, 1);
  assert.equal(state.completions.length, 1);
  assert.equal(state.chores.length, 3);
});
test('another retry identity cannot re-complete the same occurrence', () => {
  const state = createDemo(); ready(state); complete(state, request);
  assert.throws(() => complete(state, {...request, requestId: 'another'}), /already resolved/);
  assert.equal(state.ledger.length, 1);
});
test('retry identity cannot be reused for a different operation', () => {
  const state = createDemo(); ready(state); complete(state, request);
  assert.throws(() => complete(state, {...request, profileId: 'alex'}), /same operation/);
});
test('stale revisions fail before any mutation', () => {
  const state = createDemo(); ready(state); state.chores[0].revision = 2;
  assert.throws(() => complete(state, request), /checklist changed/);
  assert.equal(state.ledger.length, 0);
  assert.equal(state.chores[0].status, 'open');
});
test('actual completer receives credit independently of assignment', () => {
  const state = createDemo(); ready(state); complete(state, request);
  assert.equal(totalPoints(state, 'alex'), 0);
  assert.equal(totalPoints(state, 'sam'), 15);
  assert.equal(state.completions[0].snapshot.assignedTo, 'alex');
});
test('successor resets steps and edits do not rewrite the completed snapshot', () => {
  const state = createDemo(); ready(state); complete(state, request);
  const next = state.chores.find(c => c.id === 'dishes-1-next');
  assert.ok(next.steps.every(s => !s.done));
  next.title = 'Edited future title'; next.steps[0].title = 'Edited step';
  assert.equal(state.completions[0].snapshot.title, 'Do the dishes');
  assert.equal(state.completions[0].snapshot.steps[0].title, 'Wash and dry');
  assert.ok(state.completions[0].snapshot.steps.every(s => s.done));
  assert.equal(state.chores.filter(c => c.title === 'Water the plants' && c.status === 'open').length, 1);
});
test('multiple contributors and durations aggregate correctly', () => {
  const state = createDemo(); ready(state); complete(state, request); ready(state, 'plants-1');
  complete(state, {choreId: 'plants-1', profileId: 'alex', revision: 1, requestId: 'plants-request'});
  assert.equal(totalPoints(state, 'alex'), 10); assert.equal(totalPoints(state, 'sam'), 15);
});
test('invalid profile leaves state unchanged', () => {
  const state = createDemo(); ready(state);
  assert.throws(() => complete(state, {...request, profileId: 'outsider'}), /valid profile/);
  assert.equal(state.completions.length, 0);
});
test('unusual retry identities are treated as keys, not object prototypes', () => {
  const state = createDemo(); ready(state);
  const unusual = {...request, requestId: '__proto__'};
  complete(state, unusual);
  assert.equal(complete(state, unusual).replayed, true);
  assert.equal(Object.getPrototypeOf(state.results), null);
  assert.equal(state.ledger.length, 1);
});
