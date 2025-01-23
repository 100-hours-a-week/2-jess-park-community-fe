export default async function signupRequest(formData) {
    try {
        console.log("회원가입 요청 데이터:", [...formData.entries()]);  // ✅ 전송 데이터 확인

        const response = await fetch('http://localhost:3001/api/signup', {
            method: 'POST',
            body: formData,  
            credentials: 'include', 
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '회원가입 실패');
        }

        return await response.json();
    } catch (error) {
        console.error('회원가입 요청 오류:', error);
        throw error;
    }
}
