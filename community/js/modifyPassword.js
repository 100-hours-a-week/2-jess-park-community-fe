document.addEventListener('DOMContentLoaded', () => {
    const passwordForm = document.getElementById('passwordForm');
    if (!passwordForm) {
        console.error('passwordForm element not found');
        return;
    }

    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login.html';
            return;
        }

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            return;
        }

        const requestBody = {
            email: loggedInUser.email,
            currentPassword: currentPassword,
            newPassword: newPassword,
        };

        try {
            console.log('비밀번호 변경 요청 데이터:', requestBody);

            const response = await fetch('http://localhost:3001/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('서버 응답 오류:', error);
                alert(error.message || '비밀번호 변경 요청에 실패했습니다.');
                return;
            }

            const result = await response.json();
            console.log('비밀번호 변경 성공:', result);

            if (result.success) {
                loggedInUser.password = newPassword; // 비밀번호는 보안상 저장하지 않는 것이 권장됨
                localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
                alert('비밀번호가 성공적으로 변경되었습니다.');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('비밀번호 변경 중 오류:', error);
            alert('비밀번호 변경에 실패했습니다.');
        }
    });
});
