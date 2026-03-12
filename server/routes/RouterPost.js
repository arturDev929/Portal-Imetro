const { Router } = require("express");
const router = Router();
const conexao = require("../infra/conexao");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Configuração do email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Armazenamento temporário de códigos
const codigosVerificacao = new Map();

// Limpar códigos expirados a cada 5 minutos
setInterval(() => {
    const agora = Date.now();
    for (const [email, dados] of codigosVerificacao.entries()) {
        if (dados.expiracao < agora) {
            codigosVerificacao.delete(email);
        }
    }
}, 5 * 60 * 1000);

// Função para gerar código de 6 dígitos
const gerarCodigo = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Função para enviar email de confirmação
const enviarEmailConfirmacao = async (email, nome, codigo) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
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
                
                <p>Recebemos uma solicitação de cadastro no Sistema de Gestão Acadêmica do <strong>IPS Metropolitano</strong>.</p>
                
                <p>Para confirmar seu email e completar seu cadastro, utilize o seguinte código de verificação:</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0; color: #333; border: 2px solid #FFD700;">
                    ${codigo}
                </div>
                
                <p><strong>Prazo de validade:</strong> 10 minutos</p>
                <p><strong>Tentativas permitidas:</strong> 3</p>
                
                <p style="color: #666; font-size: 14px;">Se você não solicitou este cadastro, ignore este email.</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    IPS Metropolitano - Instituto Politécnico Superior Metropolitano de Angola<br>
                    Este é um email automático, por favor não responda.
                </p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

// Função para enviar credenciais após cadastro
const enviarCredenciais = async (email, nome, numEstudante, senha) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Bem-vindo ao IPS Metropolitano - Credenciais de Acesso',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #FFD700; margin: 0;">IPS METROPOLITANO</h1>
                    <p style="color: #666; font-size: 14px;">Instituto Politécnico Superior Metropolitano de Angola</p>
                </div>
                
                <h2 style="color: #333; text-align: center;">Cadastro Confirmado com Sucesso!</h2>
                
                <p>Olá <strong>${nome}</strong>,</p>
                
                <p>Seu cadastro no <strong>Sistema de Gestão Acadêmica do IPS Metropolitano</strong> foi realizado com sucesso!</p>
                
                <p>Abaixo estão suas credenciais de acesso. Guarde-as em local seguro:</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #FFD700;">
                    <p style="margin: 5px 0;"><strong>Número de Inscrição:</strong></p>
                    <p style="font-size: 24px; color: #FFD700; margin: 5px 0; font-weight: bold;">${numEstudante}</p>
                    
                    <p style="margin: 15px 0 5px 0;"><strong>Senha de Acesso:</strong></p>
                    <p style="font-size: 18px; background-color: #fff; padding: 10px; border-radius: 3px; font-family: monospace;">${senha}</p>
                </div>
                
                <p style="color: #666; font-size: 14px;">Para acessar o sistema, utilize seu número de inscrição e a senha fornecida acima.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}" style="background-color: #FFD700; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Acessar o Sistema</a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 12px; text-align: center;">
                    IPS Metropolitano - Instituto Politécnico Superior Metropolitano de Angola<br>
                    Este é um email automático, por favor não responda.
                </p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

// Rota para enviar código de verificação
router.post('/enviarCodigoVerificacao', async (req, res) => {
    try {
        const { emailEstudante, nomeEstudante } = req.body;

        if (!emailEstudante || !nomeEstudante) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Email e nome são obrigatórios"
            });
        }

        // Verificar se email já existe no banco
        const verificarEmailSQL = "SELECT id_estudanteInscricao FROM estudanteInscricao WHERE email_estudanteInscricao = ?";
        
        const emailExistente = await new Promise((resolve, reject) => {
            conexao.query(verificarEmailSQL, [emailEstudante], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });

        if (emailExistente.length > 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Email existente",
                mensagem: "Este email já está registrado!"
            });
        }

        // Gerar novo código
        const codigo = gerarCodigo();
        const expiracao = Date.now() + 10 * 60 * 1000; // 10 minutos

        // Armazenar código
        codigosVerificacao.set(emailEstudante, {
            codigo,
            expiracao,
            tentativas: 0
        });

        // Enviar email
        await enviarEmailConfirmacao(emailEstudante, nomeEstudante, codigo);

        res.json({
            sucesso: true,
            mensagem: "Código de verificação enviado para seu email!"
        });

    } catch (error) {
        console.error("Erro ao enviar código:", error);
        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao enviar código de verificação"
        });
    }
});

// Rota para verificar código e completar cadastro
router.post('/verificarCodigoECompletarCadastro', async (req, res) => {
    try {
        console.log("Body recebido:", req.body);
        console.log("Files recebidos:", req.files ? Object.keys(req.files) : "Nenhum arquivo");
        
        const { codigo, email } = req.body;
        const files = req.files || {};

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

        // Código correto - remover da memória
        codigosVerificacao.delete(email);

        // Continuar com o cadastro
        await completarCadastroEstudante(req, res, req.body, files);

    } catch (error) {
        console.error("Erro na verificação:", error);
        res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro interno",
            mensagem: "Erro ao verificar código"
        });
    }
});

