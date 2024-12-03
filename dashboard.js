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
});

// Reusable function to handle fetch requests
async function fetchData(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    };
    const response = await fetch(`${baseURL}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// Fetch budgeting data
function fetchBudgetData() {
  fetchData('/transactions/get_budget_data', 'POST', {'user_id': localStorage.getItem('user_id')})
    .then(displayBudgetData)
    .catch(error => {
      console.error("Error fetching budget data:", error);
    });
}

// Display budgeting data on the page
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

  const listItems = Object.values(data)
    .map((data) => `<li>${data.category}: $${data.amount}</li>`)
    .join('');
  budgetSummary.innerHTML = `<ul>${listItems}</ul>`;
}

// Handle user logout
function handleLogout() {
  localStorage.removeItem('token'); // Clear token
  window.location.href = 'login.html'; // Redirect to login
}
