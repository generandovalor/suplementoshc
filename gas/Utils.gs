function getSpreadsheet() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

function getSheet(name) {
  const sheet = getSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('La hoja no existe: ' + name);
  return sheet;
}

function sheetExists(name) {
  return !!getSpreadsheet().getSheetByName(name);
}

function getHeaders(sheet) {
  if (sheet.getLastColumn() < 1) throw new Error('La hoja ' + sheet.getName() + ' no tiene encabezados.');
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function readTable(name) {
  const sheet = getSpreadsheet().getSheetByName(name);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data.shift();
  return data.map(function(row) {
    const obj = {};
    headers.forEach(function(header, index) { obj[header] = row[index]; });
    return obj;
  });
}

function readTableSafe(name) {
  try { return readTable(name); } catch (error) { Logger.log(error); return []; }
}

function readTableSafeAny(names) {
  for (var i = 0; i < names.length; i++) {
    var rows = readTableSafe(names[i]);
    if (rows.length || sheetExists(names[i])) return rows;
  }
  return [];
}

function readKeyVal(sheetName) {
  var out = {};
  readTableSafe(sheetName).forEach(function(row) {
    out[row.CLAVE] = row.VALOR;
  });
  return out;
}

function parsePostBody(e) {
  if (!e || !e.postData || !e.postData.contents) throw new Error('No se recibió body en la petición POST.');
  return JSON.parse(e.postData.contents);
}

function safeParam(e, key, fallback) {
  return e && e.parameter && e.parameter[key] !== undefined ? e.parameter[key] : fallback;
}

function jsonOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(error) {
  return { status: 'error', message: error && error.message ? error.message : String(error), version: CONFIG.BACKEND_VERSION };
}

function normalizeText_(value) {
  return String(value || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

function normalizeYesNo(value) {
  return normalizeText_(value);
}

function isOnValue(value) {
  return ['SI', 'SÍ', 'ON', 'ACTIVO', 'OK', 'TRUE', '1'].indexOf(normalizeText_(value)) > -1;
}

function cleanPrice(value) {
  if (typeof value === 'number') return value;
  return Number(String(value).replace(/[^0-9.-]/g, '')) || 0;
}

function createSlug(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatNow() {
  return Utilities.formatDate(new Date(), CONFIG.DEFAULT_TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

function requireAdminAuth(body) {
  var config = readKeyVal('config_negocio');
  var expected = String(config[CONFIG.ADMIN_LOGIN_KEY] || '').trim();
  var received = String((body && (body.adminToken || body.admin_token)) || '').trim();
  if (!received || received !== expected) throw new Error('Acceso denegado. adminToken inválido.');
}

function getActorFromBody(body) {
  return String(body && (body.actor || body.email || body.user || 'panel') || 'panel').trim();
}

function getAffectedExports(sheetName) {
  return SHEET_TO_EXPORTS[sheetName] || ['init', 'catalogo', 'extra'];
}
