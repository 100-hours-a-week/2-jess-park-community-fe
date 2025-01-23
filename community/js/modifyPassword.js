document.addEventListener('DOMContentLoaded', () => {
    const passwordForm = document.getElementById('passwordForm');
    if (!passwordForm) {
        console.error('passwordForm element not found');
        return;
    }

    passwordForm.addEventListener('submit', async e => {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            return;
        }

        const requestBody = { currentPassword, newPassword };

        try {
            const response = await fetch('http://localhost:3001/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                credentials: 'include',  // JWT 쿠키 포함
            });

            if (!response.ok) {
                let errorMessage = '비밀번호 변경 요청에 실패했습니다.';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (error) {
                    console.error('JSON 파싱 오류:', error);
                }
                alert(errorMessage);
                return;
            }

            const result = await response.json();
            if (result.success) {
                alert('비밀번호가 성공적으로 변경되었습니다.');
                window.location.href = 'index.html';
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('비밀번호 변경 중 오류:', error);
            alert('비밀번호 변경에 실패했습니다.');
        }
    });
});
