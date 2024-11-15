async function loadTransactions() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://your-backend-url/fetch_transactions', {
            headers: { Authorization: `Bearer ${token}` },
        });
        const { transactions } = await response.json();

        const tableBody = document.querySelector('#transactionTable tbody');
        tableBody.innerHTML = '';
        transactions.forEach(txn => {
            const row = `
                <tr>
                    <td>${txn.date}</td>
                    <td>${txn.description}</td>
                    <td>${txn.category}</td>
                    <td>${txn.amount}</td>
                </tr>`;
            tableBody.insertAdjacentHTML('beforeend', row);
        });
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}
document.addEventListener('DOMContentLoaded', loadTransactions);
