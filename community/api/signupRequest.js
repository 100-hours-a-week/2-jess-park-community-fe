import { getAuthServerUrl } from '../utils/function.js';

export const userSignup = async (signupData) => {
    try {
        const response = await fetch(`${getAuthServerUrl()}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: signupData.email,
                password: signupData.password,
                name: signupData.nickname,
                profileImagePath: signupData.profileImagePath
            })
        });
        
        return response;
    } catch (error) {
        console.error('Signup error:', error);
        throw error;
    }
};

export const checkEmail = async (email) => {
    return fetch(`${getAuthServerUrl()}/api/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
};

export const checkNickname = async (nickname) => {
    return fetch(`${getAuthServerUrl()}/api/check-nickname`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname })
    });
};

export const fileUpload = async (formData) => {
    return fetch(`${getAuthServerUrl()}/api/upload`, {
        method: 'POST',
        body: formData
    });
};
