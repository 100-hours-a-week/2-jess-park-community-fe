const API_BASE_URL = 'http://localhost:3002/api';

// 공통 응답 처리 함수
const handleResponse = async response => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '요청 처리 실패');
    }
    return await response.json();
};

// 게시글 데이터 가져오기
export const getPostData = async postId => {
    const requestUrl = `${API_BASE_URL}/posts/${postId}`;
    try {
        const response = await fetch(requestUrl);
        if (!response.ok) {
            throw new Error(
                `게시글 데이터를 가져오는 데 실패했습니다. 상태 코드: ${response.status}`,
            );
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// 게시글 목록 가져오기
export const fetchPosts = async (start = 0, limit = 10) => {
    const requestUrl = `${API_BASE_URL}/posts?start=${start}&limit=${limit}`;
    try {
        const response = await fetch(requestUrl);
        if (!response.ok) {
            throw new Error('게시글 목록을 가져오는 데 실패했습니다.');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// 좋아요 업데이트
export const updateLikes = async postId => {
    const requestUrl = `${API_BASE_URL}/posts/${postId}/likes`;
    try {
        const response = await fetch(requestUrl, { method: 'PATCH' });
        if (!response.ok) {
            throw new Error('좋아요를 업데이트하는 데 실패했습니다.');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// 댓글 가져오기
export const fetchComments = async postId => {
    const requestUrl = `${API_BASE_URL}/posts/${postId}/comments`;
    try {
        const response = await fetch(requestUrl);
        if (!response.ok) {
            throw new Error('댓글을 가져오는 데 실패했습니다.');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// 댓글 추가
export const addComment = async (postId, content) => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!user || !user.nickname) {
        alert('로그인이 필요합니다.');
        throw new Error('로그인이 필요합니다.');
    }

    const requestUrl = `${API_BASE_URL}/posts/${postId}/comments`;
    try {
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, author: user.nickname }),
        });

        if (!response.ok) {
            throw new Error('댓글 추가에 실패했습니다.');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// 댓글 삭제
export const removeComment = async (postId, commentId) => {
    const requestUrl = `${API_BASE_URL}/posts/${postId}/comments/${commentId}`;
    try {
        const response = await fetch(requestUrl, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error('댓글 삭제에 실패했습니다.');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// 댓글 수정
export const updateComment = async (postId, commentId, content) => {
    const requestUrl = `${API_BASE_URL}/posts/${postId}/comments/${commentId}`;
    try {
        const response = await fetch(requestUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        });

        if (!response.ok) {
            throw new Error('댓글 수정에 실패했습니다.');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};