// Função auxiliar para completar o cadastro
async function completarCadastroEstudante(req, res, body, files) {
    try {
        const nomeEstudante = body.nomeEstudante || "";
        const contactoEstudante = body.contactoEstudante || "";
        const emailEstudante = body.email || body.emailEstudante || "";
        const biEstudante = body.biEstudante || "";
        const sexoEstudante = body.sexoEstudante || "";
        const periodoEstudante = body.periodoEstudante || "";
        const idcurso = body.idcurso || "";
        const senhaEstudante = body.senhaEstudante || "";

        // Validação dos campos obrigatórios
        if (!nomeEstudante || !contactoEstudante || !emailEstudante || !biEstudante || 
            !sexoEstudante || !periodoEstudante || !idcurso || !senhaEstudante) {
            
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Campos obrigatórios",
                mensagem: "Todos os campos são obrigatórios!"
            });
        }

        // Verificar se os arquivos foram enviados
        if (!files.documentoEstudante || !files.fotoEstudante) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Arquivos obrigatórios",
                mensagem: "Documento (BI/Certificado) e Foto são obrigatórios!"
            });
        }

        // GERAR NÚMERO DE INSCRIÇÃO
        const anoAtual = new Date().getFullYear().toString();
        const gerarNumeroEstudante = () => {
            const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
            return anoAtual + randomDigits;
        };

        let numEstudante = gerarNumeroEstudante();
        let numeroExiste = true;
        let tentativas = 0;
        const maxTentativas = 10;

        while (numeroExiste && tentativas < maxTentativas) {
            const verificarNumeroSQL = "SELECT id_estudanteInscricao FROM estudanteInscricao WHERE numeroInscricao_estudanteInscricao = ?";
            
            const resultadoVerificacao = await new Promise((resolve, reject) => {
                conexao.query(verificarNumeroSQL, [numEstudante], (erro, resultados) => {
                    if (erro) reject(erro);
                    else resolve(resultados);
                });
            });

            if (resultadoVerificacao.length === 0) {
                numeroExiste = false;
            } else {
                numEstudante = gerarNumeroEstudante();
                tentativas++;
            }
        }

        if (numeroExiste) {
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro ao gerar número",
                mensagem: "Não foi possível gerar um número único de inscrição. Tente novamente."
            });
        }

        console.log("Número de inscrição gerado:", numEstudante);

        // Criptografar senha
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senhaEstudante, salt);

        // Salvar arquivos
        let nomeDocumento = null;
        let nomeFoto = null;

        const pastaEstudantes = path.join(__dirname, '../../client/src/img/estudantes');
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

        const valores = [
            nomeEstudante,
            contactoEstudante,
            emailEstudante,
            biEstudante,
            numEstudante,
            sexoEstudante,
            periodoEstudante,
            idcurso,
            nomeDocumento,
            nomeFoto,
            senhaCriptografada
        ];

        conexao.query(inserirSQL, valores, async (erro, resultados) => {
            if (erro) {
                console.error("Erro ao inserir estudante:", erro);
                
                // Limpar arquivos se houver erro
                if (nomeDocumento && fs.existsSync(path.join(pastaDocumentos, nomeDocumento))) {
                    fs.unlinkSync(path.join(pastaDocumentos, nomeDocumento));
                }
                if (nomeFoto && fs.existsSync(path.join(pastaEstudantes, nomeFoto))) {
                    fs.unlinkSync(path.join(pastaEstudantes, nomeFoto));
                }
                
                return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro no cadastro",
                    mensagem: "Erro ao registrar estudante: " + erro.message
                });
            }

            // Enviar credenciais por email
            try {
                await enviarCredenciais(emailEstudante, nomeEstudante, numEstudante, senhaEstudante);
                console.log(`Credenciais enviadas para ${emailEstudante}`);
            } catch (emailError) {
                console.error("Erro ao enviar email com credenciais:", emailError);
            }

            res.status(201).json({
                sucesso: true,
                tipo: "sucesso",
                titulo: "Inscrição Realizada!",
                mensagem: `Estudante registrado com sucesso! Nº de Inscrição: ${numEstudante}`,
                redirect: "/",
                dados: {
                    id: resultados.insertId,
                    nome: nomeEstudante,
                    numEstudante: numEstudante
                }
            });
        });

    } catch (erro) {
        console.error("Erro ao processar cadastro:", erro);
        return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro no processamento",
            mensagem: "Erro ao processar cadastro: " + erro.message
        });
    }
}

// ============ OUTRAS ROTAS EXISTENTES ============

router.post('/registrarEstudanteInscricao', async (req, res) => {
    try {
        console.log("Body recebido:", req.body);
        console.log("Files recebidos:", req.files ? Object.keys(req.files) : "Nenhum arquivo");
        
        const body = req.body || {};
        const files = req.files || {};

        const nomeEstudante = body.nomeEstudante || "";
        const contactoEstudante = body.contactoEstudante || "";
        const emailEstudante = body.emailEstudante || "";
        const biEstudante = body.biEstudante || "";
        const sexoEstudante = body.sexoEstudante || "";
        const periodoEstudante = body.periodoEstudante || "";
        const idcurso = body.idcurso || "";
        const senhaEstudante = body.senhaEstudante || "";

        // Validação dos campos obrigatórios
        if (!nomeEstudante || !contactoEstudante || !emailEstudante || !biEstudante || 
            !sexoEstudante || !periodoEstudante || !idcurso || !senhaEstudante) {
            
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Campos obrigatórios",
                mensagem: "Todos os campos são obrigatórios!"
            });
        }

        // Verificar se os arquivos foram enviados
        if (!files.documentoEstudante || !files.fotoEstudante) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Arquivos obrigatórios",
                mensagem: "Documento (BI/Certificado) e Foto são obrigatórios!"
            });
        }

        if (senhaEstudante.length < 6) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Senha inválida",
                mensagem: "A senha deve ter pelo menos 6 caracteres!"
            });
        }

        // GERAR NÚMERO DE INSCRIÇÃO: 10 dígitos começando com ano atual
        const anoAtual = new Date().getFullYear().toString(); // "2026"
        
        // Função para gerar número único
        const gerarNumeroEstudante = () => {
            const randomDigits = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos aleatórios
            return anoAtual + randomDigits; // 2026 + 6 dígitos = 10 dígitos
        };

        let numEstudante = gerarNumeroEstudante();
        let numeroExiste = true;
        let tentativas = 0;
        const maxTentativas = 10;

        // Verificar se o número gerado já existe (para evitar duplicatas)
        while (numeroExiste && tentativas < maxTentativas) {
            try {
                const verificarNumeroSQL = "SELECT id_estudanteInscricao FROM estudanteInscricao WHERE numeroInscricao_estudanteInscricao = ?";
                
                const resultadoVerificacao = await new Promise((resolve, reject) => {
                    conexao.query(verificarNumeroSQL, [numEstudante], (erro, resultados) => {
                        if (erro) reject(erro);
                        else resolve(resultados);
                    });
                });

                if (resultadoVerificacao.length === 0) {
                    numeroExiste = false;
                } else {
                    numEstudante = gerarNumeroEstudante();
                    tentativas++;
                }
            } catch (erro) {
                console.error("Erro ao verificar número existente:", erro);
                return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro no servidor",
                    mensagem: "Erro interno do servidor"
                });
            }
        }

        if (numeroExiste) {
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro ao gerar número",
                mensagem: "Não foi possível gerar um número único de inscrição. Tente novamente."
            });
        }

        console.log("Número de inscrição gerado:", numEstudante);

        const verificarEmailSQL = "SELECT id_estudanteInscricao FROM estudanteInscricao WHERE email_estudanteInscricao = ?";
        conexao.query(verificarEmailSQL, [emailEstudante], async (erro, resultados) => {
            if (erro) {
                console.error("Erro ao verificar email:", erro);
                return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro no servidor",
                    mensagem: "Erro interno do servidor"
                });
            }

            if (resultados.length > 0) {
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Email existente",
                    mensagem: "Este email já está registrado!"
                });
            }

            const verificarContatoSQL = "SELECT id_estudanteInscricao FROM estudanteInscricao WHERE contacto_estudanteInscricao = ?";
            conexao.query(verificarContatoSQL, [contactoEstudante], async (erro, resultados) => {
                if (erro) {
                    console.error("Erro ao verificar contato:", erro);
                    return res.status(500).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Erro no servidor",
                        mensagem: "Erro interno do servidor"
                    });
                }

                if (resultados.length > 0) {
                    return res.status(400).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Contato existente",
                        mensagem: "Este número de contato já está registrado!"
                    });
                }

                const verificarBISQL = "SELECT id_estudanteInscricao FROM estudanteInscricao WHERE bi_estudanteInscricao = ?";
                conexao.query(verificarBISQL, [biEstudante], async (erro, resultados) => {
                    if (erro) {
                        console.error("Erro ao verificar BI:", erro);
                        return res.status(500).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Erro no servidor",
                            mensagem: "Erro interno do servidor"
                        });
                    }

                    if (resultados.length > 0) {
                        return res.status(400).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "BI existente",
                            mensagem: "Este número de BI já está registrado!"
                        });
                    }

                    try {
                        const salt = await bcrypt.genSalt(10);
                        const senhaCriptografada = await bcrypt.hash(senhaEstudante, salt);

                        let nomeDocumento = null;
                        let nomeFoto = null;

                        const pastaEstudantes = path.join(__dirname, '../../client/src/img/estudantes');
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
                                    if (err) {
                                        console.error("Erro ao salvar documento:", err);
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
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
                                    if (err) {
                                        console.error("Erro ao salvar foto:", err);
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                });
                            });
                        }

                        // CORREÇÃO: Adicionar numEstudante na query INSERT
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

                        const valores = [
                            nomeEstudante,
                            contactoEstudante,
                            emailEstudante,
                            biEstudante,
                            numEstudante, // ← Número gerado aqui
                            sexoEstudante,
                            periodoEstudante,
                            idcurso,
                            nomeDocumento,
                            nomeFoto,
                            senhaCriptografada
                        ];

                        conexao.query(inserirSQL, valores, (erro, resultados) => {
                            if (erro) {
                                console.error("Erro ao inserir estudante:", erro);
                                
                                // Limpar arquivos se houver erro
                                if (nomeDocumento && fs.existsSync(path.join(pastaDocumentos, nomeDocumento))) {
                                    fs.unlinkSync(path.join(pastaDocumentos, nomeDocumento));
                                }
                                if (nomeFoto && fs.existsSync(path.join(pastaEstudantes, nomeFoto))) {
                                    fs.unlinkSync(path.join(pastaEstudantes, nomeFoto));
                                }
                                
                                return res.status(500).json({
                                    sucesso: false,
                                    tipo: "erro",
                                    titulo: "Erro no cadastro",
                                    mensagem: "Erro ao registrar estudante: " + erro.message
                                });
                            }

                            res.status(201).json({
                                sucesso: true,
                                tipo: "sucesso",
                                titulo: "Inscrição Realizada!",
                                mensagem: `Estudante registrado com sucesso! Nº de Inscrição: ${numEstudante}`,
                                redirect: "/",
                                dados: {
                                    id: resultados.insertId,
                                    nome: nomeEstudante,
                                    numEstudante: numEstudante,
                                    bi: biEstudante
                                }
                            });
                        });

                    } catch (erro) {
                        console.error("Erro ao processar arquivos:", erro);
                        return res.status(500).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Erro no processamento",
                            mensagem: "Erro ao processar arquivos: " + erro.message
                        });
                    }
                });
            });
        });

    } catch (erro) {
        console.error("Erro no endpoint de registro:", erro);
        return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro interno",
            mensagem: "Erro interno do servidor: " + erro.message
        });
    }
});

