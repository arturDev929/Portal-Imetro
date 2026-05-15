const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");

// ==================== AVALIAÇÕES CONTÍNUAS ====================

/**
 * @swagger
 * /avaliacaoContinua:
 *   post:
 *     summary: Lançar avaliação contínua para um estudante
 */
router.post('/avaliacaoContinua', async (req, res) => {
    const { id_estudante, idperiodo, iddisciplina, avaliacao, nota } = req.body;

    if (!id_estudante || !idperiodo || !iddisciplina || !avaliacao || nota === undefined) {
        return res.status(400).json({ success: false, error: "Campos obrigatórios: id_estudante, idperiodo, iddisciplina, avaliacao, nota" });
    }

    if (nota < 0 || nota > 20) {
        return res.status(400).json({ success: false, error: "Nota deve estar entre 0 e 20" });
    }

    // Inserir avaliação
    const sqlInsert = `
        INSERT INTO avaliacoes_continuas (id_estudante, idperiodo, iddisciplina, avaliacao, nota, data_lancamento)
        VALUES (?, ?, ?, ?, ?, NOW())
    `;

    conexao.query(sqlInsert, [id_estudante, idperiodo, iddisciplina, avaliacao, nota], async (insertError) => {
        if (insertError) {
            console.error("Erro ao inserir avaliação:", insertError);
            return res.status(500).json({ success: false, error: "Erro ao lançar avaliação", details: insertError.message });
        }

        // Recalcular média contínua
        const sqlMedia = `
            SELECT AVG(nota) as media, COUNT(*) as total_avaliacoes
            FROM avaliacoes_continuas
            WHERE id_estudante = ? AND idperiodo = ? AND iddisciplina = ?
        `;

        conexao.query(sqlMedia, [id_estudante, idperiodo, iddisciplina], (mediaError, mediaResult) => {
            if (mediaError) {
                console.error("Erro ao calcular média:", mediaError);
                return res.status(500).json({ success: false, error: "Erro ao calcular média" });
            }

            const mediaContinua = mediaResult[0]?.media || 0;
            const totalAvaliacoes = mediaResult[0]?.total_avaliacoes || 0;

            // Atualizar ou inserir média na tabela
            const sqlUpdateMedia = `
                INSERT INTO avaliacoes_continuas_summary (id_estudante, idperiodo, iddisciplina, media_continua, total_avaliacoes, data_atualizacao)
                VALUES (?, ?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE media_continua = ?, total_avaliacoes = ?, data_atualizacao = NOW()
            `;

            conexao.query(sqlUpdateMedia, [id_estudante, idperiodo, iddisciplina, mediaContinua, totalAvaliacoes, mediaContinua, totalAvaliacoes], (updateError) => {
                if (updateError) {
                    console.error("Erro ao atualizar média contínua:", updateError);
                }
            });

            return res.status(201).json({
                success: true,
                message: `Avaliação "${avaliacao}" lançada com sucesso`,
                media_continua: mediaContinua,
                total_avaliacoes: totalAvaliacoes
            });
        });
    });
});

/**
 * @swagger
 * /avaliacaoContinuaLote:
 *   post:
 *     summary: Lançar múltiplas avaliações contínuas
 */
