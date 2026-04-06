const CONFIG = Object.freeze({
  SPREADSHEET_ID: 'REEMPLAZAR_SPREADSHEET_ID',
  DRIVE_FOLDER_ID: 'REEMPLAZAR_DRIVE_FOLDER_ID',
  BACKEND_VERSION: 'Ganaclientes System GAS v1.0',
  DEFAULT_TIMEZONE: Session.getScriptTimeZone() || 'America/Bogota',
  ADMIN_LOGIN_KEY: 'LOGIN PANEL',
  CACHE_TTL_SECONDS: 21600,
  CACHE_CHUNK_SIZE: 90000,
  REBUILD_DEBOUNCE_SECONDS: 120,
  REBUILD_WORKER_EVERY_MINUTES: 5,
  DAILY_FULL_REBUILD_HOUR: 3,
  SNAPSHOT_PREFIX: 'gc_',
  PROP_DIRTY_SHEETS: 'GC_DIRTY_SHEETS',
  PROP_REBUILD_NOT_BEFORE: 'GC_REBUILD_NOT_BEFORE',
  PROP_LAST_REBUILD_AT: 'GC_LAST_REBUILD_AT',
  PROP_LAST_FULL_REBUILD_AT: 'GC_LAST_FULL_REBUILD_AT'
});

const LOG_SHEETS = Object.freeze({
  audit: 'audit_log',
  publish: 'publish_log',
  error: 'error_log',
  metrics: 'activity_metrics_daily'
});

const EXPORT_TYPES = Object.freeze(['init', 'catalogo', 'extra', 'all']);

const SHEET_TO_EXPORTS = Object.freeze({
  config_sistema: ['init', 'catalogo', 'extra'],
  config_negocio: ['init'],
  categorias: ['init', 'catalogo'],
  productos_core: ['catalogo'],
  variantes_producto: ['catalogo'],
  inventario_variantes: ['catalogo'],
  producto_detalle: ['extra'],
  combos_pro: ['extra'],
  cross_selling: ['extra'],
  hero_carrusel: ['init'],
  redes_sociales: ['init'],
  politicas: ['init'],
  políticas: ['init']
});

const PANEL_SHEETS = Object.freeze(Object.keys(SHEET_TO_EXPORTS));
