try:
    from plaid.api import plaid_api
    from plaid.model.link_token_create_request import LinkTokenCreateRequest
    from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
    from plaid.model.products import Products
    from plaid.model.country_code import CountryCode
    from plaid import ApiClient
    from plaid.configuration import Configuration
    from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
    from plaid.model.transactions_get_request import TransactionsGetRequest
    from datetime import datetime
    import os
except ImportError as e:
    print(f"ImportError: {e}")
    print("Make sure that the Plaid Python SDK is installed. You can install it with 'pip install plaid-python'.")
    raise

# Setup Plaid API configuration
try:
    client_id = os.getenv('PLAID_CLIENT_ID')
    secret = os.getenv('PLAID_SECRET')

    if not client_id or not secret:
        raise ValueError("PLAID_CLIENT_ID or PLAID_SECRET is not set.")

    configuration = Configuration(
        host= "https://production.plaid.com", #"https://sandbox.plaid.com" or 'https://production.plaid.com'
        api_key={
            'clientId': os.getenv('PLAID_CLIENT_ID'),
            'secret': os.getenv('PLAID_SECRET')
        }
    )
except Exception as e:
    print(f"Error in API configuration: {e}")
    raise

# Initialize the API client
try:
    api_client = ApiClient(configuration)
    client = plaid_api.PlaidApi(api_client)
except Exception as e:
    print(f"Error in API configuration: {e}")
    raise
# Step 1: Create Link Token
def create_link_token():
    try:
        request = LinkTokenCreateRequest(
            user=LinkTokenCreateRequestUser(client_user_id="unique_user_id"),  # Unique identifier for the user
            client_name="moniflow",  # Replace with your app name
            products=[Products("transactions")],  # Replace with the products you're using (e.g., 'transactions')
            country_codes=[CountryCode('US')],  # Adjust if necessary for your use case
            language='en',  # Language preference
            redirect_uri="http://moniflow.io/redirect"  # Add your registered redirect URI here
        )
        response = client.link_token_create(request)
        if 'link_token' not in response:
            raise ValueError("Link token not found in response.")
        return response['link_token']
    except plaid.exceptions.ApiException as e:
        # Parse and print only essential details from the error
        print("Error creating link token:")
        try:
            error_details = e.body  # Parse the JSON body of the error
            parsed_error = json.loads(error_details)
            print(f"Error Code: {parsed_error['error_code']}")
            print(f"Error Message: {parsed_error['error_message']}")
            print(f"Documentation URL: {parsed_error['documentation_url']}")
            print(f"Request ID: {parsed_error['request_id']}")
        except Exception as parse_error:
            print(f"Failed to parse error details: {parse_error}")
        raise
    except Exception as e:
        print(f"Unexpected error creating link token: {e}")
        raise
# Public Token
def exchange_public_token(public_token):
    try:
        request = ItemPublicTokenExchangeRequest(public_token=public_token)
        response = client.item_public_token_exchange(request)
        if 'access_token' not in response:
            raise ValueError("Access token not found in response.")
        return response['access_token']
    except ValueError as ve:
        print(f"ValueError in exchange_public_token: {ve}")
        raise
    except Exception as e:
        print(f"Error exchanging public token: {e}")
        raise

#Fetch Token
def fetch_transactions(access_token):
    try:
        start_date = datetime.now().strftime('%Y-%m-%d')
        end_date = datetime.now().strftime('%Y-%m-%d')

        request = TransactionsGetRequest(
            access_token=access_token,
            start_date=start_date,
            end_date=end_date
        )
        response = client.transactions_get(request)
        if 'transactions' not in response:
            raise ValueError("Transactions data not found in response.")
        return response['transactions']
    except ValueError as ve:
        print(f"ValueError in fetch_transactions: {ve}")
        raise
    except Exception as e:
        print(f"Error fetching transactions: {e}")
        raise


# Generate and print Link Token
try:
    link_token = create_link_token()
    print(f"Link Token: {link_token}")
except Exception as e:
    print(f"An error occurred while generating the link token: {e}")