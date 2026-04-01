const { DataTypes } = require("sequelize");
const conexao = require("../infra/conexao");

const EstudanteInscricao = conexao.define(
  "estudanteinscricao",
  {
    id_estudanteinscricao: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome_estudanteinscricao: DataTypes.STRING,
    contacto_estudanteinscricao: {
      type: DataTypes.STRING,
      unique: true,
    },
    email_estudanteinscricao: {
      type: DataTypes.STRING,
      unique: true,
    },
    sexo_estudanteinscricao: DataTypes.STRING,
    periodo_estudanteinscricao: DataTypes.STRING,
    idcurso: DataTypes.INTEGER,
    documento_estudanteinscricao: DataTypes.STRING,
    foto_estudanteinscricao: DataTypes.STRING,
    senha_estudanteinscricao: DataTypes.STRING,
    bi_estudanteinscricao: DataTypes.STRING,
    numeroinscricao_estudanteinscricao: DataTypes.STRING,
    pdf_inscricaorupe: DataTypes.STRING,
    pdf_matricularupe: DataTypes.STRING,
    estado_estdanteinscrito: {
      type: DataTypes.STRING,
      defaultValue: "Pendente",
      validate: {
        isIn: [
          ["Aprovado", "Reprovado", "Admitido", "Não Admitido", "Pendente"],
        ],
      },
    },
  },
  {
    tableName: "estudanteinscricao",
    timestamps: false,
  },
);

module.exports = EstudanteInscricao;