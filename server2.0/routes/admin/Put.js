const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const verificarToken = require("../../middlewares/authMiddleware");
const { uploadCombinado, deletarFotoFuncionario, deletarDocumentoFuncionario } = require("../../utils/upload");
const { criptografarSenha,gerarSenhaTemporaria } = require("../../utils/senhas");
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

// Desativar funcionário
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

// Rota para ativar funcionário
router.put("/funcionario/ativar/:id", verificarToken, async (req, res) => {
    const { id } = req.params;
    const dataAtual = new Date().toISOString().split('T')[0];

    try {
        console.log(`Ativando funcionário ID: ${id}`);
        
        // Buscar informações do funcionário (incluindo codigo)
        const funcionario = await new Promise((resolve, reject) => {
            conexao.query(`
                SELECT f.id_func, f.nome, f.email, f.codigo, c.cargo 
                FROM funcionario f
                INNER JOIN cargo c ON c.id_cargo = f.id_cargo
                WHERE f.id_func = ? AND f.status = 'Desativado'
            `, [id], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        
        if (funcionario.length === 0) {
            console.log(`Funcionário ${id} não encontrado ou já está ativo`);
            return res.status(404).json({ error: "Funcionario nao encontrado ou já está ativo" });
        }
        
        const { nome, email, codigo, cargo } = funcionario[0];
        console.log(`Funcionário encontrado: ${nome}, Código: ${codigo}, Email: ${email}`);
        
        // Gerar nova senha temporária
        const novaSenha = gerarSenhaTemporaria();
        const senhaCriptografada = await criptografarSenha(novaSenha);
        console.log(`Nova senha gerada para ${nome}`);

        // Atualizar status e senha
        await new Promise((resolve, reject) => {
            conexao.query(
                "UPDATE funcionario SET status = 'Ativo', senha = ?, data_atualizacao = ? WHERE id_func = ?", 
                [senhaCriptografada, dataAtual, id], 
                (erro, resultado) => {
                    if (erro) reject(erro);
                    else resolve(resultado);
                }
            );
        });
        console.log(`Status do funcionário ${nome} atualizado para Ativo`);

        // Enviar email com CÓDIGO e senha (o código é o usuário para login)
        console.log(`Enviando email para ${email}...`);
        const emailEnviado = await enviarCredenciaisReativacao(email, nome, codigo, novaSenha, cargo);
        
        if (emailEnviado.sucesso) {
            console.log(`Email enviado com sucesso para ${email}`);
        } else {
            console.error(`Erro ao enviar email para ${email}:`, emailEnviado.erro);
        }

        res.status(200).json({ 
            success: true, 
            message: `Funcionario ${nome} ativado com sucesso! ${emailEnviado.sucesso ? 'Credenciais enviadas por email.' : 'Erro ao enviar email. Verifique o email do funcionário.'}`,
            emailEnviado: emailEnviado.sucesso
        });
        
    } catch (error) {
        console.error("Erro ao ativar funcionário:", error);
        res.status(500).json({ error: "Erro interno do servidor: " + error.message });
    }
});

// Alterar senha
router.put("/funcionario/senha/:id", verificarToken, async (req, res) => {
    const { id } = req.params;
    const { senha_funcionario } = req.body;
    const dataAtual = new Date().toISOString().split('T')[0];
    try {
        const funcionario = await new Promise((resolve, reject) => {
            conexao.query("SELECT nome, email FROM funcionario WHERE id_func = ?", [id], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (funcionario.length === 0) return res.status(404).json({ success: false, error: "Funcionario nao encontrado" });

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

router.put('/atualizarprofessor/:id', (req, res) => {
    // Usar o uploadProfessor para permitir upload de novos arquivos
    upload.uploadProfessor(req, res, async (err) => {
        // Erro do multer
        if (err) {
            console.error("Erro no upload:", err);
            
            if (err instanceof multer.MulterError) {
                if (err.code === 'FILE_TOO_LARGE') {
                    return res.status(400).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Arquivo muito grande",
                        mensagem: "O arquivo excede o limite de 10MB"
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Muitos arquivos",
                        mensagem: "Número máximo de arquivos excedido"
                    });
                }
            }
            
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no upload",
                mensagem: err.message
            });
        }

        try {
            const { id } = req.params;
            const body = req.body || {};
            const files = req.files || {};

            // Dados do corpo da requisição
            const nomeprofessore = body.nomeprofessore || "";
            const genero = body.genero || "";
            const nacionalidadeprofessor = body.nacionalidadeprofessor || "";
            const estadocivilprofessor = body.estadocivilprofessor || "";
            const nomepaiprofessor = body.nomepaiprofessor || "";
            const nomemaeprofessor = body.nomemaeprofessor || "";
            const biprofessor = body.biprofessor || "";
            const datanascimentoprofessor = body.datanascimentoprofessor || "";
            const residenciaprofessor = body.residenciaprofessor || "";
            const telefoneprofessor = body.telefoneprofessor || "";
            const whatsappprofessor = body.whatsappprofessor || "";
            const emailprofessor = body.emailprofessor || "";
            const anoexprienciaprofessor = body.anoexprienciaprofessor || "";
            const titulacaoprofessor = body.titulacaoprofessor || "";
            const dataadmissaprofessor = body.dataadmissaprofessor || "";
            const tipocontratoprofessor = body.tipocontratoprofessor || "";
            const ibanprofessor = body.ibanprofessor || "";
            const tiposanguineoprofessor = body.tiposanguineoprofessor || "";
            const condicoesprofessor = body.condicoesprofessor || "";
            const contactoemergenciaprofessor = body.contactoemergenciaprofessor || "";
            
            // Flag para redefinir senha
            const redefinirSenha = body.redefinirSenha === 'true' || body.redefinirSenha === true;
            
            // VALIDAÇÕES
            if (!nomeprofessore || !nomeprofessore.trim()) {
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Campo obrigatório",
                    mensagem: "Nome do professor é obrigatório"
                });
            }
            
            if (!genero || !genero.trim()) {
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Campo obrigatório",
                    mensagem: "Gênero é obrigatório"
                });
            }

            if (emailprofessor && emailprofessor.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailprofessor.trim())) {
                    return res.status(400).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Email inválido",
                        mensagem: "Formato de email inválido"
                    });
                }
            }

            // Buscar dados atuais do professor
            const buscarProfessorSQL = "SELECT * FROM professor WHERE id_professor = ?";
            const [professorAtual] = await conexao.promise().query(buscarProfessorSQL, [id]);
            
            if (professorAtual.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Não encontrado",
                    mensagem: "Professor não encontrado"
                });
            }

            // Verificar duplicidade (exceto o próprio registro)
            const duplicidadeChecks = [
                { campo: 'bi', valor: biprofessor, label: 'BI' },
                { campo: 'email', valor: emailprofessor, label: 'Email' },
                { campo: 'telefone', valor: telefoneprofessor, label: 'Telefone' },
                { campo: 'whatsapp', valor: whatsappprofessor, label: 'WhatsApp' }
            ];

            for (const check of duplicidadeChecks) {
                if (check.valor && check.valor.trim()) {
                    const [existe] = await conexao.promise().query(
                        `SELECT id_professor FROM professor WHERE ${check.campo} = ? AND id_professor != ?`,
                        [check.valor, id]
                    );
                    
                    if (existe.length > 0) {
                        return res.status(400).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Dado duplicado",
                            mensagem: `${check.label} já está em uso por outro professor`
                        });
                    }
                }
            }

            // Processar nova senha se solicitado
            let novaSenha = null;
            let senhaCriptografada = null;
            let emailEnviado = false;

            if (redefinirSenha && emailprofessor && emailprofessor.trim()) {
                novaSenha = gerarSenhaTemporaria();
                senhaCriptografada = await criptografarSenha(novaSenha);
            }

            // Processar arquivos
            let nomeFoto = professorAtual[0].foto;
            let nomeBIPDF = professorAtual[0].bi_pdf;
            
            // Processar nova foto
            if (files.fotoprofessor) {
                // Deletar foto antiga
                if (nomeFoto) {
                    upload.deletarFotoProfessor(nomeFoto);
                }
                nomeFoto = files.fotoprofessor[0].filename;
            }
            
            // Processar novo BI PDF
            if (files.bipdfprofessor) {
                // Deletar BI antigo
                if (nomeBIPDF) {
                    upload.deletarDocumentoProfessor(nomeBIPDF);
                }
                nomeBIPDF = files.bipdfprofessor[0].filename;
            }

            // Processar outros documentos
            const novosDocumentos = [];
            const camposDoc = ['certificadoprofessor', 'diplomaprofessor', 'contratoprofessor', 'documentoprofessor'];
            
            camposDoc.forEach(campo => {
                if (files[campo]) {
                    files[campo].forEach(file => {
                        novosDocumentos.push({
                            tipo: campo,
                            nome: file.filename
                        });
                    });
                }
            });

            // Construir query de atualização
            const camposAtualizar = [];
            const valores = [];

            if (nomeprofessore) {
                camposAtualizar.push("nome = ?");
                valores.push(nomeprofessore);
            }
            if (genero) {
                camposAtualizar.push("genero = ?");
                valores.push(genero);
            }
            if (nacionalidadeprofessor !== undefined) {
                camposAtualizar.push("nacionalidade = ?");
                valores.push(nacionalidadeprofessor || null);
            }
            if (estadocivilprofessor !== undefined) {
                camposAtualizar.push("estadocivil = ?");
                valores.push(estadocivilprofessor || null);
            }
            if (nomepaiprofessor !== undefined) {
                camposAtualizar.push("nomepai = ?");
                valores.push(nomepaiprofessor || null);
            }
            if (nomemaeprofessor !== undefined) {
                camposAtualizar.push("nomemae = ?");
                valores.push(nomemaeprofessor || null);
            }
            if (biprofessor) {
                camposAtualizar.push("bi = ?");
                valores.push(biprofessor);
            }
            if (datanascimentoprofessor !== undefined) {
                camposAtualizar.push("data_nascimento = ?");
                valores.push(datanascimentoprofessor || null);
            }
            if (residenciaprofessor !== undefined) {
                camposAtualizar.push("residencia = ?");
                valores.push(residenciaprofessor || null);
            }
            if (telefoneprofessor !== undefined) {
                camposAtualizar.push("contacto = ?");
                valores.push(telefoneprofessor || null);
            }
            if (whatsappprofessor !== undefined) {
                camposAtualizar.push("whatsapp = ?");
                valores.push(whatsappprofessor || null);
            }
            if (emailprofessor !== undefined) {
                camposAtualizar.push("email = ?");
                valores.push(emailprofessor || null);
            }
            if (anoexprienciaprofessor !== undefined) {
                camposAtualizar.push("anoexperiencia = ?");
                valores.push(anoexprienciaprofessor || null);
            }
            if (titulacaoprofessor !== undefined) {
                camposAtualizar.push("titulacao = ?");
                valores.push(titulacaoprofessor || null);
            }
            if (dataadmissaprofessor !== undefined) {
                camposAtualizar.push("data_admissao = ?");
                valores.push(dataadmissaprofessor || null);
            }
            if (tipocontratoprofessor !== undefined) {
                camposAtualizar.push("tipo_contrato = ?");
                valores.push(tipocontratoprofessor || null);
            }
            if (ibanprofessor !== undefined) {
                camposAtualizar.push("iban = ?");
                valores.push(ibanprofessor || null);
            }
            if (tiposanguineoprofessor !== undefined) {
                camposAtualizar.push("tipo_sangue = ?");
                valores.push(tiposanguineoprofessor || null);
            }
            if (condicoesprofessor !== undefined) {
                camposAtualizar.push("condicoes = ?");
                valores.push(condicoesprofessor || null);
            }
            if (contactoemergenciaprofessor !== undefined) {
                camposAtualizar.push("contacto_emergencia = ?");
                valores.push(contactoemergenciaprofessor || null);
            }
            if (nomeFoto !== undefined) {
                camposAtualizar.push("foto = ?");
                valores.push(nomeFoto);
            }
            if (nomeBIPDF !== undefined) {
                camposAtualizar.push("bi_pdf = ?");
                valores.push(nomeBIPDF);
            }
            if (senhaCriptografada) {
                camposAtualizar.push("senha = ?");
                valores.push(senhaCriptografada);
            }

            if (camposAtualizar.length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Nenhum dado",
                    mensagem: "Nenhum dado para atualizar"
                });
            }

            valores.push(id);
            const query = `UPDATE professor SET ${camposAtualizar.join(", ")} WHERE id_professor = ?`;
            
            const [resultado] = await conexao.promise().query(query, valores);

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro",
                    mensagem: "Professor não encontrado ou nenhuma alteração realizada"
                });
            }

            // Atualizar documentos na tabela ficheiro_prof
            if (novosDocumentos.length > 0) {
                // Deletar documentos antigos do professor
                await conexao.promise().query(
                    "DELETE FROM ficheiro_prof WHERE id_professor = ?",
                    [id]
                );
                
                // Inserir novos documentos
                const inserirFicheiroSQL = `
                    INSERT INTO ficheiro_prof (ficheiro, id_professor, nome) 
                    VALUES (?, ?, ?)
                `;
                
                for (const doc of novosDocumentos) {
                    await conexao.promise().query(inserirFicheiroSQL, [
                        doc.nome,
                        id,
                        doc.tipo
                    ]);
                }
            }

            // Enviar email com nova senha se foi redefinida
            if (redefinirSenha && novaSenha && emailprofessor) {
                const cargo = "Professor";
                const codigoProfessor = professorAtual[0].codigo;
                
                const emailEnviadoResult = await require("../utils/email").enviarCredenciaisFuncionario(
                    emailprofessor,
                    nomeprofessore,
                    novaSenha,
                    cargo,
                    codigoProfessor
                );
                
                emailEnviado = emailEnviadoResult.sucesso;
            }

            // Resposta final
            res.status(200).json({
                sucesso: true,
                tipo: "sucesso",
                titulo: "Professor Atualizado!",
                mensagem: redefinirSenha && emailEnviado 
                    ? `Professor atualizado com sucesso! Nova senha enviada para ${emailprofessor}`
                    : redefinirSenha && !emailEnviado
                    ? "Professor atualizado, mas houve erro ao enviar o email com a nova senha"
                    : "Professor atualizado com sucesso!",
                dados: {
                    id_professor: id,
                    nome: nomeprofessore,
                    email: emailprofessor
                }
            });

        } catch (erro) {
            console.error("Erro ao atualizar professor:", erro);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro interno",
                mensagem: "Erro interno do servidor: " + erro.message
            });
        }
    });
});

router.put('/professor/desativar/:id', (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE professor SET estado = 'Desativado' WHERE id_professor = ?";
    
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

module.exports = router;