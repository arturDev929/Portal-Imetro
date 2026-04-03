const conexao = require("../infra/conexao");
const bcrypt = require("bcrypt");
const Estudante = require("../Models/EstudanteInscricaoModel");
const fs = require("fs");
const path = require("path");
//const { gerarImagemIniciais } = require("../utils/gerarimagem");;

const registarEstudante = async (req, res) => {
  try {
    const {
      nomeEstudante,
      contactoEstudante,
      numEstudante,
      idCursos,
      senhaEstudante,
      senhaConfirmar,
    } = req.body;

    if (
      !nomeEstudante ||
      !contactoEstudante ||
      !numEstudante ||
      !idCursos ||
      !senhaEstudante
    ) {
      return res.status(400).json({
        sucesso: false,
        tipo: "erro",
        titulo: "Campos obrigatórios",
        mensagem: "Todos os campos são obrigatórios!",
      });
    }

    if (senhaEstudante !== senhaConfirmar) {
      return res.status(400).json({
        sucesso: false,
        tipo: "erro",
        titulo: "Senhas não coincidem",
        mensagem: "As senhas não coincidem!",
      });
    }

    const estudanteExistente = await Estudante.findOne({
      where: { numEstudante },
    });

    if (estudanteExistente) {
      return res.status(400).json({
        sucesso: false,
        tipo: "erro",
        titulo: "Matrícula existente",
        mensagem: "Número de matrícula já está em uso!",
      });
    }

    const curso = await Curso.findByPk(idCursos);
    if (!curso) {
      return res.status(404).json({
        sucesso: false,
        tipo: "erro",
        titulo: "Curso não encontrado",
        mensagem: "O curso selecionado não existe",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senhaEstudante, salt);

    let nomeFoto = gerarImagemIniciais(nomeEstudante);
    if (!nomeFoto) {
      nomeFoto = `estudante_default_${Date.now()}.png`;
    }

    const novoEstudante = await Estudante.create({
      nomeEstudante,
      fotoEstudante: nomeFoto,
      contactoEstudante,
      numEstudante,
      senhaEstudante: senhaCriptografada,
      idCursos,
    });

    return res.status(201).json({
      sucesso: true,
      tipo: "sucesso",
      titulo: "Cadastro realizado!",
      mensagem: "Estudante registrado com sucesso!",
      redirect: "/",
      dados: {
        idEstudante: novoEstudante.idEstudante,
        nomeEstudante: novoEstudante.nomeEstudante,
        numEstudante: novoEstudante.numEstudante,
        foto: novoEstudante.fotoEstudante,
      },
    });
  } catch (erro) {
    console.error("Erro no endpoint de registro:", erro);

    if (
      req.body.nomeFoto &&
      fs.existsSync(
        path.join(
          __dirname,
          "../../client/src/img/estudantes",
          req.body.nomeFoto,
        ),
      )
    ) {
      fs.unlinkSync(
        path.join(
          __dirname,
          "../../client/src/img/estudantes",
          req.body.nomeFoto,
        ),
      );
      console.log("Imagem removida devido ao erro");
    }

    return res.status(500).json({
      sucesso: false,
      tipo: "erro",
      titulo: "Erro interno",
      mensagem: "Erro interno do servidor",
    });
  }
};

module.exports = { registarEstudante };
