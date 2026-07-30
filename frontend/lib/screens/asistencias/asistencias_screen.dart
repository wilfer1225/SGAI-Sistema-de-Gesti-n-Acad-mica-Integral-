import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
class AsistenciasScreen extends StatefulWidget { const AsistenciasScreen({super.key}); @override State<AsistenciasScreen> createState()=>_S(); }
class _S extends State<AsistenciasScreen>{ late Future<List<dynamic>> data;
 @override void initState(){super.initState();final a=context.read<AuthProvider>();data=a.api.getJson('/alumnos/${a.alumno!.legajo}/asistencias') as Future<List<dynamic>>;}
 Color color(num p)=>p>=75?Colors.green:p>=65?Colors.amber:Colors.red;
 @override Widget build(BuildContext c)=>Scaffold(appBar:AppBar(title:const Text('Mis Asistencias')),body:FutureBuilder<List<dynamic>>(future:data,builder:(c,s){if(!s.hasData)return const Center(child:CircularProgressIndicator());return ListView(padding:const EdgeInsets.all(16),children:[const Text('2° Cuatrimestre 2026',style:TextStyle(fontWeight:FontWeight.bold)),...s.data!.map<Widget>((x){final p=(x['porcentaje']??0) as num;return Card(child:ListTile(onTap:()=>detail(x),leading:CircleAvatar(backgroundColor:color(p),child:Text('$p%')),title:Text(x['nombreMateria']),subtitle:Text('${x['diasHorarios']}\n${x['presentes']} presentes · ${x['ausentes']} ausentes · ${x['clases']} clases'),trailing:Text(p<75?'En alerta':'Regular')));})]);}));
 Future<void> detail(dynamic x)async{final data=await context.read<AuthProvider>().api.getJson('/asistencias/${x['idComision']}') as List; if(!mounted)return;showModalBottomSheet(context:context,builder:(_)=>ListView(children:[const ListTile(title:Text('Detalle de clases')),...data.map<Widget>((d)=>ListTile(title:Text('${d['fecha']} · ${d['estado']}'),subtitle:Text(d['justificada']==true?'Justificada':'Sin justificación')))]));}
}
