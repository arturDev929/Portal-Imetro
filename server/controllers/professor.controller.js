const conexao = require("../infra/conexao");

const ativarProfessor = (req, res) => {
  const { id } = req.params;
  const sql = "UPDATE professor SET estado = 'Ativo' WHERE idprofessor = ?";

  conexao.query(sql, [id], (error, result) => {
    if (error) {
      console.error("Erro ao ativar o professor:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        details: error.message,
      });
    } else {
      if (result.affectedRows === 0) {
        res.status(404).json({
          error: "Professor não encontrado",
        });
      } else {
        res.status(200).json({
          message: "Professor ativado com sucesso",
          professoresAfetados: result.affectedRows,
        });
      }
    }
  });
};
const desativarProfessor = (req, res) => {
  const { id } = req.params;
  const sql =
    "UPDATE professor SET estado = 'Desativado' WHERE idprofessor = ?";

  conexao.query(sql, [id], (error, result) => {
    if (error) {
      console.error("Erro ao desativar o professor:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        details: error.message,
      });
    } else {
      if (result.affectedRows === 0) {
        res.status(404).json({
          error: "Professor não encontrado",
        });
      } else {
        res.status(200).json({
          message: "Professor desativado com sucesso",
          professoresAfetados: result.affectedRows,
        });
      }
    }
  });
};

