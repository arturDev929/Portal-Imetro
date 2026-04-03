const bcrypt = require("bcryptjs");
const conexao = require("../infra/conexao");
const Funcionario = require("../Models/funcionarioModel");
const CargoFuncionarioRelation = require("../Models/cargoFuncionarioRelationModel");


const ativarFuncionario = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "ID do funcionário inválido" });
    }

    const funcionario = await Funcionario.findOne({
      where: {
        id_funcionario: id,
        estado_funcionario: "Desativado",
      },
    });

    if (!funcionario) {
      return res.status(404).json({
        error: "Funcionário não encontrado ou já está ativo",
      });
    }

    const nome = funcionario.nome_funcionario;
    await funcionario.update({
      estado_funcionario: "Ativo",
    });

    return res.status(200).json({
      success: true,
      message: `Funcionário ${nome} ativado com sucesso`,
      funcionario: nome,
    });

  } catch (error) {
    console.error("Erro ao ativar funcionário:", error);
    return res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
};

const desativarFuncionario = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({ error: "ID do funcionário inválido" });
    }

    
    const funcionario = await Funcionario.findOne({
      where: {
        id_funcionario: id,
        estado_funcionario: "Ativo",
      },
    });

    if (!funcionario) {
      return res.status(404).json({
        error: "Funcionário não encontrado ou já está desativado",
      });
    }

    const nome = funcionario.nome_funcionario;

  
    await funcionario.update({
      estado_funcionario: "Desativado",
    });

    return res.status(200).json({
      success: true,
      message: `Funcionário ${nome} desativado com sucesso`,
      funcionario: nome,
    });

  } catch (error) {
    console.error("Erro ao desativar funcionário:", error);
    return res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
};

