import React, { useState } from 'react';
import { View, Text, Button, TextInput, FlatList, StyleSheet } from 'react-native';

export default function MainScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const addTransaction = () => {
    if (description && amount) {
      setTransactions([...transactions, { description, amount: parseFloat(amount) }]);
      setDescription('');
      setAmount('');
    }
  };

  const getTotalSpending = () => {
    return transactions.reduce((total, transaction) => total + transaction.amount, 0).toFixed(2);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>moniflow</Text>

      <Button
        title="Go to Plaid Setup"
        onPress={() => navigation.navigate('Plaid Setup')}
      />
      <Button
        title="Go to SMS Setup"
        onPress={() => navigation.navigate('SMS Setup')}
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Description"
          style={styles.input}
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          placeholder="Amount"
          style={styles.input}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <Button title="Add Transaction" onPress={addTransaction} />
      </View>

      <Text style={styles.total}>Total Spending: ${getTotalSpending()}</Text>

      <FlatList
        data={transactions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.transaction}>
            <Text>{item.description}</Text>
            <Text>${item.amount.toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  total: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});