router.post('/registrercategoria', async (req, res) => {
    const { categoriacurso, idAdm } = req.body;
    
    if (!categoriacurso || !idAdm) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha todos os campos obrigatórios"
        });
    }

    const verificarCategoriaSQL = "SELECT idcategoriacurso FROM categoriacurso WHERE categoriacurso = ?";
    
    conexao.query(verificarCategoriaSQL, [categoriacurso], async (erro, resultados) => {
        if (erro) {
            console.error("Erro ao verificar Categoria Curso:", erro);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno do servidor"
            });
        }

        if (resultados.length > 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Categoria Existe",
                mensagem: "Esta categoria já está registrada!"
            });
        }

        const inserirCategoriaSQL = "INSERT INTO categoriacurso (categoriacurso, idAdm) VALUES (?, ?)";
        
        conexao.query(inserirCategoriaSQL, [categoriacurso, idAdm], (erro, resultados) => {
            if (erro) {
                console.error("Erro ao inserir Categoria Curso:", erro);
                return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro no servidor",
                    mensagem: "Erro ao registrar categoria"
                });
            }

            return res.status(201).json({
                sucesso: true,
                tipo: "sucesso",
                titulo: "Categoria Registrada",
                mensagem: "Categoria registrada com sucesso!",
                dados: {
                    id: resultados.insertId,
                    categoriacurso: categoriacurso,
                    idAdm: idAdm
                }
            });
        });
    });
});

router.post('/registrarcurso', async (req, res) => {
    const { curso, idcategoriacurso } = req.body;
    
    if (!curso || !idcategoriacurso) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha todos os campos obrigatórios"
        });
    }

    const verificarCursoSQL = "SELECT idcurso FROM curso WHERE curso = ?";
    
    conexao.query(verificarCursoSQL, [curso], async (erro, resultados) => {
        if (erro) {
            console.error("Erro ao verificar Curso:", erro);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno do servidor"
            });
        }

        if (resultados.length > 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Curso Existente",
                mensagem: "Este curso já está registrado!"
            });
        }

        const verificarCategoriaSQL = "SELECT idcategoriacurso FROM categoriacurso WHERE idcategoriacurso = ?";
        
        conexao.query(verificarCategoriaSQL, [idcategoriacurso], (erroCategoria, resultadosCategoria) => {
            if (erroCategoria) {
                console.error("Erro ao verificar categoria:", erroCategoria);
                return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro no servidor",
                    mensagem: "Erro ao verificar categoria"
                });
            }

            if (resultadosCategoria.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Categoria não encontrada",
                    mensagem: "A categoria selecionada não existe"
                });
            }

            const inserirCursoSQL = "INSERT INTO curso (curso, idcategoriacurso) VALUES (?, ?)";
            
            conexao.query(inserirCursoSQL, [curso, idcategoriacurso], (erro, resultados) => {
                if (erro) {
                    console.error("Erro ao inserir Curso:", erro);
                    
                    if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
                        return res.status(400).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Categoria inválida",
                            mensagem: "A categoria selecionada não existe"
                        });
                    }
                    
                    return res.status(500).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Erro no servidor",
                        mensagem: "Erro ao registrar curso"
                    });
                }

                return res.status(201).json({
                    sucesso: true,
                    tipo: "sucesso",
                    titulo: "Curso Registrado",
                    mensagem: "Curso registrado com sucesso!",
                    dados: {
                        id: resultados.insertId,
                        curso: curso,
                        idcategoriacurso: idcategoriacurso
                    }
                });
            });
        });
    });
});

