import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/alumno.dart';
import '../services/api_service.dart';

/// Estado de sesión único para toda la aplicación.
class AuthProvider extends ChangeNotifier {
  AuthProvider({ApiService? api}) : api = api ?? ApiService(baseUrl: 'http://localhost:3000');

  final ApiService api;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  Alumno? alumno;
  bool cargando = false;

  Future<void> login(String email, String password) async {
    cargando = true;
    notifyListeners();
    try {
      final result = await api.login(email, password);
      final token = result['token'] as String;
      api.setToken(token);
      await _storage.write(key: 'auth_token', value: token);
      alumno = Alumno.fromJson(result['alumno'] as Map<String, dynamic>);
    } finally {
      cargando = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    alumno = null;
    await _storage.delete(key: 'auth_token');
    notifyListeners();
  }
}
