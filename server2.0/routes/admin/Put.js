const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const verificarToken = require("../../middlewares/authMiddleware");
const { uploadCombinado, deletarFotoFuncionario, deletarDocumentoFuncionario } = require("../../utils/upload");
const { criptografarSenha,gerarSenhaTemporaria,gerarId } = require("../../utils/senhas");
const { enviarEmail, enviarCredenciaisReativacao } = require('../../utils/email');
const { uploadCombinadoProfessor, deletarFotoProfessor, deletarDocumentoProfessor } = require('../../utils/upload');

router.put("/funcionario/:id", verificarToken, uploadCombinado.fields([
    { name: "foto", maxCount: 1 },
    { name: "documentos", maxCount: 10 }
]), async (req, res) => {
    const { id } = req.params;
    const { nome, contacto, bi, cargo, idAdm, documentos_remover } = req.body;
    const novaFoto = req.files?.foto ? req.files.foto[0].filename : null;
    const novosDocumentos = req.files?.documentos || [];
    const documentosTitulos = req.body.documentos_titulo || [];
    const dataAtual = new Date().toISOString().split('T')[0];

    try {
        if (!nome || !contacto || !bi || !cargo || !idAdm) {
            if (novaFoto) deletarFotoFuncionario(novaFoto);
            novosDocumentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
            return res.status(400).json({ success: false, error: "Campos obrigatórios faltando" });
        }

        const checkFuncionario = await new Promise((resolve, reject) => {
            conexao.query("SELECT foto FROM funcionario WHERE id_func = ? AND status = 'Ativo'", [id], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        
        if (checkFuncionario.length === 0) {
            if (novaFoto) deletarFotoFuncionario(novaFoto);
            novosDocumentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
            return res.status(404).json({ success: false, error: "Funcionario nao encontrado" });
        }
        
        const fotoAntiga = checkFuncionario[0].foto;

        const cargoResult = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_cargo FROM cargo WHERE cargo = ?", [cargo], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        
        if (cargoResult.length === 0) {
            if (novaFoto) deletarFotoFuncionario(novaFoto);
            novosDocumentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
            return res.status(400).json({ success: false, error: "Cargo nao encontrado" });
        }
        
        const id_cargo = cargoResult[0].id_cargo;

        await new Promise((resolve, reject) => {
            const updateSql = `UPDATE funcionario SET nome = ?, contacto = ?, bi = ?, id_cargo = ?, id_user = ?, data_atualizacao = ?, foto = COALESCE(?, foto) WHERE id_func = ? AND status = 'Ativo'`;
            conexao.query(updateSql, [nome.trim(), contacto.trim(), bi.trim(), id_cargo, idAdm, dataAtual, novaFoto, id], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });

        if (documentos_remover) {
            const docsToRemove = Array.isArray(documentos_remover) ? documentos_remover : [documentos_remover];
            for (const docId of docsToRemove) {
                const docResult = await new Promise((resolve, reject) => {
                    conexao.query("SELECT doc FROM doc_funcionario WHERE id_doc_func = ? AND id_func = ?", [docId, id], (erro, resultados) => {
                        if (erro) reject(erro);
                        else resolve(resultados);
                    });
                });
                if (docResult.length > 0) {
                    deletarDocumentoFuncionario(docResult[0].doc);
                    await new Promise((resolve, reject) => {
                        conexao.query("DELETE FROM doc_funcionario WHERE id_doc_func = ? AND id_func = ?", [docId, id], (erro, resultado) => {
                            if (erro) reject(erro);
                            else resolve(resultado);
                        });
                    });
                }
            }
        }

        for (let i = 0; i < novosDocumentos.length; i++) {
            const doc = novosDocumentos[i];
            const titulo = documentosTitulos[i] || doc.originalname;
            const id_doc_func = gerarId();
            await new Promise((resolve, reject) => {
                const sql = `INSERT INTO doc_funcionario (id_doc_func, titulo, doc, status, id_user, id_func, data_criacao, data_atualizacao) VALUES (?, ?, ?, 'Ativo', ?, ?, ?, ?)`;
                conexao.query(sql, [id_doc_func, titulo, doc.filename, idAdm, id, dataAtual, dataAtual], (erro, resultado) => {
                    if (erro) reject(erro);
                    else resolve(resultado);
                });
            });
        }

        if (novaFoto && fotoAntiga) deletarFotoFuncionario(fotoAntiga);

        res.status(200).json({ success: true, message: "Funcionario atualizado com sucesso" });
        
    } catch (error) {
        if (novaFoto) deletarFotoFuncionario(novaFoto);
        novosDocumentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
});

router.put("/funcionario/desativar/:id", verificarToken, async (req, res) => {
    const { id } = req.params;
    const dataAtual = new Date().toISOString().split('T')[0];
    try {
        const checkFuncionario = await new Promise((resolve, reject) => {
            conexao.query("SELECT nome FROM funcionario WHERE id_func = ? AND status = 'Ativo'", [id], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (checkFuncionario.length === 0) return res.status(404).json({ error: "Funcionario nao encontrado" });
        
        await new Promise((resolve, reject) => {
            conexao.query("UPDATE funcionario SET status = 'Desativado', data_atualizacao = ? WHERE id_func = ?", [dataAtual, id], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });
        res.status(200).json({ success: true, message: "Funcionario desativado com sucesso" });
    } catch (error) {
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

router.put("/funcionario/ativar/:id", verificarToken, async (req, res) => {
    const { id } = req.params;
    const dataAtual = new Date().toISOString().split('T')[0];
    try {
        const checkFuncionario = await new Promise((resolve, reject) => {
            conexao.query(
                "SELECT nome FROM funcionario WHERE id_func = ? AND status = 'Desativado'", 
                [id], 
                (erro, resultados) => {
                    if (erro) reject(erro);
                    else resolve(resultados);
                }
            );
        });

        if (checkFuncionario.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Funcionário não encontrado ou já está ativo" 
            });
        }
        
        await new Promise((resolve, reject) => {
            conexao.query(
                "UPDATE funcionario SET status = 'Ativo', data_atualizacao = ? WHERE id_func = ?", 
                [dataAtual, id], 
                (erro, resultado) => {
                    if (erro) reject(erro);
                    else resolve(resultado);
                }
            );
        });

        res.status(200).json({ 
            success: true, 
            message: `Funcionário ativado com sucesso` 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Erro interno do servidor" 
        });
    }
});

router.put("/funcionario/senha/:id", verificarToken, async (req, res) => {
    const { id } = req.params;
    const dataAtual = new Date().toISOString().split('T')[0];
    try {
        const funcionario = await new Promise((resolve, reject) => {
            conexao.query("SELECT nome, email FROM funcionario WHERE id_func = ?", [id], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (funcionario.length === 0) return res.status(404).json({ success: false, error: "Funcionario nao encontrado" });

        const senha_funcionario = gerarSenhaTemporaria();
        const senhaCriptografada = await criptografarSenha(senha_funcionario);
        await new Promise((resolve, reject) => {
            conexao.query("UPDATE funcionario SET senha = ?, data_atualizacao = ? WHERE id_func = ?", [senhaCriptografada, dataAtual, id], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });

        const html = `Sua senha foi redefinida. Nova senha: ${senha_funcionario}`;
        await enviarEmail(funcionario[0].email, 'Senha Redefinida - IPS Metropolitano', html);

        res.status(200).json({ success: true, message: "Senha alterada com sucesso" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
});

router.put("/atualizarprofessor/:id", verificarToken,
    (req, res, next) => {
        uploadCombinadoProfessor(req, res, (err) => {
            if (err) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Campo inesperado: ${err.field}` 
                });
            }
            next();
        });
    },
    async (req, res) => {
        const { id } = req.params;
        const dataAtual = new Date().toISOString().split('T')[0];
        
        try {
            const professorExistente = await new Promise((resolve, reject) => {
                conexao.query(
                    "SELECT id_professor, foto FROM professor WHERE id_professor = ?", 
                    [id], 
                    (erro, resultados) => {
                        if (erro) reject(erro);
                        else resolve(resultados);
                    }
                );
            });
            
            if (professorExistente.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Professor não encontrado" 
                });
            }

            await new Promise((resolve, reject) => {
                conexao.query("START TRANSACTION", (erro) => {
                    if (erro) reject(erro);
                    else resolve();
                });
            });

            try {
                const camposAtualizar = [];
                const valores = [];
                
                const camposPermitidos = [
                    'nome', 'genero', 'nacionalidade', 'nomepai', 'nomemae', 
                    'contacto', 'whatsapp', 'bi', 'email', 'contactoemergencia',
                    'anoexperienca', 'titulacao', 'iban', 'tiposangue',
                    'data_nascimento', 'data_admissao', 'estadocivil', 'id_contrato'
                ];
                
                camposPermitidos.forEach(campo => {
                    if (req.body[campo] !== undefined && req.body[campo] !== null && req.body[campo] !== '') {
                        camposAtualizar.push(`${campo} = ?`);
                        valores.push(req.body[campo]);
                    }
                });
                
                if (req.files && req.files.foto && req.files.foto.length > 0) {
                    const nomeFoto = req.files.foto[0].filename;
                    camposAtualizar.push('foto = ?');
                    valores.push(nomeFoto);
                    if (professorExistente[0].foto) {
                        deletarFotoProfessor(professorExistente[0].foto);
                    }
                }
                
                if (camposAtualizar.length > 0) {
                    camposAtualizar.push('data_atualizacao = ?');
                    valores.push(dataAtual);
                    valores.push(id);
                    const sql = `UPDATE professor SET ${camposAtualizar.join(', ')} WHERE id_professor = ?`;
                    await new Promise((resolve, reject) => {
                        conexao.query(sql, valores, (erro, resultado) => {
                            if (erro) reject(erro);
                            else resolve(resultado);
                        });
                    });
                }

                if (req.body.documentos_remover) {
                    let docsRemover = req.body.documentos_remover;
                    if (!Array.isArray(docsRemover)) {
                        docsRemover = [docsRemover];
                    }
                    docsRemover = docsRemover.filter(docId => docId && docId !== '');
                    
                    for (const docId of docsRemover) {
                        const docInfo = await new Promise((resolve, reject) => {
                            conexao.query(
                                "SELECT ficheiro FROM ficheiro_prof WHERE id_ficheiro = ? AND id_professor = ?", 
                                [docId, id], 
                                (erro, resultados) => {
                                    if (erro) reject(erro);
                                    else resolve(resultados);
                                }
                            );
                        });
                        
                        if (docInfo.length > 0 && docInfo[0].ficheiro) {
                            deletarDocumentoProfessor(docInfo[0].ficheiro);
                        }
                        
                        await new Promise((resolve, reject) => {
                            conexao.query(
                                "DELETE FROM ficheiro_prof WHERE id_ficheiro = ? AND id_professor = ?", 
                                [docId, id], 
                                (erro, resultado) => {
                                    if (erro) reject(erro);
                                    else resolve(resultado);
                                }
                            );
                        });
                    }
                }

                if (req.files && req.files.documentos && req.files.documentos.length > 0) {
                    const documentos = req.files.documentos;
                    let titulos = [];
                    if (req.body.documentos_titulo) {
                        titulos = Array.isArray(req.body.documentos_titulo) 
                            ? req.body.documentos_titulo 
                            : [req.body.documentos_titulo];
                    }
                    
                    for (let i = 0; i < documentos.length; i++) {
                        const doc = documentos[i];
                        const titulo = titulos[i] || doc.originalname.replace(/\.[^/.]+$/, '');
                        const id_ficheiro = gerarId();
                        
                        await new Promise((resolve, reject) => {
                            const sql = `
                                INSERT INTO ficheiro_prof 
                                (id_ficheiro, id_professor, ficheiro, nome, status, data_actualizacao, data_criacao) 
                                VALUES (?, ?, ?, ?, 'Ativo', ?, ?)
                            `;
                            conexao.query(
                                sql, 
                                [id_ficheiro, id, titulo, doc.filename, dataAtual, dataAtual],
                                (erro, resultado) => {
                                    if (erro) reject(erro);
                                    else resolve(resultado);
                                }
                            );
                        });
                    }
                }

                await new Promise((resolve, reject) => {
                    conexao.query("COMMIT", (erro) => {
                        if (erro) reject(erro);
                        else resolve();
                    });
                });

                const professorAtualizado = await new Promise((resolve, reject) => {
                    conexao.query(
                        `SELECT p.*, c.contrato 
                         FROM professor p 
                         LEFT JOIN contrato c ON p.id_contrato = c.id_contrato 
                         WHERE p.id_professor = ?`, 
                        [id], 
                        (erro, resultados) => {
                            if (erro) reject(erro);
                            else resolve(resultados[0]);
                        }
                    );
                });

                const documentosAtualizados = await new Promise((resolve, reject) => {
                    conexao.query(
                        "SELECT id_ficheiro, ficheiro, nome, status, data_actualizacao FROM ficheiro_prof WHERE id_professor = ? AND status = 'Ativo' ORDER BY data_actualizacao DESC", 
                        [id], 
                        (erro, resultados) => {
                            if (erro) reject(erro);
                            else resolve(resultados);
                        }
                    );
                });

                const baseUrl = `${req.protocol}://${req.get('host')}`;
                
                const fotoUrl = professorAtualizado && professorAtualizado.foto 
                    ? `${baseUrl}/api/img/professores/${professorAtualizado.foto}` 
                    : null;

                const documentosComUrl = documentosAtualizados.map(doc => ({
                    ...doc,
                    doc_url: doc.ficheiro ? `${baseUrl}/api/img/professores/documentos/${doc.nome}` : null
                }));

                res.status(200).json({
                    success: true,
                    message: "Professor atualizado com sucesso!",
                    professor: {
                        ...professorAtualizado,
                        fotoUrl: fotoUrl
                    },
                    documentos: documentosComUrl
                });

            } catch (error) {
                await new Promise((resolve) => {
                    conexao.query("ROLLBACK", () => resolve());
                });
                throw error;
            }

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Erro ao atualizar professor: " + error.message
            });
        }
    }
);

router.put('/professor/desativar/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE professor SET status = 'Eliminado' WHERE id_professor = ?";
    
    conexao.query(sql, [id], (error, result) => {
        if (error) {
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            if (result.affectedRows === 0) {
                res.status(404).json({
                    error: "Professor não encontrado"
                });
            } else {
                res.status(200).json({
                    message: "Professor desativado com sucesso",
                    professoresAfetados: result.affectedRows
                });
            }
        }
    });
});

router.put('/professor/ativar/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE professor SET status = 'Ativo' WHERE id_professor = ?";
    
    conexao.query(sql, [id], (error, result) => {
        if (error) {
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            if (result.affectedRows === 0) {
                res.status(404).json({
                    error: "Professor não encontrado"
                });
            } else {
                res.status(200).json({
                    message: "Professor desativado com sucesso",
                    professoresAfetados: result.affectedRows
                });
            }
        }
    });
});

router.put("/professor/senha/:id", verificarToken, async (req, res) => {
    const { id } = req.params;
    const dataAtual = new Date().toISOString().split('T')[0];
    try {
        const funcionario = await new Promise((resolve, reject) => {
            conexao.query("SELECT nome, email FROM professor WHERE id_professor = ?", [id], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (funcionario.length === 0) return res.status(404).json({ success: false, error: "Funcionario nao encontrado" });

        const senhaprofessor = gerarSenhaTemporaria();
        const senhaCriptografada = await criptografarSenha(senhaprofessor);
        await new Promise((resolve, reject) => {
            conexao.query("UPDATE professor SET senha = ?, data_atualizacao = ? WHERE id_professor = ?", [senhaCriptografada, dataAtual, id], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });

        const html = `Sua senha foi redefinida. Nova senha: ${senhaprofessor}`;
        await enviarEmail(funcionario[0].email, 'Senha Redefinida - IPS Metropolitano', html);

        res.status(200).json({ success: true, message: "Senha alterada com sucesso" });
    } catch (error) {
        res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
});

router.put('/categoriaCurso/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const { categoriacurso } = req.body;

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

    const checkSql = 'SELECT * FROM categoria WHERE id_categoria = ?';
    
    conexao.query(checkSql, [id], (checkError, checkResults) => {
        if (checkError) {
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

        const duplicateSql = 'SELECT * FROM categoria WHERE categoria = ? AND id_categoria != ?';
        
        conexao.query(duplicateSql, [categoriacurso.trim(), id], (duplicateError, duplicateResults) => {
            if (duplicateError) {
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

            const updateSql = 'UPDATE categoria SET categoria = ? WHERE id_categoria = ?';
            const values = [categoriacurso.trim(), id];
            
            conexao.query(updateSql, values, (error, results) => {
                if (error) {
                    return res.status(500).json({ 
                        success: false,
                        error: 'Erro ao atualizar categoria no banco de dados'
                    });
                }
                
                if (results.affectedRows === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Categoria não encontrada para atualização'
                    });
                }
                
                const selectSql = 'SELECT id_categoria as idcategoriacurso, categoria as categoriacurso FROM categoria WHERE id_categoria = ?';
                conexao.query(selectSql, [id], (selectError, selectResults) => {
                    if (selectError) {
                        return res.status(500).json({
                            success: false,
                            error: 'Erro ao buscar categoria atualizada'
                        });
                    }

                    res.status(200).json({
                        success: true,
                        message: 'Categoria atualizada com sucesso',
                        categoriacurso: categoriacurso.trim(),
                        departamento: selectResults[0] || null
                    });
                });
            });
        });
    });
});

router.put('/Curso/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const { curso, idcategoriacurso } = req.body;

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

    const checkCursoSql = 'SELECT * FROM curso WHERE id_curso = ?';
    conexao.query(checkCursoSql, [id], (checkError, checkResults) => {
        if (checkError) {
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

        const checkCategoriaSql = 'SELECT categoria FROM categoria WHERE id_categoria = ?';
        conexao.query(checkCategoriaSql, [idcategoriacurso], (catError, catResults) => {
            if (catError) {
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

            const duplicateSql = 'SELECT * FROM curso WHERE curso = ? AND id_curso != ?';
            conexao.query(duplicateSql, [curso.trim(), id], (duplicateError, duplicateResults) => {
                if (duplicateError) {
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

                const updateSql = 'UPDATE curso SET curso = ?, id_categoria = ? WHERE id_curso = ?';
                const values = [curso.trim(), idcategoriacurso, id];
                
                conexao.query(updateSql, values, (error, results) => {
                    if (error) {
                        return res.status(500).json({ 
                            success: false,
                            error: 'Erro ao atualizar curso no banco de dados'
                        });
                    }

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
});

router.put('/disciplina/:id', verificarToken, (req, res) => {
    const { id } = req.params;
    const { disciplina } = req.body;
    
    if (!disciplina || !disciplina.trim()) {
        return res.status(400).json({ error: "Nome da disciplina é obrigatório" });
    }

    const checkSql = "SELECT * FROM disciplina WHERE id_disciplina = ?";
    conexao.query(checkSql, [id], (checkError, checkResults) => {
        if(checkError){
            return res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: checkError.message 
            });
        }
        
        if(checkResults.length === 0){
            return res.status(404).json({ error: "Disciplina não encontrada" });
        }
        
        const disciplinaAtual = checkResults[0];

        const checkNomeSql = "SELECT * FROM disciplina WHERE LOWER(disciplina) = LOWER(?) AND id_disciplina != ?";
        conexao.query(checkNomeSql, [disciplina.trim(), id], (nomeError, nomeResults) => {
            if(nomeError){
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

            const updateSql = "UPDATE disciplina SET disciplina = ? WHERE id_disciplina = ?";
            const values = [disciplina.trim(), id];
            
            conexao.query(updateSql, values, (updateError, updateResults) => {
                if(updateError){
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

router.put('/periodo/:id', async (req, res) => {
    const { id } = req.params;
    const { 
        id_anocurricular, 
        id_curso, 
        id_categoria, 
        turma, 
        periodo, 
        id_anoletivo, 
        idAdm, 
        anoletivo,
        status_inscricao,
        status_anoletivo
    } = req.body;

    if (!id_anocurricular || !id_curso || !id_categoria || !turma || !periodo) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha todos os campos obrigatórios"
        });
    }

    if (status_inscricao && !['Aberto', 'Fechado'].includes(status_inscricao)) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Status de inscrição inválido",
            mensagem: "O status de inscrição deve ser 'Aberto' ou 'Fechado'"
        });
    }

    if (status_anoletivo && !['Ativo', 'Desativado'].includes(status_anoletivo)) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Status do ano letivo inválido",
            mensagem: "O status do ano letivo deve ser 'Ativo' ou 'Desativado'"
        });
    }

    try {
        const verificarExistenciaSQL = "SELECT id_periodo, id_turma FROM periodo WHERE id_periodo = ?";
        const existe = await new Promise((resolve, reject) => {
            conexao.query(verificarExistenciaSQL, [id], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        if (existe.length === 0) {
            return res.status(404).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Período não encontrado",
                mensagem: "O período que você está tentando editar não existe"
            });
        }

        const verificarAnoSQL = "SELECT id_anocurricular, ano FROM anocurricular WHERE id_anocurricular = ? AND status = 'Ativo'";
        const anoResult = await new Promise((resolve, reject) => {
            conexao.query(verificarAnoSQL, [id_anocurricular], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        if (anoResult.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Ano Curricular inválido",
                mensagem: "O ano curricular selecionado não existe ou está inativo"
            });
        }

        const verificarCursoSQL = "SELECT id_curso, curso, id_categoria FROM curso WHERE id_curso = ? AND status = 'Ativo'";
        const cursoResult = await new Promise((resolve, reject) => {
            conexao.query(verificarCursoSQL, [id_curso], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        if (cursoResult.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Curso inválido",
                mensagem: "O curso selecionado não existe ou está inativo"
            });
        }

        const verificarCategoriaSQL = "SELECT id_categoria, categoria FROM categoria WHERE id_categoria = ? AND status = 'Ativo'";
        const catResult = await new Promise((resolve, reject) => {
            conexao.query(verificarCategoriaSQL, [id_categoria], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        if (catResult.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Categoria inválida",
                mensagem: "A categoria selecionada não existe ou está inativa"
            });
        }

        if (cursoResult[0].id_categoria !== id_categoria) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Inconsistência de dados",
                mensagem: "O curso selecionado não pertence à categoria informada"
            });
        }

        const verificarAnoCursoSQL = "SELECT id_anocurricular FROM anocurricular WHERE id_anocurricular = ? AND id_curso = ?";
        const anoCursoResult = await new Promise((resolve, reject) => {
            conexao.query(verificarAnoCursoSQL, [id_anocurricular, id_curso], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        if (anoCursoResult.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Inconsistência de dados",
                mensagem: "O ano curricular selecionado não pertence ao curso informado"
            });
        }

        const periodosPermitidos = ['Manhã', 'Tarde', 'Noite', 'Diurno'];
        if (!periodosPermitidos.includes(periodo)) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Período inválido",
                mensagem: "O período deve ser: Manhã, Tarde, Noite ou Diurno"
            });
        }

        const processarTurma = async () => {
            const verificarTurmaSQL = "SELECT id_turma FROM turma WHERE turma = ? AND id_curso = ? AND status = 'Ativo'";
            const turmaResult = await new Promise((resolve, reject) => {
                conexao.query(verificarTurmaSQL, [turma, id_curso], (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
            });

            let id_turma_final;
            const crypto = require('crypto');

            if (turmaResult.length === 0) {
                id_turma_final = crypto.randomUUID();
                await new Promise((resolve, reject) => {
                    conexao.query(
                        `INSERT INTO turma (id_turma, turma, status, id_user, id_curso) 
                         VALUES (?, ?, 'Ativo', ?, ?)`,
                        [id_turma_final, turma, idAdm, id_curso],
                        (error) => {
                            if (error) reject(error);
                            else resolve();
                        }
                    );
                });
            } else {
                id_turma_final = turmaResult[0].id_turma;
            }

            return id_turma_final;
        };

        const id_turma_final = await processarTurma();

        const verificarDuplicadoSQL = `SELECT id_periodo FROM periodo WHERE id_turma = ? AND periodo = ? AND id_periodo != ?`;
        const duplicadoResult = await new Promise((resolve, reject) => {
            conexao.query(verificarDuplicadoSQL, [id_turma_final, periodo, id], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        if (duplicadoResult.length > 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Período Duplicado",
                mensagem: `Já existe o período "${periodo}" para esta turma`
            });
        }

        await new Promise((resolve, reject) => {
            conexao.query(
                `UPDATE periodo SET 
                    id_turma = ?, 
                    periodo = ?, 
                    id_anocurricular = ?,
                    id_user = ?, 
                    data_atualizacao = CURDATE() 
                WHERE id_periodo = ?`,
                [id_turma_final, periodo, id_anocurricular, idAdm, id],
                (error) => {
                    if (error) reject(error);
                    else resolve();
                }
            );
        });

        let resultadoAnoLetivo = null;

        if (anoletivo && anoletivo.trim()) {
            const verificarAnoLetivoSQL = `SELECT id_anoletivo, status FROM anoletivo WHERE id_periodo = ? AND ano = ?`;
            const anoExistente = await new Promise((resolve, reject) => {
                conexao.query(verificarAnoLetivoSQL, [id, anoletivo.trim()], (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
            });

            if (anoExistente.length > 0) {
                const updates = [];
                const params = [];

                if (status_anoletivo) {
                    updates.push('status = ?');
                    params.push(status_anoletivo);
                }

                if (status_inscricao) {
                    updates.push('status_inscricao = ?');
                    params.push(status_inscricao);
                }

                if (updates.length > 0) {
                    updates.push('data_atualizacao = CURDATE()');
                    params.push(anoExistente[0].id_anoletivo);
                    
                    await new Promise((resolve, reject) => {
                        conexao.query(
                            `UPDATE anoletivo SET ${updates.join(', ')} WHERE id_anoletivo = ?`,
                            params,
                            (error) => {
                                if (error) reject(error);
                                else resolve();
                            }
                        );
                    });
                }

                resultadoAnoLetivo = {
                    id_anoletivo: anoExistente[0].id_anoletivo,
                    ano: anoletivo.trim(),
                    status: status_anoletivo || anoExistente[0].status
                };
            } else {
                const novoIdAnoLetivo = require('crypto').randomUUID();
                await new Promise((resolve, reject) => {
                    conexao.query(
                        `INSERT INTO anoletivo (id_anoletivo, ano, id_periodo, id_user, data_criacao, status, status_inscricao) 
                         VALUES (?, ?, ?, ?, CURDATE(), ?, ?)`,
                        [novoIdAnoLetivo, anoletivo.trim(), id, idAdm, status_anoletivo || 'Ativo', status_inscricao || 'Fechado'],
                        (error) => {
                            if (error) reject(error);
                            else resolve();
                        }
                    );
                });
                resultadoAnoLetivo = {
                    id_anoletivo: novoIdAnoLetivo,
                    ano: anoletivo.trim(),
                    status: status_anoletivo || 'Ativo'
                };
            }
        } else if (id_anoletivo) {
            const verificarAnoLetivoExistente = `SELECT id_anoletivo FROM anoletivo WHERE id_anoletivo = ?`;
            const anoExistente = await new Promise((resolve, reject) => {
                conexao.query(verificarAnoLetivoExistente, [id_anoletivo], (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
            });

            if (anoExistente.length > 0) {
                const updates = [];
                const params = [];

                if (status_anoletivo) {
                    updates.push('status = ?');
                    params.push(status_anoletivo);
                }

                if (status_inscricao) {
                    updates.push('status_inscricao = ?');
                    params.push(status_inscricao);
                }

                if (updates.length > 0) {
                    updates.push('data_atualizacao = CURDATE()');
                    params.push(id_anoletivo);
                    
                    await new Promise((resolve, reject) => {
                        conexao.query(
                            `UPDATE anoletivo SET ${updates.join(', ')} WHERE id_anoletivo = ?`,
                            params,
                            (error) => {
                                if (error) reject(error);
                                else resolve();
                            }
                        );
                    });
                }

                resultadoAnoLetivo = {
                    id_anoletivo: id_anoletivo,
                    status: status_anoletivo || 'Existente'
                };
            }
        }

        const buscaDadosSQL = `
            SELECT 
                p.id_periodo,
                p.periodo,
                p.status,
                t.id_turma,
                t.turma,
                c.id_curso,
                c.curso,
                cat.id_categoria,
                cat.categoria,
                ac.id_anocurricular,
                ac.ano AS anocurricular,
                al.id_anoletivo,
                al.ano AS anoletivo,
                al.status AS status_anoletivo,
                al.status_inscricao
            FROM periodo p
            INNER JOIN turma t ON t.id_turma = p.id_turma
            INNER JOIN curso c ON c.id_curso = t.id_curso
            INNER JOIN categoria cat ON cat.id_categoria = c.id_categoria
            INNER JOIN anocurricular ac ON ac.id_anocurricular = p.id_anocurricular
            LEFT JOIN anoletivo al ON al.id_periodo = p.id_periodo AND al.id_anoletivo = ?
            WHERE p.id_periodo = ?
        `;

        const dadosCompletos = await new Promise((resolve, reject) => {
            conexao.query(buscaDadosSQL, [resultadoAnoLetivo?.id_anoletivo || null, id], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        res.status(200).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Período Atualizado",
            mensagem: `Turma "${turma}" - Período "${periodo}" atualizado com sucesso!`,
            dados: dadosCompletos[0] || {
                id_periodo: id,
                periodo: periodo,
                turma: turma,
                curso: cursoResult[0].curso,
                categoria: catResult[0].categoria,
                anocurricular: anoResult[0].ano,
                id_anocurricular: id_anocurricular,
                id_curso: id_curso,
                id_categoria: id_categoria,
                id_turma: id_turma_final,
                anoletivo: resultadoAnoLetivo?.ano || null,
                id_anoletivo: resultadoAnoLetivo?.id_anoletivo || null,
                status_anoletivo: resultadoAnoLetivo?.status || null,
                status_inscricao: status_inscricao || 'Fechado'
            }
        });

    } catch (error) {
        res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro no servidor",
            mensagem: "Erro interno ao atualizar período: " + error.message
        });
    }
});

router.put('/turma/:id/status-inscricao', async (req, res) => {
    const { id } = req.params;
    const { status_inscricao, idAdm } = req.body;

    if (!['Aberto', 'Fechado'].includes(status_inscricao)) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Status inválido",
            mensagem: "O status de inscrição deve ser 'Aberto' ou 'Fechado'"
        });
    }

    try {
        const verificarSQL = "SELECT id_anoletivo, ano FROM anoletivo WHERE id_anoletivo = ?";
        const anoExistente = await new Promise((resolve, reject) => {
            conexao.query(verificarSQL, [id], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        if (anoExistente.length === 0) {
            return res.status(404).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Ano Letivo não encontrado",
                mensagem: "O ano letivo que você está tentando alterar não existe"
            });
        }

        await new Promise((resolve, reject) => {
            conexao.query(
                `UPDATE anoletivo SET status_inscricao = ?, id_user = ?, data_atualizacao = CURDATE() WHERE id_anoletivo = ?`,
                [status_inscricao, idAdm, id],
                (error) => {
                    if (error) reject(error);
                    else resolve();
                }
            );
        });

        res.status(200).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Status atualizado",
            mensagem: `Status de inscrição do ano letivo "${anoExistente[0].ano}" alterado para "${status_inscricao}"`,
            dados: {
                id_anoletivo: id,
                ano: anoExistente[0].ano,
                status_inscricao: status_inscricao
            }
        });

    } catch (error) {
        res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro no servidor",
            mensagem: "Erro interno ao alterar status de inscrição: " + error.message
        });
    }
});

router.put('/periodo/ativar/:id', (req, res) => {
    const { id } = req.params;
    
    const checkSql = "SELECT status FROM anoletivo WHERE id_anoletivo = ?";
    conexao.query(checkSql, [id], (checkError, checkResult) => {
        if (checkError) {
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao verificar status do período' 
            });
        }
        
        if (checkResult.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Período não encontrado' 
            });
        }
        
        if (checkResult[0].status === 'Ativo') {
            return res.status(400).json({ 
                success: false, 
                message: 'Este período já está ativo' 
            });
        }
        
        const sql = "UPDATE anoletivo SET status = 'Ativo' WHERE id_anoletivo = ?";
        conexao.query(sql, [id], (error, result) => {
            if (error) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro interno ao ativar o período' 
                });
            }
            
            return res.status(200).json({ 
                success: true, 
                message: 'Período ativado com sucesso',
                data: {
                    id: id,
                    status: 'Ativo'
                }
            });
        });
    });
});

module.exports = router;