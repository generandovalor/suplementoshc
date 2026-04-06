import '../css/style.css';
import { fetchPayload, verifyWholesale } from './api.js';
import { filterCatalog } from './filters.js';
import { hydrateWholesale, setPayload, setWholesaleEnabled, state, updateFilter } from './state.js';
import { bindDom, hydrateTheme, renderCombos, renderProducts, renderShell, toggleWholesaleUI, wireUiEvents } from './ui.js';
import { syncUrlWithFilters } from './router.js';

async function boot() {
  hydrateTheme();
  hydrateWholesale();
  bindDom();
  renderLoading(true);

  const payload = await fetchPayload();
  setPayload(payload);
  renderShell();
  applyFilters();
  wireUiEvents(handleFilterClick, handleSearch, handleWholesaleSubmit);
  renderLoading(false);
}

function handleFilterClick(button) {
  const key = button.dataset.filter;
  const value = button.dataset.value;
  const next = state.filters[key] === value ? '' : value;
  updateFilter(key, next);
  document.querySelectorAll(`[data-filter="${key}"]`).forEach((item) => item.classList.toggle('active', item.dataset.value === next));
  applyFilters();
}

function handleSearch(value) {
  updateFilter('search', value);
  applyFilters();
}

async function handleWholesaleSubmit(event) {
  event.preventDefault();
  const code = new FormData(event.currentTarget).get('code');
  const response = await verifyWholesale(code);
  if (!response.valid) {
    alert('Código inválido');
    return;
  }
  setWholesaleEnabled(true);
  toggleWholesaleUI();
  applyFilters();
  document.querySelector('#wholesaleModal').close();
}

function applyFilters() {
  const filtered = filterCatalog(state.catalog, state.filters);
  renderProducts(filtered);
  renderCombos(state.combos);
  syncUrlWithFilters(state.filters);
}

function renderLoading(isLoading) {
  document.querySelector('#loadingState').classList.toggle('hidden', !isLoading);
  document.querySelector('#appShell').classList.toggle('hidden', isLoading);
}

boot().catch((error) => {
  console.error(error);
  document.querySelector('#loadingState').innerHTML = `<div class="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">${error.message}</div>`;
});
