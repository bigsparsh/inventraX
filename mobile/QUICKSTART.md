# InventraX Mobile - Quick Start Guide

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd mobile
flutter pub get
```

### 2. Configure API Endpoint

Edit `lib/services/api_service.dart` line 9:

```dart
// Change this to your API server address
static const String baseUrl = 'http://YOUR_IP_ADDRESS:3000';
```

**Common configurations:**
- Android Emulator: `http://10.0.2.2:3000`
- iOS Simulator: `http://localhost:3000`
- Physical Device: `http://192.168.1.XXX:3000` (your computer's IP)

### 3. Start Backend Server

Make sure your web backend is running:
```bash
cd ../web
pnpm install
pnpm dev
```

### 4. Run the App

```bash
cd ../mobile
flutter run
```

## 📱 App Features Overview

### Login & Registration
- New users can sign up with name, email, password, and DOB
- Existing users can login with email and password
- JWT token stored securely for persistent sessions

### Dashboard
- **Stats Overview**: Total products, users, categories, and low stock count
- **Category Chart**: Pie chart showing product distribution across categories
- **Low Stock Alerts**: List of products running low on inventory
- **Recent Activity**: Latest inventory changes with user details

### Check In (Inventory Addition)
- Tap the "Check In" tab in bottom navigation
- Point camera at product QR code
- QR code should contain the product UUID
- Product quantity automatically increases
- Transaction recorded in database

### Check Out (Inventory Removal)
- Tap the "Check Out" tab in bottom navigation
- Point camera at product QR code
- QR code should contain the product UUID
- Product quantity automatically decreases
- Transaction recorded in database

## 🔧 Troubleshooting

### Can't Connect to API
1. Check backend is running: `cd web && pnpm dev`
2. Verify API URL in `api_service.dart`
3. For physical device, use your computer's local IP
4. Check firewall isn't blocking port 3000

### Camera Not Working
1. Grant camera permissions in device settings
2. Check permissions in AndroidManifest.xml (Android) or Info.plist (iOS)
3. Restart the app after granting permissions

### QR Code Not Scanning
1. Ensure good lighting
2. Hold QR code steady in the scan frame
3. QR code must contain a valid product UUID from your database
4. Test with a physical QR code or generated QR image

### Build Errors
```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter run
```

## 📊 Database Integration

The app uses these database tables:
- **Users**: Store user accounts and authentication
- **Products**: Product inventory data
- **Categories**: Product categorization
- **Transactions**: Check-in/check-out records
- **RoleMapping**: User roles (ADMIN, MANAGER, STAFF)
- **InventoryLogs**: Audit trail of inventory changes

## 🎯 Next Steps

1. **Generate QR Codes**: Create QR codes for your products containing their UUIDs
2. **Test Users**: Create test accounts through registration
3. **Add Products**: Use the web interface to add products to inventory
4. **Test Scanning**: Print or display QR codes and test check-in/check-out

## 📝 API Endpoints Used

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registration
- `GET /api/dashboard/stats` - Dashboard stats
- `GET /api/dashboard/categories` - Category distribution
- `GET /api/dashboard/logs` - Recent logs
- `GET /api/dashboard/low-stock` - Low stock products
- `POST /api/inventory/check-in` - Check in product
- `POST /api/inventory/check-out` - Check out product

## 💡 Tips

1. **Development**: Use hot reload (press 'r' in terminal) to see changes instantly
2. **Debugging**: Check terminal logs for API errors or issues
3. **Testing**: Start with the web interface to set up test data
4. **QR Codes**: You can use online QR generators to create test codes with product UUIDs

## 🐛 Common Issues

**Issue**: "User not logged in" error when scanning
- **Fix**: Make sure you're logged in and the token is valid

**Issue**: "Failed to check in product" error
- **Fix**: Verify the product UUID exists in your database

**Issue**: App crashes on camera screen
- **Fix**: Ensure camera permissions are granted

**Issue**: Empty dashboard
- **Fix**: Add data through the web interface first

---

For detailed documentation, see `README_MOBILE.md`
