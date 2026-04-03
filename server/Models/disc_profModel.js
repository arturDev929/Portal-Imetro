const { DataTypes } = require("sequelize");
const conexao = require("../infra/conexao");

const DiscProf = conexao.define(
  "disc_prof",
  {
    iddiscprof: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idprofessor: DataTypes.INTEGER,
    iddisciplina: DataTypes.INTEGER,
  },
  {
    tableName: "disc_prof",
    timestamps: false,
  },
);

module.exports = DiscProf;
