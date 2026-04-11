const { Router } = require("express");
const router = Router();
const conexao = require("../infra/conexao");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const { createCanvas } = require("canvas");
const { registarEstudante } = require("../controllers/estudante.controller");
const { Funcionario, CargoFuncionario, CargoFuncionarioRelation } = require("../Models");
const AnoCurricular = require("../Models/anoCurricularModel");
const Curso = require("../Models/cursoModel");
const CategoriaCurso = require("../Models/categoriacursoModel");
const Periodo = require("../Models/periodoModel");
const Professor = require("../Models/professorModel");
const Disciplina = require("../Models/disciplinaModel");
const DiscProf = require("../Models/disc_profModel");
const Semestre = require("../Models/semestreModel");

const gerarImagemIniciais = (nome) => {
  try {
    const palavras = nome.trim().split(/\s+/);

    if (palavras.length === 0) return null;

    const primeiraLetra = palavras[0].charAt(0).toUpperCase();

    let segundaLetra;
    if (palavras.length > 1) {
      segundaLetra = palavras[1].charAt(0).toUpperCase();
    } else if (palavras[0].length > 1) {
      segundaLetra = palavras[0].charAt(1).toUpperCase();
    } else {
      segundaLetra = palavras[0].charAt(0).toUpperCase();
    }

    const iniciais = primeiraLetra + segundaLetra;

    const tamanho = 200;
    const canvas = createCanvas(tamanho, tamanho);
    const ctx = canvas.getContext("2d");

    const cores = [
      "#3498db",
      "#2ecc71",
      "#9b59b6",
      "#e74c3c",
      "#1abc9c",
      "#34495e",
      "#f39c12",
      "#d35400",
      "#16a085",
      "#27ae60",
    ];
    const corFundo = cores[Math.floor(Math.random() * cores.length)];

    ctx.fillStyle = corFundo;
    ctx.fillRect(0, 0, tamanho, tamanho);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${tamanho / 2}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(iniciais, tamanho / 2, tamanho / 2);

    const nomeArquivo = `estudante_${iniciais}_${Date.now()}.png`;

    const pastaImagens = path.join(
      __dirname,
      "../../client/src/img/estudantes",
    );
    const caminhoCompleto = path.join(pastaImagens, nomeArquivo);

    if (!fs.existsSync(pastaImagens)) {
      fs.mkdirSync(pastaImagens, { recursive: true });
    }

    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(caminhoCompleto, buffer);

    console.log(`📸 Imagem gerada: ${nomeArquivo} com iniciais: ${iniciais}`);

    return nomeArquivo;
  } catch (erro) {
    console.error("Erro ao gerar imagem:", erro);
    return null;
  }
};

router.post("/registrarEstudante", registarEstudante);



router.post("/registrercategoria", async (req, res) => {
  const { categoriacurso, idAdm } = req.body;

  if (!categoriacurso || !idAdm) {
    return res.status(400).json({
      sucesso: false,
      tipo: "erro",
      titulo: "Dados incompletos",
      mensagem: "Por favor, preencha todos os campos obrigatórios",
    });
  }

  try {
   
    const existe = await CategoriaCurso.findOne({
      where: {
        categoriacurso: categoriacurso
      }
    });

    if (existe) {
      return res.status(400).json({
        sucesso: false,
        tipo: "erro",
        titulo: "Categoria Existe",
        mensagem: "Esta categoria já está registrada!",
      });
    }

    const novaCategoria = await CategoriaCurso.create({
      categoriacurso,
      idAdm
    });

    return res.status(201).json({
      sucesso: true,
      tipo: "sucesso",
      titulo: "Categoria Registrada",
      mensagem: "Categoria registrada com sucesso!",
      dados: {
        id: novaCategoria.idcategoriacurso,
        categoriacurso: novaCategoria.categoriacurso,
        idAdm: novaCategoria.idAdm
      },
    });

  } catch (error) {
    console.error("Erro ao registrar categoria:", error);

    return res.status(500).json({
      sucesso: false,
      tipo: "erro",
      titulo: "Erro no servidor",
      mensagem: "Erro interno do servidor",
    });
  }
});
router.post("/registrarcurso", async (req, res) => {
  const { curso, idcategoriacurso } = req.body;

  if (!curso || !idcategoriacurso) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Curso e categoria são obrigatórios",
    });
  }

  const transaction = await sequelize.transaction();

  try {

    const existeCurso = await Curso.findOne({
      where: { curso },
      transaction,
    });

    if (existeCurso) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: "Este curso já está registrado",
      });
    }

    const categoria = await CategoriaCurso.findByPk(idcategoriacurso, {
      transaction,
    });

    if (!categoria) {
      await transaction.rollback();
      return res.status(404).json({
        sucesso: false,
        mensagem: "Categoria não encontrada",
      });
    }

    const novoCurso = await Curso.create(
      {
        curso,
        idcategoriacurso,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      sucesso: true,
      mensagem: "Curso registrado com sucesso",
      dados: {
        id: novoCurso.idcurso,
        curso,
        idcategoriacurso,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Erro ao registrar curso:", error);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor",
      error: error.message,
    });
  }
});

