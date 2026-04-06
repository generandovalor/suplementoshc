import { state, addToCart, clearCart, removeFromCart } from './state.js';
import { cleanPrice, formatPrice, getYoutubeEmbed, safeImage } from './utils.js';

const dom = {};

export function bindDom() {
  dom.app = document.querySelector('#app');
  dom.products = document.querySelector('#productsGrid');
  dom.combos = document.querySelector('#combosGrid');
  dom.hero = document.querySelector('#heroSlides');
  dom.heroSection = document.querySelector('#heroSection');
  dom.brand = document.querySelector('#brandName');
  dom.subtitle = document.querySelector('#brandSubtitle');
  dom.themeToggle = document.querySelector('#themeToggle');
  dom.wholesaleBadge = document.querySelector('#wholesaleBadge');
  dom.wholesalePanel = document.querySelector('#wholesalePanel');
  dom.cartButton = document.querySelector('#cartButton');
  dom.cartDrawer = document.querySelector('#cartDrawer');
  dom.cartList = document.querySelector('#cartItems');
  dom.cartTotal = document.querySelector('#cartTotal');
  dom.modal = document.querySelector('#productModal');
  dom.modalBody = document.querySelector('#productModalBody');
  dom.footerLinks = document.querySelector('#footerLinks');
  dom.socials = document.querySelector('#socials');
}

export function renderShell() {
  const business = state.payload?.initData?.negocio || {};
  if (dom.brand) {
    dom.brand.textContent = business.NOMBRE_NEGOCIO || 'Ganaclientes System';
  }
  if (dom.subtitle) {
    dom.subtitle.textContent = business.CIUDAD_BASE || 'Catálogo conectado a Sheets';
  }
  renderHero();
  renderFooter();
  toggleWholesaleUI();
  renderCart();
}

