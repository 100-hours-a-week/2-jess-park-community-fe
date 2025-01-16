export async function modifyPassword(email, currentPassword, newPassword) {
    try {
        // 비밀번호 변경 요청
        const response = await fetch('http://localhost:3001/api/user/password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, currentPassword, newPassword }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message || '비밀번호 변경 요청에 실패했습니다.');
            return false;
        }

        const result = await response.json();

        if (result.success) {
            // 로컬 스토리지 업데이트
            const userInfo = JSON.parse(localStorage.getItem('loggedInUser'));
            if (userInfo) {
                userInfo.password = newPassword; // 비밀번호는 보통 저장하지 않지만 예제용으로 추가
                localStorage.setItem('loggedInUser', JSON.stringify(userInfo));
            }
            alert('비밀번호가 성공적으로 변경되었습니다.');
            return true;
        } else {
            alert(result.message);
            return false;
        }
    } catch (error) {
        console.error('비밀번호 변경 중 오류:', error);
        alert('비밀번호 변경에 실패했습니다.');
        return false;
    }
}
