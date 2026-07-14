const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const bcrypt = require("bcryptjs");

// ==================== PUT - Aceitar Inscrição (Admitir) ====================
router.put('/estudanteInscritoAceitar/:id', (req, res) => {
    const { id } = req.params;

    if (!id || id.length < 10) {
        return res.status(400).json({ error: "ID do estudante inválido" });
    }

    const checkSql = "SELECT * FROM estudante_inscricao WHERE id_est = ?";

    conexao.query(checkSql, [id], (checkError, checkResult) => {
        if (checkError) {
            console.error("Erro ao verificar estudante:", checkError);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: checkError.message
            });
        }

        if (checkResult.length === 0) {
            return res.status(404).json({ error: "Estudante não encontrado" });
        }

        const estudante = checkResult[0];

        if (estudante.status === 'Admitido' || estudante.status === 'Matriculado') {
            return res.status(400).json({
                error: `Estudante já está ${estudante.status === 'Admitido' ? 'admitido' : 'matriculado'}`
            });
        }

        const updateSql = "UPDATE estudante_inscricao SET status = 'Admitido' WHERE id_est = ?";

        conexao.query(updateSql, [id], (updateError, updateResult) => {
            if (updateError) {
                console.error("Erro ao admitir estudante:", updateError);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: updateError.message
                });
            }

            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ error: "Estudante não encontrado" });
            }

            res.status(200).json({
                success: true,
                message: "Estudante admitido com sucesso",
                data: {
                    id_est: id,
                    status: 'Admitido'
                }
            });
        });
    });
});

// ==================== PUT - Recusar Inscrição (Não Admitir) ====================
router.put('/estudanteInscritoRecusar/:id', (req, res) => {
    const { id } = req.params;

    if (!id || id.length < 10) {
        return res.status(400).json({ error: "ID do estudante inválido" });
    }

    const checkSql = "SELECT * FROM estudante_inscricao WHERE id_est = ?";

    conexao.query(checkSql, [id], (checkError, checkResult) => {
        if (checkError) {
            console.error("Erro ao verificar estudante:", checkError);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: checkError.message
            });
        }

        if (checkResult.length === 0) {
            return res.status(404).json({ error: "Estudante não encontrado" });
        }

        const estudante = checkResult[0];

        if (estudante.status === 'Não Admitido') {
            return res.status(400).json({ error: "Estudante já foi recusado" });
        }

        if (estudante.status === 'Admitido' || estudante.status === 'Matriculado') {
            return res.status(400).json({
                error: `Estudante já está ${estudante.status === 'Admitido' ? 'admitido' : 'matriculado'}`
            });
        }

        const updateSql = "UPDATE estudante_inscricao SET status = 'Não Admitido' WHERE id_est = ?";

        conexao.query(updateSql, [id], (updateError, updateResult) => {
            if (updateError) {
                console.error("Erro ao recusar estudante:", updateError);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: updateError.message
                });
            }

            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ error: "Estudante não encontrado" });
            }

            res.status(200).json({
                success: true,
                message: "Estudante recusado com sucesso",
                data: {
                    id_est: id,
                    status: 'Não Admitido'
                }
            });
        });
    });
});

// ==================== PUT - Reverter Reprovação/Não Admitido para Pendente ====================
router.put('/estudanteInscritoReverter/:id', (req, res) => {
    const { id } = req.params;

    if (!id || id.length < 10) {
        return res.status(400).json({ error: "ID do estudante inválido" });
    }

    const checkSql = "SELECT * FROM estudante_inscricao WHERE id_est = ?";

    conexao.query(checkSql, [id], (checkError, checkResult) => {
        if (checkError) {
            console.error("Erro ao verificar estudante:", checkError);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: checkError.message
            });
        }

        if (checkResult.length === 0) {
            return res.status(404).json({ error: "Estudante não encontrado" });
        }

        const estudante = checkResult[0];

        if (estudante.status !== 'Reprovado' && estudante.status !== 'Não Admitido') {
            return res.status(400).json({
                error: `Estudante está ${estudante.status}. Apenas 'Reprovado' ou 'Não Admitido' podem ser revertidos`
            });
        }

        const updateSql = "UPDATE estudante_inscricao SET status = 'Pendente' WHERE id_est = ?";

        conexao.query(updateSql, [id], (updateError, updateResult) => {
            if (updateError) {
                console.error("Erro ao reverter estudante:", updateError);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: updateError.message
                });
            }

            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ error: "Estudante não encontrado" });
            }

            res.status(200).json({
                success: true,
                message: "Estudante revertido para pendente com sucesso",
                data: {
                    id_est: id,
                    status: 'Pendente'
                }
            });
        });
    });
});

// ==================== PUT - Lançar Nota ====================
router.put('/estudanteInscritoNota/:codigoEstudante', (req, res) => {
    const { codigoEstudante } = req.params;
    const { nota } = req.body;

    if (!codigoEstudante || isNaN(codigoEstudante) || codigoEstudante <= 0) {
        return res.status(400).json({ error: "Código do estudante inválido" });
    }

    if (nota === undefined || isNaN(nota) || nota < 0 || nota > 20) {
        return res.status(400).json({ error: "Nota inválida. Deve ser entre 0 e 20" });
    }

    const checkSql = "SELECT * FROM estudante_inscricao WHERE codigo = ?";

    conexao.query(checkSql, [codigoEstudante], (checkError, checkResult) => {
        if (checkError) {
            console.error("Erro ao verificar estudante:", checkError);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: checkError.message
            });
        }

        if (checkResult.length === 0) {
            return res.status(404).json({ error: "Estudante não encontrado" });
        }

        // Determinar novo status baseado na nota
        let novoStatus;
        if (nota >= 10) {
            novoStatus = 'Aprovado';
        }else {
            novoStatus = 'Reprovado';
        }

        const updateSql = "UPDATE estudante_inscricao SET nota = ?, status = ? WHERE codigo = ?";

        conexao.query(updateSql, [nota, novoStatus, codigoEstudante], (updateError, updateResult) => {
            if (updateError) {
                console.error("Erro ao atualizar estudante:", updateError);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: updateError.message
                });
            }

            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ error: "Erro ao atualizar estudante" });
            }

            res.status(200).json({
                success: true,
                message: `Nota lançada com sucesso. Status: ${novoStatus}`,
                data: {
                    codigo: codigoEstudante,
                    nota: nota,
                    status: novoStatus
                }
            });
        });
    });
});

