import { getServerUrl, getCurrentSession } from '../utils/function.js';

export const getPost = async (postId) => {
    try {
        if (!postId) {
            throw new Error('게시글 ID가 필요합니다.');
        }

        const session = getCurrentSession();
        if (!session) {
            throw new Error('로그인이 필요합니다.');
        }

        console.log('게시글 조회 요청:', {
            postId,
            session
        });

        const response = await fetch(`${getServerUrl()}/api/posts/${postId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.sessionId}`,
                'userId': session.userId
            }
        });

        if (!response.ok) {
            throw new Error('게시글을 불러오는데 실패했습니다.');
        }

        return response;
    } catch (error) {
        console.error('API 요청 상세 정보:', error);
        throw error;
    }
};

export const deletePost = async (postId) => {
    try {
        const session = getCurrentSession();
        if (!session) throw new Error('로그인이 필요합니다.');

        console.log('삭제 요청:', { postId, userId: session.userId });

        const response = await fetch(`${getServerUrl()}/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.sessionId}`,
                'userId': session.userId
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '게시글 삭제에 실패했습니다.');
        }

        return await response.json();
    } catch (error) {
        console.error('게시글 삭제 오류:', error);
        throw error;
    }
};

export const writeComment = async (pageId, comment) => {
    const session = getCurrentSession();
    if (!session) throw new Error('로그인이 필요합니다.');

    const response = await fetch(`${getServerUrl()}/api/posts/${pageId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.sessionId}`,
            'userId': session.userId
        },
        body: JSON.stringify({ commentContent: comment })
    });

    if (!response.ok) {
        throw new Error('댓글 작성에 실패했습니다.');
    }

    return response.json();
};

export const getBoardComment = async (postId) => {
    try {
        const session = getCurrentSession();
        if (!session) throw new Error('로그인이 필요합니다.');

        const response = await fetch(`${getServerUrl()}/api/posts/${postId}/comments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.sessionId}`,
                'userId': session.userId
            }
        });

        if (!response.ok) {
            throw new Error('댓글을 불러오는데 실패했습니다.');
        }

        return response.json();
    } catch (error) {
        console.error('댓글 조회 오류:', error);
        throw error;
    }
};

export const updateComment = async (postId, commentId, content) => {
    try {
        const session = getCurrentSession();
        if (!session) throw new Error('로그인이 필요합니다.');

        const response = await fetch(`${getServerUrl()}/api/posts/${postId}/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.sessionId}`,
                'userId': session.userId
            },
            body: JSON.stringify({ commentContent: content })
        });

        if (!response.ok) {
            throw new Error('댓글 수정에 실패했습니다.');
        }

        return response.json();
    } catch (error) {
        console.error('댓글 수정 오류:', error);
        throw error;
    }
};

export const deleteComment = async (postId, commentId) => {
    try {
        const session = getCurrentSession();
        if (!session) throw new Error('로그인이 필요합니다.');

        console.log('댓글 삭제 요청:', { postId, commentId });

        const response = await fetch(`${getServerUrl()}/api/posts/${postId}/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.sessionId}`,
                'userId': session.userId
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '댓글 삭제에 실패했습니다.');
        }

        return response.json();
    } catch (error) {
        console.error('댓글 삭제 오류:', error);
        throw error;
    }
};

export const updatePost = async (postId, postData) => {
    try {
        const session = getCurrentSession();
        if (!session) throw new Error('로그인이 필요합니다.');

        const response = await fetch(`${getServerUrl()}/api/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.sessionId}`,
                'userId': session.userId
            },
            body: JSON.stringify(postData)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || '게시글 수정에 실패했습니다.');
        }

        return data;
    } catch (error) {
        console.error('게시글 수정 오류:', error);
        throw error;
    }
};