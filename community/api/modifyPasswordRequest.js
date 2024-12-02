import { getAuthServerUrl, getCurrentSession } from '../utils/function.js';

/**
 * 사용자 비밀번호 변경 요청
 * @param {string} userId - 사용자 ID
 * @param {string} newPassword - 새 비밀번호
 * @param {string} currentPassword - 현재 비밀번호
 * @returns {Promise<Response>} 서버 응답
 */
export const changePassword = async (userId, newPassword, currentPassword) => {
    try {
        if (!userId || !newPassword || !currentPassword) {
            throw new Error('필수 입력값이 누락되었습니다.');
        }

        const session = getCurrentSession();
        if (!session?.sessionId) {
            throw new Error('세션이 만료되었습니다.');
        }

        // 디버깅을 위한 로그
        console.log('Sending password change request:', {
            userId,
            url: `${getAuthServerUrl()}/api/users/${userId}/password`
        });

        const response = await fetch(`${getAuthServerUrl()}/api/users/${userId}/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.sessionId}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            }),
            credentials: 'include'
        });

        // 응답 로그
        console.log('Server response status:', response.status);

        if (!response.ok) {
            const text = await response.text();
            console.error('Server error response:', text);
            try {
                const data = JSON.parse(text);
                throw new Error(data.message || '비밀번호 변경에 실패했습니다.');
            } catch (e) {
                throw new Error('서버 응답을 처리할 수 없습니다.');
            }
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        throw error;
    }
};
