fetch('https://your-backend-domain/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
    }),
})
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed');
        }
        return response.json();
    })
    .then(data => {
        // Save the token in localStorage
        localStorage.setItem('token', data.access_token);
        // Redirect to the dashboard
        window.location.href = '/dashboard.html';
    })
    .catch(error => {
        console.error('Error during login:', error);
        alert('Invalid credentials. Please try again.');
    });
