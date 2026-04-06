export function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function slugify(value = '') {
  return normalizeText(value)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatPrice(value) {
  const amount = Number(String(value).replace(/[^0-9.-]/g, '')) || 0;
  return amount.toLocaleString('es-CO');
}

export function cleanPrice(value) {
  return Number(String(value).replace(/[^0-9.-]/g, '')) || 0;
}

export function safeImage(url = '') {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '';
  } catch {
    return '';
  }
}

export function uniqueBy(items, keySelector) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keySelector(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function readJsonCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeJsonCache(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function getYoutubeEmbed(url = '') {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${parsed.pathname.replace('/', '')}`;
    }
    const id = parsed.searchParams.get('v');
    return id ? `https://www.youtube.com/embed/${id}` : '';
  } catch {
    return '';
  }
}
