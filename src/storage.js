// ── Board persistence ────────────────────────────────────

export function saveBoard(columns) {
  try {
    localStorage.setItem('jira-board', JSON.stringify(columns));
  } catch (e) {
    // storage full or unavailable — silently ignore
  }
}

export function loadBoard() {
  try {
    // Prefer new key; fall back to old key (eisgrc-board) for migration
    const raw = localStorage.getItem('jira-board') || localStorage.getItem('eisgrc-board');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ── Settings persistence ─────────────────────────────────

export function saveSettings(s) {
  try {
    localStorage.setItem('jira-settings', JSON.stringify(s));
  } catch (e) {
    // ignore
  }
}

export function loadSettings() {
  try {
    // Prefer new key; fall back to old key (eisgrc-settings) for migration
    const raw = localStorage.getItem('jira-settings') || localStorage.getItem('eisgrc-settings');
    if (!raw) return { theme: 'system' };
    return JSON.parse(raw);
  } catch {
    return { theme: 'system' };
  }
}

// ── App logging (daily files, 7-file rotation) ───────────

export function appendLog(event, details) {
  const today = new Date();
  const dateStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  const key = `jira-log-${dateStr}`;

  let entries = [];
  try {
    const raw = localStorage.getItem(key);
    if (raw) entries = JSON.parse(raw);
  } catch {
    entries = [];
  }

  entries.push({ ts: new Date().toISOString(), event, details });

  try {
    localStorage.setItem(key, JSON.stringify(entries));
  } catch {
    return;
  }

  // Rotate: keep only the 7 most recent log keys
  const logKeys = Object.keys(localStorage)
    .filter(k => k.startsWith('jira-log-'))
    .sort();

  if (logKeys.length > 7) {
    const toDelete = logKeys.slice(0, logKeys.length - 7);
    toDelete.forEach(k => localStorage.removeItem(k));
  }
}

export function getLogDates() {
  return Object.keys(localStorage)
    .filter(k => k.startsWith('jira-log-'))
    .sort()
    .reverse()
    .map(k => k.replace('jira-log-', ''));
}

export function getLog(date) {
  try {
    const raw = localStorage.getItem(`jira-log-${date}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
