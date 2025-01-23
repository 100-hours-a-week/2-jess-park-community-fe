document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) {
        console.error('profileForm element not found');
        return;
    }

    const nicknameInput = document.getElementById('nickname');
    const token = localStorage.getItem('token'); // JWT 토큰 가져오기

    if (!token) {
        alert('로그인이 필요합니다.');
        return;
    }

    // JWT로 인증된 경우 유저 정보를 가져오기 위해, 서버에 토큰을 보내 요청
    fetch('http://localhost:3001/api/auth/check', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,  // Authorization 헤더에 JWT 토큰 포함
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.user) {
            // 로그인된 사용자 정보로 닉네임을 placeholder에 설정
            nicknameInput.placeholder = `현재 닉네임: ${data.user.nickname}`;
        } else {
            alert('로그인 상태를 확인할 수 없습니다.');
            window.location.href = '/login.html'; // 로그인 페이지로 이동
        }
    })
    .catch(error => {
        console.error('로그인 정보 확인 오류:', error);
        alert('로그인 상태를 확인할 수 없습니다.');
        window.location.href = '/login.html';
    });

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nickname = nicknameInput.value; // 닉네임 입력값
        const profileFile = document.getElementById('profile').files[0]; // 프로필 이미지 파일

        const formData = new FormData();
        formData.append('nickname', nickname); // 닉네임 추가
        if (profileFile) {
            formData.append('profile', profileFile); // 이미지 파일 추가
        }

        try {
            const response = await fetch('http://localhost:3001/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,  // Authorization 헤더에 JWT 토큰 포함
                },
                body: formData,
            });

            const result = await response.json();
            if (result.success) {
                alert('회원정보가 수정되었습니다.');
                window.location.reload(); // 페이지 새로고침
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('프로필 수정 중 오류가 발생했습니다.');
        }
    });
});
