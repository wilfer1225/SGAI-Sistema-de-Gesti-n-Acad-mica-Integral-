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

  Map<String, String> get _headers {
    final h = <String, String>{'Content-Type': 'application/json'};
    if (_token != null) {
      h['Authorization'] = 'Bearer ' + _token!;
    }
    return h;
  }

  // ----- MÉTODOS GENÉRICOS (versión HEAD) -----
  Future<T> getJson<T>(String path) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api$path'),
      headers: _headers,
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Error al obtener los datos');
    }

    return jsonDecode(response.body) as T;
  }

  Future<Map<String, dynamic>> postJson(
      String path, Map<String, dynamic> data) async {
    final res = await http.post(Uri.parse('$baseUrl/api$path'),
        headers: _headers, body: jsonEncode(data));
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode < 200 || res.statusCode > 299)
      throw Exception(body['error'] ?? 'La operación no pudo completarse');
    return body;
  }

  Future<Map<String, dynamic>> deleteJson(String path) async {
    final res = await http.delete(
      Uri.parse('$baseUrl/api$path'),
      headers: _headers,
    );

    Map<String, dynamic> body = {};

    if (res.body.isNotEmpty) {
      body = jsonDecode(res.body) as Map<String, dynamic>;
    }

    if (res.statusCode < 200 || res.statusCode > 299) {
      throw Exception(
        body['error'] ?? 'No se pudo dar de baja la inscripción',
      );
    }

    return body;
  }

  // ----- MÉTODOS ESPECÍFICOS PARA ANALÍTICO Y ASISTENCIAS (versión entrante) -----
  Future<Map<String, dynamic>> getAnalitico(int legajo) async {
    final res = await http.get(
        Uri.parse('$baseUrl/api/alumnos/$legajo/analitico'),
        headers: _headers);
    if (res.statusCode != 200) throw Exception('Error al obtener analítico');
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getAsistencias(int legajo) async {
    final res = await http.get(
        Uri.parse('$baseUrl/api/alumnos/$legajo/asistencias'),
        headers: _headers);
    if (res.statusCode != 200) throw Exception('Error al obtener asistencias');
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  // ----- MÉTODO LOGIN (version HEAD, pero corregido) -----
  Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (res.statusCode != 200) {
      throw Exception('Credenciales inválidas');
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  // ----- OTROS MÉTODOS QUE FALTABAN (de HEAD) -----
  Future<List<dynamic>> getMaterias() async {
    final res =
        await http.get(Uri.parse('$baseUrl/api/materias'), headers: _headers);
    if (res.statusCode != 200) throw Exception('Error al obtener materias');
    return jsonDecode(res.body) as List<dynamic>;
  }

  Future<Map<String, dynamic>> inscribirse(
      int legajo, int idMateria, String tipoInstancia) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/inscripcion'),
      headers: _headers,
      body: jsonEncode({
        'legajo': legajo,
        'idMateria': idMateria,
        'tipoInstancia': tipoInstancia
      }),
    );
    final body = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode == 403) {
      throw Exception('No cumple correlativas: ${body['faltantes']}');
    }
    if (res.statusCode != 201) throw Exception('Error al inscribirse');
    return body;
  }
}
