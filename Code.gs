// ===================================
// 김윤환논술 첨삭관리시스템 - Google Apps Script 백엔드
// ===================================

// 스프레드시트 설정
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // 스프레드시트 ID를 입력하세요

// 시트 이름
const SHEETS = {
  USERS: '사용자',
  CLASSES: '반',
  STUDENTS: '학생',
  SCORES: '점수',
  FILES: '파일'
};

// ===================================
// 메인 HTTP 핸들러
// ===================================

function doGet(e) {
  const path = e.parameter.path;
  const action = e.parameter.action;
  
  try {
    switch(path) {
      case 'auth':
        return handleAuth(e);
      case 'classes':
        return handleClasses(e);
      case 'students':
        return handleStudents(e);
      case 'scores':
        return handleScores(e);
      case 'dashboard':
        return handleDashboard(e);
      default:
        return createResponse({ error: '잘못된 경로입니다' }, 404);
    }
  } catch (error) {
    Logger.log('Error: ' + error);
    return createResponse({ error: error.toString() }, 500);
  }
}

function doPost(e) {
  const path = e.parameter.path;
  const data = JSON.parse(e.postData.contents);
  
  try {
    switch(path) {
      case 'auth':
        return handleAuthPost(data);
      case 'scores':
        return handleScoresPost(data);
      case 'files':
        return handleFilesPost(data);
      default:
        return createResponse({ error: '잘못된 경로입니다' }, 404);
    }
  } catch (error) {
    Logger.log('Error: ' + error);
    return createResponse({ error: error.toString() }, 500);
  }
}

// ===================================
// 인증 핸들러
// ===================================

function handleAuth(e) {
  const action = e.parameter.action;
  
  if (action === 'login') {
    const userId = e.parameter.userId;
    const password = e.parameter.password;
    
    const user = findUser(userId, password);
    
    if (user) {
      return createResponse({
        success: true,
        user: {
          userId: user.userId,
          name: user.name,
          role: user.role,
          classId: user.classId
        },
        token: generateToken(user.userId)
      });
    } else {
      return createResponse({
        success: false,
        error: '아이디 또는 비밀번호가 잘못되었습니다'
      }, 401);
    }
  }
  
  return createResponse({ error: '잘못된 요청입니다' }, 400);
}

function findUser(userId, password) {
  const sheet = getSheet(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  
  // 헤더 제외하고 검색
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId && data[i][1] === password) {
      return {
        userId: data[i][0],
        password: data[i][1],
        name: data[i][2],
        role: data[i][3],
        classId: data[i][4]
      };
    }
  }
  
  return null;
}

function generateToken(userId) {
  // 간단한 토큰 생성 (실제로는 더 안전한 방법 사용)
  return Utilities.base64Encode(userId + ':' + new Date().getTime());
}

// ===================================
// 반 관리 핸들러
// ===================================

function handleClasses(e) {
  const action = e.parameter.action;
  
  if (action === 'list') {
    const classes = getAllClasses();
    return createResponse({ classes: classes });
  }
  
  if (action === 'get') {
    const classId = e.parameter.classId;
    const classData = getClassById(classId);
    return createResponse({ class: classData });
  }
  
  return createResponse({ error: '잘못된 요청입니다' }, 400);
}

function getAllClasses() {
  const sheet = getSheet(SHEETS.CLASSES);
  const data = sheet.getDataRange().getValues();
  const classes = [];
  
  // 헤더 제외
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) { // ID가 있는 경우만
      classes.push({
        id: data[i][0],
        className: data[i][1],
        teacherId: data[i][2],
        schedule: data[i][3],
        location: data[i][4],
        studentCount: data[i][5] || 0,
        averageScore: data[i][6] || 0,
        attendanceRate: data[i][7] || 0,
        gradient: data[i][8] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      });
    }
  }
  
  return classes;
}

function getClassById(classId) {
  const sheet = getSheet(SHEETS.CLASSES);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === classId) {
      return {
        id: data[i][0],
        className: data[i][1],
        teacherId: data[i][2],
        schedule: data[i][3],
        location: data[i][4],
        studentCount: data[i][5] || 0,
        averageScore: data[i][6] || 0,
        attendanceRate: data[i][7] || 0
      };
    }
  }
  
  return null;
}

// ===================================
// 학생 관리 핸들러
// ===================================

function handleStudents(e) {
  const action = e.parameter.action;
  
  if (action === 'list') {
    const classId = e.parameter.classId;
    const students = getStudentsByClass(classId);
    return createResponse({ students: students });
  }
  
  if (action === 'get') {
    const studentId = e.parameter.studentId;
    const student = getStudentById(studentId);
    return createResponse({ student: student });
  }
  
  return createResponse({ error: '잘못된 요청입니다' }, 400);
}