const atualizarProfessor = (req, res) => {
  const { id } = req.params;
  const {
    codigoprofessor,
    nomeprofessor,
    generoprofessor,
    nacionalidadeprofessor,
    estadocivilprofessor,
    nomepaiprofessor,
    nomemaeprofessor,
    nbiprofessor,
    datanascimentoprofessor,
    residenciaprofessor,
    telefoneprofessor,
    whatsappprofessor,
    emailprofessor,
    anoexperienciaprofessor,
    titulacaoprofessor,
    dataadmissaoprofessor,
    tipocontratoprofessor,
    ibanprofessor,
    tiposanguineoprofessor,
    condicoesprofessor,
    contactoemergenciaprofessor,
    curriculo,
    foto,
  } = req.body;

  const numeroProfessor = id.toString().padStart(8, "0").slice(-8);
  const pastaDestino = path.join(__dirname, "../../client/src/img/professores");

  if (!fs.existsSync(pastaDestino)) {
    fs.mkdirSync(pastaDestino, { recursive: true });
  }

  if (!nomeprofessor || !nomeprofessor.trim()) {
    return res.status(400).json({ error: "Nome do professor é obrigatório" });
  }
  if (!nacionalidadeprofessor || !nacionalidadeprofessor.trim()) {
    return res
      .status(400)
      .json({ error: "Nacionalidade do professor é obrigatória" });
  }
  if (!codigoprofessor || !codigoprofessor.trim()) {
    return res.status(400).json({ error: "Código do professor é obrigatório" });
  }
  if (!generoprofessor || !generoprofessor.trim()) {
    return res.status(400).json({ error: "Gênero é obrigatório" });
  }

  const camposOpcionais = [
    { valor: estadocivilprofessor, nome: "Estado civil" },
    { valor: nomepaiprofessor, nome: "Nome do pai" },
    { valor: nomemaeprofessor, nome: "Nome da mãe" },
    { valor: nbiprofessor, nome: "Nº do BI" },
    { valor: residenciaprofessor, nome: "Residência" },
    { valor: telefoneprofessor, nome: "Telefone" },
    { valor: whatsappprofessor, nome: "WhatsApp" },
    { valor: emailprofessor, nome: "Email" },
    { valor: anoexperienciaprofessor, nome: "Anos de experiência" },
    { valor: titulacaoprofessor, nome: "Titulação" },
    { valor: tipocontratoprofessor, nome: "Tipo de contrato" },
    { valor: ibanprofessor, nome: "IBAN" },
    { valor: tiposanguineoprofessor, nome: "Tipo sanguíneo" },
    { valor: condicoesprofessor, nome: "Condições" },
    { valor: contactoemergenciaprofessor, nome: "Contato de emergência" },
  ];

  for (const campo of camposOpcionais) {
    if (
      campo.valor !== undefined &&
      typeof campo.valor === "string" &&
      !campo.valor.trim()
    ) {
      return res
        .status(400)
        .json({ error: `${campo.nome} não pode estar vazio se for enviado` });
    }
  }

  if (
    emailprofessor &&
    typeof emailprofessor === "string" &&
    emailprofessor.trim()
  ) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailprofessor.trim())) {
      return res.status(400).json({ error: "Email inválido" });
    }
  }

  if (
    telefoneprofessor &&
    typeof telefoneprofessor === "string" &&
    telefoneprofessor.trim()
  ) {
    const telefone = telefoneprofessor.replace(/\s+/g, "");
    const telefoneRegex = /^[0-9]{9}$/;
    if (!telefoneRegex.test(telefone)) {
      return res
        .status(400)
        .json({ error: "Telefone inválido. Use 9 dígitos" });
    }
  }

  if (
    whatsappprofessor &&
    typeof whatsappprofessor === "string" &&
    whatsappprofessor.trim()
  ) {
    const whatsapp = whatsappprofessor.replace(/\s+/g, "");
    const whatsappRegex = /^[0-9]{9}$/;
    if (!whatsappRegex.test(whatsapp)) {
      return res
        .status(400)
        .json({ error: "WhatsApp inválido. Use 9 dígitos" });
    }
  }

  const errosDuplicidade = [];
  let verificacoesPendentes = 0;

  function verificarCampoUnico(campo, valor, label) {
    if (!valor || !valor.toString().trim()) return;

    verificacoesPendentes++;

    conexao.query(
      `SELECT idprofessor FROM professor WHERE ${campo} = ? AND idprofessor != ?`,
      [valor, id],
      (err, results) => {
        if (err) {
          errosDuplicidade.push(`Erro ao verificar ${label}`);
        } else if (results.length > 0) {
          errosDuplicidade.push(`${label} já está em uso por outro professor`);
        }

        verificacoesPendentes--;
        if (verificacoesPendentes === 0) {
          processarArquivos();
        }
      },
    );
  }

  function processarArquivos() {
    if (errosDuplicidade.length > 0) {
      return res.status(400).json({ error: errosDuplicidade.join(". ") });
    }

    let fotoFinal = null;
    let documentoFinal = null;

    conexao.query(
      "SELECT fotoprofessor, bipdfprofessor FROM professor WHERE idprofessor = ?",
      [id],
      (err, results) => {
        if (err) {
          return res
            .status(500)
            .json({ error: "Erro ao buscar dados do professor" });
        }

        const dadosAtuais = results[0] || {};
        fotoFinal = dadosAtuais.fotoprofessor;
        documentoFinal = dadosAtuais.bipdfprofessor;

        if (foto && typeof foto === "string" && foto.trim()) {
          if (foto.startsWith("data:image")) {
            try {
              const matches = foto.match(/^data:image\/([a-zA-Z]+);base64,/);
              const extensao = matches ? matches[1] : "jpg";
              const timestamp = Date.now().toString().slice(-13);
              const nomeArquivo = `professor_${numeroProfessor}_foto_${timestamp}.${extensao}`;
              const caminhoCompleto = path.join(pastaDestino, nomeArquivo);

              const base64Data = foto.split(",")[1];

              if (base64Data) {
                const buffer = Buffer.from(base64Data, "base64");
                fs.writeFileSync(caminhoCompleto, buffer);
                fotoFinal = nomeArquivo;
              }
            } catch (error) {
              console.log("Erro ao processar foto:", error);
            }
          } else {
            if (foto.includes("/")) {
              const partes = foto.split("/");
              fotoFinal = partes[partes.length - 1];
            } else {
              fotoFinal = foto;
            }
          }
        }

        if (curriculo && typeof curriculo === "string" && curriculo.trim()) {
          const timestamp = Date.now().toString().slice(-13);
          let extensao = "pdf";
          let buffer = null;
          let nomeArquivoOriginal = null;

          if (curriculo.includes("base64")) {
            if (curriculo.startsWith("data:application/pdf")) {
              extensao = "pdf";
            } else if (curriculo.startsWith("data:application/msword")) {
              extensao = "doc";
            } else if (
              curriculo.startsWith(
                "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              )
            ) {
              extensao = "docx";
            }

            const partes = curriculo.split(",");
            if (partes.length > 1) {
              buffer = Buffer.from(partes[1], "base64");
            }
          } else {
            nomeArquivoOriginal = curriculo;
            if (curriculo.includes("/")) {
              const partes = curriculo.split("/");
              nomeArquivoOriginal = partes[partes.length - 1];
            }

            const partesExtensao = nomeArquivoOriginal.split(".");
            if (partesExtensao.length > 1) {
              extensao = partesExtensao[partesExtensao.length - 1];
            }

            const caminhoArquivoExistente = path.join(
              pastaDestino,
              nomeArquivoOriginal,
            );

            if (fs.existsSync(caminhoArquivoExistente)) {
              buffer = fs.readFileSync(caminhoArquivoExistente);
            }
          }

          if (buffer) {
            const novoNomeArquivo = `professor_${numeroProfessor}_bi_${timestamp}.${extensao}`;
            const novoCaminho = path.join(pastaDestino, novoNomeArquivo);

            try {
              fs.writeFileSync(novoCaminho, buffer);
              documentoFinal = novoNomeArquivo;

              if (
                nomeArquivoOriginal &&
                nomeArquivoOriginal !== novoNomeArquivo &&
                fs.existsSync(path.join(pastaDestino, nomeArquivoOriginal))
              ) {
                fs.unlinkSync(path.join(pastaDestino, nomeArquivoOriginal));
              }
            } catch (error) {
              console.log("Erro ao salvar arquivo:", error);
            }
          }
        }

        atualizarProfessor(fotoFinal, documentoFinal);
      },
    );
  }

  function atualizarProfessor(fotoFinal, documentoFinal) {
    const query = `
            UPDATE professor SET
                codigoprofessor = ?,
                nomeprofessor = ?,
                generoprofessor = ?,
                nacionalidadeprofessor = ?,
                estadocivilprofessor = ?,
                nomepaiprofessor = ?,
                nomemaeprofessor = ?,
                nbiprofessor = ?,
                datanascimentoprofessor = ?,
                residenciaprofessor = ?,
                telefoneprofessor = ?,
                whatsappprofessor = ?,
                emailprofessor = ?,
                anoexperienciaprofessor = ?,
                titulacaoprofessor = ?,
                dataadmissaoprofessor = ?,
                tipocontratoprofessor = ?,
                ibanprofessor = ?,
                tiposanguineoprofessor = ?,
                condicoesprofessor = ?,
                contactoemergenciaprofessor = ?,
                fotoprofessor = ?,
                bipdfprofessor = ?
            WHERE idprofessor = ?
        `;

    const params = [
      codigoprofessor,
      nomeprofessor,
      generoprofessor,
      nacionalidadeprofessor || null,
      estadocivilprofessor || null,
      nomepaiprofessor || null,
      nomemaeprofessor || null,
      nbiprofessor || null,
      datanascimentoprofessor || null,
      residenciaprofessor || null,
      telefoneprofessor || null,
      whatsappprofessor || null,
      emailprofessor || null,
      anoexperienciaprofessor || null,
      titulacaoprofessor || null,
      dataadmissaoprofessor || null,
      tipocontratoprofessor || null,
      ibanprofessor || null,
      tiposanguineoprofessor || null,
      condicoesprofessor || null,
      contactoemergenciaprofessor || null,
      fotoFinal,
      documentoFinal,
      id,
    ];

    conexao.query(query, params, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao atualizar professor" });
      }

      res.json({
        success: true,
        message: "Professor atualizado com sucesso",
        dados: {
          foto: fotoFinal,
          documento: documentoFinal,
        },
      });
    });
  }

  verificarCampoUnico("nomeprofessor", nomeprofessor, "Nome do professor");
  verificarCampoUnico(
    "codigoprofessor",
    codigoprofessor,
    "Código do professor",
  );
  verificarCampoUnico("emailprofessor", emailprofessor, "Email");
  verificarCampoUnico("nbiprofessor", nbiprofessor, "Nº do BI");
  verificarCampoUnico("telefoneprofessor", telefoneprofessor, "Telefone");
  verificarCampoUnico("whatsappprofessor", whatsappprofessor, "WhatsApp");

  if (verificacoesPendentes === 0) {
    processarArquivos();
  }
};

const desvincularProfessor = (req, res) => {
  const { iddisciplina, idprofessor } = req.params;
  const sql =
    "DELETE FROM disc_prof WHERE idprofessor = ? AND iddisciplina = ?";
  conexao.query(sql, [idprofessor, iddisciplina], (error, result) => {
    if (error) {
      console.error("Erro ao desvincular professor:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        details: error.message,
      });
    } else {
      res.status(200).json({
        message: "Professor desvinculado com sucesso",
        professoresAfetados: result.affectedRows,
      });
    }
  });
};

module.exports = {
  ativarProfessor,
  desativarProfessor,
  atualizarProfessor,
  desativarProfessor,
  desvincularProfessor,
};
