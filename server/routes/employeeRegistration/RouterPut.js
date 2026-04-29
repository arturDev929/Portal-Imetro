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

module.exports = router;