# InventraX Mobile App

A Flutter mobile application for the InventraX inventory management system. This app allows users to manage inventory through a mobile interface with features including authentication, dashboard, and QR code scanning for check-in/check-out operations.

## Features

### 🔐 Authentication
- User login with email and password
- User registration with name, email, password, and date of birth
- JWT token-based authentication
- Persistent login sessions

### 📊 Dashboard
- Overview statistics (Total Products, Users, Categories, Low Stock)
- Category distribution pie chart
- Low stock alerts
- Recent inventory activity logs
- Pull-to-refresh functionality
- User profile display

### 📷 QR Code Scanning
- **Check In**: Scan product QR codes to add items to inventory
- **Check Out**: Scan product QR codes to remove items from inventory
- Real-time camera scanning
- Flash toggle support
- Visual feedback for successful/failed operations

## Tech Stack

- **Flutter**: Cross-platform mobile framework
- **Provider**: State management
- **HTTP**: API communication
- **QR Code Scanner**: Camera-based QR code scanning
- **FL Chart**: Data visualization
- **Shared Preferences**: Local storage for authentication tokens

## Prerequisites

Before you begin, ensure you have the following installed:
- [Flutter SDK](https://flutter.dev/docs/get-started/install) (3.8.1 or higher)
- [Dart SDK](https://dart.dev/get-dart)
- [Android Studio](https://developer.android.com/studio) (for Android development)
- [Xcode](https://developer.apple.com/xcode/) (for iOS development, macOS only)
- A device or emulator to run the app

## Installation

1. **Navigate to the mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies**:
   ```bash
   flutter pub get
   ```

3. **Configure API Base URL**:
   
   Open `lib/services/api_service.dart` and update the `baseUrl` constant with your API server address:
   
   ```dart
   static const String baseUrl = 'http://YOUR_IP_ADDRESS:3000';
   ```
   
   For local development:
   - **Android Emulator**: Use `http://10.0.2.2:3000`
   - **iOS Simulator**: Use `http://localhost:3000`
   - **Physical Device**: Use your computer's local IP (e.g., `http://192.168.1.100:3000`)

4. **Ensure the backend server is running**:
   
   The web backend must be running and accessible from your mobile device. Navigate to the web directory and start the server:
   
   ```bash
   cd ../web
   pnpm install
   pnpm dev
   ```

## Running the App

### On Android

1. **Connect an Android device or start an emulator**
   
2. **Run the app**:
   ```bash
   flutter run
   ```

### On iOS (macOS only)

1. **Install CocoaPods dependencies**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

2. **Connect an iOS device or start a simulator**

3. **Run the app**:
   ```bash
   flutter run
   ```

## Project Structure

```
lib/
├── main.dart                 # App entry point with navigation setup
├── models/                   # Data models
│   ├── user.dart            # User model
│   ├── product.dart         # Product model
│   └── dashboard_stats.dart # Dashboard statistics models
├── providers/               # State management
│   └── auth_provider.dart   # Authentication state
├── screens/                 # UI screens
│   ├── login_screen.dart    # Login page
│   ├── signup_screen.dart   # Registration page
│   ├── home_screen.dart     # Main screen with bottom navigation
│   ├── dashboard_screen.dart # Dashboard with stats and charts
│   ├── check_in_screen.dart  # QR scanner for check-in
│   └── check_out_screen.dart # QR scanner for check-out
└── services/                # Business logic
    └── api_service.dart     # HTTP API calls
```

## API Integration

The app integrates with the following API endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/categories` - Category distribution
- `GET /api/dashboard/logs` - Inventory logs
- `GET /api/dashboard/low-stock` - Low stock products
- `GET /api/dashboard/transactions` - Recent transactions
- `POST /api/inventory/check-in` - Check in product
- `POST /api/inventory/check-out` - Check out product

## Permissions

The app requires the following permissions:

### Android (AndroidManifest.xml)
- `CAMERA` - For QR code scanning
- `INTERNET` - For API communication

### iOS (Info.plist)
- `NSCameraUsageDescription` - Camera access for QR scanning

## Building for Production

### Android APK

```bash
flutter build apk --release
```

The APK will be located at `build/app/outputs/flutter-apk/app-release.apk`

### Android App Bundle (for Play Store)

```bash
flutter build appbundle --release
```

### iOS IPA

```bash
flutter build ios --release
```

## Troubleshooting

### Camera Permission Issues
- Ensure camera permissions are granted in device settings
- Check that the camera feature is properly declared in manifest files

### Network Issues
- Verify the API base URL is correct
- Ensure the backend server is running and accessible
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical devices, use your computer's local IP address
- Check firewall settings if the device can't reach the server

### QR Code Scanning Issues
- Ensure adequate lighting
- Hold the QR code steady within the scan frame
- Make sure the QR code contains a valid product UUID

### Build Errors
```bash
# Clean the build
flutter clean

# Get dependencies again
flutter pub get

# For iOS, reinstall pods
cd ios && pod install && cd ..

# Try building again
flutter run
```

## Testing

The app requires a backend API server for full functionality. Ensure you have test data in your database:

1. Create test users through the registration screen
2. Add products to the database through the web interface
3. Generate QR codes for products (product UUIDs)
4. Test scanning with physical QR codes or QR code images

## Demo Credentials

If your backend has demo data, you can use these credentials:
- Email: (Your test email)
- Password: (Your test password)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is part of the InventraX inventory management system.

## Support

For issues or questions, please contact the development team or open an issue in the repository.
