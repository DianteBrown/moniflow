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

function fetchSummaryData() {
  fetchData('/transactions/get_budget_summary', 'POST', {'user_id': localStorage.getItem('user_id')})
    .then(displayBudgetSummary)
    .catch(error => {
      console.error("Error fetching budget data:", error);
    });
}

function fetchCheckBudget() {
  fetchData('/transactions/check_budget', 'POST', {'user_id': localStorage.getItem('user_id')})
    .then(displayCheckBudget)
    .catch(error => {
      console.error("Error fetching budget data:", error);
    });
}

function addTransaction() {
  const date = document.getElementById('new-date').value;
  const description = document.getElementById('new-description').value;
  const category = document.getElementById('new-category').value;
  const amount = document.getElementById('new-amount').value;

  fetchData('/transactions/add_budget_data', 'POST', {
    user_id: localStorage.getItem('user_id'),
    date,
    description,
    category,
    amount
  })
    .then((data) => {
      document.getElementById("addTransactionModal").style.display = "none";
      alert(data.message);
      fetchBudgetData();
    }).catch(err => {
      console.error("Error adding budget data:", err);
    })
}

function removeTransaction(id) {
  fetchData('/transactions/remove_budget_data', 'POST', {'user_id': localStorage.getItem('user_id'), 'transaction_id': id})
    .then((data) => {
      alert("Transaction removed successfully");
      const transaction = document.getElementById(`transaction-${id}`);
      transaction.remove();
    }).catch(err => {
      console.error("Error removing budget data:", err);
    })
}

function editTransaction(id) {
  console.log('Edit Transaction function called');
  const date = document.getElementById(`edit-date-${id}`).value;
  const description = document.getElementById(`edit-description-${id}`).value;
  const category = document.getElementById(`edit-category-${id}`).value;
  const amount = document.getElementById(`edit-amount-${id}`).value;

  fetchData('/transactions/edit_budget_data', 'POST', {
      user_id: localStorage.getItem('user_id'), 
      transaction_id: id,
      date,
      description,
      category,
      amount
    })
    .then((data) => {
      alert("Transaction Edit successfully");
      setInnerHTML(id, date, description, category, amount);
    }).catch(err => {
      console.error("Error Editting budget data:", err);
    })

  const showButton = document.getElementById(`show-edit-btn-${id}`);
  const editButton = document.getElementById(`edit-transaction-${id}`);
  
  showButton.hidden = false;
  editButton.hidden = true;
}

function showEditButton(index) {
  console.log('showEditButton function called');
  const storedData = JSON.parse(localStorage.getItem('data'));
  const data = storedData[index]
  const showButton = document.getElementById(`show-edit-btn-${data.id}`);
  const editButton = document.getElementById(`edit-transaction-${data.id}`);  

  showButton.hidden = true;
  editButton.hidden = false;

  setInnerHTML(
    data.id,
    `<input type="date" id="edit-date-${data.id}" value="${new Date(data.date).toISOString().split('T')[0]}" />`,
    `<input type="text" id="edit-description-${data.id}" value="${data.description}" />`,
    `<input type="text" id="edit-category-${data.id}" value="${data.category}" />`,
    `<input type="number" id="edit-amount-${data.id}" value="${parseInt(data.amount)}" />`
  );
}

function setInnerHTML(id, date, description, category, amount) {
  const dateElement = document.getElementById(`transaction-date-${id}`);
  const descriptionElement = document.getElementById(`transaction-description-${id}`);
  const categoryElement = document.getElementById(`transaction-category-${id}`);
  const amountElement = document.getElementById(`transaction-amount-${id}`);

  dateElement.innerHTML = `${date}`;
  descriptionElement.innerHTML = `${description}`;
  categoryElement.innerHTML = `${category}`;
  amountElement.innerHTML = `${amount}`;
}

