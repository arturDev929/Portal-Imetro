const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");

router.get('/EstudantesInscritos', (req, res) => {
    const sql = "SELECT * FROM estudanteinscricao ei INNER JOIN curso c ON ei.idcurso = c.idcurso WHERE pdf_InscricaoRupe IS NULL AND estado_estdanteInscrito = 'Pendente' ORDER BY ei.nome_estudanteInscricao ASC";
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
                 WHERE estado_estdanteInscrito = ? 
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
                    SUM(CASE WHEN estado_estdanteInscrito = 'Pendente' THEN 1 ELSE 0 END) as pendentes,
                    SUM(CASE WHEN estado_estdanteInscrito = 'Aprovado' THEN 1 ELSE 0 END) as aprovados,
                    SUM(CASE WHEN estado_estdanteInscrito = 'Reprovado' THEN 1 ELSE 0 END) as reprovados,
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