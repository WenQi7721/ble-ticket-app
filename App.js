import React from 'react';
import { View, StyleSheet } from 'react-native';
import BluetoothPeripheral from './src/BluetoothPeripheral';
import BluetoothScanner from './src/BluetoothScanner';

const App = () => {
  return (
    <View style={styles.container}>
      <BluetoothPeripheral />
      <BluetoothScanner />
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
});

export default App;
