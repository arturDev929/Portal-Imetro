const conexao = require("../infra/conexao");
//const { Periodo, AnoCurricular, Curso, CategoriaCurso } = require("../models"); // Ajuste conforme seus models
const { Op } = require("sequelize");
const Periodo = require("../Models/periodoModel");
const AnoCurricular = require("../Models/anoCurricularModel");
const Curso = require("../Models/cursoModel");
const CategoriaCurso = require("../Models/categoriacursoModel");

const atualizarTurma = async (req, res) => {
  const { id } = req.params;
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
      tipo: "erro",
      titulo: "Dados incompletos",
      mensagem: "Por favor, preencha todos os campos obrigatórios",
    });
  }

  try {
    const turmaAtual = await Periodo.findByPk(id);
    if (!turmaAtual) {
      return res.status(404).json({
        sucesso: false,
        tipo: "erro",
        titulo: "Turma não encontrada",
        mensagem: "A turma que você está tentando editar não existe",
      });
    }

    const ano = await AnoCurricular.findByPk(idanocurricular);
    if (!ano) {
      return res.status(400).json({
        sucesso: false,
        tipo: "erro",
        titulo: "Ano Curricular inválido",
        mensagem: "O ano curricular selecionado não existe",
      });
    }

    const curso = await Curso.findByPk(idcurso);
    if (!curso) {
      return res.status(400).json({
        sucesso: false,
        tipo: "erro",
        titulo: "Curso inválido",
        mensagem: "O curso selecionado não existe",
      });
    }

    const categoria = await CategoriaCurso.findByPk(idcategoriacurso);
    if (!categoria) {
      return res.status(400).json({
        sucesso: false,
        tipo: "erro",
        titulo: "Categoria inválida",
        mensagem: "A categoria selecionada não existe",
      });
    }

    if (curso.idcategoriacurso !== idcategoriacurso) {
      return res.status(400).json({
        sucesso: false,
        tipo: "erro",
        titulo: "Inconsistência de dados",
        mensagem: "O curso selecionado não pertence à categoria informada",
      });
    }

    const duplicado = await Periodo.findOne({
      where: {
        idanocurricular,
        idcurso,
        idcategoriacurso,
        turma,
        periodo,
        anoletivo,
        idperiodo: { [Op.ne]: id },
      },
    });

    if (duplicado) {
      return res.status(400).json({
        sucesso: false,
        tipo: "erro",
        titulo: "Turma/Período Duplicado",
        mensagem: `Já existe outra turma "${turma}" no período "${periodo}" para este curso/ano`,
      });
    }

    await turmaAtual.update({
      idanocurricular,
      idcurso,
      idcategoriacurso,
      turma,
      periodo,
      anoletivo,
    });

    const dadosCompletos = await Periodo.findOne({
      where: { idperiodo: id },
      include: [
        { model: AnoCurricular, as: "anoCurricular" },
        { model: Curso, as: "curso" },
        { model: CategoriaCurso, as: "categoriaCurso" },
      ],
    });

    return res.status(200).json({
      sucesso: true,
      tipo: "sucesso",
      titulo: "Turma/Período Atualizado",
      mensagem: `Turma "${turma}" no período "${periodo}" atualizada com sucesso!`,
      dados: dadosCompletos,
    });
  } catch (error) {
    console.error("Erro ao atualizar turma:", error);
    return res.status(500).json({
      sucesso: false,
      tipo: "erro",
      titulo: "Erro no servidor",
      mensagem: "Erro interno ao atualizar turma/período",
      detalhes: error.message,
    });
  }
};

const excluirTurma = async (req, res) => {
  const { id } = req.params;

  try {
    const resultado = await Periodo.destroy({
      where: { idperiodo: id },
    });

    if (resultado === 0) {
      return res.status(404).json({
        sucesso: false,
        tipo: "erro",
        titulo: "Turma não encontrada",
        mensagem: "A turma que você está tentando excluir não existe",
      });
    }

    return res.status(200).json({
      sucesso: true,
      tipo: "sucesso",
      titulo: "Turma excluída",
      mensagem: "Turma excluída com sucesso",
      affectedRows: resultado,
    });
  } catch (error) {
    console.error("Erro ao excluir turma:", error);
    return res.status(500).json({
      sucesso: false,
      tipo: "erro",
      titulo: "Erro no servidor",
      mensagem: "Erro interno ao excluir a turma",
      details: error.message,
    });
  }
};

module.exports = { atualizarTurma, excluirTurma };
