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

router.delete('/periodo/desativar/:id', (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE anoletivo SET status = 'Desativado' WHERE id_anoletivo = ?";
    
    conexao.query(sql, [id], (error, result) => {
        if (error) {
            console.error('Erro ao desativar período:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro interno ao desativar o período' 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Período não encontrado' 
            });
        }
        
        return res.status(200).json({ 
            success: true, 
            message: 'Período desativado com sucesso',
            data: {
                id: id,
                status: 'Desativado'
            }
        });
    });
});

router.delete('/removerProfessorTurma/:idDp', async (req, res) => {
    const { idDp } = req.params;

    if (!idDp) {
        return res.status(400).json({
            error: 'ID da associação não informado'
        });
    }

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

        const deleteSql = "DELETE FROM prof_turma_disc WHERE id_dp = ?";

        conexao.query(deleteSql, [idDp], (deleteError, deleteResults) => {
            if (deleteError) {
                console.error("Erro ao remover professor da turma:", deleteError);
                
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

// ==================== NOVAS ROTAS DE EXCLUSÃO ====================

router.delete('/periodo/deletarCompleto/:id_periodo', verificarToken, async (req, res) => {
    const { id_periodo } = req.params;

    try {
        const infoSql = `
            SELECT 
                p.id_periodo,
                p.periodo,
                t.id_turma,
                t.turma,
                c.id_curso,
                c.curso,
                cat.id_categoria,
                cat.categoria,
                ac.id_anocurricular,
                ac.ano AS anocurricular
            FROM periodo p
            INNER JOIN turma t ON p.id_turma = t.id_turma
            INNER JOIN curso c ON t.id_curso = c.id_curso
            INNER JOIN categoria cat ON c.id_categoria = cat.id_categoria
            LEFT JOIN anocurricular ac ON p.id_anocurricular = ac.id_anocurricular
            WHERE p.id_periodo = ?
        `;

        const periodoInfo = await new Promise((resolve, reject) => {
            conexao.query(infoSql, [id_periodo], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        if (periodoInfo.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Turma não encontrada'
            });
        }

        const dados = periodoInfo[0];
        const nomeTurma = dados.turma || 'Turma sem nome';
        const nomeCurso = dados.curso || 'Curso sem nome';

        const profTurmaSql = `
            SELECT id_ptd, id_dp 
            FROM prof_turma_disc 
            WHERE id_periodo = ? AND status = 'Ativo'
        `;

        const profTurma = await new Promise((resolve, reject) => {
            conexao.query(profTurmaSql, [id_periodo], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        if (profTurma.length > 0) {
            await new Promise((resolve, reject) => {
                conexao.query(
                    `UPDATE prof_turma_disc SET status = 'Eliminado' WHERE id_periodo = ?`,
                    [id_periodo],
                    (error) => {
                        if (error) reject(error);
                        else resolve();
                    }
                );
            });
        }

        const anosLetivos = await new Promise((resolve, reject) => {
            conexao.query(
                `SELECT id_anoletivo FROM anoletivo WHERE id_periodo = ?`,
                [id_periodo],
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
        });

        if (anosLetivos.length > 0) {
            await new Promise((resolve, reject) => {
                conexao.query(
                    `DELETE FROM anoletivo WHERE id_periodo = ?`,
                    [id_periodo],
                    (error) => {
                        if (error) reject(error);
                        else resolve();
                    }
                );
            });
        }

        await new Promise((resolve, reject) => {
            conexao.query(
                `DELETE FROM periodo WHERE id_periodo = ?`,
                [id_periodo],
                (error) => {
                    if (error) reject(error);
                    else resolve();
                }
            );
        });

        const turmaPeriodos = await new Promise((resolve, reject) => {
            conexao.query(
                `SELECT id_periodo FROM periodo WHERE id_turma = ? AND status = 'Ativo'`,
                [dados.id_turma],
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
        });

        if (turmaPeriodos.length === 0) {
            await new Promise((resolve, reject) => {
                conexao.query(
                    `DELETE FROM turma WHERE id_turma = ?`,
                    [dados.id_turma],
                    (error) => {
                        if (error) reject(error);
                        else resolve();
                    }
                );
            });
        }

        console.log(`[EXCLUSÃO] Turma ${nomeTurma} (${id_periodo}) deletada por admin`);

        res.status(200).json({
            success: true,
            message: `Turma "${nomeTurma}" do curso "${nomeCurso}" deletada com sucesso`,
            dados: {
                id_periodo: id_periodo,
                id_turma: dados.id_turma,
                turma: nomeTurma,
                curso: nomeCurso,
                periodo: dados.periodo,
                anocurricular: dados.anocurricular,
                professores_removidos: profTurma.length,
                anos_letivos_removidos: anosLetivos.length,
                turma_deletada: turmaPeriodos.length === 0
            }
        });

    } catch (error) {
        console.error('Erro ao deletar turma:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
});

router.delete('/anoletivo/deletar/:id_anoletivo', verificarToken, async (req, res) => {
    const { id_anoletivo } = req.params;

    try {
        const infoSql = `
            SELECT al.*, p.id_periodo, t.turma, c.curso
            FROM anoletivo al
            INNER JOIN periodo p ON al.id_periodo = p.id_periodo
            INNER JOIN turma t ON p.id_turma = t.id_turma
            INNER JOIN curso c ON t.id_curso = c.id_curso
            WHERE al.id_anoletivo = ?
        `;

        const info = await new Promise((resolve, reject) => {
            conexao.query(infoSql, [id_anoletivo], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        if (info.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Ano letivo não encontrado'
            });
        }

        const dados = info[0];

        const profSql = `
            SELECT COUNT(*) as total 
            FROM prof_turma_disc 
            WHERE id_anoletivo = ? AND status = 'Ativo'
        `;

        const profCount = await new Promise((resolve, reject) => {
            conexao.query(profSql, [id_anoletivo], (error, result) => {
                if (error) reject(error);
                else resolve(result[0]?.total || 0);
            });
        });

        let mensagemExtra = '';
        if (profCount > 0) {
            await new Promise((resolve, reject) => {
                conexao.query(
                    `UPDATE prof_turma_disc SET status = 'Eliminado' WHERE id_anoletivo = ?`,
                    [id_anoletivo],
                    (error) => {
                        if (error) reject(error);
                        else resolve();
                    }
                );
            });
            mensagemExtra = ` ${profCount} associação(ões) de professores removida(s).`;
        }

        await new Promise((resolve, reject) => {
            conexao.query(
                `DELETE FROM anoletivo WHERE id_anoletivo = ?`,
                [id_anoletivo],
                (error) => {
                    if (error) reject(error);
                    else resolve();
                }
            );
        });

        res.status(200).json({
            success: true,
            message: `Ano letivo ${dados.ano} da turma ${dados.turma} (${dados.curso}) deletado com sucesso.${mensagemExtra}`,
            dados: {
                id_anoletivo: id_anoletivo,
                ano: dados.ano,
                turma: dados.turma,
                curso: dados.curso,
                professores_removidos: profCount
            }
        });

    } catch (error) {
        console.error('Erro ao deletar ano letivo:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
});

module.exports = router;