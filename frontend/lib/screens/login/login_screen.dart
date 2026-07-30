import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../models/alumno.dart';
import '../home/home_screen.dart';

/// RF01: El sistema debe permitir el inicio de sesión del estudiante.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _api = ApiService(baseUrl: 'http://localhost:3000');
  String? _error;
  bool _cargando = false;

  Future<void> _login() async {
    setState(() {
      _error = null;
      _cargando = true;
    });
    try {
      final result = await _api.login(_emailController.text.trim());
      _api.setToken(result['token'] as String);
      final alumno = Alumno.fromJson(result['alumno'] as Map<String, dynamic>);

      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => HomeScreen(api: _api, alumno: alumno)),
      );
    } catch (e) {
      setState(() => _error = 'No se pudo iniciar sesión. Verificá tus credenciales.');
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 400),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('SGAI', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
                const SizedBox(height: 24),
                TextField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: 'Email institucional'),
                ),
                const SizedBox(height: 16),
                if (_error != null) Text(_error!, style: const TextStyle(color: Colors.red)),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: _cargando ? null : _login,
                  child: _cargando
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Iniciar sesión'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