function getStudentsByClass(classId) {
  const sheet = getSheet(SHEETS.STUDENTS);
  const data = sheet.getDataRange().getValues();
  const students = [];
  
  for (let i = 1; i < data.length; i++) {
    if (!classId || data[i][2] === classId) {
      students.push({
        id: data[i][0],
        name: data[i][1],
        classId: data[i][2],
        userId: data[i][3],
        phone: data[i][4],
        email: data[i][5]
      });
    }
  }
  
  return students;
}

function getStudentById(studentId) {
  const sheet = getSheet(SHEETS.STUDENTS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === studentId) {
      return {
        id: data[i][0],
        name: data[i][1],
        classId: data[i][2],
        userId: data[i][3],
        phone: data[i][4],
        email: data[i][5]
      };
    }
  }
  
  return null;
}

// ===================================
// 점수 관리 핸들러
// ===================================

function handleScores(e) {
  const action = e.parameter.action;
  
  if (action === 'list') {
    const studentId = e.parameter.studentId;
    const scores = getScoresByStudent(studentId);
    return createResponse({ scores: scores });
  }
  
  if (action === 'get') {
    const scoreId = e.parameter.scoreId;
    const score = getScoreById(scoreId);
    return createResponse({ score: score });
  }
  
  return createResponse({ error: '잘못된 요청입니다' }, 400);
}

function handleScoresPost(data) {
  if (data.action === 'create') {
    const scoreId = createScore(data);
    return createResponse({ 
      success: true, 
      scoreId: scoreId,
      message: '점수가 성공적으로 저장되었습니다'
    });
  }
  
  if (data.action === 'update') {
    updateScore(data.scoreId, data);
    return createResponse({ 
      success: true,
      message: '점수가 성공적으로 수정되었습니다'
    });
  }
  
  return createResponse({ error: '잘못된 요청입니다' }, 400);
}

function createScore(data) {
  const sheet = getSheet(SHEETS.SCORES);
  const scoreId = 'SCR' + new Date().getTime();
  
  const totalScore = (data.scores.reading || 0) + 
                     (data.scores.contentUnderstanding || 0) + 
                     (data.scores.problemUnderstanding || 0) + 
                     (data.scores.composition || 0) + 
                     (data.scores.format || 0);
  
  const grade = calculateGrade(totalScore);
  
  sheet.appendRow([
    scoreId,
    data.studentId,
    data.classId,
    data.assignmentName,
    data.round,
    data.writtenDate || new Date(),
    data.scores.reading || 0,
    data.scores.contentUnderstanding || 0,
    data.scores.problemUnderstanding || 0,
    data.scores.composition || 0,
    data.scores.format || 0,
    totalScore,
    grade,
    data.feedback || '',
    data.attachmentUrl || '',
    new Date(),
    new Date()
  ]);
  
  return scoreId;
}

function getScoresByStudent(studentId) {
  const sheet = getSheet(SHEETS.SCORES);
  const data = sheet.getDataRange().getValues();
  const scores = [];
  
  for (let i = 1; i < data.length; i++) {
    if (!studentId || data[i][1] === studentId) {
      scores.push({
        id: data[i][0],
        studentId: data[i][1],
        classId: data[i][2],
        assignmentName: data[i][3],
        round: data[i][4],
        writtenDate: data[i][5],
        scores: {
          reading: data[i][6],
          contentUnderstanding: data[i][7],
          problemUnderstanding: data[i][8],
          composition: data[i][9],
          format: data[i][10]
        },
        totalScore: data[i][11],
        grade: data[i][12],
        feedback: data[i][13],
        attachmentUrl: data[i][14],
        createdAt: data[i][15],
        updatedAt: data[i][16]
      });
    }
  }
  
  // 최신순 정렬
  scores.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return scores;
}

function getScoreById(scoreId) {
  const sheet = getSheet(SHEETS.SCORES);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === scoreId) {
      return {
        id: data[i][0],
        studentId: data[i][1],
        classId: data[i][2],
        assignmentName: data[i][3],
        round: data[i][4],
        writtenDate: data[i][5],
        scores: {
          reading: data[i][6],
          contentUnderstanding: data[i][7],
          problemUnderstanding: data[i][8],
          composition: data[i][9],
          format: data[i][10]
        },
        totalScore: data[i][11],
        grade: data[i][12],
        feedback: data[i][13],
        attachmentUrl: data[i][14],
        createdAt: data[i][15],
        updatedAt: data[i][16]
      };
    }
  }
  
  return null;
}

