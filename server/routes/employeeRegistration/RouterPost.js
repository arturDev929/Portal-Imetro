const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
require("dotenv").config({ quiet: true });

router.post('/Topico', async (req, res) => {
    const { topico } = req.body;

    if (!topico || topico.trim() === '') {
        return res.status(400).json({ error: "Tópico é obrigatório" });
    }

    const deleteSql = "DELETE FROM topicos";
    
    conexao.query(deleteSql, (deleteError) => {
        if (deleteError) {
            return res.status(500).json({ error: "Erro ao processar" });
        }

        const insertSql = "INSERT INTO topicos (topico) VALUES (?)";
        
        conexao.query(insertSql, [topico.trim()], (insertError, insertResult) => {
            if (insertError) {
                return res.status(500).json({ error: "Erro ao salvar tópico" });
            }

            res.status(200).json({ 
                success: true, 
                message: "Tópico salvo com sucesso",
                data: { id_topico: insertResult.insertId, topico: topico }
            });
        });
    });
});

module.exports = router;

/**
 * @swagger
 * /Topico:
 *   post:
 *     summary: Salvar um novo tópico (remove todos os existentes primeiro)
 *     tags: [Tópicos]
 *     description: |
 *       Esta rota primeiro deleta TODOS os tópicos existentes e depois insere o novo tópico.
 *       Ou seja, sempre haverá apenas um tópico no banco de dados.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topico
 *             properties:
 *               topico:
 *                 type: string
 *                 description: Conteúdo do tópico a ser salvo
 *                 example: "Bem-vindos ao novo semestre letivo 2025"
 *                 minLength: 1
 *     responses:
 *       200:
 *         description: Tópico salvo com sucesso
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
 *                   example: "Tópico salvo com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_topico:
 *                       type: integer
 *                       example: 5
 *                     topico:
 *                       type: string
 *                       example: "Bem-vindos ao novo semestre letivo 2025"
 *       400:
 *         description: Tópico é obrigatório ou vazio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tópico é obrigatório"
 *       500:
 *         description: Erro ao processar ou salvar tópico
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro ao salvar tópico"
 */