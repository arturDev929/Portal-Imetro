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

router.get("/funcionarios", (req, res) => {
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
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const funcionarios = result.map(func => ({
            ...func,
            foto_url: func.foto ? `${baseUrl}/api/img/funcionarios/${func.foto}` : null
        }));
        res.status(200).json(funcionarios);
    });
});

router.get("/funcionariosDesativados", verificarToken, (req, res) => {
    console.log("Buscando funcionários desativados...");
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
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const funcionarios = result.map(func => ({
            id_funcionario: func.id_func,
            nome_funcionario: func.nome,
            contacto_funcionario: func.contacto,
            bi_funcionario: func.bi,
            status: func.status,
            foto: func.foto,
            email: func.email,
            cargo: func.cargo,
            foto_url: func.foto ? `${baseUrl}/api/img/funcionarios/${func.foto}` : null
        }));
        console.log(`Encontrados ${funcionarios.length} funcionários desativados`);
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
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const documentos = result.map(doc => ({
            ...doc,
            url: `${baseUrl}/api/img/funcionarios/documentos/${doc.doc}`
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

// Buscar todos funcionários ativos
router.get("/funcionarios", verificarToken, (req, res) => {
    const sql = `
        SELECT f.id_func, f.nome, f.contacto, f.bi, f.status, f.foto, f.email, c.cargo
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
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const funcionarios = result.map(func => ({
            ...func,
            foto_url: func.foto ? `${baseUrl}/api/img/funcionarios/${func.foto}` : null
        }));
        res.status(200).json(funcionarios);
    });
});

// Buscar funcionários desativados
router.get("/funcionariosDesativados", verificarToken, (req, res) => {
    const sql = `
        SELECT f.id_func, f.nome, f.contacto, f.bi, f.status, f.foto, f.email, c.cargo
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
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const funcionarios = result.map(func => ({
            id_funcionario: func.id_func,
            nome_funcionario: func.nome,
            contacto_funcionario: func.contacto,
            bi_funcionario: func.bi,
            email: func.email,
            cargo: func.cargo,
            status: func.status,
            foto: func.foto,
            foto_url: func.foto ? `${baseUrl}/api/img/funcionarios/${func.foto}` : null
        }));
        res.status(200).json(funcionarios);
    });
});

// Buscar informações completas de um funcionário
router.get("/funcionario/info/:id", verificarToken, async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `
            SELECT f.id_func, f.nome, f.contacto, f.bi, f.email, f.status, f.foto, f.data_criacao, f.data_atualizacao, c.cargo, u.nome as criado_por
            FROM funcionario f
            INNER JOIN cargo c ON c.id_cargo = f.id_cargo
            LEFT JOIN funcionario u ON u.id_func = f.id_user
            WHERE f.id_func = ?
        `;
        const funcionario = await new Promise((resolve, reject) => {
            conexao.query(sql, [id], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (funcionario.length === 0) {
            return res.status(404).json({ success: false, error: "Funcionário não encontrado" });
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        res.status(200).json({
            success: true,
            funcionario: {
                ...funcionario[0],
                foto_url: funcionario[0].foto ? `${baseUrl}/api/img/funcionarios/${funcionario[0].foto}` : null
            }
        });
    } catch (error) {
        console.error("Erro ao buscar informações:", error);
        res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
});

// Buscar documentos do funcionário
router.get("/funcionario/documentos/:id", verificarToken, async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `SELECT id_doc_func as id_doc, titulo, doc, data_criacao as data_upload FROM doc_funcionario WHERE id_func = ? ORDER BY data_criacao DESC`;
        const documentos = await new Promise((resolve, reject) => {
            conexao.query(sql, [id], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const documentosComUrl = documentos.map(doc => ({
            ...doc,
            doc_url: doc.doc ? `${baseUrl}/api/img/funcionarios/documentos/${doc.doc}` : null
        }));
        res.status(200).json({ success: true, documentos: documentosComUrl });
    } catch (error) {
        console.error("Erro ao buscar documentos:", error);
        res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
});

router.get('/estatisticasProfessores', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as totalProfessores,
            COUNT(CASE WHEN titulacao IS NOT NULL AND titulacao != '' THEN 1 END) as professoresComTitulacao
        FROM professor WHERE status = 'Ativo' LIMIT 100
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar estatísticas de professores:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json(result[0] || {});
        }
    });
});

router.get('/estatisticasProfessoresDesativados', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as totalProfessoresDesativados,
            COUNT(CASE WHEN titulacao IS NOT NULL AND titulacao != '' THEN 1 END) as desativadosComTitulacao
        FROM professor WHERE status = 'Desativado' LIMIT 100
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar estatísticas de professores desativados:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json(result[0] || {});
        }
    });
});

router.get('/distribuicaoTitulacao', (req, res) => {
    const sql = `
        SELECT 
            IFNULL(titulacao, 'Não informado') as titulacao,
            COUNT(*) as quantidade
        FROM professor  WHERE status = 'Ativo'
        GROUP BY IFNULL(titulacao, 'Não informado')
        ORDER BY quantidade DESC LIMIT 100
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar distribuição por titulação:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json(result);
        }
    });
});

router.get('/distribuicaoTitulacaoDesativados', (req, res) => {
    const sql = `
        SELECT 
            IFNULL(titulacao, 'Não informado') as titulacao,
            COUNT(*) as quantidade
        FROM professor
        WHERE status = 'Desativado'
        GROUP BY IFNULL(titulacao, 'Não informado')
        ORDER BY quantidade DESC LIMIT 100
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar distribuição por titulação de desativados:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json(result);
        }
    });
});

