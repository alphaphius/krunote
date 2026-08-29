function onOpen() {
  bindContainerSpreadsheet_();
  SpreadsheetApp.getUi()
    .createMenu('KruNote')
    .addItem('สร้าง/อัปเดตฐานข้อมูล', 'setupKruNote')
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
    ? '\n\nPIN เริ่มต้น: ' + result.initialPin + '\nกรุณาจด PIN นี้ไว้ ระบบจะแสดงเพียงครั้งเดียวและจะให้เปลี่ยนหลังเข้าแอป'
    : '';
  SpreadsheetApp.getUi().alert(
    'KruNote พร้อมใช้งาน',
    'สร้างหรืออัปเดตชีตฐานข้อมูลและ Header ในไฟล์นี้เรียบร้อยแล้ว จากนั้น Deploy เป็น Web app ได้เลย' + pinMessage,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
  return result;
}
