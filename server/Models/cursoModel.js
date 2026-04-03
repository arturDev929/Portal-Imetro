const { DataTypes } = require("sequelize");
const conexao = require("../infra/conexao");
const CategoriaCurso = require("./categoriacursoModel");
const AnoCurricular = require("./anoCurricularModel");
const EstudanteInscricao = require("./EstudanteInscricaoModel");

const Curso = conexao.define(
  "curso",
  {
    idcurso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    curso: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idcategoriacurso: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "curso",
    timestamps: false,
    freezeTableName: true,
  },
);


module.exports = Curso;
