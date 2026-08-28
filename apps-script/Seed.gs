function baseRecord_(id,value) { var now=new Date().toISOString(); return Object.assign({id:id,version:1,createdAt:now,updatedAt:now,isMock:true},value); }

function seedRows_(collection,records) {
  if (!records.length) return;
  var sheet=sheetFor_(collection); var rows=records.map(function(item){return [item.id,JSON.stringify(item),item.version,item.updatedAt];});
  sheet.getRange(sheet.getLastRow()+1,1,rows.length,4).setValues(rows);
}

function seedMockData_() {
  var data={academicYears:[],terms:[],gradeLevels:[],rooms:[],subjects:[],teachingGroups:[],students:[],enrollments:[],scheduleSlots:[],teacherLeaves:[],attendanceSessions:[],attendanceRecords:[],assessmentCategories:[],assessments:[],assessmentTargets:[],submissions:[],scores:[],behaviorLogs:[],gradeThresholds:[],finalGrades:[],exportRequests:[]};
  var year=baseRecord_('year-2569',{name:'2569',startDate:'2026-05-01',endDate:'2027-03-31',active:true});
  var term=baseRecord_('term-2569-1',{academicYearId:year.id,name:'ภาคเรียนที่ 1',number:1,startDate:'2026-05-01',endDate:'2026-10-15',active:true});
  data.academicYears.push(year); data.terms.push(term); data.subjects.push(baseRecord_('subject-math',{code:'ค31101',name:'คณิตศาสตร์'}));
  var first=['กิตติพงษ์','ณัฐชา','ปกรณ์','ชลธิชา','ธนกฤต','พิมพ์ชนก','ภูริณัฐ','วรัญญา','ศุภกร','สิรินดา','อชิรญา','กมลชนก','นราวิชญ์','ปุณณภพ','รินรดา'];
  var last=['ใจดี','สุขใจ','แสงทอง','คำดี','บุญช่วย','วงศ์สวัสดิ์','ตั้งใจ','ศรีสุข','พิพัฒน์กุล','พรประเสริฐ','สุขเกษม','รัตนวงศ์','ชูศักดิ์','มั่นคง','สินสมบูรณ์'];
  var nick=['ต้น','มิ้น','เกม','แพรว','นนท์','มุก','ภูมิ','ใบหม่อน','กล้า','ขิม','ออม','ฟ้า','ไนท์','ปัน','ริน']; var studentIndex=0;
  [4,5,6].forEach(function(level){
    var grade=baseRecord_('grade-'+level,{code:'M'+level,name:'ม.'+level,order:level-3}); data.gradeLevels.push(grade);
    [1,2].forEach(function(roomNo){
      var room=baseRecord_('room-M'+level+'-'+roomNo,{gradeLevelId:grade.id,code:'M'+level+'/'+roomNo,name:'ม.'+level+'/'+roomNo});
      var group=baseRecord_('group-M'+level+'/'+roomNo,{termId:term.id,gradeLevelId:grade.id,roomId:room.id,subjectId:'subject-math',name:'คณิตศาสตร์ '+room.name});
      data.rooms.push(room); data.teachingGroups.push(group); data.scheduleSlots.push(baseRecord_('schedule-'+group.id,{teachingGroupId:group.id,weekday:((level+roomNo)%5)+1,period:roomNo,startTime:roomNo===1?'08:30':'09:30',endTime:roomNo===1?'09:20':'10:20'}));
      var session=baseRecord_('session-'+group.id+'-today',{teachingGroupId:group.id,date:Utilities.formatDate(new Date(),'Asia/Bangkok','yyyy-MM-dd'),period:roomNo}); data.attendanceSessions.push(session);
      for(var n=1;n<=15;n++){
        studentIndex++; var sid='student-'+studentIndex; data.students.push(baseRecord_(sid,{studentCode:String(level)+String(roomNo)+String(n).padStart(2,'0'),number:n,title:n%2?'นาย':'นางสาว',firstName:first[n-1],lastName:last[n-1],nickname:nick[n-1],active:true}));
        data.enrollments.push(baseRecord_('enrollment-'+group.id+'-'+sid,{teachingGroupId:group.id,studentId:sid})); data.attendanceRecords.push(baseRecord_(session.id+':'+sid,{sessionId:session.id,studentId:sid,status:n===5?'LATE':n===12?'ABSENT':'PRESENT'}));
      }
    });
  });
  [['category-work','งานและการบ้าน',30],['category-quiz','แบบทดสอบ',20],['category-midterm','กลางภาค',20],['category-final','ปลายภาค',30]].forEach(function(item){data.assessmentCategories.push(baseRecord_(item[0],{termId:term.id,name:item[1],weight:item[2]}));});
  [4,5,6].forEach(function(level){
    var groups=data.teachingGroups.filter(function(group){return group.gradeLevelId==='grade-'+level;});
    [['การบ้านบทที่ 1','ASSIGNMENT','category-work',20,'REVIEWED'],['แบบฝึกหัดประยุกต์','WORK','category-work',15,'REVIEWING'],['แบบทดสอบย่อย 1','QUIZ','category-quiz',10,'DUE'],['สอบกลางภาค','MIDTERM','category-midterm',30,'OPEN']].forEach(function(definition,index){
      var aid='assessment-M'+level+'-'+(index+1); var due=new Date(); due.setDate(due.getDate()+index-2);
      data.assessments.push(baseRecord_(aid,{termId:term.id,gradeLevelId:'grade-'+level,subjectId:'subject-math',categoryId:definition[2],title:definition[0],type:definition[1],status:definition[4],assignedAt:Utilities.formatDate(new Date(due.getTime()-604800000),'Asia/Bangkok','yyyy-MM-dd'),dueAt:Utilities.formatDate(due,'Asia/Bangkok','yyyy-MM-dd'),maxScore:definition[3]}));
      groups.forEach(function(group){
        data.assessmentTargets.push(baseRecord_('target-'+aid+'-'+group.id,{assessmentId:aid,teachingGroupId:group.id}));
        data.enrollments.filter(function(item){return item.teachingGroupId===group.id;}).forEach(function(enrollment,studentNo){var missing=(studentNo+index)%11===0; data.submissions.push(baseRecord_(aid+':'+enrollment.studentId,{assessmentId:aid,studentId:enrollment.studentId,status:missing?'MISSING':'SUBMITTED'})); data.scores.push(baseRecord_(aid+':'+enrollment.studentId,{assessmentId:aid,studentId:enrollment.studentId,value:definition[4]==='REVIEWED'&&!missing?Math.max(0,definition[3]-(studentNo%5)):null}));});
      });
    });
  });
  [['4',80],['3.5',75],['3',70],['2.5',65],['2',60],['1.5',55],['1',50],['0',0]].forEach(function(item,index){data.gradeThresholds.push(baseRecord_('threshold-'+item[0],{termId:term.id,grade:item[0],minScore:item[1],order:index+1}));});
  var leaveDate=new Date(); leaveDate.setDate(leaveDate.getDate()+2); var leaveDateText=Utilities.formatDate(leaveDate,'Asia/Bangkok','yyyy-MM-dd'); data.teacherLeaves.push(baseRecord_('leave-'+leaveDateText,{date:leaveDateText,substituteName:'ครูสมชาย ใจดี',substitutePhone:'081-234-5678',reason:'ลากิจส่วนตัว',note:'ฝากใบงานไว้ที่ห้องพักครู'}));
  Object.keys(data).forEach(function(collection){seedRows_(collection,data[collection]);}); SpreadsheetApp.flush();
}
