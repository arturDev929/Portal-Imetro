const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");

router.get('/EstudantesInscritos/:codigoEstudanteInscrito', (req, res) => {
    const { codigoEstudanteInscrito } = req.params;
    const sql = "SELECT * FROM estudanteinscricao inner join curso on estudanteinscricao.idcurso = curso.idcurso WHERE estudanteinscricao.numeroInscricao_estudanteInscricao= ?";
    conexao.query(sql,[codigoEstudanteInscrito], (error, result) => {
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
                docInscricao: estudante.pdf_MatriculaRupe ? `${baseUrl}/api/img/estudantes/Pagamento_Matricula/${estudante.pdf_MatriculaRupe}` : null,

            }))
        }
    });
});

module.exports = router;

/**
 * @swagger
 * /EstudantesInscritos/{codigoEstudanteInscrito}:
 *   get:
 *     summary: Buscar dados do estudante inscrito
 *     tags: [Estudante]
 *     parameters:
 *       - in: path
 *         name: codigoEstudanteInscrito
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de inscrição do estudante
 *     responses:
 *       200:
 *         description: Dados do estudante encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   numeroInscricao_estudanteInscricao:
 *                     type: string
 *                   nome_estudanteInscricao:
 *                     type: string
 *                   email_estudanteInscricao:
 *                     type: string
 *                   telefone_estudanteInscricao:
 *                     type: string
 *                   fotoUrl:
 *                     type: string
 *                     nullable: true
 *                   docUrl:
 *                     type: string
 *                     nullable: true
 *                   docInscricao:
 *                     type: string
 *                     nullable: true
 *                   idcurso:
 *                     type: integer
 *                   curso:
 *                     type: object
 *                     properties:
 *                       idcurso:
 *                         type: integer
 *                       nomecurso:
 *                         type: string
 *       404:
 *         description: Estudante não encontrado
 *       500:
 *         description: Erro interno do servidor
 */