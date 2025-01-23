export async function loginRequest(email, password) {
    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'  
        });
        console.log('🔍 로그인 응답:', response);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '로그인 실패');
        }

        return await response.json();
    } catch (error) {
        console.error('로그인 요청 오류:', error);
        throw error;
    }
}
