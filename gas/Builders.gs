function buildByType(type) {
  if (type === 'init') return buildInit();
  if (type === 'catalogo') return buildCatalogo();
  if (type === 'extra') return buildExtra();
  if (type === 'all') return buildAggregatePayload_();
  throw new Error('Tipo inválido para build: ' + type);
}

function buildInit() {
  var config = readKeyVal('config_sistema');
  return {
    status: 'success',
    version: CONFIG.BACKEND_VERSION,
    timestamp: new Date().toISOString(),
    sistema: config,
    negocio: readKeyVal('config_negocio'),
    categorias: readTableSafe('categorias'),
    hero: isOnValue(config.MODULO_HERO_CARRUSEL) ? readTableSafe('hero_carrusel') : [],
    redes: isOnValue(config.MODULO_REDES_SOCIALES) ? readTableSafe('redes_sociales') : [],
    politicas: isOnValue(config.MODULO_POLITICAS) ? readTableSafeAny(['políticas', 'politicas']) : []
  };
}

function buildCatalogo() {
  var config = readKeyVal('config_sistema');
  var products = readTableSafe('productos_core').filter(function(row) {
    return normalizeYesNo(row.ACTIVO || 'SI') !== 'NO';
  });
  var categories = readTableSafe('categorias');
  var variants = isOnValue(config.MODULO_VARIANTES) ? readTableSafe('variantes_producto').filter(function(row) {
    return normalizeYesNo(row.ACTIVO || 'SI') !== 'NO';
  }) : [];
  var inventory = isOnValue(config.MODULO_INVENTARIO) ? readTableSafe('inventario_variantes') : [];

  var categoryMap = {};
  categories.forEach(function(cat) { categoryMap[String(cat.ID_CATEGORIAS || '').trim()] = cat; });
  var inventoryMap = {};
  inventory.forEach(function(row) { inventoryMap[String(row.ID_VARIANTES_PRODUCTO || '').trim()] = row; });
  var variantsMap = {};
  variants.forEach(function(variant) {
    var productId = String(variant.ID_PRODUCTOS_CORE || '').trim();
    if (!productId) return;
    if (!variantsMap[productId]) variantsMap[productId] = [];
    var current = Object.assign({}, variant);
    var inv = inventoryMap[String(variant.ID_VARIANTES_PRODUCTO || '').trim()];
    current.stock = inv ? Number(inv.STOCK_ACTUAL) || 0 : 0;
    variantsMap[productId].push(current);
  });

  return {
    status: 'success',
    version: CONFIG.BACKEND_VERSION,
    timestamp: new Date().toISOString(),
    catalogo: products.map(function(product) {
      var productId = String(product.ID_PRODUCTOS_CORE || '').trim();
      var category = categoryMap[String(product.ID_CATEGORIAS || '').trim()] || {};
      var productVariants = variantsMap[productId] || [];
      var price = cleanPrice(product.PRECIO_BASE_COP || product.PRECIO || 0);
      if (productVariants.length) {
        var sorted = productVariants.slice().sort(function(a, b) { return cleanPrice(a.PRECIO_COP_VARIANTE) - cleanPrice(b.PRECIO_COP_VARIANTE); });
        price = cleanPrice(sorted[0].PRECIO_COP_VARIANTE);
      }
      return Object.assign({}, product, {
        id: product.ID_PRODUCTOS_CORE,
        nombre: product.NOMBRE,
        precio: price,
        objetivo: String(category.TIPO_OBJETIVO || '').toUpperCase(),
        categoria: category.CATEGORIA_GENERAL || '',
        subcategoria: category.NOMBRE_CATEGORIA || '',
        variantes: productVariants
      });
    })
  };
}

function buildExtra() {
  var config = readKeyVal('config_sistema');
  return {
    status: 'success',
    version: CONFIG.BACKEND_VERSION,
    timestamp: new Date().toISOString(),
    detalle: isOnValue(config.MODULO_PRODUCTO_DETALLE) ? readTableSafe('producto_detalle') : [],
    combos: isOnValue(config.MODULO_COMBOS_PRO) ? readTableSafe('combos_pro') : [],
    cross: isOnValue(config.MODULO_CROSSELING) ? readTableSafe('cross_selling') : []
  };
}

function buildAggregatePayload_() {
  return {
    status: 'success',
    version: CONFIG.BACKEND_VERSION,
    timestamp: new Date().toISOString(),
    initData: getExportSafe_('init'),
    catData: getExportSafe_('catalogo'),
    extraData: getExportSafe_('extra')
  };
}

function rebuildAndWarmExport_(type) {
  clearCache_(cacheKey_(type));
  var data = buildByType(type);
  putLargeCache_(cacheKey_(type), data);
  putSnapshot_(type, data);
  return data;
}

function refreshAllExports_() {
  ['init', 'catalogo', 'extra'].forEach(function(type) { rebuildAndWarmExport_(type); });
  var aggregate = buildAggregatePayload_();
  putSnapshot_('all', aggregate);
  putLargeCache_(cacheKey_('all'), aggregate);
}
