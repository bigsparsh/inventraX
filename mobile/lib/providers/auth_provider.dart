import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  // Initialize - check if user is already logged in
  Future<void> initialize() async {
    final token = await ApiService.getToken();
    if (token != null) {
      // Token exists, but we need to validate it
      // For now, we'll just set loading to false
      // In production, you'd want to validate the token with the server
      notifyListeners();
    }
  }

  // Login
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.login(email, password);
      if (response['success'] == true && response['user'] != null) {
        _user = User.fromJson(response['user']);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        throw Exception('Invalid response from server');
      }
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Register
  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required String dob,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiService.register(
        name: name,
        email: email,
        password: password,
        dob: dob,
        role: 'STAFF',
      );
      
      if (response['success'] == true && response['user'] != null) {
        _user = User.fromJson(response['user']);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        throw Exception('Invalid response from server');
      }
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    await ApiService.clearToken();
    _user = null;
    _error = null;
    notifyListeners();
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
