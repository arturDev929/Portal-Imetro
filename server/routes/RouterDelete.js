const { Router } = require("express");
const router = Router();
const conexao = require("../infra/conexao");
const {
  excluirPermanentementeFuncionario,
} = require("../controllers/funcionario.controller");
const { excluirTurma } = require("../controllers/turma.controller");
const { desvincularProfessor } = require("../controllers/professor.controller");
const { excluirDisciplina } = require("../controllers/disciplina.controller");
const CategoriaCurso = require("../Models/categoriacursoModel");
const Curso = require("../Models/cursoModel");
const Semestre = require("../Models/semestreModel");
const AnoCurricular = require("../Models/anoCurricularModel");

router.delete("/categoriaCurso/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Tentando deletar categoria ID:", id);

    if (!id || id.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "ID da categoria é obrigatório",
      });
    }

    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID da categoria inválido",
      });
    }

    const encontrarCategoria = await CategoriaCurso.findByPk(id);

    if (!encontrarCategoria) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }
    const categoriaNome = encontrarCategoria.categoriacurso;

    const cursosVinculados = await Curso.count({
      where: { idcategoriacurso: id },
    });

    if (cursosVinculados > 0) {
      return res.status(400).json({
        success: false,
        error: `Não é possível excluir a categoria: A categoria "${categoriaNome}" possui ${cursosVinculados} curso(s) vinculado(s). Remova os cursos primeiro.`,
      });
    }
    const deleteResult = await CategoriaCurso.destroy({
      where: { idcategoriacurso: id },
    });

    if (deleteResult === 0) {
      return res.status(404).json({
        success: false,
        error: "Categoria não encontrada para exclusão",
      });
    }
    res.status(200).json({
      success: true,
      message: `Categoria "${categoriaNome}" excluída com sucesso`,
      nomeExcluido: categoriaNome,
      affectedRows: deleteResult,
    });
  } catch (erro) {
    console.log(erro);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

router.delete("/curso/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Tentando deletar curso ID:", id);
  if (!id || id.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "ID do curso é obrigatório",
    });
  }

  if (isNaN(id) || parseInt(id) <= 0) {
    return res.status(400).json({
      success: false,
      error: "ID do curso inválido",
    });
  }

  try {
    const curso = await Curso.findByPk(id);

    if (!curso) {
      return res.status(404).json({
        success: false,
        error: "Curso não encontrado",
      });
    }

    const cursoNome = curso.curso;

    const semestresVinculados = await Semestre.count({
      where: { idcurso: id },
    });

    if (semestresVinculados > 0) {
      return res.status(400).json({
        success: false,
        error: `Não é possível excluir o curso "${cursoNome}" pois possui ${semestresVinculados} disciplina(s) vinculada(s).`,
      });
    }

    const anosVinculados = await AnoCurricular.count({
      where: { idcurso: id },
    });

    if (anosVinculados > 0) {
      return res.status(400).json({
        success: false,
        error: `Não é possível excluir o curso "${cursoNome}" pois possui ${anosVinculados} ano(s) curricular(es) vinculado(s).`,
      });
    }

    const deleteResult = await Curso.destroy({
      where: { idcurso: id },
    });

    if (deleteResult === 0) {
      return res.status(404).json({
        success: false,
        error: "Curso não encontrado para exclusão",
      });
    }

    res.status(200).json({
      success: true,
      message: `Curso "${cursoNome}" excluído com sucesso`,
      nomeExcluido: cursoNome,
      affectedRows: deleteResult,
    });
  } catch (error) {
    console.error("Erro ao deletar curso:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao excluir curso do banco de dados",
    });
  }
});

router.delete("/anocurricular/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Tentando deletar ano curricular ID:", id);

  if (!id || id.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "ID do ano curricular é obrigatório",
    });
  }

  if (isNaN(id) || parseInt(id) <= 0) {
    return res.status(400).json({
      success: false,
      error: "ID do ano curricular inválido",
    });
  }

  try {
    const ano = await AnoCurricular.findOne({
      where: { idanocurricular: id },
      include: [
        {
          model: Curso,
          attributes: ["curso"],
        },
      ],
    });

    if (!ano) {
      return res.status(404).json({
        success: false,
        error: "Ano curricular não encontrado",
      });
    }

    const anoCurricular = ano.anocurricular;
    const cursoNome = ano.Curso?.curso;

    const semestresVinculados = await Semestre.count({
      where: { idanocurricular: id },
    });

    if (semestresVinculados > 0) {
      return res.status(400).json({
        success: false,
        error: `Não é possível excluir o ano curricular "${anoCurricular}" pois possui ${semestresVinculados} semestre(s) vinculado(s).`,
      });
    }

    const deleteResult = await AnoCurricular.destroy({
      where: { idanocurricular: id },
    });

    if (deleteResult === 0) {
      return res.status(404).json({
        success: false,
        error: "Ano curricular não encontrado para exclusão",
      });
    }

    res.status(200).json({
      success: true,
      message: `Ano curricular "${anoCurricular}" do curso "${cursoNome}" excluído com sucesso`,
      anoExcluido: anoCurricular,
      curso: cursoNome,
      affectedRows: deleteResult,
    });
  } catch (error) {
    console.error("Erro ao deletar ano curricular:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao excluir ano curricular do banco de dados",
    });
  }
});

router.delete("/disciplinaSemestre/:idsemestre", async (req, res) => {
  const { idsemestre } = req.params;
  try {
    const result = await Semestre.destroy({
      where: { idsemestre },
    });

    if (result === 0) {
      return res.status(404).json({
        error: "Disciplina não encontrada no semestre",
      });
    }
    res.status(200).json({
      message: "Disciplina removida do semestre com sucesso",
      affectedRows: result,
    });
  } catch (error) {
    console.error("Erro ao excluir disciplina do semestre:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
});

router.delete("/disciplina/:id", excluirDisciplina);

router.delete(
  "/desvincularProfessor/:iddisciplina/:idprofessor",
  desvincularProfessor,
);

router.delete("/turma/:id", excluirTurma);

router.delete("/funcionario/permanent/:id", excluirPermanentementeFuncionario);

module.exports = router;
