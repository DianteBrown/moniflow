document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form from submitting normally

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('https://your-backend-domain/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed');
            }
            return response.json();
        })
        .then(data => {
            // Save the token or user ID in localStorage
            if (data.access_token) {
                localStorage.setItem('token', data.access_token); // For token-based authentication
            } else if (data.user_id) {
                localStorage.setItem('user_id', data.user_id); // For session-based authentication
            }

            // Redirect to the dashboard
            window.location.href = '/dashboard.html';
        })
        .catch(error => {
            console.error('Error during login:', error);
            alert('Invalid credentials. Please try again.');
        });
});
