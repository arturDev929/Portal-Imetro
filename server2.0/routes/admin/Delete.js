const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const verificarToken = require("../../middlewares/authMiddleware");
const { deletarFotoFuncionario, deletarDocumentoFuncionario } = require("../../utils/upload");

router.delete("/funcionario/:id", verificarToken, async (req, res) => {
    const { id } = req.params;

    try {
        const checkFuncionario = await new Promise((resolve, reject) => {
            conexao.query("SELECT nome, foto FROM funcionario WHERE id_func = ?", [id], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (checkFuncionario.length === 0) return res.status(404).json({ error: "Funcionario nao encontrado" });

        const nome = checkFuncionario[0].nome;
        const foto = checkFuncionario[0].foto;

        const documentos = await new Promise((resolve, reject) => {
            conexao.query("SELECT doc FROM doc_funcionario WHERE id_func = ?", [id], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });

        if (foto) deletarFotoFuncionario(foto);
        for (const doc of documentos) deletarDocumentoFuncionario(doc.doc);

        await new Promise((resolve, reject) => {
            conexao.query("DELETE FROM doc_funcionario WHERE id_func = ?", [id], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });

        await new Promise((resolve, reject) => {
            conexao.query("DELETE FROM funcionario WHERE id_func = ?", [id], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });

        res.status(200).json({ success: true, message: `Funcionario ${nome} excluido com sucesso` });
    } catch (error) {
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

router.delete('/desvincularProfessor/:iddisciplina/:idprofessor', (req, res) => {
    const { iddisciplina, idprofessor } = req.params;
    const sql = "DELETE FROM disc_professor WHERE id_professor = ? AND id_disciplina = ?";
    conexao.query(sql, [idprofessor, iddisciplina], (error, result) => {
        if (error) {
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json({
                message: "Professor desvinculado com sucesso",
                professoresAfetados: result.affectedRows
            });
        }
    });
});

router.delete('/categoriaCurso/:id', (req, res) => {
    const { id } = req.params;
    console.log("Tentando deletar categoria ID:", id);

    const checkSql = 'SELECT * FROM categoria WHERE id_categoria = ?';

    conexao.query(checkSql, [id], (checkError, checkResults) => {
        if (checkError) {
            console.error('Erro ao verificar categoria:', checkError);
            return res.status(500).json({
                success: false,
                error: 'Erro ao verificar categoria no banco de dados'
            });
        }

        if (checkResults.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Categoria não encontrada'
            });
        }

        const categoriaNome = checkResults[0].categoria;

        const checkCursosSql = 'SELECT COUNT(*) as total FROM curso WHERE id_categoria = ?';

        conexao.query(checkCursosSql, [id], (cursosError, cursosResults) => {
            if (cursosError) {
                console.error('Erro ao verificar cursos vinculados:', cursosError);
                return res.status(500).json({
                    success: false,
                    error: 'Erro ao verificar cursos vinculados'
                });
            }

            const cursosVinculados = cursosResults[0]?.total || 0;

            if (cursosVinculados > 0) {
                return res.status(400).json({
                    success: false,
                    error: `Não é possível excluir a categoria "${categoriaNome}" pois possui ${cursosVinculados} curso(s) vinculado(s). Remova os cursos primeiro.`
                });
            }

            // Exclusão física (hard delete)
            const deleteSql = 'DELETE FROM categoria WHERE id_categoria = ?';

            conexao.query(deleteSql, [id], (deleteError, deleteResults) => {
                if (deleteError) {
                    console.error('Erro ao deletar categoria:', deleteError);
                    return res.status(500).json({
                        success: false,
                        error: 'Erro ao excluir categoria do banco de dados'
                    });
                }

                if (deleteResults.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Categoria não encontrada para exclusão'
                    });
                }

                res.status(200).json({
                    success: true,
                    message: `Categoria "${categoriaNome}" excluída com sucesso`,
                    nomeExcluido: categoriaNome,
                    affectedRows: deleteResults.affectedRows
                });
            });
        });
    });
});

router.delete('/curso/:id', (req, res) => {
    const { id } = req.params;
    console.log("Tentando deletar curso ID:", id);

    const checkSql = 'SELECT * FROM curso WHERE id_curso = ?';

    conexao.query(checkSql, [id], (checkError, checkResults) => {
        if (checkError) {
            console.error('Erro ao verificar curso:', checkError);
            return res.status(500).json({
                success: false,
                error: 'Erro ao verificar curso no banco de dados'
            });
        }

        if (checkResults.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Curso não encontrado'
            });
        }

        const cursoNome = checkResults[0].curso;

        const checkSemestresSql = 'SELECT COUNT(*) as total FROM semestre WHERE id_curso = ?';

        conexao.query(checkSemestresSql, [id], (semestresError, semestresResults) => {
            if (semestresError) {
                console.error('Erro ao verificar semestres vinculados:', semestresError);
                return res.status(500).json({
                    success: false,
                    error: 'Erro ao verificar semestres vinculados'
                });
            }

            const semestresVinculados = semestresResults[0]?.total || 0;

            if (semestresVinculados > 0) {
                return res.status(400).json({
                    success: false,
                    error: `Não é possível excluir o curso "${cursoNome}" pois possui ${semestresVinculados} disciplina(s) vinculada(s).`
                });
            }

            const checkAnosSql = 'SELECT COUNT(*) as total FROM anocurricular WHERE id_curso = ?';

            conexao.query(checkAnosSql, [id], (anosError, anosResults) => {
                if (anosError) {
                    console.error('Erro ao verificar anos curriculares vinculados:', anosError);
                    return res.status(500).json({
                        success: false,
                        error: 'Erro ao verificar anos curriculares vinculados'
                    });
                }

                const anosVinculados = anosResults[0]?.total || 0;

                if (anosVinculados > 0) {
                    return res.status(400).json({
                        success: false,
                        error: `Não é possível excluir o curso "${cursoNome}" pois possui ${anosVinculados} ano(s) curricular(es) vinculado(s).`
                    });
                }

                const deleteSql = 'DELETE FROM curso WHERE id_curso = ?';

                conexao.query(deleteSql, [id], (deleteError, deleteResults) => {
                    if (deleteError) {
                        console.error('Erro ao deletar curso:', deleteError);
                        return res.status(500).json({
                            success: false,
                            error: 'Erro ao excluir curso do banco de dados'
                        });
                    }

                    if (deleteResults.affectedRows === 0) {
                        return res.status(404).json({
                            success: false,
                            error: 'Curso não encontrado para exclusão'
                        });
                    }

                    res.status(200).json({
                        success: true,
                        message: `Curso "${cursoNome}" excluído com sucesso`,
                        nomeExcluido: cursoNome,
                        affectedRows: deleteResults.affectedRows
                    });
                });
            });
        });
    });
});

router.delete('/disciplinaSemestre/:idsemestre', (req, res) => {
    const { idsemestre } = req.params;

    const sql = "DELETE FROM semestre WHERE id_semestre = ?";

    conexao.query(sql, [idsemestre], (error, result) => {
        if (error) {
            console.error("Erro ao excluir disciplina do semestre:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            if (result.affectedRows === 0) {
                res.status(404).json({ error: "Disciplina não encontrada no semestre" });
            } else {
                res.status(200).json({
                    message: "Disciplina removida do semestre com sucesso",
                    affectedRows: result.affectedRows
                });
            }
        }
    });
});

router.delete('/anocurricular/:id', (req, res) => {
    const { id } = req.params;
    console.log("Tentando deletar ano curricular ID:", id);

    const checkSql = 'SELECT a.*, c.curso FROM anocurricular a JOIN curso c ON a.id_curso = c.id_curso WHERE a.id_anocurricular = ?';

    conexao.query(checkSql, [id], (checkError, checkResults) => {
        if (checkError) {
            console.error('Erro ao verificar ano curricular:', checkError);
            return res.status(500).json({
                success: false,
                error: 'Erro ao verificar ano curricular no banco de dados'
            });
        }

        if (checkResults.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Ano curricular não encontrado'
            });
        }

        const anoCurricular = checkResults[0].anocurricular;
        const cursoNome = checkResults[0].curso;

        const checkSemestresSql = 'SELECT COUNT(*) as total FROM semestre WHERE id_anocurricular = ?';

        conexao.query(checkSemestresSql, [id], (semestresError, semestresResults) => {
            if (semestresError) {
                console.error('Erro ao verificar semestres vinculados:', semestresError);
                return res.status(500).json({
                    success: false,
                    error: 'Erro ao verificar semestres vinculados'
                });
            }

            const semestresVinculados = semestresResults[0]?.total || 0;

            if (semestresVinculados > 0) {
                return res.status(400).json({
                    success: false,
                    error: `Não é possível excluir o ano curricular "${anoCurricular}" pois possui ${semestresVinculados} semestre(s) vinculado(s).`
                });
            }

            const deleteSql = 'DELETE FROM anocurricular WHERE id_anocurricular = ?';

            conexao.query(deleteSql, [id], (deleteError, deleteResults) => {
                if (deleteError) {
                    console.error('Erro ao deletar ano curricular:', deleteError);
                    return res.status(500).json({
                        success: false,
                        error: 'Erro ao excluir ano curricular do banco de dados'
                    });
                }

                if (deleteResults.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Ano curricular não encontrado para exclusão'
                    });
                }

                res.status(200).json({
                    success: true,
                    message: `Ano curricular "${anoCurricular}" do curso "${cursoNome}" excluído com sucesso`,
                    anoExcluido: anoCurricular,
                    curso: cursoNome,
                    affectedRows: deleteResults.affectedRows
                });
            });
        });
    });
});