router.post("/registrarAnoCurricular", async (req, res) => {
  const { anocurricular, idcurso } = req.body;

  if (!anocurricular || !idcurso) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Ano curricular e curso são obrigatórios",
    });
  }

  const transaction = await sequelize.transaction();

  try {
   
    const curso = await Curso.findByPk(idcurso, { transaction });

    if (!curso) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: "Curso inválido",
      });
    }

    const existe = await AnoCurricular.findOne({
      where: {
        anocurricular,
        idcurso,
      },
      transaction,
    });

    if (existe) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: `Ano ${anocurricular} já existe para este curso`,
      });
    }

    const novoAno = await AnoCurricular.create(
      {
        anocurricular,
        idcurso,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      sucesso: true,
      mensagem: `Ano ${anocurricular} registrado com sucesso`,
      dados: {
        id: novoAno.idanocurricular,
        anocurricular,
        idcurso,
        curso_nome: curso.curso,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Erro ao registrar ano curricular:", error);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor",
      error: error.message,
    });
  }
});

router.post("/registrardisciplina", async (req, res) => {
  const { disciplina, idAdm } = req.body;

  if (!disciplina || !idAdm) {
    return res.status(400).json({
      sucesso: false,
      tipo: "erro",
      titulo: "Dados incompletos",
      mensagem: "Por favor, preencha todos os campos obrigatórios",
    });
  }

  const verificarDisciplinaSQL =
    "SELECT iddisciplina FROM disciplina WHERE disciplina = ?";

  conexao.query(
    verificarDisciplinaSQL,
    [disciplina],
    async (erro, resultados) => {
      if (erro) {
        console.error("Erro ao verificar Disciplina:", erro);
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
          titulo: "Disciplina Existe",
          mensagem: "Esta Disciplina já está registrada!",
        });
      }

      const inserirDisciplinaSQL =
        "INSERT INTO disciplina (disciplina, idAdm) VALUES (?, ?)";

      conexao.query(
        inserirDisciplinaSQL,
        [disciplina, idAdm],
        (erro, resultados) => {
          if (erro) {
            console.error("Erro ao inserir Disciplina:", erro);
            return res.status(500).json({
              sucesso: false,
              tipo: "erro",
              titulo: "Erro no servidor",
              mensagem: "Erro ao registrar disciplina",
            });
          }

          return res.status(201).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Disciplina Registrada",
            mensagem: "Disciplina registrada com sucesso!",
            dados: {
              id: resultados.insertId,
              disciplina: disciplina,
              idAdm: idAdm,
            },
          });
        },
      );
    },
  );
});



