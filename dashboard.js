const baseURL = "https://us-east1-plasma-block-441317-m4.cloudfunctions.net/budgetingappfunction";

document.addEventListener("DOMContentLoaded", () => {
  // Check if the user is authenticated
  const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
  if (!token) {
    // Redirect to login page if no token is found
    window.location.href = "login.html";
  } else {
    // Validate the token with the backend
    fetch(`${baseURL}/check_auth`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Token validation failed");
        }
        return response.json();
      })
      .then((data) => {
        console.log("User is authenticated:", data);
        // Load dashboard data if authenticated
        fetchBudgetData();
      })
      .catch((error) => {
        console.error("Authentication error:", error);
        localStorage.removeItem("token"); // Clear invalid token
        window.location.href = "login.html"; // Redirect to login page
      });
  }

  // Set up logout functionality
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }

  // Set up modal functionality
  setupModalManagement();
});

// Centralized Fetch Request Handler
async function fetchData(endpoint, method = 'GET', body = null) {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseURL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : null,
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error with ${endpoint}:`, error);
    throw error;
  }
}

// Logout Function
function handleLogout() {
  fetch(`${baseURL}/logout`, { method: 'POST' })
    .then((response) => {
      if (response.ok) {
        localStorage.clear();
        window.location.href = "login.html";
      } else {
        alert("Logout failed. Please try again.");
      }
    })
    .catch((error) => console.error("Logout error:", error));
}

// Fetch and Display Budget Data
function fetchBudgetData() {
  fetchData('/transactions/get_budget_data', 'POST', { user_id: localStorage.getItem('user_id') })
    .then(displayBudgetData)
    .catch((error) => console.error("Error fetching budget data:", error));
}

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

  const rows = Object.values(data)
    .map((transaction) => `
      <tr id="transaction-${transaction.id}">
        <td>${new Date(transaction.date).toISOString().split('T')[0]}</td>
        <td>${transaction.description}</td>
        <td>${transaction.category}</td>
        <td>${transaction.amount}</td>
        <td>
          <button onclick="editTransaction(${transaction.id})">Edit</button>
          <button class="red-btn" onclick="removeTransaction(${transaction.id})">Remove</button>
        </td>
      </tr>
    `)
    .join("");
  budgetSummary.innerHTML = rows;
}

// Modal Management
function setupModalManagement() {
  const modals = document.querySelectorAll(".modal");
  const closeButtons = document.querySelectorAll(".close");

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      toggleModal(button.closest(".modal").id, false);
    });
  });

  window.addEventListener("click", (event) => {
    modals.forEach((modal) => {
      if (event.target === modal) toggleModal(modal.id, false);
    });
  });

  document.getElementById("addTransactionBtn").addEventListener("click", () => toggleModal("addTransactionModal", true));
}

function toggleModal(modalId, show) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = show ? "block" : "none";
}
