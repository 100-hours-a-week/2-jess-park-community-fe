export async function modifyPassword(currentPassword, newPassword) {
    try {
        // 비밀번호 변경 요청
        const response = await fetch(
            'http://localhost:3001/api/user/password',
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
                credentials: 'include'  // 쿠키 세션을 포함
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message || '비밀번호 변경 요청에 실패했습니다.');
            return false;
        }

        const result = await response.json();

        if (result.success) {
            alert('비밀번호가 성공적으로 변경되었습니다.');
            return true;
        }
        alert(result.message);
        return false;
    } catch (error) {
        console.error('비밀번호 변경 중 오류:', error);
        alert('비밀번호 변경에 실패했습니다.');
        return false;
    }
}