router.get('/Professores', (req, res) => {
    const sql = "SELECT * FROM professor WHERE status = 'Ativo' ORDER BY nome ASC";
    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar professores:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const professoresComFoto = result.map(professor => ({
                ...professor,
                fotoUrl: professor.foto ? `${baseUrl}/api/img/professores/${professor.foto}` : null
            }))
            res.status(200).json(professoresComFoto);
        }
    });
});

router.get('/disciplinasMaisMinistradas', (req, res) => {
    const sql = `
        SELECT 
            d.disciplina,
            COUNT(DISTINCT dp.id_professor) as totalProfessores,
            GROUP_CONCAT(DISTINCT p.nome SEPARATOR ', ') as professoresNomes
        FROM disc_professor dp
        INNER JOIN disciplina d ON dp.id_disciplina = d.id_disciplina
        INNER JOIN professor p ON dp.id_professor = p.id_professor 
        WHERE p.status = 'Ativo'
        GROUP BY d.id_disciplina, d.disciplina
        HAVING totalProfessores > 0
        ORDER BY totalProfessores DESC
        LIMIT 10
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar disciplinas mais ministradas:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json(result);
        }
    });
});

router.get('/professoresSemDisciplinas', (req, res) => {
    const sql = `
        SELECT 
            p.id_professor,
            p.nome,
            p.titulacao
        FROM professor p
        LEFT JOIN disc_professor dp ON p.id_professor = dp.id_professor
        WHERE dp.id_professor IS NULL AND p.status = 'Ativo'
        ORDER BY p.nome ASC LIMIT 100
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar professores sem disciplinas:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json(result);
        }
    });
});

router.get('/ProfessoresDesativados', (req, res) => {
    const sql = "SELECT * FROM professor WHERE status = 'Desativado' ORDER BY nome ASC";
    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar professores:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const professoresComFoto = result.map(professor => ({
                ...professor,
                fotoUrl: professor.foto ? `${baseUrl}/api/img/professores/${professor.foto}` : null
            }))
            res.status(200).json(professoresComFoto);
        }
    });
});

router.get('/InformacoesProfessor/:id', async (req, res) => {
    const { id } = req.params;

    const sqlProfessor = `
        SELECT 
            p.id_professor,
            p.nome,
            p.foto,
            p.codigo,
            p.genero,
            p.nacionalidade,
            p.estadocivil,
            p.nomepai,
            p.nomemae,
            p.bi,
            p.data_nascimento,
            p.contacto,
            p.whatsapp,
            p.email,
            p.anoexperienca,
            p.titulacao,
            p.data_admissao,
            p.tiposangue,
            p.iban,
            p.contactoemergencia,
            fp.nome,
            fp.ficheiro
        FROM professor p INNER JOIN ficheiro_prof fp ON p.id_professor=fp.id_professor
        WHERE p.id_professor = ?
    `;

    const sqlDisciplinas = `
        SELECT 
            d.id_disciplina,
            d.disciplina
        FROM disc_professor dp
        INNER JOIN disciplina d ON dp.id_disciplina = d.id_disciplina
        WHERE dp.id_professor = ?
        ORDER BY d.disciplina ASC
    `;

    conexao.query(sqlProfessor, [id], (error, professorResult) => {
        if (error) {
            console.error("Erro ao buscar dados do professor:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        }

        if (professorResult.length === 0) {
            return res.status(404).json({ error: "Professor não encontrado" });
        }

        const professor = professorResult[0];

        conexao.query(sqlDisciplinas, [id], (error, disciplinasResult) => {
            if (error) {
                console.error("Erro ao buscar disciplinas:", error);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: error.message
                });
            }

            let curriculoUrl = null;
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            if (professor.ficheiro) {
                curriculoUrl = `${baseUrl}/api/img/professores/DocBI/${professor.ficheiro}`;
            }

            const professorCompleto = {
                ...professor,
                fotoUrl: professor.foto ?
                    `${baseUrl}/api/img/professores/${professor.foto}` :
                    '/default-avatar.png',
                curriculoUrl: curriculoUrl,
                datanascimentoFormatada: professor.datanascimentoprofessor ?
                    new Date(professor.datanascimentoprofessor).toISOString().split('T')[0] :
                    null,
                dataadmissaoFormatada: professor.dataadmissaoprofessor ?
                    new Date(professor.dataadmissaoprofessor).toISOString().split('T')[0] :
                    null,
                disciplinas: disciplinasResult
            };

            res.status(200).json(professorCompleto);
        });
    });
});

router.get('/professorVinculadoDisciplinas/:id', async (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT 
            df.id_dp,
            d.disciplina,
            d.id_disciplina
        FROM disc_professor df
        INNER JOIN disciplina d ON df.id_disciplina = d.id_disciplina LIMIT 100
        WHERE df.id_professor = ?
        ORDER BY d.disciplina ASC
    `;

    conexao.query(sql, [id], (error, result) => {
        if (error) {
            console.error("Erro ao buscar disciplinas vinculadas:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        }

        res.status(200).json(result);
    });
});

module.exports = router;