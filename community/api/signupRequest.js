const API_URL = 'http://localhost:3001/api'; // API URL 수정

export async function signupRequest(formData) {
    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // JSON 데이터 전송
            body: JSON.stringify(Object.fromEntries(formData)), // FormData -> JSON 변환
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '서버 응답 실패');
        }

        return await response.json();
    } catch (error) {
        console.error('회원가입 요청 중 오류 발생:', error);
        throw error;
    }
}
