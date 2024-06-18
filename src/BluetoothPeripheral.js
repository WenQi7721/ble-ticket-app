// src/BluetoothPeripheral.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, TextInput } from 'react-native';
import Peripheral from 'react-native-peripheral';

const BluetoothPeripheral = () => {
  const [advertising, setAdvertising] = useState(false);
  const [receivedPayload, setReceivedPayload] = useState('');

  useEffect(() => {
    return () => {
      if (advertising) {
        Peripheral.stopAdvertising();
      }
    };
  }, [advertising]);

  const startAdvertising = () => {
    const writableCharacteristic = {
      uuid: 'ABCD',
      value: '',
      permissions: ['read', 'write'],
      properties: ['read', 'write'],
      onWriteRequest: (device, requestId, value) => {
        console.log('Received write request:', value);

        // Respond to the write request
        Peripheral.sendResponse(device, requestId, true, value);

        // Show an alert with the received payload
        Alert.alert('Payload Received', `Payload: ${value}`);
        setReceivedPayload(value);
      },
    };

    // Start advertising with the writable characteristic
    Peripheral.startAdvertising({
      name: 'MyPeripheral',
      serviceUUIDs: ['1234'],
      characteristics: [writableCharacteristic],
    });

    setAdvertising(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth Peripheral</Text>
      <Button
        title={advertising ? 'Advertising...' : 'Activate'}
        onPress={startAdvertising}
        disabled={advertising}
      />
      <Text style={styles.subtitle}>Advertising with Writable Characteristic</Text>
      <TextInput
        style={styles.input}
        value={receivedPayload}
        placeholder="Received payload will appear here"
        editable={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
});

export default BluetoothPeripheral;
