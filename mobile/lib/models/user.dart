class User {
  final String userId;
  final String name;
  final String email;
  final String dob;
  final String? image;
  final String role;

  User({
    required this.userId,
    required this.name,
    required this.email,
    required this.dob,
    this.image,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      userId: json['userId'],
      name: json['name'],
      email: json['email'],
      dob: json['dob'],
      image: json['image'],
      role: json['role'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'name': name,
      'email': email,
      'dob': dob,
      'image': image,
      'role': role,
    };
  }
}
