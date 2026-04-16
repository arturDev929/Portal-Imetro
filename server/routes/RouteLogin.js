const express = require("express");
const router = express.Router();
const { login } = require("../controllers/auth.controller");

router.post("/", login);

module.exports = router;
router.get('/funcionarios', async (req, res) => {
    try {
        const funcionarios = await Funcionario.findAll({
            where: { estado_funcionario: 'Ativo' },
            order: [['nome_funcionario', 'ASC']],
            raw: true
        });

        for (const func of funcionarios) {
            const relacoes = await CargoFuncionarioRelation.findAll({
                where: { id_funcionario: func.id_funcionario },
                include: [{
                    model: CargoFuncionario,
                    as: 'cargo_funcionario',
                    attributes: ['id_cargo', 'cargo']
                }],
                raw: true,
                nest: true
            });
            func.cargos = relacoes.map(r => r.cargo_funcionario);
        }

        res.status(200).json(funcionarios);
    } catch (error) {
        console.error("Erro ao buscar funcionários:", error);
        res.status(500).json({ error: "Erro interno do servidor", details: error.message });
    }
});

router.get('/funcionariosDesativados', async (req, res) => {
    try {
        const funcionarios = await Funcionario.findAll({
            where: { estado_funcionario: 'Desativado' },
            order: [['nome_funcionario', 'ASC']],
            raw: true
        });

        for (const func of funcionarios) {
            const relacoes = await CargoFuncionarioRelation.findAll({
                where: { id_funcionario: func.id_funcionario },
                include: [{
                    model: CargoFuncionario,
                    as: 'cargo_funcionario',
                    attributes: ['id_cargo', 'cargo']
                }],
                raw: true,
                nest: true
            });
            func.cargos = relacoes.map(r => r.cargo_funcionario);
        }

        res.status(200).json(funcionarios);
    } catch (error) {
        console.error("Erro ao buscar funcionários desativados:", error);
        res.status(500).json({ error: "Erro interno do servidor", details: error.message });
    }
});

router.get('/funcionario/:id', async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({ error: "ID do funcionário inválido" });
    }
    try {
        const funcionario = await Funcionario.findOne({
            where: { id_funcionario: id },
            raw: true
        });
        
        if (!funcionario) {
            return res.status(404).json({ error: "Funcionário não encontrado" });
        }

        const relacoes = await CargoFuncionarioRelation.findAll({
            where: { id_funcionario: id },
            include: [{
                model: CargoFuncionario,
                as: 'cargo_funcionario',
                attributes: ['id_cargo', 'cargo']
            }],
            raw: true,
            nest: true
        });
        
        funcionario.cargos = relacoes.map(r => r.cargo_funcionario);
        
        res.status(200).json(funcionario);
    } catch (error) {
        console.error("Erro ao buscar funcionário:", error);
        res.status(500).json({ error: "Erro interno do servidor", details: error.message });
    }
});

router.get('/funcionariosPorCargo/:id_cargo', async (req, res) => {
    const { id_cargo } = req.params;
    if (!id_cargo || isNaN(id_cargo) || parseInt(id_cargo) <= 0) {
        return res.status(400).json({ error: "ID do cargo inválido" });
    }
    try {
        const relacoes = await CargoFuncionarioRelation.findAll({
            where: { id_cargo: id_cargo },
            include: [{
                model: Funcionario,
                as: 'funcionario',
                where: { estado_funcionario: 'Ativo' }
            }],
            raw: true,
            nest: true
        });

        const funcionarios = relacoes.map(r => r.funcionario).filter(f => f);
        res.status(200).json(funcionarios);
    } catch (error) {
        console.error("Erro ao buscar funcionários por cargo:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

router.get('/cargosFuncionarios', async (req, res) => {
    try {
        const relacoes = await CargoFuncionarioRelation.findAll({
            include: [
                { 
                    model: Funcionario, 
                    as: 'funcionario', 
                    where: { estado_funcionario: 'Ativo' },
                    attributes: []
                },
                { 
                    model: CargoFuncionario, 
                    as: 'cargo_funcionario',
                    attributes: ['cargo']
                }
            ],
            attributes: [
                [col('cargo_funcionario.cargo'), 'cargo'],
                [fn('COUNT', col('cargo_funcionario_relation.id_funcionario')), 'quantidade']
            ],
            group: ['cargo_funcionario.cargo'],
            order: [[literal('quantidade'), 'DESC']],
            limit: 100,
            raw: true
        });
        res.status(200).json(relacoes);
    } catch (error) {
        console.error("Erro ao buscar cargos de funcionários:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});