// Checklist and detail-pane rendering. Every row shows the official name,
// description and grade as PlayStation publishes them, plus the kind, the
// target count where the list tracks one, and a missable badge where it
// applies. Clicking a row opens the full guide in the detail pane.
import { KIND_LABELS, KIND_ORDER, ONLINE_TROPHIES, filterTrophies, gradeCounts, isSpoilerHidden } from './filters.js';
import { toggleEarned } from './store.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderProgress(trophies, store) {
  const earned = store.earned.size;
  const total = trophies.length;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  document.getElementById('earnedCount').textContent = String(earned);
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.getElementById('progressLabel').textContent =
    `${pct}% to the platinum — ${total - earned} to go`;
  const counts = gradeCounts(trophies, store);
  const totals = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
  const wrap = document.getElementById('gradeCounts');
  wrap.replaceChildren();
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const span = el('span');
    const b = el('b', undefined, `${counts[grade]}/${totals[grade]}`);
    span.append(b, ` ${grade}`);
    wrap.append(span);
  }
}

export function renderKindChips(activeKind, onPick) {
  const wrap = document.getElementById('kindChips');
  wrap.replaceChildren();
  const chips = [['all', 'All'], ['story', 'Story'], ['missable', 'Missable'],
    ...KIND_ORDER.filter((k) => k !== 'story').map((k) => [k, KIND_LABELS[k]])];
  for (const [kind, label] of chips) {
    const btn = el('button', activeKind === kind ? 'active' : undefined, label);
    btn.type = 'button';
    btn.addEventListener('click', () => onPick(kind));
    wrap.append(btn);
  }
  const online = el('button', undefined, `Online · ${ONLINE_TROPHIES}`);
  online.type = 'button';
  online.disabled = true;
  online.title = 'The official list has no online trophies — every trophy is single-player.';
  wrap.append(online);
}

export function renderChecklist(trophies, store, filters, selectedName, onSelect) {
  const list = document.getElementById('trophyList');
  const shown = filterTrophies(trophies, store, filters);
  document.getElementById('listMeta').textContent =
    `Showing ${shown.length} of ${trophies.length} trophies` +
    (store.earned.size ? ` · ${store.earned.size} earned` : '') +
    (filters.query ? ` · matching “${filters.query}”` : '');
  list.replaceChildren();
  if (shown.length === 0) {
    const li = el('li', 'trophy-row');
    li.style.display = 'block';
    li.append(el('p', 'empty', 'No trophies match these filters.'));
    list.append(li);
    return;
  }
  for (const t of shown) {
    const hidden = isSpoilerHidden(t, store);
    const earned = store.earned.has(t.name);
    const li = el('li', `trophy-row${earned ? ' earned' : ''}${selectedName === t.name ? ' selected' : ''}`);
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned;
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', (event) => {
      event.stopPropagation();
      toggleEarned(store, t.name);
      onSelect(t.name, true);
    });
    const body = el('div');
    const name = el('div', hidden ? 'trophy-name spoiler-name' : 'trophy-name',
      hidden ? 'Hidden story trophy — earn it to reveal' : t.name);
    body.append(name);
    if (!hidden) body.append(el('div', 'trophy-desc', t.description));
    const tags = el('div', 'trophy-tags');
    tags.append(el('span', 'tag', KIND_LABELS[t.kind] ?? t.kind));
    if (t.target) tags.append(el('span', 'tag target', t.target));
    if (t.missable) tags.append(el('span', 'tag missable', '⚠ Possibly missable'));
    body.append(tags);
    const badge = el('span', `grade-badge ${t.grade}`, t.grade);
    li.append(box, body, badge);
    li.addEventListener('click', () => onSelect(t.name, false));
    list.append(li);
  }
}

export function renderDetail(trophy, store, onEarnedChange) {
  const pane = document.getElementById('detailPane');
  pane.replaceChildren();
  if (!trophy) {
    pane.append(el('p', 'empty', 'Select a trophy to read its guide — what to do, where and how, when it can be missed, and the sources each step comes from.'));
    return;
  }
  const hidden = isSpoilerHidden(trophy, store);
  const earned = store.earned.has(trophy.name);
  pane.append(el('span', `grade-badge ${trophy.grade}`, trophy.grade));
  pane.append(el('h2', undefined, hidden ? 'Hidden story trophy' : trophy.name));
  pane.append(el('p', 'official', hidden
    ? 'Spoilers are on: the name and description stay hidden until this trophy is earned.'
    : `Official description: “${trophy.description}”`));
  const tags = el('div', 'trophy-tags');
  tags.append(el('span', 'tag', KIND_LABELS[trophy.kind] ?? trophy.kind));
  if (trophy.target) tags.append(el('span', 'tag target', trophy.target));
  if (trophy.missable) tags.append(el('span', 'tag missable', '⚠ Possibly missable'));
  tags.append(el('span', 'tag', `Roadmap stage ${trophy.stage}`));
  pane.append(tags);
  pane.append(el('h3', undefined, 'Guide'));
  pane.append(el('p', 'guide-text', hidden
    ? 'This is a story trophy. Turn spoilers off, or earn it in the game, to read the guide.'
    : trophy.guide));
  if (!hidden && trophy.sources?.length) {
    pane.append(el('h3', undefined, 'Sources'));
    const ul = el('ul', 'sources');
    for (const s of trophy.sources) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.label;
      li.append(a);
      ul.append(li);
    }
    pane.append(ul);
  }
  const btn = el('button', `earn-btn${earned ? ' earned' : ''}`,
    earned ? '✓ Earned — click to unmark' : 'Mark as earned');
  btn.type = 'button';
  btn.addEventListener('click', () => {
    toggleEarned(store, trophy.name);
    onEarnedChange();
  });
  pane.append(btn);
}
