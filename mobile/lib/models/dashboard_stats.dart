class DashboardStats {
  final int totalProducts;
  final int totalUsers;
  final int totalCategories;
  final int lowStockCount;

  DashboardStats({
    required this.totalProducts,
    required this.totalUsers,
    required this.totalCategories,
    required this.lowStockCount,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalProducts: json['totalProducts'] ?? 0,
      totalUsers: json['totalUsers'] ?? 0,
      totalCategories: json['totalCategories'] ?? 0,
      lowStockCount: json['lowStockCount'] ?? 0,
    );
  }
}

class CategoryDistribution {
  final String categoryName;
  final int productCount;

  CategoryDistribution({
    required this.categoryName,
    required this.productCount,
  });

  factory CategoryDistribution.fromJson(Map<String, dynamic> json) {
    return CategoryDistribution(
      categoryName: json['category_name'] ?? '',
      productCount: int.tryParse(json['product_count'].toString()) ?? 0,
    );
  }
}

class InventoryLog {
  final String logId;
  final String productName;
  final int oldQuantity;
  final int newQuantity;
  final String changedByName;
  final String changedAt;

  InventoryLog({
    required this.logId,
    required this.productName,
    required this.oldQuantity,
    required this.newQuantity,
    required this.changedByName,
    required this.changedAt,
  });

  factory InventoryLog.fromJson(Map<String, dynamic> json) {
    return InventoryLog(
      logId: json['log_id'] ?? '',
      productName: json['product_name'] ?? '',
      oldQuantity: json['old_quantity'] ?? 0,
      newQuantity: json['new_quantity'] ?? 0,
      changedByName: json['changed_by_name'] ?? '',
      changedAt: json['changed_at'] ?? '',
    );
  }
}

class LowStockProduct {
  final String productId;
  final String name;
  final int quantity;
  final String categoryName;

  LowStockProduct({
    required this.productId,
    required this.name,
    required this.quantity,
    required this.categoryName,
  });

  factory LowStockProduct.fromJson(Map<String, dynamic> json) {
    return LowStockProduct(
      productId: json['product_id'] ?? '',
      name: json['name'] ?? '',
      quantity: json['quantity'] ?? 0,
      categoryName: json['category_name'] ?? '',
    );
  }
}

class RecentTransaction {
  final String transactionId;
  final String productName;
  final String userName;
  final String checkInTime;
  final String? checkOutTime;
  final String currentStatus;

  RecentTransaction({
    required this.transactionId,
    required this.productName,
    required this.userName,
    required this.checkInTime,
    this.checkOutTime,
    required this.currentStatus,
  });

  factory RecentTransaction.fromJson(Map<String, dynamic> json) {
    return RecentTransaction(
      transactionId: json['transaction_id'] ?? '',
      productName: json['product_name'] ?? '',
      userName: json['user_name'] ?? '',
      checkInTime: json['check_in_time'] ?? '',
      checkOutTime: json['check_out_time'],
      currentStatus: json['current_status'] ?? '',
    );
  }
}
