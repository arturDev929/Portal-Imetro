const { Router } = require("express");
const router = Router();
const conexao = require("../infra/conexao");

router.delete('/categoriaCurso/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log("Tentando deletar categoria ID:", id);

        // Validação do ID
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

        // Verificar se a categoria existe
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
                        // message: `A categoria "${categoriaNome}" possui ${cursosVinculados} curso(s) vinculado(s). Remova os cursos primeiro.`
                    });
                }

                // Deletar categoria
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
                        // id: id,
                        nomeExcluido: categoriaNome,
                        affectedRows: deleteResults.affectedRows
                    });
                });
            });
        });

    } catch (error) {
        console.error('Erro na rota DELETE:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
});

router.delete('/curso/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log("Tentando deletar curso ID:", id);

        // Validação do ID
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

        // Verificar se o curso existe
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
            const checkAnosSql = 'SELECT COUNT(*) as total FROM anocurricular WHERE idcurso = ?';
            
            // Primeiro verificar semestres vinculados
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
                        error: `Não é possível excluir o curso "${cursoNome}" pois possui ${semestresVinculados} disciplinas(s) vinculado(s) .`
                    });
                }

                // Se não houver semestres, verificar anos curriculares
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

                    // Se não houver vínculos, deletar o curso
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

    } catch (error) {
        console.error('Erro na rota DELETE:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
});

router.delete('/anocurricular/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log("Tentando deletar ano curricular ID:", id);

        // Validação do ID
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

        // Verificar se o ano curricular existe
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

            // Verificar se há semestres vinculados a este ano curricular
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

                // Se não houver vínculos, deletar o ano curricular
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

    } catch (error) {
        console.error('Erro na rota DELETE:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
});

router.delete('/disciplinaSemestre/:idsemestre', (req, res) => {
    const { idsemestre } = req.params;
    
    const sql = "DELETE FROM semestre WHERE idsemestre = ?";
    
    conexao.query(sql, [idsemestre], (error, result) => {
        if(error){
            console.error("Erro ao excluir disciplina do semestre:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        } else {
            if(result.affectedRows === 0){
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

router.delete('/disciplina/:id', async (req,res)=>{
    const {id} = req.params;
    
    try {
        // Primeiro deleta os registros relacionados na tabela semestre
        const sqlSemestre = "DELETE FROM semestre WHERE iddisciplina = ?";
        
        conexao.query(sqlSemestre, [id], (error, result) => {
            if(error){
                console.error("Erro ao excluir semestres relacionados:", error);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: error.message
                });
            }
            
            console.log(`Semestres deletados: ${result.affectedRows}`);
            
            // Depois deleta a disciplina
            const sqlDisciplina = "DELETE FROM disciplina WHERE iddisciplina = ?";
            conexao.query(sqlDisciplina, [id], (error, result) => {
                if(error){
                    console.error("Erro ao excluir a disciplina:", error);
                    return res.status(500).json({
                        error: "Erro interno do servidor",
                        details: error.message
                    });
                }
                
                if(result.affectedRows === 0){
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
        
    } catch (error) {
        console.error("Erro geral:", error);
        res.status(500).json({
            error: "Erro interno do servidor",
            details: error.message
        });
    }
});

router.delete('/desvincularProfessor/:idprofessor', (req, res) => {
    const { idprofessor } = req.params;
    const sql = "DELETE FROM disc_prof WHERE idprofessor = ?";
    conexao.query(sql, [idprofessor], (error, result) => {
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

router.delete('/desvincularProfessorDisciplina/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM disc_prof WHERE iddisciplina = ?";
    conexao.query(sql, [id], (error, result) => {
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



module.exports = router;
