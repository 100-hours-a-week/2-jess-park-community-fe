const API_BASE_URL = 'http://localhost:3002/api';

export const fetchPosts = async (start = 0, limit = 10) => {
    try {
        const response = await fetch(`${API_BASE_URL}/posts?start=${start}&limit=${limit}`);
        if (!response.ok) throw new Error('게시글 목록을 가져오는 데 실패했습니다.');
        return await response.json();
    } catch (error) {
        console.error("fetchPosts Error:", error);
        return { success: false, data: [] };
    }
};

export const createPost = async (postData, token) => {  
    try {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) throw new Error('게시글 작성 실패');
        return await response.json();
    } catch (error) {
        console.error("createPost Error:", error);
        return { success: false, data: null };
    }
};

export const updatePost = async (postId, postData, token) => { 
    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) throw new Error('게시글 수정 실패');
        return await response.json();
    } catch (error) {
        console.error("updatePost Error:", error);
        return { success: false, data: null };
    }
};
