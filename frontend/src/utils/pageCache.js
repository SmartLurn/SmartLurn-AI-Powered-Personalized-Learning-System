// Remembers page data between visits so going back to a page shows it instantly
// (the page then refreshes it quietly in the background).
// Lives in memory only: a page reload starts fresh. Each entry belongs to one user,
// so after switching accounts nothing from the previous account is shown.
const cache = new Map();

export const readCache = (key, userId) => {
  const entry = cache.get(key);
  return entry && entry.userId === userId ? entry.data : undefined;
};

export const writeCache = (key, userId, data) => {
  cache.set(key, { userId, data });
};
