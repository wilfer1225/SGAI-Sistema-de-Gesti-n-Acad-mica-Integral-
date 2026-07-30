import 'package:flutter/material.dart';
import 'screens/login/login_screen.dart';

void main() {
  runApp(const SgaiApp());
}

class SgaiApp extends StatelessWidget {
  const SgaiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SGAI',
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF1F3864),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}
