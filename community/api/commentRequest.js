import { getServerUrl, getCookie} from '../utils/function.js';

export const deleteComment = (postId, commentId) => {
    const result = fetch(
        `${getServerUrl()}/posts/${postId}/comments/${commentId}`,
        {
            method: 'DELETE',
            headers: {
                session: getCookie('session'),
                userid: getCookie('userOd'),
            },
        },
    );
    return result;
};

export const updateComment = (postId, commentId, commentContent) => {
    const result = fetch(
        `${getServerUrl()}/posts/${postId}/comments/${commentId}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                session: getCookie('session'),
                userid: getCookie('userId'),
            },
            body: JSON.stringify(commentContent),
        },
    );
    return result;
};