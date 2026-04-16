const { where } = require("sequelize");
const conexao = require("../infra/conexao");
const Professor = require("../Models/professorModel");
const DiscProf = require("../Models/disc_profModel");
const ativarProfessor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Id é obrigatório!" });
    }
    const encontrarProfessor = await Professor.findByPk(id);
    if (!encontrarProfessor) {
      return res.status(400).json({ error: "Professor não encontrado" });
    }
    if (encontrarProfessor.estado === "Ativo") {
      return res.status(400).json({ error: "Este professor já está ativo" });
    }
    await Professor.update(
      { estado: "Ativo" },
      {
        where: {
          idprofessor: id,
        },
      },
    );
    return res.status(200).json({
      message: "Professor ativado com sucesso",
      //professoresAfetados: result.affectedRows,
    });
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};
const desativarProfessor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Id é obrigatório!" });
    }
    const encontrarProfessor = await Professor.findByPk(id);
    if (!encontrarProfessor) {
      return res.status(400).json({ error: "Professor não encontrado" });
    }
    if (encontrarProfessor.estado === "Desativado") {
      return res
        .status(400)
        .json({ error: "Este professor já está Desativado" });
    }
    await Professor.update(
      { estado: "Desativado" },
      {
        where: {
          idprofessor: id,
        },
      },
    );
    return res.status(200).json({
      message: "Professor Desativado com sucesso",
      //professoresAfetados: result.affectedRows,
    });
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const atualizarProfessor = async (req, res) => {
  const { id } = req.params;
  const dados = req.body;

  const numeroProfessor = id.toString().padStart(8, "0").slice(-8);
  const pastaDestino = path.join(__dirname, "../../client/src/img/professores");

  if (!fs.existsSync(pastaDestino)) {
    fs.mkdirSync(pastaDestino, { recursive: true });
  }

  if (!dados.nomeprofessor?.trim()) {
    return res.status(400).json({ error: "Nome do professor é obrigatório" });
  }

  if (!dados.codigoprofessor?.trim()) {
    return res.status(400).json({ error: "Código do professor é obrigatório" });
  }

  if (!dados.generoprofessor?.trim()) {
    return res.status(400).json({ error: "Gênero é obrigatório" });
  }

  if (!dados.nacionalidadeprofessor?.trim()) {
    return res.status(400).json({ error: "Nacionalidade é obrigatória" });
  }

  if (dados.emailprofessor) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dados.emailprofessor)) {
      return res.status(400).json({ error: "Email inválido" });
    }
  }

  const validarNumero = (num) => /^[0-9]{9}$/.test(num?.replace(/\s+/g, ""));

  if (dados.telefoneprofessor && !validarNumero(dados.telefoneprofessor)) {
    return res.status(400).json({ error: "Telefone inválido" });
  }

  if (dados.whatsappprofessor && !validarNumero(dados.whatsappprofessor)) {
    return res.status(400).json({ error: "WhatsApp inválido" });
  }

  try {
    const professor = await Professor.findByPk(id);

    if (!professor) {
      return res.status(404).json({ error: "Professor não encontrado" });
    }

    const camposUnicos = [
      "nomeprofessor",
      "codigoprofessor",
      "emailprofessor",
      "nbiprofessor",
      "telefoneprofessor",
      "whatsappprofessor",
    ];

    for (const campo of camposUnicos) {
      if (dados[campo]) {
        const existe = await Professor.findOne({
          where: {
            [campo]: dados[campo],
          },
        });

        if (existe && existe.idprofessor != id) {
          return res.status(400).json({
            error: `${campo} já está em uso por outro professor`,
          });
        }
      }
    }

    let fotoFinal = professor.fotoprofessor;

    if (dados.foto) {
      if (dados.foto.startsWith("data:image")) {
        const matches = dados.foto.match(/^data:image\/(\w+);base64,/);
        const extensao = matches ? matches[1] : "jpg";

        const nomeArquivo = `professor_${numeroProfessor}_foto_${Date.now()}.${extensao}`;
        const caminho = path.join(pastaDestino, nomeArquivo);

        const base64 = dados.foto.split(",")[1];
        fs.writeFileSync(caminho, Buffer.from(base64, "base64"));

        fotoFinal = nomeArquivo;
      } else {
        fotoFinal = dados.foto.split("/").pop();
      }
    }

    let documentoFinal = professor.bipdfprofessor;

    if (dados.curriculo) {
      let buffer;
      let extensao = "pdf";

      if (dados.curriculo.includes("base64")) {
        const partes = dados.curriculo.split(",");
        buffer = Buffer.from(partes[1], "base64");

        if (dados.curriculo.includes("word")) extensao = "docx";
      }

      if (buffer) {
        const nomeArquivo = `professor_${numeroProfessor}_bi_${Date.now()}.${extensao}`;
        const caminho = path.join(pastaDestino, nomeArquivo);

        fs.writeFileSync(caminho, buffer);
        documentoFinal = nomeArquivo;
      }
    }

    await professor.update({
      ...dados,
      fotoprofessor: fotoFinal,
      bipdfprofessor: documentoFinal,
    });

    return res.json({
      success: true,
      message: "Professor atualizado com sucesso",
      dados: {
        foto: fotoFinal,
        documento: documentoFinal,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
};

const desvincularProfessor = async (req, res) => {
  const { iddisciplina, idprofessor } = req.params;

  try {
    const result = await DiscProf.destroy({
      where: {
        idprofessor: idprofessor,
        iddisciplina: iddisciplina,
      },
    });

    res.status(200).json({
      message: "Professor desvinculado com sucesso",
      professoresAfetados: result,
    });
  } catch (error) {
    console.error("Erro ao desvincular professor:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
};

module.exports = {
  ativarProfessor,
  desativarProfessor,
  atualizarProfessor,
  desativarProfessor,
  desvincularProfessor,
};