router.post("/registrarDisciplinaCurso", async (req, res) => {
  const {
    iddisciplina,
    idanocurricular,
    idcurso,
    semestre,
    idcategoriacurso,
  } = req.body;

  if (
    !iddisciplina ||
    !idanocurricular ||
    !idcurso ||
    !semestre ||
    !idcategoriacurso
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Preencha todos os campos",
    });
  }

  const transaction = await sequelize.transaction();

  try {

    const disciplina = await Disciplina.findByPk(iddisciplina, {
      transaction,
    });

    if (!disciplina) {
      await transaction.rollback();
      return res.status(400).json({ mensagem: "Disciplina inválida" });
    }

    const ano = await AnoCurricular.findByPk(idanocurricular, {
      transaction,
    });

    if (!ano) {
      await transaction.rollback();
      return res.status(400).json({ mensagem: "Ano inválido" });
    }

    const curso = await Curso.findByPk(idcurso, {
      transaction,
    });

    if (!curso) {
      await transaction.rollback();
      return res.status(400).json({ mensagem: "Curso inválido" });
    }

    const categoria = await CategoriaCurso.findByPk(idcategoriacurso, {
      transaction,
    });

    if (!categoria) {
      await transaction.rollback();
      return res.status(400).json({ mensagem: "Categoria inválida" });
    }

    if (curso.idcategoriacurso != idcategoriacurso) {
      await transaction.rollback();
      return res.status(400).json({
        mensagem: "Curso não pertence à categoria",
      });
    }


    const existe = await Semestre.findOne({
      where: {
        iddisciplina,
        idanocurricular,
        idcurso,
        semestre,
      },
      transaction,
    });

    if (existe) {
      await transaction.rollback();
      return res.status(400).json({
        mensagem: "Disciplina já atribuída neste semestre",
      });
    }

 
    const novo = await Semestre.create(
      {
        idcategoriacurso,
        iddisciplina,
        idanocurricular,
        idcurso,
        semestre,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      sucesso: true,
      mensagem: `Disciplina "${disciplina.disciplina}" atribuída ao ${semestre}º semestre com sucesso`,
      dados: {
        id: novo.idsemestre,
        iddisciplina,
        idanocurricular,
        idcurso,
        idcategoriacurso,
        semestre,
        disciplina_nome: disciplina.disciplina,
        ano_nome: ano.anocurricular,
        curso_nome: curso.curso,
        categoria_nome: categoria.categoriacurso,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Erro ao registrar disciplina no curso:", error);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor",
      error: error.message,
    });
  }
});


router.post("/registrarprofessor", async (req, res) => {
  const body = req.body || {};
  const files = req.files || {};

  const {
    nomeprofessore,
    genero,
    nacionalidadeprofessor,
    estadocivilprofessor,
    nomepaiprofessor,
    nomemaeprofessor,
    biprofessor,
    datanascimentoprofessor,
    residenciaprofessor,
    telefoneprofessor,
    whatsappprofessor,
    emailprofessor,
    anoexprienciaprofessor,
    titulacaoprofessor,
    dataadmissaprofessor,
    tipocontratoprofessor,
    ibanprofessor,
    tiposanguineoprofessor,
    condicoesprofessor,
    contactoemergenciaprofessor,
    idAdm,
  } = body;

  if (!nomeprofessore || !genero || !biprofessor || !idAdm) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Nome, gênero, BI e admin são obrigatórios",
    });
  }

  const transaction = await sequelize.transaction();

  try {

    const existeBI = await Professor.findOne({
      where: { nbiprofessor: biprofessor },
      transaction,
    });

    if (existeBI) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: "BI já existe",
      });
    }

  
    const gerarCodigo = async (campo, tamanho, min, max) => {
      let codigo;
      let unico = false;
      let tentativas = 0;

      while (!unico && tentativas < 10) {
        codigo = Math.floor(min + Math.random() * max).toString();

        const existe = await Professor.findOne({
          where: { [campo]: codigo },
          transaction,
        });

        if (!existe) unico = true;

        tentativas++;
      }

      if (!unico) throw new Error("Falha ao gerar código único");

      return codigo;
    };

    const codigoAcesso = await gerarCodigo("senhaprofessor", 4, 1000, 9000);
    const codigoProfessor = await gerarCodigo(
      "codigoprofessor",
      8,
      10000000,
      90000000
    );

    const senhaCriptografada = await bcrypt.hash(codigoAcesso, 10);

  
    const pasta = path.join(__dirname, "../../client/src/img/professores");
    if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });

    let nomeFoto = null;
    let nomeBIPDF = null;

  
    if (files.fotoprofessor) {
      const foto = files.fotoprofessor;
      const ext = path.extname(foto.name);

      nomeFoto = `professor_${codigoProfessor}_foto_${Date.now()}${ext}`;
      await foto.mv(path.join(pasta, nomeFoto));
    }

   
    if (files.bipdfprofessor) {
      const pdf = files.bipdfprofessor;
      const ext = path.extname(pdf.name);

      nomeBIPDF = `professor_${codigoProfessor}_bi_${Date.now()}${ext}`;
      await pdf.mv(path.join(pasta, nomeBIPDF));
    }

    const professor = await Professor.create(
      {
        codigoprofessor: codigoProfessor,
        fotoprofessor: nomeFoto,
        nomeprofessor: nomeprofessore,
        generoprofessor: genero,
        nacionalidadeprofessor,
        estadocivilprofessor,
        nomepaiprofessor,
        nomemaeprofessor,
        nbiprofessor: biprofessor,
        datanascimentoprofessor,
        bipdfprofessor: nomeBIPDF,
        residenciaprofessor,
        telefoneprofessor,
        whatsappprofessor,
        emailprofessor,
        anoexperienciaprofessor: anoexprienciaprofessor,
        titulacaoprofessor,
        dataadmissaoprofessor: dataadmissaprofessor,
        tipocontratoprofessor,
        ibanprofessor,
        tiposanguineoprofessor,
        condicoesprofessor,
        contactoemergenciaprofessor,
        idAdm,
        senhaprofessor: senhaCriptografada,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      sucesso: true,
      mensagem: "Professor registrado com sucesso",
      dados: {
        idprofessor: professor.idprofessor,
        codigoProfessor,
        codigoAcesso,
        foto: nomeFoto,
        bi_pdf: nomeBIPDF,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Erro ao registrar professor:", error);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor",
      error: error.message,
    });
  }
});



