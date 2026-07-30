class Materia {
  final int idMateria;
  final String nombreMateria;
  final int anioCarrera;

  Materia({required this.idMateria, required this.nombreMateria, required this.anioCarrera});

  factory Materia.fromJson(Map<String, dynamic> json) {
    return Materia(
      idMateria: json['idMateria'] as int,
      nombreMateria: json['nombreMateria'] as String,
      anioCarrera: json['anioCarrera'] as int,
    );
  }
}