function updateScore(scoreId, data) {
  const sheet = getSheet(SHEETS.SCORES);
  const sheetData = sheet.getDataRange().getValues();
  
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][0] === scoreId) {
      const totalScore = (data.scores.reading || 0) + 
                         (data.scores.contentUnderstanding || 0) + 
                         (data.scores.problemUnderstanding || 0) + 
                         (data.scores.composition || 0) + 
                         (data.scores.format || 0);
      
      const grade = calculateGrade(totalScore);
      
      sheet.getRange(i + 1, 4).setValue(data.assignmentName);
      sheet.getRange(i + 1, 5).setValue(data.round);
      sheet.getRange(i + 1, 7).setValue(data.scores.reading || 0);
      sheet.getRange(i + 1, 8).setValue(data.scores.contentUnderstanding || 0);
      sheet.getRange(i + 1, 9).setValue(data.scores.problemUnderstanding || 0);
      sheet.getRange(i + 1, 10).setValue(data.scores.composition || 0);
      sheet.getRange(i + 1, 11).setValue(data.scores.format || 0);
      sheet.getRange(i + 1, 12).setValue(totalScore);
      sheet.getRange(i + 1, 13).setValue(grade);
      sheet.getRange(i + 1, 14).setValue(data.feedback || '');
      sheet.getRange(i + 1, 17).setValue(new Date());
      
      return true;
    }
  }
  
  return false;
}

// ===================================
// 대시보드 핸들러
// ===================================

function handleDashboard(e) {
  const stats = getDashboardStats();
  return createResponse(stats);
}

function getDashboardStats() {
  const studentsSheet = getSheet(SHEETS.STUDENTS);
  const scoresSheet = getSheet(SHEETS.SCORES);
  const classesSheet = getSheet(SHEETS.CLASSES);
  
  const studentsData = studentsSheet.getDataRange().getValues();
  const scoresData = scoresSheet.getDataRange().getValues();
  const classesData = classesSheet.getDataRange().getValues();
  
  // 전체 학생 수
  const totalStudents = studentsData.length - 1;
  
  // 이번 주 첨삭 수
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  let weeklyScores = 0;
  
  for (let i = 1; i < scoresData.length; i++) {
    if (new Date(scoresData[i][15]) >= weekAgo) {
      weeklyScores++;
    }
  }
  
  // 평균 점수
  let totalScore = 0;
  for (let i = 1; i < scoresData.length; i++) {
    totalScore += scoresData[i][11] || 0;
  }
  const averageScore = scoresData.length > 1 ? (totalScore / (scoresData.length - 1)).toFixed(1) : 0;
  
  // A등급 이상 학생 수
  let topStudents = 0;
  const studentScores = {};
  
  for (let i = 1; i < scoresData.length; i++) {
    const studentId = scoresData[i][1];
    const score = scoresData[i][11];
    
    if (!studentScores[studentId] || studentScores[studentId] < score) {
      studentScores[studentId] = score;
    }
  }
  
  for (let studentId in studentScores) {
    if (studentScores[studentId] >= 90) {
      topStudents++;
    }
  }
  
  // 반별 평균 점수
  const classAverages = [];
  for (let i = 1; i < classesData.length; i++) {
    const classId = classesData[i][0];
    const className = classesData[i][1];
    let classTotal = 0;
    let classCount = 0;
    
    for (let j = 1; j < scoresData.length; j++) {
      if (scoresData[j][2] === classId) {
        classTotal += scoresData[j][11] || 0;
        classCount++;
      }
    }
    
    if (classCount > 0) {
      classAverages.push({
        className: className,
        average: (classTotal / classCount).toFixed(1)
      });
    }
  }
  
  return {
    totalStudents: totalStudents,
    weeklyScores: weeklyScores,
    averageScore: averageScore,
    topStudents: topStudents,
    classAverages: classAverages
  };
}

// ===================================
// 유틸리티 함수
// ===================================

function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    initializeSheet(sheet, sheetName);
  }
  
  return sheet;
}

function initializeSheet(sheet, sheetName) {
  switch(sheetName) {
    case SHEETS.USERS:
      sheet.appendRow(['사용자ID', '비밀번호', '이름', '역할', '반ID']);
      break;
    case SHEETS.CLASSES:
      sheet.appendRow(['반ID', '반이름', '강사ID', '일정', '장소', '학생수', '평균점수', '출석률', '그라데이션']);
      break;
    case SHEETS.STUDENTS:
      sheet.appendRow(['학생ID', '이름', '반ID', '사용자ID', '전화번호', '이메일']);
      break;
    case SHEETS.SCORES:
      sheet.appendRow(['점수ID', '학생ID', '반ID', '과제명', '회차', '작성일', '독해력', '내용이해력', '문제이해력', '구성력', '형식', '총점', '등급', '첨삭총평', '첨부파일URL', '생성일', '수정일']);
      break;
    case SHEETS.FILES:
      sheet.appendRow(['파일ID', '학생ID', '반ID', '파일명', '파일URL', '파일크기', '업로드일']);
      break;
  }
}

function calculateGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  return 'D';
}

function createResponse(data, code = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
