// Filtering and the spoiler rule for the checklist.
//
// Kinds come from the data file. "Missable" is a flag, not a kind, so it is
// its own chip. "Online" is shown as a disabled chip: the official list has
// no online trophies, and saying so in the filter is better than hiding the
// category. The spoiler rule hides the name and description of a story trophy
// until it is earned.
// The official list has no online trophies: every trophy is single-player
// (PowerPyx). The filter shows the category as a disabled chip so the reader
// sees the answer instead of wondering where the filter went.
export const ONLINE_TROPHIES = 0;

export const KIND_LABELS = {
  story: 'Story',
  side: 'Side quests',
  collectibles: 'Collectibles',
  activities: 'Activities',
  crime: 'Crime & robbery',
  exploration: 'Exploration',
  money: 'Money & shopping',
  completion: '100% checklist',
  platinum: 'Platinum',
};

export const KIND_ORDER = [
  'story',
  'side',
  'collectibles',
  'activities',
  'crime',
  'exploration',
  'money',
  'completion',
  'platinum',
];

export function isSpoilerHidden(trophy, store) {
  return store.spoilers && trophy.kind === 'story' && !store.earned.has(trophy.name);
}

export function filterTrophies(trophies, store, filters) {
  const query = filters.query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (filters.kind === 'missable' && !t.missable) return false;
    if (filters.kind !== 'all' && filters.kind !== 'missable' && t.kind !== filters.kind) return false;
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.earned === 'earned' && !store.earned.has(t.name)) return false;
    if (filters.earned === 'todo' && store.earned.has(t.name)) return false;
    if (query) {
      const hay = `${t.name} ${t.description} ${t.guide} ${KIND_LABELS[t.kind] ?? ''}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}

export function gradeCounts(trophies, store) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) {
    if (store.earned.has(t.name)) counts[t.grade] += 1;
  }
  return counts;
}