router.post('/registrarAnoCurricular', (req, res) => {
    const { anocurricular, idcurso } = req.body;

    if (!anocurricular || !idcurso) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha ano curricular e curso"
        });
    }

    const verificarCursoSQL = "SELECT idcurso FROM curso WHERE idcurso = ?";

    conexao.query(verificarCursoSQL, [idcurso], (erroCurso, resultadosCurso) => {
        if (erroCurso) {
            console.error("Erro ao verificar Curso:", erroCurso);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno do servidor"
            });
        }

        if (resultadosCurso.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Curso inválido",
                mensagem: "O curso selecionado não existe"
            });
        }

        const verificarAnoSQL = "SELECT idanocurricular FROM anocurricular WHERE anocurricular = ? AND idcurso = ?";

        conexao.query(verificarAnoSQL, [anocurricular, idcurso], (erroAno, resultadosAno) => {
            if (erroAno) {
                console.error("Erro ao verificar Ano Curricular:", erroAno);
                return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro no servidor",
                    mensagem: "Erro interno do servidor"
                });
            }

            if (resultadosAno.length > 0) {
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Ano Curricular Duplicado",
                    mensagem: `O ano ${anocurricular} já existe para este curso`
                });
            }

            const inserirSQL = "INSERT INTO anocurricular (anocurricular, idcurso) VALUES (?, ?)";

            conexao.query(inserirSQL, [anocurricular, idcurso], (erroInsercao, resultados) => {
                if (erroInsercao) {
                    console.error("Erro ao inserir Ano Curricular:", erroInsercao);

                    if (erroInsercao.code === 'ER_NO_REFERENCED_ROW_2') {
                        return res.status(400).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Curso inválido",
                            mensagem: "O curso selecionado não existe no sistema"
                        });
                    }

                    return res.status(500).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Erro no servidor",
                        mensagem: "Erro interno ao registrar ano curricular"
                    });
                }

                conexao.query(
                    "SELECT curso as curso_nome FROM curso c WHERE c.idcurso = ?",
                    [idcurso],
                    (erroBusca, dadosCurso) => {
                        return res.status(201).json({
                            sucesso: true,
                            tipo: "sucesso",
                            titulo: "Ano Curricular Registrado",
                            mensagem: `Ano ${anocurricular} registrado com sucesso!`,
                            dados: {
                                id: resultados.insertId,
                                anocurricular: anocurricular,
                                idcurso: idcurso,
                                curso_nome: dadosCurso[0]?.curso_nome || 'Curso não encontrado'
                            }
                        });
                    }
                );
            });
        });
    });
});

router.post('/registrardisciplina', async (req, res) => {
    const { disciplina, idAdm } = req.body;
    
    if (!disciplina || !idAdm) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha todos os campos obrigatórios"
        });
    }

    const verificarDisciplinaSQL = "SELECT iddisciplina FROM disciplina WHERE disciplina = ?";
    
    conexao.query(verificarDisciplinaSQL, [disciplina], async (erro, resultados) => {
        if (erro) {
            console.error("Erro ao verificar Disciplina:", erro);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno do servidor"
            });
        }

        if (resultados.length > 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Disciplina Existe",
                mensagem: "Esta Disciplina já está registrada!"
            });
        }

        const inserirDisciplinaSQL = "INSERT INTO disciplina (disciplina, idAdm) VALUES (?, ?)";
        
        conexao.query(inserirDisciplinaSQL, [disciplina, idAdm], (erro, resultados) => {
            if (erro) {
                console.error("Erro ao inserir Disciplina:", erro);
                return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro no servidor",
                    mensagem: "Erro ao registrar disciplina"
                });
            }

            return res.status(201).json({
                sucesso: true,
                tipo: "sucesso",
                titulo: "Disciplina Registrada",
                mensagem: "Disciplina registrada com sucesso!",
                dados: {
                    id: resultados.insertId,
                    disciplina: disciplina,
                    idAdm: idAdm
                }
            });
        });
    });
});

