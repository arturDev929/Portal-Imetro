const { Router } = require("express");
const router = Router();
const conexao = require("../infra/conexao");

router.put('/categoriaCurso/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { categoriacurso } = req.body;

        console.log("ID recebido:", id);
        console.log("Dados recebidos:", { categoriacurso });

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

        // Validação do nome
        if (!categoriacurso || categoriacurso.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'O nome da categoria é obrigatório'
            });
        }

        if (categoriacurso.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: 'O nome da categoria deve ter pelo menos 2 caracteres'
            });
        }

        if (categoriacurso.trim().length > 100) {
            return res.status(400).json({
                success: false,
                error: 'O nome da categoria não pode exceder 100 caracteres'
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

            // Verificar se já existe outra categoria com o mesmo nome (exceto a atual)
            const duplicateSql = 'SELECT * FROM categoriacurso WHERE categoriacurso = ? AND idcategoriacurso != ?';
            
            conexao.query(duplicateSql, [categoriacurso.trim(), id], (duplicateError, duplicateResults) => {
                if (duplicateError) {
                    console.error('Erro ao verificar duplicidade:', duplicateError);
                    return res.status(500).json({
                        success: false,
                        error: 'Erro ao verificar se categoria já existe'
                    });
                }

                if (duplicateResults.length > 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Já existe uma categoria com este nome'
                    });
                }

                // Atualizar categoria
                const updateSql = 'UPDATE categoriacurso SET categoriacurso = ? WHERE idcategoriacurso = ?';
                const values = [categoriacurso.trim(), id];
                
                conexao.query(updateSql, values, (error, results) => {
                    if (error) {
                        console.error('Erro ao atualizar categoria:', error);
                        return res.status(500).json({ 
                            success: false,
                            error: 'Erro ao atualizar categoria no banco de dados'
                        });
                    }
                    
                    // Verificar se algo foi atualizado
                    if (results.affectedRows === 0) {
                        return res.status(404).json({
                            success: false,
                            error: 'Categoria não encontrada para atualização'
                        });
                    }
                    
                    res.status(200).json({
                        success: true,
                        message: 'Categoria atualizada com sucesso',
                        id: id,
                        categoriacurso: categoriacurso.trim(),
                        affectedRows: results.affectedRows
                    });
                });
            });
        });
    } catch (error) {
        console.error('Erro na rota PUT:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: error.message 
        });
    }
});
router.put('/Curso/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { curso, idcategoriacurso } = req.body;

        console.log("ID do curso recebido:", id);
        console.log("Dados recebidos:", { curso, idcategoriacurso });

        // Validação do ID do curso
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

        // Validação do nome do curso
        if (!curso || curso.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'O nome do curso é obrigatório'
            });
        }

        if (curso.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: 'O nome do curso deve ter pelo menos 2 caracteres'
            });
        }

        if (curso.trim().length > 100) {
            return res.status(400).json({
                success: false,
                error: 'O nome do curso não pode exceder 100 caracteres'
            });
        }

        // Validação do ID da categoria
        if (!idcategoriacurso || idcategoriacurso.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'O departamento é obrigatório'
            });
        }

        if (isNaN(idcategoriacurso) || parseInt(idcategoriacurso) <= 0) {
            return res.status(400).json({
                success: false,
                error: 'ID do departamento inválido'
            });
        }

        // Verificar se o CURSO existe
        const checkCursoSql = 'SELECT * FROM curso WHERE idcurso = ?';
        conexao.query(checkCursoSql, [id], (checkError, checkResults) => {
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

            // Verificar se o DEPARTAMENTO existe
            const checkCategoriaSql = 'SELECT categoriacurso FROM categoriacurso WHERE idcategoriacurso = ?';
            conexao.query(checkCategoriaSql, [idcategoriacurso], (catError, catResults) => {
                if (catError) {
                    console.error('Erro ao verificar departamento:', catError);
                    return res.status(500).json({
                        success: false,
                        error: 'Erro ao verificar departamento no banco de dados'
                    });
                }

                if (catResults.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Departamento não encontrado'
                    });
                }

                // Verificar se já existe outro curso com o mesmo nome (exceto o atual)
                const duplicateSql = 'SELECT * FROM curso WHERE curso = ? AND idcurso != ?';
                conexao.query(duplicateSql, [curso.trim(), id], (duplicateError, duplicateResults) => {
                    if (duplicateError) {
                        console.error('Erro ao verificar duplicidade:', duplicateError);
                        return res.status(500).json({
                            success: false,
                            error: 'Erro ao verificar se curso já existe'
                        });
                    }

                    if (duplicateResults.length > 0) {
                        return res.status(400).json({
                            success: false,
                            error: 'Já existe um curso com este nome'
                        });
                    }

                    // Atualizar CURSO (nome + departamento)
                    const updateSql = 'UPDATE curso SET curso = ?, idcategoriacurso = ? WHERE idcurso = ?';
                    const values = [curso.trim(), idcategoriacurso, id];
                    
                    conexao.query(updateSql, values, (error, results) => {
                        if (error) {
                            console.error('Erro ao atualizar curso:', error);
                            return res.status(500).json({ 
                                success: false,
                                error: 'Erro ao atualizar curso no banco de dados'
                            });
                        }
                        
                        // Verificar se algo foi atualizado
                        if (results.affectedRows === 0) {
                            return res.status(404).json({
                                success: false,
                                error: 'Curso não encontrado para atualização'
                            });
                        }
                        
                        res.status(200).json({
                            success: true,
                            message: 'Curso atualizado com sucesso',
                            id: id,
                            curso: curso.trim(),
                            idcategoriacurso: idcategoriacurso,
                            affectedRows: results.affectedRows
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error('Erro na rota PUT /Curso:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: error.message 
        });
    }
});
// PUT atualizar disciplina
router.put('/disciplina/:id', (req, res) => {
    const { id } = req.params;
    const { disciplina } = req.body;
    
    // Validações
    if (!id || isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "ID da disciplina inválido" });
    }
    
    if (!disciplina || !disciplina.trim()) {
        return res.status(400).json({ error: "Nome da disciplina é obrigatório" });
    }
    
    // Verificar se disciplina existe
    const checkSql = "SELECT * FROM disciplina WHERE iddisciplina = ?";
    conexao.query(checkSql, [id], (checkError, checkResults) => {
        if(checkError){
            console.error("Erro ao verificar disciplina:", checkError);
            return res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: checkError.message 
            });
        }
        
        if(checkResults.length === 0){
            return res.status(404).json({ error: "Disciplina não encontrada" });
        }
        
        const disciplinaAtual = checkResults[0];
        
        // Verificar se novo nome já existe (exceto para a própria disciplina)
        const checkNomeSql = "SELECT * FROM disciplina WHERE LOWER(disciplina) = LOWER(?) AND iddisciplina != ?";
        conexao.query(checkNomeSql, [disciplina.trim(), id], (nomeError, nomeResults) => {
            if(nomeError){
                console.error("Erro ao verificar nome da disciplina:", nomeError);
                return res.status(500).json({ 
                    error: "Erro interno do servidor", 
                    details: nomeError.message 
                });
            }
            
            if(nomeResults.length > 0){
                return res.status(400).json({ 
                    error: `A disciplina "${disciplina}" já existe no sistema` 
                });
            }
            
            // Atualizar disciplina
            const updateSql = "UPDATE disciplina SET disciplina = ? WHERE iddisciplina = ?";
            const values = [disciplina.trim(), id];
            
            conexao.query(updateSql, values, (updateError, updateResults) => {
                if(updateError){
                    console.error("Erro ao atualizar disciplina:", updateError);
                    res.status(500).json({ 
                        error: "Erro interno do servidor", 
                        details: updateError.message 
                    });
                } else {
                    if(updateResults.affectedRows === 0){
                        res.status(404).json({ error: "Disciplina não encontrada para atualização" });
                    } else {
                        res.status(200).json({ 
                            success: true,
                            message: `Disciplina "${disciplinaAtual.disciplina}" atualizada para "${disciplina}"`,
                            iddisciplina: id,
                            disciplina: disciplina.trim(),
                            alteracoes: {
                                nome: disciplinaAtual.disciplina !== disciplina
                            }
                        });
                    }
                }
            });
        });
    });
});



module.exports = router;