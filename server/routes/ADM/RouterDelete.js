const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");

router.delete('/categoriaCurso/:id', (req, res) => {
    const { id } = req.params;
    console.log("Tentando deletar categoria ID:", id);

    if (!id || id.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'ID da categoria é obrigatório'
        });
    }

    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
            success: false,
            error: 'ID da categoria inválido'
        });
    }

    const checkSql = 'SELECT * FROM categoriacurso WHERE idcategoriacurso = ?';

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

        const categoriaNome = checkResults[0].categoriacurso;

        const checkCursosSql = 'SELECT COUNT(*) as total FROM curso WHERE idcategoriacurso = ?';

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
                    error: `Não é possível excluir a categoria: A categoria "${categoriaNome}" possui ${cursosVinculados} curso(s) vinculado(s). Remova os cursos primeiro.`,
                });
            }

            const deleteSql = 'DELETE FROM categoriacurso WHERE idcategoriacurso = ?';

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

    if (!id || id.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'ID do curso é obrigatório'
        });
    }

    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
            success: false,
            error: 'ID do curso inválido'
        });
    }

    const checkSql = 'SELECT * FROM curso WHERE idcurso = ?';

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

        const checkSemestresSql = 'SELECT COUNT(*) as total FROM semestre WHERE idcurso = ?';

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

            const checkAnosSql = 'SELECT COUNT(*) as total FROM anocurricular WHERE idcurso = ?';

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

                const deleteSql = 'DELETE FROM curso WHERE idcurso = ?';

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

router.delete('/anocurricular/:id', (req, res) => {
    const { id } = req.params;
    console.log("Tentando deletar ano curricular ID:", id);

    if (!id || id.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'ID do ano curricular é obrigatório'
        });
    }

    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
            success: false,
            error: 'ID do ano curricular inválido'
        });
    }

    const checkSql = 'SELECT a.*, c.curso FROM anocurricular a JOIN curso c ON a.idcurso = c.idcurso WHERE a.idanocurricular = ?';

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

        const checkSemestresSql = 'SELECT COUNT(*) as total FROM semestre WHERE idanocurricular = ?';

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

            const deleteSql = 'DELETE FROM anocurricular WHERE idanocurricular = ?';

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

router.delete('/disciplinaSemestre/:idsemestre', (req, res) => {
    const { idsemestre } = req.params;

    const sql = "DELETE FROM semestre WHERE idsemestre = ?";

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

router.delete('/disciplina/:id', (req, res) => {
    const { id } = req.params;

    const sqlSemestre = "DELETE FROM semestre WHERE iddisciplina = ?";

    conexao.query(sqlSemestre, [id], (error, result) => {
        if (error) {
            console.error("Erro ao excluir semestres relacionados:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        }

        console.log(`Semestres deletados: ${result.affectedRows}`);

        const sqlDisciplina = "DELETE FROM disciplina WHERE iddisciplina = ?";
        conexao.query(sqlDisciplina, [id], (error, result) => {
            if (error) {
                console.error("Erro ao excluir a disciplina:", error);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: error.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: "Disciplina não encontrada"
                });
            }

            res.status(200).json({
                message: "Disciplina deletada com Sucesso",
                disciplinaAfetada: result.affectedRows
            });
        });
    });
});

router.delete('/desvincularProfessor/:iddisciplina/:idprofessor', (req, res) => {
    const { iddisciplina, idprofessor } = req.params;
    const sql = "DELETE FROM disc_prof WHERE idprofessor = ? AND iddisciplina = ?";
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

router.delete('/turma/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM periodo WHERE idperiodo = ?";
    conexao.query(sql, [id], (error, result) => {
        if (error) {
            console.error("Erro ao excluir turma:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json({
                message: "Turma excluída com sucesso",
                affectedRows: result.affectedRows
            });
        }
    });
});

router.delete('/funcionario/permanent/:id', (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "ID do funcionário inválido" });
    }

    const checkSql = "SELECT nome_funcionario FROM funcionario WHERE id_funcionario = ? AND estado_funcionario = 'Desativado'";

    conexao.query(checkSql, [id], (checkError, checkResults) => {
        if (checkError) {
            console.error("Erro ao verificar funcionário:", checkError);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: checkError.message
            });
        }

        if (checkResults.length === 0) {
            return res.status(400).json({
                error: "Funcionário não encontrado ou não está desativado. Apenas funcionários desativados podem ser excluídos permanentemente."
            });
        }

        const nome = checkResults[0].nome_funcionario;

        const deleteRelacaoSql = "DELETE FROM cargo_funcionario_relation WHERE id_funcionario = ?";
        conexao.query(deleteRelacaoSql, [id], (deleteRelacaoError) => {
            if (deleteRelacaoError) {
                console.error("Erro ao excluir relação do funcionário:", deleteRelacaoError);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: deleteRelacaoError.message
                });
            }

            const deleteSql = "DELETE FROM funcionario WHERE id_funcionario = ? AND estado_funcionario = 'Desativado'";

            conexao.query(deleteSql, [id], (deleteError, deleteResults) => {
                if (deleteError) {
                    console.error("Erro ao excluir funcionário permanentemente:", deleteError);
                    return res.status(500).json({
                        error: "Erro interno do servidor",
                        details: deleteError.message
                    });
                }

                if (deleteResults.affectedRows === 0) {
                    return res.status(404).json({
                        error: "Funcionário não encontrado para exclusão"
                    });
                }

                res.status(200).json({
                    success: true,
                    message: `Funcionário ${nome} excluído permanentemente com sucesso`,
                    nomeExcluido: nome,
                    affectedRows: deleteResults.affectedRows
                });
            });
        });
    });
});

