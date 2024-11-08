import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './MainScreen'; // This is your current main screen
import PlaidSetupScreen from './PlaidSetupScreen'; // Replace with actual screen path
import SMSSetupScreen from './SMSSetupScreen'; // Replace with actual screen path

const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={MainScreen} />
        <Stack.Screen name="Plaid Setup" component={PlaidSetupScreen} />
        <Stack.Screen name="SMS Setup" component={SMSSetupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
