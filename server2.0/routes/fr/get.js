const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");

// Ano atual em JavaScript
const anoAtual = new Date().getFullYear();

// ==================== GET - Estudantes Inscritos (Pendentes) com Documentos ====================
router.get('/EstudantesInscritos', (req, res) => {
    const sql = `
        SELECT 
            ei.id_est,
            ei.nome,
            ei.contacto,
            ei.genero,
            ei.email,
            ei.bi,
            ei.status,
            ei.codigo,
            ei.nota,
            ei.senha,
            ei.foto,
            ei.data_inscricao,
            c.curso,
            c.id_curso AS curso_id,
            p.periodo,
            p.id_periodo AS periodo_id
        FROM estudante_inscricao ei
        INNER JOIN curso c ON ei.id_curso = c.id_curso
        INNER JOIN periodo p ON ei.id_periodo = p.id_periodo
        WHERE ei.status = 'Pendente' 
        AND ei.pagamento_inscricao IS NOT NULL
        AND YEAR(ei.data_inscricao) = ${anoAtual}
        ORDER BY ei.nome ASC
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar estudantes:", error);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        // Buscar documentos para cada estudante
        const estudantesComDocs = result.map(estudante => {
            return new Promise((resolve, reject) => {
                const docSql = `
                    SELECT id_fei, titulo, doc 
                    FROM ficheiro_estudante_inscricao 
                    WHERE id_est = ?
                `;
                
                conexao.query(docSql, [estudante.id_est], (docError, docResult) => {
                    if (docError) {
                        console.error("Erro ao buscar documentos:", docError);
                        resolve({
                            ...estudante,
                            documentos: []
                        });
                    } else {
                        const documentos = docResult.map(doc => ({
                            id_fei: doc.id_fei,
                            titulo: doc.titulo,
                            docUrl: `${baseUrl}/api/img/alunos/documentos/${doc.doc}`
                        }));
                        
                        resolve({
                            ...estudante,
                            documentos: documentos
                        });
                    }
                });
            });
        });

        Promise.all(estudantesComDocs)
            .then(estudantesFormatados => {
                const response = estudantesFormatados.map(estudante => ({
                    id_est: estudante.id_est,
                    nome: estudante.nome,
                    contacto: estudante.contacto,
                    genero: estudante.genero,
                    email: estudante.email,
                    bi: estudante.bi,
                    status: estudante.status,
                    codigo: estudante.codigo,
                    nota: estudante.nota,
                    foto: estudante.foto,
                    data_inscricao: estudante.data_inscricao,
                    curso: estudante.curso,
                    curso_id: estudante.curso_id,
                    periodo: estudante.periodo,
                    periodo_id: estudante.periodo_id,
                    documentos: estudante.documentos || [],
                    id_estudanteInscricao: estudante.id_est,
                    nome_estudanteInscricao: estudante.nome,
                    contacto_estudanteInscricao: estudante.contacto,
                    sexo_estudanteInscricao: estudante.genero,
                    email_estudanteInscricao: estudante.email,
                    bi_estudanteInscricao: estudante.bi,
                    estado_estudanteInscrito: estudante.status,
                    numeroInscricao_estudanteInscricao: estudante.codigo,
                    nota_estudanteInscricao: estudante.nota,
                    foto_estudanteInscricao: estudante.foto,
                    fotoUrl: estudante.foto ? `${baseUrl}/api/img/alunos/${estudante.foto}` : null,
                    periodo_estudanteInscricao: estudante.periodo || 'Não informado'
                }));

                res.status(200).json(response);
            })
            .catch(err => {
                console.error("Erro ao processar documentos:", err);
                res.status(500).json({ error: "Erro ao processar documentos" });
            });
    });
});

// ==================== GET - Estudantes por Status com Documentos ====================
router.get('/EstudantesByStatus/:status', (req, res) => {
    const { status } = req.params;

    const statusPermitidos = ['Pendente', 'Aprovado', 'Reprovado', 'Admitido', 'Não Admitido', 'Matriculado'];
    if (!statusPermitidos.includes(status)) {
        return res.status(400).json({ error: "Status inválido" });
    }

    const sql = `
        SELECT 
            ei.id_est,
            ei.nome,
            ei.contacto,
            ei.genero,
            ei.email,
            ei.bi,
            ei.status,
            ei.codigo,
            ei.nota,
            ei.senha,
            ei.foto,
            ei.data_inscricao,
            c.curso,
            c.id_curso AS curso_id,
            p.periodo,
            p.id_periodo AS periodo_id
        FROM estudante_inscricao ei
        INNER JOIN curso c ON ei.id_curso = c.id_curso
        INNER JOIN periodo p ON ei.id_periodo = p.id_periodo
        WHERE ei.status = '${status}'
        AND ei.pagamento_inscricao IS NOT NULL
        AND YEAR(ei.data_inscricao) = ${anoAtual}
        ORDER BY ei.nome ASC
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error(`Erro ao buscar ${status}:`, error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const estudantesComDocs = result.map(estudante => {
            return new Promise((resolve, reject) => {
                const docSql = `
                    SELECT id_fei, titulo, doc 
                    FROM ficheiro_estudante_inscricao 
                    WHERE id_est = ?
                `;
                
                conexao.query(docSql, [estudante.id_est], (docError, docResult) => {
                    if (docError) {
                        console.error("Erro ao buscar documentos:", docError);
                        resolve({
                            ...estudante,
                            documentos: []
                        });
                    } else {
                        const documentos = docResult.map(doc => ({
                            id_fei: doc.id_fei,
                            titulo: doc.titulo,
                            docUrl: `${baseUrl}/api/img/alunos/documentos/${doc.doc}`
                        }));
                        
                        resolve({
                            ...estudante,
                            documentos: documentos
                        });
                    }
                });
            });
        });

        Promise.all(estudantesComDocs)
            .then(estudantesFormatados => {
                const response = estudantesFormatados.map(estudante => ({
                    id_est: estudante.id_est,
                    nome: estudante.nome,
                    contacto: estudante.contacto,
                    genero: estudante.genero,
                    email: estudante.email,
                    bi: estudante.bi,
                    status: estudante.status,
                    codigo: estudante.codigo,
                    nota: estudante.nota,
                    foto: estudante.foto,
                    data_inscricao: estudante.data_inscricao,
                    curso: estudante.curso,
                    curso_id: estudante.curso_id,
                    periodo: estudante.periodo,
                    periodo_id: estudante.periodo_id,
                    documentos: estudante.documentos || [],
                    id_estudanteInscricao: estudante.id_est,
                    nome_estudanteInscricao: estudante.nome,
                    contacto_estudanteInscricao: estudante.contacto,
                    sexo_estudanteInscricao: estudante.genero,
                    email_estudanteInscricao: estudante.email,
                    bi_estudanteInscricao: estudante.bi,
                    estado_estudanteInscrito: estudante.status,
                    numeroInscricao_estudanteInscricao: estudante.codigo,
                    nota_estudanteInscricao: estudante.nota,
                    foto_estudanteInscricao: estudante.foto,
                    fotoUrl: estudante.foto ? `${baseUrl}/api/img/alunos/${estudante.foto}` : null,
                    periodo_estudanteInscricao: estudante.periodo || 'Não informado'
                }));

                res.status(200).json(response);
            })
            .catch(err => {
                console.error("Erro ao processar documentos:", err);
                res.status(500).json({ error: "Erro ao processar documentos" });
            });
    });
});

