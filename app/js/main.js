// Boot: load the trophy data, wire the tabs, toolbar, export/import and the
// detail pane, and render. The only network request the app ever makes is the
// fetch of its own data/trophies.json file; everything else is local.
//
// Demo hook for screenshots: ?demo=1 seeds a partially-finished checklist
// (13 of 55 earned), ?view=roadmap|missables|sources opens that tab,
// ?spoilers=on turns the spoiler setting on, ?kind=<kind> pre-selects a
// filter chip, and ?select=<trophy name> opens that trophy's guide in the
// detail pane. These only ever touch this browser's own localStorage.
import { loadStore, saveStore, setSpoilers, resetStore, exportProgress, parseImport, downloadText } from './store.js';
import { renderProgress, renderKindChips, renderChecklist, renderDetail } from './views.js';
import { renderRoadmap, renderMissables } from './roadmap.js';

const DEMO_EARNED = [
  'Just Like Paradise',
  'Paradise Lost',
  'T**s Ass Drug Money',
  'Vice City, Baby!',
  'Trust',
  'Break the Bank',
  'Master of None',
  'Baited My Tackle',
  'Stick Fiddler',
  'Whip It Good',
  'The Goodtime State',
  'In The Beginning…',
  'Treat Yo Self',
];

const DEMO_EARNED_SPOILERS = [
  'Just Like Paradise',
  'Paradise Lost',
  'Master of None',
  'Baited My Tackle',
  'Stick Fiddler',
  'Whip It Good',
  'The Goodtime State',
  'In The Beginning…',
  'Treat Yo Self',
];

const params = new URLSearchParams(location.search);
const store = loadStore();
if (params.get('demo') === '1') {
  store.earned = new Set(DEMO_EARNED);
  saveStore(store);
}
if (params.get('demo') === '2') {
  // Fewer story trophies earned, so the spoiler setting has visible work to do.
  store.earned = new Set(DEMO_EARNED_SPOILERS);
  saveStore(store);
}
if (params.get('spoilers') === 'on') setSpoilers(store, true);

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byName = new Map(trophies.map((t) => [t.name, t]));

const filters = { kind: 'all', grade: 'all', earned: 'all', query: '' };
let selectedName = trophies[0].name;
let currentView = 'checklist';

function renderAll() {
  renderProgress(trophies, store);
  renderKindChips(filters.kind, (kind) => {
    filters.kind = kind;
    renderAll();
  });
  renderChecklist(trophies, store, filters, selectedName, (name, keepDetail) => {
    selectedName = name;
    renderAll();
    if (!keepDetail) document.getElementById('detailPane').scrollIntoView({ block: 'nearest' });
  });
  renderDetail(byName.get(selectedName), store, () => renderAll());
  renderRoadmap(trophies, store, (name) => {
    selectedName = name;
    showView('checklist');
    renderAll();
  });
  renderMissables(trophies, store, (name) => {
    selectedName = name;
    showView('checklist');
    renderAll();
  });
  document.getElementById('spoilerToggle').checked = store.spoilers;
}

function showView(view) {
  currentView = view;
  for (const btn of document.querySelectorAll('#tabs button')) {
    btn.classList.toggle('active', btn.dataset.view === view);
  }
  for (const section of document.querySelectorAll('main .view')) {
    section.hidden = section.id !== `view-${view}`;
  }
}

for (const btn of document.querySelectorAll('#tabs button')) {
  btn.addEventListener('click', () => {
    showView(btn.dataset.view);
    renderAll();
  });
}

document.getElementById('search').addEventListener('input', (event) => {
  filters.query = event.target.value;
  renderAll();
});
document.getElementById('gradeFilter').addEventListener('change', (event) => {
  filters.grade = event.target.value;
  renderAll();
});
document.getElementById('earnedFilter').addEventListener('change', (event) => {
  filters.earned = event.target.value;
  renderAll();
});
document.getElementById('spoilerToggle').addEventListener('change', (event) => {
  setSpoilers(store, event.target.checked);
  renderAll();
});
document.getElementById('exportBtn').addEventListener('click', () => {
  downloadText('gta6-trophy-progress.json', exportProgress(store), 'application/json');
});
document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const earned = parseImport(await file.text());
    const known = new Set(trophies.map((t) => t.name));
    store.earned = new Set([...earned].filter((name) => known.has(name)));
    saveStore(store);
    renderAll();
  } catch {
    alert('That file is not a Leonida Trophy Guide export.');
  }
  event.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    resetStore(store);
    renderAll();
  }
});

const startView = params.get('view');
if (['checklist', 'roadmap', 'missables', 'sources'].includes(startView)) showView(startView);
const startKind = params.get('kind');
if (startKind && (startKind === 'missable' || trophies.some((t) => t.kind === startKind))) {
  filters.kind = startKind;
}
const startSelect = params.get('select');
if (startSelect && byName.has(startSelect)) selectedName = startSelect;
renderAll();
