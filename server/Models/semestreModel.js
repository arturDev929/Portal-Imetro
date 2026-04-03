const { DataTypes } = require("sequelize");
const conexao = require("../infra/conexao");
const CategoriaCurso = require("./categoriacursoModel");
const Curso = require("./cursoModel");
const Disciplina = require("./disciplinaModel");
const AnoCurricular = require("./anoCurricularModel");

const Semestre = conexao.define(
  "semestre",
  {
    idsemestre: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idcategoriacurso: DataTypes.INTEGER,
    idcurso: DataTypes.INTEGER,
    iddisciplina: DataTypes.INTEGER,
    semestre: {
      type: DataTypes.STRING,
      validate: {
        isIn: [["1", "2"]],
      },
    },
    idanocurricular: DataTypes.INTEGER,
  },
  {
    tableName: "semestre",
    timestamps: false,
  },
);



module.exports = Semestre;
