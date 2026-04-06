function safeWriteErrorLog_(origin, action, sheetName, error, payload) {
  try {
    Logger.log(JSON.stringify({ origin: origin, action: action, sheetName: sheetName, message: error && error.message ? error.message : String(error), payload: payload || {} }));
  } catch (logError) {
    Logger.log(logError);
  }
}
