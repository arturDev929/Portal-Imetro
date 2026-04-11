const { Router } = require("express");
const router = Router();
const conexao = require("../infra/conexao");
const { cargosDisponiveis } = require("../controllers/cargo.controller");
const CategoriaCurso = require("../Models/categoriacursoModel");
const Curso = require("../Models/cursoModel");
const Disciplina = require("../Models/disciplinaModel");
const { Sequelize } = require("sequelize");
const Semestre = require("../Models/semestreModel");
const EstudanteInscricao = require("../Models/EstudanteInscricaoModel");
const { Op, fn, col, literal } = Sequelize;
const CargoFuncionario = require("../Models/cargoFuncionarioModel");
const Professor = require("../Models/professorModel");
const AnoCurricular = require("../Models/anoCurricularModel");
const Periodo = require("../Models/periodoModel");
const DiscProf = require("../Models/disc_profModel");
const { Funcionario, CargoFuncionarioRelation } = require("../Models");

router.get("/totalcategoriacurso", async (req, res) => {
  try {
    const total = await CategoriaCurso.count();

    res.json({
      total_categorias: total,
    });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    res.status(500).json({
      erro: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/obterImagem/:nomeArquivo", (req, res) => {
  try {
    const { nomeArquivo } = req.params;

    const caminhoImagem = path.join(
      __dirname,
      "../../client/src/img/estudantes",
      nomeArquivo,
    );

    if (fs.existsSync(caminhoImagem)) {
      return res.sendFile(caminhoImagem);
    }

    return res.status(404).json({
      sucesso: false,
      tipo: "erro",
      titulo: "Imagem não encontrada",
      mensagem: "Imagem não encontrada",
    });
  } catch (erro) {
    return res.status(500).json({ error: erro });
  }
});

router.get("/totallicenciaturas", async (req, res) => {
  try {
    const total = await Curso.count();

    res.json({
      total_licenciaturas: total,
    });
  } catch (error) {
    console.error("Erro ao buscar licenciaturas:", error);
    res.status(500).json({
      erro: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/totaldisciplina", async (req, res) => {
  try {
    const total = await Disciplina.count();

    res.json({
      total_disciplinas: total,
    });
  } catch (error) {
    console.error("Erro ao buscar disciplinas:", error);
    res.status(500).json({
      erro: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/dadosGraficosCategoria", async (req, res) => {
  try {
    const dados = await CategoriaCurso.findAll({
      attributes: [
        "idcategoriacurso",
        "categoriacurso",
        [
          Sequelize.fn("COUNT", Sequelize.col("cursos.idcurso")),
          "total_cursos",
        ],
      ],
      include: [
        {
          model: Curso,
          attributes: [],
          required: false,
        },
      ],
      group: [
        "categoriacurso.idcategoriacurso",
        "categoriacurso.categoriacurso",
      ],
      order: [[Sequelize.literal("total_cursos"), "DESC"]],
      raw: true,
    });

    res.json(dados);
  } catch (error) {
    console.error("Erro ao buscar dados para gráfico:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/totalDisciplinasPorCurso", async (req, res) => {
  try {
    const dados = await Curso.findAll({
      attributes: [
        "idcurso",
        "curso",
        [
          Sequelize.fn("COUNT", Sequelize.col("Semestres.idsemestre")),
          "total_disciplinas",
        ],
      ],
      include: [
        {
          model: Semestre,
          attributes: [],
          required: true,
        },
      ],
      group: ["Curso.idcurso", "Curso.curso"],
      order: [[Sequelize.literal("total_disciplinas"), "DESC"]],
      limit: 100,
      raw: true,
    });

    res.json(dados);
  } catch (error) {
    console.error("Erro ao buscar total de disciplinas:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/categoriaCurso", async (req, res) => {
  try {
    const categorias = await CategoriaCurso.findAll({
      attributes: ["idcategoriacurso", "categoriacurso"],
      order: [["categoriacurso", "ASC"]],
    });

    res.status(200).json(categorias);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/anosCurriculares", async (req, res) => {
  try {
    const anos = await AnoCurricular.findAll({
      attributes: ["idanocurricular", "anocurricular", "idcurso"],
      order: [["anocurricular", "ASC"]],
    });
    res.status(200).json(anos);
  } catch (error) {
    console.error("Erro ao buscar anos curriculares:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});
router.get("/Cursos", async (req, res) => {
  try {
    const cursos = await Curso.findAll({
      include: [{ model: CategoriaCurso, attributes: ["categoriacurso"] }],
      order: [[CategoriaCurso, "categoriacurso", "ASC"]],
      limit: 100,
    });
    res.status(200).json(cursos);
  } catch (error) {
    console.error("Erro ao buscar cursos:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/semestres", async (req, res) => {
  try {
    const semestres = await Semestre.findAll({
      attributes: [
        "idsemestre",
        "idcategoriacurso",
        "idcurso",
        "iddisciplina",
        "semestre",
        "idanocurricular",
      ],
      order: [["semestre", "ASC"]],
    });
    res.status(200).json(semestres);
  } catch (error) {
    console.error("Erro ao buscar semestres:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/Disciplinas", async (req, res) => {
  try {
    const disciplinas = await Disciplina.findAll({
      attributes: ["iddisciplina", "disciplina"],
      order: [["disciplina", "ASC"]],
    });
    res.status(200).json(disciplinas);
  } catch (error) {
    console.error("Erro ao buscar disciplinas:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/categoriaCurso/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const categoria = await CategoriaCurso.findByPk(id, {
      attributes: ["idcategoriacurso", "categoriacurso"],
    });

    if (!categoria) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    res.status(200).json(categoria);
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/curso/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const curso = await Curso.findByPk(id, {
      attributes: ["idcurso", "curso", "idcategoriacurso"],
    });

    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    res.status(200).json(curso);
  } catch (error) {
    console.error("Erro ao buscar curso:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});
router.get("/disciplina/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const disciplina = await Disciplina.findByPk(id, {
      attributes: ["iddisciplina", "disciplina"],
    });

    if (!disciplina) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
    }

    res.status(200).json(disciplina);
  } catch (error) {
    console.error("Erro ao buscar disciplina:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});
router.get("/periodos", async (req, res) => {
  try {
    const periodos = await Periodo.findAll({
      attributes: [
        "idperiodo",
        "idanocurricular",
        "idcategoriacurso",
        "idcurso",
        "periodo",
        "turma",
      ],
      order: [["turma", "ASC"]],
    });
    res.status(200).json(periodos);
  } catch (error) {
    console.error("Erro ao buscar períodos:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/anoCurricular/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const anoCurricular = await AnoCurricular.findOne({
      where: { idcurso: id },
      order: [["anocurricular", "DESC"]],
      limit: 1,
    });

    if (!anoCurricular) {
      return res.status(404).json({ error: "Ano curricular não encontrado" });
    }

    res.status(200).json(anoCurricular);
  } catch (error) {
    console.error("Erro ao buscar ano curricular:", error);
    res
      .status(500)
      .json({ error: "Erro interno do servidor", details: error.message });
  }
});

router.get("/semestre/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const semestre = await Semestre.findByPk(id);

    if (!semestre) {
      return res.status(404).json({ error: "Semestre não encontrado" });
    }

    res.status(200).json(semestre);
  } catch (error) {
    console.error("Erro ao buscar semestre:", error);
    res
      .status(500)
      .json({ error: "Erro interno do servidor", details: error.message });
  }
});

router.get("/periodo/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const periodo = await Periodo.findByPk(id);

    if (!periodo) {
      return res.status(404).json({ error: "Período não encontrado" });
    }

    res.status(200).json(periodo);
  } catch (error) {
    console.error("Erro ao buscar período:", error);
    res
      .status(500)
      .json({ error: "Erro interno do servidor", details: error.message });
  }
});

router.get("/ProfessoresDesativados", async (req, res) => {
  try {
    const professores = await Professor.findAll({
      where: { estado: "Desativado" },
      order: [["nomeprofessor", "ASC"]],
    });

    const professoresComFoto = professores.map((prof) => ({
      ...prof.dataValues,
      fotoUrl: prof.fotoprofessor
        ? `${process.env.REACT_APP_API_URL}/api/img/professores/${prof.fotoprofessor}`
        : null,
    }));

    res.status(200).json(professoresComFoto);
  } catch (error) {
    console.error("Erro ao buscar professores desativados:", error);
    res
      .status(500)
      .json({ error: "Erro interno do servidor", details: error.message });
  }
});

router.get("/Professores", async (req, res) => {
  try {
    const professores = await Professor.findAll({
      where: { estado: "Ativo" },
      order: [["nomeprofessor", "ASC"]],
    });

    const professoresComFoto = professores.map((prof) => ({
      ...prof.dataValues,
      fotoUrl: prof.fotoprofessor
        ? `${process.env.REACT_APP_API_URL}/api/img/professores/${prof.fotoprofessor}`
        : null,
    }));

    res.status(200).json(professoresComFoto);
  } catch (error) {
    console.error("Erro ao buscar professores:", error);
    res
      .status(500)
      .json({ error: "Erro interno do servidor", details: error.message });
  }
});

router.get("/CategoriaCursosAno", async (req, res) => {
  try {
    const dados = await CategoriaCurso.findAll({
      include: [
        {
          model: Curso,
          include: [
            {
              model: AnoCurricular,
            },
          ],
        },
      ],
      order: [
        [Curso, AnoCurricular, "anocurricular", "ASC"],
        [Curso, "curso", "ASC"],
      ],
      limit: 500,
    });

    res.status(200).json(dados);
  } catch (error) {
    console.error("Erro ao buscar dados combinados:", error);
    res
      .status(500)
      .json({ error: "Erro interno do servidor", details: error.message });
  }
});

router.get("/disciplinasPorCurso/:idcurso", async (req, res) => {
  const { idcurso } = req.params;

  try {
    const resultados = await Semestre.findAll({
      where: { idcurso },
      attributes: ["idsemestre", "semestre"],
      include: [
        { model: Disciplina, attributes: ["iddisciplina", "disciplina"] },
        { model: AnoCurricular, attributes: ["anocurricular"] },
        {
          model: Curso,
          attributes: ["curso"],
          include: [{ model: CategoriaCurso, attributes: ["categoriacurso"] }],
        },
      ],
      order: [
        [AnoCurricular, "anocurricular", "ASC"],
        ["semestre", "ASC"],
        [Disciplina, "disciplina", "ASC"],
      ],
      raw: true,
      nest: true,
    });

    if (resultados.length === 0) {
      const cursoInfo = await Curso.findOne({
        where: { idcurso },
        include: [{ model: CategoriaCurso, attributes: ["categoriacurso"] }],
        attributes: ["curso"],
        raw: true,
        nest: true,
      });

      return res.status(200).json({
        curso: cursoInfo?.curso || "Curso não identificado",
        categoria: cursoInfo?.CategoriaCurso?.categoriacurso || "",
        totalDisciplinas: 0,
        disciplinas: {},
      });
    }

    const disciplinasAgrupadas = resultados.reduce((acc, item) => {
      const anoKey = `Ano ${item.AnoCurricular.anocurricular}`;
      if (!acc[anoKey]) acc[anoKey] = {};

      const semestreKey = `Semestre ${item.semestre}`;
      if (!acc[anoKey][semestreKey]) acc[anoKey][semestreKey] = [];

      acc[anoKey][semestreKey].push({
        id: item.Disciplina.iddisciplina,
        idsemestre: item.idsemestre,
        nome: item.Disciplina.disciplina,
      });

      return acc;
    }, {});

    res.status(200).json({
      curso: resultados[0]?.Curso?.curso || "Curso não encontrado",
      categoria: resultados[0]?.Curso?.CategoriaCurso?.categoriacurso || "",
      totalDisciplinas: resultados.length,
      disciplinas: disciplinasAgrupadas,
    });
  } catch (error) {
    console.error("Erro ao buscar disciplinas do curso:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/professorVinculado/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await DiscProf.findAll({
      attributes: ["iddiscprof"],
      include: [
        {
          model: Professor,
          attributes: [
            "idprofessor",
            "nomeprofessor",
            "fotoprofessor",
            "titulacaoprofessor",
          ],
        },
        {
          model: Disciplina,
          attributes: ["iddisciplina", "disciplina"],
          where: {
            iddisciplina: id,
          },
        },
      ],
      where: {
        estado: "Ativo",
      },
      order: [[Professor, "nomeprofessor", "ASC"]],
    });

    const professoresComFoto = result.map((item) => {
      const professor = item.Professor;

      return {
        iddiscprof: item.iddiscprof,
        idprofessor: professor.idprofessor,
        nomeprofessor: professor.nomeprofessor,
        titulacaoprofessor: professor.titulacaoprofessor,
        disciplina: item.Disciplina.disciplina,
        iddisciplina: item.Disciplina.iddisciplina,
        fotoUrl: professor.fotoprofessor
          ? `${process.env.REACT_APP_API_URL}/api/img/professores/${professor.fotoprofessor}`
          : null,
      };
    });

    res.status(200).json(professoresComFoto);
  } catch (error) {
    console.error("Erro ao buscar professores vinculados:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/professorDisponivel/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Professor.findAll({
      attributes: [
        "idprofessor",
        "nomeprofessor",
        "titulacaoprofessor",
        "fotoprofessor",
      ],
      where: {
        estado: "Ativo",
        idprofessor: {
          [Op.notIn]: Sequelize.literal(`(
            SELECT "idprofessor"
            FROM "disc_prof"
            WHERE "iddisciplina" = ${id}
          )`),
        },
      },
      order: [["nomeprofessor", "ASC"]],
    });

    const professoresComFoto = result.map((professor) => ({
      idprofessor: professor.idprofessor,
      nomeprofessor: professor.nomeprofessor,
      titulacaoprofessor: professor.titulacaoprofessor,
      fotoUrl: professor.fotoprofessor
        ? `${process.env.REACT_APP_API_URL}/api/img/professores/${professor.fotoprofessor}`
        : null,
    }));

    res.status(200).json(professoresComFoto);
  } catch (error) {
    console.error("Erro ao buscar professores disponíveis:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});
router.get("/estatisticasProfessores", async (req, res) => {
  try {
    const stats = await Professor.findOne({
      attributes: [
        [
          Sequelize.fn("COUNT", Sequelize.col("idprofessor")),
          "totalProfessores",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal("CASE WHEN fotoprofessor IS NOT NULL THEN 1 END"),
          ),
          "professoresComFoto",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(
              "CASE WHEN titulacaoprofessor IS NOT NULL AND titulacaoprofessor != '' THEN 1 END",
            ),
          ),
          "professoresComTitulacao",
        ],
      ],
      where: { estado: "Ativo" },
    });

    res.status(200).json(stats || {});
  } catch (error) {
    console.error("Erro ao buscar estatísticas de professores:", error);
    res
      .status(500)
      .json({ error: "Erro interno do servidor", details: error.message });
  }
});

router.get("/distribuicaoTitulacao", async (req, res) => {
  try {
    const distribuicao = await Professor.findAll({
      attributes: [
        [
          Sequelize.fn(
            "COALESCE",
            Sequelize.col("titulacaoprofessor"),
            "Não informado",
          ),
          "titulacao",
        ],
        [Sequelize.fn("COUNT", Sequelize.col("idprofessor")), "quantidade"],
      ],
      where: { estado: "Ativo" },
      group: ["titulacao"],
      order: [[Sequelize.literal("quantidade"), "DESC"]],
    });

    res.status(200).json(distribuicao);
  } catch (error) {
    console.error("Erro ao buscar distribuição por titulação:", error);
    res
      .status(500)
      .json({ error: "Erro interno do servidor", details: error.message });
  }
});

router.get("/professoresPorDisciplina", async (req, res) => {
  try {
    const resultados = await Disciplina.findAll({
      attributes: [
        "iddisciplina",
        "disciplina",
        [
          Sequelize.fn("COUNT", Sequelize.col("disc_profs.idprofessor")),
          "totalProfessores",
        ],
        [
          Sequelize.fn(
            "STRING_AGG",
            Sequelize.fn("DISTINCT", Sequelize.col("professors.nomeprofessor")),
            ", ",
          ),
          "professores",
        ],
      ],
      include: [
        {
          model: DiscProf,
          as: "disc_profs",
          required: false,
          include: [
            {
              model: Professor,
              as: "professors",
              where: { estado: "Ativo" },
              required: false,
            },
          ],
        },
      ],
      group: ["Disciplina.iddisciplina", "Disciplina.disciplina"],
      order: [
        [Sequelize.literal("totalProfessores"), "DESC"],
        ["disciplina", "ASC"],
      ],
    });

    res.status(200).json(resultados);
  } catch (error) {
    console.error("Erro ao buscar professores por disciplina:", error);
    res
      .status(500)
      .json({ error: "Erro interno do servidor", details: error.message });
  }
});

//const { Professor, DiscProf, Disciplina, Sequelize } = require("../models");

router.get("/disciplinasMaisMinistradas", async (req, res) => {
  try {
    const disciplinas = await DiscProf.findAll({
      attributes: [
        [Sequelize.col("disciplina.disciplina"), "disciplina"],
        [
          Sequelize.fn("COUNT", Sequelize.col("disc_prof.idprofessor")),
          "totalProfessores",
        ],
        [
          Sequelize.fn(
            "STRING_AGG",
            Sequelize.col("professor.nomeprofessor"),
            ", ",
          ),
          "professoresNomes",
        ],
      ],
      include: [
        { model: Disciplina, attributes: [] }, // sem alias
        { model: Professor, attributes: [], where: { estado: "Ativo" } }, // sem alias
      ],
      group: ["disciplina.disciplina"],
      order: [[Sequelize.literal('"totalProfessores"'), "DESC"]],
      limit: 10,
      raw: true,
    });

    res.json(disciplinas);
  } catch (error) {
    console.error("Erro disciplinas:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/professoresMaisAtivos", async (req, res) => {
  try {
    const professores = await DiscProf.findAll({
      attributes: [
        [col("Professor.idprofessor"), "idprofessor"],
        [col("Professor.nomeprofessor"), "nomeprofessor"],
        [col("Professor.titulacaoprofessor"), "titulacaoprofessor"],
        [col("Professor.fotoprofessor"), "fotoprofessor"],
        [fn("COUNT", fn("DISTINCT", col("iddisciplina"))), "totalDisciplinas"],
        [
          fn(
            "GROUP_CONCAT",
            literal("DISTINCT `Disciplina`.`disciplina` SEPARATOR ', '"),
          ),
          "disciplinas",
        ],
      ],
      include: [
        {
          model: Professor,
          attributes: [],
          where: { estado: "Ativo" },
        },
        {
          model: Disciplina,
          attributes: [],
        },
      ],
      group: [
        "Professor.idprofessor",
        "Professor.nomeprofessor",
        "Professor.titulacaoprofessor",
        "Professor.fotoprofessor",
      ],
      having: literal("totalDisciplinas > 0"),
      order: [[literal("totalDisciplinas"), "DESC"]],
      limit: 10,
      raw: true,
    });

    const professoresComFoto = professores.map((p) => ({
      ...p,
      fotoUrl: p.fotoprofessor
        ? `${process.env.REACT_APP_API_URL}/api/img/professores/${p.fotoprofessor}`
        : null,
    }));

    res.status(200).json(professoresComFoto);
  } catch (error) {
    console.error("Erro ao buscar professores mais ativos:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/professoresSemDisciplinas", async (req, res) => {
  try {
    const professores = await Professor.findAll({
      attributes: [
        "idprofessor",
        "nomeprofessor",
        "emailprofessor",
        "telefoneprofessor",
        "senhaprofessor",
        "idadm",
        "estado",
      ],
      include: [
        { model: DiscProf, attributes: [], required: false }, // left join
      ],
      where: { estado: "Ativo" },
      group: ["professor.idprofessor"],
      having: Sequelize.literal('COUNT("disc_profs"."idprofessor") = 0'),
      order: [["nomeprofessor", "ASC"]],
      raw: true,
    });

    res.json(professores);
  } catch (error) {
    console.error("Erro sem disciplina:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/professorVinculadoDisciplinas/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const disciplinas = await DiscProf.findAll({
      where: { idprofessor: id },
      include: [
        {
          model: Disciplina,
          attributes: ["iddisciplina", "disciplina"],
        },
      ],
      order: [[Disciplina, "disciplina", "ASC"]],
      attributes: ["iddiscprof"],
    });

    res.status(200).json(disciplinas);
  } catch (error) {
    console.error("Erro ao buscar disciplinas vinculadas:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/Professores", async (req, res) => {
  try {
    const professores = await Professor.findAll({
      where: { estado: "Ativo" },
      order: [["nomeprofessor", "ASC"]],
    });

    const professoresComFoto = professores.map((prof) => ({
      ...prof.dataValues,
      fotoUrl: prof.fotoprofessor
        ? `${process.env.REACT_APP_API_URL}/api/img/professores/${prof.fotoprofessor}`
        : null,
    }));

    res.status(200).json(professoresComFoto);
  } catch (error) {
    console.error("Erro ao buscar professores:", error);
    res
      .status(500)
      .json({ error: "Erro interno do servidor", details: error.message });
  }
});

router.get("/CategoriaCursosAno", async (req, res) => {
  try {
    const dados = await CategoriaCurso.findAll({
      include: [
        {
          model: Curso,
          include: [
            {
              model: AnoCurricular,
            },
          ],
        },
      ],
      order: [
        [Curso, AnoCurricular, "anocurricular", "ASC"],
        [Curso, "curso", "ASC"],
      ],
      limit: 500,
    });

    res.status(200).json(dados);
  } catch (error) {
    console.error("Erro ao buscar dados combinados:", error);
    res
      .status(500)
      .json({ error: "Erro interno do servidor", details: error.message });
  }
});

router.get("/turmas", async (req, res) => {
  try {
    const turmas = await Periodo.findAll({
      include: [
        { model: CategoriaCurso, attributes: ["categoriacurso"] },
        { model: Curso, attributes: ["curso"] },
        { model: AnoCurricular, attributes: ["anocurricular"] },
      ],
      order: [
        ["anoletivo", "ASC"],
        [AnoCurricular, "anocurricular", "ASC"],
        ["turma", "ASC"],
      ],
      limit: 10000,
    });

    res.status(200).json(turmas);
  } catch (error) {
    console.error("Erro ao buscar turmas:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/estatisticasProfessoresDesativados", async (req, res) => {
  try {
    const total = await Professor.count({ where: { estado: "Desativado" } });

    const desativadosComTitulacao = await Professor.count({
      where: {
        estado: "Desativado",
        titulacaoprofessor: { [Sequelize.Op.ne]: null },
      },
    });

    res.status(200).json({
      totalProfessoresDesativados: total,
      desativadosComTitulacao,
    });
  } catch (error) {
    console.error(
      "Erro ao buscar estatísticas de professores desativados:",
      error,
    );
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/professoresDesativados", async (req, res) => {
  try {
    const professores = await Professor.findAll({
      where: { estado: "Desativado" },
      order: [["nomeprofessor", "ASC"]],
    });

    const professoresComFoto = professores.map((professor) => ({
      ...professor.toJSON(),
      fotoUrl: professor.fotoprofessor
        ? `${process.env.REACT_APP_API_URL}/api/img/professores/${professor.fotoprofessor}`
        : null,
    }));

    res.status(200).json(professoresComFoto);
  } catch (error) {
    console.error("Erro ao buscar professores desativados:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/distribuicaoTitulacaoDesativados", async (req, res) => {
  try {
    const distribuicao = await Professor.findAll({
      attributes: [
        [
          Sequelize.fn(
            "COALESCE",
            Sequelize.col("titulacaoprofessor"),
            "Não informado",
          ),
          "titulacao",
        ],
        [Sequelize.fn("COUNT", Sequelize.col("idprofessor")), "quantidade"],
      ],
      where: { estado: "Desativado" },
      group: [
        Sequelize.fn(
          "COALESCE",
          Sequelize.col("titulacaoprofessor"),
          "Não informado",
        ),
      ],
      order: [[Sequelize.literal("quantidade"), "DESC"]],
      raw: true,
    });

    res.status(200).json(distribuicao);
  } catch (error) {
    console.error("Erro na distribuição desativados:", error);
    res
      .status(500)
      .json({ error: "Erro interno do servidor", details: error.message });
  }
});

router.get("/estatisticasFuncionariosDesativados", async (req, res) => {
  try {
    const totalFuncionariosDesativados = await Funcionario.count({
      where: { estado_funcionario: "Desativado" },
    });

    res.status(200).json({ totalFuncionariosDesativados });
  } catch (error) {
    console.error(
      "Erro ao buscar estatísticas de funcionários desativados:",
      error,
    );
    res
      .status(500)
      .json({ error: "Erro interno do servidor", details: error.message });
  }
});

router.get("/estatisticasFuncionarios", async (req, res) => {
  try {
    const result = await Funcionario.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.literal("*")), "totalFuncionarios"],

        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(`CASE 
              WHEN bi_funcionario IS NOT NULL AND bi_funcionario != '' 
              THEN 1 END`),
          ),
          "funcionariosComBI",
        ],

        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal(`CASE 
              WHEN contacto_funcionario IS NOT NULL AND contacto_funcionario != '' 
              THEN 1 END`),
          ),
          "funcionariosComContacto",
        ],
      ],
      where: {
        estado_funcionario: "Ativo",
      },
      raw: true,
    });

    res.status(200).json(result[0] || {});
  } catch (error) {
    console.error("Erro ao buscar estatísticas de funcionários:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/funcionarios", async (req, res) => {
  try {
    const funcionarios = await Funcionario.findAll({
      where: { estado_funcionario: "Ativo" },
      include: [
        {
          model: CargoFuncionarioRelation,
          include: [
            {
              model: CargoFuncionario,
              attributes: ["id_cargo", "cargo"],
            },
          ],
          attributes: [],
        },
      ],
      order: [["nome_funcionario", "ASC"]],
    });

    res.status(200).json(funcionarios);
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);
    res
      .status(500)
      .json({ error: "Erro interno do servidor", details: error.message });
  }
});

router.get("/funcionariosDesativados", async (req, res) => {
  try {
    const funcionarios = await Funcionario.findAll({
      where: { estado_funcionario: "Desativado" },
      include: [
        {
          model: CargoFuncionarioRelation,
          include: [
            {
              model: CargoFuncionario,
              attributes: ["id_cargo", "cargo"],
            },
          ],
          attributes: [],
        },
      ],
      order: [["nome_funcionario", "ASC"]],
    });

    res.status(200).json(funcionarios);
  } catch (error) {
    console.error("Erro ao buscar funcionários desativados:", error);
    res
      .status(500)
      .json({ error: "Erro interno do servidor", details: error.message });
  }
});

router.get("/funcionario/:id", async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id) || parseInt(id) <= 0) {
    return res.status(400).json({ error: "ID do funcionário inválido" });
  }

  try {
    const funcionario = await Funcionario.findOne({
      where: { id_funcionario: id },
      include: [
        {
          model: CargoFuncionarioRelation,
          as: "cargo_funcionario_relation",
          include: [
            {
              model: CargoFuncionario,
              as: "cargo_funcionario",
              attributes: ["id_cargo", "cargo"],
            },
          ],
          attributes: [],
        },
      ],
    });

    if (!funcionario) {
      return res.status(404).json({ error: "Funcionário não encontrado" });
    }

    res.status(200).json(funcionario);
  } catch (error) {
    console.error("Erro ao buscar funcionário:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.get("/funcionariosPorCargo/:id_cargo", async (req, res) => {
  const { id_cargo } = req.params;

  if (!id_cargo || isNaN(id_cargo) || parseInt(id_cargo) <= 0) {
    return res.status(400).json({ error: "ID do cargo inválido" });
  }

  try {
    const funcionarios = await Funcionario.findAll({
      where: { estado_funcionario: "Ativo" },
      include: [
        {
          model: CargoFuncionarioRelation,
          as: "cargo_funcionario_relation",
          where: { id_cargo: id_cargo },
          attributes: [],
          include: [
            {
              model: CargoFuncionario,
              as: "cargo_funcionario",
              attributes: ["cargo"],
            },
          ],
        },
      ],
      order: [["nome_funcionario", "ASC"]],
      raw: true,
      nest: true,
    });

    res.status(200).json(funcionarios);
  } catch (error) {
    console.error("Erro ao buscar funcionários por cargo:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/dashboardFuncionarios", async (req, res) => {
  try {
    const ativos = await Funcionario.count({
      where: { estado_funcionario: "Ativo" },
    });
    const desativados = await Funcionario.count({
      where: { estado_funcionario: "Desativado" },
    });
    const total = await Funcionario.count();

    const percentAtivos = ((ativos / (total || 1)) * 100).toFixed(1);
    const percentDesativados = ((desativados / (total || 1)) * 100).toFixed(1);

    res.status(200).json({
      ativos,
      desativados,
      total,
      percentAtivos,
      percentDesativados,
      dadosGrafico: [
        { nome: "Ativos", valor: ativos, cor: "#003366" },
        { nome: "Desativados", valor: desativados, cor: "#DC143C" },
      ],
    });
  } catch (error) {
    console.error("Erro ao buscar dashboard de funcionários:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/cargosFuncionarios", async (req, res) => {
  try {
    const cargos = await CargoFuncionarioRelation.findAll({
      attributes: [
        [Sequelize.col("cargo_funcionario.cargo"), "cargo"],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.col("cargo_funcionario_relation.id_funcionario"),
          ),
          "quantidade",
        ],
      ],
      include: [
        {
          model: Funcionario,
          as: "funcionario",
          attributes: [],
          where: { estado_funcionario: "Ativo" },
        },
        {
          model: CargoFuncionario,
          as: "cargo_funcionario",
          attributes: [],
        },
      ],
      group: ["cargo_funcionario.cargo"],
      order: [[Sequelize.literal("quantidade"), "DESC"]],
      limit: 100,
      raw: true,
    });

    res.status(200).json(cargos);
  } catch (error) {
    console.error("Erro ao buscar cargos de funcionários:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/cargosDisponiveis", async (req, res) => {
  try {
    const cargos = await CargoFuncionario.findAll({
      attributes: ["id_cargo", "cargo"],
      order: [["cargo", "ASC"]],
      raw: true,
    });

    res.status(200).json(cargos);
  } catch (error) {
    console.error("Erro ao buscar cargos disponíveis:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

router.get("/EstudantesInscritos", async (req, res) => {
  try {
    const estudantes = await EstudanteInscricao.findAll({
      where: {
        pdf_InscricaoRupe: null,
        estado_estdanteInscrito: "Pendente",
      },
      include: [
        {
          model: Curso,
          as: "curso",
          attributes: ["idcurso", "curso"],
        },
      ],
      order: [["nome_estudanteInscricao", "ASC"]],
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const estudanteFoto = estudantes.map((estudante) => ({
      ...estudante.toJSON(),
      fotoUrl: estudante.foto_estudanteInscricao
        ? `${baseUrl}/api/img/estudantes/${estudante.foto_estudanteInscricao}`
        : null,
      docUrl: estudante.documento_estudanteInscricao
        ? `${baseUrl}/api/img/estudantes/documentos/${estudante.documento_estudanteInscricao}`
        : null,
      docInscricao: estudante.pdf_InscricaoRupe
        ? `${baseUrl}/api/img/estudantes/Pagamento_Inscricao/${estudante.pdf_InscricaoRupe}`
        : null,
    }));

    res.status(200).json(estudanteFoto);
  } catch (error) {
    console.error("Erro ao buscar estudantes:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});
router.get("/cargosDisponiveis", cargosDisponiveis);

module.exports = router;
