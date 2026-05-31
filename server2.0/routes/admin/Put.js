const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const verificarToken = require("../../middlewares/authMiddleware");
const { uploadFuncionario, deletarFotoFuncionario } = require("../../utils/upload");
const { criptografarSenha } = require("../../utils/senhas");

router.put("/funcionario/:id", verificarToken, uploadFuncionario.single("foto"), async (req, res) => {
    const { id } = req.params;
    const { nome, contacto, bi, cargo_funcionario, idAdm } = req.body;
    const novaFoto = req.file ? req.file.filename : null;
    const dataAtual = new Date().toISOString().split('T')[0];

    try {
        const checkFuncionario = await new Promise((resolve, reject) => {
            conexao.query("SELECT foto FROM funcionario WHERE id_func = ? AND status = 'Ativo'", [id], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (checkFuncionario.length === 0) {
            if (novaFoto) deletarFotoFuncionario(novaFoto);
            return res.status(404).json({ success: false, error: "Funcionario nao encontrado" });
        }
        const fotoAntiga = checkFuncionario[0].foto;

        const cargoResult = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_cargo FROM cargo WHERE cargo = ?", [cargo_funcionario], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (cargoResult.length === 0) {
            if (novaFoto) deletarFotoFuncionario(novaFoto);
            return res.status(400).json({ success: false, error: "Cargo nao encontrado" });
        }
        const id_cargo = cargoResult[0].id_cargo;

        const updateSql = `
            UPDATE funcionario 
            SET nome = ?, contacto = ?, bi = ?, id_cargo = ?, id_user = ?, data_atualizacao = ?, foto = COALESCE(?, foto) 
            WHERE id_func = ? AND status = 'Ativo'
        `;
        await new Promise((resolve, reject) => {
            conexao.query(updateSql, [nome.trim(), contacto.trim(), bi.trim(), id_cargo, idAdm, dataAtual, novaFoto, id], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });

        if (novaFoto && fotoAntiga) deletarFotoFuncionario(fotoAntiga);

        res.status(200).json({ success: true, message: "Funcionario atualizado com sucesso" });
    } catch (error) {
        if (novaFoto) deletarFotoFuncionario(novaFoto);
        res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
});

router.put("/funcionario/senha/:id", verificarToken, async (req, res) => {
    const { id } = req.params;
    const { senha_funcionario } = req.body;
    const dataAtual = new Date().toISOString().split('T')[0];

    try {
        const checkFuncionario = await new Promise((resolve, reject) => {
            conexao.query("SELECT nome FROM funcionario WHERE id_func = ?", [id], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (checkFuncionario.length === 0) return res.status(404).json({ success: false, error: "Funcionario nao encontrado" });

        const senhaCriptografada = await criptografarSenha(senha_funcionario);
        await new Promise((resolve, reject) => {
            conexao.query("UPDATE funcionario SET senha = ?, data_atualizacao = ? WHERE id_func = ?", [senhaCriptografada, dataAtual, id], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });
        res.status(200).json({ success: true, message: "Senha alterada com sucesso" });
    } catch (error) {
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
        const nome = checkFuncionario[0].nome;

        await new Promise((resolve, reject) => {
            conexao.query("UPDATE funcionario SET status = 'Desativado', data_atualizacao = ? WHERE id_func = ?", [dataAtual, id], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });
        res.status(200).json({ success: true, message: `Funcionario ${nome} desativado com sucesso` });
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
        const nome = checkFuncionario[0].nome;

        await new Promise((resolve, reject) => {
            conexao.query("UPDATE funcionario SET status = 'Ativo', data_atualizacao = ? WHERE id_func = ?", [dataAtual, id], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });
        res.status(200).json({ success: true, message: `Funcionario ${nome} ativado com sucesso` });
    } catch (error) {
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

module.exports = router;