import { loginRequest } from '../api/loginRequest.js';

// 로그인 상태 확인 함수
async function checkLoginStatus() {
    try {
        const response = await fetch("http://localhost:3001/api/auth/check", {
            method: "GET",
            credentials: "include",  // 쿠키 포함
        });

        console.log('🔍 로그인 상태 확인 응답:', response);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ 로그인 상태 확인 성공:', data);
            const userInfo = document.getElementById("userInfo");
            if (userInfo) {
                userInfo.textContent = `환영합니다, ${data.user.nickname}!`;
            }
        } else {
            console.warn('⚠️ 로그인 상태 확인 실패. 쿠키가 없거나 유효하지 않음.');
            const userInfo = document.getElementById("userInfo");
            if (userInfo) {
                userInfo.textContent = "로그인이 필요합니다.";
            }
        }
    } catch (error) {
        // 오류 발생 시 조용히 무시
        console.error('❌ 로그인 상태 확인 중 오류:', error);
    }
}

// 로그인 버튼 이벤트 리스너 추가
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async event => {
        event.preventDefault();  // 폼 제출 기본 동작 막기

        const email = document.getElementById("email").value.trim();
        const passwordInput = document.getElementById("pw");
        const password = passwordInput ? passwordInput.value.trim() : "";

        if (!email || !password) {
            alert("이메일과 비밀번호를 입력해 주세요.");
            return;
        }

        try {
            const data = await loginRequest(email, password);
            if (data.success) {
                alert("로그인 성공!");
                window.location.href = "/index.html";
            } else {
                alert(`로그인 실패: ${data.message}`);
            }
        } catch (error) {
            alert("로그인 중 오류가 발생했습니다.");
        }
    });
});
