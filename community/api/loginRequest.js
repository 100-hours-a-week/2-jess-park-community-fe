export async function loginRequest(email, password) {
    const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json();
}