router.delete('/disciplina/:id', (req, res) => {
    const { id } = req.params;

    const checkSql = "SELECT disciplina FROM disciplina WHERE id_disciplina = ?";
    
    conexao.query(checkSql, [id], (checkError, checkResults) => {
        if (checkError) {
            console.error("Erro ao verificar disciplina:", checkError);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: checkError.message
            });
        }

        if (checkResults.length === 0) {
            return res.status(404).json({
                error: "Disciplina não encontrada"
            });
        }

        const nomeDisciplina = checkResults[0].disciplina;

        const checkVinculosSql = `
            SELECT 
                COUNT(*) as total,
                GROUP_CONCAT(p.nome SEPARATOR ', ') as professores
            FROM disc_professor dp
            INNER JOIN professor p ON dp.id_professor = p.id_professor
            WHERE dp.id_disciplina = ?
        `;

        conexao.query(checkVinculosSql, [id], (vinculoError, vinculoResults) => {
            if (vinculoError) {
                console.error("Erro ao verificar vínculos:", vinculoError);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: vinculoError.message
                });
            }

            const totalVinculos = vinculoResults[0]?.total || 0;

            if (totalVinculos > 0) {
                const professores = vinculoResults[0]?.professores || '';
                
                return res.status(400).json({
                    success: false,
                    error: "Não é possível excluir esta disciplina",
                    mensagem: `A disciplina "${nomeDisciplina}" está vinculada a ${totalVinculos} professor(es): ${professores}. Remova os vínculos primeiro.`,
                    professoresVinculados: professores,
                    totalProfessores: totalVinculos
                });
            }

            const checkSemestresSql = "SELECT COUNT(*) as total FROM semestre WHERE id_disciplina = ?";

            conexao.query(checkSemestresSql, [id], (semestreError, semestreResults) => {
                if (semestreError) {
                    console.error("Erro ao verificar semestres:", semestreError);
                    return res.status(500).json({
                        error: "Erro interno do servidor",
                        details: semestreError.message
                    });
                }

                const totalSemestres = semestreResults[0]?.total || 0;

                if (totalSemestres > 0) {
                    return res.status(400).json({
                        success: false,
                        error: "Não é possível excluir esta disciplina",
                        mensagem: `A disciplina "${nomeDisciplina}" está vinculada a ${totalSemestres} semestre(s). Remova os semestres primeiro.`,
                        totalSemestres: totalSemestres
                    });
                }

                const sqlDisciplina = "DELETE FROM disciplina WHERE id_disciplina = ?";

                conexao.query(sqlDisciplina, [id], (errorDisciplina, resultDisciplina) => {
                    if (errorDisciplina) {
                        console.error("Erro ao excluir disciplina:", errorDisciplina);
                        return res.status(500).json({
                            error: "Erro interno do servidor",
                            details: errorDisciplina.message
                        });
                    }

                    if (resultDisciplina.affectedRows === 0) {
                        return res.status(404).json({
                            error: "Disciplina não encontrada"
                        });
                    }

                    res.status(200).json({
                        success: true,
                        message: `Disciplina "${nomeDisciplina}" excluída com sucesso`,
                        nomeExcluido: nomeDisciplina
                    });
                });
            });
        });
    });
});

