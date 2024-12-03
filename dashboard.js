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
      modal.style.display = "none";
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

// Handle user logout
function handleLogout() {
  localStorage.removeItem('token'); // Clear token
  window.location.href = 'login.html'; // Redirect to login
}