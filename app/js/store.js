// Progress store: the earned set and the spoiler setting live in localStorage
// only (no account, no network), and can be exported to a file and imported
// back. The file format is versioned so a bad import can be rejected safely.
export const STORAGE_KEY = 'gta6-trophy-guide-v1';
export const EXPORT_VERSION = 1;

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: new Set(), spoilers: false };
    const parsed = JSON.parse(raw);
    return {
      earned: new Set(Array.isArray(parsed.earned) ? parsed.earned : []),
      spoilers: parsed.spoilers === true,
    };
  } catch {
    return { earned: new Set(), spoilers: false };
  }
}

export function saveStore(store) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ earned: [...store.earned], spoilers: store.spoilers }),
  );
}

export function toggleEarned(store, trophyName) {
  if (store.earned.has(trophyName)) store.earned.delete(trophyName);
  else store.earned.add(trophyName);
  saveStore(store);
}

export function setSpoilers(store, on) {
  store.spoilers = on;
  saveStore(store);
}

export function resetStore(store) {
  store.earned.clear();
  saveStore(store);
}

export function exportProgress(store) {
  const payload = {
    app: 'leonida-trophy-guide',
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    earned: [...store.earned].sort(),
  };
  return JSON.stringify(payload, null, 2);
}

export function parseImport(text) {
  const parsed = JSON.parse(text);
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('no earned list in file');
  const earned = new Set();
  for (const name of names) {
    if (typeof name !== 'string') throw new Error('bad trophy name in file');
    const clean = name.trim();
    if (clean) earned.add(clean);
  }
  return earned;
}

export function downloadText(filename, text, mime) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
