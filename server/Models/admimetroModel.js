const { DataTypes } = require("sequelize");
const conexao = require("../infra/conexao");
const CategoriaCurso = require("./categoriacursoModel");
const Funcionario = require("./funcionarioModel");
const Professor = require("./professorModel");
const Disciplina = require("./disciplinaModel");
const CargoFuncionario = require("./cargoFuncionarioModel");

const Admimetro = conexao.define(
  "admimetro",
  {
    idadm: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nomeadm: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emailadm: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactoadm: DataTypes.STRING,
    senhaadm: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "admimetro",
    timestamps: false,
    freezeTableName: true,
  },
);




conexao.sync();

module.exports = Admimetro;