export function renderProducts(items) {
  dom.products.innerHTML = items.map((item) => {
    const price = getDisplayPrice(item);
    return `
      <article class="card-surface overflow-hidden">
        <button class="block w-full" data-open-product="${item.ID_PRODUCTOS_CORE || item.id}">
          <div class="aspect-square bg-gray-50 p-4 dark:bg-white/5">
            <img class="h-full w-full object-contain" src="${safeImage(item.IMAGEN_PRINCIPAL_URL || item.imagen)}" alt="${escapeHtml(item.NOMBRE || item.nombre)}" />
          </div>
        </button>
        <div class="space-y-3 p-4">
          <div class="flex flex-wrap gap-2">
            <span class="tag-pill border-purple-200 bg-purple-50 text-purple-700 dark:border-white/10 dark:bg-white/5 dark:text-white">${escapeHtml(item.ETIQUETA || 'Catálogo')}</span>
            <span class="tag-pill border-gray-200 bg-white text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-200">${escapeHtml(item.USO || 'Uso flexible')}</span>
          </div>
          <div>
            <p class="text-xs font-black uppercase tracking-wide text-gray-400">${escapeHtml(item.MARCA || '')}</p>
            <h3 class="mt-1 text-base font-black text-gray-900 dark:text-white">${escapeHtml(item.NOMBRE || item.nombre)}</h3>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">${escapeHtml(item.DESCRIPCION_CORTA || '')}</p>
          </div>
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">Precio</p>
              <p class="text-xl font-black text-hc-purple dark:text-hc-neon">$${formatPrice(price)}</p>
            </div>
            <button class="btn-primary" data-add-product="${item.ID_PRODUCTOS_CORE || item.id}">Añadir</button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

export function renderCombos(items) {
  const active = items.filter((combo) => String(combo.ACTIVO || '').toUpperCase() === 'SI');
  dom.combos.innerHTML = active.map((item) => `
    <article class="card-surface overflow-hidden">
      <div class="aspect-[4/3] bg-gray-50 p-4 dark:bg-white/5">
        <img class="h-full w-full object-cover" src="${safeImage(item.IMAGEN_URL)}" alt="${escapeHtml(item.NOMBRE_COMBO)}" />
      </div>
      <div class="space-y-3 p-4">
        <p class="text-xs font-black uppercase tracking-wide text-gray-400">${escapeHtml(item.CATEGORIA_COMBO || 'Combo')}</p>
        <h3 class="text-base font-black text-gray-900 dark:text-white">${escapeHtml(item.NOMBRE_COMBO)}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300">${escapeHtml(item.DESCRIPCION_CORTA || '')}</p>
        <p class="text-lg font-black text-hc-purple dark:text-hc-neon">$${formatPrice(getComboDisplayPrice(item))}</p>
      </div>
    </article>
  `).join('');
}

export function wireUiEvents(onFilterClick, onSearch, onWholesaleSubmit) {
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => onFilterClick(button));
  });

  document.querySelector('#searchInput').addEventListener('input', (event) => onSearch(event.target.value));
  document.querySelector('#resetFilters').addEventListener('click', () => window.location.reload());
  document.querySelector('#openWholesale').addEventListener('click', () => document.querySelector('#wholesaleModal').showModal());
  document.querySelector('#closeWholesale').addEventListener('click', () => document.querySelector('#wholesaleModal').close());
  document.querySelector('#wholesaleForm').addEventListener('submit', onWholesaleSubmit);
  document.querySelector('#closeProductModal').addEventListener('click', () => closeProductModal());
  document.querySelector('#openCart').addEventListener('click', () => dom.cartDrawer.showModal());
  document.querySelector('#closeCart').addEventListener('click', () => dom.cartDrawer.close());
  document.querySelector('#clearCart').addEventListener('click', () => { clearCart(); renderCart(); });
  dom.products.addEventListener('click', handleProductsClick);
  dom.cartList.addEventListener('click', handleCartClick);
  dom.themeToggle.addEventListener('click', toggleTheme);
}

function handleProductsClick(event) {
  const openTarget = event.target.closest('[data-open-product]');
  if (openTarget) {
    openProductModal(openTarget.dataset.openProduct);
    return;
  }

  const addTarget = event.target.closest('[data-add-product]');
  if (addTarget) {
    const item = state.catalog.find((entry) => String(entry.ID_PRODUCTOS_CORE || entry.id) === addTarget.dataset.addProduct);
    if (!item) return;
    addToCart({ id: addTarget.dataset.addProduct, name: item.NOMBRE || item.nombre, price: getDisplayPrice(item) });
    renderCart();
  }
}

function handleCartClick(event) {
  const target = event.target.closest('[data-remove-cart]');
  if (!target) return;
  removeFromCart(target.dataset.removeCart);
  renderCart();
}

export function renderCart() {
  if (dom.cartList) {
    dom.cartList.innerHTML = state.cart.map((item) => `
      <div class="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 dark:border-white/10">
        <div>
          <p class="font-bold text-gray-900 dark:text-white">${escapeHtml(item.name)}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">${item.qty} x $${formatPrice(item.price)}</p>
        </div>
        <button class="text-sm font-bold text-red-500" data-remove-cart="${item.id}">Quitar</button>
      </div>
    `).join('');
  }
  const total = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (dom.cartTotal) {
    dom.cartTotal.textContent = `$${formatPrice(total)}`;
  }
  if (dom.cartButton) {
    dom.cartButton.textContent = `Carrito (${state.cart.reduce((sum, item) => sum + item.qty, 0)})`;
  }
}

function openProductModal(id) {
  const item = state.catalog.find((entry) => String(entry.ID_PRODUCTOS_CORE || entry.id) === String(id));
  if (!item) return;
  const detail = state.detailsByProduct.get(String(id));
  dom.modalBody.innerHTML = `
    <div class="grid gap-6 md:grid-cols-2">
      <div class="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/5">
        <img class="mx-auto max-h-[360px] object-contain" src="${safeImage(item.IMAGEN_PRINCIPAL_URL || item.imagen)}" alt="${escapeHtml(item.NOMBRE || item.nombre)}" />
      </div>
      <div class="space-y-5">
        <div>
          <p class="text-xs font-black uppercase tracking-wide text-gray-400">${escapeHtml(item.MARCA || '')}</p>
          <h2 class="mt-1 text-2xl font-black text-gray-900 dark:text-white">${escapeHtml(item.NOMBRE || item.nombre)}</h2>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">${escapeHtml(detail?.DESCRIPCION_LARGA || item.DESCRIPCION_CORTA || '')}</p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="card-surface p-4">
            <p class="text-xs font-black uppercase tracking-wide text-gray-400">Beneficio</p>
            <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">${escapeHtml(item.BENEFICIO_PRINCIPAL || '')}</p>
          </div>
          <div class="card-surface p-4">
            <p class="text-xs font-black uppercase tracking-wide text-gray-400">Uso</p>
            <p class="mt-2 text-sm text-gray-700 dark:text-gray-300">${escapeHtml(detail?.MODO_USO || item.USO || 'Uso flexible')}</p>
          </div>
        </div>
        ${detail?.VIDEO_ID ? `<div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10"><iframe class="aspect-video w-full" src="${getYoutubeEmbed(detail.VIDEO_ID)}" title="Video del producto" allowfullscreen></iframe></div>` : ''}
        <div class="flex items-center justify-between gap-4">
          <p class="text-2xl font-black text-hc-purple dark:text-hc-neon">$${formatPrice(getDisplayPrice(item))}</p>
          <button class="btn-primary" id="modalAddToCart">Añadir al carrito</button>
        </div>
      </div>
    </div>
  `;
  dom.modal.showModal();
  document.querySelector('#modalAddToCart').addEventListener('click', () => {
    addToCart({ id: String(item.ID_PRODUCTOS_CORE || item.id), name: item.NOMBRE || item.nombre, price: getDisplayPrice(item) });
    renderCart();
    closeProductModal();
  }, { once: true });
}

export function closeProductModal() {
  dom.modal.close();
}

export function toggleWholesaleUI() {
  dom.wholesaleBadge.classList.toggle('hidden', !state.wholesaleEnabled);
  dom.wholesalePanel.classList.toggle('hidden', !state.wholesaleEnabled);
}

function renderHero() {
  if (!dom.hero || !dom.heroSection) return;
  const items = (state.payload?.initData?.hero || []).filter((item) => String(item.ACTIVO || '').toUpperCase() === 'SI');
  if (!items.length) {
    dom.heroSection.classList.add('hidden');
    return;
  }
  dom.heroSection.classList.remove('hidden');
  dom.hero.innerHTML = items.map((item) => `
    <article class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <img class="h-48 w-full object-cover" src="${safeImage(item.IMAGEN_URL)}" alt="${escapeHtml(item.TEXTO_TITULO)}" />
      <div class="space-y-2 p-5">
        <h2 class="text-xl font-black text-gray-900 dark:text-white">${escapeHtml(item.TEXTO_TITULO)}</h2>
        <p class="text-sm text-gray-600 dark:text-gray-300">${escapeHtml(item.TEXTO_SUBTITULO || '')}</p>
      </div>
    </article>
  `).join('');
}

function renderFooter() {
  if (!dom.footerLinks || !dom.socials) return;
  const links = state.payload?.initData?.politicas || [];
  const socials = state.payload?.initData?.redes || [];
  dom.footerLinks.innerHTML = links
    .filter((item) => String(item.ACTIVO || item.ESTADO || '').toUpperCase() !== 'OFF')
    .map((item) => `<a class="hover:underline" href="${item.URL_POLITICA}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.NOMBRE_POLITICA)}</a>`)
    .join('');
  dom.socials.innerHTML = socials
    .filter((item) => String(item.ESTADO || '').toUpperCase() === 'ON')
    .map((item) => `<a class="tag-pill border-gray-200 bg-white text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-white" href="${item.URL_REDES_SOCIALES}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.RED_SOCIAL)}</a>`)
    .join('');
}

function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  const next = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('gc_theme', next);
}

export function hydrateTheme() {
  const theme = localStorage.getItem('gc_theme') || 'light';
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function getDisplayPrice(item) {
  if (state.wholesaleEnabled) return cleanPrice(item.PRECIO_MAYORISTA || item.precio_mayorista || item.PRECIO_BASE_COP || item.precio);
  return cleanPrice(item.PRECIO_BASE_COP || item.precio || item.PRECIO || 0);
}

function getComboDisplayPrice(item) {
  if (state.wholesaleEnabled) return cleanPrice(item.PRECIO_COMBO_MAYORISTA || item.PRECIO_COMBO || 0);
  return cleanPrice(item.PRECIO_COMBO || 0);
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