router.post('/avaliacaoContinuaLote', async (req, res) => {
    const { avaliacoes } = req.body;

    if (!avaliacoes || !Array.isArray(avaliacoes) || avaliacoes.length === 0) {
        return res.status(400).json({ success: false, error: "Campo 'avaliacoes' é obrigatório e deve ser um array não vazio" });
    }

    const results = { success: 0, errors: 0, errorDetails: [] };

    for (const aval of avaliacoes) {
        const { id_estudante, idperiodo, iddisciplina, avaliacao, nota } = aval;

        try {
            await new Promise((resolve, reject) => {
                const sqlInsert = `
                    INSERT INTO avaliacoes_continuas (id_estudante, idperiodo, iddisciplina, avaliacao, nota, data_lancamento)
                    VALUES (?, ?, ?, ?, ?, NOW())
                `;
                conexao.query(sqlInsert, [id_estudante, idperiodo, iddisciplina, avaliacao, nota], (error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });
            results.success++;
        } catch (error) {
            results.errors++;
            results.errorDetails.push({ id_estudante, avaliacao, error: error.message });
        }
    }

    // Recalcular médias para todos estudantes
    const estudantesUnicos = [...new Set(avaliacoes.map(a => a.id_estudante))];
    for (const id_estudante of estudantesUnicos) {
        const aval = avaliacoes.find(a => a.id_estudante === id_estudante);
        if (aval) {
            const sqlMedia = `
                SELECT AVG(nota) as media, COUNT(*) as total_avaliacoes
                FROM avaliacoes_continuas
                WHERE id_estudante = ? AND idperiodo = ? AND iddisciplina = ?
            `;
            conexao.query(sqlMedia, [id_estudante, aval.idperiodo, aval.iddisciplina], (mediaError, mediaResult) => {
                if (!mediaError && mediaResult[0]) {
                    const sqlUpdateMedia = `
                        INSERT INTO avaliacoes_continuas_summary (id_estudante, idperiodo, iddisciplina, media_continua, total_avaliacoes, data_atualizacao)
                        VALUES (?, ?, ?, ?, ?, NOW())
                        ON DUPLICATE KEY UPDATE media_continua = ?, total_avaliacoes = ?, data_atualizacao = NOW()
                    `;
                    conexao.query(sqlUpdateMedia, [id_estudante, aval.idperiodo, aval.iddisciplina, mediaResult[0].media, mediaResult[0].total_avaliacoes, mediaResult[0].media, mediaResult[0].total_avaliacoes]);
                }
            });
        }
    }

    return res.status(200).json({
        success: true,
        message: `${results.success} avaliação(ões) lançada(s) com sucesso, ${results.errors} erro(s)`,
        details: results.errorDetails
    });
});

// ==================== NOTA PARCIAL, EXAME, RECURSO ====================

/**
 * @swagger
 * /calcularNotaFinal:
 *   post:
 *     summary: Calcular nota final baseado em média contínua e nota parcial
 */
router.post('/calcularNotaFinal', async (req, res) => {
    const { id_estudante, idperiodo, iddisciplina, nota_parcial } = req.body;

    if (!id_estudante || !idperiodo || !iddisciplina || nota_parcial === undefined) {
        return res.status(400).json({ success: false, error: "Campos obrigatórios" });
    }

    if (nota_parcial < 0 || nota_parcial > 20) {
        return res.status(400).json({ success: false, error: "Nota parcial deve estar entre 0 e 20" });
    }

    try {
        // Buscar média contínua do estudante
        const sqlMedia = `
            SELECT media_continua FROM avaliacoes_continuas_summary
            WHERE id_estudante = ? AND idperiodo = ? AND iddisciplina = ?
        `;

        const [mediaResult] = await new Promise((resolve, reject) => {
            conexao.query(sqlMedia, [id_estudante, idperiodo, iddisciplina], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        const mediaContinua = mediaResult?.[0]?.media_continua || 0;
        
        // Calcular nota final: 60% AC + 40% Parcial
        const notaFinal = (mediaContinua * 0.6) + (nota_parcial * 0.4);
        let statusFinal = '';
        let aprovado = 0;

        if (notaFinal >= 14) {
            statusFinal = 'Aprovado';
            aprovado = 1;
        } else {
            statusFinal = 'Exame';
            aprovado = 0;
        }

        // Verificar se disciplina dispensa
        const sqlDispensa = `
            SELECT estadoDisciplina FROM professor_turma_disciplina
            WHERE idperiodo = ? AND iddisciplina = ?
        `;
        const [dispensaResult] = await new Promise((resolve, reject) => {
            conexao.query(sqlDispensa, [idperiodo, iddisciplina], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        const dispensa = dispensaResult?.[0]?.estadoDisciplina === 'Dispensa';

        // Se dispensa e nota >= 14, aprovado direto
        if (dispensa && notaFinal >= 14) {
            statusFinal = 'Aprovado (Dispensado)';
            aprovado = 1;
        }

        // Inserir ou atualizar
        const sqlUpsert = `
            INSERT INTO avaliacao_nota_parcial (id_estudante, idperiodo, iddisciplina, nota_parcial, nota_final_calculada, status_final, aprovado, data_atualizacao)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
                nota_parcial = ?, nota_final_calculada = ?, status_final = ?, aprovado = ?, data_atualizacao = NOW()
        `;

        await new Promise((resolve, reject) => {
            conexao.query(sqlUpsert, [id_estudante, idperiodo, iddisciplina, nota_parcial, notaFinal, statusFinal, aprovado, nota_parcial, notaFinal, statusFinal, aprovado], (error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        return res.status(200).json({
            success: true,
            data: {
                media_continua,
                nota_parcial,
                nota_final_calculada: notaFinal,
                status_final: statusFinal,
                aprovado: aprovado === 1,
                dispensa
            }
        });

    } catch (error) {
        console.error("Erro ao calcular nota final:", error);
        return res.status(500).json({ success: false, error: "Erro interno do servidor", details: error.message });
    }
});

/**
 * @swagger
 * /lancarNotaExame:
 *   post:
 *     summary: Lançar nota de exame e recalcular status
 */
router.post('/lancarNotaExame', async (req, res) => {
    const { id_estudante, idperiodo, iddisciplina, nota_exame } = req.body;

    if (!id_estudante || !idperiodo || !iddisciplina || nota_exame === undefined) {
        return res.status(400).json({ success: false, error: "Campos obrigatórios" });
    }

    if (nota_exame < 0 || nota_exame > 20) {
        return res.status(400).json({ success: false, error: "Nota de exame deve estar entre 0 e 20" });
    }

    try {
        // Buscar nota final calculada anterior
        const sqlNotas = `
            SELECT nota_final_calculada, nota_parcial FROM avaliacao_nota_parcial
            WHERE id_estudante = ? AND idperiodo = ? AND iddisciplina = ?
        `;
        const [notasResult] = await new Promise((resolve, reject) => {
            conexao.query(sqlNotas, [id_estudante, idperiodo, iddisciplina], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        const notaAnterior = notasResult?.[0]?.nota_final_calculada || 0;
        const notaParcial = notasResult?.[0]?.nota_parcial || 0;
        
        // Calcular nota final com exame: 60% AC + 40% Exame (quem foi para exame)
        let notaFinal = nota_exame;
        let statusFinal = '';
        let aprovado = 0;

        if (nota_exame >= 10) {
            notaFinal = nota_exame;
            statusFinal = 'Aprovado por Exame';
            aprovado = 1;
        } else {
            statusFinal = 'Recurso';
            aprovado = 0;
        }

        // Atualizar
        const sqlUpdate = `
            UPDATE avaliacao_nota_parcial 
            SET nota_exame = ?, nota_final_calculada = ?, status_final = ?, aprovado = ?, data_atualizacao = NOW()
            WHERE id_estudante = ? AND idperiodo = ? AND iddisciplina = ?
        `;

        await new Promise((resolve, reject) => {
            conexao.query(sqlUpdate, [nota_exame, notaFinal, statusFinal, aprovado, id_estudante, idperiodo, iddisciplina], (error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        return res.status(200).json({
            success: true,
            message: `Nota de exame lançada: ${nota_exame.toFixed(1)}`,
            data: { nota_anterior: notaAnterior, nota_parcial: notaParcial, nota_exame, nota_final: notaFinal, status: statusFinal, aprovado: aprovado === 1 }
        });

    } catch (error) {
        console.error("Erro ao lançar nota de exame:", error);
        return res.status(500).json({ success: false, error: "Erro interno do servidor", details: error.message });
    }
});

/**
 * @swagger
 * /lancarNotaRecurso:
 *   post:
 *     summary: Lançar nota de recurso (nota seca 100%)
 */
router.post('/lancarNotaRecurso', async (req, res) => {
    const { id_estudante, idperiodo, iddisciplina, nota_recurso } = req.body;

    if (!id_estudante || !idperiodo || !iddisciplina || nota_recurso === undefined) {
        return res.status(400).json({ success: false, error: "Campos obrigatórios" });
    }

    if (nota_recurso < 0 || nota_recurso > 20) {
        return res.status(400).json({ success: false, error: "Nota de recurso deve estar entre 0 e 20" });
    }

    try {
        let statusFinal = '';
        let aprovado = 0;

        if (nota_recurso >= 10) {
            statusFinal = 'Aprovado por Recurso';
            aprovado = 1;
        } else {
            statusFinal = 'Exame Especial';
            aprovado = 0;
        }

        const sqlUpdate = `
            UPDATE avaliacao_nota_parcial 
            SET nota_recurso = ?, nota_final_calculada = ?, status_final = ?, aprovado = ?, data_atualizacao = NOW()
            WHERE id_estudante = ? AND idperiodo = ? AND iddisciplina = ?
        `;

        await new Promise((resolve, reject) => {
            conexao.query(sqlUpdate, [nota_recurso, nota_recurso, statusFinal, aprovado, id_estudante, idperiodo, iddisciplina], (error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        return res.status(200).json({
            success: true,
            message: `Nota de recurso lançada: ${nota_recurso.toFixed(1)}`,
            data: { nota_recurso, nota_final: nota_recurso, status: statusFinal, aprovado: aprovado === 1 }
        });

    } catch (error) {
        console.error("Erro ao lançar nota de recurso:", error);
        return res.status(500).json({ success: false, error: "Erro interno do servidor", details: error.message });
    }
});

/**
 * @swagger
 * /lancarNotaExameEspecial:
 *   post:
 *     summary: Lançar nota de exame especial (nota seca 100%)
 */
router.post('/lancarNotaExameEspecial', async (req, res) => {
    const { id_estudante, idperiodo, iddisciplina, nota_exame_especial } = req.body;

    if (!id_estudante || !idperiodo || !iddisciplina || nota_exame_especial === undefined) {
        return res.status(400).json({ success: false, error: "Campos obrigatórios" });
    }

    if (nota_exame_especial < 0 || nota_exame_especial > 20) {
        return res.status(400).json({ success: false, error: "Nota de exame especial deve estar entre 0 e 20" });
    }

    try {
        let statusFinal = '';
        let aprovado = 0;

        if (nota_exame_especial >= 10) {
            statusFinal = 'Aprovado por Exame Especial';
            aprovado = 1;
        } else {
            statusFinal = 'Reprovado - Cadeirante';
            aprovado = 0;
        }

        const sqlUpdate = `
            UPDATE avaliacao_nota_parcial 
            SET nota_exame_especial = ?, nota_final_calculada = ?, status_final = ?, aprovado = ?, data_atualizacao = NOW()
            WHERE id_estudante = ? AND idperiodo = ? AND iddisciplina = ?
        `;

        await new Promise((resolve, reject) => {
            conexao.query(sqlUpdate, [nota_exame_especial, nota_exame_especial, statusFinal, aprovado, id_estudante, idperiodo, iddisciplina], (error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        return res.status(200).json({
            success: true,
            message: `Nota de exame especial lançada: ${nota_exame_especial.toFixed(1)}`,
            data: { nota_exame_especial, nota_final: nota_exame_especial, status: statusFinal, aprovado: aprovado === 1 }
        });

    } catch (error) {
        console.error("Erro ao lançar nota de exame especial:", error);
        return res.status(500).json({ success: false, error: "Erro interno do servidor", details: error.message });
    }
});

// ==================== PRESENÇAS ====================

/**
 * @swagger
 * /presencaManual:
 *   post:
 *     summary: Marcar presença manualmente
 */
router.post('/presencaManual', async (req, res) => {
    const { id_estudante, idperiodo, iddisciplina, data_aula, presente, justificativa } = req.body;

    if (!id_estudante || !idperiodo || !iddisciplina || !data_aula) {
        return res.status(400).json({ success: false, error: "Campos obrigatórios" });
    }

    try {
        const sqlCheck = `
            SELECT id_presenca, presente FROM presencas 
            WHERE id_estudante = ? AND idperiodo = ? AND iddisciplina = ? AND DATE(data_aula) = DATE(?)
        `;

        const [existing] = await new Promise((resolve, reject) => {
            conexao.query(sqlCheck, [id_estudante, idperiodo, iddisciplina, data_aula], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        if (existing && existing.length > 0) {
            const statusTexto = existing[0].presente === 1 ? 'PRESENTE' : 'FALTA';
            return res.status(409).json({
                success: false,
                error: `Estudante já possui marcação para esta data como ${statusTexto}`,
                already_marked: true
            });
        }

        const sqlInsert = `
            INSERT INTO presencas (id_estudante, idperiodo, iddisciplina, data_aula, presente, justificativa)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        await new Promise((resolve, reject) => {
            conexao.query(sqlInsert, [id_estudante, idperiodo, iddisciplina, data_aula, presente || 1, justificativa || null], (error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        const sqlEstudante = `SELECT nome_estudante, numero_estudante, foto_estudante FROM estudante_matriculado WHERE id_estudante = ?`;
        const [estudante] = await new Promise((resolve, reject) => {
            conexao.query(sqlEstudante, [id_estudante], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        return res.status(201).json({
            success: true,
            message: `Presença registrada para ${estudante[0].nome_estudante}`,
            estudante: { id: id_estudante, nome: estudante[0].nome_estudante, numero: estudante[0].numero_estudante, foto: estudante[0].foto_estudante }
        });

    } catch (error) {
        console.error("Erro ao registrar presença:", error);
        return res.status(500).json({ success: false, error: "Erro interno do servidor", details: error.message });
    }
});

/**
 * @swagger
 * /presencaQRCode:
 *   post:
 *     summary: Marcar presença via QR Code (código do estudante)
 */
router.post('/presencaQRCode', async (req, res) => {
    const { codigo_estudante, idperiodo, iddisciplina, data_aula } = req.body;

    if (!codigo_estudante || !idperiodo || !iddisciplina || !data_aula) {
        return res.status(400).json({ success: false, error: "Campos obrigatórios" });
    }

    try {
        const sqlBuscarEstudante = `
            SELECT id_estudante, nome_estudante, numero_estudante, foto_estudante, situacao
            FROM estudante_matriculado 
            WHERE numero_estudante = ? AND idperiodo = ?
        `;

        const [estudante] = await new Promise((resolve, reject) => {
            conexao.query(sqlBuscarEstudante, [codigo_estudante, idperiodo], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        if (!estudante || estudante.length === 0) {
            return res.status(404).json({ success: false, error: "Estudante não encontrado nesta turma" });
        }

        const estudanteData = estudante[0];

        if (estudanteData.situacao !== 'Matriculado') {
            return res.status(403).json({ success: false, error: `Estudante está com status: ${estudanteData.situacao}` });
        }

        const sqlCheck = `
            SELECT id_presenca, presente FROM presencas 
            WHERE id_estudante = ? AND idperiodo = ? AND iddisciplina = ? AND DATE(data_aula) = DATE(?)
        `;

        const [existing] = await new Promise((resolve, reject) => {
            conexao.query(sqlCheck, [estudanteData.id_estudante, idperiodo, iddisciplina, data_aula], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        if (existing && existing.length > 0) {
            const statusTexto = existing[0].presente === 1 ? 'PRESENTE' : 'FALTA';
            return res.status(409).json({
                success: false,
                error: `Estudante já possui marcação para hoje como ${statusTexto}`,
                already_marked: true
            });
        }

        const sqlInsert = `
            INSERT INTO presencas (id_estudante, idperiodo, iddisciplina, data_aula, presente)
            VALUES (?, ?, ?, ?, 1)
        `;

        await new Promise((resolve, reject) => {
            conexao.query(sqlInsert, [estudanteData.id_estudante, idperiodo, iddisciplina, data_aula], (error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        return res.status(201).json({
            success: true,
            message: `✅ Presença registrada para ${estudanteData.nome_estudante}`,
            estudante: { id: estudanteData.id_estudante, nome: estudanteData.nome_estudante, numero: estudanteData.numero_estudante, foto: estudanteData.foto_estudante }
        });

    } catch (error) {
        console.error("Erro ao registrar presença via QR Code:", error);
        return res.status(500).json({ success: false, error: "Erro interno do servidor", details: error.message });
    }
});

/**
 * @swagger
 * /marcarFaltaAutomatica:
 *   post:
 *     summary: Marcar falta automática para todos que não apresentaram QR Code
 */
router.post('/marcarFaltaAutomatica', async (req, res) => {
    const { idperiodo, iddisciplina, data_aula } = req.body;

    if (!idperiodo || !iddisciplina || !data_aula) {
        return res.status(400).json({ success: false, error: "Campos obrigatórios" });
    }

    try {
        // Buscar todos estudantes da turma
        const sqlEstudantes = `SELECT id_estudante FROM estudante_matriculado WHERE idperiodo = ?`;
        const [estudantes] = await new Promise((resolve, reject) => {
            conexao.query(sqlEstudantes, [idperiodo], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        // Buscar quem já tem presença marcada
        const sqlMarcados = `
            SELECT id_estudante FROM presencas 
            WHERE idperiodo = ? AND iddisciplina = ? AND DATE(data_aula) = DATE(?)
        `;
        const [marcados] = await new Promise((resolve, reject) => {
            conexao.query(sqlMarcados, [idperiodo, iddisciplina, data_aula], (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        const idsMarcados = new Set(marcados.map(m => m.id_estudante));
        const estudantesSemMarca = estudantes.filter(e => !idsMarcados.has(e.id_estudante));

        let faltasRegistradas = 0;
        for (const estudante of estudantesSemMarca) {
            const sqlInsert = `
                INSERT INTO presencas (id_estudante, idperiodo, iddisciplina, data_aula, presente, justificativa)
                VALUES (?, ?, ?, ?, 0, 'Falta automática - Não apresentou QR Code')
            `;
            await new Promise((resolve, reject) => {
                conexao.query(sqlInsert, [estudante.id_estudante, idperiodo, iddisciplina, data_aula], (error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });
            faltasRegistradas++;
        }

        return res.status(200).json({
            success: true,
            message: `${faltasRegistradas} falta(s) automática(s) registrada(s)`,
            total_estudantes: estudantes.length,
                presentes: idsMarcados.size,
            ausentes_automaticos: faltasRegistradas
        });

    } catch (error) {
        console.error("Erro ao marcar faltas automáticas:", error);
        return res.status(500).json({ success: false, error: "Erro interno do servidor", details: error.message });
    }
});

/**
 * @swagger
 * /verificarPresencaHoje:
 *   post:
 *     summary: Verificar se estudante já teve presença marcada hoje
 */
router.post('/verificarPresencaHoje', async (req, res) => {
    const { id_estudante, idperiodo, iddisciplina, data_aula } = req.body;

    const sql = `
        SELECT presente, data_aula FROM presencas 
        WHERE id_estudante = ? AND idperiodo = ? AND iddisciplina = ? AND DATE(data_aula) = DATE(?)
    `;

    conexao.query(sql, [id_estudante, idperiodo, iddisciplina, data_aula || new Date()], (error, results) => {
        if (error) {
            return res.status(500).json({ success: false, error: error.message });
        }

        if (results.length > 0) {
            return res.status(200).json({ success: true, ja_marcado: true, presente: results[0].presente === 1, data: results[0].data_aula });
        }

        return res.status(200).json({ success: true, ja_marcado: false });
    });
});

/**
 * @swagger
 * /presencasTurmaLote:
 *   post:
 *     summary: Registrar presenças em lote
 */
router.post('/presencasTurmaLote', async (req, res) => {
    const { presencas } = req.body;

    if (!presencas || !Array.isArray(presencas) || presencas.length === 0) {
        return res.status(400).json({ success: false, error: "Campo 'presencas' é obrigatório" });
    }

    let salvos = 0;
    let erros = 0;

    for (const presenca of presencas) {
        const { id_estudante, idperiodo, iddisciplina, data_aula, presente, justificativa } = presenca;

        try {
            const sqlCheck = `
                SELECT id_presenca FROM presencas 
                WHERE id_estudante = ? AND idperiodo = ? AND iddisciplina = ? AND DATE(data_aula) = DATE(?)
            `;

            const [existing] = await new Promise((resolve, reject) => {
                conexao.query(sqlCheck, [id_estudante, idperiodo, iddisciplina, data_aula], (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
            });

            if (existing && existing.length > 0) {
                erros++;
                continue;
            }

            const sqlInsert = `
                INSERT INTO presencas (id_estudante, idperiodo, iddisciplina, data_aula, presente, justificativa)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            await new Promise((resolve, reject) => {
                conexao.query(sqlInsert, [id_estudante, idperiodo, iddisciplina, data_aula, presente || 0, justificativa || null], (error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });
            salvos++;
        } catch (error) {
            erros++;
        }
    }

    return res.status(200).json({
        success: true,
        message: `${salvos} presença(s) registrada(s), ${erros} duplicata(s) ignorada(s)`
    });
});

// ==================== AULAS ====================

/**
 * @swagger
 * /aula:
 *   post:
 *     summary: Criar ou atualizar aula
 */
router.post('/aula', async (req, res) => {
    const { idperiodo, iddisciplina, data_aula, conteudo, observacoes } = req.body;

    if (!idperiodo || !iddisciplina || !data_aula) {
        return res.status(400).json({ success: false, error: "Campos obrigatórios: idperiodo, iddisciplina, data_aula" });
    }

    const sqlCheck = `SELECT id_aula FROM aulas WHERE idperiodo = ? AND iddisciplina = ? AND DATE(data_aula) = DATE(?)`;

    conexao.query(sqlCheck, [idperiodo, iddisciplina, data_aula], (error, results) => {
        if (error) {
            return res.status(500).json({ success: false, error: "Erro interno do servidor" });
        }

        if (results.length > 0) {
            const sqlUpdate = `UPDATE aulas SET conteudo = ?, observacoes = ?, data_atualizacao = NOW() WHERE id_aula = ?`;
            conexao.query(sqlUpdate, [conteudo || null, observacoes || null, results[0].id_aula], (updateError) => {
                if (updateError) {
                    return res.status(500).json({ success: false, error: "Erro ao atualizar aula" });
                }
                return res.status(200).json({ success: true, message: "Aula atualizada com sucesso" });
            });
        } else {
            const sqlInsert = `INSERT INTO aulas (idperiodo, iddisciplina, data_aula, conteudo, observacoes, data_criacao) VALUES (?, ?, ?, ?, ?, NOW())`;
            conexao.query(sqlInsert, [idperiodo, iddisciplina, data_aula, conteudo || null, observacoes || null], (insertError) => {
                if (insertError) {
                    return res.status(500).json({ success: false, error: "Erro ao criar aula" });
                }
                return res.status(201).json({ success: true, message: "Aula criada com sucesso" });
            });
        }
    });
});

module.exports = router;