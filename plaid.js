const baseURL = "https://us-east1-plasma-block-441317-m4.cloudfunctions.net/budgetingappfunction";

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

function get_access_token(public_token) {
    fetchData('/exchange_public_token', 'POST', { public_token })
        .then((data) => {
            localStorage.setItem('access_token', data.access_token);
            console.log(data);
        }).catch((err) => {
            console.log(err);
        });
}

function get_transactions_from_plaid() {
    const access_token = localStorage.getItem('access_token');
	console.log('get_transaction_from_plaid');
    if (access_token)
		fetchData('/fetch_transactions', 'POST', { user_id: localStorage.getItem('user_id'), access_token })
			.then((data) => {
				console.log(data);
			}).catch((err) => {
				console.log(err);
			})
}