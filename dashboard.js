document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.removeItem('token'); // Clear token
    window.location.href = '/login.html'; // Redirect to login
});
