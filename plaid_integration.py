import os
from plaid import Client

# Initialize Plaid client
client = Client(client_id=os.getenv('PLAID_CLIENT_ID'),
                secret=os.getenv('PLAID_SECRET'),
                environment=os.getenv('PLAID_ENV'))  # 'sandbox', 'development', or 'production'

def create_link_token():
    response = client.LinkToken.create({
        'user': {'client_user_id': 'unique_user_id'},
        'client_name': 'Your App Name',
        'products': ['transactions'],
        'country_codes': ['US'],
        'language': 'en'
    })
    return response['link_token']

def fetch_transactions(access_token, start_date, end_date):
    response = client.Transactions.get(access_token, start_date, end_date)
    return response['transactions']
