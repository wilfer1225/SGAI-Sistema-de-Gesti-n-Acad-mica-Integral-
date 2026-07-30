import 'package:flutter_test/flutter_test.dart';
import 'package:sgai_app/main.dart';

void main() {
  testWidgets('muestra la pantalla de inicio de sesión', (tester) async {
    await tester.pumpWidget(const SgaiApp());
    expect(find.text('SGAI'), findsOneWidget);
    expect(find.text('Email institucional'), findsOneWidget);
    expect(find.text('Contraseña'), findsOneWidget);
  });
}
