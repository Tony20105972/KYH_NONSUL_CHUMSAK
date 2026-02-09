// ===================================
// API 설정
// ===================================

// Google Apps Script Web App URL (배포 후 입력)
const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

// 로컬 스토리지 키
const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'user_data'
};

// ===================================
// API 함수들
// ===================================

const API = {
    // 인증
    login: async (userId, password) => {
        const url = `${API_URL}?path=auth&action=login&userId=${encodeURIComponent(userId)}&password=${encodeURIComponent(password)}`;
        const response = await fetch(url);
        return await response.json();
    },
    
    // 반 관리
    getClasses: async () => {
        const url = `${API_URL}?path=classes&action=list`;
        const response = await fetch(url);
        return await response.json();
    },
    
    getClass: async (classId) => {
        const url = `${API_URL}?path=classes&action=get&classId=${classId}`;
        const response = await fetch(url);
        return await response.json();
    },
    
    // 학생 관리
    getStudents: async (classId = '') => {
        const url = `${API_URL}?path=students&action=list&classId=${classId}`;
        const response = await fetch(url);
        return await response.json();
    },
    
    getStudent: async (studentId) => {
        const url = `${API_URL}?path=students&action=get&studentId=${studentId}`;
        const response = await fetch(url);
        return await response.json();
    },
    
    // 점수 관리
    getScores: async (studentId = '') => {
        const url = `${API_URL}?path=scores&action=list&studentId=${studentId}`;
        const response = await fetch(url);
        return await response.json();
    },
    
    getScore: async (scoreId) => {
        const url = `${API_URL}?path=scores&action=get&scoreId=${scoreId}`;
        const response = await fetch(url);
        return await response.json();
    },
    
    createScore: async (data) => {
        const response = await fetch(API_URL + '?path=scores', {
            method: 'POST',
            body: JSON.stringify({
                action: 'create',
                ...data
            })
        });
        return await response.json();
    },
    
    updateScore: async (scoreId, data) => {
        const response = await fetch(API_URL + '?path=scores', {
            method: 'POST',
            body: JSON.stringify({
                action: 'update',
                scoreId: scoreId,
                ...data
            })
        });
        return await response.json();
    },
    
    // 대시보드
    getDashboardStats: async () => {
        const url = `${API_URL}?path=dashboard`;
        const response = await fetch(url);
        return await response.json();
    }
};

// ===================================
// 로컬 스토리지 관리
// ===================================

const Auth = {
    setToken: (token) => {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    },
    
    getToken: () => {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    },
    
    setUser: (user) => {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },
    
    getUser: () => {
        const user = localStorage.getItem(STORAGE_KEYS.USER);
        return user ? JSON.parse(user) : null;
    },
    
    logout: () => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.reload();
    },
    
    isLoggedIn: () => {
        return !!Auth.getToken();
    }
};

// ===================================
// 알림 함수
// ===================================

function showAlert(message, type = 'info') {
    // 간단한 알림 표시
    alert(message);
    
    // 더 나은 UI를 원하면 토스트 알림 라이브러리 사용
    // 예: toastr, sweetalert2 등
}

function showLoading(show = true) {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.style.display = show ? 'block' : 'none';
    }
}
