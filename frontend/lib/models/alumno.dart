class Alumno {
  final int legajo;
  final String nombreCompleto;

  Alumno({required this.legajo, required this.nombreCompleto});

  factory Alumno.fromJson(Map<String, dynamic> json) {
    return Alumno(
      legajo: json['legajo'] as int,
      nombreCompleto: json['nombreCompleto'] as String,
    );
  }
}
