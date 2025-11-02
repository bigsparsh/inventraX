# QR Code Generation Guide for Testing

## Overview
The mobile app's check-in and check-out features require QR codes that contain product UUIDs. This guide shows you how to generate test QR codes.

## Option 1: Online QR Code Generator (Easiest)

### Steps:
1. Get a product UUID from your database:
   ```sql
   SELECT product_id, name FROM Products LIMIT 5;
   ```

2. Visit a QR code generator website:
   - https://www.qr-code-generator.com/
   - https://www.the-qrcode-generator.com/
   - https://qr.io/

3. Select "Text" or "Plain Text" type

4. Paste the product UUID (example: `550e8400-e29b-41d4-a716-446655440000`)

5. Generate and download the QR code

6. Display it on screen or print it for testing

## Option 2: Using Node.js Script

### Create a QR generator script:

```javascript
// generate-qr.js
const QRCode = require('qrcode');
const fs = require('fs');

// Replace with your actual product UUIDs
const products = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Product 1'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001', 
    name: 'Product 2'
  },
  // Add more products...
];

products.forEach(product => {
  QRCode.toFile(
    `qr-${product.name.replace(/\s+/g, '-')}.png`,
    product.id,
    {
      width: 400,
      margin: 2
    },
    (err) => {
      if (err) console.error(err);
      else console.log(`QR code generated for ${product.name}`);
    }
  );
});
```

### Run:
```bash
npm install qrcode
node generate-qr.js
```

## Option 3: Using Python

### Create a Python script:

```python
# generate_qr.py
import qrcode
import uuid

# Replace with your actual product UUIDs from database
products = [
    {'id': '550e8400-e29b-41d4-a716-446655440000', 'name': 'Product 1'},
    {'id': '550e8400-e29b-41d4-a716-446655440001', 'name': 'Product 2'},
]

for product in products:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(product['id'])
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(f"qr-{product['name'].replace(' ', '-')}.png")
    print(f"Generated QR for {product['name']}")
```

### Run:
```bash
pip install qrcode[pil]
python generate_qr.py
```

## Option 4: Using SQL + Web Interface

### Step 1: Create a SQL query to get product data
```sql
-- Get products with their UUIDs
SELECT 
    product_id,
    name,
    description,
    quantity
FROM Products
ORDER BY name;
```

### Step 2: Add QR generation to your web interface
You could add a "Generate QR" button in your web app's product management page that creates a QR code for each product.

## Testing Workflow

### 1. Get Product UUIDs
```sql
-- In your PostgreSQL database
SELECT product_id, name FROM Products WHERE quantity > 0 LIMIT 10;
```

### 2. Generate QR Codes
Use any method above to create QR codes with those UUIDs

### 3. Test Check-In
1. Open the mobile app
2. Login with test credentials
3. Go to "Check In" tab
4. Scan a product QR code
5. Should see success message
6. Check database: product quantity increased

### 4. Test Check-Out
1. Go to "Check Out" tab
2. Scan the same product QR code
3. Should see success message
4. Check database: product quantity decreased

### 5. Verify in Dashboard
1. Go to "Dashboard" tab
2. Should see updated stats
3. Recent activity should show your transactions

## QR Code Best Practices

### For Testing:
- **Screen Display**: Display QR on computer screen, scan with phone
- **Print**: Print on paper for physical testing
- **Size**: 200x200px minimum for screen, 2x2 inches for print
- **Contrast**: Black on white works best
- **Lighting**: Ensure good lighting when scanning

### For Production:
- **Stickers**: Print QR code stickers for physical products
- **Labels**: Include product name with QR code
- **Durability**: Use waterproof/scratch-resistant materials
- **Size**: Minimum 1x1 inch for close scanning

## Sample Products Setup

Here's a quick SQL script to insert test products and get their UUIDs:

```sql
-- Insert test products
INSERT INTO Products (name, description, category_id, quantity)
VALUES 
  ('Test Product 1', 'Sample product for testing', 
   (SELECT category_id FROM Categories LIMIT 1), 50),
  ('Test Product 2', 'Another test product',
   (SELECT category_id FROM Categories LIMIT 1), 30),
  ('Test Product 3', 'Third test product',
   (SELECT category_id FROM Categories LIMIT 1), 20)
RETURNING product_id, name;

-- Get all product UUIDs for QR generation
SELECT product_id, name, quantity FROM Products;
```

## Troubleshooting

### QR Code Not Scanning
1. **Check UUID Format**: Must be valid UUID from your database
2. **Lighting**: Ensure good lighting conditions
3. **Distance**: Hold phone 6-12 inches from QR code
4. **Stability**: Keep phone and QR code steady
5. **Camera Focus**: Ensure camera is focused on QR code

### Product Not Found Error
1. **Verify UUID**: Check the UUID exists in Products table
2. **Check Database**: Ensure backend is connected to correct database
3. **API Response**: Check backend logs for error details

### Permission Issues
1. **Camera**: Grant camera permissions in device settings
2. **Network**: Ensure device can reach API server
3. **Token**: Ensure you're logged in with valid token

## Quick Test Script

For quick testing, here's a complete flow:

```bash
# 1. Get product UUIDs from database
psql -U your_user -d inventrax -c "SELECT product_id, name FROM Products LIMIT 5;"

# 2. Go to https://www.qr-code-generator.com/

# 3. Paste one UUID and generate QR code

# 4. Display QR on screen

# 5. Open mobile app and scan

# 6. Verify in database:
psql -U your_user -d inventrax -c "SELECT * FROM Transactions ORDER BY check_in_time DESC LIMIT 5;"
```

## Resources

- **QR Code Generators**:
  - https://www.qr-code-generator.com/
  - https://qr.io/
  - https://www.qrcode-monkey.com/

- **Libraries**:
  - Node.js: `qrcode` package
  - Python: `qrcode` package
  - Web: `qrcodejs` library

- **Validators**:
  - Test if QR works: https://zxing.org/w/decode.jspx
  - UUID validator: https://www.uuidtools.com/decode

---

**Note**: Always use actual product UUIDs from your database. The examples shown (like `550e8400-e29b-41d4-a716-446655440000`) are placeholders and won't work unless they exist in your Products table.
