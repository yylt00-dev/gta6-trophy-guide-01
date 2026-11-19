// Roadmap to the platinum and the missables page.
//
// The three stages are built from the official descriptions and PowerPyx's
// roadmap: stage 1 is the story, stage 2 the 100% checklist clean-up, stage 3
// the last side strands. Each trophy carries its stage in the data file, so
// the stage lists and their progress bars are computed, not hand-typed.
export const STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — Play the story',
    meta: 'Chapters 1–5 · about 60–80 hours · 1 playthrough is enough',
    steps: [
      'Finish the story. There are no mission gold medals and no mission replay, so play it however you like — the 100% checklist is not visible yet, but progress made during the story already counts toward it.',
      'Do the one thing that can be missed: the Chapter 1 meditation at Jason’s house, for Positive Mental Attitude (see the Missables tab).',
      'As side characters appear, do their questlines when they are marked — Andy (Lucia only, Chapter 3), Kenton (Chapter 1), Billy (Chapter 2), Randy and Tyrone (Chapter 3), Bret (Jason only, Chapter 2). All of them stay available after the story.',
      'Scan vehicles with the WAiNK app and study animals through the binoculars as you meet them — 200 of 277 vehicles and 100 of 255 animals are needed later, and starting early makes it natural.',
      'Keep a manual save at the start and end of each chapter. Never use cheats on this run: they disable trophies and saving.',
    ],
  },
  {
    stage: 2,
    title: 'Stage 2 — 100% checklist & clean-up',
    meta: 'After the credits · about 100 hours · free-roam',
    steps: [
      'Open the 100% checklist (Progress → Stats → 100% Completion) and work it in this order: robberies first (8 bank vaults, 39 gang operations), then the full-requirement sets (shooting ranges, drone races, Bret’s Target Decks).',
      'Then the partial sets: 300 stunts, 70 of 80 challenges, 100 optional missions, 200 vehicles scanned, 100 animals studied, 15 of 18 meditations.',
      'Pick up the one-off trophies as you go: the plane at VCIA, the tank at Mile Zero, the blue Banshee showroom, the UFO north-west of Starlet Motel after 2AM, the Apple Martini on Ocean Beach.',
      'Buy the 8 garages ($160,000), register 10 vehicles, launder $250,000 in marked bills, and spend $100,000 across the shops — the robberies pay for all of it.',
      'Finish with A Long Road, the gold for 100% completion. The checklist is closer to 60% true completion, so it is far more forgiving than it looks.',
    ],
  },
  {
    stage: 3,
    title: 'Stage 3 — Strangers & Freaks and the last trophies',
    meta: 'About 10 hours · the platinum pops here',
    steps: [
      'Complete 8 Strangers & Freaks strands (Kirk, Kyle, Yago and Pilot Pete are confirmed to count). Strangers & Freaks are not needed for 100%, so this is the last big block.',
      'Mop up anything left: the two trophies whose methods are still unconfirmed (Bad Luck, I Guess and Ten Pin) and any activity or collectible stragglers.',
      'The platinum, Vice Got a Price!, pops the moment the 54th other trophy does.',
    ],
  },
];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderRoadmap(trophies, store, onPickTrophy) {
  const wrap = document.getElementById('roadmapStages');
  wrap.replaceChildren();
  for (const s of STAGES) {
    const card = el('div', 'stage-card');
    card.id = `stage-${s.stage}`;
    const stageTrophies = trophies.filter((t) => t.stage === s.stage);
    const done = stageTrophies.filter((t) => store.earned.has(t.name)).length;
    const pct = stageTrophies.length ? Math.round((done / stageTrophies.length) * 100) : 0;
    card.append(el('h2', undefined, s.title));
    card.append(el('p', 'stage-meta', `${s.meta} · ${done} of ${stageTrophies.length} trophies earned`));
    const bar = el('div', 'stage-bar');
    bar.append(el('div'));
    bar.firstChild.style.width = `${pct}%`;
    card.append(bar);
    const ol = document.createElement('ol');
    for (const step of s.steps) ol.append(el('li', undefined, step));
    card.append(ol);
    const chips = el('div', 'stage-trophies');
    for (const t of stageTrophies) {
      const chip = el('button', `chip${store.earned.has(t.name) ? ' done' : ''}${t.missable ? ' miss' : ''}`,
        `${t.missable ? '⚠ ' : ''}${t.name}`);
      chip.type = 'button';
      chip.addEventListener('click', () => onPickTrophy(t.name));
      chips.append(chip);
    }
    card.append(chips);
    wrap.append(card);
  }
}

export function renderMissables(trophies, store, onPickTrophy) {
  const wrap = document.getElementById('missableList');
  wrap.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) {
    const card = el('div', 'stage-card');
    const earned = store.earned.has(t.name);
    card.append(el('h2', undefined, `${t.missable ? '⚠ ' : ''}${t.name} — ${earned ? 'earned ✓' : 'potentially missable'}`));
    card.append(el('p', 'stage-meta', `Bronze · ${t.target ?? ''} · Roadmap stage ${t.stage}`));
    card.append(el('p', undefined, t.guide));
    const btn = el('button', 'chip', 'Open the full guide in the checklist');
    btn.type = 'button';
    btn.addEventListener('click', () => onPickTrophy(t.name));
    card.append(btn);
    wrap.append(card);
  }
  const safe = el('div', 'stage-card');
  safe.append(el('h2', undefined, 'Everything else is safe'));
  safe.append(el('p', undefined,
    'All 12 story trophies are automatic and cannot be missed. The five side-character questlines (Andy, Kenton, Billy, Randy, Tyrone) and Bret’s hunts stay available after the story in free-roam. Optional missions that disappear during the story do not matter for trophies, quest givers who go temporarily unavailable come back, and the few magazine collectibles in story buildings that become inaccessible also spawn elsewhere. (PowerPyx.)'));
  wrap.append(safe);
}
