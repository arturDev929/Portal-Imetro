const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");

/**
 * @swagger
 * /PerfilProfessor/{codigo}:
 *   get:
 *     summary: Buscar perfil completo do professor
 */
router.get('/PerfilProfessor/:codigo', async (req, res) => {
   const { codigo } = req.params;
   
   const sqlProfessor = `SELECT 
            p.idprofessor,
            p.nomeprofessor,
            p.fotoprofessor,
            p.codigoprofessor,
            p.generoprofessor,
            p.nacionalidadeprofessor,
            p.estadocivilprofessor,
            p.nomepaiprofessor,
            p.nomemaeprofessor,
            p.nbiprofessor,
            p.datanascimentoprofessor,
            p.bipdfprofessor,
            p.residenciaprofessor,
            p.telefoneprofessor,
            p.whatsappprofessor,
            p.emailprofessor,
            p.anoexperienciaprofessor,
            p.titulacaoprofessor,
            p.dataadmissaoprofessor,
            p.tiposanguineoprofessor,
            p.ibanprofessor,
            p.condicoesprofessor,
            p.contactoemergenciaprofessor,
            p.estado,
            p.tipocontratoprofessor
        FROM professor p 
        WHERE p.codigoprofessor = ?`;
    
    conexao.query(sqlProfessor, [codigo], (error, professorResult) => {
        if (error) {
            console.error("Erro ao buscar perfil do professor:", error);
            return res.status(500).json({ error: "Erro interno do servidor", details: error.message });
        }
        
        if (professorResult.length === 0) {
            return res.status(404).json({ error: "Professor não encontrado" });
        }
        
        const professor = professorResult[0];
        const id = professor.idprofessor;
        
        const sqlDisciplinas = `
            SELECT 
                disciplina.iddisciplina,
                disciplina.disciplina
            FROM disc_prof 
            INNER JOIN disciplina ON disc_prof.iddisciplina = disciplina.iddisciplina 
            WHERE disc_prof.idprofessor = ?
            ORDER BY disciplina.disciplina ASC
        `;
        
        conexao.query(sqlDisciplinas, [id], (error, disciplinasResult) => {
            if (error) {
                console.error("Erro ao buscar disciplinas:", error);
                return res.status(500).json({ error: "Erro interno do servidor", details: error.message });
            }
            
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            
            const professorCompleto = {
                ...professor,
                fotoUrl: professor.fotoprofessor ? `${baseUrl}/api/img/professores/${professor.fotoprofessor}` : null,
                curriculoUrl: professor.bipdfprofessor ? `${baseUrl}/api/img/professores/DocBI/${professor.bipdfprofessor}` : null,
                disciplinas: disciplinasResult
            };
            
            return res.status(200).json(professorCompleto);
        });
    });
});

/**
 * @swagger
 * /turmasProfessor/{codigo}:
 *   get:
 *     summary: Buscar todas as turmas e disciplinas de um professor
 */
router.get('/turmasProfessor/:codigo', async (req, res) => {
    const { codigo } = req.params;

    const sql = `
        SELECT 
            p.idprofessor,
            p.codigoprofessor,
            p.nomeprofessor,
            ptd.id_prof_turma_disc,
            ptd.idperiodo,
            ptd.iddisciplina,
            ptd.data_atribuicao,
            ptd.estadoDisciplina,
            per.turma,
            per.periodo,
            per.anoletivo,
            per.idcurso,
            c.curso,
            d.disciplina,
            (
                SELECT COUNT(*) 
                FROM estudante_matriculado em 
                WHERE em.idperiodo = ptd.idperiodo
            ) as total_estudantes
        FROM professor_turma_disciplina ptd
        INNER JOIN professor p ON p.idprofessor = ptd.idprofessor
        INNER JOIN periodo per ON per.idperiodo = ptd.idperiodo
        INNER JOIN disciplina d ON d.iddisciplina = ptd.iddisciplina
        INNER JOIN curso c ON c.idcurso = per.idcurso
        WHERE p.codigoprofessor = ?
        ORDER BY per.anoletivo DESC, per.turma, d.disciplina
    `;

    conexao.query(sql, [codigo], (error, results) => {
        if (error) {
            console.error("Erro ao buscar turmas do professor:", error);
            return res.status(500).json({ success: false, error: "Erro interno do servidor", details: error.message });
        }

        return res.status(200).json({ success: true, data: results, count: results.length });
    });
});

