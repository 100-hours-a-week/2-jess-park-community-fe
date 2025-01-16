import { loginRequest } from '../api/loginRequest.js';

document.getElementById('loginBtn').addEventListener('click', async event => {
    event.preventDefault(); // 기본 동작 방지

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('pw').value.trim();

    if (!email || !password) {
        alert('이메일과 비밀번호를 입력해 주세요.');
        return;
    }

    const loginButton = document.getElementById('loginBtn');
    loginButton.disabled = true; // 버튼 비활성화 (로딩 상태)

    try {
        const data = await loginRequest(email, password);
        if (data.success) {
            // localStorage에 로그인 사용자 정보 저장
            localStorage.setItem('loggedInUser', JSON.stringify(data.data));
            alert('로그인 성공!');
            window.location.href = '/index.html'; // 메인 페이지로 리디렉션
        } else {
            alert(`로그인 실패: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('로그인 중 오류가 발생했습니다.');
    } finally {
        loginButton.disabled = false; // 버튼 활성화
    }
});
