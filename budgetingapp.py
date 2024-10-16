import pandas as pd
from datetime import datetime

#Load transactions from CSV (if the file exists)
def load_transactions():
    try:
        return pd.read_csv('transactions.csv')
    except FileNotFoundError:
        return pd.DataFrame(columns=["Date", "Type", "Amount", "Category", "Description"])

# Save transactions to CSV
def save_transactions(data):
    data.to_csv('transactions.csv', index=False)  # Save the DataFrame to a CSV file

# Add a new transaction
def add_transaction(data, date, type_, amount, category, description):
    new_transaction = pd.DataFrame({
        "Date": [date],
        "Type": [type_],
        "Amount": [amount],
        "Category": [category],
        "Description": [description]
    })
    data = pd.concat([data, new_transaction], ignore_index=True)
    save_transactions(data)
    print("Transaction added and saved.")
    return data

# View all transactions
def view_transactions(data):
    print(data)  # Simply prints the DataFrame containing all transactions

#Summarize spending by category
def summarize_spending(data):
    # Group transactions by category and calculate total spending per category
    category_summary = data.groupby('Category')['Amount'].sum()
    print("\nSpending Summary by Category:")
    print(category_summary)

#Check the budget for each category
def check_budget(data, budgets):
    category_spending = data.groupby('Category')['Amount'].sum()

    print("\nBudget Check:")
    for category, budget in budgets.items():
        spent = category_spending.get(category, 0)  # Get spending or 0 if no spending
        if spent > budget:
            print(f"Over budget for {category}: Spent {format_currency(spent)}, Budget was {format_currency(budget)}")
        else:
            print(f"Under budget for {category}: Spent {format_currency(spent)}, Remaining: {format_currency(budget - spent)}")

#Format currency
def format_currency(amount):
    return f"${amount:,.2f}"

#Validate the date format
def validate_date(date_str):
    try:
        # Check if the input is in the correct format (YYYY-MM-DD)
        datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except ValueError:
        return False

# Simple menu function to interact with the app
def menu():
    print("1. Add a new transaction")
    print("2. View all transactions")
    print("3. View spending summary")
    print("4. Check budget")
    print("5. Exit")

    choice = input("Choose an option: ")
    return choice

# Main workflow
data = load_transactions()

# Budgets ( I want to add an input where I can tell my budgets for each catagory, so we need to have a list of common categories and a prompt to put in
#how much the budget is in the menu and an option in the menu to change the budgets)
budgets = {
    "Groceries": 300,
    "Rent": 1200,
    "Entertainment": 100
}

while True:
    choice = menu()

    if choice == "1":
         # Add a new transaction
        date = input("Enter date (YYYY-MM-DD): ")
        while not validate_date(date):
            print("Invalid date format. Please try again.")
            date = input("Enter date (YYYY-MM-DD): ")

        type_ = imput("Enter type (Income/Expense): ").capitalize()
        while type_ not in ["Income", "Expense"]:
            print("Invalid type. Please enter 'Income' or 'Expense'.")
            type_ = input("Enter type (Income/Expense): ").capitalize()

        # Validate amount input
        while True:
            amount_input = input("Enter amount (numbers only): ")
            try:
                amount = float(amount_input.replace('$','').replace(',', ''))
                if amount < 0:
                    raise ValueError("Amount must be positive.")
                break
            except ValueError as e:
                print(f"Invalid amount: {e}. Please enter a valid number.")

        category = input("Enter category: ")
        description = input("Enter description: ")

        # Add transaction
        data = add_transaction(data, date, type_, amount, category, description)

    elif choice == "2":
        # View all transactions
        view_transactions(data)

    elif choice == "3":
        # Summarize spending by category
        summarize_spending(data)

    elif choice == "4":
        # Check the budget
        check_budget(data, budgets)

    elif choice == "5":
        # Exit the app
        print("Goodbye!")
        break

    else:
        print("Invalid choice, try again.")