router.delete('/desvincularProfessor/:iddisciplina/:idprofessor', (req, res) => {
    const { iddisciplina, idprofessor } = req.params;
    const sql = "DELETE FROM disc_professor WHERE id_professor = ? AND id_disciplina = ?";
    conexao.query(sql, [idprofessor, iddisciplina], (error, result) => {
        if (error) {
            console.error("Erro ao desvincular professor:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json({
                message: "Professor desvinculado com sucesso",
                professoresAfetados: result.affectedRows
            });
        }
    });
});

router.delete('/periodo/:id', (req, res) => {
    const { id } = req.params;
    console.log("ID do período a excluir:", id);
    
    // 1. Verificar se o período existe
    const verificarExistenciaSQL = "SELECT id_periodo, id_turma, periodo, status FROM periodo WHERE id_periodo = ?";
    
    conexao.query(verificarExistenciaSQL, [id], (erroExistencia, resultados) => {
        if (erroExistencia) {
            console.error("Erro ao verificar existência do período:", erroExistencia);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno ao verificar período",
                detalhes: erroExistencia.message
            });
        }
        
        if (resultados.length === 0) {
            return res.status(404).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Período não encontrado",
                mensagem: "O período que você está tentando excluir não existe"
            });
        }
        
        const periodoInfo = resultados[0];
        
        // 2. Verificar se existem registros dependentes em anoletivo
        const verificarAnoLetivoSQL = "SELECT id_anoletivo, ano FROM anoletivo WHERE id_periodo = ? AND status = 'Ativo'";
        
        conexao.query(verificarAnoLetivoSQL, [id], (erroAnoLetivo, resultadosAnoLetivo) => {
            if (erroAnoLetivo) {
                console.error("Erro ao verificar ano letivo:", erroAnoLetivo);
                return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro no servidor",
                    mensagem: "Erro interno ao verificar dependências",
                    detalhes: erroAnoLetivo.message
                });
            }
            
            // 3. Verificar se existem registros dependentes em prof_turma_disc
            const verificarProfTurmaDiscSQL = "SELECT id_ptd FROM prof_turma_disc WHERE id_periodo = ? AND status = 'Ativo'";
            
            conexao.query(verificarProfTurmaDiscSQL, [id], (erroProfTurma, resultadosProfTurma) => {
                if (erroProfTurma) {
                    console.error("Erro ao verificar prof_turma_disc:", erroProfTurma);
                    return res.status(500).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Erro no servidor",
                        mensagem: "Erro interno ao verificar dependências",
                        detalhes: erroProfTurma.message
                    });
                }
                
                // 4. Se existem dependências, oferecer opções
                if (resultadosAnoLetivo.length > 0 || resultadosProfTurma.length > 0) {
                    const dependencias = [];
                    
                    if (resultadosAnoLetivo.length > 0) {
                        dependencias.push({
                            tabela: "anoletivo",
                            registros: resultadosAnoLetivo.map(a => ({
                                id: a.id_anoletivo,
                                ano: a.ano
                            }))
                        });
                    }
                    
                    if (resultadosProfTurma.length > 0) {
                        dependencias.push({
                            tabela: "prof_turma_disc",
                            quantidade: resultadosProfTurma.length
                        });
                    }
                    
                    return res.status(400).json({
                        sucesso: false,
                        tipo: "aviso",
                        titulo: "Período possui dependências",
                        mensagem: "Este período possui registros associados que precisam ser removidos ou desativados primeiro",
                        dependencias: dependencias,
                        sugestoes: [
                            "Desative o período em vez de excluí-lo",
                            "Remova ou desative os registros dependentes primeiro"
                        ]
                    });
                }
                
                // 5. Desativar registros relacionados (soft delete)
                // 5a. Desativar anoletivo relacionado (se houver)
                if (resultadosAnoLetivo.length > 0) {
                    const desativarAnoLetivoSQL = "UPDATE anoletivo SET status = 'Desativado', data_atualizacao = CURDATE() WHERE id_periodo = ?";
                    
                    conexao.query(desativarAnoLetivoSQL, [id], (erroDesativarAno) => {
                        if (erroDesativarAno) {
                            console.error("Erro ao desativar ano letivo:", erroDesativarAno);
                            // Continua mesmo com erro
                        }
                    });
                }
                
                // 5b. Desativar prof_turma_disc relacionado (se houver)
                if (resultadosProfTurma.length > 0) {
                    const desativarProfTurmaSQL = "UPDATE prof_turma_disc SET status = 'Eliminado', data_actualizacao = CURDATE() WHERE id_periodo = ?";
                    
                    conexao.query(desativarProfTurmaSQL, [id], (erroDesativarProf) => {
                        if (erroDesativarProf) {
                            console.error("Erro ao desativar prof_turma_disc:", erroDesativarProf);
                            // Continua mesmo com erro
                        }
                    });
                }
                
                // 6. Excluir o período (hard delete) ou desativar (soft delete)
                // Opção 1: Hard Delete (exclusão física)
                const deleteSQL = "DELETE FROM periodo WHERE id_periodo = ?";
                
                conexao.query(deleteSQL, [id], (erroDelete, resultado) => {
                    if (erroDelete) {
                        console.error("Erro ao excluir período:", erroDelete);
                        
                        // Verificar se é erro de chave estrangeira
                        if (erroDelete.code === 'ER_ROW_IS_REFERENCED_2') {
                            return res.status(400).json({
                                sucesso: false,
                                tipo: "erro",
                                titulo: "Não é possível excluir",
                                mensagem: "Este período possui registros dependentes. Por favor, remova-os primeiro ou desative o período.",
                                detalhes: erroDelete.message
                            });
                        }
                        
                        return res.status(500).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Erro no servidor",
                            mensagem: "Erro interno ao excluir período",
                            detalhes: erroDelete.message
                        });
                    }
                    
                    // 7. Verificar se a turma ficou sem períodos e desativar se necessário
                    if (periodoInfo.id_turma) {
                        const verificarOutrosPeriodosSQL = "SELECT id_periodo FROM periodo WHERE id_turma = ? AND status = 'Ativo'";
                        
                        conexao.query(verificarOutrosPeriodosSQL, [periodoInfo.id_turma], (erroOutros, resultadosOutros) => {
                            if (erroOutros) {
                                console.error("Erro ao verificar outros períodos:", erroOutros);
                            } else if (resultadosOutros.length === 0) {
                                // Desativar a turma se não tiver mais períodos ativos
                                const desativarTurmaSQL = "UPDATE turma SET status = 'Desativado', data_atualizacao = CURDATE() WHERE id_turma = ?";
                                
                                conexao.query(desativarTurmaSQL, [periodoInfo.id_turma], (erroDesativarTurma) => {
                                    if (erroDesativarTurma) {
                                        console.error("Erro ao desativar turma:", erroDesativarTurma);
                                    } else {
                                        console.log(`Turma ${periodoInfo.id_turma} desativada por não ter mais períodos`);
                                    }
                                });
                            }
                        });
                    }
                    
                    // 8. Resposta de sucesso
                    return res.status(200).json({
                        sucesso: true,
                        tipo: "sucesso",
                        titulo: "Período Excluído",
                        mensagem: `Período "${periodoInfo.periodo}" excluído com sucesso!`,
                        dados: {
                            id_periodo: id,
                            periodo: periodoInfo.periodo,
                            id_turma: periodoInfo.id_turma,
                            affectedRows: resultado.affectedRows
                        }
                    });
                });
            });
        });
    });
});

