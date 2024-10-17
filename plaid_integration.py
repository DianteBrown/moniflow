from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid import ApiClient
from plaid.configuration import Configuration
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from datetime import datetime
import os

# Setup Plaid API configuration
client_id = os.getenv('PLAID_CLIENT_ID')
secret = os.getenv('PLAID_SECRET')

if not client_id or not secret:
    raise ValueError("PLAID_CLIENT_ID or PLAID_SECRET is not set.")

configuration = Configuration(
    host= "https://production.plaid.com", #"https://sandbox.plaid.com" or 'https://production.plaid.com'
    api_key={
        'clientId': '670c45ca9fa2be001928ed35',  # Replace with actual client ID
        'secret': '2d8a1bfccec40aaa4568d69d309b48'  # Replace with actual secret
    }
)

# Initialize the API client
api_client = ApiClient(configuration)
client = plaid_api.PlaidApi(api_client)

# Step 1: Create Link Token
def create_link_token():
    try:
        request = LinkTokenCreateRequest(
            user=LinkTokenCreateRequestUser(client_user_id="unique_user_id"),  # Unique identifier for the user
            client_name="budgetApp",  # Replace with your app name
            products=[Products("transactions")],  # Replace with the products you're using (e.g., 'transactions')
            country_codes=[CountryCode('US')],  # Adjust if necessary for your use case
            language='en'  # Language preference
        )
        response = client.link_token_create(request)
        return response['link_token']
    except Exception as e:
        print(f"Error creating link token: {e}")
        raise
# Public Token
def exchange_public_token(public_token):
    request = ItemPublicTokenExchangeRequest(public_token=public_token)  # Create request object
    response = client.item_public_token_exchange(request)  # Pass request object
    return response['access_token']

#Fetch Token
def fetch_transactions(access_token):
    start_date = datetime.now().strftime('%Y-%m-%d')
    end_date = datetime.now().strftime('%Y-%m-%d')

    request = TransactionsGetRequest(
        access_token=access_token,
        start_date=start_date,
        end_date=end_date
    )
    response = client.transactions_get(request)
    return response['transactions']

# Generate and print Link Token
link_token = create_link_token()
print(f"Link Token: {link_token}")
