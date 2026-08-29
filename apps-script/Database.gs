var ENTITY_SHEETS = {
  academicYears:'AcademicYears', terms:'Terms', gradeLevels:'GradeLevels', rooms:'Rooms', subjects:'Subjects', teachingGroups:'TeachingGroups', students:'Students', enrollments:'Enrollments', scheduleSlots:'ScheduleSlots', teacherLeaves:'TeacherLeaves', attendanceSessions:'AttendanceSessions', attendanceRecords:'AttendanceRecords', assessmentCategories:'AssessmentCategories', assessments:'Assessments', assessmentTargets:'AssessmentTargets', submissions:'Submissions', scores:'Scores', behaviorLogs:'BehaviorLogs', gradeThresholds:'GradeThresholds', finalGrades:'FinalGrades', exportRequests:'ExportRequests'
};

function setupSystem_(payload) {
  var lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    var props = PropertiesService.getScriptProperties();
    var spreadsheet = containerSpreadsheet_();
    Object.keys(ENTITY_SHEETS).forEach(function(key) { ensureEntitySheet_(spreadsheet, ENTITY_SHEETS[key]); });
    ensureEntitySheet_(spreadsheet, 'MutationLog');
    props.setProperty('SCHEMA_VERSION', String(SCHEMA_VERSION));
    var initialPin='';
    if (!props.getProperty('PIN_HASH')) { initialPin=randomInitialPin_(); setPin_(initialPin,true); }
    ensureExportFolder_();
    if (payload && payload.includeMock) {
      var students=readAll_('students'); var assessments=readAll_('assessments'); var incomplete=readAll_('academicYears').length<2 || readAll_('teachingGroups').length<12 || students.length<90 || assessments.length<21 || readAll_('attendanceSessions').length<100 || readAll_('teacherLeaves').length<4 || readAll_('behaviorLogs').length<12 || readAll_('finalGrades').length<1;
      if (students.length===0) seedMockData_();
      else if (incomplete && mockOnlyDatabase_()) { clearMockDatabase_(); seedMockData_(); }
    }
    return { installed: true, mustChangePin: props.getProperty('MUST_CHANGE_PIN') === 'true', initialPin:initialPin || undefined };
  } finally { lock.releaseLock(); }
}

/**
 * Remember the spreadsheet that owns this container-bound Apps Script.
 * The active spreadsheet is always preferred so a copied template can never
 * keep writing to the source template through an old Script Property.
 */
function bindContainerSpreadsheet_() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) return null;
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheet.getId());
  return spreadsheet;
}

function containerSpreadsheet_() {
  var active = bindContainerSpreadsheet_();
  if (active) return active;

  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SPREADSHEET_ID');
  if (!id) {
    throw apiError_(
      'CONTAINER_NOT_INITIALIZED',
      'ยังไม่ได้ผูกฐานข้อมูลกับ Google Sheet กรุณาเปิดชีตที่คัดลอกมา แล้วเลือกเมนู KruNote > สร้าง/อัปเดตฐานข้อมูล ก่อน Deploy'
    );
  }
  try {
    return SpreadsheetApp.openById(id);
  } catch (_) {
    props.deleteProperty('SPREADSHEET_ID');
    throw apiError_(
      'CONTAINER_NOT_AVAILABLE',
      'เปิด Google Sheet ที่ผูกกับ Apps Script ไม่ได้ กรุณากลับไปที่ชีต แล้วเลือกเมนู KruNote > สร้าง/อัปเดตฐานข้อมูลอีกครั้ง'
    );
  }
}

function spreadsheet_() { return containerSpreadsheet_(); }
function ensureEntitySheet_(ss, name) { var sheet = ss.getSheetByName(name) || ss.insertSheet(name); if (sheet.getLastRow() === 0) { sheet.getRange(1,1,1,4).setValues([['id','json','version','updatedAt']]); sheet.setFrozenRows(1); sheet.getRange(1,1,1,4).setFontWeight('bold').setBackground('#166b59').setFontColor('#ffffff'); } return sheet; }
function sheetFor_(collection) { var name = ENTITY_SHEETS[collection] || collection; return ensureEntitySheet_(spreadsheet_(), name); }
function readAll_(collection) { var sheet = sheetFor_(collection); if (sheet.getLastRow() < 2) return []; return sheet.getRange(2,1,sheet.getLastRow()-1,4).getValues().map(function(row) { try { return JSON.parse(row[1]); } catch (_) { return null; } }).filter(Boolean); }
function findRecord_(collection,id) { return readAll_(collection).filter(function(item) { return item.id === id; })[0] || null; }
function upsertRecord_(collection, record, expectedVersion) {
  var sheet = sheetFor_(collection); var values = sheet.getLastRow() > 1 ? sheet.getRange(2,1,sheet.getLastRow()-1,4).getValues() : []; var rowIndex = -1;
  for (var i=0;i<values.length;i++) if (values[i][0] === record.id) { rowIndex=i+2; break; }
  var current = rowIndex > 0 ? JSON.parse(sheet.getRange(rowIndex,2).getValue()) : null;
  if (current && expectedVersion !== undefined && Number(expectedVersion) !== Number(current.version)) throw apiError_('VERSION_CONFLICT','ข้อมูลถูกแก้จากอุปกรณ์อื่น',{ current:current });
  var now = new Date().toISOString(); var next = Object.assign({}, current || {}, record, { version:(current && current.version || 0)+1, createdAt:current && current.createdAt || record.createdAt || now, updatedAt:now }); var row = [[next.id,JSON.stringify(next),next.version,next.updatedAt]];
  if (rowIndex > 0) sheet.getRange(rowIndex,1,1,4).setValues(row); else sheet.appendRow(row[0]); return next;
}
function deleteRecord_(collection,id) { var sheet=sheetFor_(collection); if(sheet.getLastRow()<2)return; var values=sheet.getRange(2,1,sheet.getLastRow()-1,1).getValues(); for(var i=values.length-1;i>=0;i--)if(values[i][0]===id)sheet.deleteRow(i+2); }
function bootstrap_() { var result={ serverTime:new Date().toISOString(), cursor:new Date().toISOString() }; Object.keys(ENTITY_SHEETS).forEach(function(key){ result[key]=readAll_(key); }); return result; }
function connectionTest_() { var cache=CacheService.getScriptCache(); var marker=Utilities.getUuid(); cache.put('connection-test',marker,30); return { health:true, post:true, roundTrip:cache.get('connection-test')===marker }; }
function ensureExportFolder_() { var props=PropertiesService.getScriptProperties(); var id=props.getProperty('EXPORT_FOLDER_ID'); if (id) { try { return DriveApp.getFolderById(id); } catch (_) {} } var folder=DriveApp.createFolder('KruNote Reports'); props.setProperty('EXPORT_FOLDER_ID',folder.getId()); return folder; }
function mockOnlyDatabase_() { return Object.keys(ENTITY_SHEETS).every(function(collection){return readAll_(collection).every(function(item){return item.isMock===true;});}); }
function clearMockDatabase_() { Object.keys(ENTITY_SHEETS).forEach(function(collection){var sheet=sheetFor_(collection); if(sheet.getLastRow()>1) sheet.deleteRows(2,sheet.getLastRow()-1);}); }