module.exports = router;

/**
 * @swagger
 * /categoriaCurso/{id}:
 *   delete:
 *     summary: Excluir uma categoria de curso
 *     tags: [Cursos - Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID da categoria de curso
 *     responses:
 *       200:
 *         description: Categoria excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Categoria 'Tecnologia' excluída com sucesso"
 *                 nomeExcluido:
 *                   type: string
 *                 affectedRows:
 *                   type: integer
 *       400:
 *         description: ID inválido ou categoria possui cursos vinculados
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /curso/{id}:
 *   delete:
 *     summary: Excluir um curso
 *     tags: [Cursos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID do curso
 *     responses:
 *       200:
 *         description: Curso excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 nomeExcluido:
 *                   type: string
 *                 affectedRows:
 *                   type: integer
 *       400:
 *         description: ID inválido ou curso possui semestres/anos vinculados
 *       404:
 *         description: Curso não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /anocurricular/{id}:
 *   delete:
 *     summary: Excluir um ano curricular
 *     tags: [Cursos - Ano Curricular]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID do ano curricular
 *     responses:
 *       200:
 *         description: Ano curricular excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 anoExcluido:
 *                   type: string
 *                 curso:
 *                   type: string
 *                 affectedRows:
 *                   type: integer
 *       400:
 *         description: ID inválido ou ano possui semestres vinculados
 *       404:
 *         description: Ano curricular não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /disciplinaSemestre/{idsemestre}:
 *   delete:
 *     summary: Excluir uma disciplina do semestre
 *     tags: [Disciplinas]
 *     parameters:
 *       - in: path
 *         name: idsemestre
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do semestre
 *     responses:
 *       200:
 *         description: Disciplina removida do semestre com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 affectedRows:
 *                   type: integer
 *       404:
 *         description: Disciplina não encontrada no semestre
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /disciplina/{id}:
 *   delete:
 *     summary: Excluir uma disciplina permanentemente
 *     tags: [Disciplinas]
 *     description: Remove a disciplina e todos os semestres relacionados
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da disciplina
 *     responses:
 *       200:
 *         description: Disciplina deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 disciplinaAfetada:
 *                   type: integer
 *       404:
 *         description: Disciplina não encontrada
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /desvincularProfessor/{iddisciplina}/{idprofessor}:
 *   delete:
 *     summary: Desvincular um professor de uma disciplina
 *     tags: [Professor - Disciplina]
 *     parameters:
 *       - in: path
 *         name: iddisciplina
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da disciplina
 *       - in: path
 *         name: idprofessor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do professor
 *     responses:
 *       200:
 *         description: Professor desvinculado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 professoresAfetados:
 *                   type: integer
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /turma/{id}:
 *   delete:
 *     summary: Excluir uma turma (período)
 *     tags: [Turmas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do período/turma
 *     responses:
 *       200:
 *         description: Turma excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 affectedRows:
 *                   type: integer
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /funcionario/permanent/{id}:
 *   delete:
 *     summary: Excluir permanentemente um funcionário desativado
 *     tags: [Funcionários]
 *     description: Apenas funcionários com status "Desativado" podem ser excluídos permanentemente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID do funcionário
 *     responses:
 *       200:
 *         description: Funcionário excluído permanentemente com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 nomeExcluido:
 *                   type: string
 *                 affectedRows:
 *                   type: integer
 *       400:
 *         description: ID inválido ou funcionário não está desativado
 *       404:
 *         description: Funcionário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */