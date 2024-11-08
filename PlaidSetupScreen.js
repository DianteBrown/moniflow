import React from 'react';
import { useState, useEffect } from 'react';
import { View, Button, Alert } from 'react-native';
import { create, open, LinkIOSPresentationStyle, LinkLogLevel } from 'react-native-plaid-link-sdk';

function PlaidSetupScreen() {
  const [linkToken, setLinkToken] = useState('');

  useEffect(() => {
    async function fetchLinkToken() {
      try {
        const response = await fetch('http://10.0.2.2:8002/create-link-token');
        const data = await response.json();
        setLinkToken(data.link_token);

        const tokenConfig = {
          token: data.link_token,
          noLoadingState: false,
        };
        create(tokenConfig);
      } catch (error) {
        console.error('Error fetching link token:', error);
      }
    }
    fetchLinkToken();
  }, []);

  const onSuccess = (success) => {
    console.log('Success:', success);
    Alert.alert('Success', `Public Token: ${success.publicToken}`);
  };

  const onExit = (linkExit) => {
    console.log('Exit:', linkExit);
    Alert.alert('Exit', 'User exited Plaid Link');
  };

  const openProps = {
    onSuccess: onSuccess,
    onExit: onExit,
    iOSPresentationStyle: LinkIOSPresentationStyle.MODAL,
    logLevel: LinkLogLevel.ERROR,
  };

  return (
    <View>
      {linkToken ? (
        <Button title="Connect to Bank" onPress={() => open(openProps)} />
      ) : (
        <Button title="Loading..." disabled />
      )}
    </View>
  );
}

export default PlaidSetupScreen;
