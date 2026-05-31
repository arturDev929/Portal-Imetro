const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const verificarToken = require("../../middlewares/authMiddleware");

router.get("/cargosDisponiveis", verificarToken, (req, res) => {
    const sql = "SELECT id_cargo, cargo FROM cargo WHERE status = 'Ativo' ORDER BY cargo ASC";
    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar cargos:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }
        res.status(200).json(result);
    });
});

router.get("/funcionarios", verificarToken, (req, res) => {
    const sql = `
        SELECT 
            f.id_func, f.nome, f.contacto, f.bi, f.status, f.foto, f.email,
            c.cargo
        FROM funcionario f
        INNER JOIN cargo c ON c.id_cargo = f.id_cargo
        WHERE f.status = 'Ativo'
        ORDER BY f.nome ASC
    `;
    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar funcionarios:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }
        const funcionarios = result.map(func => ({
            ...func,
            foto_url: func.foto ? `/api/img/funcionarios/${func.foto}` : null
        }));
        res.status(200).json(funcionarios);
    });
});

router.get("/funcionariosDesativados", verificarToken, (req, res) => {
    const sql = `
        SELECT 
            f.id_func, f.nome, f.contacto, f.bi, f.status, f.foto, f.email,
            c.cargo
        FROM funcionario f
        INNER JOIN cargo c ON c.id_cargo = f.id_cargo
        WHERE f.status = 'Desativado'
        ORDER BY f.nome ASC
    `;
    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar funcionarios desativados:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }
        const funcionarios = result.map(func => ({
            ...func,
            foto_url: func.foto ? `/api/img/funcionarios/${func.foto}` : null
        }));
        res.status(200).json(funcionarios);
    });
});

router.get("/funcionario/:id/documentos", verificarToken, (req, res) => {
    const { id } = req.params;
    const sql = "SELECT id_doc_func, titulo, doc, status, data_criacao FROM doc_funcionario WHERE id_func = ? AND status = 'Ativo'";
    conexao.query(sql, [id], (error, result) => {
        if (error) {
            console.error("Erro ao buscar documentos:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }
        const documentos = result.map(doc => ({
            ...doc,
            url: `/api/img/funcionarios/documentos/${doc.doc}`
        }));
        res.status(200).json(documentos);
    });
});

router.get("/estatisticasFuncionarios", verificarToken, (req, res) => {
    const sql = "SELECT COUNT(*) as totalFuncionarios FROM funcionario WHERE status = 'Ativo'";
    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar estatisticas:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }
        res.status(200).json(result[0] || { totalFuncionarios: 0 });
    });
});

router.get("/estatisticasFuncionariosDesativados", verificarToken, (req, res) => {
    const sql = "SELECT COUNT(*) as totalFuncionariosDesativados FROM funcionario WHERE status = 'Desativado'";
    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar estatisticas:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }
        res.status(200).json(result[0] || { totalFuncionariosDesativados: 0 });
    });
});

router.get("/dashboardFuncionarios", verificarToken, (req, res) => {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM funcionario WHERE status = 'Ativo') as ativos,
            (SELECT COUNT(*) FROM funcionario WHERE status = 'Desativado') as desativados,
            (SELECT COUNT(*) FROM funcionario) as total
    `;
    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar dashboard:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }
        const dados = result[0] || { ativos: 0, desativados: 0, total: 0 };
        const total = dados.total || 1;
        const percentAtivos = ((dados.ativos / total) * 100).toFixed(1);
        const percentDesativados = ((dados.desativados / total) * 100).toFixed(1);
        res.status(200).json({
            ...dados,
            percentAtivos,
            percentDesativados,
            dadosGrafico: [
                { nome: "Ativos", valor: dados.ativos, cor: "#003366" },
                { nome: "Desativados", valor: dados.desativados, cor: "#DC143C" }
            ]
        });
    });
});

router.get("/cargosFuncionarios", verificarToken, (req, res) => {
    const sql = `
        SELECT c.cargo, COUNT(*) as quantidade
        FROM funcionario f
        INNER JOIN cargo c ON c.id_cargo = f.id_cargo
        WHERE f.status = 'Ativo'
        GROUP BY c.cargo
        ORDER BY quantidade DESC
    `;
    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar cargos:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }
        res.status(200).json(result);
    });
});

module.exports = router;