// ==================== PUT - Matricular Estudante ====================
router.put('/estudanteMatricular/:id', (req, res) => {
    const { id } = req.params;

    if (!id || id.length < 10) {
        return res.status(400).json({ error: "ID do estudante inválido" });
    }

    const checkSql = "SELECT * FROM estudante_inscricao WHERE id_est = ?";

    conexao.query(checkSql, [id], (checkError, checkResult) => {
        if (checkError) {
            console.error("Erro ao verificar estudante:", checkError);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: checkError.message
            });
        }

        if (checkResult.length === 0) {
            return res.status(404).json({ error: "Estudante não encontrado" });
        }

        const estudante = checkResult[0];

        if (estudante.status !== 'Admitido' && estudante.status !== 'Aprovado') {
            return res.status(400).json({
                error: `Estudante está ${estudante.status}. Apenas 'Admitido' ou 'Aprovado' podem ser matriculados`
            });
        }

        if (estudante.status === 'Matriculado') {
            return res.status(400).json({ error: "Estudante já está matriculado" });
        }

        const updateSql = "UPDATE estudante_inscricao SET status = 'Matriculado' WHERE id_est = ?";

        conexao.query(updateSql, [id], (updateError, updateResult) => {
            if (updateError) {
                console.error("Erro ao matricular estudante:", updateError);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: updateError.message
                });
            }

            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ error: "Estudante não encontrado" });
            }

            res.status(200).json({
                success: true,
                message: "Estudante matriculado com sucesso",
                data: {
                    id_est: id,
                    status: 'Matriculado'
                }
            });
        });
    });
});

// ==================== PUT - Atualizar Dados do Estudante ====================
router.put('/estudanteAtualizar/:id', (req, res) => {
    const { id } = req.params;
    const { nome, contacto, genero, email, bi, id_curso, id_periodo } = req.body;

    if (!id || id.length < 10) {
        return res.status(400).json({ error: "ID do estudante inválido" });
    }

    const checkSql = "SELECT * FROM estudante_inscricao WHERE id_est = ?";

    conexao.query(checkSql, [id], (checkError, checkResult) => {
        if (checkError) {
            console.error("Erro ao verificar estudante:", checkError);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: checkError.message
            });
        }

        if (checkResult.length === 0) {
            return res.status(404).json({ error: "Estudante não encontrado" });
        }

        let updateFields = [];
        let updateValues = [];

        if (nome) { updateFields.push("nome = ?"); updateValues.push(nome); }
        if (contacto) { updateFields.push("contacto = ?"); updateValues.push(contacto); }
        if (genero) { updateFields.push("genero = ?"); updateValues.push(genero); }
        if (email) { updateFields.push("email = ?"); updateValues.push(email); }
        if (bi) { updateFields.push("bi = ?"); updateValues.push(bi); }
        if (id_curso) { updateFields.push("id_curso = ?"); updateValues.push(id_curso); }
        if (id_periodo) { updateFields.push("id_periodo = ?"); updateValues.push(id_periodo); }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: "Nenhum campo para atualizar" });
        }

        updateValues.push(id);
        const sql = `UPDATE estudante_inscricao SET ${updateFields.join(', ')} WHERE id_est = ?`;

        conexao.query(sql, updateValues, (updateError, updateResult) => {
            if (updateError) {
                console.error("Erro ao atualizar estudante:", updateError);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: updateError.message
                });
            }

            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ error: "Estudante não encontrado" });
            }

            res.status(200).json({
                success: true,
                message: "Dados do estudante atualizados com sucesso",
                data: { id_est: id }
            });
        });
    });
});

router.put('/topico/:id', async (req, res) => {
    const { id } = req.params;
    const { topico, id_user } = req.body;

    if (!id) {
        return res.status(400).json({ error: "ID do tópico é obrigatório" });
    }

    if (!topico || topico.trim() === '') {
        return res.status(400).json({ error: "Tópico é obrigatório" });
    }

    const checkSql = "SELECT * FROM topicoexamiinscricao WHERE id_topicoexame = ?";
    conexao.query(checkSql, [id], (checkError, checkResult) => {
        if (checkError) {
            console.error("Erro ao verificar tópico:", checkError);
            return res.status(500).json({ error: "Erro interno do servidor" });
        }

        if (checkResult.length === 0) {
            return res.status(404).json({ error: "Tópico não encontrado" });
        }

        const updateSql = "UPDATE topicoexamiinscricao SET topico = ? WHERE id_topicoexame = ?";
        conexao.query(updateSql, [topico.trim(), id], (updateError, updateResult) => {
            if (updateError) {
                console.error("Erro ao atualizar tópico:", updateError);
                return res.status(500).json({ error: "Erro ao atualizar tópico" });
            }

            res.status(200).json({
                success: true,
                message: "Tópico atualizado com sucesso"
            });
        });
    });
});

module.exports = router;