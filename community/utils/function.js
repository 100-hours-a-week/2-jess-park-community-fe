export const getAuthServerUrl = () => {
    return 'http://localhost:3001';
};

export const getServerUrl = () => {
    return 'http://localhost:3002';
};

export const getCurrentSession = () => {
    const sessionId = getCookie('sessionId');
    const userId = getCookie('userId');
    const userName = getCookie('userName');
    
    console.log('Current session info:', { sessionId, userId, userName });
    
    if (!sessionId || !userId || !userName) {
        return null;
    }

    return {
        sessionId,
        userId,
        userName
    };
};

export const validEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    return passwordRegex.test(password);
};

export const validNickname = (nickname) => {
    const nicknameRegex = /^[가-힣a-zA-Z0-9]{2,10}$/;
    return nicknameRegex.test(nickname);
};

export const authCheck = async () => {
    const session = getCurrentSession();
    if (!session) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`${getAuthServerUrl()}/api/auth`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.sessionId}`
            }
        });

        if (!response.ok) {
            localStorage.removeItem('session');
            window.location.href = '/login.html';
            return;
        }

        return response;
    } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('session');
        window.location.href = '/login.html';
        return;
    }
};

export const authCheckReverse = async () => {
    try {
        const session = getCurrentSession();
        if (!session) {
            return;
        }

        const response = await fetch(`${getAuthServerUrl()}/api/auth`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.sessionId}`
            }
        });

        if (response.ok) {
            location.href = '/index.html';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('session');
    }
};

export const padTo2Digits = (num) => {
    return num.toString().padStart(2, '0');
};

export const handleLogout = () => {
    // 쿠키 삭제
    deleteCookie('sessionId');
    deleteCookie('userId');
    deleteCookie('userName');
    
    // localStorage 클리어
    localStorage.removeItem('userInfo');
    
    window.location.href = '/login.html';
};

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${getAuthServerUrl()}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error('로그인 실패');
        }

        return response;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
};

// 쿠키 설정 시 옵션 추가
export const setCookie = (name, value, days = 1) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;Secure;SameSite=Strict`;
};

export const deleteCookie = (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export const getQueryString = (key) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
};

export const prependChild = (parent, child) => {
    if (!parent || !child) return;
    if (parent.firstChild) {
        parent.insertBefore(child, parent.firstChild);
    } else {
        parent.appendChild(child);
    }
};

// API 요청을 위한 공통 함수 추가
export const fetchWithAuth = async (url, options = {}) => {
    const session = getCurrentSession();
    if (!session) throw new Error('No session found');

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.sessionId}`
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || '요청 실패');
    }

    return { response, data };
};

const session = getCurrentSession();
console.log('현재 세션 정보:', session);
