const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const verificarToken = require("../../middlewares/authMiddleware");
const { uploadFuncionario, deletarFotoFuncionario, deletarDocumentoFuncionario } = require("../../utils/upload");
const { enviarCredenciaisFuncionario } = require("../../utils/email");
const { criptografarSenha, gerarId, gerarCodigo, gerarSenhaTemporaria } = require("../../utils/senhas");

router.post("/registrarfuncionario", verificarToken, uploadFuncionario.fields([
    { name: "foto", maxCount: 1 },
    { name: "documentos", maxCount: 10 }
]), async (req, res) => {
    const {
        nome_funcionario,
        contacto_funcionario,
        bi_funcionario,
        cargo_funcionario,
        email_funcionario,
        idAdm
    } = req.body;

    const foto = req.files?.foto ? req.files.foto[0].filename : null;
    const documentos = req.files?.documentos || [];

    if (!nome_funcionario?.trim()) {
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        return res.status(400).json({ sucesso: false, mensagem: "Nome do funcionario é obrigatorio" });
    }

    if (!contacto_funcionario?.trim()) {
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        return res.status(400).json({ sucesso: false, mensagem: "Contacto é obrigatorio" });
    }

    if (!bi_funcionario?.trim()) {
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        return res.status(400).json({ sucesso: false, mensagem: "BI é obrigatorio" });
    }

    if (!cargo_funcionario?.trim()) {
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        return res.status(400).json({ sucesso: false, mensagem: "Cargo é obrigatorio" });
    }

    if (!email_funcionario?.trim()) {
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        return res.status(400).json({ sucesso: false, mensagem: "Email é obrigatorio" });
    }

    try {
        const verificarContacto = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_func FROM funcionario WHERE contacto = ?", [contacto_funcionario.trim()], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (verificarContacto.length > 0) {
            if (foto) deletarFotoFuncionario(foto);
            documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
            return res.status(400).json({ sucesso: false, mensagem: "Contacto ja em uso" });
        }

        const verificarBI = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_func FROM funcionario WHERE bi = ?", [bi_funcionario.trim()], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (verificarBI.length > 0) {
            if (foto) deletarFotoFuncionario(foto);
            documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
            return res.status(400).json({ sucesso: false, mensagem: "BI ja em uso" });
        }

        const verificarEmail = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_func FROM funcionario WHERE email = ?", [email_funcionario.trim()], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (verificarEmail.length > 0) {
            if (foto) deletarFotoFuncionario(foto);
            documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
            return res.status(400).json({ sucesso: false, mensagem: "Email ja em uso" });
        }

        const cargoResult = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_cargo FROM cargo WHERE cargo = ?", [cargo_funcionario], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (cargoResult.length === 0) {
            if (foto) deletarFotoFuncionario(foto);
            documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
            return res.status(400).json({ sucesso: false, mensagem: "Cargo nao encontrado" });
        }

        const id_cargo = cargoResult[0].id_cargo;
        const id_func = gerarId();
        const codigo = gerarCodigo();
        const senha_funcionario = gerarSenhaTemporaria();
        const senhaCriptografada = await criptografarSenha(senha_funcionario);
        const dataAtual = new Date().toISOString().split('T')[0];

        await new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO funcionario 
                (id_func, nome, contacto, bi, status, id_user, id_cargo, data_criacao, data_atualizacao, senha, foto, email, codigo) 
                VALUES (?, ?, ?, ?, 'Ativo', ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            conexao.query(sql, [
                id_func, nome_funcionario.trim(), contacto_funcionario.trim(), bi_funcionario.trim(),
                idAdm, id_cargo, dataAtual, dataAtual, senhaCriptografada, foto, email_funcionario.trim(), codigo
            ], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });

        for (const doc of documentos) {
            const id_doc_func = gerarId();
            await new Promise((resolve, reject) => {
                const sql = `
                    INSERT INTO doc_funcionario 
                    (id_doc_func, titulo, doc, status, id_user, id_func, data_criacao, data_atualizacao) 
                    VALUES (?, ?, ?, 'Ativo', ?, ?, ?, ?)
                `;
                conexao.query(sql, [
                    id_doc_func, doc.originalname, doc.filename, idAdm, id_func, dataAtual, dataAtual
                ], (erro, resultado) => {
                    if (erro) reject(erro);
                    else resolve(resultado);
                });
            });
        }

        const emailEnviado = await enviarCredenciaisFuncionario(email_funcionario, nome_funcionario, senha_funcionario, cargo_funcionario);

        res.status(201).json({
            sucesso: true,
            mensagem: `Funcionario registrado com sucesso! ${emailEnviado.sucesso ? 'Credenciais enviadas por email.' : 'Erro ao enviar email.'}`,
            dados: { id: id_func, nome: nome_funcionario, email: email_funcionario, senha: senha_funcionario, codigo: codigo }
        });

    } catch (erro) {
        console.error("Erro ao registrar funcionario:", erro);
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        res.status(500).json({ sucesso: false, mensagem: "Erro interno ao registrar funcionario: " + erro.message });
    }
});

module.exports = router;