router.post('/registrarDisciplinaCurso', (req, res) => {
    const { iddisciplina, idanocurricular, idcurso, semestre, idcategoriacurso } = req.body;

    if (!iddisciplina || !idanocurricular || !idcurso || !semestre || !idcategoriacurso) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha disciplina, ano curricular, curso, categoria e semestre"
        });
    }

    const verificarDisciplinaSQL = "SELECT iddisciplina, disciplina FROM disciplina WHERE iddisciplina = ?";

    conexao.query(verificarDisciplinaSQL, [iddisciplina], (erroDisciplina, resultadosDisciplina) => {
        if (erroDisciplina) {
            console.error("Erro ao verificar Disciplina:", erroDisciplina);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno do servidor"
            });
        }

        if (resultadosDisciplina.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Disciplina inválida",
                mensagem: "A disciplina selecionada não existe"
            });
        }

        const verificarAnoSQL = "SELECT idanocurricular, anocurricular FROM anocurricular WHERE idanocurricular = ?";

        conexao.query(verificarAnoSQL, [idanocurricular], (erroAno, resultadosAno) => {
            if (erroAno) {
                console.error("Erro ao verificar Ano Curricular:", erroAno);
                return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro no servidor",
                    mensagem: "Erro interno do servidor"
                });
            }

            if (resultadosAno.length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Ano Curricular inválido",
                    mensagem: "O ano curricular selecionado não existe"
                });
            }

            const verificarCursoSQL = "SELECT idcurso, curso, idcategoriacurso FROM curso WHERE idcurso = ?";

            conexao.query(verificarCursoSQL, [idcurso], (erroCurso, resultadosCurso) => {
                if (erroCurso) {
                    console.error("Erro ao verificar Curso:", erroCurso);
                    return res.status(500).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Erro no servidor",
                        mensagem: "Erro interno do servidor"
                    });
                }

                if (resultadosCurso.length === 0) {
                    return res.status(400).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Curso inválido",
                        mensagem: "O curso selecionado não existe"
                    });
                }

                const verificarCategoriaSQL = "SELECT idcategoriacurso, categoriacurso FROM categoriacurso WHERE idcategoriacurso = ?";

                conexao.query(verificarCategoriaSQL, [idcategoriacurso], (erroCategoria, resultadosCategoria) => {
                    if (erroCategoria) {
                        console.error("Erro ao verificar Categoria:", erroCategoria);
                        return res.status(500).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Erro no servidor",
                            mensagem: "Erro interno do servidor"
                        });
                    }

                    if (resultadosCategoria.length === 0) {
                        return res.status(400).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Categoria inválida",
                            mensagem: "A categoria selecionada não existe"
                        });
                    }

                    if (resultadosCurso[0].idcategoriacurso != idcategoriacurso) {
                        return res.status(400).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Inconsistência de dados",
                            mensagem: "O curso selecionado não pertence à categoria informada"
                        });
                    }

                    const verificarDuplicadoSQL = `
                        SELECT idsemestre 
                        FROM semestre 
                        WHERE iddisciplina = ? AND idanocurricular = ? AND idcurso = ? AND semestre = ?
                    `;

                    conexao.query(verificarDuplicadoSQL, [iddisciplina, idanocurricular, idcurso, semestre], (erroDuplicado, resultadosDuplicado) => {
                        if (erroDuplicado) {
                            console.error("Erro ao verificar duplicidade:", erroDuplicado);
                            return res.status(500).json({
                                sucesso: false,
                                tipo: "erro",
                                titulo: "Erro no servidor",
                                mensagem: "Erro interno do servidor"
                            });
                        }

                        if (resultadosDuplicado.length > 0) {
                            return res.status(400).json({
                                sucesso: false,
                                tipo: "erro",
                                titulo: "Disciplina Duplicada",
                                mensagem: `Esta disciplina já está atribuída a este curso/ano no ${semestre}º semestre`
                            });
                        }

                        const inserirSQL = `
                            INSERT INTO semestre (idcategoriacurso, iddisciplina, idanocurricular, idcurso, semestre) 
                            VALUES (?, ?, ?, ?, ?)
                        `;

                        conexao.query(inserirSQL, [idcategoriacurso, iddisciplina, idanocurricular, idcurso, semestre], (erroInsercao, resultados) => {
                            if (erroInsercao) {
                                console.error("Erro ao inserir no semestre:", erroInsercao);

                                if (erroInsercao.code === 'ER_NO_REFERENCED_ROW_2') {
                                    return res.status(400).json({
                                        sucesso: false,
                                        tipo: "erro",
                                        titulo: "Chave estrangeira inválida",
                                        mensagem: "Uma das referências não existe no sistema"
                                    });
                                }

                                if (erroInsercao.code === 'ER_DUP_ENTRY') {
                                    return res.status(400).json({
                                        sucesso: false,
                                        tipo: "erro",
                                        titulo: "Entrada duplicada",
                                        mensagem: "Esta disciplina já foi atribuída a este curso/ano/semestre"
                                    });
                                }

                                return res.status(500).json({
                                    sucesso: false,
                                    tipo: "erro",
                                    titulo: "Erro no servidor",
                                    mensagem: "Erro interno ao registrar disciplina no curso"
                                });
                            }

                            res.status(201).json({
                                sucesso: true,
                                tipo: "sucesso",
                                titulo: "Disciplina Atribuída",
                                mensagem: `Disciplina "${resultadosDisciplina[0].disciplina}" atribuída ao ${semestre}º semestre do ${resultadosAno[0].anocurricular}º ano com sucesso!`,
                                dados: {
                                    id: resultados.insertId,
                                    iddisciplina: iddisciplina,
                                    idanocurricular: idanocurricular,
                                    idcurso: idcurso,
                                    idcategoriacurso: idcategoriacurso,
                                    semestre: semestre
                                }
                            });
                        });
                    });
                });
            });
        });
    });
});

