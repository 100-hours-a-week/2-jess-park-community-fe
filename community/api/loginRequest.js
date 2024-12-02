import { getAuthServerUrl } from '../utils/function.js';

export const loginUser = async (email, password) => {
    try {
        console.log('Attempting login with:', { 
            email, 
            hasPassword: !!password 
        });

        const response = await fetch(`${getAuthServerUrl()}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            }),
            credentials: 'include'
        });

        const data = await response.json();
        console.log('Server response:', {
            status: response.status,
            data
        });

        if (!response.ok) {
            throw new Error(data.message || '로그인에 실패했습니다.');
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};