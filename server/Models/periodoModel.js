const { DataTypes } = require("sequelize");
const conexao = require("../infra/conexao");
const AnoCurricular = require("./anoCurricularModel");
const CategoriaCurso = require("./categoriacursoModel");
const Curso = require("./cursoModel");

const Periodo = conexao.define(
  "periodo",
  {
    idperiodo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idanocurricular: DataTypes.INTEGER,
    idcategoriacurso: DataTypes.INTEGER,
    idcurso: DataTypes.INTEGER,
    periodo: DataTypes.STRING,
    turma: DataTypes.STRING,
    anoletivo: DataTypes.STRING,
  },
  {
    tableName: "periodo",
    timestamps: false,
  },
);



module.exports = Periodo;
