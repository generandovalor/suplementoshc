function cacheKey_(type) {
  return 'GC_' + type;
}

function putLargeCache_(key, value) {
  var cache = CacheService.getScriptCache();
  var raw = JSON.stringify(value);
  var chunks = Math.ceil(raw.length / CONFIG.CACHE_CHUNK_SIZE);
  cache.put(key + '_chunks', String(chunks), CONFIG.CACHE_TTL_SECONDS);
  for (var i = 0; i < chunks; i++) {
    cache.put(key + '_' + i, raw.substring(i * CONFIG.CACHE_CHUNK_SIZE, (i + 1) * CONFIG.CACHE_CHUNK_SIZE), CONFIG.CACHE_TTL_SECONDS);
  }
}

function getLargeCache_(key) {
  var cache = CacheService.getScriptCache();
  var chunks = cache.get(key + '_chunks');
  if (!chunks) return null;
  var raw = '';
  for (var i = 0; i < parseInt(chunks, 10); i++) {
    var part = cache.get(key + '_' + i);
    if (!part) return null;
    raw += part;
  }
  return JSON.parse(raw);
}

function clearCache_(key) {
  var cache = CacheService.getScriptCache();
  var chunks = cache.get(key + '_chunks');
  if (!chunks) return;
  for (var i = 0; i < parseInt(chunks, 10); i++) cache.remove(key + '_' + i);
  cache.remove(key + '_chunks');
}

function clearAllCache() {
  EXPORT_TYPES.forEach(function(type) { clearCache_(cacheKey_(type)); });
}

function snapshotFileName_(type) {
  return CONFIG.SNAPSHOT_PREFIX + String(type).toLowerCase() + '.json';
}

function putSnapshot_(type, data) {
  var folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  var name = snapshotFileName_(type);
  var files = folder.getFilesByName(name);
  var raw = JSON.stringify(data);
  if (files.hasNext()) files.next().setContent(raw);
  else folder.createFile(name, raw, MimeType.PLAIN_TEXT);
}

function getSnapshot_(type) {
  var folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  var files = folder.getFilesByName(snapshotFileName_(type));
  if (!files.hasNext()) throw new Error('Snapshot no encontrado: ' + type);
  return JSON.parse(files.next().getBlob().getDataAsString());
}

function getExportSafe_(type) {
  var key = cacheKey_(type);
  var cached = getLargeCache_(key);
  if (cached) return cached;
  try {
    var snapshot = getSnapshot_(type);
    putLargeCache_(key, snapshot);
    return snapshot;
  } catch (error) {
    Logger.log('Snapshot miss para ' + type + ': ' + error);
  }
  var built = buildByType(type);
  putLargeCache_(key, built);
  putSnapshot_(type, built);
  return built;
}
