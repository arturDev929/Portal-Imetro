const conexao = require("../infra/conexao");

const atualizarCategoriaCurso = (req, res) => {
  const { id } = req.params;
  const { categoriacurso } = req.body;

  console.log("ID recebido:", id);
  console.log("Dados recebidos:", { categoriacurso });

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

  if (!categoriacurso || categoriacurso.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "O nome da categoria é obrigatório",
    });
  }

  if (categoriacurso.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: "O nome da categoria deve ter pelo menos 2 caracteres",
    });
  }

  if (categoriacurso.trim().length > 100) {
    return res.status(400).json({
      success: false,
      error: "O nome da categoria não pode exceder 100 caracteres",
    });
  }

  const checkSql = "SELECT * FROM categoriacurso WHERE idcategoriacurso = ?";

  conexao.query(checkSql, [id], (checkError, checkResults) => {
    if (checkError) {
      console.error("Erro ao verificar categoria:", checkError);
      return res.status(500).json({
        success: false,
        error: "Erro ao verificar categoria no banco de dados",
      });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Categoria não encontrada",
      });
    }

    const duplicateSql =
      "SELECT * FROM categoriacurso WHERE categoriacurso = ? AND idcategoriacurso != ?";

    conexao.query(
      duplicateSql,
      [categoriacurso.trim(), id],
      (duplicateError, duplicateResults) => {
        if (duplicateError) {
          console.error("Erro ao verificar duplicidade:", duplicateError);
          return res.status(500).json({
            success: false,
            error: "Erro ao verificar se categoria já existe",
          });
        }

        if (duplicateResults.length > 0) {
          return res.status(400).json({
            success: false,
            error: "Já existe uma categoria com este nome",
          });
        }

        const updateSql =
          "UPDATE categoriacurso SET categoriacurso = ? WHERE idcategoriacurso = ?";
        const values = [categoriacurso.trim(), id];

        conexao.query(updateSql, values, (error, results) => {
          if (error) {
            console.error("Erro ao atualizar categoria:", error);
            return res.status(500).json({
              success: false,
              error: "Erro ao atualizar categoria no banco de dados",
            });
          }

          if (results.affectedRows === 0) {
            return res.status(404).json({
              success: false,
              error: "Categoria não encontrada para atualização",
            });
          }

          res.status(200).json({
            success: true,
            message: "Categoria atualizada com sucesso",
            id: id,
            categoriacurso: categoriacurso.trim(),
            affectedRows: results.affectedRows,
          });
        });
      },
    );
  });
};

module.exports = { atualizarCategoriaCurso };
