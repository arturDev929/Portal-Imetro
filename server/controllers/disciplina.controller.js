const conexao = require("../infra/conexao");
const Disciplina = require("../Models/disciplinaModel");
const Semestre = require("../Models/semestreModel");


const atualizarDisciplina = async (req, res) => {
  const { id } = req.params;
  const { disciplina } = req.body;

  
  if (!id || isNaN(id) || id <= 0) {
    return res.status(400).json({ error: "ID da disciplina inválido" });
  }

  if (!disciplina || !disciplina.trim()) {
    return res.status(400).json({ error: "Nome da disciplina é obrigatório" });
  }

  try {
 
    const disciplinaAtual = await Disciplina.findByPk(id);
    if (!disciplinaAtual) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
    }

   
    const disciplinaExistente = await Disciplina.findOne({
      where: {
        disciplina: disciplina.trim(),
        iddisciplina: { [Op.ne]: id },
      },
    });

    if (disciplinaExistente) {
      return res.status(400).json({
        error: `A disciplina "${disciplina}" já existe no sistema`,
      });
    }


    await disciplinaAtual.update({ disciplina: disciplina.trim() });

    res.status(200).json({
      success: true,
      message: `Disciplina "${disciplinaAtual.disciplina}" atualizada para "${disciplina}"`,
      iddisciplina: id,
      disciplina: disciplina.trim(),
    });
  } catch (error) {
    console.error("Erro ao atualizar disciplina:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
};

const excluirDisciplina = async (req, res) => {
  const { id } = req.params;

  const t = await conexao.transaction();

  try {
    const disciplina = await Disciplina.findByPk(id, { transaction: t });

    if (!disciplina) {
      await t.rollback();
      return res.status(404).json({
        error: "Disciplina não encontrada",
      });
    }

    const semestresDeletados = await Semestre.destroy({
      where: { iddisciplina: id },
      transaction: t,
    });

    console.log(`Semestres deletados: ${semestresDeletados}`);

    const disciplinaDeletada = await Disciplina.destroy({
      where: { iddisciplina: id },
      transaction: t,
    });

    await t.commit();

    res.status(200).json({
      message: "Disciplina deletada com sucesso",
      disciplinaAfetada: disciplinaDeletada,
      semestresAfetados: semestresDeletados,
    });
  } catch (error) {
    await t.rollback();

    console.error("Erro ao excluir disciplina:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
    });
  }
};

module.exports = { atualizarDisciplina, excluirDisciplina };
