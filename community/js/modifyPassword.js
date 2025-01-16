import { changePassword } from '../api/modifyPasswordRequest.js';
import Dialog from '../component/dialog/dialog.js';
import initializeHeader from '../component/header/header.js';
import {
    authCheck,
    deleteCookie,
    prependChild,
    validPassword,
    getCurrentSession
} from '../utils/function.js';

// HTTP 상태 코드 상수 수정
const HTTP_OK = 200;

// 세션 체크 및 userId 가져오기
const session = getCurrentSession();
if (!session?.userId) {
    location.href = '/login.html';
}

const modifyData = {
    currentPassword: '',
    password: '',
    passwordCheck: '',
};

const observeData = () => {
    const { currentPassword, password, passwordCheck } = modifyData;
    const button = document.querySelector('#signupBtn');

    if (!currentPassword || !password || !passwordCheck || password !== passwordCheck) {
        button.disabled = true;
        button.style.backgroundColor = '#ACA0EB';
    } else {
        button.disabled = false;
        button.style.backgroundColor = '#7F6AEE';
    }
};

const blurEventHandler = async (event, uid) => {
    if (uid === 'currentPassword') {
        const value = event.target.value;
        const helperElement = document.querySelector(
            `.inputBox p[name="currentPassword"]`,
        );

        if (!helperElement) return;

        if (!value) {
            helperElement.textContent = '*현재 비밀번호를 입력해주세요.';
        } else {
            helperElement.textContent = '';
            modifyData.currentPassword = value;
        }
    } else if (uid === 'newPassword') {
        const value = event.target.value;
        const isValidPassword = validPassword(value);
        const helperElement = document.querySelector(
            `.inputBox p[name="newPassword"]`,
        );

        if (!helperElement) return;

        if (!value) {
            helperElement.textContent = '*새 비밀번호를 입력해주세요.';
        } else if (!isValidPassword) {
            helperElement.textContent =
                '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
        } else {
            helperElement.textContent = '';
            modifyData.password = value;
        }
    } else if (uid === 'confirmPassword') {
        const value = event.target.value;
        const helperElement = document.querySelector(
            `.inputBox p[name="confirmPassword"]`,
        );

        if (!helperElement) return;

        if (!value) {
            helperElement.textContent = '*새 비밀번호를 한번 더 입력해주세요.';
        } else if (value !== modifyData.password) {
            helperElement.textContent = '*비밀번호가 일치하지 않습니다.';
        } else {
            helperElement.textContent = '';
            modifyData.passwordCheck = value;
        }
    }

    observeData();
};

const addEventForInputElements = () => {
    const inputElements = document.querySelectorAll('input');
    inputElements.forEach(element => {
        element.addEventListener('input', event => blurEventHandler(event, element.id));
    });
};

const modifyPassword = async () => {
    try {
        const { currentPassword, password } = modifyData;
        
        // 세션에서 userId 가져오기
        const currentSession = getCurrentSession();
        if (!currentSession?.userId) {
            throw new Error('세션이 만료되었습니다.');
        }

        console.log('Current session:', currentSession); // 디버깅용

        const response = await changePassword(
            currentSession.userId,  // 실제 userId 사용
            password,
            currentPassword
        );

        if (response.success) {
            Dialog('비밀번호 변경 완료', '비밀번호가 변경되었습니다. 다시 로그인해주세요.', () => {
                deleteCookie('session');
                deleteCookie('userId');
                localStorage.clear();
                sessionStorage.clear();
                location.href = '/login.html';
            });
        } else {
            throw new Error(response.message || '비밀번호 변경에 실패했습니다.');
        }
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        Dialog('비밀번호 변경 실패', error.message || '비밀번호 변경에 실패했습니다.');
    }
};

const addEvent = () => {
    addEventForInputElements();
    
    const modifyBtn = document.querySelector('#signupBtn');
    if (modifyBtn) {
        modifyBtn.addEventListener('click', async () => {
            if (!modifyBtn.disabled) {
                await modifyPassword();
            }
        });
    }
};

const init = async () => {
    try {
        const response = await authCheck();
        if (response && response.ok) {
            addEvent();
            observeData();
            initializeHeader();
        } else {
            throw new Error('인증 실패');
        }
    } catch (error) {
        console.error('Init error:', error);
        location.href = '/login.html';
    }
};

init();
