// Independently written showcase model. No production API or persistence.
export function createDemo() {
  return {
    profiles: [{id: 'alex', name: 'Alex'}, {id: 'sam', name: 'Sam'}],
    chores: [
      {id: 'dishes-1', title: 'Do the dishes', minutes: 15, assignedTo: 'alex', revision: 1, status: 'open', steps: [{id: 'wash', title: 'Wash and dry', done: false}, {id: 'away', title: 'Put everything away', done: false}]},
      {id: 'plants-1', title: 'Water the plants', minutes: 10, assignedTo: 'sam', revision: 1, status: 'open', steps: [{id: 'water', title: 'Check soil and water', done: false}]}
    ], ledger: [], completions: [], results: Object.create(null)
  };
}

export function toggleStep(state, choreId, stepId) {
  const chore = state.chores.find(c => c.id === choreId);
  if (!chore || chore.status !== 'open') throw new Error('Choose an open chore.');
  const step = chore.steps.find(s => s.id === stepId);
  if (!step) throw new Error('Choose a valid step.');
  step.done = !step.done;
}

export function complete(state, {choreId, profileId, revision, requestId}) {
  if (typeof requestId !== 'string' || !requestId) throw new Error('A retry identity is required.');
  if (Object.hasOwn(state.results, requestId)) {
    const previous = state.results[requestId];
    if (previous.choreId !== choreId || previous.profileId !== profileId || previous.revision !== revision) throw new Error('A retry must describe the same operation.');
    return {...structuredClone(previous), replayed: true};
  }
  const chore = state.chores.find(c => c.id === choreId);
  if (!chore || chore.status !== 'open') throw new Error('That occurrence is already resolved.');
  if (!state.profiles.some(p => p.id === profileId)) throw new Error('Choose a valid profile.');
  if (revision !== chore.revision) throw new Error('The checklist changed. Refresh before completing.');
  if (chore.steps.some(s => !s.done)) throw new Error('Finish every checklist step first.');
  const snapshot = structuredClone(chore);
  snapshot.status = 'completed';
  const result = {choreId, profileId, revision, points: chore.minutes, replayed: false};
  chore.status = 'completed';
  state.completions.push({snapshot, profileId, points: result.points});
  state.ledger.push({choreId, profileId, points: result.points});
  state.results[requestId] = structuredClone(result);
  state.chores.push({...structuredClone(chore), id: `${choreId}-next`, status: 'open', steps: chore.steps.map(s => ({...s, done: false}))});
  return structuredClone(result);
}

export function totalPoints(state, profileId) {
  return state.ledger.filter(e => e.profileId === profileId).reduce((sum, e) => sum + e.points, 0);
}
