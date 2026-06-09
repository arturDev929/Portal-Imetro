const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const verificarToken = require("../../middlewares/authMiddleware");
const { deletarFotoFuncionario, deletarDocumentoFuncionario } = require("../../utils/upload");

router.delete("/funcionario/:id", verificarToken, async (req, res) => {
    const { id } = req.params;

    try {
        const checkFuncionario = await new Promise((resolve, reject) => {
            conexao.query("SELECT nome, foto FROM funcionario WHERE id_func = ?", [id], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (checkFuncionario.length === 0) return res.status(404).json({ error: "Funcionario nao encontrado" });

        const nome = checkFuncionario[0].nome;
        const foto = checkFuncionario[0].foto;

        const documentos = await new Promise((resolve, reject) => {
            conexao.query("SELECT doc FROM doc_funcionario WHERE id_func = ?", [id], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });

        if (foto) deletarFotoFuncionario(foto);
        for (const doc of documentos) deletarDocumentoFuncionario(doc.doc);

        await new Promise((resolve, reject) => {
            conexao.query("DELETE FROM doc_funcionario WHERE id_func = ?", [id], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });

        await new Promise((resolve, reject) => {
            conexao.query("DELETE FROM funcionario WHERE id_func = ?", [id], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });

        res.status(200).json({ success: true, message: `Funcionario ${nome} excluido com sucesso` });
    } catch (error) {
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

router.delete('/desvincularProfessor/:iddisciplina/:idprofessor', (req, res) => {
    const { iddisciplina, idprofessor } = req.params;
    const sql = "DELETE FROM disc_professor WHERE id_professor = ? AND id_disciplina = ?";
    conexao.query(sql, [idprofessor, iddisciplina], (error, result) => {
        if (error) {
            console.error("Erro ao desvincular professor:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.status(200).json({
                message: "Professor desvinculado com sucesso",
                professoresAfetados: result.affectedRows
            });
        }
    });
});

module.exports = router;