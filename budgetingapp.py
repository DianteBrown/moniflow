import pandas as pd
from datetime import datetime
from plaid_integration import create_link_token, fetch_transactions

#Load transactions from CSV (if the file exists)
def load_transactions():
    try:
        return pd.read_csv('transactions.csv')
    except FileNotFoundError:
        return pd.DataFrame(columns=["Date", "Type", "Amount", "Category", "Description"])

# Save transactions to CSV
def save_transactions(data):
    data.to_csv('transactions.csv', index=False)  # Save the DataFrame to a CSV file

# Delete transaction
def delete_transaction(data):
    view_transactions(data)  # Show all transactions
    try:
        index = int(input("Enter the index of the transaction to delete: "))
        data = data.drop(index=index)
        save_transactions(data)
        print("Transaction deleted.")
    except ValueError:
        print("Invalid input.")
    return data #add a menu option to delete data and add edit option

#Edit transaction
def edit_transaction(data):
    view_transactions(data)  # Show all transactions
    try:
        index = int(input("Enter the index of the transaction to edit: "))
        if index < 0 or index >= len(data):
            print("Invalid index.")
            return data
        # Allow editing of the transaction fields
        print("Leave the field blank if no changes are needed.")
        new_date = input(f"Enter new date (YYYY-MM-DD) or press Enter to keep [{data.iloc[index]['Date']}]: ")
        if new_date:
            while not validate_date(new_date):
                print("Invalid date format. Please try again.")
                new_date = input(f"Enter new date (YYYY-MM-DD): ")

        new_type = input(f"Enter new type (Income/Expense) or press Enter to keep [{data.iloc[index]['Type']}]: ").capitalize()
        if new_type and new_type not in ["Income", "Expense"]:
            print("Invalid type. Please enter 'Income' or 'Expense'.")
            return data

        new_amount = input(f"Enter new amount or press Enter to keep [{format_currency(data.iloc[index]['Amount'])}]: ")
        if new_amount:
            try:
                new_amount = float(new_amount.replace('$', '').replace(',', ''))
                if new_amount < 0:
                    print("Amount must be positive.")
                    return data
            except ValueError:
                print("Invalid amount.")
                return data

        new_category = input(f"Enter new category or press Enter to keep [{data.iloc[index]['Category']}]: ")
        new_description = input(f"Enter new description or press Enter to keep [{data.iloc[index]['Description']}]: ")

       # Apply changes
        if new_date:
            data.at[index, 'Date'] = new_date
        if new_type:
            data.at[index, 'Type'] = new_type
        if new_amount:
            data.at[index, 'Amount'] = new_amount
        if new_category:
            data.at[index, 'Category'] = new_category
        if new_description:
            data.at[index, 'Description'] = new_description

        save_transactions(data)
        print("Transaction updated.")
    except ValueError:
        print("Invalid input.")
    return data

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
    if data.empty:
        print("No transactions available.")
    else:
        print("\nTransactions:")
        print(data.to_string(index=False, formatters={'Amount': format_currency}))

#Summarize spending by category
def summarize_spending(data):
    # Group transactions by category and calculate total spending per category
    category_summary = data.groupby('Category')['Amount'].sum()
    print("\nSpending Summary by Category:")
    print(category_summary)

# Common categories for budgets
common_categories = ["Groceries", "Rent", "Entertainment", "Utilities", "Transportation"] #add or delete budget catagories for the future


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

#Function allows the user to input their budget for each catagory
def set_budgets(budgets):
    print("\nSetting or Changing Budgets:")

    for category in common_categories:
        # Prompt the user to set or change the budget for each category
        try:
            budget_input = input(f"Enter budget for {category} (current: {budgets.get(category, 'not set')}): ")
            if budget_input:
                budgets[category] = float(budget_input)
        except ValueError:
            print(f"Invalid input for {category}. Please enter a valid number.")

    print("Budgets updated!")
    return budgets
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
    print("5. Set or change budgets")
    print("6. Edit a transaction")
    print("7. Delete a transaction")
    print("8. Fetch transactions from Plaid")
    print("9. Exit")

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

        type_ = input("Enter type (Income/Expense): ").capitalize()
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
        # Set or change budgets
        budgets = set_budgets(budgets)

    elif choice == "6":
        # Edit a transaction
        data = edit_transaction(data)

    elif choice == "7":
        # Delete a transaction
        data = delete_transaction(data)

    elif choice == "8":
        #Fetch transactions from Plaid
        link_token = create_link_token()
        print(f"Link Token: {link_token}")

    elif choice == "9":
        # Exit the app
        print("Goodbye!")
        break

    else:
        print("Invalid choice, try again.")
