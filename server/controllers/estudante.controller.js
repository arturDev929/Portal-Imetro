const conexao = require("../infra/conexao");
const bcrypt = require("bcrypt");

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

    const verificarMatricula =
      "SELECT idEstudante FROM estudantes WHERE numEstudante = ?";
    conexao.query(
      verificarMatricula,
      [numEstudante],
      async (erro, resultados) => {
        if (erro) {
          console.error("Erro ao verificar matrícula:", erro);
          return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro no servidor",
            mensagem: "Erro interno do servidor",
          });
        }

        if (resultados.length > 0) {
          return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Matrícula existente",
            mensagem: "Número de matrícula já está em uso!",
          });
        }

        try {
          const salt = await bcrypt.genSalt(10);
          const senhaCriptografada = await bcrypt.hash(senhaEstudante, salt);
          let nomeFoto = gerarImagemIniciais(nomeEstudante);

          if (!nomeFoto) {
            console.log("Não foi possível gerar a imagem, usando padrão");
            nomeFoto = `estudante_default_${Date.now()}.png`;
          }

          const sql = `
                    INSERT INTO estudantes 
                    (nomeEstudante, fotoEstudante, contactoEstudante, numEstudante, senhaEstudante, idCursos) 
                    VALUES (?, ?, ?, ?, ?, ?)
                `;

          const valores = [
            nomeEstudante,
            nomeFoto,
            contactoEstudante,
            numEstudante,
            senhaCriptografada,
            idCursos,
          ];

          conexao.query(sql, valores, (erro, resultado) => {
            if (erro) {
              console.error("Erro ao inserir estudante:", erro);
              console.error("SQL Message:", erro.sqlMessage);

              if (
                nomeFoto &&
                fs.existsSync(
                  path.join(
                    __dirname,
                    "../../client/src/img/estudantes",
                    nomeFoto,
                  ),
                )
              ) {
                fs.unlinkSync(
                  path.join(
                    __dirname,
                    "../../client/src/img/estudantes",
                    nomeFoto,
                  ),
                );
                console.log("Imagem removida devido ao erro");
              }

              return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no cadastro",
                mensagem: "Erro ao registrar estudante: " + erro.message,
              });
            }

            console.log("Estudante inserido com ID:", resultado.insertId);

            res.status(201).json({
              sucesso: true,
              tipo: "sucesso",
              titulo: "Cadastro realizado!",
              mensagem: "Estudante registrado com sucesso!",
              redirect: "/",
              dados: {
                idEstudante: resultado.insertId,
                nomeEstudante,
                numEstudante,
                foto: nomeFoto,
              },
            });
          });
        } catch (erroHash) {
          console.error("Erro ao criptografar senha:", erroHash);
          res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro de segurança",
            mensagem: "Erro interno do servidor",
          });
        }
      },
    );
  } catch (erro) {
    console.error("Erro no endpoint de registro:", erro);
    res.status(500).json({
      sucesso: false,
      tipo: "erro",
      titulo: "Erro interno",
      mensagem: "Erro interno do servidor",
    });
  }
};

module.exports = { registarEstudante };
