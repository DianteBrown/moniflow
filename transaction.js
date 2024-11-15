// Fetch transactions from the API and populate the table
async function loadTransactions() {
    try {
        const response = await fetch('/api/transactions');  // Replace with your actual API endpoint
        const transactions = await response.json();

        const tableBody = document.getElementById('transactionTable').querySelector('tbody');
        tableBody.innerHTML = '';  // Clear existing rows

        if (transactions.length === 0) {
            // Display message if no transactions are available
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No transactions available</td></tr>`;
            return;
        }

        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.date}</td>
                <td>${transaction.description}</td>
                <td>${transaction.category}</td>
                <td>${transaction.amount}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading transactions:', error);
        document.querySelector('.transaction-table-container').innerHTML = `<p>Failed to load transactions.</p>`;
    }
}

// Call loadTransactions when the page loads
document.addEventListener('DOMContentLoaded', loadTransactions);
