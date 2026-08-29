function onOpen() {
  bindContainerSpreadsheet_();
  SpreadsheetApp.getUi()
    .createMenu('KruNote')
    .addItem('สร้าง/อัปเดตฐานข้อมูล', 'setupKruNote')
    .addItem('รีเซ็ต PIN เป็น 12345678', 'resetKruNotePin')
    .addToUi();
}

/**
 * Run this once from the copied Google Sheet or its Apps Script editor.
 * It creates missing database tabs and headers in that same spreadsheet.
 * Existing rows are preserved and the function is safe to run again.
 */
function setupKruNote() {
  var result = setupSystem_({ includeMock: false });
  var pinMessage = result.initialPin
    ? '\n\nPIN เริ่มต้น: ' + result.initialPin + '\nสามารถเปลี่ยนภายหลังได้จากหน้า “การตั้งค่า” ในแอป'
    : '';
  SpreadsheetApp.getUi().alert(
    'KruNote พร้อมใช้งาน',
    'สร้างหรืออัปเดตชีตฐานข้อมูลและ Header ในไฟล์นี้เรียบร้อยแล้ว จากนั้น Deploy เป็น Web app ได้เลย' + pinMessage,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  return result;
}

/** Reset is deliberately available only from the spreadsheet-bound script UI. */
function resetKruNotePin() {
  bindContainerSpreadsheet_();
  setPin_(DEFAULT_PIN, false);
  PropertiesService.getScriptProperties().setProperty('PIN_POLICY_VERSION', PIN_POLICY_VERSION);
  var cache = CacheService.getScriptCache();
  cache.remove('pin-block');
  cache.remove('pin-attempts');
  SpreadsheetApp.getUi().alert(
    'รีเซ็ต PIN แล้ว',
    'เข้าแอปด้วย PIN 12345678 และเปลี่ยนรหัสภายหลังได้จากหน้า “การตั้งค่า”',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  return { reset: true };
}
