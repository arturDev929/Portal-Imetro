const { DataTypes } = require("sequelize");
const conexao = require("../infra/conexao");
const CargoFuncionario = require("./cargoFuncionarioModel");
const CargoFuncionarioRelation = conexao.define(
  "cargo_funcionario_relation",
  {
    id_cargo_funcionario_relation: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_cargo: DataTypes.INTEGER,
    id_funcionario: DataTypes.INTEGER,
  },
  {
    tableName: "cargo_funcionario_relation",
    timestamps: false,
  },
);



module.exports = CargoFuncionarioRelation;
