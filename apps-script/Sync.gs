var ACTION_COLLECTION = { 'attendance.update':'attendanceRecords', 'submission.update':'submissions', 'score.update':'scores', 'behavior.create':'behaviorLogs', 'teacherLeave.create':'teacherLeaves', 'teacherLeave.update':'teacherLeaves' };
function syncPush_(mutations) {
  if (!Array.isArray(mutations) || mutations.length>50) throw apiError_('BAD_REQUEST','ส่งการเปลี่ยนแปลงได้ครั้งละไม่เกิน 50 รายการ'); var lock=LockService.getScriptLock(); lock.waitLock(30000); var confirmed=[],conflicts=[],failed=[];
  try { mutations.forEach(function(mutation){ try { if (findMutation_(mutation.id)) { confirmed.push(mutation.id); return; } applyMutation_(mutation); logMutation_(mutation); confirmed.push(mutation.id); } catch(error) { if (error.code==='VERSION_CONFLICT') conflicts.push({id:mutation.id,current:error.details.current}); else failed.push({id:mutation.id,code:error.code||'MUTATION_FAILED',message:error.message}); } }); SpreadsheetApp.flush(); } finally { lock.releaseLock(); }
  return { confirmed:confirmed, conflicts:conflicts, failed:failed };
}
function applyMutation_(mutation) {
  var collection=ACTION_COLLECTION[mutation.action]; var payload=mutation.payload;
  if (collection) { validateMutation_(mutation.action,payload); upsertRecord_(collection,payload,mutation.baseVersion); return; }
  if (mutation.action==='attendance.session.upsert') { if (!payload.session || !payload.session.id || !Array.isArray(payload.records)) throw apiError_('INVALID_RECORD','ข้อมูลคาบเช็กชื่อไม่ครบ'); upsertRecord_('attendanceSessions',payload.session,mutation.baseVersion); payload.records.forEach(function(record){validateMutation_('attendance.update',record);upsertRecord_('attendanceRecords',record);}); return; }
  if (mutation.action==='assessment.create' || mutation.action==='assessment.update') { var assessment=payload.assessment||payload; upsertRecord_('assessments',assessment,mutation.baseVersion); (payload.targets||[]).forEach(function(target){upsertRecord_('assessmentTargets',target);}); return; }
  if (mutation.action==='grades.lock') { (payload.records||[]).forEach(function(record){upsertRecord_('finalGrades',record);}); return; }
  throw apiError_('UNKNOWN_MUTATION','ไม่รองรับ '+mutation.action);
}
function validateMutation_(action,payload) { if (!payload || !payload.id) throw apiError_('INVALID_RECORD','ข้อมูลไม่มี id'); if (action==='attendance.update' && ['PRESENT','LATE','ABSENT','LEAVE'].indexOf(payload.status)<0) throw apiError_('INVALID_STATUS','สถานะเข้าเรียนไม่ถูกต้อง'); if (action==='submission.update' && ['SUBMITTED','LATE','MISSING','EXEMPT'].indexOf(payload.status)<0) throw apiError_('INVALID_STATUS','สถานะส่งงานไม่ถูกต้อง'); if (action==='score.update') { var assessment=findRecord_('assessments',payload.assessmentId); if (!assessment || payload.value!==null && (Number(payload.value)<0 || Number(payload.value)>Number(assessment.maxScore))) throw apiError_('INVALID_SCORE','คะแนนเกินช่วงที่กำหนด'); } }
function findMutation_(id) { var sheet=sheetFor_('MutationLog'); if (sheet.getLastRow()<2) return false; return sheet.getRange(2,1,sheet.getLastRow()-1,1).createTextFinder(id).matchEntireCell(true).findNext()!==null; }
function logMutation_(mutation) { var now=new Date().toISOString(); sheetFor_('MutationLog').appendRow([mutation.id,JSON.stringify({id:mutation.id}),1,now]); }