/**
 * @swagger
 * /verificarEstadoDisciplina/{idperiodo}/{iddisciplina}:
 *   get:
 *     summary: Verificar se disciplina dispensa ou não
 */
router.get('/verificarEstadoDisciplina/:idperiodo/:iddisciplina', async (req, res) => {
    const { idperiodo, iddisciplina } = req.params;

    const sql = `
        SELECT estadoDisciplina 
        FROM professor_turma_disciplina 
        WHERE idperiodo = ? AND iddisciplina = ?
    `;

    conexao.query(sql, [idperiodo, iddisciplina], (error, results) => {
        if (error) {
            return res.status(500).json({ success: false, error: error.message });
        }

        const estado = results[0]?.estadoDisciplina || 'Não Dispensa';
        const dispensa = estado === 'Dispensa';

        return res.status(200).json({ success: true, estado, dispensa });
    });
});

/**
 * @swagger
 * /estatisticasTurma/{idperiodo}/{iddisciplina}:
 *   get:
 *     summary: Buscar estatísticas da turma/disciplina
 */
router.get('/estatisticasTurma/:idperiodo/:iddisciplina', async (req, res) => {
    const { idperiodo, iddisciplina } = req.params;

    try {
        const sqlEstatisticas = `
            SELECT 
                COUNT(DISTINCT em.id_estudante) as total_alunos,
                COUNT(DISTINCT CASE WHEN p.presente = 1 THEN em.id_estudante END) as alunos_presentes,
                AVG(ac.media_continua) as media_continua_geral,
                AVG(anp.nota_parcial) as media_parcial_geral,
                COUNT(DISTINCT a.id_aula) as total_aulas
            FROM estudante_matriculado em
            LEFT JOIN avaliacoes_continuas ac ON ac.id_estudante = em.id_estudante AND ac.idperiodo = ? AND ac.iddisciplina = ?
            LEFT JOIN avaliacao_nota_parcial anp ON anp.id_estudante = em.id_estudante AND anp.idperiodo = ? AND anp.iddisciplina = ?
            LEFT JOIN presencas p ON p.id_estudante = em.id_estudante AND p.idperiodo = ? AND p.iddisciplina = ?
            LEFT JOIN aulas a ON a.idperiodo = ? AND a.iddisciplina = ?
            WHERE em.idperiodo = ?
        `;

        const [result] = await new Promise((resolve, reject) => {
            conexao.query(sqlEstatisticas, [idperiodo, iddisciplina, idperiodo, iddisciplina, idperiodo, iddisciplina, idperiodo, iddisciplina, idperiodo], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        return res.status(200).json({
            success: true,
            data: {
                total_alunos: result?.total_alunos || 0,
                alunos_presentes: result?.alunos_presentes || 0,
                media_continua_geral: parseFloat(result?.media_continua_geral) || 0,
                media_parcial_geral: parseFloat(result?.media_parcial_geral) || 0,
                total_aulas: result?.total_aulas || 0,
                percentual_presenca: result?.total_alunos > 0 ? ((result?.alunos_presentes || 0) / result.total_alunos) * 100 : 0
            }
        });

    } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        return res.status(500).json({ success: false, error: "Erro interno do servidor", details: error.message });
    }
});

/**
 * @swagger
 * /estudantesTurma/{idperiodo}/{iddisciplina}:
 *   get:
 *     summary: Buscar estudantes de uma turma/disciplina com todas informações
 */
router.get('/estudantesTurma/:idperiodo/:iddisciplina', async (req, res) => {
    const { idperiodo, iddisciplina } = req.params;

    const sql = `
        SELECT 
            em.id_estudante,
            em.numero_estudante,
            em.nome_estudante,
            em.bi_estudante,
            em.contacto_estudante,
            em.email_estudante,
            em.sexo_estudante,
            em.foto_estudante,
            em.situacao,
            em.ano_ingresso,
            ac.media_continua,
            anp.nota_parcial,
            anp.nota_exame,
            anp.nota_recurso,
            anp.nota_exame_especial,
            anp.status_final,
            anp.aprovado,
            (
                SELECT ROUND((COUNT(CASE WHEN p.presente = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 2)
                FROM presencas p 
                WHERE p.id_estudante = em.id_estudante 
                    AND p.idperiodo = em.idperiodo 
                    AND p.iddisciplina = ?
            ) as percentual_presenca,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT('avaliacao', avaliacao, 'nota', nota, 'data', data_lancamento)
                )
                FROM avaliacoes_continuas ac2
                WHERE ac2.id_estudante = em.id_estudante 
                    AND ac2.idperiodo = ? 
                    AND ac2.iddisciplina = ?
                ORDER BY ac2.data_lancamento
            ) as avaliacoes_detalhadas
        FROM estudante_matriculado em
        LEFT JOIN avaliacoes_continuas ac ON ac.id_estudante = em.id_estudante 
            AND ac.idperiodo = em.idperiodo 
            AND ac.iddisciplina = ?
        LEFT JOIN avaliacao_nota_parcial anp ON anp.id_estudante = em.id_estudante 
            AND anp.idperiodo = em.idperiodo 
            AND anp.iddisciplina = ?
        WHERE em.idperiodo = ?
        ORDER BY em.nome_estudante ASC
    `;

    conexao.query(sql, [iddisciplina, idperiodo, iddisciplina, iddisciplina, idperiodo, iddisciplina, idperiodo], (error, results) => {
        if (error) {
            console.error("Erro ao buscar estudantes:", error);
            return res.status(500).json({ success: false, error: "Erro interno do servidor", details: error.message });
        }

        return res.status(200).json({ success: true, data: results, count: results.length });
    });
});

/**
 * @swagger
 * /avaliacoesTurma/{idperiodo}/{iddisciplina}:
 *   get:
 *     summary: Buscar todas avaliações contínuas da turma
 */
router.get('/avaliacoesTurma/:idperiodo/:iddisciplina', async (req, res) => {
    const { idperiodo, iddisciplina } = req.params;

    const sql = `
        SELECT 
            ac.id_avaliacao,
            ac.id_estudante,
            ac.idperiodo,
            ac.iddisciplina,
            ac.avaliacao,
            ac.nota,
            ac.data_lancamento,
            em.numero_estudante,
            em.nome_estudante,
            em.foto_estudante
        FROM avaliacoes_continuas ac
        INNER JOIN estudante_matriculado em ON em.id_estudante = ac.id_estudante
        WHERE ac.idperiodo = ? AND ac.iddisciplina = ?
        ORDER BY ac.data_lancamento DESC, em.nome_estudante ASC
    `;

    conexao.query(sql, [idperiodo, iddisciplina], (error, results) => {
        if (error) {
            console.error("Erro ao buscar avaliações:", error);
            return res.status(500).json({ success: false, error: "Erro interno do servidor", details: error.message });
        }

        return res.status(200).json({ success: true, data: results });
    });
});

/**
 * @swagger
 * /notasParciaisTurma/{idperiodo}/{iddisciplina}:
 *   get:
 *     summary: Buscar notas parciais, exame, recurso da turma
 */
router.get('/notasParciaisTurma/:idperiodo/:iddisciplina', async (req, res) => {
    const { idperiodo, iddisciplina } = req.params;

    const sql = `
        SELECT 
            anp.id_registro,
            anp.id_estudante,
            anp.idperiodo,
            anp.iddisciplina,
            anp.nota_parcial,
            anp.nota_exame,
            anp.nota_recurso,
            anp.nota_exame_especial,
            anp.status_final,
            anp.aprovado,
            anp.data_atualizacao,
            em.numero_estudante,
            em.nome_estudante,
            em.foto_estudante,
            ac.media_continua
        FROM avaliacao_nota_parcial anp
        INNER JOIN estudante_matriculado em ON em.id_estudante = anp.id_estudante
        LEFT JOIN avaliacoes_continuas ac ON ac.id_estudante = em.id_estudante 
            AND ac.idperiodo = ? AND ac.iddisciplina = ?
        WHERE anp.idperiodo = ? AND anp.iddisciplina = ?
        ORDER BY em.nome_estudante ASC
    `;

    conexao.query(sql, [idperiodo, iddisciplina, idperiodo, iddisciplina], (error, results) => {
        if (error) {
            console.error("Erro ao buscar notas parciais:", error);
            return res.status(500).json({ success: false, error: "Erro interno do servidor", details: error.message });
        }

        return res.status(200).json({ success: true, data: results });
    });
});

/**
 * @swagger
 * /presencasTurma/{idperiodo}/{iddisciplina}:
 *   get:
 *     summary: Buscar presenças da turma/disciplina
 */
router.get('/presencasTurma/:idperiodo/:iddisciplina', async (req, res) => {
    const { idperiodo, iddisciplina } = req.params;

    const sql = `
        SELECT 
            p.id_presenca,
            p.id_estudante,
            p.idperiodo,
            p.iddisciplina,
            DATE(p.data_aula) as data_aula,
            p.presente,
            p.justificativa,
            em.numero_estudante,
            em.nome_estudante,
            em.foto_estudante
        FROM presencas p
        INNER JOIN estudante_matriculado em ON em.id_estudante = p.id_estudante
        WHERE p.idperiodo = ? AND p.iddisciplina = ?
        ORDER BY p.data_aula DESC, em.nome_estudante ASC
    `;

    conexao.query(sql, [idperiodo, iddisciplina], (error, results) => {
        if (error) {
            console.error("Erro ao buscar presenças:", error);
            return res.status(500).json({ success: false, error: "Erro interno do servidor", details: error.message });
        }

        return res.status(200).json({ success: true, data: results });
    });
});

/**
 * @swagger
 * /aulasTurma/{idperiodo}/{iddisciplina}:
 *   get:
 *     summary: Buscar aulas da turma/disciplina
 */
router.get('/aulasTurma/:idperiodo/:iddisciplina', async (req, res) => {
    const { idperiodo, iddisciplina } = req.params;

    const sql = `
        SELECT 
            a.id_aula,
            a.idperiodo,
            a.iddisciplina,
            DATE(a.data_aula) as data_aula,
            a.conteudo,
            a.observacoes,
            a.data_criacao,
            a.data_atualizacao
        FROM aulas a
        WHERE a.idperiodo = ? AND a.iddisciplina = ?
        ORDER BY a.data_aula DESC
    `;

    conexao.query(sql, [idperiodo, iddisciplina], (error, results) => {
        if (error) {
            console.error("Erro ao buscar aulas:", error);
            return res.status(500).json({ success: false, error: "Erro interno do servidor", details: error.message });
        }

        return res.status(200).json({ success: true, data: results });
    });
});

/**
 * @swagger
 * /relatoriosTurma/{idperiodo}/{iddisciplina}:
 *   get:
 *     summary: Buscar relatórios completos da turma
 */
router.get('/relatoriosTurma/:idperiodo/:iddisciplina', async (req, res) => {
    const { idperiodo, iddisciplina } = req.params;

    try {
        const sqlEstatisticas = `
            SELECT 
                COUNT(DISTINCT em.id_estudante) as total_alunos,
                AVG(ac.media_continua) as media_continua_geral,
                AVG(anp.nota_parcial) as media_parcial_geral,
                AVG(anp.nota_exame) as media_exame_geral,
                AVG(anp.nota_recurso) as media_recurso_geral,
                COUNT(DISTINCT a.id_aula) as total_aulas,
                COUNT(DISTINCT CASE WHEN p.presente = 1 THEN p.id_presenca END) as total_presencas,
                SUM(CASE WHEN anp.aprovado = 1 THEN 1 ELSE 0 END) as total_aprovados,
                SUM(CASE WHEN anp.aprovado = 0 AND anp.status_final = 'Exame' THEN 1 ELSE 0 END) as total_exame,
                SUM(CASE WHEN anp.status_final = 'Recurso' THEN 1 ELSE 0 END) as total_recurso,
                SUM(CASE WHEN anp.status_final = 'Exame Especial' THEN 1 ELSE 0 END) as total_exame_especial,
                SUM(CASE WHEN anp.status_final = 'Reprovado' OR anp.status_final = 'Cadeirante' THEN 1 ELSE 0 END) as total_reprovados
            FROM estudante_matriculado em
            LEFT JOIN avaliacoes_continuas ac ON ac.id_estudante = em.id_estudante AND ac.idperiodo = ? AND ac.iddisciplina = ?
            LEFT JOIN avaliacao_nota_parcial anp ON anp.id_estudante = em.id_estudante AND anp.idperiodo = ? AND anp.iddisciplina = ?
            LEFT JOIN presencas p ON p.id_estudante = em.id_estudante AND p.idperiodo = ? AND p.iddisciplina = ?
            LEFT JOIN aulas a ON a.idperiodo = ? AND a.iddisciplina = ?
            WHERE em.idperiodo = ?
        `;

        const [estatisticas] = await new Promise((resolve, reject) => {
            conexao.query(sqlEstatisticas, [idperiodo, iddisciplina, idperiodo, iddisciplina, idperiodo, iddisciplina, idperiodo, iddisciplina, idperiodo], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        const sqlDistribuicaoNotas = `
            SELECT 
                CASE 
                    WHEN anp.aprovado = 1 AND anp.nota_parcial >= 14 THEN 'Aprovado por Nota'
                    WHEN anp.aprovado = 1 AND anp.nota_parcial < 14 THEN 'Aprovado por Exame'
                    WHEN anp.status_final = 'Recurso' THEN 'Recurso'
                    WHEN anp.status_final = 'Exame Especial' THEN 'Exame Especial'
                    WHEN anp.status_final = 'Reprovado' THEN 'Reprovado'
                    WHEN anp.status_final = 'Cadeirante' THEN 'Cadeirante'
                    ELSE 'Sem Avaliação'
                END as status,
                COUNT(*) as quantidade
            FROM avaliacao_nota_parcial anp
            WHERE anp.idperiodo = ? AND anp.iddisciplina = ?
            GROUP BY status
        `;

        const [distribuicaoNotas] = await new Promise((resolve, reject) => {
            conexao.query(sqlDistribuicaoNotas, [idperiodo, iddisciplina], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        const sqlFrequencia = `
            SELECT 
                em.nome_estudante,
                em.numero_estudante,
                em.foto_estudante,
                COUNT(CASE WHEN p.presente = 1 THEN 1 END) as presencas,
                COUNT(p.id_presenca) as total_aulas_realizadas,
                ROUND(COUNT(CASE WHEN p.presente = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(p.id_presenca), 0), 2) as percentual,
                ac.media_continua,
                anp.nota_parcial,
                (ac.media_continua * 0.6 + anp.nota_parcial * 0.4) as nota_final_calculada,
                anp.status_final,
                anp.aprovado
            FROM estudante_matriculado em
            LEFT JOIN presencas p ON p.id_estudante = em.id_estudante 
                AND p.idperiodo = em.idperiodo 
                AND p.iddisciplina = ?
            LEFT JOIN avaliacoes_continuas ac ON ac.id_estudante = em.id_estudante 
                AND ac.idperiodo = em.idperiodo 
                AND ac.iddisciplina = ?
            LEFT JOIN avaliacao_nota_parcial anp ON anp.id_estudante = em.id_estudante 
                AND anp.idperiodo = em.idperiodo 
                AND anp.iddisciplina = ?
            WHERE em.idperiodo = ?
            GROUP BY em.id_estudante, em.nome_estudante, em.numero_estudante, em.foto_estudante,
                     ac.media_continua, anp.nota_parcial, anp.status_final, anp.aprovado
            ORDER BY percentual DESC
        `;

        const [frequencia] = await new Promise((resolve, reject) => {
            conexao.query(sqlFrequencia, [iddisciplina, iddisciplina, iddisciplina, idperiodo], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        return res.status(200).json({
            success: true,
            data: {
                estatisticas: estatisticas || {},
                distribuicao_notas: distribuicaoNotas || [],
                frequencia_alunos: frequencia || []
            }
        });

    } catch (error) {
        console.error("Erro ao buscar relatórios:", error);
        return res.status(500).json({ success: false, error: "Erro interno do servidor", details: error.message });
    }
});

module.exports = router;