const alterarSenhaFuncionario = async (req, res) => {
  try {
    const { id } = req.params;
    const { senha_funcionario } = req.body;

    if (!id || id.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "ID do funcionário é obrigatório",
      });
    }

    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID do funcionário inválido",
      });
    }

    if (!senha_funcionario || senha_funcionario.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "A nova senha é obrigatória",
      });
    }

    if (senha_funcionario.trim().length < 4) {
      return res.status(400).json({
        success: false,
        error: "A senha deve ter pelo menos 4 caracteres",
      });
    }

    const funcionario = await Funcionario.findByPk(id);

    if (!funcionario) {
      return res.status(404).json({
        success: false,
        error: "Funcionário não encontrado",
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha_funcionario, 10);

    await funcionario.update({
      senha_funcionario: senhaCriptografada,
    });

    return res.status(200).json({
      success: true,
      message: "Senha alterada com sucesso",
      dados: {
        id: funcionario.id_funcionario,
        nome_funcionario: funcionario.nome_funcionario,
        senha_alterada: true,
      },
    });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
};

const actualizardadosFuncionario = async (req, res) => {
  const { id } = req.params;
  const {
    nome_funcionario,
    contacto_funcionario,
    bi_funcionario,
    cargo_funcionario,
    idAdm,
  } = req.body;

  // Validações
  if (!id || id.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "ID do funcionário é obrigatório",
    });
  }

  if (isNaN(id) || parseInt(id) <= 0) {
    return res.status(400).json({
      success: false,
      error: "ID do funcionário inválido",
    });
  }

  if (!nome_funcionario || nome_funcionario.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "O nome do funcionário é obrigatório",
    });
  }

  if (!contacto_funcionario || contacto_funcionario.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "O contacto é obrigatório",
    });
  }

  if (!bi_funcionario || bi_funcionario.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "O BI é obrigatório",
    });
  }

  if (!cargo_funcionario || cargo_funcionario.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "O cargo é obrigatório",
    });
  }

  if (!idAdm) {
    return res.status(400).json({
      success: false,
      error: "ID do administrador é obrigatório",
    });
  }

  conexao.beginTransaction((erroTransacao) => {
    if (erroTransacao) {
      console.error("Erro ao iniciar transação:", erroTransacao);
      return res.status(500).json({
        success: false,
        error: "Erro ao iniciar transação",
      });
    }

    const checkSql = "SELECT * FROM funcionario WHERE id_funcionario = ?";

    conexao.query(checkSql, [id], (checkError, checkResults) => {
      if (checkError) {
        return conexao.rollback(() => {
          console.error("Erro ao verificar funcionário:", checkError);
          return res.status(500).json({
            success: false,
            error: "Erro ao verificar funcionário no banco de dados",
          });
        });
      }

      if (checkResults.length === 0) {
        return conexao.rollback(() => {
          return res.status(404).json({
            success: false,
            error: "Funcionário não encontrado",
          });
        });
      }

      const checkContactoSql =
        "SELECT id_funcionario FROM funcionario WHERE contacto_funcionario = ? AND id_funcionario != ?";

      conexao.query(
        checkContactoSql,
        [contacto_funcionario.trim(), id],
        (contactoError, contactoResults) => {
          if (contactoError) {
            return conexao.rollback(() => {
              console.error("Erro ao verificar contacto:", contactoError);
              return res.status(500).json({
                success: false,
                error: "Erro ao verificar contacto no banco de dados",
              });
            });
          }

          if (contactoResults.length > 0) {
            return conexao.rollback(() => {
              return res.status(400).json({
                success: false,
                error: "Este contacto já está em uso por outro funcionário",
              });
            });
          }

          const checkBISql =
            "SELECT id_funcionario FROM funcionario WHERE bi_funcionario = ? AND id_funcionario != ?";

          conexao.query(
            checkBISql,
            [bi_funcionario.trim(), id],
            (BIError, BIResults) => {
              if (BIError) {
                return conexao.rollback(() => {
                  console.error("Erro ao verificar BI:", BIError);
                  return res.status(500).json({
                    success: false,
                    error: "Erro ao verificar BI no banco de dados",
                  });
                });
              }

              if (BIResults.length > 0) {
                return conexao.rollback(() => {
                  return res.status(400).json({
                    success: false,
                    error: "Este BI já está em uso por outro funcionário",
                  });
                });
              }

              const updateSql = `
                        UPDATE funcionario 
                        SET nome_funcionario = ?, 
                            contacto_funcionario = ?, 
                            bi_funcionario = ?, 
                            idAdm = ? 
                        WHERE id_funcionario = ? AND estado_funcionario = 'Ativo'
                    `;

              conexao.query(
                updateSql,
                [
                  nome_funcionario.trim(),
                  contacto_funcionario.trim(),
                  bi_funcionario.trim(),
                  idAdm,
                  id,
                ],
                (updateError, updateResults) => {
                  if (updateError) {
                    return conexao.rollback(() => {
                      console.error(
                        "Erro ao atualizar funcionário:",
                        updateError,
                      );
                      return res.status(500).json({
                        success: false,
                        error:
                          "Erro ao atualizar funcionário no banco de dados",
                      });
                    });
                  }

                  const buscarCargoSQL =
                    "SELECT id_cargo FROM cargo_funcionario WHERE cargo = ?";

                  conexao.query(
                    buscarCargoSQL,
                    [cargo_funcionario],
                    (cargoError, cargoResult) => {
                      if (cargoError) {
                        return conexao.rollback(() => {
                          console.error("Erro ao buscar cargo:", cargoError);
                          return res.status(500).json({
                            success: false,
                            error: "Erro ao verificar cargo no banco de dados",
                          });
                        });
                      }

                      if (cargoResult.length === 0) {
                        return conexao.rollback(() => {
                          return res.status(400).json({
                            success: false,
                            error: "Cargo não encontrado",
                          });
                        });
                      }

                      const id_cargo = cargoResult[0].id_cargo;

                      const updateRelacaoSQL = `
                                UPDATE cargo_funcionario_relation 
                                SET id_cargo = ? 
                                WHERE id_funcionario = ?
                            `;

                      conexao.query(
                        updateRelacaoSQL,
                        [id_cargo, id],
                        (relacaoError) => {
                          if (relacaoError) {
                            return conexao.rollback(() => {
                              console.error(
                                "Erro ao atualizar relação cargo:",
                                relacaoError,
                              );
                              return res.status(500).json({
                                success: false,
                                error: "Erro ao atualizar cargo do funcionário",
                              });
                            });
                          }

                          conexao.commit((commitError) => {
                            if (commitError) {
                              return conexao.rollback(() => {
                                console.error(
                                  "Erro ao fazer commit:",
                                  commitError,
                                );
                                return res.status(500).json({
                                  success: false,
                                  error: "Erro ao finalizar transação",
                                });
                              });
                            }

                            res.status(200).json({
                              success: true,
                              message: "Funcionário atualizado com sucesso",
                              dados: {
                                id: id,
                                nome_funcionario: nome_funcionario.trim(),
                                contacto_funcionario:
                                  contacto_funcionario.trim(),
                                bi_funcionario: bi_funcionario.trim(),
                                cargo_funcionario: cargo_funcionario,
                                idAdm: idAdm,
                              },
                            });
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
    });
  });
};

const excluirPermanentementeFuncionario = async (req, res) => {
  const { id } = req.params;


  if (!id || isNaN(id) || id <= 0) {
    return res.status(400).json({ error: "ID do funcionário inválido" });
  }

  const t = await conexao.transaction();

  try {

    const funcionario = await Funcionario.findOne({
      where: {
        id_funcionario: id,
        estado_funcionario: "Desativado",
      },
      transaction: t,
    });

    if (!funcionario) {
      await t.rollback();
      return res.status(400).json({
        error:
          "Funcionário não encontrado ou não está desativado. Apenas funcionários desativados podem ser excluídos permanentemente.",
      });
    }

    const nome = funcionario.nome_funcionario;


    await CargoFuncionarioRelation.destroy({
      where: { id_funcionario: id },
      transaction: t,
    });

    const deleted = await Funcionario.destroy({
      where: {
        id_funcionario: id,
        estado_funcionario: "Desativado",
      },
      transaction: t,
    });

    if (deleted === 0) {
      await t.rollback();
      return res.status(404).json({
        error: "Funcionário não encontrado para exclusão",
      });
    }

  
    await t.commit();

    return res.status(200).json({
      success: true,
      message: `Funcionário ${nome} excluído permanentemente com sucesso`,
      nomeExcluido: nome,
    });

  } catch (error) {
    await t.rollback();
    console.error("Erro ao excluir funcionário:", error);

    return res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
};

module.exports = {
  ativarFuncionario,
  desativarFuncionario,
  alterarSenhaFuncionario,
  actualizardadosFuncionario,
  excluirPermanentementeFuncionario,
};
