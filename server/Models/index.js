const Sequelize = require("sequelize");
const conexao = require("../infra/conexao");
const Funcionario = require("./funcionarioModel");
const CargoFuncionario = require("./cargoFuncionarioModel");
const CargoFuncionarioRelation = require("./cargoFuncionarioRelationModel");
const Professor = require("./professorModel");
const Disciplina = require("./disciplinaModel");
const DiscProf = require("./disc_profModel");
const Admimetro = require("./admimetroModel");
const CategoriaCurso = require("./categoriacursoModel");
const Curso = require("./cursoModel");
const AnoCurricular = require("./anoCurricularModel");
const EstudanteInscricao = require("./EstudanteInscricaoModel");
const Periodo = require("./periodoModel");
const Semestre = require("./semestreModel");

CargoFuncionarioRelation.belongsTo(CargoFuncionario, {
  foreignKey: "id_cargo",
});

CargoFuncionario.hasMany(CargoFuncionarioRelation, {
  foreignKey: "id_cargo",
});

DiscProf.belongsTo(Professor, {
  foreignKey: "idprofessor"
});

Professor.hasMany(DiscProf, {
  foreignKey: "idprofessor"
});


DiscProf.belongsTo(Disciplina, {
  foreignKey: "iddisciplina"
});

Disciplina.hasMany(DiscProf, {
  foreignKey: "iddisciplina"
});

CategoriaCurso.hasMany(Curso, { foreignKey: "idcategoriacurso" });
Curso.belongsTo(CategoriaCurso, { foreignKey: "idcategoriacurso" });

Curso.hasMany(AnoCurricular, { foreignKey: "idcurso" });
AnoCurricular.belongsTo(Curso, { foreignKey: "idcurso" });

Curso.hasMany(EstudanteInscricao, { foreignKey: "idcurso" });
EstudanteInscricao.belongsTo(Curso, { foreignKey: "idcurso" });

Professor.belongsToMany(Disciplina, {
  through: DiscProf,
  foreignKey: "idprofessor",
});
Disciplina.belongsToMany(Professor, {
  through: DiscProf,
  foreignKey: "iddisciplina",
});

Disciplina.belongsTo(Admimetro, { foreignKey: "idadm" });

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

Funcionario.belongsToMany(CargoFuncionario, {
  through: CargoFuncionarioRelation,
  foreignKey: "id_funcionario",
});

CargoFuncionario.belongsToMany(Funcionario, {
  through: CargoFuncionarioRelation,
  foreignKey: "id_cargo",
});

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

Curso.belongsTo(CategoriaCurso, { foreignKey: "idcategoriacurso" });
Curso.hasMany(Semestre, { foreignKey: "idcurso" });

Funcionario.hasMany(CargoFuncionarioRelation, {
  foreignKey: "id_funcionario",
});

CargoFuncionarioRelation.belongsTo(Funcionario, {
  foreignKey: "id_funcionario",
});

// N:N
Funcionario.belongsToMany(CargoFuncionario, {
  through: CargoFuncionarioRelation,
  foreignKey: "id_funcionario",
});

CargoFuncionario.belongsToMany(Funcionario, {
  through: CargoFuncionarioRelation,
  foreignKey: "id_cargo",
});

module.exports = {
  Funcionario,
  CargoFuncionario,
  CargoFuncionarioRelation,
};
