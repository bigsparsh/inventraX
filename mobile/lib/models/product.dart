class Product {
  final String productId;
  final String name;
  final String description;
  final String? categoryId;
  final int quantity;
  final String? image;

  Product({
    required this.productId,
    required this.name,
    required this.description,
    this.categoryId,
    required this.quantity,
    this.image,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      productId: json['product_id'],
      name: json['name'],
      description: json['description'] ?? '',
      categoryId: json['category_id'],
      quantity: json['quantity'] ?? 0,
      image: json['image'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product_id': productId,
      'name': name,
      'description': description,
      'category_id': categoryId,
      'quantity': quantity,
      'image': image,
    };
  }
}
