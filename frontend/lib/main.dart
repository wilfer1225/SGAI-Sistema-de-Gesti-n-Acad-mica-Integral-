import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'screens/login/login_screen.dart';

void main() {
  runApp(const SgaiApp());
}

class SgaiApp extends StatelessWidget {
  const SgaiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: MaterialApp(
        title: 'SGAI',
        theme: ThemeData(colorSchemeSeed: const Color(0xFF1F3864), useMaterial3: true),
        home: const LoginScreen(),
      ),
    );
  }
}
