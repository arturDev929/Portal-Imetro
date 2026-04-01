const { DataTypes } = require("sequelize");
const conexao = require("../infra/conexao");
const CargoFuncionario = require("./cargoFuncionarioModel");
const CargoFuncionarioRelation = require("./cargoFuncionarioRelationModel");

const Funcionario = conexao.define(
  "funcionario",
  {
    id_funcionario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome_funcionario: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contacto_funcionario: {
      type: DataTypes.STRING,
      unique: true,
    },
    bi_funcionario: {
      type: DataTypes.STRING,
      unique: true,
    },
    estado_funcionario: {
      type: DataTypes.STRING,
      defaultValue: "Ativo",
      validate: {
        isIn: [["Ativo", "Desativado"]],
      },
    },
    senha_funcionario: DataTypes.STRING,
    idadm: DataTypes.INTEGER,
  },
  {
    tableName: "funcionario",
    timestamps: false,
  },
);

Funcionario.belongsToMany(CargoFuncionario, {
  through: CargoFuncionarioRelation,
  foreignKey: "id_funcionario",
});

CargoFuncionario.belongsToMany(Funcionario, {
  through: CargoFuncionarioRelation,
  foreignKey: "id_cargo",
});

module.exports = Funcionario;