// ==================== GET - Estudantes por Curso ====================
router.get('/EstudantesByCurso/:cursoId', (req, res) => {
    const { cursoId } = req.params;

    if (!cursoId) {
        return res.status(400).json({ error: "ID do curso é obrigatório" });
    }

    const sql = `
        SELECT 
            ei.id_est,
            ei.nome,
            ei.contacto,
            ei.genero,
            ei.email,
            ei.bi,
            ei.status,
            ei.codigo,
            ei.nota,
            ei.foto,
            ei.data_inscricao,
            c.curso,
            p.periodo
        FROM estudante_inscricao ei
        INNER JOIN curso c ON ei.id_curso = c.id_curso
        INNER JOIN periodo p ON ei.id_periodo = p.id_periodo
        WHERE ei.id_curso = ?
        AND ei.status IN ('Admitido', 'Aprovado', 'Matriculado', 'Reprovado') 
        AND ei.pagamento_inscricao IS NOT NULL
        AND YEAR(ei.data_inscricao) = ${anoAtual}
        ORDER BY ei.nome ASC
    `;

    conexao.query(sql, [cursoId], (error, result) => {
        if (error) {
            console.error("Erro ao buscar estudantes por curso:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const estudantesFormatados = result.map(estudante => ({
            id_est: estudante.id_est,
            nome: estudante.nome,
            contacto: estudante.contacto,
            genero: estudante.genero,
            email: estudante.email,
            bi: estudante.bi,
            status: estudante.status,
            codigo: estudante.codigo,
            nota: estudante.nota,
            foto: estudante.foto,
            data_inscricao: estudante.data_inscricao,
            curso: estudante.curso,
            periodo: estudante.periodo,
            id_estudanteInscricao: estudante.id_est,
            nome_estudanteInscricao: estudante.nome,
            contacto_estudanteInscricao: estudante.contacto,
            sexo_estudanteInscricao: estudante.genero,
            email_estudanteInscricao: estudante.email,
            bi_estudanteInscricao: estudante.bi,
            estado_estudanteInscrito: estudante.status,
            numeroInscricao_estudanteInscricao: estudante.codigo,
            nota_estudanteInscricao: estudante.nota,
            foto_estudanteInscricao: estudante.foto,
            fotoUrl: estudante.foto ? `${baseUrl}/api/img/alunos/${estudante.foto}` : null,
            periodo_estudanteInscricao: estudante.periodo || 'Não informado'
        }));

        res.status(200).json(estudantesFormatados);
    });
});

