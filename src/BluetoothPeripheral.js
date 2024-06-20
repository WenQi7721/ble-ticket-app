import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert, TextInput } from 'react-native';
import Peripheral, { Service, Characteristic } from 'react-native-peripheral';
import uuid from 'react-native-uuid';

const BluetoothPeripheral = () => {
  const [advertising, setAdvertising] = useState(false);
  const [receivedPayload, setReceivedPayload] = useState('');
  const [error, setError] = useState(null);

  const serviceUUID = uuid.v4();
  const characteristicUUID = uuid.v4();
  const isListenerRegistered = useRef(false);

  useEffect(() => {
    if (!isListenerRegistered.current) {
      const handleStateChange = (state) => {
        console.log('Bluetooth state changed:', state);
        if (state === 'poweredOn') {
          console.log('Bluetooth is powered on.');
          if (!advertising) {
            setupPeripheral();
          }
        } else {
          console.log('Bluetooth is not powered on.');
        }
      };

      Peripheral.onStateChanged(handleStateChange);
      isListenerRegistered.current = true;

      return () => {
        // Ensure the listener is only added once
        if (advertising) {
          Peripheral.stopAdvertising()
            .then(() => console.log('Stopped advertising.'))
            .catch((err) => console.error('Failed to stop advertising:', err));
        }
      };
    }
  }, [advertising]);

  const setupPeripheral = async () => {
    if (advertising) return; // Prevent duplicate initialization

    try {
      console.log('Setting up characteristic...');
      const characteristic = new Characteristic({
        uuid: characteristicUUID,
        properties: ['read', 'write', 'notify'],
        permissions: ['readable', 'writeable'],
        onWriteRequest: async (value, offset) => {
          console.log('Received write request:', value);
          await Peripheral.sendResponse(true, value);
          Alert.alert('Payload Received', `Payload: ${value}`);
          setReceivedPayload(value);
        },
      });

      console.log('Characteristic set up:', characteristic);

      console.log('Setting up service...');
      const service = new Service({
        uuid: serviceUUID,
        characteristics: [characteristic],
      });

      console.log('Adding service...');
      await Peripheral.addService(service);
      console.log('Service added successfully');

      setTimeout(async () => {
        console.log('Starting advertising...');
        try {
          await Peripheral.startAdvertising({
            name: 'Ticket',
            serviceUuids: [serviceUUID],
          });
          setAdvertising(true);
          console.log('Advertising started successfully');
        } catch (advertisingError) {
          console.error('Error starting advertising:', advertisingError);
          setError(`Advertising failed: ${advertisingError.message}`);
        }
      }, 1000);
    } catch (e) {
      setError(e.message);
      console.error('Error setting up peripheral:', e);
    }
  };

  const checkAdvertisingStatus = async () => {
    try {
      const isAdvertising = await Peripheral.isAdvertising();
      console.log('Advertising status:', isAdvertising);
      Alert.alert('Advertising Status', `Is advertising: ${isAdvertising}`);
    } catch (error) {
      console.error('Error checking advertising status:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth Peripheral</Text>
      <Button
        title={advertising ? 'Advertising...' : 'Activate'}
        onPress={setupPeripheral}
        disabled={advertising}
      />
      <Button
        title="Check Advertising Status"
        onPress={checkAdvertisingStatus}
      />
      {error && <Text style={styles.error}>Error: {error}</Text>}
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
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default BluetoothPeripheral;
