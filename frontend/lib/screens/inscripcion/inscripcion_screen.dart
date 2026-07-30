import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../models/materia.dart';
import '../../models/alumno.dart';

/// RF03 / RF04: Inscripción a cursadas y a exámenes finales, validando
/// correlatividades a través del backend (correlativaService).
class InscripcionScreen extends StatefulWidget {
  final ApiService api;
  final Alumno alumno;
  const InscripcionScreen({super.key, required this.api, required this.alumno});

  @override
  State<InscripcionScreen> createState() => _InscripcionScreenState();
}

class _InscripcionScreenState extends State<InscripcionScreen> {
  List<Materia> _materias = [];
  String? _mensaje;

  @override
  void initState() {
    super.initState();
    _cargarMaterias();
  }

  Future<void> _cargarMaterias() async {
    final data = await widget.api.getMaterias();
    setState(() => _materias = data.map((m) => Materia.fromJson(m)).toList());
  }

  Future<void> _inscribirse(int idMateria) async {
    try {
      await widget.api.inscribirse(widget.alumno.legajo, idMateria, 'Cursada');
      setState(() => _mensaje = 'Inscripción confirmada.');
    } catch (e) {
      setState(() => _mensaje = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Inscripción a Cursadas')),
      body: Column(
        children: [
          if (_mensaje != null) Padding(padding: const EdgeInsets.all(8), child: Text(_mensaje!)),
          Expanded(
            child: ListView.builder(
              itemCount: _materias.length,
              itemBuilder: (context, i) {
                final m = _materias[i];
                return ListTile(
                  title: Text(m.nombreMateria),
                  subtitle: Text('Año ${m.anioCarrera}'),
                  trailing: ElevatedButton(
                    onPressed: () => _inscribirse(m.idMateria),
                    child: const Text('Inscribirse'),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
