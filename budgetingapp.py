import pandas as pd

# Create a DataFrame with empty columns to store transactions
data = pd.DataFrame(columns=["Date", "Type", "Amount", "Category", "Description"])

# Create a new row (as a DataFrame)
new_transaction = pd.DataFrame({
    "Date": ["2024-10-13"],          # Transaction date
    "Type": ["Income"],              # Transaction type: "Income" or "Expense"
    "Amount": [1500.00],             # Amount of money
    "Category": ["Salary"],          # Category of the transaction
    "Description": ["Monthly salary"]# Description of the transaction
})

# Concatenate the new transaction to the existing DataFrame
data = pd.concat([data, new_transaction], ignore_index=True)

# Add another sample transaction (Expense)
new_transaction2 = pd.DataFrame({
    "Date": ["2024-10-14"],
    "Type": ["Expense"],
    "Amount": [50.00],
    "Category": ["Groceries"],
    "Description": ["Bought groceries"]
})

# Concatenate the second transaction
data = pd.concat([data, new_transaction2], ignore_index=True)

# Print the DataFrame to see your transactions
print(data)