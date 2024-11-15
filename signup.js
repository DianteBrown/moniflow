document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://your-backend-url/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
            alert('Signup successful! Please log in.');
            window.location.href = '/login.html';
        } else {
            alert(data.error || 'Signup failed');
        }
    } catch (error) {
        console.error('Error signing up:', error);
    }
});
