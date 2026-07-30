import 'package:flutter/material.dart';
<<<<<<< HEAD
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class AnaliticoScreen extends StatefulWidget { const AnaliticoScreen({super.key}); @override State<AnaliticoScreen> createState()=>_AnaliticoScreenState(); }
class _AnaliticoScreenState extends State<AnaliticoScreen>{ late Future<Map<String,dynamic>> _data; String _estado='Todos';
 @override void initState(){super.initState();_data=_load();} Future<Map<String,dynamic>> _load() async=>await context.read<AuthProvider>().api.getJson('/alumnos/${context.read<AuthProvider>().alumno!.legajo}/analitico');
 @override Widget build(BuildContext c)=>Scaffold(appBar:AppBar(title:const Text('Mi Analítico')),body:FutureBuilder<Map<String,dynamic>>(future:_data,builder:(c,s){if(!s.hasData)return const Center(child:CircularProgressIndicator());final d=s.data!;final r=d['resumen'];final all=List<Map<String,dynamic>>.from(d['materias']);final ms=_estado=='Todos'?all:all.where((m)=>m['estado']==_estado).toList();return ListView(padding:const EdgeInsets.all(16),children:[Card(child:Padding(padding:const EdgeInsets.all(16),child:Row(mainAxisAlignment:MainAxisAlignment.spaceAround,children:[_metric('${r['avance']}%','Avance'),_metric('${r['aprobadas']}/${r['total']}','Aprobadas'),_metric('${r['promedio']??'-'}','Promedio')]))),DropdownButton<String>(value:_estado,isExpanded:true,items:['Todos','Aprobada','Regularizada','Libre','En curso','Pendiente'].map((x)=>DropdownMenuItem(value:x,child:Text('Estado: $x'))).toList(),onChanged:(x)=>setState(()=>_estado=x!)),...ms.map((m)=>Card(child:ListTile(title:Text(m['nombreMateria']),subtitle:Text('Año ${m['anioCarrera']} · ${m['estado']}\nNota: ${m['notaFinal']??'-'} · Acta: ${m['fechaAprobacion']??'-'} · T/F: ${m['tomo']??'-'}/${m['folio']??'-'}'),trailing:(m['desbloquea'] as List).isNotEmpty?const Icon(Icons.account_tree):null))) ]); }));
 Widget _metric(String n,String l)=>Column(children:[Text(n,style:const TextStyle(fontSize:23,fontWeight:FontWeight.bold)),Text(l)]);
=======
import '../../services/api_service.dart';
import '../../models/alumno.dart';

/// RF02: El sistema debe mostrar el estado académico (analítico) del alumno.
class AnaliticoScreen extends StatefulWidget {
  final ApiService api;
  final Alumno alumno;
  const AnaliticoScreen({super.key, required this.api, required this.alumno});

  @override
  State<AnaliticoScreen> createState() => _AnaliticoScreenState();
}

class _AnaliticoScreenState extends State<AnaliticoScreen> {
  bool _loading = true;
  String? _error;
  Map<String, dynamic>? _data;
  int _filterAnio = 0; // 0 = todos

  @override
  void initState() {
    super.initState();
    _fetchAnalitico();
  }

  Future<void> _fetchAnalitico() async {
    try {
      final d = await widget.api.getAnalitico(widget.alumno.legajo);
      setState(() {
        _data = d;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mi Analítico')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? Center(child: Text('Error: $_error'))
                : Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildResumen(),
                      const SizedBox(height: 16),
                      _buildFilters(),
                      const SizedBox(height: 8),
                      Expanded(child: _buildTablaMaterias()),
                    ],
                  ),
      ),
    );
  }

  Widget _buildResumen() {
    final resumen = _data!['resumen'] as Map<String, dynamic>;
    final porcentaje = (resumen['porcentajeAprobadas'] ?? 0) as int;
    final aprobadas = resumen['aprobadas'] as int;
    final total = resumen['totalMaterias'] as int;

    return Row(
      children: [
        SizedBox(
          width: 100,
          height: 100,
          child: Stack(
            alignment: Alignment.center,
            children: [
              CircularProgressIndicator(value: porcentaje / 100.0, strokeWidth: 10),
              Text('$porcentaje%'),
            ],
          ),
        ),
        const SizedBox(width: 16),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Materias aprobadas: $aprobadas / $total', style: const TextStyle(fontSize: 16)),
          const SizedBox(height: 8),
          Text('Promedio (mock): 8.2', style: const TextStyle(fontSize: 16)),
        ])
      ],
    );
  }

  Widget _buildFilters() {
    // Obtener lista de años disponibles
    final materias = (_data!['materias'] as List<dynamic>).cast<Map<String, dynamic>>();
    final anios = <int>{0};
    materias.forEach((m) => anios.add((m['anioCarrera'] as int)));

    final items = anios.toList()..sort();

    return Row(
      children: [
        const Text('Filtrar por año: '),
        const SizedBox(width: 8),
        DropdownButton<int>(
          value: _filterAnio,
          items: items.map((a) => DropdownMenuItem(value: a, child: Text(a == 0 ? 'Todos' : 'Año $a'))).toList(),
          onChanged: (v) => setState(() => _filterAnio = v ?? 0),
        ),
      ],
    );
  }

  Widget _buildTablaMaterias() {
    final materias = (_data!['materias'] as List<dynamic>).cast<Map<String, dynamic>>();
    final filtered = _filterAnio == 0 ? materias : materias.where((m) => m['anioCarrera'] == _filterAnio).toList();

    return SingleChildScrollView(
      child: DataTable(
        columns: const [
          DataColumn(label: Text('Materia')),
          DataColumn(label: Text('Estado')),
          DataColumn(label: Text('Nota')),
          DataColumn(label: Text('Fecha Aprov.')),
          DataColumn(label: Text('Tomo/Folio')),
          DataColumn(label: Text('Plan')),
        ],
        rows: filtered
            .map(
              (m) => DataRow(cells: [
                DataCell(Text(m['nombreMateria'] ?? '')),
                DataCell(Text(m['estado'] ?? '')),
                DataCell(Text((m['notaFinal'] ?? '-') .toString())),
                DataCell(Text((m['fechaAprobacion'] ?? '').toString().split('T').first)),
                DataCell(Text('${m['tomo'] ?? '-'} / ${m['folio'] ?? '-'}')),
                DataCell(Text(m['planEstudio'] ?? '-')),
              ]),
            )
            .toList(),
      ),
    );
  }
>>>>>>> 0e83a652029a0aaf2432beb1b372c07b6ea0bdbb
}