router.post('/registrarprofessor', async (req, res) => {    
    try {
        const body = req.body || {};
        const files = req.files || {};

        const nomeprofessore = body.nomeprofessore || "";
        const genero = body.genero || "";
        const nacionalidadeprofessor = body.nacionalidadeprofessor || "";
        const estadocivilprofessor = body.estadocivilprofessor || "";
        const nomepaiprofessor = body.nomepaiprofessor || "";
        const nomemaeprofessor = body.nomemaeprofessor || "";
        const biprofessor = body.biprofessor || "";
        const datanascimentoprofessor = body.datanascimentoprofessor || "";
        const residenciaprofessor = body.residenciaprofessor || "";
        const telefoneprofessor = body.telefoneprofessor || "";
        const whatsappprofessor = body.whatsappprofessor || "";
        const emailprofessor = body.emailprofessor || "";
        const anoexprienciaprofessor = body.anoexprienciaprofessor || "";
        const titulacaoprofessor = body.titulacaoprofessor || "";
        const dataadmissaprofessor = body.dataadmissaprofessor || "";
        const tipocontratoprofessor = body.tipocontratoprofessor || "";
        const ibanprofessor = body.ibanprofessor || "";
        const tiposanguineoprofessor = body.tiposanguineoprofessor || "";
        const condicoesprofessor = body.condicoesprofessor || "";
        const contactoemergenciaprofessor = body.contactoemergenciaprofessor || "";
        const idAdm = body.idAdm || "";

        if (!nomeprofessore || !genero || !biprofessor || !idAdm) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Campos obrigatórios",
                mensagem: "Nome, gênero, BI e Administrador são obrigatórios!"
            });
        }

        const verificarBISQL = "SELECT idprofessor FROM professor WHERE nbiprofessor = ?";
        conexao.query(verificarBISQL, [biprofessor], async (erro, resultados) => {
            if (erro) {
                console.error("Erro ao verificar BI:", erro);
                return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro no servidor",
                    mensagem: "Erro interno do servidor"
                });
            }

            if (resultados.length > 0) {
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "BI existente",
                    mensagem: "Este número de BI já está registrado!"
                });
            }

            try {
                let codigoAcesso;
                let codigoUnico = false;
                let tentativas = 0;
                const maxTentativas = 10;

                while (!codigoUnico && tentativas < maxTentativas) {
                    codigoAcesso = Math.floor(1000 + Math.random() * 9000).toString();
                    
                    const verificarCodigoSQL = "SELECT idprofessor FROM professor WHERE senhaprofessor = ?";
                    const [resultadosCodigo] = await conexao.promise().query(verificarCodigoSQL, [codigoAcesso]);
                    
                    if (resultadosCodigo.length === 0) {
                        codigoUnico = true;
                    }
                    tentativas++;
                }

                if (!codigoUnico) {
                    return res.status(500).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Erro ao gerar código",
                        mensagem: "Não foi possível gerar um código único. Tente novamente."
                    });
                }

                let codigoProfessor;
                let codigoProfessorUnico = false;
                tentativas = 0;

                while (!codigoProfessorUnico && tentativas < maxTentativas) {
                    codigoProfessor = Math.floor(10000000 + Math.random() * 90000000).toString();
                    
                    const verificarCodigoProfessorSQL = "SELECT idprofessor FROM professor WHERE codigoprofessor = ?";
                    const [resultadosCodigoProfessor] = await conexao.promise().query(verificarCodigoProfessorSQL, [codigoProfessor]);
                    
                    if (resultadosCodigoProfessor.length === 0) {
                        codigoProfessorUnico = true;
                    }
                    tentativas++;
                }

                if (!codigoProfessorUnico) {
                    return res.status(500).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Erro ao gerar código",
                        mensagem: "Não foi possível gerar um código de identificação único. Tente novamente."
                    });
                }

                const salt = await bcrypt.genSalt(10);
                const senhaCriptografada = await bcrypt.hash(codigoAcesso, salt);

                let nomeFoto = null;
                let nomeBIPDF = null;

                const pastaProfessores = path.join(__dirname, '../../client/src/img/professores');
                if (!fs.existsSync(pastaProfessores)) {
                    fs.mkdirSync(pastaProfessores, { recursive: true });
                }

                if (files.fotoprofessor) {
                    const foto = files.fotoprofessor;
                    const extensaoFoto = path.extname(foto.name);
                    nomeFoto = `professor_${codigoProfessor}_foto_${Date.now()}${extensaoFoto}`;
                    const caminhoFoto = path.join(pastaProfessores, nomeFoto);

                    foto.mv(caminhoFoto, (err) => {
                        if (err) {
                            console.error("Erro ao salvar foto:", err);
                        }
                    });
                }

                if (files.bipdfprofessor) {
                    const pdf = files.bipdfprofessor;
                    const extensaoPDF = path.extname(pdf.name);
                    nomeBIPDF = `professor_${codigoProfessor}_bi_${Date.now()}${extensaoPDF}`;
                    const caminhoPDF = path.join(pastaProfessores, nomeBIPDF);

                    pdf.mv(caminhoPDF, (err) => {
                        if (err) {
                            console.error("Erro ao salvar PDF:", err);
                        }
                    });
                }

                const inserirProfessorSQL = `
                    INSERT INTO professor (
                        codigoprofessor, fotoprofessor, nomeprofessor, generoprofessor, 
                        nacionalidadeprofessor, estadocivilprofessor, nomepaiprofessor, 
                        nomemaeprofessor, nbiprofessor, datanascimentoprofessor, 
                        bipdfprofessor, residenciaprofessor, telefoneprofessor, 
                        whatsappprofessor, emailprofessor, anoexperienciaprofessor, 
                        titulacaoprofessor, dataadmissaoprofessor, tipocontratoprofessor, 
                        ibanprofessor, tiposanguineoprofessor, condicoesprofessor, 
                        contactoemergenciaprofessor, idAdm, senhaprofessor
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const converterParaNull = (valor) => (valor === "" ? null : valor);

                const valores = [
                    codigoProfessor,
                    nomeFoto,
                    nomeprofessore,
                    genero,
                    converterParaNull(nacionalidadeprofessor),
                    converterParaNull(estadocivilprofessor),
                    converterParaNull(nomepaiprofessor),
                    converterParaNull(nomemaeprofessor),
                    biprofessor,
                    converterParaNull(datanascimentoprofessor),
                    nomeBIPDF,
                    converterParaNull(residenciaprofessor),
                    converterParaNull(telefoneprofessor),
                    converterParaNull(whatsappprofessor),
                    converterParaNull(emailprofessor),
                    converterParaNull(anoexprienciaprofessor),
                    converterParaNull(titulacaoprofessor),
                    converterParaNull(dataadmissaprofessor),
                    converterParaNull(tipocontratoprofessor),
                    converterParaNull(ibanprofessor),
                    converterParaNull(tiposanguineoprofessor),
                    converterParaNull(condicoesprofessor),
                    converterParaNull(contactoemergenciaprofessor),
                    idAdm,
                    senhaCriptografada
                ];

                conexao.query(inserirProfessorSQL, valores, (erro, resultados) => {
                    if (erro) {
                        console.error("Erro ao inserir professor:", erro);
                        
                        if (nomeFoto && fs.existsSync(path.join(pastaProfessores, nomeFoto))) {
                            fs.unlinkSync(path.join(pastaProfessores, nomeFoto));
                        }
                        if (nomeBIPDF && fs.existsSync(path.join(pastaProfessores, nomeBIPDF))) {
                            fs.unlinkSync(path.join(pastaProfessores, nomeBIPDF));
                        }
                        
                        return res.status(500).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Erro no cadastro",
                            mensagem: "Erro ao registrar professor: " + erro.message
                        });
                    }

                    res.status(201).json({
                        sucesso: true,
                        tipo: "sucesso",
                        titulo: "Professor Registrado!",
                        mensagem: "Professor registrado com sucesso!",
                        dados: {
                            idprofessor: resultados.insertId,
                            nomeprofessore: nomeprofessore,
                            codigoProfessor: codigoProfessor,
                            codigoAcesso: codigoAcesso, 
                            biprofessor: biprofessor
                        }
                    });

                });

            } catch (erro) {
                console.error("Erro ao processar arquivos:", erro);
                return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro no processamento",
                    mensagem: "Erro ao processar arquivos: " + erro.message
                });
            }
        });

    } catch (erro) {
        console.error("Erro no endpoint de registro de professor:", erro);
        return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro interno",
            mensagem: "Erro interno do servidor: " + erro.message
        });
    }
});

router.post('/registrerDisciplinaProfessor', (req, res) => {
    const { idprofessor, iddisciplina } = req.body;

    if (!idprofessor || !iddisciplina) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, selecione um professor e uma disciplina"
        });
    }

    const verificarProfessorSQL = "SELECT idprofessor, nomeprofessor FROM professor WHERE idprofessor = ?";

    conexao.query(verificarProfessorSQL, [idprofessor], (erroProfessor, resultadosProfessor) => {
        if (erroProfessor) {
            console.error("Erro ao verificar Professor:", erroProfessor);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno do servidor"
            });
        }

        if (resultadosProfessor.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Professor inválido",
                mensagem: "O professor selecionado não existe"
            });
        }

        const verificarDisciplinaSQL = "SELECT iddisciplina, disciplina FROM disciplina WHERE iddisciplina = ?";

        conexao.query(verificarDisciplinaSQL, [iddisciplina], (erroDisciplina, resultadosDisciplina) => {
            if (erroDisciplina) {
                console.error("Erro ao verificar Disciplina:", erroDisciplina);
                return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro no servidor",
                    mensagem: "Erro interno do servidor"
                });
            }

            if (resultadosDisciplina.length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Disciplina inválida",
                    mensagem: "A disciplina selecionada não existe"
                });
            }

            const verificarDuplicadoSQL = `
                SELECT iddisciplina 
                FROM disc_prof 
                WHERE idprofessor = ? AND iddisciplina = ?
            `;

            conexao.query(verificarDuplicadoSQL, [idprofessor, iddisciplina], (erroDuplicado, resultadosDuplicado) => {
                if (erroDuplicado) {
                    console.error("Erro ao verificar duplicidade:", erroDuplicado);
                    return res.status(500).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Erro no servidor",
                        mensagem: "Erro interno do servidor"
                    });
                }

                if (resultadosDuplicado.length > 0) {
                    return res.status(400).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Disciplina Duplicada",
                        mensagem: "Esta disciplina já está atribuída a este professor"
                    });
                }

                const inserirSQL = `
                    INSERT INTO disc_prof (idprofessor, iddisciplina) 
                    VALUES (?, ?)
                `;

                conexao.query(inserirSQL, [idprofessor, iddisciplina], (erroInsercao, resultados) => {
                    if (erroInsercao) {
                        console.error("Erro ao inserir relação:", erroInsercao);

                        if (erroInsercao.code === 'ER_NO_REFERENCED_ROW_2') {
                            return res.status(400).json({
                                sucesso: false,
                                tipo: "erro",
                                titulo: "Chave estrangeira inválida",
                                mensagem: "O professor ou disciplina não existe no sistema"
                            });
                        }

                        if (erroInsercao.code === 'ER_DUP_ENTRY') {
                            return res.status(400).json({
                                sucesso: false,
                                tipo: "erro",
                                titulo: "Entrada duplicada",
                                mensagem: "Esta disciplina já foi atribuída a este professor"
                            });
                        }

                        return res.status(500).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Erro no servidor",
                            mensagem: "Erro interno ao atribuir disciplina ao professor"
                        });
                    }

                    return res.status(201).json({
                        sucesso: true,
                        tipo: "sucesso",
                        titulo: "Disciplina Atribuída",
                        mensagem: `Disciplina "${resultadosDisciplina[0].disciplina}" atribuída ao professor "${resultadosProfessor[0].nomeprofessor}" com sucesso!`,
                        dados: {
                            id: resultados.insertId,
                            idprofessor: idprofessor,
                            iddisciplina: iddisciplina
                        }
                    });
                });
            });
        });
    });
});

router.post('/vincularProfessor', async (req, res) => {
    const { idprofessor, iddisciplina } = req.body;
    
    if (!idprofessor || !iddisciplina) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, selecione um professor e uma disciplina"
        });
    }

    try {
        const verificaSql = "SELECT * FROM disc_prof WHERE idprofessor = ? AND iddisciplina = ?";
        
        conexao.query(verificaSql, [idprofessor, iddisciplina], (verificaError, verificaResult) => {
            if (verificaError) {
                console.error("Erro ao verificar vínculo existente:", verificaError);
                return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro interno",
                    mensagem: "Erro ao verificar vínculo existente"
                });
            }
            
            if (verificaResult.length > 0) {
                return res.status(409).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Vínculo existente",
                    mensagem: "Este professor já está vinculado a esta disciplina"
                });
            }
            
            const insertSql = "INSERT INTO disc_prof (idprofessor, iddisciplina) VALUES (?, ?)";
            
            conexao.query(insertSql, [idprofessor, iddisciplina], (insertError, result) => {
                if (insertError) {
                    console.error("Erro ao vincular professor:", insertError);
                    
                    if (insertError.code === 'ER_NO_REFERENCED_ROW_2') {
                        return res.status(400).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Dados inválidos",
                            mensagem: "Professor ou disciplina não encontrado no sistema"
                        });
                    }
                    
                    return res.status(500).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Erro interno",
                        mensagem: "Não foi possível vincular o professor à disciplina"
                    });
                }
                
                return res.status(201).json({
                    sucesso: true,
                    tipo: "sucesso",
                    titulo: "Vinculação realizada",
                    mensagem: "Professor vinculado à disciplina com sucesso",
                    dados: {
                        idVinculo: result.insertId,
                        idprofessor,
                        iddisciplina
                    }
                });
            });
        });
        
    } catch (error) {
        console.error("Erro inesperado:", error);
        return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro interno",
            mensagem: "Ocorreu um erro inesperado no servidor"
        });
    }
});

router.post('/registrarPeriodo', (req, res) => {
    const { idanocurricular, idcurso, idcategoriacurso, turma, periodo, anoletivo } = req.body;

    if (!idanocurricular || !idcurso || !idcategoriacurso || !turma || !periodo || !anoletivo) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha todos os campos obrigatórios"
        });
    }

    const verificarAnoSQL = "SELECT idanocurricular, anocurricular FROM anocurricular WHERE idanocurricular = ?";

    conexao.query(verificarAnoSQL, [idanocurricular], (erroAno, resultadosAno) => {
        if (erroAno) {
            console.error("Erro ao verificar Ano Curricular:", erroAno);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno do servidor"
            });
        }

        if (resultadosAno.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Ano Curricular inválido",
                mensagem: "O ano curricular selecionado não existe"
            });
        }

        const verificarCursoSQL = "SELECT idcurso, curso, idcategoriacurso FROM curso WHERE idcurso = ?";

        conexao.query(verificarCursoSQL, [idcurso], (erroCurso, resultadosCurso) => {
            if (erroCurso) {
                console.error("Erro ao verificar Curso:", erroCurso);
                return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro no servidor",
                    mensagem: "Erro interno do servidor"
                });
            }

            if (resultadosCurso.length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Curso inválido",
                    mensagem: "O curso selecionado não existe"
                });
            }

            const verificarCategoriaSQL = "SELECT idcategoriacurso, categoriacurso FROM categoriacurso WHERE idcategoriacurso = ?";

            conexao.query(verificarCategoriaSQL, [idcategoriacurso], (erroCategoria, resultadosCategoria) => {
                if (erroCategoria) {
                    console.error("Erro ao verificar Categoria:", erroCategoria);
                    return res.status(500).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Erro no servidor",
                        mensagem: "Erro interno do servidor"
                    });
                }

                if (resultadosCategoria.length === 0) {
                    return res.status(400).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Categoria inválida",
                        mensagem: "A categoria selecionada não existe"
                    });
                }

                if (resultadosCurso[0].idcategoriacurso != idcategoriacurso) {
                    return res.status(400).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Inconsistência de dados",
                        mensagem: "O curso selecionado não pertence à categoria informada"
                    });
                }

                const verificarDuplicadoSQL = `
                    SELECT idperiodo 
                    FROM periodo 
                    WHERE idanocurricular = ? AND idcurso = ? AND turma = ? AND periodo = ? AND anoletivo = ?
                `;

                conexao.query(verificarDuplicadoSQL, [idanocurricular, idcurso, turma, periodo, anoletivo], (erroDuplicado, resultadosDuplicado) => {
                    if (erroDuplicado) {
                        console.error("Erro ao verificar duplicidade:", erroDuplicado);
                        return res.status(500).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Erro no servidor",
                            mensagem: "Erro interno do servidor"
                        });
                    }

                    if (resultadosDuplicado.length > 0) {
                        return res.status(400).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Turma/Período Duplicado",
                            mensagem: `Esta turma "${turma}" no período "${periodo}" já existe para este curso/ano`
                        });
                    }

                    const inserirSQL = `
                        INSERT INTO periodo (idanocurricular, idcategoriacurso, idcurso, turma, periodo, anoletivo) 
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;

                    conexao.query(inserirSQL, [idanocurricular, idcategoriacurso, idcurso, turma, periodo, anoletivo], (erroInsercao, resultados) => {
                        if (erroInsercao) {
                            console.error("Erro ao inserir período:", erroInsercao);

                            if (erroInsercao.code === 'ER_NO_REFERENCED_ROW_2') {
                                return res.status(400).json({
                                    sucesso: false,
                                    tipo: "erro",
                                    titulo: "Chave estrangeira inválida",
                                    mensagem: "Uma das referências não existe no sistema"
                                });
                            }

                            if (erroInsercao.code === 'ER_DUP_ENTRY') {
                                return res.status(400).json({
                                    sucesso: false,
                                    tipo: "erro",
                                    titulo: "Entrada duplicada",
                                    mensagem: "Esta turma/período já foi registrada para este curso/ano"
                                });
                            }

                            return res.status(500).json({
                                sucesso: false,
                                tipo: "erro",
                                titulo: "Erro no servidor",
                                mensagem: "Erro interno ao registrar turma/período"
                            });
                        }

                        res.status(201).json({
                            sucesso: true,
                            tipo: "sucesso",
                            titulo: "Turma/Período Registrado",
                            mensagem: `Turma "${turma}" no período "${periodo}" registrada com sucesso!`,
                            dados: {
                                id: resultados.insertId,
                                idanocurricular: idanocurricular,
                                idcurso: idcurso,
                                anoletivo: anoletivo,
                                idcategoriacurso: idcategoriacurso,
                                turma: turma,
                                periodo: periodo
                            }
                        });
                    });
                });
            });
        });
    });
});

