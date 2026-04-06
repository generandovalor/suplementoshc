export const state = {
  payload: null,
  catalog: [],
  combos: [],
  detailsByProduct: new Map(),
  wholesaleEnabled: false,
  cart: [],
  filters: {
    goal: '',
    level: '',
    use: '',
    search: '',
    tag: ''
  }
};

export function setPayload(payload) {
  state.payload = payload;
  state.catalog = payload?.catData?.catalogo || [];
  state.combos = payload?.extraData?.combos || [];
  state.detailsByProduct = new Map((payload?.extraData?.detalle || []).map((row) => [String(row.ID_PRODUCTOS_CORE), row]));
}

export function setWholesaleEnabled(enabled) {
  state.wholesaleEnabled = Boolean(enabled);
  sessionStorage.setItem('gc_wholesale_enabled', enabled ? 'true' : 'false');
}

export function hydrateWholesale() {
  state.wholesaleEnabled = sessionStorage.getItem('gc_wholesale_enabled') === 'true';
}

export function updateFilter(key, value) {
  state.filters[key] = value;
}

export function resetFilters() {
  state.filters = { goal: '', level: '', use: '', search: '', tag: '' };
}

export function addToCart(item) {
  const existing = state.cart.find((entry) => entry.id === item.id);
  if (existing) existing.qty += 1;
  else state.cart.push({ ...item, qty: 1 });
}

export function removeFromCart(id) {
  state.cart = state.cart.filter((item) => item.id !== id);
}

export function clearCart() {
  state.cart = [];
}
