document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !email || !password) {
        alert('All fields are required.');
        return;
    }

    try {
        const response = await fetch('https://us-east1-plasma-block-441317-m4.cloudfunctions.net/budgetingappfunction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        alert('Signup successful! Please log in.');
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Error signing up:', error.message);
        alert(error.message || 'An error occurred during signup. Please try again.');
    }
});
