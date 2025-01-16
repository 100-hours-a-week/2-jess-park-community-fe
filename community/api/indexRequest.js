import { getServerUrl, getCurrentSession } from '../utils/function.js';

export const getPosts = async (offset = 0, limit = 5) => {
    const session = getCurrentSession();
    if (!session) throw new Error('No session found');

    console.log('Fetching posts with session:', session);

    const response = await fetch(`${getServerUrl()}/api/posts?offset=${offset}&limit=${limit}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.sessionId}`,
            'userId': session.userId
        }
    });

    console.log('Response status:', response.status);

    return response;
};