function submitBudgetGoal(category) {
  const budget_goals = JSON.parse(localStorage.getItem('budget-goals'));
  const budget_goal = budget_goals.find((item) => item.category == category);
  const updated_budget_goal = document.getElementById(`updated-budget-goal-${category}`).value;

  document.getElementById(`update-goal-${category}`).hidden = false;
  document.getElementById(`submit-goal-${category}`).hidden = true;
  document.getElementById(`budget-goal-${category}`).innerHTML = updated_budget_goal;

  if ( budget_goal.budget_goal == null) {
    fetchData('/transactions/set_budget_goal', 'POST', {
      user_id: localStorage.getItem('user_id'),
      category,
      budget: updated_budget_goal
    })
      .then((data) => {
        alert(data.message);
        fetchCheckBudget();
      }).catch(err => {
        console.error("Error setting budget goal data:", err);
      })
  } else {
    fetchData('/transactions/udpate_budget_goal', 'POST', {
      user_id: localStorage.getItem('user_id'),
      category,
      budget: updated_budget_goal
    })
      .then((data) => {
        alert(data.message);
        fetchCheckBudget();
      }).catch(err => {
        console.error("Error updating budget goal data:", err);
      })
  }
}

function updateBudgetGoalElement(category, budget_goal) {
  const goal = document.getElementById(`budget-goal-${category}`);
  goal.innerHTML = `<input id="updated-budget-goal-${category}" type="number" value="${budget_goal ? parseInt(budget_goal) : 0}">`;

  document.getElementById(`update-goal-${category}`).hidden = true;
  document.getElementById(`submit-goal-${category}`).hidden = false;
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
  
  localStorage.setItem('data', JSON.stringify(data));
  const listItems = Object.values(data)
    .map((data, index) => `
          <tr id="transaction-${data.id}">
            <td id="transaction-date-${data.id}">${new Date(data.date).toISOString().split('T')[0]}</td>
            <td id="transaction-description-${data.id}">${data.description}</td>
            <td id="transaction-category-${data.id}">${data.category}</td>
            <td id="transaction-amount-${data.id}">${data.amount}</td>
            <td>
              <button onclick="showEditButton(${index})" id="show-edit-btn-${data.id}">Edit</button>
              <button onclick="editTransaction(${data.id})" id="edit-transaction-${data.id}" hidden="true">Submit</button>
              <button class="red-btn" onclick="removeTransaction(${data.id})">Remove</button>
            </td>
          </tr>
    `)
    .join('');
  budgetSummary.innerHTML = `${listItems}`;
}

function displayBudgetSummary(data) {
  const budgetSummary = document.getElementById("summary-table");
  if (!budgetSummary) {
    console.error("Summary table not found.");
    return;
  }

  if (!data || Object.keys(data).length === 0) {
    budgetSummary.innerHTML = "<p>No summary data available.</p>";
    return;
  }
  
  const listItems = Object.values(data)
    .map((data) => `
          <tr>
            <td>${data.category}</td>
            <td>${data.amount}</td>
          </tr>
    `)
    .join('');
  budgetSummary.innerHTML = `${listItems}`;
}

function displayCheckBudget(data) {
  const checkBudget = document.getElementById("check-budget-table");
  if (!checkBudget) {
    console.error("Check Budget table not found.");
    return;
  }

  if (!data || Object.keys(data).length === 0) {
    checkBudget.innerHTML = "<p>No Budget data available.</p>";
    return;
  }
  
  localStorage.setItem('budget-goals', JSON.stringify(data));
  const listItems = Object.values(data)
    .map((data) => `
          <tr>
            <td>${data.category}</td>
            <td id="budget-goal-${data.category}">$${data.budget_goal ?? ''}</td>
            <td>$${data.spent}</td>
            <td>$${data.budget_goal ? data.budget_goal - data.spent : ''}</td>
            <td>
              <button id="update-goal-${data.category}" onclick="updateBudgetGoalElement('${data.category}', ${data.budget_goal})">${data.budget_goal ? 'Update' : 'Set'} Goal</button>
              <button id="submit-goal-${data.category}" onclick="submitBudgetGoal('${data.category}')" class="red-btn" hidden="true">Submit Goal</button>
            </td>
          </tr>
    `)
    .join('');
    checkBudget.innerHTML = `${listItems}`;
}

// Handle user logout
function handleLogout() {
  localStorage.removeItem('token'); // Clear token
  window.location.href = 'login.html'; // Redirect to login
}