const { DataTypes } = require("sequelize");
const conexao = require("../infra/conexao");

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
