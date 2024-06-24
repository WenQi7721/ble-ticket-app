import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import Peripheral, { Service, Characteristic } from 'react-native-peripheral';
import uuid from 'react-native-uuid';
import { Buffer } from 'buffer';

const BluetoothPeripheral = () => {
  const [advertising, setAdvertising] = useState(false);
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
        
        // Define manufacturer-specific data (example: company identifier 0x1234 and data 0x5678)
        const manufacturerData = Buffer.from([0x34, 0x12, 0x78, 0x56]);

        try {
          const response = await Peripheral.startAdvertising({
            name: 'Ticket 0.0',
            serviceUuids: [serviceUUID],
            manufacturerData: manufacturerData,
          });
          console.log(response);
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
