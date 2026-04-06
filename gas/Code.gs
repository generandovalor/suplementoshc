function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('GanaClientes')
    .addItem('⚡ Rebuild INIT', 'menuRebuildInit')
    .addItem('⚡ Rebuild CATALOGO', 'menuRebuildCatalogo')
    .addItem('⚡ Rebuild EXTRA', 'menuRebuildExtra')
    .addItem('⚡ Rebuild TODO', 'menuRebuildAll')
    .addSeparator()
    .addItem('🧰 Instalar triggers', 'setupAutomation')
    .addItem('🧹 Clear Cache', 'menuClearCache')
    .addToUi();
}

function doGet(e) {
  try {
    var action = safeParam(e, 'action', 'init');
    if (action === 'init') return jsonOutput(getExportSafe_('init'));
    if (action === 'catalogo') return jsonOutput(getExportSafe_('catalogo'));
    if (action === 'extra') return jsonOutput(getExportSafe_('extra'));
    if (action === 'all') return jsonOutput(getExportSafe_('all'));
    if (action === 'health') return jsonOutput({ status: 'ok', version: CONFIG.BACKEND_VERSION, timestamp: new Date().toISOString() });
    if (action === 'version') return jsonOutput({ status: 'ok', version: CONFIG.BACKEND_VERSION, timestamp: new Date().toISOString() });
    return jsonOutput({ status: 'ok', action: action, version: CONFIG.BACKEND_VERSION });
  } catch (error) {
    safeWriteErrorLog_('doGet', safeParam(e, 'action', ''), '', error, e && e.parameter ? e.parameter : {});
    return jsonOutput(errorResponse(error));
  }
}

function doPost(e) {
  var body = {};
  try {
    body = parsePostBody(e);
    var action = String(body.action || '').trim();
    if (!action) throw new Error('Falta el parámetro action.');
    if (action === 'syncCatalog') return jsonOutput(handleSyncCatalog(body.type || 'all', body));
    if (action === 'clearCache') return jsonOutput(handleClearCache(body.type || 'all', body));
    if (action === 'health') return jsonOutput({ status: 'ok', version: CONFIG.BACKEND_VERSION, timestamp: new Date().toISOString() });
    throw new Error('Acción no reconocida: ' + action);
  } catch (error) {
    safeWriteErrorLog_('doPost', String(body.action || ''), String(body.sheetName || ''), error, body);
    return jsonOutput(errorResponse(error));
  }
}

function menuRebuildInit() { rebuildAndWarmExport_('init'); }
function menuRebuildCatalogo() { rebuildAndWarmExport_('catalogo'); }
function menuRebuildExtra() { rebuildAndWarmExport_('extra'); }
function menuRebuildAll() { refreshAllExports_(); }
function menuClearCache() { clearAllCache(); }
