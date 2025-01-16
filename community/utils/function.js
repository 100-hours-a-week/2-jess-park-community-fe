export async function checkLoginStatus() {
    try {
        const email = localStorage.getItem('userEmail'); // 로컬 스토리지에서 사용자 이메일 가져오기
        if (!email) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login.html';
            return null;
        }

        const response = await fetch('http://localhost:3001/api/auth/check', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'x-email': email, // 요청 헤더에 이메일 추가
            },
        });

        if (response.status === 200) {
            const result = await response.json();
            if (result.success) {
                return result.session;
            }
        }
    } catch (error) {
        console.error('세션 확인 중 오류:', error);
    }

    alert('로그인이 필요합니다.');
    window.location.href = '/login.html';
    return null;
}
