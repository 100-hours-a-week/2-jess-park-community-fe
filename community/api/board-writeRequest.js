import { getServerUrl, getCurrentSession } from '../utils/function.js';

export const createPost = async (postData) => {
    try {
        const session = getCurrentSession();
        if (!session) {
            throw new Error('로그인이 필요합니다.');
        }

        const requestBody = {
            title: postData.postTitle,
            content: postData.postContent,
            author: session.userName
        };

        console.log('Sending request:', requestBody);

        const response = await fetch(`${getServerUrl()}/api/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.sessionId}`,
                'userId': session.userId
            },
            body: JSON.stringify(requestBody)
        });

        return response;
    } catch (error) {
        console.error('게시글 작성 오류:', error);
        throw error;
    }
};

export const fileUpload = async (formData) => {
    try {
        const session = getCurrentSession();
        if (!session) {
            throw new Error('로그인이 필요합니다.');
        }

        const response = await fetch(`${getServerUrl()}/api/posts/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.sessionId}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('파일 업로드에 실패했습니다.');
        }

        return response;
    } catch (error) {
        console.error('파일 업로드 오류:', error);
        throw error;
    }
};

export const updatePost = async (postId, postData) => {
    try {
        const session = getCurrentSession();
        if (!session) {
            throw new Error('로그인이 필요합니다.');
        }

        console.log('수정 요청 데이터:', {
            postId,
            postData,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.sessionId}`,
                'userId': session.userId
            }
        });

        const response = await fetch(`${getServerUrl()}/api/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.sessionId}`,
                'userId': session.userId
            },
            body: JSON.stringify(postData)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || '게시글 수정에 실패했습니다.');
        }

        return result;

    } catch (error) {
        console.error('게시글 수정 오류:', error);
        throw error;
    }
};

export const getBoardItem = async (postId) => {
    try {
        const session = getCurrentSession();
        if (!session) {
            throw new Error('로그인이 필요합니다.');
        }

        const response = await fetch(`${getServerUrl()}/api/posts/${postId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${session.sessionId}`
            }
        });

        if (!response.ok) {
            throw new Error('게시글을 불러오는데 실패했습니다.');
        }

        return response;
    } catch (error) {
        console.error('게시글 조회 오류:', error);
        throw error;
    }
};


