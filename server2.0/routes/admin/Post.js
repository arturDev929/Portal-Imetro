const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const verificarToken = require("../../middlewares/authMiddleware");
const { uploadCombinado, deletarFotoFuncionario, deletarDocumentoFuncionario } = require("../../utils/upload");
const { enviarCredenciaisFuncionario } = require("../../utils/email");
const { criptografarSenha, gerarId, gerarCodigo, gerarSenhaTemporaria } = require("../../utils/senhas");

router.post("/registrarfuncionario", verificarToken, uploadCombinado.fields([
    { name: "foto", maxCount: 1 },
    { name: "documentos", maxCount: 10 }
]), async (req, res) => {
    const { nome, contacto, bi, cargo, email, idAdm } = req.body;
    const foto = req.files?.foto ? req.files.foto[0].filename : null;
    const documentos = req.files?.documentos || [];
    const documentosTitulos = req.body.documentos_titulo || [];

    // Validações
    if (!nome?.trim()) {
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        return res.status(400).json({ sucesso: false, mensagem: "Nome é obrigatorio" });
    }
    if (!contacto?.trim()) {
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        return res.status(400).json({ sucesso: false, mensagem: "Contacto é obrigatorio" });
    }
    if (!bi?.trim()) {
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        return res.status(400).json({ sucesso: false, mensagem: "BI é obrigatorio" });
    }
    if (!cargo?.trim()) {
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        return res.status(400).json({ sucesso: false, mensagem: "Cargo é obrigatorio" });
    }
    if (!email?.trim()) {
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        return res.status(400).json({ sucesso: false, mensagem: "Email é obrigatorio" });
    }

    try {
        // Verificações de unicidade
        const verificarContacto = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_func FROM funcionario WHERE contacto = ?", [contacto.trim()], (erro, resultados) => {
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
            conexao.query("SELECT id_func FROM funcionario WHERE bi = ?", [bi.trim()], (erro, resultados) => {
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
            conexao.query("SELECT id_func FROM funcionario WHERE email = ?", [email.trim()], (erro, resultados) => {
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
            conexao.query("SELECT id_cargo FROM cargo WHERE cargo = ?", [cargo], (erro, resultados) => {
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

        // Inserir funcionário
        await new Promise((resolve, reject) => {
            const sql = `INSERT INTO funcionario (id_func, nome, contacto, bi, status, id_user, id_cargo, data_criacao, data_atualizacao, senha, foto, email, codigo) VALUES (?, ?, ?, ?, 'Ativo', ?, ?, ?, ?, ?, ?, ?, ?)`;
            conexao.query(sql, [id_func, nome.trim(), contacto.trim(), bi.trim(), idAdm, id_cargo, dataAtual, dataAtual, senhaCriptografada, foto, email.trim(), codigo], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });

        // Inserir documentos
        for (let i = 0; i < documentos.length; i++) {
            const doc = documentos[i];
            const titulo = documentosTitulos[i] || doc.originalname;
            const id_doc_func = gerarId();
            await new Promise((resolve, reject) => {
                const sql = `INSERT INTO doc_funcionario (id_doc_func, titulo, doc, status, id_user, id_func, data_criacao, data_atualizacao) VALUES (?, ?, ?, 'Ativo', ?, ?, ?, ?)`;
                conexao.query(sql, [id_doc_func, titulo, doc.filename, idAdm, id_func, dataAtual, dataAtual], (erro, resultado) => {
                    if (erro) reject(erro);
                    else resolve(resultado);
                });
            });
        }

        const emailEnviado = await enviarCredenciaisFuncionario(email, nome, senha_funcionario, cargo, codigo);

        res.status(201).json({
            sucesso: true,
            mensagem: `Funcionario registrado com sucesso! ${emailEnviado.sucesso ? 'Credenciais enviadas por email.' : 'Erro ao enviar email.'}`,
            dados: { id: id_func, nome, email, senha_original: senha_funcionario, codigo, cargo }
        });

    } catch (erro) {
        console.error("Erro ao registrar funcionario:", erro);
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        res.status(500).json({ sucesso: false, mensagem: "Erro interno ao registrar funcionario" });
    }
});

module.exports = router;