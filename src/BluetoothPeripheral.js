import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert, TextInput } from 'react-native';
import Peripheral, { Service, Characteristic } from 'react-native-peripheral';
import uuid from 'react-native-uuid';
import { encode } from 'base-64'; // Importing base-64 library

const BluetoothPeripheral = () => {
  const [advertising, setAdvertising] = useState(false);
  const [error, setError] = useState(null);

  const serviceUUID = uuid.v4();
  const characteristicUUID = uuid.v4();
  const isListenerRegistered = useRef(false);

  useEffect(() => {
    console.log('useEffect called');
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
        if (advertising) {
          Peripheral.stopAdvertising()
            .then(() => console.log('Stopped advertising.'))
            .catch((err) => console.error('Failed to stop advertising:', err));
        }
      };
    }
  }, [advertising]);

  const setupPeripheral = async () => {
    console.log('setupPeripheral called');
    if (advertising) return;

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

        const payload = 'HELLO';
        const base64Payload = encode(payload);
        console.log('Base64 Payload:', base64Payload);

        try {
          const response = await Peripheral.startAdvertising({
            name: 'TestPeripheral',
            serviceUuids: [serviceUUID],
            manufacturerData: base64Payload,
          });
          console.log('Advertising Response:', response);
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
  error: {
    color: 'red',
    marginTop: 10,
  },
});

export default BluetoothPeripheral;
