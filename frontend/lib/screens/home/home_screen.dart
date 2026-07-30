import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../analitico/analitico_screen.dart';
import '../inscripcion/inscripcion_screen.dart';
import '../asistencias/asistencias_screen.dart';

/// Pantalla posterior al login: punto de entrada a los módulos funcionales
/// (RF02, RF03/RF04, RF05). Recibe el ApiService ya autenticado (con el
/// token seteado) y lo propaga a cada pantalla hija.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final alumno = auth.alumno!;
    final api = auth.api;
    return Scaffold(
      appBar: AppBar(title: Text('Hola, ${alumno.nombreCompleto}')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _MenuCard(
            icon: Icons.school,
            title: 'Mi Analítico',
            subtitle: 'Estado académico (RF02)',
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(
                  builder: (_) => AnaliticoScreen(api: api, alumno: alumno)),
            ),
          ),
          _MenuCard(
            icon: Icons.edit_calendar,
            title: 'Inscripción a Cursadas / Finales',
            subtitle: 'Valida correlatividades automáticamente (RF03/RF04)',
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(
                  builder: (_) => InscripcionScreen(api: api, alumno: alumno)),
            ),
          ),
          _MenuCard(
            icon: Icons.event_available,
            title: 'Mis Asistencias',
            subtitle: 'Registro de asistencias/inasistencias (RF05)',
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(
                  builder: (_) => AsistenciasScreen(api: api, alumno: alumno)),
            ),
          ),
        ],
      ),
    );
  }
}

class _MenuCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _MenuCard(
      {required this.icon,
      required this.title,
      required this.subtitle,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF1F3864)),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
