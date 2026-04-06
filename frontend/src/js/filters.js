import { GOAL_MAP } from './config.js';
import { cleanPrice, normalizeText } from './utils.js';

export function filterCatalog(items, filters) {
  return items.filter((item) => {
    const goal = normalizeText(item.objetivo || '');
    const level = normalizeText(item.TIPO_CLIENTE || item.NIVEL || '');
    const use = normalizeText(item.USO || item.uso || '');
    const searchBlob = normalizeText([
      item.NOMBRE,
      item.nombre,
      item.MARCA,
      item.DESCRIPCION_CORTA,
      item.BENEFICIO_PRINCIPAL,
      item.ETIQUETA,
      item.categoria,
      item.subcategoria
    ].join(' '));

    if (filters.goal && goal !== normalizeText(GOAL_MAP[filters.goal] || filters.goal)) return false;
    if (filters.level && level && !level.includes(normalizeText(filters.level))) return false;
    if (filters.use && use && !use.includes(normalizeText(filters.use))) return false;
    if (filters.search && !searchBlob.includes(normalizeText(filters.search))) return false;

    if (filters.tag === 'OFERTAS' && !normalizeText(item.ETIQUETA).includes('oferta')) return false;
    if (filters.tag === 'RECOMENDADOS' && !['recomendado', 'mas vendido'].some((v) => normalizeText(item.ETIQUETA).includes(v))) return false;
    if (filters.tag === 'URGENCIA' && !(Number(item.STOCK_VISIBLE || 0) > 0 && Number(item.STOCK_VISIBLE || 0) <= 10)) return false;

    return normalizeText(item.ACTIVO ?? item.activo ?? 'SI') !== 'no';
  }).sort((a, b) => cleanPrice(a.PRECIO_BASE_COP || a.precio) - cleanPrice(b.PRECIO_BASE_COP || b.precio));
}
