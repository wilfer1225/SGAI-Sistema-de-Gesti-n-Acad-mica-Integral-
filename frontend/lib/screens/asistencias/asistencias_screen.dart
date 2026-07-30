import 'package:flutter/material.dart';

/// RF05: El sistema debe mostrar el registro de asistencias/inasistencias
/// del ciclo lectivo. Pantalla pendiente de desarrollo completo.
class AsistenciasScreen extends StatelessWidget {
  const AsistenciasScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mis Asistencias')),
      body: const Center(child: Text('Registro de asistencias por materia (a implementar).')),
    );
  }
}