// ==================== GET - Estatísticas de Inscrições ====================
router.get('/EstatisticasInscricoes', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'Pendente' THEN 1 ELSE 0 END) as pendentes,
            SUM(CASE WHEN status = 'Aprovado' THEN 1 ELSE 0 END) as aprovados,
            SUM(CASE WHEN status = 'Reprovado' THEN 1 ELSE 0 END) as reprovados,
            SUM(CASE WHEN status = 'Admitido' THEN 1 ELSE 0 END) as admitidos,
            SUM(CASE WHEN status = 'Não Admitido' THEN 1 ELSE 0 END) as nao_admitidos,
            SUM(CASE WHEN status = 'Matriculado' THEN 1 ELSE 0 END) as matriculados
        FROM estudante_inscricao 
        WHERE pagamento_inscricao IS NOT NULL
        AND YEAR(data_inscricao) = ${anoAtual}
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar estatísticas:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }

        res.status(200).json({
            ano: anoAtual,
            total: result[0].total || 0,
            pendentes: result[0].pendentes || 0,
            aprovados: result[0].aprovados || 0,
            reprovados: result[0].reprovados || 0,
            admitidos: result[0].admitidos || 0,
            nao_admitidos: result[0].nao_admitidos || 0,
            matriculados: result[0].matriculados || 0
        });
    });
});

