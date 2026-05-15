const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");

router.delete('/aula/:id_aula', async (req, res) => {
    const { id_aula } = req.params;

    const sql = "DELETE FROM aulas WHERE id_aula = ?";
    
    conexao.query(sql, [id_aula], (error, result) => {
        if (error) {
            console.error("Erro ao deletar aula:", error);
            return res.status(500).json({ success: false, error: "Erro interno do servidor", details: error.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: "Aula não encontrada" });
        }

        return res.status(200).json({ success: true, message: "Aula deletada com sucesso" });
    });
});

module.exports = router;