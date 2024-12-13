const baseURL = "https://us-east1-plasma-block-441317-m4.cloudfunctions.net/budgetingappfunction";

document.addEventListener("DOMContentLoaded", () => {
  // Check authentication status
  fetchData('/check_auth', 'POST')
    .then(() => {
      console.log("Authentication successful");
      fetchBudgetData();
    })
    .catch(() => {
      window.location.href = "login.html";
    });

  // Set up logout functionality
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }

  // Set up modal functionality
  setupModalManagement();
});

// Centralized API Request Handler
async function fetchData(endpoint, method = 'GET', body = null) {
  try {
    const response = await fetch(`${baseURL}${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : null,
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error with ${endpoint}:`, error);
    throw error;
  }
}

// Logout User
function handleLogout() {
  fetch(`${baseURL}/logout`, { method: 'POST' })
    .then((response) => {
      if (response.ok) {
        localStorage.clear();
        window.location.href = 'login.html';
      } else {
        alert('Logout failed. Please try again.');
      }
    })
    .catch((error) => console.error('Logout error:', error));
}

// Fetch Budget Data
function fetchBudgetData() {
  fetchData('/transactions/get_budget_data', 'POST', { user_id: localStorage.getItem('user_id') })
    .then(displayBudgetData)
    .catch((error) => console.error("Error fetching budget data:", error));
}

// Display Budget Data
function displayBudgetData(data) {
  const budgetSummary = document.getElementById("budget-summary");
  if (!budgetSummary) {
    console.error("Budget summary element not found.");
    return;
  }

  if (!data || Object.keys(data).length === 0) {
    budgetSummary.innerHTML = "<p>No budget data available.</p>";
    return;
  }

  localStorage.setItem('data', JSON.stringify(data));
  const rows = Object.values(data).map(renderBudgetRow).join('');
  budgetSummary.innerHTML = rows;
}

function renderBudgetRow(data) {
  return `
    <tr id="transaction-${data.id}">
      <td>${new Date(data.date).toISOString().split('T')[0]}</td>
      <td>${data.description}</td>
      <td>${data.category}</td>
      <td>${data.amount}</td>
      <td>
        <button onclick="showEditButton(${data.id})" id="show-edit-btn-${data.id}">Edit</button>
        <button onclick="editTransaction(${data.id})" id="edit-transaction-${data.id}" hidden>Submit</button>
        <button class="red-btn" onclick="removeTransaction(${data.id})">Remove</button>
      </td>
    </tr>`;
}

// Add Transaction
function addTransaction() {
  const date = document.getElementById('new-date').value;
  const description = document.getElementById('new-description').value;
  const category = document.getElementById('new-category').value;
  const amount = document.getElementById('new-amount').value;

  if (!date || !description || !category || amount <= 0) {
    alert("Please fill in all fields correctly.");
    return;
  }

  fetchData('/transactions/add_budget_data', 'POST', {
    user_id: localStorage.getItem('user_id'),
    date, description, category, amount
  })
    .then((data) => {
      document.getElementById("addTransactionModal").style.display = "none";
      alert(data.message);
      fetchBudgetData();
    })
    .catch((err) => console.error("Error adding budget data:", err));
}

// Remove Transaction
function removeTransaction(id) {
  fetchData('/transactions/remove_budget_data', 'POST', { user_id: localStorage.getItem('user_id'), transaction_id: id })
    .then(() => {
      document.getElementById(`transaction-${id}`).remove();
      alert("Transaction removed successfully.");
    })
    .catch((err) => console.error("Error removing transaction:", err));
}

// Edit Transaction
function editTransaction(id) {
  const date = document.getElementById(`edit-date-${id}`).value;
  const description = document.getElementById(`edit-description-${id}`).value;
  const category = document.getElementById(`edit-category-${id}`).value;
  const amount = document.getElementById(`edit-amount-${id}`).value;

  fetchData('/transactions/edit_budget_data', 'POST', {
    user_id: localStorage.getItem('user_id'),
    transaction_id: id, date, description, category, amount
  })
    .then(() => {
      setInnerHTML(id, date, description, category, amount);
      alert("Transaction updated successfully.");
    })
    .catch((err) => console.error("Error editing transaction:", err));
}

// Helper to Update DOM with Edited Transaction
function setInnerHTML(id, date, description, category, amount) {
  document.getElementById(`transaction-date-${id}`).innerHTML = date;
  document.getElementById(`transaction-description-${id}`).innerHTML = description;
  document.getElementById(`transaction-category-${id}`).innerHTML = category;
  document.getElementById(`transaction-amount-${id}`).innerHTML = amount;
}

// Modal Management
function setupModalManagement() {
  const modals = document.querySelectorAll(".modal");
  const closeButtons = document.querySelectorAll(".close");

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      toggleModal(button.closest('.modal').id, false);
    });
  });

  window.addEventListener("click", (event) => {
    modals.forEach((modal) => {
      if (event.target === modal) toggleModal(modal.id, false);
    });
  });

  document.getElementById("addTransactionBtn").addEventListener("click", () => toggleModal('addTransactionModal', true));
}

// Toggle Modal Display
function toggleModal(modalId, show) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = show ? 'block' : 'none';
}
