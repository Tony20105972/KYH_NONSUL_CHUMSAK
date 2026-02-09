// ===================================
// 페이지 로드 시 초기화 (FIXED)
// ===================================
document.addEventListener('DOMContentLoaded', function () {

    // ✅ 1. 기본 페이지 강제 활성화 (가장 중요)
    setInitialPage('dashboard');

    // 로그인 확인
    checkAuth();

    // 초기화
    initNavigation();
    initFileUpload();
    initScoreCalculation();
    initAIScoreExtraction();

    // 차트 & 데이터는 페이지 활성화 이후 실행
    initCharts();
    loadDashboardData();
});


// ===================================
// ✅ 초기 페이지 설정 (NEW)
// ===================================
function setInitialPage(pageId) {
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-link');

    pages.forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
    });

    navLinks.forEach(l => l.classList.remove('active'));

    const targetPage = document.getElementById(pageId);
    const targetNav = document.querySelector(`.nav-link[data-page="${pageId}"]`);

    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.style.display = 'block';
    }

    if (targetNav) {
        targetNav.classList.add('active');
    }
}


// ===================================
// 네비게이션 초기화 (FIXED)
// ===================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const pageId = this.getAttribute('data-page');
            if (!pageId) return;

            // 모든 페이지 숨김
            document.querySelectorAll('.page').forEach(p => {
                p.classList.remove('active');
                p.style.display = 'none';
            });

            navLinks.forEach(l => l.classList.remove('active'));

            // 선택된 페이지 표시
            const page = document.getElementById(pageId);
            if (page) {
                page.classList.add('active');
                page.style.display = 'block';
            }

            this.classList.add('active');

            // 페이지별 초기화
            requestAnimationFrame(() => {
                if (pageId === 'dashboard') {
                    initDashboardCharts();
                    loadDashboardData();
                }
                if (pageId === 'scores') {
                    initScoreCharts();
                }
                if (pageId === 'student-view') {
                    initStudentCharts();
                }
            });
        });
    });
}


// ===================================
// 차트 초기화 (SAFE)
// ===================================
let dashboardChart = null;
let radarChart = null;
let trendChart = null;
let studentTrendChart = null;

function initCharts() {
    // ⚠️ dashboard만 초기 로딩에서 실행
    initDashboardCharts();
}


// ===================================
// 이하 나머지 코드는 🔥변경 없음🔥
// (네가 준 코드 그대로 유지)
// ===================================
