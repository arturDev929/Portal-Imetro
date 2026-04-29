const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
require("dotenv").config({ quiet: true });


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Erro na configuração do email:", error);
    } else {
        console.log("Servidor de email configurado com sucesso");
    }
});

const codigosVerificacao = new Map();

setInterval(() => {
    const agora = Date.now();
    for (const [email, dados] of codigosVerificacao.entries()) {
        if (dados.expiracao < agora) {
            codigosVerificacao.delete(email);
            console.log(`Código expirado removido para: ${email}`);
        }
    }
}, 5 * 60 * 1000);

const gerarCodigo = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const gerarNumeroEstudante = () => {
    const anoAtual = new Date().getFullYear().toString();
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    return anoAtual + randomDigits;
};

const verificarDuplicata = (campo, valor) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT id_estudanteInscricao FROM estudanteInscricao WHERE ${campo} = ?`;
        conexao.query(sql, [valor], (erro, resultados) => {
            if (erro) reject(erro);
            else resolve({ existe: resultados.length > 0, mensagem: `${campo} já registrado` });
        });
    });
};

const garantirNumeroUnico = async (numEstudante) => {
    return new Promise((resolve, reject) => {
        const verificarNumeroSQL = "SELECT id_estudanteInscricao FROM estudanteInscricao WHERE numeroInscricao_estudanteInscricao = ?";
        
        conexao.query(verificarNumeroSQL, [numEstudante], (erro, resultados) => {
            if (erro) reject(erro);
            else resolve(resultados.length === 0);
        });
    });
};

const salvarArquivos = async (files, numEstudante) => {
    let nomeDocumento = null;
    let nomeFoto = null;

    const pastaEstudantes = path.join(__dirname, '../../client/src/img/estudantes/Perfil');
    const pastaDocumentos = path.join(__dirname, '../../client/src/img/estudantes/documentos');
    
    if (!fs.existsSync(pastaEstudantes)) {
        fs.mkdirSync(pastaEstudantes, { recursive: true });
    }
    if (!fs.existsSync(pastaDocumentos)) {
        fs.mkdirSync(pastaDocumentos, { recursive: true });
    }

    // Processar documento
    if (files.documentoEstudante) {
        const documento = files.documentoEstudante;
        const extensao = path.extname(documento.name);
        nomeDocumento = `estudante_${numEstudante}_doc_${Date.now()}${extensao}`;
        const caminhoDocumento = path.join(pastaDocumentos, nomeDocumento);

        await new Promise((resolve, reject) => {
            documento.mv(caminhoDocumento, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // Processar foto
    if (files.fotoEstudante) {
        const foto = files.fotoEstudante;
        const extensao = path.extname(foto.name);
        nomeFoto = `estudante_${numEstudante}_foto_${Date.now()}${extensao}`;
        const caminhoFoto = path.join(pastaEstudantes, nomeFoto);

        await new Promise((resolve, reject) => {
            foto.mv(caminhoFoto, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    return { nomeDocumento, nomeFoto };
};

const enviarEmailConfirmacao = async (email, nome, codigo) => {
    const mailOptions = {
        from: `"IPS Metropolitano" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Código de Verificação - IPS Metropolitano',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #FFD700; margin: 0;">IPS METROPOLITANO</h1>
                    <p style="color: #666; font-size: 14px;">Instituto Politécnico Superior Metropolitano de Angola</p>
                </div>
                
                <h2 style="color: #333; text-align: center;">Confirme seu Email</h2>
                
                <p>Olá <strong>${nome}</strong>,</p>
                
                <p>Recebemos uma solicitação de inscrição no Sistema de Gestão Acadêmica do <strong>IPS Metropolitano</strong>.</p>
                
                <p>Para confirmar seu email e completar a sua inscrição, utilize o seguinte código de verificação:</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0; color: #333; border: 2px solid #FFD700;">
                    ${codigo}
                </div>
                
                <p><strong>Prazo de validade:</strong> 10 minutos</p>
                <p><strong>Tentativas permitidas:</strong> 3</p>
                
                <p style="color: #666; font-size: 14px;">Se você não solicitou esta inscrição, ignore este email.</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    IPS Metropolitano - Instituto Politécnico Superior Metropolitano de Angola<br>
                    Este é um email automático, por favor não responda.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email de verificação enviado para: ${email}`);
        return true;
    } catch (error) {
        console.error(`❌ Erro ao enviar email para ${email}:`, error);
        throw error;
    }
};

const enviarCredenciais = async (email, nome, numEstudante, senha) => {
    const mailOptions = {
        from: `"IPS Metropolitano" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '✅ Inscrição Confirmada - IPS Metropolitano',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #FFD700; margin: 0;">IPS METROPOLITANO</h1>
                    <p style="color: #666; font-size: 14px;">Instituto Politécnico Superior Metropolitano de Angola</p>
                </div>
                
                <h2 style="color: #333; text-align: center;">Inscrição Confirmada com Sucesso! 🎉</h2>
                
                <p>Olá <strong>${nome}</strong>,</p>
                
                <p>A sua inscrição no <strong>Sistema de Gestão Acadêmica do IPS Metropolitano</strong> foi realizada com sucesso!</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #FFD700;">
                    <p style="margin: 5px 0;"><strong>📚 Número de Inscrição:</strong></p>
                    <p style="font-size: 24px; color: #FFD700; margin: 5px 0; font-weight: bold;">${numEstudante}</p>
                    
                    <p style="margin: 15px 0 5px 0;"><strong>⚠️ Importante:</strong></p>
                    <p style="color: #666; font-size: 14px;">Guarde seu número de inscrição. Ele será necessário para acessar o sistema.</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                       style="background-color: #FFD700; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Acessar o Sistema
                    </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    IPS Metropolitano - Instituto Politécnico Superior Metropolitano de Angola<br>
                    Este é um email automático, por favor não responda.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email de confirmação enviado para: ${email}`);
        return true;
    } catch (error) {
        console.error(`❌ Erro ao enviar email de confirmação para ${email}:`, error);
        return false;
    }
};

router.post('/enviarCodigoVerificacao', async (req, res) => {
    try {
        const { emailEstudante, nomeEstudante } = req.body;

        if (!emailEstudante || !nomeEstudante) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Email e nome são obrigatórios"
            });
        }

        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailEstudante)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Email inválido"
            });
        }

        // Verificar se email já existe
        const emailExistente = await verificarDuplicata('email_estudanteInscricao', emailEstudante);

        if (emailExistente.existe) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Email existente",
                mensagem: "Este email já está registrado! Utilize outro email ou faça login."
            });
        }

        // Gerar novo código
        const codigo = gerarCodigo();
        const expiracao = Date.now() + 10 * 60 * 1000;

        // Armazenar código
        codigosVerificacao.set(emailEstudante, {
            codigo,
            expiracao,
            tentativas: 0,
            nome: nomeEstudante
        });

        // Enviar email
        await enviarEmailConfirmacao(emailEstudante, nomeEstudante, codigo);

        res.json({
            sucesso: true,
            mensagem: "Código de verificação enviado para seu email!",
            expiraEm: 600
        });

    } catch (error) {
        console.error("Erro ao enviar código:", error);
        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao enviar código de verificação. Tente novamente mais tarde."
        });
    }
});

router.post('/verificarCodigoECompletarCadastro', async (req, res) => {
    try {
        const { codigo, email } = req.body;
        
        if (!email || !codigo) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Dados incompletos",
                mensagem: "Email e código são obrigatórios"
            });
        }

        // Buscar dados de verificação
        const dadosVerificacao = codigosVerificacao.get(email);

        if (!dadosVerificacao) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Código expirado",
                mensagem: "Código não encontrado ou expirado. Solicite um novo código."
            });
        }

        // Verificar expiração
        if (dadosVerificacao.expiracao < Date.now()) {
            codigosVerificacao.delete(email);
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Código expirado",
                mensagem: "Código expirado. Solicite um novo código."
            });
        }

        // Verificar tentativas
        if (dadosVerificacao.tentativas >= 3) {
            codigosVerificacao.delete(email);
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Muitas tentativas",
                mensagem: "Você excedeu o número de tentativas. Solicite um novo código."
            });
        }

        // Verificar código
        if (dadosVerificacao.codigo !== codigo) {
            dadosVerificacao.tentativas++;
            codigosVerificacao.set(email, dadosVerificacao);

            const tentativasRestantes = 3 - dadosVerificacao.tentativas;
            
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Código inválido",
                mensagem: `Código inválido. Você tem mais ${tentativasRestantes} tentativa(s).`
            });
        }

        codigosVerificacao.delete(email);

        const dadosEstudante = {
            nomeEstudante: req.body.nomeEstudante,
            contactoEstudante: req.body.contactoEstudante,
            emailEstudante: email,
            biEstudante: req.body.biEstudante,
            sexoEstudante: req.body.sexoEstudante,
            periodoEstudante: req.body.periodoEstudante,
            idcurso: req.body.idcurso,
            senhaEstudante: req.body.senhaEstudante
        };

        // Validar campos obrigatórios
        const camposObrigatorios = ['nomeEstudante', 'contactoEstudante', 'biEstudante', 'sexoEstudante', 'periodoEstudante', 'idcurso', 'senhaEstudante'];
        const camposFaltando = camposObrigatorios.filter(campo => !dadosEstudante[campo]);

        if (camposFaltando.length > 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Dados incompletos",
                mensagem: `Campos obrigatórios faltando: ${camposFaltando.join(', ')}`
            });
        }

        // Validar senha
        if (dadosEstudante.senhaEstudante.length < 6) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Senha inválida",
                mensagem: "A senha deve ter pelo menos 6 caracteres!"
            });
        }

        // Verificar arquivos
        const files = req.files || {};
        if (!files.documentoEstudante || !files.fotoEstudante) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Arquivos obrigatórios",
                mensagem: "Documento (BI/Certificado) e Foto são obrigatórios!"
            });
        }

        // Verificar duplicatas
        const verificacoes = await Promise.all([
            verificarDuplicata('email_estudanteInscricao', dadosEstudante.emailEstudante),
            verificarDuplicata('contacto_estudanteInscricao', dadosEstudante.contactoEstudante),
            verificarDuplicata('bi_estudanteInscricao', dadosEstudante.biEstudante)
        ]);

        const erros = verificacoes.filter(v => v.existe);
        if (erros.length > 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Dados duplicados",
                mensagem: erros.map(e => e.mensagem).join('. ')
            });
        }

        // Gerar número de inscrição único
        let numEstudante = gerarNumeroEstudante();
        let numeroUnico = await garantirNumeroUnico(numEstudante);
        let tentativas = 0;

        while (!numeroUnico && tentativas < 10) {
            numEstudante = gerarNumeroEstudante();
            numeroUnico = await garantirNumeroUnico(numEstudante);
            tentativas++;
        }

        if (!numeroUnico) {
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no sistema",
                mensagem: "Não foi possível gerar um número de inscrição único. Tente novamente."
            });
        }

        console.log(`Número de inscrição gerado: ${numEstudante}`);

        // Criptografar senha
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(dadosEstudante.senhaEstudante, salt);

        // Salvar arquivos
        const { nomeDocumento, nomeFoto } = await salvarArquivos(files, numEstudante);

        // Inserir no banco
        const inserirSQL = `
            INSERT INTO estudanteInscricao (
                nome_estudanteInscricao, 
                contacto_estudanteInscricao, 
                email_estudanteInscricao,
                bi_estudanteInscricao,
                numeroInscricao_estudanteInscricao,
                sexo_estudanteInscricao, 
                periodo_estudanteInscricao, 
                idcurso, 
                documento_estudanteInscricao, 
                foto_estudanteInscricao, 
                senha_estudanteInscricao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const resultadoInsercao = await new Promise((resolve, reject) => {
            conexao.query(inserirSQL, [
                dadosEstudante.nomeEstudante,
                dadosEstudante.contactoEstudante,
                dadosEstudante.emailEstudante,
                dadosEstudante.biEstudante,
                numEstudante,
                dadosEstudante.sexoEstudante,
                dadosEstudante.periodoEstudante,
                dadosEstudante.idcurso,
                nomeDocumento,
                nomeFoto,
                senhaCriptografada
            ], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });

        // Enviar email de confirmação
        await enviarCredenciais(dadosEstudante.emailEstudante, dadosEstudante.nomeEstudante, numEstudante, dadosEstudante.senhaEstudante);

        res.status(201).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Inscrição Realizada! 🎉",
            mensagem: `Estudante registrado com sucesso! Nº de Inscrição: ${numEstudante}`,
            redirect: "/",
            dados: {
                id: resultadoInsercao.insertId,
                nome: dadosEstudante.nomeEstudante,
                numEstudante: numEstudante
            }
        });

    } catch (error) {
        console.error("Erro ao processar cadastro:", error);
        res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro no processamento",
            mensagem: "Erro ao processar cadastro: " + error.message
        });
    }
});



module.exports = router;