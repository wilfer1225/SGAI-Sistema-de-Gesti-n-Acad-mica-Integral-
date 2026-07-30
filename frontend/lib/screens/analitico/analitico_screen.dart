import 'package:flutter/material.dart';
import '../../services/api_service.dart';

/// RF02: El sistema debe mostrar el estado académico (analítico) del alumno.
/// Pantalla pendiente de desarrollo completo (Hito 3-4, ver planificación de Sprints).
class AnaliticoScreen extends StatelessWidget {
  final ApiService api;
  const AnaliticoScreen({super.key, required this.api});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mi Analítico')),
      body: const Center(child: Text('Listado de materias aprobadas/pendientes (a implementar).')),
    );
  }
}
