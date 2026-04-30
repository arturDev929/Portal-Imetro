const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");

router.delete('/Topico', async (req, res) => {
    const sql = "DELETE FROM topicos";
    
    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao deletar tópico:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Nenhum tópico encontrado para deletar" });
        }

        res.status(200).json({ success: true, message: "Tópico deletado com sucesso" });
    });
});

module.exports = router;

/**
 * @swagger
 * /Topico:
 *   delete:
 *     summary: Deletar todos os tópicos
 *     tags: [Tópicos]
 *     description: Remove todos os registros da tabela de tópicos
 *     responses:
 *       200:
 *         description: Tópico(s) deletado(s) com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tópico deletado com sucesso"
 *       404:
 *         description: Nenhum tópico encontrado para deletar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Nenhum tópico encontrado para deletar"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro interno do servidor"
 */