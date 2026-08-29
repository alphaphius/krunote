var API_VERSION = '1.0.0';
var SCHEMA_VERSION = 4;

function doGet(e) {
  try {
    var action = e && e.parameter && e.parameter.action || 'health';
    if (action !== 'health') throw apiError_('NOT_FOUND', 'ไม่พบคำสั่งที่ร้องขอ');
    return output_(true, health_());
  } catch (error) { return errorOutput_(error); }
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse(e && e.postData && e.postData.contents || '{}');
    if (!body.action) throw apiError_('BAD_REQUEST', 'ไม่ระบุ action');
    var data = route_(body.action, body.payload || {}, body.session || '');
    return output_(true, data, body.requestId);
  } catch (error) { return errorOutput_(error, body && body.requestId); }
}

function route_(action, payload, token) {
  if (action === 'setup') return setupSystem_(payload);
  if (action === 'verifyPin') return verifyPin_(payload.pin);
  if (action === 'connectionTest') return connectionTest_();
  var session = requireSession_(token);
  if (action === 'changePin') return changePin_(session, payload.currentPin, payload.newPin);
  if (action === 'bootstrap') return bootstrap_();
  if (action === 'syncPush') return syncPush_(payload.mutations || []);
  if (action === 'syncPull') return { cursor: new Date().toISOString(), changes: {} };
  if (action === 'requestExport') return requestExport_(payload);
  if (action === 'jobStatus') return jobStatus_(payload.jobId);
  throw apiError_('NOT_FOUND', 'ไม่พบคำสั่ง ' + action);
}

function health_() {
  return { apiVersion: API_VERSION, schemaVersion: SCHEMA_VERSION, installed: !!PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'), serverTime: new Date().toISOString() };
}

function output_(ok, data, requestId) {
  return ContentService.createTextOutput(JSON.stringify({ ok: ok, data: data, requestId: requestId || Utilities.getUuid(), serverTime: new Date().toISOString(), apiVersion: API_VERSION })).setMimeType(ContentService.MimeType.JSON);
}
function errorOutput_(error, requestId) {
  console.error(error && error.stack || error);
  return ContentService.createTextOutput(JSON.stringify({ ok: false, error: { code: error.code || 'SERVER_ERROR', message: error.message || 'เกิดข้อผิดพลาดใน Apps Script', details: error.details || null }, requestId: requestId || Utilities.getUuid(), serverTime: new Date().toISOString(), apiVersion: API_VERSION })).setMimeType(ContentService.MimeType.JSON);
}
function apiError_(code, message, details) { var error = new Error(message); error.code = code; error.details = details; return error; }
