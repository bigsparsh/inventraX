# Inventory Check-In/Check-Out Pages

## Overview
These pages allow staff members to check in and check out inventory items. The system automatically updates inventory levels and maintains comprehensive logs using PostgreSQL triggers and views.

## Features

### Check-In Page (`/inventory/check-in`)
- **Product Selection**: Browse and search through all available products
- **Category Filtering**: Filter products by category
- **Real-time Updates**: See current stock levels before checking in
- **Inventory Logs**: View recent inventory changes
- **Automatic Quantity Update**: Quantity increases by 1 on check-in

### Check-Out Page (`/inventory/check-out`)
- **Available Products Only**: Shows only products with stock > 0
- **Low Stock Warnings**: Alerts when stock will fall below threshold
- **Category Filtering**: Filter products by category
- **Real-time Updates**: See current stock levels before checking out
- **Inventory Logs**: View recent inventory changes
- **Automatic Quantity Update**: Quantity decreases by 1 on check-out

## Database Integration

### Stored Procedures Used

#### Check In
```sql
CALL check_in($productId, $userId)
```
- Creates a new transaction record with status 'IN'
- Automatically increments product quantity by 1
- Logs are created automatically via trigger

#### Check Out
```sql
CALL check_out($productId, $userId)
```
- Updates the most recent 'IN' transaction to status 'OUT'
- Automatically decrements product quantity by 1
- Logs are created automatically via trigger

### Triggers
The `trigger_update_inventory` automatically:
- Updates product quantities
- Creates inventory log entries
- Records who made the change and when

### Views Used
- **InventoryLogs**: Displays all inventory changes with user and product details
- Joins Products and Users tables for comprehensive logging

## API Endpoints

### Check In
```
POST /api/inventory/check-in
Body: { productId: string, userId: string }
```

### Check Out
```
POST /api/inventory/check-out
Body: { productId: string, userId: string }
```

### Inventory Logs
```
GET /api/dashboard/logs?limit=10
```

## User Experience

### Check-In Flow
1. Staff views all products with current quantities
2. Staff searches/filters to find desired product
3. Staff clicks "Check In" button
4. Confirmation dialog shows current and new quantity
5. Upon confirmation, product is checked in
6. Success message displays
7. Product list and logs refresh automatically

### Check-Out Flow
1. Staff views products with stock > 0
2. Staff searches/filters to find desired product
3. Staff clicks "Check Out" button
4. Confirmation dialog shows:
   - Current quantity
   - New quantity after checkout
   - Low stock warning (if applicable)
5. Upon confirmation, product is checked out
6. Success message displays
7. Product list and logs refresh automatically

## Permissions
- All authenticated staff members can access these pages
- User ID is automatically captured from authentication context
- All changes are logged with the staff member's user ID

## Error Handling
- Cannot check out products with zero quantity
- Clear error messages for failed operations
- Network errors are handled gracefully
- Success/error messages auto-dismiss after 3 seconds

## Navigation
Access these pages from the sidebar:
- **Check In**: Sidebar → Check In (PackagePlus icon)
- **Check Out**: Sidebar → Check Out (PackageMinus icon)
