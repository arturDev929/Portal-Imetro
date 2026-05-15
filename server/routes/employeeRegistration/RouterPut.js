const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const fs = require('fs');
const path = require('path');
const bcrypt = require("bcryptjs");

router.put('/estudanteInscritoAceitar/:id', (req, res) => {
    const { id } = req.params;
    
    // Validação do ID
    if (!id || isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "ID do estudante inválido" });
    }

    // Verificar se o estudante existe antes de atualizar
    const checkSql = "SELECT * FROM estudanteinscricao WHERE id_estudanteInscricao = ?";
    
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

        // Verificar se o estudante já está aprovado
        if (checkResult[0].estado_estdanteInscrito === 'Aprovado') {
            return res.status(400).json({ error: "Estudante já foi aprovado anteriormente" });
        }

        // Atualizar o estado do estudante
        const updateSql = "UPDATE estudanteinscricao SET estado_estdanteInscrito = 'Aprovado' WHERE id_estudanteInscricao = ?";
        
        conexao.query(updateSql, [id], (updateError, updateResult) => {
            if (updateError) {
                console.error("Erro ao aprovar estudante da inscrição:", updateError);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: updateError.message
                });
            }

            // Verificar se alguma linha foi afetada
            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ error: "Estudante não encontrado ou já aprovado" });
            }

            // Retornar sucesso
            res.status(200).json({
                success: true,
                message: `Estudante aprovado com sucesso`,
                data: {
                    id: id,
                    status: 'Aprovado'
                }
            });
        });
    });
});

router.put('/estudanteInscritoRecusar/:id', (req, res) => {
    const { id } = req.params;
    
    // Validação do ID
    if (!id || isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "ID do estudante inválido" });
    }

    // Verificar se o estudante existe
    const checkSql = "SELECT * FROM estudanteinscricao WHERE id_estudanteInscricao = ?";
    
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

        // Verificar se o estudante já está recusado
        if (checkResult[0].estado_estdanteInscrito === 'Reprovado') {
            return res.status(400).json({ error: "Estudante já foi recusado anteriormente" });
        }

        // Atualizar o estado do estudante para Recusado
        const updateSql = "UPDATE estudanteinscricao SET estado_estdanteInscrito = 'Reprovado' WHERE id_estudanteInscricao = ?";
        
        conexao.query(updateSql, [id], (updateError, updateResult) => {
            if (updateError) {
                console.error("Erro ao recusar estudante da inscrição:", updateError);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: updateError.message
                });
            }

            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ error: "Estudante não encontrado ou já recusado" });
            }

            res.status(200).json({
                success: true,
                message: `Estudante recusado com sucesso`,
                data: {
                    id: id,
                    status: 'Recusado'
                }
            });
        });
    });
});

router.put('/estudanteInscritoNota/:codigoEstudante', (req, res) => {
    const { codigoEstudante } = req.params;
    const { nota } = req.body;
    
    // Validações
    if (!codigoEstudante || isNaN(codigoEstudante) || codigoEstudante <= 0) {
        return res.status(400).json({ error: "ID do estudante inválido" });
    }

    if (nota === undefined || isNaN(nota) || nota < 0 || nota > 20) {
        return res.status(400).json({ error: "Nota inválida. Deve ser entre 0 e 20" });
    }

    const checkSql = "SELECT * FROM estudanteinscricao WHERE numeroInscricao_estudanteInscricao = ?";
    
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

        // Verificar se o estudante já está aprovado
        if (checkResult[0].estado_estdanteInscrito === 'Aprovado') {
            return res.status(400).json({ error: "Estudante já foi aprovado anteriormente" });
        }

        // Determinar o novo estado baseado na nota
        const novoEstado = nota >= 10 ? 'Aprovado' : 'Reprovado';
        
        // Atualizar nota e estado do estudante
        const updateSql = "UPDATE estudanteinscricao SET nota_estudanteInscricao = ?, estado_estdanteInscrito = ? WHERE numeroInscricao_estudanteInscricao = ?";
        
        conexao.query(updateSql, [nota, novoEstado, codigoEstudante], (updateError, updateResult) => {
            if (updateError) {
                console.error("Erro ao atualizar estudante:", updateError);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: updateError.message
                });
            }

            // Verificar se alguma linha foi afetada
            if (updateResult.affectedRows === 0) {
                return res.status(404).json({ error: "Erro ao atualizar estudante" });
            }

            // Retornar sucesso
            res.status(200).json({
                success: true,
                message: `Estudante ${novoEstado.toLowerCase()} com sucesso`,
                data: {
                    codigoEstudante: codigoEstudante,
                    nota: nota,
                    status: novoEstado
                }
            });
        });
    });
});

module.exports = router;

/**
 * @swagger
 * /estudanteInscritoAceitar/{id}:
 *   put:
 *     summary: Aceitar/Aprovar um estudante inscrito
 *     tags: [Estudante - Inscrição]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID do estudante (id_estudanteInscricao)
 *     responses:
 *       200:
 *         description: Estudante aprovado com sucesso
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
 *                   example: "Estudante aprovado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       example: "Aprovado"
 *       400:
 *         description: ID inválido ou estudante já aprovado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID do estudante inválido"
 *       404:
 *         description: Estudante não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Estudante não encontrado"
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /estudanteInscritoRecusar/{id}:
 *   put:
 *     summary: Recusar/Reprovar um estudante inscrito
 *     tags: [Estudante - Inscrição]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID do estudante (id_estudanteInscricao)
 *     responses:
 *       200:
 *         description: Estudante recusado com sucesso
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
 *                   example: "Estudante recusado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       example: "Recusado"
 *       400:
 *         description: ID inválido ou estudante já recusado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID do estudante inválido"
 *       404:
 *         description: Estudante não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Estudante não encontrado"
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /estudanteInscritoNota/{codigoEstudante}:
 *   put:
 *     summary: Atribuir nota e aprovar/reprovar estudante automaticamente
 *     tags: [Estudante - Inscrição]
 *     parameters:
 *       - in: path
 *         name: codigoEstudante
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de inscrição do estudante (numeroInscricao_estudanteInscricao)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nota
 *             properties:
 *               nota:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 20
 *                 description: Nota do estudante (0 a 20)
 *                 example: 15
 *     responses:
 *       200:
 *         description: Nota atribuída e status atualizado com sucesso
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
 *                   example: "Estudante aprovado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     codigoEstudante:
 *                       type: integer
 *                       example: 2024123456
 *                     nota:
 *                       type: number
 *                       example: 15
 *                     status:
 *                       type: string
 *                       enum: [Aprovado, Reprovado]
 *                       example: "Aprovado"
 *       400:
 *         description: ID inválido, nota inválida ou estudante já aprovado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Nota inválida. Deve ser entre 0 e 20"
 *       404:
 *         description: Estudante não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Estudante não encontrado"
 *       500:
 *         description: Erro interno do servidor
 */
