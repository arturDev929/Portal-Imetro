const { DataTypes } = require("sequelize");
const conexao = require("../infra/conexao");

const CargoFuncionario = conexao.define(
  "cargo_funcionario",
  {
    id_cargo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cargo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idadm: DataTypes.INTEGER,
  },
  {
    tableName: "cargo_funcionario",
    timestamps: false,
  },
);

module.exports = CargoFuncionario;
