const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");

router.get('/EstudantesInscritos', (req, res) => {
    const sql = "SELECT * FROM estudanteinscricao ei INNER JOIN curso c ON ei.idcurso = c.idcurso WHERE pdf_InscricaoRupe IS NULL AND estado_estudanteInscrito = 'Pendente' ORDER BY ei.nome_estudanteInscricao ASC";
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar professores:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const estudanteFoto = result.map(estudante =>({
                ...estudante,
                fotoUrl: estudante.foto_estudanteInscricao ? `${baseUrl}/api/img/estudantes/${estudante.foto_estudanteInscricao}` : null,
                docUrl: estudante.documento_estudanteInscricao ? `${baseUrl}/api/img/estudantes/documentos/${estudante.documento_estudanteInscricao}` : null,
                docInscricao: estudante.pdf_InscricaoRupe ? `${baseUrl}/api/img/estudantes/Pagamento_Inscricao/${estudante.pdf_InscricaoRupe}` : null,

            }))
            res.status(200).json(estudanteFoto);
        }
    });
});

router.get('/EstudantesByStatus/:status', (req, res) => {
    const { status } = req.params;
    const sql = `SELECT * FROM estudanteinscricao ei 
                 INNER JOIN curso c ON ei.idcurso = c.idcurso 
                 WHERE estado_estudanteInscrito = ? 
                 ORDER BY ei.nome_estudanteInscricao ASC`;
    
    conexao.query(sql, [status], (error, result) => {
        if(error) {
            console.error(`Erro ao buscar ${status}:`, error);
            res.status(500).json({ error: "Erro interno" });
        } else {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const estudantesFormatados = result.map(estudante => ({
                ...estudante,
                fotoUrl: estudante.foto_estudanteInscricao ? 
                    `${baseUrl}/api/img/estudantes/${estudante.foto_estudanteInscricao}` : null,
                docUrl: estudante.documento_estudanteInscricao ? 
                    `${baseUrl}/api/img/estudantes/documentos/${estudante.documento_estudanteInscricao}` : null
            }));
            res.status(200).json(estudantesFormatados);
        }
    });
});

router.get('/EstatisticasInscricoes', (req, res) => {
    const sql = `SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN estado_estudanteInscrito = 'Pendente' THEN 1 ELSE 0 END) as pendentes,
                    SUM(CASE WHEN estado_estudanteInscrito = 'Aprovado' THEN 1 ELSE 0 END) as aprovados,
                    SUM(CASE WHEN estado_estudanteInscrito = 'Reprovado' THEN 1 ELSE 0 END) as reprovados,
                    SUM(CASE WHEN pdf_InscricaoRupe IS NULL THEN 1 ELSE 0 END) as sem_pagamento
                 FROM estudanteinscricao`;
    
    conexao.query(sql, (error, result) => {
        if(error) {
            console.error("Erro ao buscar estatísticas:", error);
            res.status(500).json({ error: "Erro interno" });
        } else {
            res.status(200).json(result[0]);
        }
    });
});

router.get('/Topico', async (req, res) => {
    const sql = "SELECT id_topico, topico FROM topicos LIMIT 1";
    
    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao buscar tópico:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: "Nenhum tópico encontrado" });
        }

        res.status(200).json({ success: true, data: result[0] });
    });
});

module.exports = router;


/**
 * @swagger
 * /EstudantesInscritos:
 *   get:
 *     summary: Buscar todos os estudantes inscritos pendentes sem comprovante de pagamento
 *     tags: [Estudante - Inscrição]
 *     description: Retorna estudantes com status "Pendente" e sem comprovante de inscrição (pdf_InscricaoRupe IS NULL)
 *     responses:
 *       200:
 *         description: Lista de estudantes pendentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_estudanteInscricao:
 *                     type: integer
 *                   nome_estudanteInscricao:
 *                     type: string
 *                   email_estudanteInscricao:
 *                     type: string
 *                   numeroInscricao_estudanteInscricao:
 *                     type: string
 *                   estado_estudanteInscrito:
 *                     type: string
 *                     example: "Pendente"
 *                   fotoUrl:
 *                     type: string
 *                     nullable: true
 *                   docUrl:
 *                     type: string
 *                     nullable: true
 *                   docInscricao:
 *                     type: string
 *                     nullable: true
 *                   nomecurso:
 *                     type: string
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /EstudantesByStatus/{status}:
 *   get:
 *     summary: Buscar estudantes por status
 *     tags: [Estudante - Inscrição]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Pendente, Aprovado, Reprovado]
 *         description: Status do estudante
 *         example: "Aprovado"
 *     responses:
 *       200:
 *         description: Lista de estudantes filtrados por status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_estudanteInscricao:
 *                     type: integer
 *                   nome_estudanteInscricao:
 *                     type: string
 *                   email_estudanteInscricao:
 *                     type: string
 *                   numeroInscricao_estudanteInscricao:
 *                     type: string
 *                   estado_estudanteInscrito:
 *                     type: string
 *                   fotoUrl:
 *                     type: string
 *                     nullable: true
 *                   docUrl:
 *                     type: string
 *                     nullable: true
 *                   nomecurso:
 *                     type: string
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /EstatisticasInscricoes:
 *   get:
 *     summary: Obter estatísticas de inscrições
 *     tags: [Estudante - Inscrição]
 *     description: Retorna totais de inscrições por status e pagamento
 *     responses:
 *       200:
 *         description: Estatísticas consolidadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total de inscrições
 *                   example: 150
 *                 pendentes:
 *                   type: integer
 *                   description: Inscrições pendentes
 *                   example: 45
 *                 aprovados:
 *                   type: integer
 *                   description: Inscrições aprovadas
 *                   example: 80
 *                 reprovados:
 *                   type: integer
 *                   description: Inscrições reprovadas
 *                   example: 25
 *                 sem_pagamento:
 *                   type: integer
 *                   description: Inscrições sem comprovante de pagamento
 *                   example: 30
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /Topico:
 *   get:
 *     summary: Buscar o tópico atual
 *     tags: [Tópicos]
 *     description: Retorna o primeiro (e único) tópico cadastrado no sistema
 *     responses:
 *       200:
 *         description: Tópico encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_topico:
 *                       type: integer
 *                       example: 1
 *                     topico:
 *                       type: string
 *                       example: "Bem-vindos ao novo semestre letivo 2025"
 *       404:
 *         description: Nenhum tópico encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Nenhum tópico encontrado"
 *       500:
 *         description: Erro interno do servidor
 */
