document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Basic client-side validation
    if (!email || !password) {
        alert('Both email and password are required.');
        return;
    }

    try {
        const response = await fetch('https://moniflow.io/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        alert('Signup successful! Please log in.');
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Error signing up:', error);
        alert(error.message || 'An error occurred during signup. Please try again.');
    }
});
