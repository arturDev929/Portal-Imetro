const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const verificarToken = require("../../middlewares/authMiddleware");

router.get("/cargosDisponiveis", verificarToken, (req, res) => {
    const sql = "SELECT id_cargo, cargo FROM cargo WHERE status = 'Ativo' ORDER BY cargo ASC";
    conexao.query(sql, (error, result) => {
        if (error) {
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
    const sql = `
        SELECT 
            f.id_func AS id_funcionario,
            f.nome AS nome_funcionario,
            f.contacto AS contacto_funcionario,
            f.bi AS bi_funcionario,
            f.email,
            f.foto,
            f.status,
            c.cargo
        FROM funcionario f
        INNER JOIN cargo c ON c.id_cargo = f.id_cargo
        WHERE f.status = 'Desativado'
        ORDER BY f.nome ASC
    `;
    conexao.query(sql, (error, result) => {
        if (error) {
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

router.get("/funcionario/:id/documentos", verificarToken, (req, res) => {
    const { id } = req.params;
    const sql = "SELECT id_doc_func, titulo, doc, status, data_criacao FROM doc_funcionario WHERE id_func = ? AND status = 'Ativo'";
    conexao.query(sql, [id], (error, result) => {
        if (error) {
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
            return res.status(500).json({ error: "Erro interno do servidor" });
        }
        res.status(200).json(result[0] || { totalFuncionarios: 0 });
    });
});

router.get("/estatisticasFuncionariosDesativados", verificarToken, (req, res) => {
    const sql = "SELECT COUNT(*) as totalFuncionariosDesativados FROM funcionario WHERE status = 'Desativado'";
    conexao.query(sql, (error, result) => {
        if (error) {
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
            return res.status(500).json({ error: "Erro interno do servidor" });
        }
        res.status(200).json(result);
    });
});

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
    const sql = `
        SELECT f.id_func, f.nome, f.contacto, f.bi, f.status, f.foto, f.email, c.cargo
        FROM funcionario f
        INNER JOIN cargo c ON c.id_cargo = f.id_cargo
        WHERE f.status = 'Desativado'
        ORDER BY f.nome ASC
    `;
    conexao.query(sql, (error, result) => {
        if (error) {
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
        res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
});

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
        res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
});

router.get("/professorDocumentos/:id", verificarToken, async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `SELECT id_ficheiro, ficheiro, status, data_actualizacao, nome
                     FROM ficheiro_prof 
                     WHERE id_professor = ? 
                     ORDER BY data_actualizacao DESC`;
        
        const documentos = await new Promise((resolve, reject) => {
            conexao.query(sql, [id], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const documentosComUrl = documentos.map(doc => ({
            ...doc,
            doc_url: doc.nome ? `${baseUrl}/api/img/professores/documentos/${doc.nome}` : null,
            ficheiro_url: doc.ficheiro ? `${baseUrl}/api/img/professores/documentos/${doc.ficheiro}` : null
        }));
        
        res.status(200).json({ success: true, documentos: documentosComUrl });
    } catch (error) {
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
    const sql = "SELECT * FROM professor p INNER JOIN contrato c ON p.id_contrato = c.id_contrato WHERE p.status = 'Ativo' ORDER BY p.nome ASC";
    conexao.query(sql, (error, result) => {
        if (error) {
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

router.get('/professorInfo/:id_professor', (req, res) => {
    const { id_professor } = req.params;
    
    const sqlProfessor = `
        SELECT p.*, c.contrato 
        FROM professor p 
        INNER JOIN contrato c ON p.id_contrato = c.id_contrato 
        WHERE p.id_professor = ?
    `;
    
    conexao.query(sqlProfessor, [id_professor], (error, professorResult) => {
        if (error) {
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        }
        
        if (professorResult.length === 0) {
            return res.status(404).json({
                error: "Professor não encontrado"
            });
        }
        
        const professor = professorResult[0];
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        const formatarData = (data) => {
            if (!data) return null;
            if (data instanceof Date) {
                const ano = data.getFullYear();
                const mes = String(data.getMonth() + 1).padStart(2, '0');
                const dia = String(data.getDate()).padStart(2, '0');
                return `${ano}-${mes}-${dia}`;
            }
            try {
                const dataObj = new Date(data);
                if (!isNaN(dataObj.getTime())) {
                    const ano = dataObj.getFullYear();
                    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
                    const dia = String(dataObj.getDate()).padStart(2, '0');
                    return `${ano}-${mes}-${dia}`;
                }
            } catch (e) {}
            return data;
        };

        const professorFormatado = {
            ...professor,
            data_nascimento: formatarData(professor.data_nascimento),
            data_admissao: formatarData(professor.data_admissao),
            fotoUrl: professor.foto ? `${baseUrl}/api/img/professores/${professor.foto}` : null
        };

        const sqlDocumentos = "SELECT id_ficheiro, ficheiro, nome, data_actualizacao FROM ficheiro_prof WHERE id_professor = ? ORDER BY nome DESC";
        
        conexao.query(sqlDocumentos, [id_professor], (errorDocs, documentosResult) => {
            if (errorDocs) {
            }
            
            const documentos = (documentosResult || []).map(doc => ({
                id_ficheiro: doc.id_ficheiro,
                titulo: doc.ficheiro,
                nome_arquivo: doc.nome,
                data_upload: doc.data_actualizacao,
                doc_url: `${baseUrl}/api/img/professores/documentos/${doc.nome}`
            }));
            
            const professorCompleto = {
                ...professorFormatado,
                documentos: documentos
            };
            
            res.status(200).json(professorCompleto);
        });
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
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        }

        res.status(200).json(result);
    });
});

router.get('/contratos', (req, res) => {
    const sql = `SELECT id_contrato,contrato FROM contrato WHERE status = 'Ativo' ORDER BY contrato ASC`;
    conexao.query(sql, (error, result) => {
        if (error) {
            return res.status(500).json({ error: "Erro interno do servidor" });
        }
        res.status(200).json(result);
    });
});

router.get('/ProfessoresDesativado', (req, res) => {
    const sql = "SELECT * FROM professor p INNER JOIN contrato c ON p.id_contrato = c.id_contrato WHERE p.status = 'Eliminado' ORDER BY p.nome ASC";
    conexao.query(sql, (error, result) => {
        if (error) {
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

router.get('/totalcategoriacurso', (req, res) => {
    const sql = "SELECT COUNT(*) as total_categorias FROM categoria";
    conexao.query(sql, (error, results) => {
        if (error) {
            console.log("Erro ao buscar categorias: ", error);
            res.status(500).json({
                erroe: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.json(results)
        }
    })
});

router.get('/totallicenciaturas', (req, res) => {
    const sql = "SELECT COUNT(*) as total_licenciaturas FROM curso";
    conexao.query(sql, (error, results) => {
        if (error) {
            console.log("Erro ao buscar licenciaturas: ", error);
            res.status(500).json({
                erroe: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.json(results)
        }
    })
});

router.get('/totaldisciplina', (req, res) => {
    const sql = "SELECT COUNT(*) as total_disciplinas FROM disciplina";
    conexao.query(sql, (error, results) => {
        if (error) {
            console.log("Erro ao buscar disciplinas: ", error);
            res.status(500).json({
                erroe: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.json(results)
        }
    })
});

router.get('/dadosGraficosCategoria', (req, res) => {
    const sql = "SELECT c.categoria, COUNT(cs.id_curso) as total_cursos FROM categoria c LEFT JOIN curso cs ON c.id_categoria = cs.id_categoria GROUP BY c.id_categoria, c.categoria ORDER BY total_cursos DESC";

    conexao.query(sql, (error, results) => {
        if (error) {
            console.log("Erro ao buscar dados para gráfico: ", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.json(results);
        }
    });
});

router.get('/totalDisciplinasPorCurso', (req, res) => {
    const sql = `
        SELECT 
            c.curso,
            c.id_curso,
            COUNT(s.id_semestre) as total_disciplinas
        FROM curso c
        INNER JOIN semestre s ON c.id_curso = s.id_curso
        GROUP BY c.id_curso, c.curso
        ORDER BY total_disciplinas DESC
    `;

    conexao.query(sql, (error, results) => {
        if (error) {
            console.log("Erro ao buscar total de disciplinas por curso: ", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.json(results);
        }
    });
});

router.get('/categoriaCurso', (req, res) => {
    const sql = "SELECT id_categoria as idcategoriacurso, categoria as categoriacurso FROM categoria ORDER BY categoria ASC";
    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar categorias:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json(result);
        }
    });
});

router.get('/Cursos', (req, res) => {
    const sql = "SELECT *FROM curso c INNER JOIN categoria ct ON ct.id_categoria = c.id_categoria ORDER BY categoria ASC";
    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar cursos:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json(result);
        }
    });
});

router.get('/anoCurricular/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT id_anocurricular, ano, id_curso FROM anocurricular WHERE id_curso = ? ORDER BY ano DESC";

    conexao.query(sql, [id], (error, result) => {
        if (error) {
            console.error("Erro ao buscar anos curriculares:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json(result);
        }
    });
});

router.get('/disciplinasPorCurso/:idcurso', (req, res) => {
    const { idcurso } = req.params;

    const sql = `
        SELECT 
            d.id_disciplina,
            d.disciplina,
            s.id_semestre,
            s.semestre,
            a.ano,
            c.curso,
            cc.categoria
        FROM semestre s
        INNER JOIN disciplina d ON s.id_disciplina = d.id_disciplina
        INNER JOIN anocurricular a ON s.id_anocurricular = a.id_anocurricular
        INNER JOIN curso c ON s.id_curso = c.id_curso
        INNER JOIN categoria cc ON s.id_categoria = cc.id_categoria
        WHERE s.id_curso = ?
        ORDER BY a.ano ASC, s.semestre ASC, d.disciplina ASC
    `;

    conexao.query(sql, [idcurso], (error, result) => {
        if (error) {
            console.error("Erro ao buscar disciplinas do curso:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            const sqlCurso = "SELECT c.curso, cc.categoria FROM curso c INNER JOIN categoria cc ON c.id_categoria = cc.id_categoria WHERE c.id_curso = ?";
            
            conexao.query(sqlCurso, [idcurso], (errorCurso, resultCurso) => {
                if (errorCurso) {
                    console.error("Erro ao buscar informações do curso:", errorCurso);
                    return res.status(500).json({
                        error: "Erro interno do servidor",
                        details: errorCurso.message
                    });
                }

                const cursoInfo = resultCurso[0] || { curso: 'Curso não identificado', categoria: '' };

                if (result.length === 0) {
                    return res.status(200).json({
                        curso: cursoInfo.curso || 'Curso não identificado',
                        categoria: cursoInfo.categoria || '',
                        totalDisciplinas: 0,
                        disciplinas: {}
                    });
                }

                const disciplinasAgrupadas = result.reduce((acc, disciplina) => {
                    const anoKey = `Ano ${disciplina.ano}`;

                    if (!acc[anoKey]) {
                        acc[anoKey] = {};
                    }

                    const semestreKey = `Semestre ${disciplina.semestre}`;

                    if (!acc[anoKey][semestreKey]) {
                        acc[anoKey][semestreKey] = [];
                    }

                    acc[anoKey][semestreKey].push({
                        id: disciplina.id_disciplina,
                        idsemestre: disciplina.id_semestre,
                        nome: disciplina.disciplina
                    });

                    return acc;
                }, {});

                res.status(200).json({
                    curso: cursoInfo.curso || 'Curso não identificado',
                    categoria: cursoInfo.categoria || '',
                    totalDisciplinas: result.length,
                    disciplinas: disciplinasAgrupadas
                });
            });
        }
    });
});

router.get('/Disciplinas', (req, res) => {
    const sql = "SELECT id_disciplina, disciplina FROM disciplina ORDER BY disciplina ASC";
    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar disciplinas:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json(result);
        }
    });
});

router.get('/professorVinculado/:id', async (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT 
            dp.id_dp,
            p.nome,
            p.foto,
            p.id_professor,
            p.titulacao,
            d.disciplina,
            d.id_disciplina
        FROM disc_professor dp
        INNER JOIN disciplina d ON dp.id_disciplina = d.id_disciplina 
        INNER JOIN professor p ON p.id_professor = dp.id_professor 
        WHERE d.id_disciplina = ? AND p.status = 'Ativo'
        ORDER BY p.nome ASC
    `;

    conexao.query(sql, [id], (error, result) => {
        if (error) {
            console.error("Erro ao buscar professores vinculados:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const professoresComFoto = result.map(a => ({
                ...a,
                fotoUrl: a.foto ? `${baseUrl}/api/img/professores/${a.foto}` : null
            }));
            res.status(200).json(professoresComFoto);
        }
    });
});

router.get('/professorDisponivel/:id', async (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT 
            p.id_professor,
            p.nome,
            p.titulacao,
            p.foto
        FROM professor p
        WHERE p.status = 'Ativo' AND p.id_professor NOT IN (
            SELECT dp.id_professor 
            FROM disc_professor dp
            WHERE dp.id_disciplina = ?
        )
        ORDER BY p.nome ASC
    `;

    conexao.query(sql, [id], (error, result) => {
        if (error) {
            console.error("Erro ao buscar professores disponíveis:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const professoresComFoto = result.map(a => ({
                ...a,
                fotoUrl: a.foto ? `${baseUrl}/api/img/professores/${a.foto}` : null
            }));
            res.status(200).json(professoresComFoto);
        }
    });
});

router.get('/turmas', async (req, res) => {
    const sql = `SELECT 
                    p.id_periodo,
                    p.id_turma,
                    p.id_anocurricular,
                    p.periodo,
                    t.turma,
                    t.id_curso,
                    al.id_anoletivo,
                    al.ano AS anoletivo,
                    al.status_inscricao,
                    al.status AS status_anoletivo,
                    cat.id_categoria,
                    cat.categoria AS categoriacurso,
                    c.curso,
                    ac.ano AS anocurricular
                FROM periodo p
                INNER JOIN turma t ON p.id_turma = t.id_turma
                INNER JOIN curso c ON t.id_curso = c.id_curso
                INNER JOIN categoria cat ON c.id_categoria = cat.id_categoria
                LEFT JOIN anoletivo al ON p.id_periodo = al.id_periodo
                LEFT JOIN anocurricular ac ON p.id_anocurricular = ac.id_anocurricular
                WHERE t.status = 'Ativo' AND p.status = 'Ativo'
                ORDER BY 
                    cat.categoria ASC,
                    c.curso ASC,
                    ac.ano ASC,
                    t.turma ASC,
                    p.periodo ASC`;
                    
    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar turmas:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json(result);
        }
    });
});

router.get('/disciplinasPorTurma/:idperiodo/:anocurricular', (req, res) => {
    const { idperiodo, anocurricular } = req.params;
    const query = `
        SELECT DISTINCT
            d.id_disciplina,
            d.disciplina,
            a.ano AS anocurricular,
            s.semestre
        FROM curso c
        INNER JOIN turma t ON t.id_curso = c.id_curso
        INNER JOIN periodo p ON p.id_turma = t.id_turma
        INNER JOIN semestre s ON s.id_curso = c.id_curso
        INNER JOIN disciplina d ON d.id_disciplina = s.id_disciplina
        INNER JOIN anocurricular a ON a.id_anocurricular = s.id_anocurricular
        WHERE p.id_periodo = ? 
        AND a.ano = ?
        ORDER BY s.semestre ASC, d.disciplina ASC
    `;

    conexao.query(query, [idperiodo, anocurricular], (error, results) => {
        if (error) {
            console.error("Erro ao buscar disciplinas da turma:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        }

        res.status(200).json(results);
    });
});

router.get('/professoresPorDisciplina/:iddisciplina', (req, res) => {
    const { iddisciplina } = req.params;

    if (!iddisciplina) {
        return res.status(400).json({
            error: 'ID da disciplina não informado'
        });
    }

    const query = `
        SELECT 
            p.id_professor,
            p.nome AS nome,
            p.email AS email,
            p.titulacao AS especialidade
        FROM disc_professor dp
        INNER JOIN professor p ON p.id_professor = dp.id_professor
        WHERE dp.id_disciplina = ? AND p.status = 'Ativo'
        ORDER BY p.nome ASC
    `;

    conexao.query(query, [iddisciplina], (error, results) => {
        if (error) {
            console.error("Erro ao buscar professores da disciplina:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        }

        res.status(200).json(results);
    });
});

router.get('/CategoriaCursosAno', (req, res) => {
    const sql = `
        SELECT 
            cat.id_categoria,
            cat.categoria,
            c.id_curso,
            c.curso,
            ac.id_anocurricular,
            ac.ano AS anocurricular
        FROM categoria cat
        INNER JOIN curso c ON cat.id_categoria = c.id_categoria
        INNER JOIN anocurricular ac ON c.id_curso = ac.id_curso
        WHERE cat.status = 'Ativo' 
          AND c.status = 'Ativo' 
          AND ac.status = 'Ativo'
        ORDER BY cat.categoria ASC, ac.ano ASC, c.curso ASC
        LIMIT 500
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar dados combinados:", error);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno ao buscar dados",
                detalhes: error.message
            });
        }

        const dadosAgrupados = [];
        const mapaCategorias = {};

        result.forEach(item => {
            if (!mapaCategorias[item.id_categoria]) {
                mapaCategorias[item.id_categoria] = {
                    id_categoria: item.id_categoria,
                    categoria: item.categoria,
                    cursos: []
                };
                dadosAgrupados.push(mapaCategorias[item.id_categoria]);
            }

            const categoria = mapaCategorias[item.id_categoria];
            let cursoExistente = categoria.cursos.find(c => c.id_curso === item.id_curso);

            if (!cursoExistente) {
                cursoExistente = {
                    id_curso: item.id_curso,
                    curso: item.curso,
                    anos_curriculares: []
                };
                categoria.cursos.push(cursoExistente);
            }

            cursoExistente.anos_curriculares.push({
                id_anocurricular: item.id_anocurricular,
                anocurricular: item.anocurricular
            });
        });

        return res.status(200).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Dados carregados com sucesso",
            total: dadosAgrupados.length,
            dados: dadosAgrupados
        });
    });
});

router.get('/Disciplinas', (req, res) => {
    console.log('=== ROTA /Disciplinas chamada ===');
    
    const sql = "SELECT id_disciplina, disciplina FROM disciplina WHERE status = 'Ativo' ORDER BY disciplina ASC";
    
    conexao.query(sql, (error, result) => {
        if (error) {
            console.error('ERRO na query:', error);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno ao buscar disciplinas",
                detalhes: error.message
            });
        }
        
        console.log('Resultado da query:');
        console.log('  - Tipo:', typeof result);
        console.log('  - É array?', Array.isArray(result));
        console.log('  - Quantidade:', result ? result.length : 0);
        console.log('  - Primeiro item:', result && result.length > 0 ? result[0] : 'Nenhum');
        
        const dados = result || [];
        
        const resposta = {
            sucesso: true,
            tipo: "sucesso",
            titulo: "Disciplinas carregadas",
            mensagem: `${dados.length} disciplina(s) encontrada(s)`,
            dados: dados,
            total: dados.length
        };
        
        console.log('Resposta enviada:', resposta);
        
        return res.status(200).json(resposta);
    });
});

router.get('/turmasComPeriodos', (req, res) => {
    const sql = `
        SELECT 
            t.id_turma,
            t.turma,
            t.status AS status_turma,
            p.id_periodo,
            p.periodo,
            p.status AS status_periodo,
            al.status_inscricao,
            al.status AS status_anoletivo
        FROM turma t
        INNER JOIN periodo p ON t.id_turma = p.id_turma
        LEFT JOIN anoletivo al ON p.id_periodo = al.id_periodo
        WHERE t.status = 'Ativo' AND p.status = 'Ativo'
        ORDER BY t.turma ASC, p.periodo ASC
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar turmas com períodos:", error);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno ao buscar turmas",
                detalhes: error.message
            });
        }

        const turmasAgrupadas = {};
        
        result.forEach(item => {
            const key = item.id_turma;
            
            if (!turmasAgrupadas[key]) {
                turmasAgrupadas[key] = {
                    id_turma: item.id_turma,
                    turma: item.turma,
                    status_turma: item.status_turma,
                    status_inscricao: item.status_inscricao || 'Fechado',
                    status_anoletivo: item.status_anoletivo || 'Ativo',
                    periodos: []
                };
            }

            turmasAgrupadas[key].periodos.push({
                id_periodo: item.id_periodo,
                periodo: item.periodo,
                status_periodo: item.status_periodo
            });
        });

        const resultadoFinal = Object.values(turmasAgrupadas);

        return res.status(200).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Turmas carregadas com sucesso",
            total: resultadoFinal.length,
            totalPeriodos: result.length,
            dados: resultadoFinal
        });
    });
});

router.get('/turmasSimples', (req, res) => {
    const sql = `
        SELECT 
            t.id_turma,
            t.turma,
            p.id_periodo,
            p.periodo,
            al.status_inscricao,
            al.status AS status_anoletivo
        FROM turma t
        INNER JOIN periodo p ON t.id_turma = p.id_turma
        LEFT JOIN anoletivo al ON p.id_periodo = al.id_periodo
        WHERE t.status = 'Ativo' AND p.status = 'Ativo'
        ORDER BY t.turma ASC, p.periodo ASC
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar turmas:", error);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno ao buscar turmas",
                detalhes: error.message
            });
        }

        return res.status(200).json({
            sucesso: true,
            dados: result,
            total: result.length
        });
    });
});

router.get('/professoresPorTurma/:idperiodo', async (req, res) => {
    const { idperiodo } = req.params;

    if (!idperiodo) {
        return res.status(400).json({
            error: 'ID do período não informado'
        });
    }

    const query = `
        SELECT DISTINCT
            p.id_professor,
            p.nome,
            p.email,
            p.titulacao,
            p.foto,
            d.disciplina,
            dp.id_dp
        FROM prof_turma_disc ptd
        INNER JOIN disc_professor dp ON ptd.id_dp = dp.id_dp
        INNER JOIN professor p ON dp.id_professor = p.id_professor
        INNER JOIN disciplina d ON dp.id_disciplina = d.id_disciplina
        WHERE ptd.id_periodo = ? 
        AND ptd.status = 'Ativo'
        AND p.status = 'Ativo'
        ORDER BY p.nome ASC
    `;

    conexao.query(query, [idperiodo], (error, results) => {
        if (error) {
            console.error("Erro ao buscar professores da turma:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const professoresComFoto = results.map(prof => ({
            ...prof,
            foto_url: prof.foto ? `${baseUrl}/api/img/professores/${prof.foto}` : null
        }));

        res.status(200).json(professoresComFoto);
    });
});

router.get('/turmasComAnoLetivo', async (req, res) => {
    const sql = `SELECT 
                    p.id_periodo,
                    p.periodo,
                    t.turma,
                    al.ano AS anoletivo,
                    al.id_anoletivo,
                    al.status_inscricao,
                    al.status AS status_anoletivo,
                    cat.categoria AS categoriacurso,
                    cat.id_categoria,
                    c.curso,
                    c.id_curso,
                    ac.ano AS anocurricular,
                    ac.id_anocurricular,
                    p.id_periodo AS id_periodo_original
                FROM periodo p
                INNER JOIN turma t ON p.id_turma = t.id_turma
                INNER JOIN curso c ON t.id_curso = c.id_curso
                INNER JOIN categoria cat ON c.id_categoria = cat.id_categoria
                LEFT JOIN anoletivo al ON p.id_periodo = al.id_periodo
                LEFT JOIN anocurricular ac ON p.id_anocurricular = ac.id_anocurricular
                WHERE al.status = 'Ativo' AND p.status = 'Ativo'
                ORDER BY 
                    cat.categoria ASC,
                    c.curso ASC,
                    ac.ano ASC,
                    t.turma ASC,
                    p.periodo ASC,
                    al.ano ASC`;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar turmas:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json(result);
        }
    });
});

router.get('/turmasCompletas', async (req, res) => {
    const sql = `SELECT 
                    p.id_periodo,
                    p.periodo,
                    t.turma,
                    al.ano AS anoletivo,
                    al.id_anoletivo,
                    al.status_inscricao,
                    al.status AS status_anoletivo,
                    cat.categoria AS categoriacurso,
                    cat.id_categoria,
                    c.curso,
                    c.id_curso,
                    ac.ano AS anocurricular,
                    ac.id_anocurricular,
                    p.id_periodo AS id_periodo_original,
                    CASE 
                        WHEN al.id_anoletivo IS NOT NULL AND al.status = 'Ativo' THEN 'Ativo'
                        WHEN al.id_anoletivo IS NOT NULL AND al.status = 'Desativado' THEN 'Desativado'
                        ELSE 'Sem Ano Letivo'
                    END AS status_anoletivo
                FROM periodo p
                INNER JOIN turma t ON p.id_turma = t.id_turma
                INNER JOIN curso c ON t.id_curso = c.id_curso
                INNER JOIN categoria cat ON c.id_categoria = cat.id_categoria
                LEFT JOIN anocurricular ac ON p.id_anocurricular = ac.id_anocurricular
                LEFT JOIN anoletivo al ON p.id_periodo = al.id_periodo
                WHERE p.status = 'Ativo'
                ORDER BY 
                    cat.categoria ASC,
                    c.curso ASC,
                    COALESCE(ac.ano, 999) ASC,
                    t.turma ASC,
                    p.periodo ASC,
                    al.ano ASC`;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar turmas completas:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json(result);
        }
    });
});

router.get('/turmaDeleteInfo/:id_periodo', async (req, res) => {
    const { id_periodo } = req.params;

    const sql = `
        SELECT 
            p.id_periodo,
            p.periodo,
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
            al.status_inscricao,
            (SELECT COUNT(*) FROM prof_turma_disc WHERE id_periodo = p.id_periodo AND status = 'Ativo') AS total_professores,
            (SELECT GROUP_CONCAT(DISTINCT d.disciplina SEPARATOR ', ') 
             FROM prof_turma_disc ptd
             INNER JOIN disc_professor dp ON ptd.id_dp = dp.id_dp
             INNER JOIN disciplina d ON dp.id_disciplina = d.id_disciplina
             WHERE ptd.id_periodo = p.id_periodo AND ptd.status = 'Ativo'
            ) AS disciplinas,
            (SELECT GROUP_CONCAT(DISTINCT prof.nome SEPARATOR ', ') 
             FROM prof_turma_disc ptd
             INNER JOIN disc_professor dp ON ptd.id_dp = dp.id_dp
             INNER JOIN professor prof ON dp.id_professor = prof.id_professor
             WHERE ptd.id_periodo = p.id_periodo AND ptd.status = 'Ativo'
            ) AS professores
        FROM periodo p
        INNER JOIN turma t ON p.id_turma = t.id_turma
        INNER JOIN curso c ON t.id_curso = c.id_curso
        INNER JOIN categoria cat ON c.id_categoria = cat.id_categoria
        LEFT JOIN anocurricular ac ON p.id_anocurricular = ac.id_anocurricular
        LEFT JOIN anoletivo al ON p.id_periodo = al.id_periodo
        WHERE p.id_periodo = ?
    `;

    conexao.query(sql, [id_periodo], (error, result) => {
        if (error) {
            console.error("Erro ao buscar informações de exclusão:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                error: "Turma não encontrada"
            });
        }

        const dados = result[0];
        
        const sqlAnos = `
            SELECT id_anoletivo, ano, status, status_inscricao 
            FROM anoletivo 
            WHERE id_periodo = ?
        `;

        conexao.query(sqlAnos, [id_periodo], (errorAnos, anosResult) => {
            if (errorAnos) {
                console.error("Erro ao buscar anos letivos:", errorAnos);
            }

            const sqlProfessoresDetalhados = `
                SELECT 
                    prof.nome,
                    prof.titulacao,
                    d.disciplina,
                    s.semestre,
                    al.ano AS anoletivo
                FROM prof_turma_disc ptd
                INNER JOIN disc_professor dp ON ptd.id_dp = dp.id_dp
                INNER JOIN professor prof ON dp.id_professor = prof.id_professor
                INNER JOIN disciplina d ON dp.id_disciplina = d.id_disciplina
                LEFT JOIN semestre s ON s.id_disciplina = d.id_disciplina 
                    AND s.id_curso = (SELECT id_curso FROM turma WHERE id_turma = ptd.id_turma)
                    AND s.id_anocurricular = (SELECT id_anocurricular FROM periodo WHERE id_periodo = ptd.id_periodo)
                LEFT JOIN anoletivo al ON ptd.id_anoletivo = al.id_anoletivo
                WHERE ptd.id_periodo = ? AND ptd.status = 'Ativo'
                ORDER BY s.semestre ASC, d.disciplina ASC
            `;

            conexao.query(sqlProfessoresDetalhados, [id_periodo], (errorProf, profResult) => {
                if (errorProf) {
                    console.error("Erro ao buscar professores detalhados:", errorProf);
                }

                const response = {
                    dados_gerais: {
                        ...dados,
                        anos_letivos: anosResult || []
                    },
                    professores_detalhados: profResult || [],
                    total_anos_letivos: anosResult ? anosResult.length : 0,
                    total_professores: dados.total_professores || 0
                };

                res.status(200).json(response);
            });
        });
    });
});

router.get('/verificarAnoLetivo/:id_periodo/:ano', async (req, res) => {
    const { id_periodo, ano } = req.params;

    const sql = `
        SELECT id_anoletivo, ano, status 
        FROM anoletivo 
        WHERE id_periodo = ? AND ano = ?
    `;

    conexao.query(sql, [id_periodo, ano], (error, result) => {
        if (error) {
            console.error("Erro ao verificar ano letivo:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        }

        if (result.length > 0) {
            return res.status(200).json({
                existe: true,
                id_anoletivo: result[0].id_anoletivo,
                status: result[0].status,
                mensagem: `O ano letivo ${ano} já existe para esta turma`
            });
        }

        res.status(200).json({
            existe: false,
            mensagem: `O ano letivo ${ano} está disponível para esta turma`
        });
    });
});

router.get('/anosLetivosTurma/:id_periodo', async (req, res) => {
    const { id_periodo } = req.params;

    const sql = `
        SELECT 
            id_anoletivo,
            ano,
            status,
            status_inscricao,
            data_criacao,
            data_atualizacao
        FROM anoletivo 
        WHERE id_periodo = ?
        ORDER BY ano DESC
    `;

    conexao.query(sql, [id_periodo], (error, result) => {
        if (error) {
            console.error("Erro ao buscar anos letivos:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        }

        res.status(200).json({
            total: result.length,
            anos: result
        });
    });
});

router.get('/professoresPorTurma/:idperiodo/:anoletivo', async (req, res) => {
    const { idperiodo, anoletivo } = req.params;

    console.log("=== ROTA /professoresPorTurma/:idperiodo/:anoletivo ===");
    console.log("idperiodo:", idperiodo);
    console.log("anoletivo:", anoletivo);

    if (!idperiodo) {
        return res.status(400).json({
            error: 'ID do período não informado'
        });
    }

    let query = `
        SELECT DISTINCT
            p.id_professor,
            p.nome,
            p.email,
            p.titulacao,
            p.foto,
            d.disciplina,
            dp.id_dp,
            al.ano AS anoletivo,
            al.id_anoletivo,
            s.semestre
        FROM prof_turma_disc ptd
        INNER JOIN disc_professor dp ON ptd.id_dp = dp.id_dp
        INNER JOIN professor p ON dp.id_professor = p.id_professor
        INNER JOIN disciplina d ON dp.id_disciplina = d.id_disciplina
        INNER JOIN periodo per ON ptd.id_periodo = per.id_periodo
        LEFT JOIN anoletivo al ON ptd.id_anoletivo = al.id_anoletivo
        LEFT JOIN semestre s ON s.id_disciplina = d.id_disciplina 
            AND s.id_curso = (SELECT id_curso FROM turma WHERE id_turma = per.id_turma)
            AND s.id_anocurricular = (SELECT id_anocurricular FROM periodo WHERE id_periodo = per.id_periodo)
        WHERE ptd.id_periodo = ? 
        AND ptd.status = 'Ativo'
        AND p.status = 'Ativo'
    `;

    const params = [idperiodo];

    if (anoletivo) {
        query += ` AND al.ano = ?`;
        params.push(anoletivo);
    }

    query += ` ORDER BY s.semestre ASC, p.nome ASC`;

    console.log("Query:", query);
    console.log("Params:", params);

    conexao.query(query, params, (error, results) => {
        if (error) {
            console.error("Erro ao buscar professores da turma:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        }

        console.log("Resultados encontrados:", results.length);
        console.log("Primeiro resultado:", results[0] || 'Nenhum');

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const professoresComFoto = results.map(prof => ({
            ...prof,
            foto_url: prof.foto ? `${baseUrl}/api/img/professores/${prof.foto}` : null,
            semestre: prof.semestre || 0
        }));

        res.status(200).json(professoresComFoto);
    });
});

router.get('/anosLetivosPorTurma/:idperiodo', async (req, res) => {
    const { idperiodo } = req.params;

    if (!idperiodo) {
        return res.status(400).json({
            error: 'ID do período não informado'
        });
    }

    const query = `
        SELECT DISTINCT
            al.id_anoletivo,
            al.ano AS anoletivo
        FROM periodo p
        INNER JOIN anoletivo al ON p.id_periodo = al.id_periodo
        WHERE p.id_periodo = ? 
        AND al.status = 'Ativo'
        ORDER BY al.ano DESC
    `;

    conexao.query(query, [idperiodo], (error, results) => {
        if (error) {
            console.error("Erro ao buscar anos letivos:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        }

        res.status(200).json(results);
    });
});

router.get('/turmasComAnoLetivoDesativado', async (req, res) => {
    const sql = `SELECT 
                    p.id_periodo,
                    p.periodo,
                    t.turma,
                    al.ano AS anoletivo,
                    al.id_anoletivo,
                    al.status_inscricao,
                    al.status AS status_anoletivo,
                    cat.categoria AS categoriacurso,
                    cat.id_categoria,
                    c.curso,
                    c.id_curso,
                    ac.ano AS anocurricular,
                    ac.id_anocurricular,
                    p.id_periodo AS id_periodo_original
                FROM periodo p
                INNER JOIN turma t ON p.id_turma = t.id_turma
                INNER JOIN curso c ON t.id_curso = c.id_curso
                INNER JOIN categoria cat ON c.id_categoria = cat.id_categoria
                LEFT JOIN anoletivo al ON p.id_periodo = al.id_periodo
                LEFT JOIN anocurricular ac ON p.id_anocurricular = ac.id_anocurricular
                WHERE al.status = 'Desativado' AND p.status = 'Ativo'
                ORDER BY 
                    cat.categoria ASC,
                    c.curso ASC,
                    ac.ano ASC,
                    t.turma ASC,
                    p.periodo ASC,
                    al.ano ASC`;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar turmas:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json(result);
        }
    });
});

router.get('/turmaEditar/:id_periodo', async (req, res) => {
    const { id_periodo } = req.params;

    const sql = `
        SELECT 
            p.id_periodo,
            p.periodo,
            t.id_turma,
            t.turma,
            t.id_curso,
            t.status AS status_turma,
            c.id_curso,
            c.curso AS nomeCurso,
            cat.id_categoria,
            cat.categoria AS nomeCategoria,
            ac.id_anocurricular,
            ac.ano AS anoCurricular,
            al.id_anoletivo,
            al.ano AS anoletivo,
            al.status AS status_anoletivo,
            al.status_inscricao
        FROM periodo p
        INNER JOIN turma t ON p.id_turma = t.id_turma
        INNER JOIN curso c ON t.id_curso = c.id_curso
        INNER JOIN categoria cat ON c.id_categoria = cat.id_categoria
        INNER JOIN anocurricular ac ON p.id_anocurricular = ac.id_anocurricular
        LEFT JOIN anoletivo al ON p.id_periodo = al.id_periodo
        WHERE p.id_periodo = ?
    `;

    conexao.query(sql, [id_periodo], (error, result) => {
        if (error) {
            console.error("Erro ao buscar dados da turma para edição:", error);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno ao buscar dados da turma",
                detalhes: error.message
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Turma não encontrada",
                mensagem: "A turma que você está tentando editar não existe"
            });
        }

        res.status(200).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Dados carregados com sucesso",
            dados: result[0]
        });
    });
});

router.get('/cursosSelectInscricoesAbertas', async (req, res) => {
    const sql = `
        SELECT DISTINCT
            c.id_curso,
            c.curso,
            cat.id_categoria,
            cat.categoria
        FROM curso c
        INNER JOIN categoria cat ON cat.id_categoria = c.id_categoria
        WHERE c.status = 'Ativo'
          AND cat.status = 'Ativo'
          AND EXISTS (
              SELECT 1 
              FROM anocurricular ac 
              INNER JOIN periodo p ON p.id_anocurricular = ac.id_anocurricular
              INNER JOIN anoletivo al ON al.id_periodo = p.id_periodo
              WHERE ac.id_curso = c.id_curso
                AND ac.status = 'Ativo'
                AND p.status = 'Ativo'
                AND al.status = 'Ativo'
                AND al.status_inscricao = 'Aberto'
          )
        ORDER BY c.curso ASC
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar cursos:", error);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno ao buscar cursos",
                detalhes: error.message
            });
        }

        res.status(200).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Cursos carregados com sucesso",
            total: result.length,
            dados: result
        });
    });
});

router.get('/periodosPorCurso/:id_curso', async (req, res) => {
    const { id_curso } = req.params;

    if (!id_curso) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "ID do curso não informado",
            mensagem: "Por favor, informe o ID do curso"
        });
    }

    const sql = `
        SELECT DISTINCT
            p.id_periodo,
            p.periodo,
            p.status AS status_periodo,
            t.id_turma,
            t.turma,
            al.id_anoletivo,
            al.ano AS anoletivo,
            ac.id_anocurricular,
            ac.ano AS ano_curricular
        FROM periodo p
        INNER JOIN turma t ON t.id_turma = p.id_turma
        INNER JOIN anocurricular ac ON ac.id_anocurricular = p.id_anocurricular
        INNER JOIN anoletivo al ON al.id_periodo = p.id_periodo
        INNER JOIN curso c ON c.id_curso = t.id_curso
        WHERE c.id_curso = ?
          AND p.status = 'Ativo'
          AND t.status = 'Ativo'
          AND ac.status = 'Ativo'
          AND al.status = 'Ativo'
          AND al.status_inscricao = 'Aberto'
        ORDER BY p.periodo ASC
    `;

    conexao.query(sql, [id_curso], (error, result) => {
        if (error) {
            console.error("Erro ao buscar períodos:", error);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno ao buscar períodos",
                detalhes: error.message
            });
        }

        res.status(200).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Períodos carregados com sucesso",
            total: result.length,
            dados: result
        });
    });
});

module.exports = router;