const Admimetro = require("./admimetroModel");
const AnoCurricular = require("./anoCurricularModel");
const CargoFuncionario = require("./cargoFuncionarioModel");
const CargoFuncionarioRelation = require("./cargoFuncionarioRelationModel");
const CategoriaCurso = require("./categoriacursoModel");
const Curso = require("./cursoModel");
const Disciplina = require("./disciplinaModel");
const EstudanteInscricao = require("./EstudanteInscricaoModel");
const Funcionario = require("./funcionarioModel");
const Periodo = require("./periodoModel");
const Professor = require("./professorModel");
const Semestre = require("./semestreModel");

Admimetro.hasMany(CategoriaCurso, { foreignKey: "idadm" });
CategoriaCurso.belongsTo(Admimetro, { foreignKey: "idadm" });

Admimetro.hasMany(Funcionario, { foreignKey: "idadm" });
Funcionario.belongsTo(Admimetro, { foreignKey: "idadm" });

Admimetro.hasMany(Professor, { foreignKey: "idadm" });
Professor.belongsTo(Admimetro, { foreignKey: "idadm" });

Admimetro.hasMany(Disciplina, { foreignKey: "idadm" });
Disciplina.belongsTo(Admimetro, { foreignKey: "idadm" });

Admimetro.hasMany(CargoFuncionario, { foreignKey: "idadm" });
CargoFuncionario.belongsTo(Admimetro, { foreignKey: "idadm" });

CategoriaCurso.hasMany(Curso, { foreignKey: "idcategoriacurso" });
Curso.belongsTo(CategoriaCurso, { foreignKey: "idcategoriacurso" });

Curso.hasMany(AnoCurricular, { foreignKey: "idcurso" });
AnoCurricular.belongsTo(Curso, { foreignKey: "idcurso" });



Professor.belongsToMany(Disciplina, {
  through: DiscProf,
  foreignKey: "idprofessor"
});

Disciplina.belongsToMany(Professor, {
  through: DiscProf,
  foreignKey: "iddisciplina"
});

Disciplina.belongsTo(Admimetro, { foreignKey: "idadm" });

Curso.hasMany(EstudanteInscricao, { foreignKey: "idcurso" });
EstudanteInscricao.belongsTo(Curso, { foreignKey: "idcurso" });

Periodo.belongsTo(AnoCurricular, { foreignKey: "idanocurricular" });
AnoCurricular.hasMany(Periodo, { foreignKey: "idanocurricular" });

Periodo.belongsTo(CategoriaCurso, { foreignKey: "idcategoriacurso" });
CategoriaCurso.hasMany(Periodo, { foreignKey: "idcategoriacurso" });

Periodo.belongsTo(Curso, { foreignKey: "idcurso" });
Curso.hasMany(Periodo, { foreignKey: "idcurso" });

Semestre.belongsTo(CategoriaCurso, { foreignKey: "idcategoriacurso" });
CategoriaCurso.hasMany(Semestre, { foreignKey: "idcategoriacurso" });

Semestre.belongsTo(Curso, { foreignKey: "idcurso" });
Curso.hasMany(Semestre, { foreignKey: "idcurso" });

Semestre.belongsTo(Disciplina, { foreignKey: "iddisciplina" });
Disciplina.hasMany(Semestre, { foreignKey: "iddisciplina" });

Semestre.belongsTo(AnoCurricular, { foreignKey: "idanocurricular" });
AnoCurricular.hasMany(Semestre, { foreignKey: "idanocurricular" });