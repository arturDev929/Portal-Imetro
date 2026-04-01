const { DataTypes } = require("sequelize");
const conexao = require("../infra/conexao");
const CategoriaCurso = conexao.define(
  "categoriacurso",
  {
    idcategoriacurso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoriacurso: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idadm: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "categoriacurso",
    timestamps: false,
  },
);

module.exports = CategoriaCurso;
