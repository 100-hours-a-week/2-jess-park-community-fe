document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) {
        console.error('profileForm element not found');
        return;
    }

    const nicknameInput = document.getElementById('nickname');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')); // 현재 유저 정보 가져오기

    if (loggedInUser && loggedInUser.nickname) {
        // 이전 닉네임을 placeholder로 설정
        nicknameInput.placeholder = `현재 닉네임: ${loggedInUser.nickname}`;
    }

    profileForm.addEventListener('submit', async e => {
        e.preventDefault();

        if (!loggedInUser) {
            alert('로그인이 필요합니다.');
            return;
        }

        const nickname = nicknameInput.value; // 닉네임 입력값
        const profileFile = document.getElementById('profile').files[0]; // 프로필 이미지 파일

        const formData = new FormData();
        formData.append('email', loggedInUser.email); // 이메일 추가
        formData.append('nickname', nickname); // 닉네임 추가
        if (profileFile) {
            formData.append('profile', profileFile); // 이미지 파일 추가
        }

        try {
            const response = await fetch(
                'http://localhost:3001/api/user/profile',
                {
                    method: 'PUT',
                    body: formData,
                },
            );

            const result = await response.json();
            if (result.success) {
                // localStorage에 수정된 정보 업데이트
                localStorage.setItem(
                    'loggedInUser',
                    JSON.stringify(result.data),
                );
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