router.post("/registrerDisciplinaProfessor", async (req, res) => {
  const { idprofessor, iddisciplina } = req.body;

  if (!idprofessor || !iddisciplina) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Professor e disciplina são obrigatórios",
    });
  }

  const transaction = await sequelize.transaction();

  try {

    const professor = await Professor.findByPk(idprofessor, {
      transaction,
    });

    if (!professor) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: "Professor inválido",
      });
    }

    const disciplina = await Disciplina.findByPk(iddisciplina, {
      transaction,
    });

    if (!disciplina) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: "Disciplina inválida",
      });
    }

    const existe = await DiscProf.findOne({
      where: {
        idprofessor,
        iddisciplina,
      },
      transaction,
    });

    if (existe) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: "Disciplina já atribuída a este professor",
      });
    }

    const relacao = await DiscProf.create(
      {
        idprofessor,
        iddisciplina,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      sucesso: true,
      mensagem: `Disciplina "${disciplina.disciplina}" atribuída ao professor "${professor.nomeprofessor}" com sucesso!`,
      dados: {
        id: relacao.iddiscprof,
        idprofessor,
        iddisciplina,
        professor_nome: professor.nomeprofessor,
        disciplina_nome: disciplina.disciplina,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Erro ao atribuir disciplina:", error);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor",
      error: error.message,
    });
  }
});
router.post("/vincularProfessor", async (req, res) => {
  const { idprofessor, iddisciplina } = req.body;

  if (!idprofessor || !iddisciplina) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Professor e disciplina são obrigatórios",
    });
  }

  const transaction = await sequelize.transaction();

  try {

    const professor = await Professor.findByPk(idprofessor, {
      transaction,
    });

    if (!professor) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: "Professor não encontrado",
      });
    }


    const disciplina = await Disciplina.findByPk(iddisciplina, {
      transaction,
    });

    if (!disciplina) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: "Disciplina não encontrada",
      });
    }

  
    const existe = await DiscProf.findOne({
      where: {
        idprofessor,
        iddisciplina,
      },
      transaction,
    });

    if (existe) {
      await transaction.rollback();
      return res.status(409).json({
        sucesso: false,
        mensagem: "Professor já está vinculado a esta disciplina",
      });
    }


    const vinculo = await DiscProf.create(
      {
        idprofessor,
        iddisciplina,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      sucesso: true,
      mensagem: "Vínculo criado com sucesso",
      dados: {
        idVinculo: vinculo.iddiscprof,
        idprofessor,
        iddisciplina,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Erro ao vincular professor:", error);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor",
      error: error.message,
    });
  }
});



