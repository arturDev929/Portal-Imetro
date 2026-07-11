const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");

// ==================== DELETE - Deletar Inscrição ====================
router.delete('/estudanteInscricao/:id', async (req, res) => {
    const { id } = req.params;

    if (!id || id.length < 10) {
        return res.status(400).json({ error: "ID do estudante inválido" });
    }

    try {
        // Verificar se o estudante existe
        const checkSql = "SELECT * FROM estudante_inscricao WHERE id_est = ?";
        const checkResult = await new Promise((resolve, reject) => {
            conexao.query(checkSql, [id], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });

        if (checkResult.length === 0) {
            return res.status(404).json({ error: "Estudante não encontrado" });
        }

        // Verificar se o estudante já está matriculado
        if (checkResult[0].status === 'Matriculado') {
            return res.status(400).json({ error: "Não é possível deletar um estudante matriculado" });
        }

        // Buscar documentos para deletar os arquivos físicos
        const docSql = "SELECT doc FROM ficheiro_estudante_inscricao WHERE id_est = ?";
        const docResult = await new Promise((resolve, reject) => {
            conexao.query(docSql, [id], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });

        // Deletar documentos da tabela
        const deleteDocSql = "DELETE FROM ficheiro_estudante_inscricao WHERE id_est = ?";
        await new Promise((resolve, reject) => {
            conexao.query(deleteDocSql, [id], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });

        // Deletar o estudante
        const deleteSql = "DELETE FROM estudante_inscricao WHERE id_est = ?";
        conexao.query(deleteSql, [id], (deleteError, deleteResult) => {
            if (deleteError) {
                console.error("Erro ao deletar estudante:", deleteError);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: deleteError.message
                });
            }

            if (deleteResult.affectedRows === 0) {
                return res.status(404).json({ error: "Estudante não encontrado" });
            }

            res.status(200).json({
                success: true,
                message: "Inscrição deletada com sucesso"
            });
        });

    } catch (error) {
        console.error("Erro ao processar requisição:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// ==================== DELETE - Deletar Documento ====================
router.delete('/estudanteDocumento/:id_fei', async (req, res) => {
    const { id_fei } = req.params;

    if (!id_fei) {
        return res.status(400).json({ error: "ID do documento é obrigatório" });
    }

    try {
        // Verificar se o documento existe
        const checkSql = "SELECT * FROM ficheiro_estudante_inscricao WHERE id_fei = ?";
        const checkResult = await new Promise((resolve, reject) => {
            conexao.query(checkSql, [id_fei], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });

        if (checkResult.length === 0) {
            return res.status(404).json({ error: "Documento não encontrado" });
        }

        const deleteSql = "DELETE FROM ficheiro_estudante_inscricao WHERE id_fei = ?";

        conexao.query(deleteSql, [id_fei], (deleteError, deleteResult) => {
            if (deleteError) {
                console.error("Erro ao deletar documento:", deleteError);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: deleteError.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Documento deletado com sucesso"
            });
        });

    } catch (error) {
        console.error("Erro ao processar requisição:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// ==================== DELETE - Deletar Múltiplas Inscrições ====================
router.delete('/estudantesInscricao', async (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "IDs inválidos ou não fornecidos" });
    }

    try {
        // Verificar se todos os estudantes existem
        const placeholders = ids.map(() => '?').join(',');
        const checkSql = `SELECT id_est, status FROM estudante_inscricao WHERE id_est IN (${placeholders})`;

        const checkResult = await new Promise((resolve, reject) => {
            conexao.query(checkSql, ids, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });

        if (checkResult.length === 0) {
            return res.status(404).json({ error: "Nenhum estudante encontrado" });
        }

        // Verificar se algum está matriculado
        const matriculados = checkResult.filter(est => est.status === 'Matriculado');
        if (matriculados.length > 0) {
            return res.status(400).json({
                error: "Não é possível deletar estudantes matriculados",
                matriculados: matriculados.map(est => est.id_est)
            });
        }

        // Deletar documentos dos estudantes
        const deleteDocSql = `DELETE FROM ficheiro_estudante_inscricao WHERE id_est IN (${placeholders})`;
        await new Promise((resolve, reject) => {
            conexao.query(deleteDocSql, ids, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });

        // Deletar os estudantes
        const deleteSql = `DELETE FROM estudante_inscricao WHERE id_est IN (${placeholders})`;

        conexao.query(deleteSql, ids, (deleteError, deleteResult) => {
            if (deleteError) {
                console.error("Erro ao deletar estudantes:", deleteError);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: deleteError.message
                });
            }

            res.status(200).json({
                success: true,
                message: `${deleteResult.affectedRows} inscrição(ões) deletada(s) com sucesso`,
                deleted: deleteResult.affectedRows
            });
        });

    } catch (error) {
        console.error("Erro ao processar requisição:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// ==================== DELETE - Deletar Tópico ====================
router.delete('/Topico', async (req, res) => {
    const sql = "DELETE FROM topicoexamiinscricao";

    conexao.query(sql, (error, result) => {
        if (error) {
            console.error("Erro ao deletar tópico:", error);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Nenhum tópico encontrado para deletar" });
        }

        res.status(200).json({
            success: true,
            message: "Tópico(s) deletado(s) com sucesso"
        });
    });
});

module.exports = router;