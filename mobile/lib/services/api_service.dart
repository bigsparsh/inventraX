import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/dashboard_stats.dart';

class ApiService {
  // Change this to your API base URL
  // For local development, use your machine's local IP address
  // Example: 'http://192.168.1.100:3000' or 'http://localhost:3000'
  static const String baseUrl = 'https://inventrax.bigsparsh.space';

  static String? _token;

  // Get stored token
  static Future<String?> getToken() async {
    if (_token != null) return _token;
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
    return _token;
  }

  // Save token
  static Future<void> saveToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  // Clear token
  static Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  // Get headers with auth token
  static Future<Map<String, String>> getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // Login
  static Future<Map<String, dynamic>> login(
    String email,
    String password,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['token'] != null) {
        await saveToken(data['token']);
      }
      return data;
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Login failed');
    }
  }

  // Register
  static Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    required String dob,
    String role = 'STAFF',
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
        'dob': dob,
        'role': role,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['token'] != null) {
        await saveToken(data['token']);
      }
      return data;
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Registration failed');
    }
  }

  // Get dashboard stats
  static Future<DashboardStats> getDashboardStats() async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/api/dashboard/stats'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return DashboardStats.fromJson(data);
    } else {
      throw Exception('Failed to load dashboard stats');
    }
  }

  // Get category distribution
  static Future<List<CategoryDistribution>> getCategoryDistribution() async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/api/dashboard/categories'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((item) => CategoryDistribution.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load category distribution');
    }
  }

  // Get inventory logs
  static Future<List<InventoryLog>> getInventoryLogs({int limit = 10}) async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/api/dashboard/logs?limit=$limit'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((item) => InventoryLog.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load inventory logs');
    }
  }

  // Get low stock products
  static Future<List<LowStockProduct>> getLowStockProducts({
    int threshold = 20,
  }) async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/api/dashboard/low-stock?threshold=$threshold'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((item) => LowStockProduct.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load low stock products');
    }
  }

  // Get recent transactions
  static Future<List<RecentTransaction>> getRecentTransactions({
    int limit = 10,
  }) async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/api/dashboard/transactions?limit=$limit'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((item) => RecentTransaction.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load recent transactions');
    }
  }

  // Check in product
  static Future<void> checkInProduct(String productId, String userId) async {
    final headers = await getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/api/inventory/check-in'),
      headers: headers,
      body: jsonEncode({'productId': productId, 'userId': userId}),
    );

    if (response.statusCode != 200) {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Failed to check in product');
    }
  }

  // Check out product
  static Future<void> checkOutProduct(String productId, String userId) async {
    final headers = await getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/api/inventory/check-out'),
      headers: headers,
      body: jsonEncode({'productId': productId, 'userId': userId}),
    );

    if (response.statusCode != 200) {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Failed to check out product');
    }
  }
}
