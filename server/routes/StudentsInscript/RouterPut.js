const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const fs = require('fs');
const path = require('path');
const bcrypt = require("bcryptjs");

router.put('/pagementoInscricao/:codigoEstudanteInscricao', async (req, res) => {
    const { codigoEstudanteInscricao } = req.params;
    const { files } = req.body;

    if (!files || !files.comprovante) {
        return res.status(400).json({ 
            error: "Nenhum arquivo enviado",
            message: "É necessário enviar o comprovante de pagamento em PDF"
        });
    }

    const comprovante = files.comprovante;
    
    const extensao = comprovante.name.split('.').pop().toLowerCase();
    
    if (extensao !== 'pdf') {
        return res.status(400).json({
            error: "Formato inválido",
            message: "Apenas arquivos PDF são permitidos"
        });
    }

    if (comprovante.size > 5 * 1024 * 1024) {
        return res.status(400).json({
            error: "Arquivo muito grande",
            message: "Tamanho máximo permitido: 5MB"
        });
    }

    const timestamp = Date.now();
    const nomeArquivo = `${codigoEstudanteInscricao}_${timestamp}.pdf`;
    
    const uploadDir = path.join(__dirname, '../../client/src/img/estudantes/Pagamento_Inscricao');
    const caminhoArquivo = path.join(uploadDir, nomeArquivo);
    
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {

        await comprovante.mv(caminhoArquivo);

        const sql = "UPDATE estudanteinscricao SET pdf_InscricaoRupe = ? WHERE numeroInscricao_estudanteInscricao = ?";
        
        conexao.query(sql, [nomeArquivo, codigoEstudanteInscricao], (error, result) => {
            if (error) {
                console.error("Erro ao atualizar banco de dados:", error);
                // Remove o arquivo se falhou no banco
                fs.unlinkSync(caminhoArquivo);
                return res.status(500).json({ 
                    error: "Erro ao salvar no banco de dados", 
                    details: error.message 
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    error: "Estudante não encontrado",
                    message: `Nenhum estudante com o código ${codigoEstudanteInscricao} foi encontrado`
                });
            }

            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const pdfUrl = `${baseUrl}/api/img/estudantes/Pagamento_Inscricao/${nomeArquivo}`;

            res.status(200).json({ 
                success: true, 
                message: "Comprovante de pagamento enviado com sucesso",
                pdfUrl: pdfUrl,
                nomeArquivo: nomeArquivo
            });
        });
        
    } catch (error) {
        console.error("Erro ao salvar arquivo:", error);
        res.status(500).json({ 
            error: "Erro ao salvar o arquivo", 
            details: error.message 
        });
    }
});

router.put('/pagamentoMatricula/:codigoEstudanteInscricao', async (req, res) => {
    const { codigoEstudanteInscricao } = req.params;
    const { files } = req.body;
    
    if (!files || !files.comprovante) {
        return res.status(400).json({ 
            error: "Nenhum arquivo enviado",
            message: "É necessário enviar o comprovante de matrícula em PDF"
        });
    }

    const comprovante = files.comprovante;
    const extensao = comprovante.name.split('.').pop().toLowerCase();
    
    if (extensao !== 'pdf') {
        return res.status(400).json({
            error: "Formato inválido",
            message: "Apenas arquivos PDF são permitidos"
        });
    }

    if (comprovante.size > 5 * 1024 * 1024) {
        return res.status(400).json({
            error: "Arquivo muito grande",
            message: "Tamanho máximo permitido: 5MB"
        });
    }

    const timestamp = Date.now();
    const nomeArquivo = `matricula_${codigoEstudanteInscricao}_${timestamp}.pdf`;
    const uploadDir = path.join(__dirname, '../../client/src/img/estudantes/Pagamento_Matricula');
    const caminhoArquivo = path.join(uploadDir, nomeArquivo);
    
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
        await comprovante.mv(caminhoArquivo);

        const sql = "UPDATE estudanteinscricao SET pdf_MatriculaRupe = ? WHERE numeroInscricao_estudanteInscricao = ?";
        
        conexao.query(sql, [nomeArquivo, codigoEstudanteInscricao], (error, result) => {
            if (error) {
                fs.unlinkSync(caminhoArquivo);
                return res.status(500).json({ 
                    error: "Erro ao salvar no banco de dados", 
                    details: error.message 
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    error: "Estudante não encontrado"
                });
            }

            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const pdfUrl = `${baseUrl}/api/img/estudantes/Pagamento_Matricula/${nomeArquivo}`;

            res.status(200).json({ 
                success: true, 
                message: "Comprovante de matrícula enviado com sucesso",
                pdfUrl: pdfUrl,
                nomeArquivo: nomeArquivo
            });
        });
        
    } catch (error) {
        res.status(500).json({ 
            error: "Erro ao salvar o arquivo", 
            details: error.message 
        });
    }
});

module.exports = router;