router.post('/registrarfuncionario', (req, res) => {
    const {
        nome_funcionario,
        contacto_funcionario,
        bi_funcionario,
        cargo_funcionario,
        idAdm
    } = req.body;

    if (!nome_funcionario || !nome_funcionario.trim()) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "O nome do funcionário é obrigatório!"
        });
    }

    if (!contacto_funcionario || !contacto_funcionario.trim()) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "O contacto do funcionário é obrigatório!"
        });
    }

    if (!bi_funcionario || !bi_funcionario.trim()) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "O número do BI é obrigatório!"
        });
    }

    if (!cargo_funcionario || !cargo_funcionario.trim()) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "O cargo do funcionário é obrigatório!"
        });
    }

    if (!idAdm) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "O ID do administrador é obrigatório!"
        });
    }

    conexao.beginTransaction(async (erroTransacao) => {
        if (erroTransacao) {
            console.error("Erro ao iniciar transação:", erroTransacao);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno ao iniciar transação"
            });
        }

        try {
            const verificarContacto = await new Promise((resolve, reject) => {
                conexao.query(
                    "SELECT id_funcionario FROM funcionario WHERE contacto_funcionario = ?",
                    [contacto_funcionario.trim()],
                    (erro, resultados) => {
                        if (erro) reject(erro);
                        else resolve(resultados);
                    }
                );
            });

            if (verificarContacto.length > 0) {
                conexao.rollback();
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Contacto existente",
                    mensagem: "Este contacto já está em uso por outro funcionário!"
                });
            }

            const verificarBI = await new Promise((resolve, reject) => {
                conexao.query(
                    "SELECT id_funcionario FROM funcionario WHERE bi_funcionario = ?",
                    [bi_funcionario.trim()],
                    (erro, resultados) => {
                        if (erro) reject(erro);
                        else resolve(resultados);
                    }
                );
            });

            if (verificarBI.length > 0) {
                conexao.rollback();
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "BI existente",
                    mensagem: "Este número de BI já está em uso por outro funcionário!"
                });
            }

            const gerarSenha = () => {
                const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let senha = '';
                for (let i = 0; i < 8; i++) {
                    senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
                }
                return senha;
            };

            const senha_funcionario = gerarSenha();
            const salt = await bcrypt.genSalt(10);
            const senhaCriptografada = await bcrypt.hash(senha_funcionario, salt);

            const resultadoFuncionario = await new Promise((resolve, reject) => {
                const inserirFuncionarioSQL = `
                    INSERT INTO funcionario 
                    (nome_funcionario, contacto_funcionario, bi_funcionario, senha_funcionario, idAdm, estado_funcionario) 
                    VALUES (?, ?, ?, ?, ?, 'Ativo')
                `;

                conexao.query(
                    inserirFuncionarioSQL,
                    [
                        nome_funcionario.trim(),
                        contacto_funcionario.trim(),
                        bi_funcionario.trim(),
                        senhaCriptografada,
                        idAdm
                    ],
                    (erro, resultado) => {
                        if (erro) reject(erro);
                        else resolve(resultado);
                    }
                );
            });

            const id_funcionario = resultadoFuncionario.insertId;

            const cargoResult = await new Promise((resolve, reject) => {
                const buscarCargoSQL = "SELECT id_cargo FROM cargo_funcionario WHERE cargo = ?";

                conexao.query(
                    buscarCargoSQL,
                    [cargo_funcionario],
                    (erro, resultados) => {
                        if (erro) reject(erro);
                        else resolve(resultados);
                    }
                );
            });

            if (cargoResult.length === 0) {
                conexao.rollback();
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Cargo inválido",
                    mensagem: "O cargo informado não existe no sistema"
                });
            }

            const id_cargo = cargoResult[0].id_cargo;

            await new Promise((resolve, reject) => {
                const inserirRelacaoSQL = `
                    INSERT INTO cargo_funcionario_relation (id_funcionario, id_cargo) 
                    VALUES (?, ?)
                `;

                conexao.query(
                    inserirRelacaoSQL,
                    [id_funcionario, id_cargo],
                    (erro, resultado) => {
                        if (erro) reject(erro);
                        else resolve(resultado);
                    }
                );
            });

            conexao.commit((erroCommit) => {
                if (erroCommit) {
                    console.error("Erro ao fazer commit:", erroCommit);
                    conexao.rollback();
                    return res.status(500).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Erro no servidor",
                        mensagem: "Erro interno ao finalizar transação"
                    });
                }

                return res.status(201).json({
                    sucesso: true,
                    tipo: "sucesso",
                    titulo: "Funcionário Registrado com Sucesso",
                    mensagem: `Funcionário ${nome_funcionario} registrado com sucesso!`,
                    dados: {
                        id: id_funcionario,
                        nome: nome_funcionario,
                        contacto: contacto_funcionario,
                        bi: bi_funcionario,
                        cargo: cargo_funcionario,
                        senha_original: senha_funcionario
                    }
                });
            });

        } catch (erro) {
            console.error("Erro ao registrar funcionário:", erro);
            conexao.rollback();

            if (erro.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Funcionário Duplicado",
                    mensagem: "Este funcionário já está cadastrado no sistema"
                });
            }

            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno ao registrar funcionário"
            });
        }
    });
});

module.exports = router;