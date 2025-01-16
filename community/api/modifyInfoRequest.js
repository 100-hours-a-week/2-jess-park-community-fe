const BASE_URL = 'http://localhost:3001';

export async function updateUserProfile(formData) {
    try {
        console.log('Sending request to:', `${BASE_URL}/api/user/profile`);
        
        const response = await fetch(`${BASE_URL}/api/user/profile`, {
            method: 'PUT',
            body: formData
        });

        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response result:', result);

        if (result.success) {
            // localStorage 업데이트
            localStorage.setItem('userInfo', JSON.stringify(result.user));
            return { 
                success: true, 
                user: result.user 
            };
        } else {
            return { 
                success: false, 
                message: result.message 
            };
        }
    } catch (error) {
        console.error('프신 중 오류:', error);
        return { 
            success: false, 
            message: '프로필 업데이트에 실패했습니다.' 
        };
    }
}