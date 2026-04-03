const { DataTypes } = require("sequelize");
const conexao = require("../infra/conexao");
const Professor = require("./professorModel");
const Admimetro = require("./admimetroModel");
const DiscProf = require("./disc_profModel");

const Disciplina = conexao.define(
  "disciplina",
  {
    iddisciplina: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    disciplina: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idadm: DataTypes.INTEGER,
  },
  {
    tableName: "disciplina",
    timestamps: false,
  },
);



module.exports = Disciplina;
