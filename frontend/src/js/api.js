import { CONFIG } from './config.js';
import { readJsonCache, writeJsonCache } from './utils.js';

export async function fetchPayload(force = false) {
  const cached = readJsonCache(CONFIG.CACHE_KEY);
  const fresh = cached && Date.now() - cached.savedAt < CONFIG.CACHE_TTL_MS;

  if (!force && fresh) {
    revalidateSilently();
    return cached.payload;
  }

  const payload = await fetchAll();
  writeJsonCache(CONFIG.CACHE_KEY, { savedAt: Date.now(), payload });
  return payload;
}

export async function verifyWholesale(code) {
  const response = await fetch(CONFIG.AUTH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });

  if (!response.ok) throw new Error('No fue posible validar el acceso mayorista.');
  return response.json();
}

async function fetchAll() {
  const response = await fetch(CONFIG.API_BASE);
  if (!response.ok) throw new Error('No fue posible cargar el catálogo.');
  return response.json();
}

async function revalidateSilently() {
  try {
    const payload = await fetchAll();
    writeJsonCache(CONFIG.CACHE_KEY, { savedAt: Date.now(), payload });
  } catch {
    // noop
  }
}
