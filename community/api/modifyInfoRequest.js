import { getAuthServerUrl, getCookie, getCurrentSession } from '../utils/function.js';

export const userModify = async (userId, changeData) => {
    try {
        const session = getCurrentSession();
        if (!session?.sessionId) {
            throw new Error('세션이 만료되었습니다.');
        }

        const response = await fetch(`${getAuthServerUrl()}/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.sessionId}`
            },
            body: JSON.stringify({
                nickname: changeData.nickname,
                profileImagePath: changeData.profileImagePath
            }),
            credentials: 'include'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || '수정에 실패했습니다.');
        }

        return response;
    } catch (error) {
        console.error('사용자 정보 수정 오류:', error);
        throw error;
    }
};

export const userDelete = async userId => {
    try {
        const response = await fetch(`${getAuthServerUrl()}/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie('sessionId')}`
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || '회원 탈퇴에 실패했습니다.');
        }

        return response;
    } catch (error) {
        console.error('회원 탈퇴 오류:', error);
        throw error;
    }
};
