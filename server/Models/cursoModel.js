const { DataTypes } = require("sequelize");
const conexao = require("../infra/conexao");

const Curso = sequelize.define(
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
