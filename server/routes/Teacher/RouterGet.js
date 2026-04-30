const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");

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
            return res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
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
                return res.status(500).json({ 
                    error: "Erro interno do servidor", 
                    details: error.message 
                });
            }
            
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            
            const professorCompleto = {
                ...professor,
                fotoUrl: professor.fotoprofessor ? 
                    `${baseUrl}/api/img/professores/${professor.fotoprofessor}` : 
                    null,
                curriculoUrl: professor.bipdfprofessor ? 
                    `${baseUrl}/api/img/professores/DocBI/${professor.bipdfprofessor}` : 
                    null,
                disciplinas: disciplinasResult
            };
            
            return res.status(200).json(professorCompleto);
        });
    });
});

module.exports = router;

/**
 * @swagger
 * /PerfilProfessor/{codigo}:
 *   get:
 *     summary: Buscar perfil completo do professor
 *     tags: [Professor]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *         description: Código do professor
 *     responses:
 *       200:
 *         description: Perfil do professor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idprofessor:
 *                   type: integer
 *                 nomeprofessor:
 *                   type: string
 *                 fotoUrl:
 *                   type: string
 *                 curriculoUrl:
 *                   type: string
 *                 disciplinas:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Professor não encontrado
 *       500:
 *         description: Erro no servidor
 */