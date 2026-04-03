const { DataTypes } = require("sequelize");
const conexao = require("../infra/conexao");
const Disciplina = require("./disciplinaModel");
const DiscProf = require("./disc_profModel");
const Professor = conexao.define(
  "professor",
  {
    idprofessor: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nomeprofessor: DataTypes.STRING,
    emailprofessor: {
      type: DataTypes.STRING,
      unique: true,
    },
    telefoneprofessor: {
      type: DataTypes.STRING,
      unique: true,
    },
    senhaprofessor: DataTypes.STRING,
    idadm: DataTypes.INTEGER,
    estado: {
      type: DataTypes.STRING,
      defaultValue: "Ativo",
    },
  },
  {
    tableName: "professor",
    timestamps: false,
  },
);

module.exports = Professor;
 