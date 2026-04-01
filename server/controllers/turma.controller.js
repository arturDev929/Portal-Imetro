const conexao = require("../infra/conexao");
const atualizarTurma = (req, res) => {
  const { id } = req.params;
  console.log("ID recebido:", id);

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

  const verificarExistenciaSQL =
    "SELECT idperiodo FROM periodo WHERE idperiodo = ?";

  conexao.query(verificarExistenciaSQL, [id], (erroExistencia, existe) => {
    if (erroExistencia) {
      console.error("Erro ao verificar existência:", erroExistencia);
      return res.status(500).json({
        sucesso: false,
        tipo: "erro",
        titulo: "Erro no servidor",
        mensagem: "Erro interno do servidor",
      });
    }

    if (existe.length === 0) {
      return res.status(404).json({
        sucesso: false,
        tipo: "erro",
        titulo: "Turma não encontrada",
        mensagem: "A turma que você está tentando editar não existe",
      });
    }

    const verificarAnoSQL =
      "SELECT idanocurricular, anocurricular FROM anocurricular WHERE idanocurricular = ?";

    conexao.query(
      verificarAnoSQL,
      [idanocurricular],
      (erroAno, resultadosAno) => {
        if (erroAno) {
          console.error("Erro ao verificar Ano:", erroAno);
          return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro no servidor",
            mensagem: "Erro interno do servidor",
          });
        }

        if (resultadosAno.length === 0) {
          return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Ano Curricular inválido",
            mensagem: "O ano curricular selecionado não existe",
          });
        }

        const verificarCursoSQL =
          "SELECT idcurso, curso, idcategoriacurso FROM curso WHERE idcurso = ?";

        conexao.query(
          verificarCursoSQL,
          [idcurso],
          (erroCurso, resultadosCurso) => {
            if (erroCurso) {
              console.error("Erro ao verificar Curso:", erroCurso);
              return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno do servidor",
              });
            }

            if (resultadosCurso.length === 0) {
              return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Curso inválido",
                mensagem: "O curso selecionado não existe",
              });
            }

            const verificarCategoriaSQL =
              "SELECT idcategoriacurso, categoriacurso FROM categoriacurso WHERE idcategoriacurso = ?";

            conexao.query(
              verificarCategoriaSQL,
              [idcategoriacurso],
              (erroCategoria, resultadosCategoria) => {
                if (erroCategoria) {
                  console.error("Erro ao verificar Categoria:", erroCategoria);
                  return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro no servidor",
                    mensagem: "Erro interno do servidor",
                  });
                }

                if (resultadosCategoria.length === 0) {
                  return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Categoria inválida",
                    mensagem: "A categoria selecionada não existe",
                  });
                }

                if (resultadosCurso[0].idcategoriacurso != idcategoriacurso) {
                  return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Inconsistência de dados",
                    mensagem:
                      "O curso selecionado não pertence à categoria informada",
                  });
                }

                const verificarDuplicadoSQL = `
                        SELECT idperiodo 
                        FROM periodo 
                        WHERE idanocurricular = ? 
                            AND idcurso = ? 
                            AND turma = ? 
                            AND periodo = ? 
                            AND anoletivo = ?
                            AND idperiodo != ?
                    `;

                conexao.query(
                  verificarDuplicadoSQL,
                  [idanocurricular, idcurso, turma, periodo, anoletivo, id],
                  (erroDuplicado, resultadosDuplicado) => {
                    if (erroDuplicado) {
                      console.error(
                        "Erro ao verificar duplicidade:",
                        erroDuplicado,
                      );
                      return res.status(500).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Erro no servidor",
                        mensagem: "Erro interno do servidor",
                      });
                    }

                    if (resultadosDuplicado.length > 0) {
                      return res.status(400).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Turma/Período Duplicado",
                        mensagem: `Já existe outra turma "${turma}" no período "${periodo}" para este curso/ano`,
                      });
                    }

                    const updateSQL = `
                            UPDATE periodo 
                            SET idanocurricular = ?, 
                                idcategoriacurso = ?, 
                                idcurso = ?, 
                                turma = ?, 
                                periodo = ?, 
                                anoletivo = ?
                            WHERE idperiodo = ?
                        `;

                    conexao.query(
                      updateSQL,
                      [
                        idanocurricular,
                        idcategoriacurso,
                        idcurso,
                        turma,
                        periodo,
                        anoletivo,
                        id,
                      ],
                      (erroUpdate, resultados) => {
                        if (erroUpdate) {
                          console.error(
                            "Erro ao atualizar período:",
                            erroUpdate,
                          );

                          if (erroUpdate.code === "ER_NO_REFERENCED_ROW_2") {
                            return res.status(400).json({
                              sucesso: false,
                              tipo: "erro",
                              titulo: "Chave estrangeira inválida",
                              mensagem:
                                "Uma das referências (ano curricular, curso ou categoria) não existe no sistema",
                            });
                          }

                          if (erroUpdate.code === "ER_DUP_ENTRY") {
                            return res.status(400).json({
                              sucesso: false,
                              tipo: "erro",
                              titulo: "Entrada duplicada",
                              mensagem:
                                "Esta turma/período já existe para este curso/ano",
                            });
                          }

                          return res.status(500).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Erro no servidor",
                            mensagem: "Erro interno ao atualizar turma/período",
                          });
                        }

                        const buscaDadosSQL = `
                                SELECT 
                                    p.*,
                                    ac.anocurricular,
                                    c.curso,
                                    cc.categoriacurso
                                FROM periodo p
                                INNER JOIN anocurricular ac ON ac.idanocurricular = p.idanocurricular
                                INNER JOIN curso c ON c.idcurso = p.idcurso
                                INNER JOIN categoriacurso cc ON cc.idcategoriacurso = p.idcategoriacurso
                                WHERE p.idperiodo = ?
                            `;

                        conexao.query(
                          buscaDadosSQL,
                          [id],
                          (erroBusca, dadosCompletos) => {
                            if (erroBusca) {
                              console.error(
                                "Erro ao buscar dados completos:",
                                erroBusca,
                              );
                              return res.status(500).json({
                                sucesso: false,
                                tipo: "erro",
                                titulo: "Erro no servidor",
                                mensagem:
                                  "Erro interno ao buscar dados atualizados",
                              });
                            }

                            return res.status(200).json({
                              sucesso: true,
                              tipo: "sucesso",
                              titulo: "Turma/Período Atualizado",
                              mensagem: `Turma "${turma}" no período "${periodo}" atualizada com sucesso!`,
                              dados: dadosCompletos[0] || {
                                idperiodo: id,
                                idanocurricular,
                                idcurso,
                                idcategoriacurso,
                                turma,
                                periodo,
                                anoletivo,
                                anocurricular: resultadosAno[0].anocurricular,
                                curso: resultadosCurso[0].curso,
                                categoriacurso:
                                  resultadosCategoria[0].categoriacurso,
                              },
                            });
                          },
                        );
                      },
                    );
                  },
                );
              },
            );
          },
        );
      },
    );
  });
};

const excluirTurma = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM periodo WHERE idperiodo = ?";
  conexao.query(sql, [id], (error, result) => {
    if (error) {
      console.error("Erro ao excluir turma:", error);
      res.status(500).json({
        error: "Erro interno do servidor",
        details: error.message,
      });
    } else {
      res.status(200).json({
        message: "Turma excluída com sucesso",
        affectedRows: result.affectedRows,
      });
    }
  });
};

module.exports = { atualizarTurma, excluirTurma };
