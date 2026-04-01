const conexao = require("../infra/conexao");
const atualizarDisciplina = (req, res) => {
  const { id } = req.params;
  const { disciplina } = req.body;

  if (!id || isNaN(id) || id <= 0) {
    return res.status(400).json({ error: "ID da disciplina inválido" });
  }

  if (!disciplina || !disciplina.trim()) {
    return res.status(400).json({ error: "Nome da disciplina é obrigatório" });
  }

  const checkSql = "SELECT * FROM disciplina WHERE iddisciplina = ?";
  conexao.query(checkSql, [id], (checkError, checkResults) => {
    if (checkError) {
      console.error("Erro ao verificar disciplina:", checkError);
      return res.status(500).json({
        error: "Erro interno do servidor",
        details: checkError.message,
      });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({ error: "Disciplina não encontrada" });
    }

    const disciplinaAtual = checkResults[0];

    const checkNomeSql =
      "SELECT * FROM disciplina WHERE LOWER(disciplina) = LOWER(?) AND iddisciplina != ?";
    conexao.query(
      checkNomeSql,
      [disciplina.trim(), id],
      (nomeError, nomeResults) => {
        if (nomeError) {
          console.error("Erro ao verificar nome da disciplina:", nomeError);
          return res.status(500).json({
            error: "Erro interno do servidor",
            details: nomeError.message,
          });
        }

        if (nomeResults.length > 0) {
          return res.status(400).json({
            error: `A disciplina "${disciplina}" já existe no sistema`,
          });
        }

        const updateSql =
          "UPDATE disciplina SET disciplina = ? WHERE iddisciplina = ?";
        const values = [disciplina.trim(), id];

        conexao.query(updateSql, values, (updateError, updateResults) => {
          if (updateError) {
            console.error("Erro ao atualizar disciplina:", updateError);
            res.status(500).json({
              error: "Erro interno do servidor",
              details: updateError.message,
            });
          } else {
            if (updateResults.affectedRows === 0) {
              res
                .status(404)
                .json({ error: "Disciplina não encontrada para atualização" });
            } else {
              res.status(200).json({
                success: true,
                message: `Disciplina "${disciplinaAtual.disciplina}" atualizada para "${disciplina}"`,
                iddisciplina: id,
                disciplina: disciplina.trim(),
                alteracoes: {
                  nome: disciplinaAtual.disciplina !== disciplina,
                },
              });
            }
          }
        });
      },
    );
  });
};

const excluirDisciplina = (req, res) => {
  const { id } = req.params;

  const sqlSemestre = "DELETE FROM semestre WHERE iddisciplina = ?";

  conexao.query(sqlSemestre, [id], (error, result) => {
    if (error) {
      console.error("Erro ao excluir semestres relacionados:", error);
      return res.status(500).json({
        error: "Erro interno do servidor",
        details: error.message,
      });
    }

    console.log(`Semestres deletados: ${result.affectedRows}`);

    const sqlDisciplina = "DELETE FROM disciplina WHERE iddisciplina = ?";
    conexao.query(sqlDisciplina, [id], (error, result) => {
      if (error) {
        console.error("Erro ao excluir a disciplina:", error);
        return res.status(500).json({
          error: "Erro interno do servidor",
          details: error.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: "Disciplina não encontrada",
        });
      }

      res.status(200).json({
        message: "Disciplina deletada com Sucesso",
        disciplinaAfetada: result.affectedRows,
      });
    });
  });
};

module.exports = { atualizarDisciplina, excluirDisciplina };
