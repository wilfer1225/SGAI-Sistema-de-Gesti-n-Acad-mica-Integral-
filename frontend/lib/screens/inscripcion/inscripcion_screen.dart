import 'package:flutter/material.dart';

import '../../models/alumno.dart';
import '../../services/api_service.dart';

class InscripcionScreen extends StatefulWidget {
  final ApiService api;
  final Alumno alumno;

  const InscripcionScreen({
    super.key,
    required this.api,
    required this.alumno,
  });

  @override
  State<InscripcionScreen> createState() => _InscripcionScreenState();
}

class _InscripcionScreenState extends State<InscripcionScreen>
    with SingleTickerProviderStateMixin {
  late TabController tabs;

  late Future<List<dynamic>> cursadas;
  late Future<List<dynamic>> mesas;
  late Future<List<dynamic>> inscripciones;

  String? message;

  @override
  void initState() {
    super.initState();

    tabs = TabController(
      length: 3,
      vsync: this,
    );

    cargarDatos();
  }

  void cargarDatos() {
    cursadas = widget.api.getJson<List<dynamic>>(
      '/oferta/cursadas',
    );

    mesas = widget.api.getJson<List<dynamic>>(
      '/oferta/mesas',
    );

    inscripciones = widget.api.getJson<List<dynamic>>(
      '/inscripcion/${widget.alumno.legajo}',
    );
  }

  Future<void> enroll(
    String path,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await widget.api.postJson(
        path,
        data,
      );

      if (!mounted) return;

      setState(() {
        message = 'Inscripción confirmada. '
            'Comprobante: '
            '${response['comprobante'] ?? response['idInscripcion']}';

        cargarDatos();
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        message = e.toString();
      });
    }
  }

  Future<void> confirmarBaja(
    Map<String, dynamic> inscripcion,
  ) async {
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text(
            'Dar de baja',
          ),
          content: Text(
            '¿Seguro que querés dar de baja la inscripción '
            'a ${inscripcion['nombreMateria'] ?? 'esta materia'}?',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(
                  context,
                  false,
                );
              },
              child: const Text(
                'Cancelar',
              ),
            ),
            FilledButton(
              onPressed: () {
                Navigator.pop(
                  context,
                  true,
                );
              },
              child: const Text(
                'Dar de baja',
              ),
            ),
          ],
        );
      },
    );

    if (confirmar != true) {
      return;
    }

    await darDeBaja(
      inscripcion['idInscripcion'],
    );
  }

  Future<void> darDeBaja(
    dynamic idInscripcion,
  ) async {
    try {
      await widget.api.deleteJson(
        '/inscripcion/$idInscripcion',
      );

      if (!mounted) return;

      setState(() {
        message = 'La inscripción fue dada de baja correctamente.';

        cargarDatos();
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Inscripción dada de baja correctamente',
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;

      setState(() {
        message = e.toString();
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            e.toString(),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Inscripciones',
        ),
        bottom: TabBar(
          controller: tabs,
          tabs: const [
            Tab(
              text: 'Cursadas',
            ),
            Tab(
              text: 'Finales',
            ),
            Tab(
              text: 'Mis inscripciones',
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          if (message != null)
            Container(
              width: double.infinity,
              margin: const EdgeInsets.all(8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                message!,
              ),
            ),
          Expanded(
            child: TabBarView(
              controller: tabs,
              children: [
                listaOferta(
                  cursadas,
                  true,
                ),
                listaOferta(
                  mesas,
                  false,
                ),
                listaInscripciones(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget listaOferta(
    Future<List<dynamic>> future,
    bool esCursada,
  ) {
    return FutureBuilder<List<dynamic>>(
      future: future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: CircularProgressIndicator(),
          );
        }

        if (snapshot.hasError) {
          return Center(
            child: Text(
              'Error: ${snapshot.error}',
            ),
          );
        }

        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(
            child: Text(
              'No hay inscripciones disponibles.',
            ),
          );
        }

        return ListView(
          padding: const EdgeInsets.all(12),
          children: snapshot.data!
              .map<Widget>(
                (item) => Card(
                  child: ListTile(
                    title: Text(
                      item['nombreMateria'],
                    ),
                    subtitle: Text(
                      esCursada
                          ? '${item['nombre']} · '
                              '${item['diasHorarios']}\n'
                              '${item['docente']} · '
                              'Cupos: ${item['cupos']}'
                          : '${item['fechaHora']} · '
                              '${item['aula']}\n'
                              '${item['tribunal']}\n'
                              'Condición: '
                              '${item['condicion']}',
                    ),
                    isThreeLine: true,
                    trailing: FilledButton(
                      onPressed: () {
                        enroll(
                          esCursada
                              ? '/inscripcion/cursada'
                              : '/inscripcion/final',
                          {
                            esCursada ? 'idComision' : 'idMesa':
                                esCursada ? item['idComision'] : item['idMesa'],
                          },
                        );
                      },
                      child: const Text(
                        'Inscribirme',
                      ),
                    ),
                  ),
                ),
              )
              .toList(),
        );
      },
    );
  }

  Widget listaInscripciones() {
    return FutureBuilder<List<dynamic>>(
      future: inscripciones,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: CircularProgressIndicator(),
          );
        }

        if (snapshot.hasError) {
          return Center(
            child: Text(
              'Error: ${snapshot.error}',
            ),
          );
        }

        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(
            child: Text(
              'No tenés inscripciones registradas.',
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            setState(() {
              cargarDatos();
            });

            await inscripciones;
          },
          child: ListView(
            padding: const EdgeInsets.all(12),
            children: snapshot.data!.map<Widget>(
              (inscripcion) {
                final estado = inscripcion['estado'] ?? 'Confirmada';

                final puedeDarBaja = estado == 'Confirmada';

                return Card(
                  child: ListTile(
                    title: Text(
                      inscripcion['nombreMateria'] ?? 'Materia',
                    ),
                    subtitle: Text(
                      'Tipo: '
                      '${inscripcion['tipoInstancia'] ?? '-'}\n'
                      'Estado: $estado',
                    ),
                    isThreeLine: true,
                    trailing: puedeDarBaja
                        ? FilledButton.tonal(
                            onPressed: () {
                              confirmarBaja(
                                inscripcion,
                              );
                            },
                            child: const Text(
                              'Dar de baja',
                            ),
                          )
                        : const Chip(
                            label: Text(
                              'Anulada',
                            ),
                          ),
                  ),
                );
              },
            ).toList(),
          ),
        );
      },
    );
  }

  @override
  void dispose() {
    tabs.dispose();
    super.dispose();
  }
}
