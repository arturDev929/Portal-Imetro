const conexao = require("../infra/conexao");


const atualizarCurso = (req, res) => {
  const { id } = req.params;
  const { curso, idcategoriacurso } = req.body;

  console.log("ID do curso recebido:", id);
  console.log("Dados recebidos:", { curso, idcategoriacurso });

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

  if (!curso || curso.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "O nome do curso é obrigatório",
    });
  }

  if (curso.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: "O nome do curso deve ter pelo menos 2 caracteres",
    });
  }

  if (curso.trim().length > 100) {
    return res.status(400).json({
      success: false,
      error: "O nome do curso não pode exceder 100 caracteres",
    });
  }

  if (isNaN(idcategoriacurso) || parseInt(idcategoriacurso) <= 0) {
    return res.status(400).json({
      success: false,
      error: "ID do departamento inválido",
    });
  }

  const checkCursoSql = "SELECT * FROM curso WHERE idcurso = ?";
  conexao.query(checkCursoSql, [id], (checkError, checkResults) => {
    if (checkError) {
      console.error("Erro ao verificar curso:", checkError);
      return res.status(500).json({
        success: false,
        error: "Erro ao verificar curso no banco de dados",
      });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Curso não encontrado",
      });
    }

    const checkCategoriaSql =
      "SELECT categoriacurso FROM categoriacurso WHERE idcategoriacurso = ?";
    conexao.query(
      checkCategoriaSql,
      [idcategoriacurso],
      (catError, catResults) => {
        if (catError) {
          console.error("Erro ao verificar departamento:", catError);
          return res.status(500).json({
            success: false,
            error: "Erro ao verificar departamento no banco de dados",
          });
        }

        if (catResults.length === 0) {
          return res.status(404).json({
            success: false,
            error: "Departamento não encontrado",
          });
        }

        const duplicateSql =
          "SELECT * FROM curso WHERE curso = ? AND idcurso != ?";
        conexao.query(
          duplicateSql,
          [curso.trim(), id],
          (duplicateError, duplicateResults) => {
            if (duplicateError) {
              console.error("Erro ao verificar duplicidade:", duplicateError);
              return res.status(500).json({
                success: false,
                error: "Erro ao verificar se curso já existe",
              });
            }

            if (duplicateResults.length > 0) {
              return res.status(400).json({
                success: false,
                error: "Já existe um curso com este nome",
              });
            }

            const updateSql =
              "UPDATE curso SET curso = ?, idcategoriacurso = ? WHERE idcurso = ?";
            const values = [curso.trim(), idcategoriacurso, id];

            conexao.query(updateSql, values, (error, results) => {
              if (error) {
                console.error("Erro ao atualizar curso:", error);
                return res.status(500).json({
                  success: false,
                  error: "Erro ao atualizar curso no banco de dados",
                });
              }

              if (results.affectedRows === 0) {
                return res.status(404).json({
                  success: false,
                  error: "Curso não encontrado para atualização",
                });
              }

              res.status(200).json({
                success: true,
                message: "Curso atualizado com sucesso",
                id: id,
                curso: curso.trim(),
                idcategoriacurso: idcategoriacurso,
                affectedRows: results.affectedRows,
              });
            });
          },
        );
      },
    );
  });
};

module.exports = { atualizarCurso };
