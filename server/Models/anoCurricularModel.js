const { DataTypes } = require("sequelize");
const conexao = require("../infra/conexao");

const AnoCurricular = conexao.define(
  "anocurricular",
  {
    idanocurricular: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    anocurricular: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["1", "2", "3", "4", "5"]],
      },
    },
    idcurso: DataTypes.INTEGER,
  },
  {
    tableName: "anocurricular",
    timestamps: false,
  },
);

module.exports = AnoCurricular;