// Rota para remover professor da turma
router.delete('/removerProfessorTurma/:idDp', async (req, res) => {
    const { idDp } = req.params;

    if (!idDp) {
        return res.status(400).json({
            error: 'ID da associação não informado'
        });
    }

    // Primeiro, verificar se a associação existe
    const checkSql = `
        SELECT 
            dp.id_dp,
            p.nome AS nome_professor,
            d.disciplina AS nome_disciplina,
            ptd.id_ptd
        FROM disc_professor dp
        INNER JOIN professor p ON dp.id_professor = p.id_professor
        INNER JOIN disciplina d ON dp.id_disciplina = d.id_disciplina
        INNER JOIN prof_turma_disc ptd ON ptd.id_dp = dp.id_dp
        WHERE dp.id_dp = ? AND dp.status = 'Ativo'
    `;

    conexao.query(checkSql, [idDp], (checkError, checkResults) => {
        if (checkError) {
            console.error("Erro ao verificar associação:", checkError);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: checkError.message
            });
        }

        if (checkResults.length === 0) {
            return res.status(404).json({
                error: "Associação não encontrada",
                message: "Este professor já pode ter sido removido da turma"
            });
        }

        const assoc = checkResults[0];

        // Remover da tabela prof_turma_disc (soft delete ou hard delete)
        const deleteSql = "DELETE FROM prof_turma_disc WHERE id_dp = ?";

        conexao.query(deleteSql, [idDp], (deleteError, deleteResults) => {
            if (deleteError) {
                console.error("Erro ao remover professor da turma:", deleteError);
                
                // Se for erro de chave estrangeira, tentar soft delete
                if (deleteError.code === 'ER_ROW_IS_REFERENCED_2') {
                    const updateSql = "UPDATE prof_turma_disc SET status = 'Eliminado' WHERE id_dp = ?";
                    
                    conexao.query(updateSql, [idDp], (updateError, updateResults) => {
                        if (updateError) {
                            console.error("Erro ao desativar associação:", updateError);
                            return res.status(500).json({
                                error: "Erro interno do servidor",
                                details: updateError.message
                            });
                        }

                        return res.status(200).json({
                            success: true,
                            message: `Professor "${assoc.nome_professor}" removido da disciplina "${assoc.nome_disciplina}" com sucesso (desativado)`,
                            dados: {
                                id_dp: idDp,
                                professor: assoc.nome_professor,
                                disciplina: assoc.nome_disciplina,
                                status: 'Desativado'
                            }
                        });
                    });
                } else {
                    return res.status(500).json({
                        error: "Erro interno do servidor",
                        details: deleteError.message
                    });
                }
            } else {
                return res.status(200).json({
                    success: true,
                    message: `Professor "${assoc.nome_professor}" removido da disciplina "${assoc.nome_disciplina}" com sucesso`,
                    dados: {
                        id_dp: idDp,
                        professor: assoc.nome_professor,
                        disciplina: assoc.nome_disciplina,
                        affectedRows: deleteResults.affectedRows
                    }
                });
            }
        });
    });
});

module.exports = router;