router.post("/registrarPeriodo", async (req, res) => {
  const {
    idanocurricular,
    idcurso,
    idcategoriacurso,
    turma,
    periodo,
    anoletivo,
  } = req.body;

  if (
    !idanocurricular ||
    !idcurso ||
    !idcategoriacurso ||
    !turma ||
    !periodo ||
    !anoletivo
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Preencha todos os campos",
    });
  }

  const transaction = await sequelize.transaction();

  try {

    const ano = await AnoCurricular.findOne({
      where: { idanocurricular },
      transaction,
    });

    if (!ano) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: "Ano curricular inválido",
      });
    }

    const curso = await Curso.findOne({
      where: { idcurso },
      transaction,
    });

    if (!curso) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: "Curso inválido",
      });
    }

  
    const categoria = await CategoriaCurso.findOne({
      where: { idcategoriacurso },
      transaction,
    });

    if (!categoria) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: "Categoria inválida",
      });
    }

    if (curso.idcategoriacurso != idcategoriacurso) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: "Curso não pertence à categoria",
      });
    }

  
    const duplicado = await Periodo.findOne({
      where: {
        idanocurricular,
        idcurso,
        turma,
        periodo,
        anoletivo,
      },
      transaction,
    });

    if (duplicado) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: "Esta turma/período já existe",
      });
    }

  
    const novoPeriodo = await Periodo.create(
      {
        idanocurricular,
        idcurso,
        idcategoriacurso,
        turma,
        periodo,
        anoletivo,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      sucesso: true,
      mensagem: `Turma ${turma} criada com sucesso`,
      dados: {
        id: novoPeriodo.idperiodo,
        idanocurricular,
        idcurso,
        idcategoriacurso,
        turma,
        periodo,
        anoletivo,
        ano_nome: ano.anocurricular,
        curso_nome: curso.curso,
        categoria_nome: categoria.categoriacurso,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Erro ao registrar período:", error);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor",
      error: error.message,
    });
  }
});



router.post("/registrarfuncionario", async (req, res) => {
  const {
    nome_funcionario,
    contacto_funcionario,
    bi_funcionario,
    cargo_funcionario,
    idAdm,
  } = req.body;

  if (!nome_funcionario?.trim())
    return res.status(400).json({ mensagem: "Nome obrigatório" });

  if (!contacto_funcionario?.trim())
    return res.status(400).json({ mensagem: "Contacto obrigatório" });

  if (!bi_funcionario?.trim())
    return res.status(400).json({ mensagem: "BI obrigatório" });

  if (!cargo_funcionario?.trim())
    return res.status(400).json({ mensagem: "Cargo obrigatório" });

  if (!idAdm)
    return res.status(400).json({ mensagem: "ID Admin obrigatório" });

  const transaction = await sequelize.transaction();

  try {
  
    const existeContacto = await Funcionario.findOne({
      where: { contacto_funcionario: contacto_funcionario.trim() },
      transaction,
    });

    if (existeContacto) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: "Contacto já existe",
      });
    }

  
    const existeBI = await Funcionario.findOne({
      where: { bi_funcionario: bi_funcionario.trim() },
      transaction,
    });

    if (existeBI) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: "BI já existe",
      });
    }

   
    const gerarSenha = () => {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let senha = "";
      for (let i = 0; i < 8; i++) {
        senha += chars[Math.floor(Math.random() * chars.length)];
      }
      return senha;
    };

    const senha_funcionario = gerarSenha();

    const senhaCriptografada = await bcrypt.hash(senha_funcionario, 10);

  
    const funcionario = await Funcionario.create(
      {
        nome_funcionario: nome_funcionario.trim(),
        contacto_funcionario: contacto_funcionario.trim(),
        bi_funcionario: bi_funcionario.trim(),
        senha_funcionario: senhaCriptografada,
        idAdm,
        estado_funcionario: "Ativo",
      },
      { transaction }
    );

    const id_funcionario = funcionario.id_funcionario;

    const cargo = await CargoFuncionario.findOne({
      where: { cargo: cargo_funcionario },
      transaction,
    });

    if (!cargo) {
      await transaction.rollback();
      return res.status(400).json({
        sucesso: false,
        mensagem: "Cargo inválido",
      });
    }

    const id_cargo = cargo.id_cargo;

   
    await CargoFuncionarioRelation.create(
      {
        id_funcionario,
        id_cargo,
      },
      { transaction }
    );

  
    await transaction.commit();

    return res.status(201).json({
      sucesso: true,
      mensagem: "Funcionário registado com sucesso",
      dados: {
        id: id_funcionario,
        nome: nome_funcionario,
        contacto: contacto_funcionario,
        bi: bi_funcionario,
        cargo: cargo_funcionario,
        senha_original: senha_funcionario,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Erro ao registrar funcionário:", error);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno do servidor",
      error: error.message,
    });
  }
});


module.exports = router;
