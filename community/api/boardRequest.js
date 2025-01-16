const API_BASE_URL = 'http://localhost:3002/api';

// 게시글 데이터 가져오기
export const getPostData = async (postId) => {
    const requestUrl = `${API_BASE_URL}/posts/${postId}`;
    try {
        console.log('Fetching post data for ID:', postId); // 디버깅 로그
        const response = await fetch(requestUrl);

        if (!response.ok) {
            throw new Error(`게시글 데이터를 가져오는 데 실패했습니다. 상태 코드: ${response.status}`);
        }

        const data = await response.json();
        console.log('Post Data:', data); // 디버깅 로그
        return data;
    } catch (error) {
        console.error('API 요청 오류:', error.message);
        throw error;
    }
};

// 게시글 목록 가져오기
export const fetchPosts = async (start = 0, limit = 10) => {
    const requestUrl = `${API_BASE_URL}/posts?start=${start}&limit=${limit}`;
    try {
        console.log('Fetching posts list from:', requestUrl); // 디버깅 로그
        const response = await fetch(requestUrl);

        if (!response.ok) {
            throw new Error('게시글 목록을 가져오는 데 실패했습니다.');
        }

        const data = await response.json();
        console.log('Fetched Posts:', data); // 디버깅 로그
        return data;
    } catch (error) {
        console.error('게시글 목록 요청 오류:', error.message);
        throw error;
    }
};

// 좋아요 업데이트
export const updateLikes = async (postId) => {
    const requestUrl = `${API_BASE_URL}/posts/${postId}/likes`;
    try {
        console.log('Updating likes for post ID:', postId); // 디버깅 로그
        const response = await fetch(requestUrl, { method: 'PATCH' });

        if (!response.ok) {
            throw new Error('좋아요를 업데이트하는 데 실패했습니다.');
        }

        const data = await response.json();
        console.log('Updated Likes:', data); // 디버깅 로그
        return data;
    } catch (error) {
        console.error('좋아요 업데이트 오류:', error.message);
        throw error;
    }
};

// 댓글 가져오기
export const fetchComments = async (postId) => {
    const requestUrl = `${API_BASE_URL}/posts/${postId}/comments`;
    try {
        console.log('Fetching comments for post ID:', postId); // 디버깅 로그
        const response = await fetch(requestUrl);

        if (!response.ok) {
            throw new Error('댓글을 가져오는 데 실패했습니다.');
        }

        const data = await response.json();
        console.log('Fetched Comments:', data); // 디버깅 로그
        return data;
    } catch (error) {
        console.error('댓글 요청 오류:', error.message);
        throw error;
    }
};

// 댓글 추가
export const addComment = async (postId, content) => {
    const user = JSON.parse(localStorage.getItem('loggedInUser')); // 작성자 정보 가져오기
    if (!user || !user.nickname) {
        alert('로그인이 필요합니다.');
        throw new Error('로그인이 필요합니다.');
    }

    const requestUrl = `${API_BASE_URL}/posts/${postId}/comments`;
    try {
        console.log('Adding comment:', { postId, content, author: user.nickname }); // 디버깅 로그
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, author: user.nickname }),
        });

        if (!response.ok) {
            throw new Error('댓글 추가에 실패했습니다.');
        }

        const data = await response.json();
        console.log('Added Comment:', data); // 디버깅 로그
        return data;
    } catch (error) {
        console.error('댓글 추가 오류:', error.message);
        throw error;
    }
};

// 댓글 삭제
export const removeComment = async (postId, commentId) => {
    const requestUrl = `${API_BASE_URL}/posts/${postId}/comments/${commentId}`;
    try {
        console.log('Removing comment:', { postId, commentId }); // 디버깅 로그
        const response = await fetch(requestUrl, { method: 'DELETE' });

        if (!response.ok) {
            throw new Error('댓글 삭제에 실패했습니다.');
        }

        const data = await response.json();
        console.log('Removed Comment:', data); // 디버깅 로그
        return data;
    } catch (error) {
        console.error('댓글 삭제 오류:', error.message);
        throw error;
    }
};

// 댓글 수정
export const updateComment = async (postId, commentId, content) => {
    const requestUrl = `${API_BASE_URL}/posts/${postId}/comments/${commentId}`;
    try {
        console.log('Updating comment:', { postId, commentId, content }); // 디버깅 로그
        const response = await fetch(requestUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        });

        if (!response.ok) {
            throw new Error('댓글 수정에 실패했습니다.');
        }

        const data = await response.json();
        console.log('Updated Comment:', data); // 디버깅 로그
        return data;
    } catch (error) {
        console.error('댓글 수정 오류:', error.message);
        throw error;
    }
};
