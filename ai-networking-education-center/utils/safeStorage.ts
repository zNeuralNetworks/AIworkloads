const DEBOUNCE_MS = 300;
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const APP_STORAGE_PREFIX = 'app_';
const APP_STORAGE_KEYS = new Set(['app_version']);

export function safeSetItem(key: string, value: string): void {
  const existing = timers.get(key);
  if (existing) clearTimeout(existing);
  timers.set(key, setTimeout(() => {
    try { localStorage.setItem(key, value); }
    catch (err) { console.warn(`[safeStorage] Failed to write "${key}".`, err); }
    timers.delete(key);
  }, DEBOUNCE_MS));
}

export function safeSetItemImmediate(key: string, value: string): void {
  try { localStorage.setItem(key, value); }
  catch (err) { console.warn(`[safeStorage] Failed to write "${key}".`, err); }
}

export function clearAppStorage(): void {
  Object.keys(localStorage)
    .filter((key) => APP_STORAGE_KEYS.has(key) || key.startsWith(APP_STORAGE_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
}
