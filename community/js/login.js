import Dialog from '../component/dialog/dialog.js';
import { loginUser } from '../api/loginRequest.js';
import { authCheckReverse, setCookie } from '../utils/function.js';

const handleLogin = async (event) => {
    if (event) event.preventDefault();
    
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#pw').value;

    if (!email || !password) {
        Dialog('로그인 실패', '이메일과 비밀번호를 모두 입력해주세요.');
        return;
    }

    try {
        console.log('로그인 시도:', { email });
        const response = await loginUser(email, password);
        console.log('서버 응답:', response);

        if (response.success) {
            setCookie('sessionId', response.data.sessionId, 1);
            setCookie('userId', response.data.userId, 1);
            setCookie('userName', response.data.userName, 1);
            
            localStorage.setItem('userInfo', JSON.stringify({
                profileImagePath: response.data.profileImagePath
            }));
            
            location.href = '/index.html';
        } else {
            Dialog('로그인 실패', response.message || '로그인에 실패했습니다.');
        }
    } catch (error) {
        console.error('Login error:', error);
        Dialog('로그인 실패', error.message || '서버 오류가 발생했습니다.');
    }
};

const loginClick = () => {
    const loginBtn = document.querySelector('#loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    const inputs = document.querySelectorAll('#email, #pw');
    inputs.forEach(input => {
        input.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleLogin(event);
            }
        });
    });
};

const init = async () => {
    await authCheckReverse();
    loginClick();
};

document.addEventListener('DOMContentLoaded', init);
