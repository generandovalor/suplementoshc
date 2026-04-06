function setupAutomation() {
  clearManagedTriggers_();
  ScriptApp.newTrigger('installedOnEditTrigger').forSpreadsheet(CONFIG.SPREADSHEET_ID).onEdit().create();
  ScriptApp.newTrigger('runQueuedRebuilds').timeBased().everyMinutes(CONFIG.REBUILD_WORKER_EVERY_MINUTES).create();
  ScriptApp.newTrigger('runDailyFullRebuild').timeBased().atHour(CONFIG.DAILY_FULL_REBUILD_HOUR).everyDays(1).create();
  return { status: 'success', message: 'Triggers instalados.' };
}

function installedOnEditTrigger(e) {
  try {
    if (!e || !e.range) return;
    var sheetName = e.range.getSheet().getName();
    if (PANEL_SHEETS.indexOf(sheetName) === -1) return;
    queueRebuildForSheet_(sheetName);
  } catch (error) {
    safeWriteErrorLog_('installedOnEditTrigger', 'queueRebuild', '', error, {});
  }
}

function queueRebuildForSheet_(sheetName) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var props = PropertiesService.getScriptProperties();
    var current = JSON.parse(props.getProperty(CONFIG.PROP_DIRTY_SHEETS) || '[]');
    if (current.indexOf(sheetName) === -1) current.push(sheetName);
    props.setProperty(CONFIG.PROP_DIRTY_SHEETS, JSON.stringify(current));
    props.setProperty(CONFIG.PROP_REBUILD_NOT_BEFORE, String(Date.now() + CONFIG.REBUILD_DEBOUNCE_SECONDS * 1000));
  } finally {
    lock.releaseLock();
  }
}

function runQueuedRebuilds() {
  var props = PropertiesService.getScriptProperties();
  var dirty = JSON.parse(props.getProperty(CONFIG.PROP_DIRTY_SHEETS) || '[]');
  var notBefore = Number(props.getProperty(CONFIG.PROP_REBUILD_NOT_BEFORE) || 0);
  if (!dirty.length) return { status: 'success', message: 'No hay rebuilds pendientes.' };
  if (notBefore && Date.now() < notBefore) return { status: 'success', message: 'Esperando debounce.' };
  var affected = {};
  dirty.forEach(function(sheetName) { getAffectedExports(sheetName).forEach(function(type) { affected[type] = true; }); });
  Object.keys(affected).forEach(rebuildAndWarmExport_);
  var aggregate = buildAggregatePayload_();
  putSnapshot_('all', aggregate);
  putLargeCache_(cacheKey_('all'), aggregate);
  props.deleteProperty(CONFIG.PROP_DIRTY_SHEETS);
  props.deleteProperty(CONFIG.PROP_REBUILD_NOT_BEFORE);
  props.setProperty(CONFIG.PROP_LAST_REBUILD_AT, new Date().toISOString());
  return { status: 'success', rebuilt: Object.keys(affected) };
}

function runDailyFullRebuild() {
  refreshAllExports_();
  PropertiesService.getScriptProperties().setProperty(CONFIG.PROP_LAST_FULL_REBUILD_AT, new Date().toISOString());
  return { status: 'success', message: 'Full rebuild diario ejecutado.' };
}

function clearManagedTriggers_() {
  var managed = ['installedOnEditTrigger', 'runQueuedRebuilds', 'runDailyFullRebuild'];
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (managed.indexOf(trigger.getHandlerFunction()) > -1) ScriptApp.deleteTrigger(trigger);
  });
}
