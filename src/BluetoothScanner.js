import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Alert, PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const BluetoothScanner = () => {
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const manager = useRef(new BleManager({
    restoreStateIdentifier: 'BluetoothScannerRestore',
    restoreStateFunction: (restoredState) => {
      if (restoredState) {
        console.log('Restored state:', restoredState);
      } else {
        console.log('Restored state: null');
      }
    }
  })).current;

  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        if (
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] !== PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.error('Permissions denied');
          return;
        }
      }
    };

    if (Platform.OS === 'android') {
      requestPermissions();
    }

    return () => {
      manager.stopDeviceScan();
      manager.destroy();
    };
  }, [manager]);

  const checkBluetoothState = async () => {
    const state = await manager.state();
    if (state !== 'PoweredOn') {
      Alert.alert('Bluetooth is not enabled or supported on this device');
      return false;
    }
    return true;
  };

  const startScan = async () => {
    const isBluetoothEnabled = await checkBluetoothState();
    if (!isBluetoothEnabled) {
      return;
    }

    setDevices([]);
    setScanning(true);
    console.log('Starting scan...');

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Error scanning devices:', error);
        Alert.alert('Error', 'BluetoothLE is unsupported on this device or Bluetooth is not enabled.');
        setScanning(false);
        return;
      }

      if (device) {
        console.log('Device found:', device.name, device.id);
        setDevices((prevDevices) => {
          if (prevDevices.find((d) => d.id === device.id)) {
            return prevDevices;
          }
          return [...prevDevices, device];
        });
      }
    });
  };

  const stopScan = () => {
    manager.stopDeviceScan();
    setScanning(false);
    console.log('Scan stopped');
  };

  const renderItem = ({ item }) => (
    <View style={styles.deviceContainer}>
      <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
      <Text style={styles.deviceId}>{item.id}</Text>
      <Text style={styles.deviceManufacturerData}>{item.manufacturerData ? item.manufacturerData.toString('hex') : 'N/A'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth Scanner</Text>
      <Button title={scanning ? 'Scanning...' : 'Start Scan'} onPress={startScan} disabled={scanning} />
      {scanning && <Button title="Stop Scan" onPress={stopScan} />}
      <FlatList
        data={devices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No devices found</Text>}
      />
      <Text style={styles.title}>Devices Found:</Text>
      {devices.length > 0 ? (
        devices.map((device) => (
          <Text key={device.id}>{`Name: ${device.name || 'Unknown'}, ID: ${device.id}, Manufacturer Data: ${device.manufacturerData ? device.manufacturerData.toString('hex') : 'N/A'}`}</Text>
        ))
      ) : (
        <Text>No devices found</Text>
      )}
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
  deviceContainer: {
    marginVertical: 8,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '100%',
  },
  deviceName: {
    fontSize: 18,
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
  },
  deviceManufacturerData: {
    fontSize: 12,
    color: '#999',
  },
});

export default BluetoothScanner;
