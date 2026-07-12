const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const { uploadTopico, deletarTopicoArquivo } = require("../../infra/upload");
require("dotenv").config({ quiet: true });

// ==================== POST - Criar Nova Inscrição ====================
router.post('/estudanteInscricao', async (req, res) => {
    const {
        nome,
        contacto,
        genero,
        email,
        bi,
        id_curso,
        id_periodo,
        senha,
        foto
    } = req.body;

    if (!nome || !contacto || !email || !bi || !id_curso || !id_periodo) {
        return res.status(400).json({
            error: "Todos os campos obrigatórios devem ser preenchidos: nome, contacto, email, bi, id_curso, id_periodo"
        });
    }

    try {
        // Verificar se email já existe
        const emailExists = await new Promise((resolve, reject) => {
            conexao.query("SELECT * FROM estudante_inscricao WHERE email = ?", [email], (error, result) => {
                if (error) reject(error);
                resolve(result.length > 0);
            });
        });

        if (emailExists) {
            return res.status(400).json({ error: "Email já cadastrado" });
        }

        // Verificar se BI já existe
        const biExists = await new Promise((resolve, reject) => {
            conexao.query("SELECT * FROM estudante_inscricao WHERE bi = ?", [bi], (error, result) => {
                if (error) reject(error);
                resolve(result.length > 0);
            });
        });

        if (biExists) {
            return res.status(400).json({ error: "BI já cadastrado" });
        }

        // Gerar código de inscrição (número aleatório de 8 dígitos)
        const codigo = Math.floor(10000000 + Math.random() * 90000000);

        // Gerar ID único
        const id_est = `est_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        // Hash da senha
        const senhaParaHash = senha || codigo.toString();
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senhaParaHash, saltRounds);

        const sql = `
            INSERT INTO estudante_inscricao 
            (id_est, nome, contacto, genero, email, bi, status, id_curso, id_periodo, codigo, senha, foto) 
            VALUES (?, ?, ?, ?, ?, ?, 'Pendente', ?, ?, ?, ?, ?)
        `;

        const values = [
            id_est,
            nome,
            contacto,
            genero || null,
            email,
            bi,
            id_curso,
            id_periodo,
            codigo,
            senhaHash,
            foto || null
        ];

        conexao.query(sql, values, (error, result) => {
            if (error) {
                console.error("Erro ao criar inscrição:", error);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: error.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Inscrição realizada com sucesso",
                data: {
                    id_est: id_est,
                    codigo: codigo,
                    nome: nome,
                    email: email
                }
            });
        });

    } catch (error) {
        console.error("Erro ao processar inscrição:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// ==================== POST - Adicionar Documento ao Estudante ====================
router.post('/estudanteDocumento', async (req, res) => {
    const { id_est, titulo, doc } = req.body;

    if (!id_est || !titulo || !doc) {
        return res.status(400).json({
            error: "Campos obrigatórios: id_est, titulo, doc"
        });
    }

    try {
        // Verificar se o estudante existe
        const checkSql = "SELECT * FROM estudante_inscricao WHERE id_est = ?";
        const checkResult = await new Promise((resolve, reject) => {
            conexao.query(checkSql, [id_est], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });

        if (checkResult.length === 0) {
            return res.status(404).json({ error: "Estudante não encontrado" });
        }

        // Gerar ID único para o documento
        const id_fei = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        const sql = `
            INSERT INTO ficheiro_estudante_inscricao 
            (id_fei, titulo, doc, id_est) 
            VALUES (?, ?, ?, ?)
        `;

        conexao.query(sql, [id_fei, titulo, doc, id_est], (error, result) => {
            if (error) {
                console.error("Erro ao adicionar documento:", error);
                return res.status(500).json({
                    error: "Erro interno do servidor",
                    details: error.message
                });
            }

            const baseUrl = `${req.protocol}://${req.get('host')}`;

            res.status(201).json({
                success: true,
                message: "Documento adicionado com sucesso",
                data: {
                    id_fei: id_fei,
                    titulo: titulo,
                    docUrl: `${baseUrl}/api/img/estudantes/documentos/${doc}`
                }
            });
        });

    } catch (error) {
        console.error("Erro ao processar documento:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// ==================== POST - Tópico ====================
router.post('/topico', (req, res) => {
    uploadTopico(req, res, async (err) => {
        if (err) {
            console.error("Erro no upload:", err);
            return res.status(400).json({ error: err.message || "Erro no upload do arquivo" });
        }

        // O multer coloca os campos de texto no req.body
        // O arquivo fica no req.file
        const { topico, id_user } = req.body;

        // Validação
        if (!topico || topico.trim() === '') {
            if (req.file) {
                deletarTopicoArquivo(req.file.filename);
            }
            return res.status(400).json({ error: "Tópico é obrigatório" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "Arquivo PDF é obrigatório" });
        }

        // ID do funcionário (do dump ou do usuário logado)
        const id_func = id_user || '01ec45fe-1362-4f18-85d4-81902ab57fe7';

        // Deletar tópicos antigos
        const deleteSql = "DELETE FROM topicoexamiinscricao";

        conexao.query(deleteSql, (deleteError) => {
            if (deleteError) {
                console.error("Erro ao deletar tópicos antigos:", deleteError);
                if (req.file) {
                    deletarTopicoArquivo(req.file.filename);
                }
                return res.status(500).json({ error: "Erro ao processar" });
            }

            const id_topicoexame = `top_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
            const nomeArquivo = req.file.filename;

            const insertSql = `INSERT INTO topicoexamiinscricao 
                (id_topicoexame, topico, arquivo, id_func, status, data_criacao) 
                VALUES (?, ?, ?, ?, 'Ativo', CURDATE())`;

            conexao.query(insertSql, [id_topicoexame, topico.trim(), nomeArquivo, id_func], (insertError, insertResult) => {
                if (insertError) {
                    console.error("Erro ao salvar tópico:", insertError);
                    if (req.file) {
                        deletarTopicoArquivo(req.file.filename);
                    }
                    return res.status(500).json({ error: "Erro ao salvar tópico" });
                }

                res.status(200).json({
                    success: true,
                    message: "Tópico salvo com sucesso",
                    data: {
                        id_topicoexame: id_topicoexame,
                        topico: topico.trim(),
                        arquivo: nomeArquivo
                    }
                });
            });
        });
    });
});

// ==================== POST - Upload de Foto ====================
router.post('/uploadFoto', (req, res) => {
    res.status(501).json({ error: "Funcionalidade em desenvolvimento" });
});

module.exports = router;