// ==================== GET - Estatísticas por Curso ====================
router.get('/EstatisticasPorCurso', (req, res) => {
    const sql = `
        SELECT 
            c.curso,
            c.id_curso,
            COUNT(ei.id_est) as total,
            SUM(CASE WHEN ei.status = 'Pendente' THEN 1 ELSE 0 END) as pendentes,
            SUM(CASE WHEN ei.status = 'Aprovado' THEN 1 ELSE 0 END) as aprovados,
            SUM(CASE WHEN ei.status = 'Reprovado' THEN 1 ELSE 0 END) as reprovados,
            SUM(CASE WHEN ei.status = 'Admitido' THEN 1 ELSE 0 END) as admitidos,
            SUM(CASE WHEN ei.status = 'Matriculado' THEN 1 ELSE 0 END) as matriculados
        FROM curso c
        LEFT JOIN estudante_inscricao ei ON c.id_curso = ei.id_curso
        WHERE ei.pagamento_inscricao IS NOT NULL
        AND YEAR(ei.data_inscricao) = ${anoAtual}
        GROUP BY c.id_curso, c.curso
        ORDER BY c.curso ASC
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar estatísticas por curso:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }

        res.status(200).json({
            ano: anoAtual,
            dados: result
        });
    });
});

// ==================== GET - Buscar Estudante por ID ====================
router.get('/Estudante/:id', (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "ID do estudante é obrigatório" });
    }

    const sql = `
        SELECT 
            ei.id_est,
            ei.nome,
            ei.contacto,
            ei.genero,
            ei.email,
            ei.bi,
            ei.status,
            ei.codigo,
            ei.nota,
            ei.foto,
            ei.data_inscricao,
            c.curso,
            c.id_curso AS curso_id,
            p.periodo,
            p.id_periodo AS periodo_id
        FROM estudante_inscricao ei
        INNER JOIN curso c ON ei.id_curso = c.id_curso
        INNER JOIN periodo p ON ei.id_periodo = p.id_periodo
        WHERE ei.id_est = ${id}
        AND ei.pagamento_inscricao IS NOT NULL
        AND YEAR(ei.data_inscricao) = ${anoAtual}
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar estudante:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "Estudante não encontrado para o ano atual" });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const estudante = result[0];

        const docSql = `
            SELECT id_fei, titulo, doc 
            FROM ficheiro_estudante_inscricao 
            WHERE id_est = ${id}
        `;

        conexao.query(docSql, (docError, docResult) => {
            if (docError) {
                console.error("Erro ao buscar documentos:", docError);
                return res.status(500).json({ error: "Erro ao buscar documentos" });
            }

            const documentos = docResult.map(doc => ({
                id_fei: doc.id_fei,
                titulo: doc.titulo,
                docUrl: `${baseUrl}/api/img/alunos/documentos/${doc.doc}`
            }));

            res.status(200).json({
                id_est: estudante.id_est,
                nome: estudante.nome,
                contacto: estudante.contacto,
                genero: estudante.genero,
                email: estudante.email,
                bi: estudante.bi,
                status: estudante.status,
                codigo: estudante.codigo,
                nota: estudante.nota,
                foto: estudante.foto,
                data_inscricao: estudante.data_inscricao,
                curso: estudante.curso,
                curso_id: estudante.curso_id,
                periodo: estudante.periodo,
                periodo_id: estudante.periodo_id,
                fotoUrl: estudante.foto ? `${baseUrl}/api/img/alunos/${estudante.foto}` : null,
                documentos: documentos
            });
        });
    });
});

// ==================== GET - Documentos do Estudante ====================
router.get('/EstudanteDocumentos/:id', (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "ID do estudante é obrigatório" });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const sql = `
        SELECT id_fei, titulo, doc 
        FROM ficheiro_estudante_inscricao 
        WHERE id_est = ${id}
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar documentos:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }

        const documentos = result.map(doc => ({
            id_fei: doc.id_fei,
            titulo: doc.titulo,
            docUrl: `${baseUrl}/api/img/alunos/documentos/${doc.doc}`
        }));

        res.status(200).json({
            id_est: id,
            documentos: documentos
        });
    });
});

// ==================== GET - Cursos ====================
router.get('/cursos', (req, res) => {
    const sql = `
        SELECT id_curso, curso, status, id_categoria 
        FROM curso 
        WHERE status = 'Ativo' 
        ORDER BY curso ASC
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar cursos:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }

        res.status(200).json(result);
    });
});

// ==================== GET - Períodos ====================
router.get('/periodos', (req, res) => {
    const sql = `
        SELECT id_periodo, periodo, status, id_turma 
        FROM periodo 
        WHERE status = 'Ativo' 
        ORDER BY periodo ASC
    `;

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar períodos:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }

        res.status(200).json(result);
    });
});

// ==================== GET - Tópico ====================
// Rota para buscar o tópico ativo
router.get('/Topico', async (req, res) => {
    const sql = "SELECT id_topicoexame, topico, arquivo, status, id_func, data_criacao FROM topicoexamiinscricao WHERE status = 'Ativo' ORDER BY data_criacao DESC LIMIT 1";

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar tópico:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "Nenhum tópico encontrado" });
        }

        const topico = result[0];
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        res.status(200).json({
            success: true,
            data: {
                id_topicoexame: topico.id_topicoexame,
                topico: topico.topico,
                arquivo: topico.arquivo || null,
                nome_original: topico.nome_original || null,
                arquivo_url: topico.arquivo ? `${baseUrl}/api/topico/arquivo/${topico.arquivo}` : null,
                status: topico.status,
                data_criacao: topico.data_criacao
            }
        });
    });
});

// Rota para baixar o arquivo
router.get('/topico/arquivo/:nomeArquivo', (req, res) => {
    const nomeArquivo = req.params.nomeArquivo;
    const caminho = path.join(__dirname, '../uploads/topicos', nomeArquivo);
    
    if (fs.existsSync(caminho)) {
        res.sendFile(caminho);
    } else {
        res.status(404).json({ error: "Arquivo não encontrado" });
    }
});
module.exports = router;