// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 확인
    checkAuth();
    
    initNavigation();
    initFileUpload();
    initCharts();
    initScoreCalculation();
    initAIScoreExtraction();
    
    // 실제 데이터 로드
    loadDashboardData();
});

// 네비게이션 초기화
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 모든 링크와 페이지에서 active 클래스 제거
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            
            // 클릭된 링크와 해당 페이지에 active 클래스 추가
            this.classList.add('active');
            const pageId = this.getAttribute('data-page');
            document.getElementById(pageId).classList.add('active');
            
            // 페이지별 차트 초기화
            if (pageId === 'dashboard') {
                initDashboardCharts();
            } else if (pageId === 'scores') {
                initScoreCharts();
            }
        });
    });
}

// 파일 업로드 초기화
function initFileUpload() {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    
    if (!fileUploadArea || !fileInput) return;
    
    // 클릭 이벤트
    fileUploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // 드래그 앤 드롭
    fileUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--primary-color)';
        this.style.background = 'rgba(25, 118, 210, 0.05)';
    });
    
    fileUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border-color)';
        this.style.background = 'transparent';
    });
    
    fileUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border-color)';
        this.style.background = 'transparent';
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
    
    // 파일 선택 이벤트
    fileInput.addEventListener('change', function(e) {
        handleFiles(this.files);
    });
    
    // 파일 처리 함수
    function handleFiles(files) {
        fileList.innerHTML = '';
        
        Array.from(files).forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const icon = getFileIcon(file.type);
            const size = formatFileSize(file.size);
            
            fileItem.innerHTML = `
                <i class="fas ${icon}"></i>
                <span>${file.name} (${size})</span>
                <i class="fas fa-times remove" onclick="this.parentElement.remove()"></i>
            `;
            
            fileList.appendChild(fileItem);
        });
    }
    
    function getFileIcon(type) {
        if (type.includes('pdf')) return 'fa-file-pdf';
        if (type.includes('image')) return 'fa-file-image';
        return 'fa-file';
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// 차트 초기화
let dashboardChart = null;
let radarChart = null;
let trendChart = null;
let studentTrendChart = null;

function initCharts() {
    initDashboardCharts();
    initScoreCharts();
    initStudentCharts();
}

// 대시보드 차트
function initDashboardCharts() {
    const ctx = document.getElementById('classChart');
    if (!ctx) return;
    
    // 기존 차트 제거
    if (dashboardChart) {
        dashboardChart.destroy();
    }
    
    dashboardChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['고려대반', '연세대반', '서강대반', '성균관대반', '한양대반'],
            datasets: [{
                label: '평균 점수',
                data: [84.2, 82.7, 81.5, 80.8, 83.1],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(240, 147, 251, 0.8)',
                    'rgba(79, 172, 254, 0.8)',
                    'rgba(67, 233, 123, 0.8)',
                    'rgba(250, 112, 154, 0.8)'
                ],
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return '평균 점수: ' + context.parsed.y + '점';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '점';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// 점수 관리 차트
function initScoreCharts() {
    // 레이더 차트
    const radarCtx = document.getElementById('radarChart');
    if (radarCtx) {
        if (radarChart) {
            radarChart.destroy();
        }
        
        radarChart = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['독해력', '내용 이해력', '문제 이해력', '구성력', '형식'],
                datasets: [{
                    label: '현재 점수',
                    data: [90, 87, 85, 85, 90],
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }, {
                    label: '반 평균',
                    data: [85, 82, 83, 84, 83],
                    backgroundColor: 'rgba(240, 147, 251, 0.2)',
                    borderColor: 'rgba(240, 147, 251, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(240, 147, 251, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.r + '점';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // 추이 차트
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
        if (trendChart) {
            trendChart.destroy();
        }
        
        trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['1회차', '2회차', '3회차', '4회차', '5회차'],
                datasets: [{
                    label: '총점',
                    data: [78, 81, 85, 87, 92],
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return '점수: ' + context.parsed.y + '점';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '점';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
}

// 학생 차트
function initStudentCharts() {
    const studentTrendCtx = document.getElementById('studentTrendChart');
    if (studentTrendCtx) {
        if (studentTrendChart) {
            studentTrendChart.destroy();
        }
        
        studentTrendChart = new Chart(studentTrendCtx, {
            type: 'line',
            data: {
                labels: ['1회차', '2회차', '3회차'],
                datasets: [
                    {
                        label: '총점',
                        data: [81, 92, 87],
                        borderColor: 'rgba(102, 126, 234, 1)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: '반 평균',
                        data: [80, 83, 85],
                        borderColor: 'rgba(240, 147, 251, 1)',
                        backgroundColor: 'rgba(240, 147, 251, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: 'rgba(240, 147, 251, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12,
                                weight: '600'
                            },
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y + '점';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '점';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
}

// 점수 계산
function initScoreCalculation() {
    // 초기 계산
    calculateTotal();
}

function calculateTotal() {
    const score1 = parseFloat(document.getElementById('score1')?.value) || 0;
    const score2 = parseFloat(document.getElementById('score2')?.value) || 0;
    const score3 = parseFloat(document.getElementById('score3')?.value) || 0;
    const score4 = parseFloat(document.getElementById('score4')?.value) || 0;
    const score5 = parseFloat(document.getElementById('score5')?.value) || 0;
    
    const total = score1 + score2 + score3 + score4 + score5;
    
    // 총점 업데이트
    const totalScoreEl = document.getElementById('totalScore');
    if (totalScoreEl) {
        totalScoreEl.textContent = total;
    }
    
    // 등급 계산
    const grade = calculateGrade(total);
    const totalGradeEl = document.getElementById('totalGrade');
    if (totalGradeEl) {
        totalGradeEl.textContent = grade;
        totalGradeEl.className = 'grade-badge ' + getGradeClass(grade);
    }
    
    // 레이더 차트 업데이트
    updateRadarChart(score1, score2, score3, score4, score5);
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

function getGradeClass(grade) {
    if (grade.startsWith('A')) return 'grade-a';
    if (grade.startsWith('B')) return 'grade-b';
    return 'grade-c';
}

function updateRadarChart(s1, s2, s3, s4, s5) {
    if (radarChart) {
        // 각 항목을 100점 만점으로 환산
        radarChart.data.datasets[0].data = [
            (s1 / 20) * 100,
            (s2 / 30) * 100,
            (s3 / 20) * 100,
            (s4 / 20) * 100,
            (s5 / 10) * 100
        ];
        radarChart.update();
    }
}

// 로그인 표시
function showStudentInfo() {
    const userId = document.querySelector('.login-form input[type="text"]').value;
    const password = document.querySelector('.login-form input[type="password"]').value;
    
    if (!userId || !password) {
        alert('학생 번호와 비밀번호를 입력하세요');
        return;
    }
    
    showLoading(true);
    
    API.login(userId, password).then(result => {
        showLoading(false);
        
        if (result.success) {
            Auth.setToken(result.token);
            Auth.setUser(result.user);
            
            const loginCard = document.querySelector('.login-card');
            const studentInfoSection = document.getElementById('studentInfoSection');
            
            if (loginCard && studentInfoSection) {
                loginCard.style.display = 'none';
                studentInfoSection.style.display = 'block';
                
                // 학생 데이터 로드
                loadStudentData(result.user.userId);
                
                // 학생 차트 초기화
                setTimeout(() => {
                    initStudentCharts();
                }, 100);
            }
        } else {
            alert(result.error || '로그인 실패');
        }
    }).catch(error => {
        showLoading(false);
        console.error('로그인 오류:', error);
        alert('로그인 중 오류가 발생했습니다');
    });
}

// 인증 확인
function checkAuth() {
    // 학생 조회 페이지가 아니면 인증 체크 안함
    const currentPage = document.querySelector('.page.active');
    if (!currentPage || currentPage.id !== 'student-view') {
        return;
    }
    
    if (Auth.isLoggedIn()) {
        const user = Auth.getUser();
        if (user && user.role === 'student') {
            showStudentInfo();
        }
    }
}

// 학생 데이터 로드
async function loadStudentData(studentId) {
    try {
        const result = await API.getStudent(studentId);
        const scoresResult = await API.getScores(studentId);
        
        if (result.student && scoresResult.scores) {
            updateStudentProfile(result.student, scoresResult.scores);
            updateStudentScoreList(scoresResult.scores);
        }
    } catch (error) {
        console.error('학생 데이터 로드 오류:', error);
    }
}

// 학생 프로필 업데이트
function updateStudentProfile(student, scores) {
    // 이름 업데이트
    document.querySelector('.profile-info h2').textContent = student.name;
    document.querySelector('.profile-info p').textContent = `${student.classId} | 학생번호: ${student.userId}`;
    
    // 통계 계산
    if (scores.length > 0) {
        const totalScore = scores.reduce((sum, s) => sum + s.totalScore, 0);
        const avgScore = (totalScore / scores.length).toFixed(1);
        const maxScore = Math.max(...scores.map(s => s.totalScore));
        const totalCount = scores.length;
        
        // 현재 등급 (최근 점수 기준)
        const latestGrade = scores[0].grade;
        
        document.querySelector('.profile-stat:nth-child(1) .stat-value').textContent = avgScore + '점';
        document.querySelector('.profile-stat:nth-child(2) .stat-value').textContent = maxScore + '점';
        document.querySelector('.profile-stat:nth-child(3) .stat-value').textContent = totalCount + '회';
        document.querySelector('.profile-stat:nth-child(4) .stat-value').textContent = latestGrade;
    }
}

// 학생 점수 목록 업데이트
function updateStudentScoreList(scores) {
    const container = document.querySelector('.student-score-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    scores.forEach(score => {
        const item = createStudentScoreItem(score);
        container.appendChild(item);
    });
}

// 학생 점수 아이템 생성
function createStudentScoreItem(score) {
    const item = document.createElement('div');
    item.className = 'student-score-item';
    
    const date = new Date(score.writtenDate).toLocaleDateString('ko-KR');
    
    item.innerHTML = `
        <div class="score-item-header">
            <h4>${score.assignmentName} (${score.round}회차)</h4>
            <span class="score-date">${date}</span>
        </div>
        <div class="score-details">
            <div class="score-detail">
                <span>독해력:</span>
                <span class="score-value">${score.scores.reading}/20</span>
            </div>
            <div class="score-detail">
                <span>내용 이해력:</span>
                <span class="score-value">${score.scores.contentUnderstanding}/30</span>
            </div>
            <div class="score-detail">
                <span>문제 이해력:</span>
                <span class="score-value">${score.scores.problemUnderstanding}/20</span>
            </div>
            <div class="score-detail">
                <span>구성력:</span>
                <span class="score-value">${score.scores.composition}/20</span>
            </div>
            <div class="score-detail">
                <span>형식:</span>
                <span class="score-value">${score.scores.format}/10</span>
            </div>
        </div>
        <div class="score-summary">
            <span class="total-label">총점:</span>
            <span class="total-value">${score.totalScore}점</span>
            <span class="grade-badge grade-${score.grade.charAt(0).toLowerCase()}">${score.grade}</span>
        </div>
        <div class="score-feedback">
            <h5>첨삭 총평</h5>
            <p>${score.feedback.replace(/\n/g, '<br>')}</p>
        </div>
        ${score.attachmentUrl ? `
        <button class="btn btn-secondary btn-sm" onclick="window.open('${score.attachmentUrl}', '_blank')">
            <i class="fas fa-download"></i> 첨삭지 다운로드
        </button>
        ` : ''}
    `;
    
    return item;
}

// 대시보드 데이터 로드
async function loadDashboardData() {
    try {
        const result = await API.getDashboardStats();
        
        if (result) {
            // 통계 카드 업데이트
            updateStatCards(result);
            
            // 반별 차트 업데이트
            if (result.classAverages && result.classAverages.length > 0) {
                updateClassChart(result.classAverages);
            }
        }
    } catch (error) {
        console.error('대시보드 데이터 로드 오류:', error);
    }
}

// 통계 카드 업데이트
function updateStatCards(stats) {
    const cards = document.querySelectorAll('.stat-card');
    
    if (cards[0]) {
        cards[0].querySelector('.stat-number').textContent = stats.totalStudents + '명';
    }
    if (cards[1]) {
        cards[1].querySelector('.stat-number').textContent = stats.weeklyScores + '건';
    }
    if (cards[2]) {
        cards[2].querySelector('.stat-number').textContent = stats.averageScore + '점';
    }
    if (cards[3]) {
        cards[3].querySelector('.stat-number').textContent = stats.topStudents + '명';
    }
}

// 반별 차트 업데이트
function updateClassChart(classAverages) {
    if (dashboardChart) {
        const labels = classAverages.map(c => c.className);
        const data = classAverages.map(c => parseFloat(c.average));
        
        dashboardChart.data.labels = labels;
        dashboardChart.data.datasets[0].data = data;
        dashboardChart.update();
    }
}

// 폼 제출 이벤트
document.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const formType = form.closest('.page').id;
    
    if (formType === 'scores') {
        await handleScoreSubmit(form);
    } else if (formType === 'upload') {
        showAlert('파일 업로드 기능은 곧 추가됩니다');
    } else {
        showAlert('저장되었습니다!');
    }
});

// 점수 제출 핸들러
async function handleScoreSubmit(form) {
    const classSelect = document.getElementById('scoreClassSelect');
    const studentSelect = document.getElementById('scoreStudentSelect');
    const assignmentName = document.querySelector('input[placeholder*="과제명"]');
    const round = document.querySelector('input[type="number"][placeholder*="3"]');
    
    if (!classSelect.value || !studentSelect.value) {
        showAlert('반과 학생을 선택하세요');
        return;
    }
    
    const scoreData = {
        studentId: studentSelect.value,
        classId: classSelect.value,
        assignmentName: assignmentName.value || '논술 과제',
        round: parseInt(round.value) || 1,
        writtenDate: new Date().toISOString(),
        scores: {
            reading: parseInt(document.getElementById('score1').value) || 0,
            contentUnderstanding: parseInt(document.getElementById('score2').value) || 0,
            problemUnderstanding: parseInt(document.getElementById('score3').value) || 0,
            composition: parseInt(document.getElementById('score4').value) || 0,
            format: parseInt(document.getElementById('score5').value) || 0
        },
        feedback: document.querySelector('.score-detail-form textarea').value || ''
    };
    
    try {
        showLoading(true);
        const result = await API.createScore(scoreData);
        showLoading(false);
        
        if (result.success) {
            showAlert('점수가 성공적으로 저장되었습니다!', 'success');
            form.reset();
            calculateTotal();
        } else {
            showAlert(result.error || '저장 실패');
        }
    } catch (error) {
        showLoading(false);
        console.error('점수 저장 오류:', error);
        showAlert('점수 저장 중 오류가 발생했습니다');
    }
}

// 반응형 네비게이션 (모바일)
function toggleMobileNav() {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('mobile-open');
}

// 윈도우 리사이즈 이벤트
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        // 차트 리사이즈
        if (dashboardChart) dashboardChart.resize();
        if (radarChart) radarChart.resize();
        if (trendChart) trendChart.resize();
        if (studentTrendChart) studentTrendChart.resize();
    }, 250);
});

// 유틸리티 함수
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateTime(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 데이터 필터링 및 검색 (향후 확장)
function filterData(query) {
    // 검색 기능 구현
    console.log('검색어:', query);
}

// 데이터 정렬 (향후 확장)
function sortData(field, order) {
    // 정렬 기능 구현
    console.log('정렬:', field, order);
}

// 엑셀 내보내기 (향후 확장)
function exportToExcel(data) {
    // 엑셀 내보내기 기능 구현
    console.log('엑셀 내보내기:', data);
}

// AI 자동 점수 추출 초기화
function initAIScoreExtraction() {
    const aiFileInput = document.getElementById('aiFileInput');
    
    if (!aiFileInput) return;
    
    aiFileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        await processScoreFile(file);
    });
}

// 파일 처리 및 AI 분석
async function processScoreFile(file) {
    const statusEl = document.getElementById('aiUploadStatus');
    
    // 파일 타입 확인
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
        showUploadStatus('error', '지원하지 않는 파일 형식입니다. PDF, JPG, PNG 파일만 가능합니다.');
        return;
    }
    
    // 파일 크기 확인 (20MB 제한)
    if (file.size > 20 * 1024 * 1024) {
        showUploadStatus('error', '파일 크기가 너무 큽니다. 20MB 이하의 파일만 업로드 가능합니다.');
        return;
    }
    
    try {
        // 로딩 상태 표시
        showUploadStatus('loading', '<i class="fas fa-spinner fa-spin"></i> AI가 첨삭지를 분석하고 있습니다...');
        
        // 파일을 Base64로 변환 (PDF는 먼저 이미지로 변환 필요)
        let imageUrl;
        if (file.type === 'application/pdf') {
            // PDF는 URL로 직접 사용
            imageUrl = URL.createObjectURL(file);
        } else {
            // 이미지는 Base64로 변환
            imageUrl = await fileToDataURL(file);
        }
        
        // AI 이미지 분석 호출
        const result = await analyzeScoreImage(imageUrl, file.type);
        
        if (result.success) {
            // 추출된 점수를 입력 필드에 자동 입력
            fillScoreFields(result.scores);
            
            // 첨삭 총평도 추출되었으면 입력
            if (result.feedback) {
                const feedbackEl = document.querySelector('.score-detail-form textarea');
                if (feedbackEl) {
                    feedbackEl.value = result.feedback;
                }
            }
            
            showUploadStatus('success', '<i class="fas fa-check-circle"></i> 점수가 성공적으로 추출되었습니다!');
            
            // 3초 후 상태 메시지 제거
            setTimeout(() => {
                statusEl.className = 'upload-status';
                statusEl.innerHTML = '';
            }, 3000);
        } else {
            showUploadStatus('error', '점수를 추출할 수 없습니다. 파일을 확인해주세요.');
        }
        
        // URL 해제
        if (file.type === 'application/pdf') {
            URL.revokeObjectURL(imageUrl);
        }
        
    } catch (error) {
        console.error('파일 처리 오류:', error);
        showUploadStatus('error', '파일 처리 중 오류가 발생했습니다: ' + error.message);
    }
}

// 파일을 DataURL로 변환
function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}

// AI 이미지 분석 (실제 AI API 호출)
async function analyzeScoreImage(imageUrl, fileType) {
    try {
        // 실제 환경에서는 여기서 AI API를 호출합니다
        // 예: Google Cloud Vision API, Azure Computer Vision, 또는 커스텀 AI 모델
        
        // 데모를 위한 시뮬레이션 (실제로는 AI API 호출)
        await simulateAIProcessing();
        
        // 실제 구현 시에는 아래와 같이 AI API를 호출합니다:
        /*
        const response = await fetch('/api/analyze-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: imageUrl,
                type: fileType
            })
        });
        
        const result = await response.json();
        return result;
        */
        
        // 데모: 랜덤한 점수 생성 (실제로는 AI가 추출한 점수)
        return {
            success: true,
            scores: {
                score1: Math.floor(Math.random() * 3) + 18, // 18-20
                score2: Math.floor(Math.random() * 5) + 26, // 26-30
                score3: Math.floor(Math.random() * 3) + 17, // 17-19
                score4: Math.floor(Math.random() * 3) + 17, // 17-19
                score5: Math.floor(Math.random() * 2) + 9   // 9-10
            },
            feedback: "• 제시문 각각에 대한 이해는 준수함\n• 출제의도에 부합하는 구성은 내용과 형식 면 모두 고려해야\n• 논증 답안을 작성할 때는 세부근거가 제시문과 잘 연결됨을 명시적으로 드러내야 할 것"
        };
        
    } catch (error) {
        console.error('AI 분석 오류:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// AI 처리 시뮬레이션 (로딩 효과)
function simulateAIProcessing() {
    return new Promise(resolve => {
        setTimeout(resolve, 2000); // 2초 대기
    });
}

// 추출된 점수를 입력 필드에 채우기
function fillScoreFields(scores) {
    if (scores.score1 !== undefined) {
        const el = document.getElementById('score1');
        if (el) {
            el.value = scores.score1;
            // 애니메이션 효과
            el.classList.add('field-updated');
            setTimeout(() => el.classList.remove('field-updated'), 1000);
        }
    }
    if (scores.score2 !== undefined) {
        const el = document.getElementById('score2');
        if (el) {
            el.value = scores.score2;
            el.classList.add('field-updated');
            setTimeout(() => el.classList.remove('field-updated'), 1000);
        }
    }
    if (scores.score3 !== undefined) {
        const el = document.getElementById('score3');
        if (el) {
            el.value = scores.score3;
            el.classList.add('field-updated');
            setTimeout(() => el.classList.remove('field-updated'), 1000);
        }
    }
    if (scores.score4 !== undefined) {
        const el = document.getElementById('score4');
        if (el) {
            el.value = scores.score4;
            el.classList.add('field-updated');
            setTimeout(() => el.classList.remove('field-updated'), 1000);
        }
    }
    if (scores.score5 !== undefined) {
        const el = document.getElementById('score5');
        if (el) {
            el.value = scores.score5;
            el.classList.add('field-updated');
            setTimeout(() => el.classList.remove('field-updated'), 1000);
        }
    }
    
    // 총점 재계산
    calculateTotal();
}

// 업로드 상태 표시
function showUploadStatus(type, message) {
    const statusEl = document.getElementById('aiUploadStatus');
    if (!statusEl) return;
    
    statusEl.className = 'upload-status ' + type;
    statusEl.innerHTML = message;
}

// 알림 표시 (향후 확장)
function showNotification(message, type = 'info') {
    // 토스트 알림 구현
    console.log(`[${type}]`, message);
}

// 로딩 표시 (향후 확장)
function showLoading() {
    // 로딩 스피너 표시
    console.log('로딩 중...');
}

function hideLoading() {
    // 로딩 스피너 숨김
    console.log('로딩 완료');
}
