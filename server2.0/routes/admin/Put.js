const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const verificarToken = require("../../middlewares/authMiddleware");
const { uploadCombinado, deletarFotoFuncionario, deletarDocumentoFuncionario } = require("../../utils/upload");
const { criptografarSenha,gerarSenhaTemporaria,gerarId } = require("../../utils/senhas");
const { enviarEmail, enviarCredenciaisReativacao } = require('../../utils/email');

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

        // Remover documentos
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

        // Adicionar novos documentos
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
        console.error("Erro ao atualizar funcionário:", error);
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
            conexao.query("SELECT nome FROM funcionario WHERE id_func = ? AND status = 'Desativado'", [id], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (checkFuncionario.length === 0) return res.status(404).json({ error: "Funcionario nao encontrado" });
        
        await new Promise((resolve, reject) => {
            conexao.query("UPDATE funcionario SET status = 'Ativo', data_atualizacao = ? WHERE id_func = ?", [dataAtual, id], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });
        res.status(200).json({ success: true, message: "Funcionario Ativado com sucesso" });
    } catch (error) {
        res.status(500).json({ error: "Erro interno do servidor" });
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
        console.error("Erro ao redefinir senha:", error);
        res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
});

// ========== ROTA PARA ATUALIZAR PROFESSOR ==========
router.put(
    "/atualizarprofessor/:id", 
    verificarToken,
    uploadCombinado.fields([
        { name: 'foto', maxCount: 1 },
        { name: 'documentos', maxCount: 10 }
    ]),
    async (req, res) => {
        const { id } = req.params;
        const dataAtual = new Date().toISOString().split('T')[0];
        
        console.log("=== ATUALIZANDO PROFESSOR ===");
        console.log("ID:", id);
        console.log("Body:", req.body);
        console.log("Files:", req.files);
        
        try {
            // 1. Verificar se o professor existe
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

            // 2. Atualizar dados do professor
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
            
            // Atualizar foto se houver
            const fs = require('fs');
            const path = require('path');
            
            if (req.files && req.files.foto && req.files.foto.length > 0) {
                const foto = req.files.foto[0];
                const nomeFoto = foto.filename;
                const dirUpload = path.join(__dirname, '../../uploads/professores');
                
                camposAtualizar.push('foto = ?');
                valores.push(nomeFoto);
                
                // Remover foto antiga
                if (professorExistente[0].foto) {
                    const caminhoAntigo = path.join(dirUpload, professorExistente[0].foto);
                    if (fs.existsSync(caminhoAntigo)) {
                        fs.unlinkSync(caminhoAntigo);
                    }
                }
            }
            
            // Adicionar data de atualização
            if (camposAtualizar.length > 0) {
                camposAtualizar.push('data_atualizacao = ?');
                valores.push(dataAtual);
                valores.push(id);
                
                const sql = `UPDATE professor SET ${camposAtualizar.join(', ')} WHERE id_professor = ?`;
                console.log("SQL:", sql);
                console.log("Valores:", valores);
                
                await new Promise((resolve, reject) => {
                    conexao.query(sql, valores, (erro, resultado) => {
                        if (erro) reject(erro);
                        else resolve(resultado);
                    });
                });
            }

            // 3. Gerenciar documentos
            const dirDocs = path.join(__dirname, '../../uploads/professores/documentos');
            if (!fs.existsSync(dirDocs)) {
                fs.mkdirSync(dirDocs, { recursive: true });
            }
            
            // 3.1 Remover documentos
            if (req.body.documentos_remover) {
                const docsRemover = Array.isArray(req.body.documentos_remover) 
                    ? req.body.documentos_remover 
                    : [req.body.documentos_remover];
                
                for (const docId of docsRemover) {
                    if (docId) {
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
                            const caminhoArquivo = path.join(dirDocs, docInfo[0].ficheiro);
                            if (fs.existsSync(caminhoArquivo)) {
                                fs.unlinkSync(caminhoArquivo);
                            }
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
            }
            
            // 3.2 Adicionar novos documentos
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
                    
                    await new Promise((resolve, reject) => {
                        const sql = `
                            INSERT INTO ficheiro_prof 
                            (id_professor, ficheiro, nome, status, data_actualizacao) 
                            VALUES (?, ?, ?, Ativado, ?, ?)
                        `;
                        conexao.query(
                            sql, 
                            [id, doc.filename, titulo, dataAtual, dataAtual], 
                            (erro, resultado) => {
                                if (erro) reject(erro);
                                else resolve(resultado);
                            }
                        );
                    });
                }
            }

            // 4. Buscar dados atualizados
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
                    "SELECT id_ficheiro, ficheiro, nome, status, data_actualizacao FROM ficheiro_prof WHERE id_professor = ? AND status = 1 ORDER BY data_actualizacao DESC", 
                    [id], 
                    (erro, resultados) => {
                        if (erro) reject(erro);
                        else resolve(resultados);
                    }
                );
            });

            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const documentosComUrl = documentosAtualizados.map(doc => ({
                ...doc,
                doc_url: doc.ficheiro ? `${baseUrl}/api/img/professores/documentos/${doc.ficheiro}` : null
            }));

            res.status(200).json({
                success: true,
                message: "Professor atualizado com sucesso!",
                professor: professorAtualizado,
                documentos: documentosComUrl
            });

        } catch (error) {
            console.error("Erro ao atualizar professor:", error);
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
            console.error("Erro ao desativar o professor:", error);
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
            console.error("Erro ao desativar o professor:", error);
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
        console.error("Erro ao redefinir senha:", error);
        res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
});

module.exports = router;