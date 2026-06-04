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

module.exports = router;