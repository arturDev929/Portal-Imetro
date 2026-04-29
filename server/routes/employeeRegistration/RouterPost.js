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