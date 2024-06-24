# ble-ticket-app

This project demonstrates how to create a Bluetooth Low Energy (BLE) peripheral and scanner using React Native.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed Node.js and npm.
- You have installed React Native CLI.
- You have a physical device to test (BLE functionality is not supported on simulators).

## Installation

1. Clone the repository and navigate into the project directory:

   ```bash
   git clone https://github.com/your-repo/bluetooth-peripheral-scanner.git
   cd bluetooth-peripheral-scanner
   ```

2. Install the project dependencies:

   ```bash
   npm install
   ```

3. Install the necessary BLE libraries:
   ```bash
   npm install --save react-native-ble-plx react-native-peripheral
   # or using yarn
   yarn add react-native-ble-plx react-native-peripheral
   ```

## Linking Native Dependencies

### React Native 0.60 and Above

1. Enter the `ios` folder and run:

   ```bash
   cd ios
   pod update
   ```

2. Linking is automatic. Just run `pod install` in the `ios` directory:
   ```bash
   pod install
   ```

### React Native 0.59 and Below

1. Manually link the `react-native-ble-plx` and `react-native-peripheral` libraries:
   ```bash
   react-native link react-native-ble-plx
   react-native link react-native-peripheral
   ```

## Running the Project

### iOS

1. Install CocoaPods if you haven't already:

   ```bash
   sudo gem install cocoapods
   ```

2. Navigate to the `ios` directory and install the CocoaPods dependencies:

   ```bash
   cd ios
   pod install
   cd ..
   ```

3. Ensure your project is correctly set up by running:

   ```bash
   npx react-native doctor
   ```

4. Validate your Info.plist file:

   ```bash
   plutil /Users/qiwen/Desktop/MyBluetoothProject/ios/MyBluetoothProject/Info.plist
   ```

5. Open the project workspace in Xcode:

   - Open `ios/MyBluetoothProject.xcworkspace`.

6. Clean the build folder to avoid any derived data issues:

   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/*
   ```

7. Run the project on your iOS device from Xcode:
   - Select your target device and press the run button, or use:
   ```bash
   npx react-native run-ios
   ```

### Android

1. Ensure you have the Android development environment set up.
2. Run the project using:
   ```bash
   npx react-native run-android
   ```
