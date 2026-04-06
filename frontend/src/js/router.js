export function syncUrlWithFilters(filters) {
  const url = new URL(window.location.href);
  Object.entries(filters).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  });
  history.replaceState({}, '', url);
}
