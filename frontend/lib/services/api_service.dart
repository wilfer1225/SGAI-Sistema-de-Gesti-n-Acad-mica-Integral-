import 'dart:convert';
import 'package:http/http.dart' as http;

/// Cliente HTTP centralizado que consume la API REST del backend SGAI.
/// Todas las pantallas consumen la API a través de este servicio
/// (nunca hacen llamadas HTTP directas), siguiendo la separación de capas
/// definida en la Arquitectura del Sistema (Sección 6.2).
class ApiService {
  final String baseUrl;
  String? _token;

  ApiService({required this.baseUrl});

  void setToken(String token) => _token = token;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Future<Map<String, dynamic>> login(String email) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: _headers,
      body: jsonEncode({'email': email}),
    );
    if (res.statusCode != 200) {
      throw Exception('Credenciales inválidas');
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<List<dynamic>> getMaterias() async {
    final res = await http.get(Uri.parse('$baseUrl/api/materias'), headers: _headers);
    if (res.statusCode != 200) throw Exception('Error al obtener materias');
    return jsonDecode(res.body) as List<dynamic>;
  }

  Future<Map<String, dynamic>> inscribirse(int legajo, int idMateria, String tipoInstancia) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/inscripcion'),
      headers: _headers,
      body: jsonEncode({'legajo': legajo, 'idMateria': idMateria, 'tipoInstancia': tipoInstancia}),
    );
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 403) {
      throw Exception('No cumple correlativas: ${body['faltantes']}');
    }
    if (res.statusCode != 201) throw Exception('Error al inscribirse');
    return body;
  }
}
