import 'package:flutter/material.dart';
<<<<<<< HEAD
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
class AsistenciasScreen extends StatefulWidget { const AsistenciasScreen({super.key}); @override State<AsistenciasScreen> createState()=>_S(); }
class _S extends State<AsistenciasScreen>{ late Future<List<dynamic>> data;
 @override void initState(){super.initState();final a=context.read<AuthProvider>();data=a.api.getJson('/alumnos/${a.alumno!.legajo}/asistencias') as Future<List<dynamic>>;}
 Color color(num p)=>p>=75?Colors.green:p>=65?Colors.amber:Colors.red;
 @override Widget build(BuildContext c)=>Scaffold(appBar:AppBar(title:const Text('Mis Asistencias')),body:FutureBuilder<List<dynamic>>(future:data,builder:(c,s){if(!s.hasData)return const Center(child:CircularProgressIndicator());return ListView(padding:const EdgeInsets.all(16),children:[const Text('2° Cuatrimestre 2026',style:TextStyle(fontWeight:FontWeight.bold)),...s.data!.map<Widget>((x){final p=(x['porcentaje']??0) as num;return Card(child:ListTile(onTap:()=>detail(x),leading:CircleAvatar(backgroundColor:color(p),child:Text('$p%')),title:Text(x['nombreMateria']),subtitle:Text('${x['diasHorarios']}\n${x['presentes']} presentes · ${x['ausentes']} ausentes · ${x['clases']} clases'),trailing:Text(p<75?'En alerta':'Regular')));})]);}));
 Future<void> detail(dynamic x)async{final data=await context.read<AuthProvider>().api.getJson('/asistencias/${x['idComision']}') as List; if(!mounted)return;showModalBottomSheet(context:context,builder:(_)=>ListView(children:[const ListTile(title:Text('Detalle de clases')),...data.map<Widget>((d)=>ListTile(title:Text('${d['fecha']} · ${d['estado']}'),subtitle:Text(d['justificada']==true?'Justificada':'Sin justificación')))]));}
=======
import '../../services/api_service.dart';
import '../../models/alumno.dart';

/// RF05: El sistema debe mostrar el registro de asistencias/inasistencias
/// del ciclo lectivo. Implementación básica con datos mock desde backend.
class AsistenciasScreen extends StatefulWidget {
  final ApiService api;
  final Alumno alumno;
  const AsistenciasScreen({super.key, required this.api, required this.alumno});

  @override
  State<AsistenciasScreen> createState() => _AsistenciasScreenState();
}

class _AsistenciasScreenState extends State<AsistenciasScreen> {
  bool _loading = true;
  String? _error;
  List<dynamic> _materias = [];

  @override
  void initState() {
    super.initState();
    _fetchAsistencias();
  }

  Future<void> _fetchAsistencias() async {
    try {
      final d = await widget.api.getAsistencias(widget.alumno.legajo);
      setState(() {
        _materias = (d['materias'] as List<dynamic>);
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
      appBar: AppBar(title: const Text('Mis Asistencias')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? Center(child: Text('Error: $_error'))
                : ListView.builder(
                    itemCount: _materias.length,
                    itemBuilder: (context, i) {
                      final m = _materias[i] as Map<String, dynamic>;
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 8),
                        child: ListTile(
                          title: Text(m['nombreMateria'] ?? ''),
                          subtitle: Text('${m['presentes']} presentes · ${m['ausentes']} ausentes · ${m['dictadas']} dictadas'),
                          trailing: _buildSemaforo(m['porcentaje'] as int),
                          onTap: () => _mostrarDetalle(m),
                        ),
                      );
                    },
                  ),
      ),
    );
  }

  Widget _buildSemaforo(int porcentaje) {
    Color color;
    if (porcentaje >= 85) color = Colors.green;
    else if (porcentaje >= 75) color = Colors.yellow[700]!;
    else color = Colors.red;
    return CircleAvatar(backgroundColor: color, child: Text('$porcentaje%'));
  }

  void _mostrarDetalle(Map<String, dynamic> m) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Detalle de faltas - ${m['nombreMateria']}'),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView(
            shrinkWrap: true,
            children: (m['faltas'] as List<dynamic>).map((f) {
              final ff = f as Map<String, dynamic>;
              return ListTile(
                title: Text(ff['fecha'] ?? ''),
                trailing: Text(ff['justificada'] ? 'Justificada' : 'Injustificada'),
              );
            }).toList(),
          ),
        ),
        actions: [TextButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Cerrar'))],
      ),
    );
  }
>>>>>>> 0e83a652029a0aaf2432beb1b372c07b6ea0bdbb
}
