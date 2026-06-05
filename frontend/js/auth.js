const API_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'dashboard.html';
    }

    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.access_token);
                window.location.href = 'dashboard.html';
            } else {
                errorDiv.innerText = 'Invalid username or password.';
            }
        } catch (err) {
            errorDiv.innerText = 'Connection error. Ensure backend is running.';
        }
    });
});
