import signupRequest from '../api/signupRequest.js';  

document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const pwInput = document.getElementById('pw');
    const pwckInput = document.getElementById('pwck');
    const nicknameInput = document.getElementById('nickname');
    const profileInput = document.getElementById('profile');
    const signupBtn = document.getElementById('signupBtn');

    const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = password => password.length >= 8;

    const validateField = (input, validator, errorMessage) => {
        const helperText = document.querySelector(
            `.helperText[name="${input.name}"]`,
        );
        if (!validator(input.value)) {
            helperText.textContent = errorMessage;
            return false;
        }
        helperText.textContent = '';
        return true;
    };

    signupBtn.addEventListener('click', async e => {
        e.preventDefault();
    
        const email = emailInput.value.trim();
        const password = pwInput.value.trim();
        const passwordCheck = pwckInput.value.trim();
        const nickname = nicknameInput.value.trim();
    
        console.log("입력된 회원가입 데이터:", email, password, nickname);  // ✅ 확인
    
        if (!email || !password || !nickname) {
            alert("모든 필드를 입력해주세요.");
            return;
        }
    
        if (password !== passwordCheck) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }
    
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('nickname', nickname);
        if (profileInput.files[0]) {
            formData.append('profile', profileInput.files[0]);
        }
    
        try {
            const response = await signupRequest(formData);
            if (response.success) {
                alert('회원가입이 완료되었습니다.');
                window.location.href = 'login.html';
            } else {
                alert(response.message || '회원가입에 실패했습니다.');
            }
        } catch (error) {
            alert('회원가입 중 오류가 발생했습니다.');
        }
    });
    
    
    
});
