const API_BASE_URL = 'http://localhost:3002/api';

// 공통 응답 처리 함수
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error.message || 'Unknown error');
        throw new Error(error.message || '요청 처리 실패');
    }
    return await response.json();
};

// 게시글 작성
export const createPost = async (postData) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
    });
    return await handleResponse(response);
};

// 게시글 수정
export const updatePost = async (postId, postData) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
    });
    return await handleResponse(response);
};

// 게시글 조회
export const fetchPostById = async (postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
    if (!response.ok) {
        throw new Error('게시글 조회 실패');
    }
    return await response.json();
};

