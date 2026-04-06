function handleSyncCatalog(type, body) {
  requireAdminAuth(body || {});
  var normalized = String(type || 'all').toLowerCase();
  if (normalized === 'all') {
    refreshAllExports_();
    return { status: 'success', type: 'all', message: 'Todo el catálogo fue sincronizado.' };
  }
  rebuildAndWarmExport_(normalized);
  var aggregate = buildAggregatePayload_();
  putSnapshot_('all', aggregate);
  putLargeCache_(cacheKey_('all'), aggregate);
  return { status: 'success', type: normalized, message: normalized.toUpperCase() + ' sincronizado.' };
}

function handleClearCache(type, body) {
  requireAdminAuth(body || {});
  var normalized = String(type || 'all').toLowerCase();
  if (normalized === 'all') clearAllCache();
  else clearCache_(cacheKey_(normalized));
  return { status: 'success', type: normalized, message: 'Cache limpiado correctamente.' };
}
