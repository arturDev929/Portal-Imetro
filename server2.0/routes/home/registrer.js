const express = require('express');
const router = express.Router();
const conexao = require('../../infra/conexao'); // ✅ CORRIGIDO - Importação direta
const { uploadCombinadoAluno } = require('../../utils/upload');
const { gerarId, gerarCodigo, criptografarSenha, gerarCodigoDezDigitos } = require('../../utils/senhas');
const { enviarEmail } = require('../../utils/email');

// Cache em memória para códigos de verificação
const codigosVerificacao = new Map();

// Limpar códigos expirados a cada minuto
setInterval(() => {
    const agora = Date.now();
    for (const [email, data] of codigosVerificacao.entries()) {
        if (data.expiracao < agora) {
            codigosVerificacao.delete(email);
        }
    }
}, 60000);

// Rota para enviar código de verificação
router.post("/enviarCodigoVerificacao", async (req, res) => {
    const { emailEstudante, nomeEstudante, contactoEstudante } = req.body;

    try {
        // Validação
        if (!emailEstudante || !nomeEstudante) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Email e nome são obrigatórios"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailEstudante)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Email inválido"
            });
        }

        // Verificar se o email já está cadastrado
        const verificarEmail = await new Promise((resolve, reject) => {
            conexao.query(
                "SELECT id_est FROM estudante_inscricao WHERE email = ?",
                [emailEstudante.trim().toLowerCase()],
                (erro, resultados) => {
                    if (erro) reject(erro);
                    else resolve(resultados);
                }
            );
        });

        if (verificarEmail.length > 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Este email já está cadastrado"
            });
        }

        // Verificar se o contacto já está cadastrado
        if (contactoEstudante) {
            const verificarContacto = await new Promise((resolve, reject) => {
                conexao.query(
                    "SELECT id_est FROM estudante_inscricao WHERE contacto = ?",
                    [contactoEstudante.trim()],
                    (erro, resultados) => {
                        if (erro) reject(erro);
                        else resolve(resultados);
                    }
                );
            });

            if (verificarContacto.length > 0) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Este contacto já está cadastrado"
                });
            }
        }

        // Verificar se o BI já está cadastrado
        if (req.body.biEstudante) {
            const verificarBI = await new Promise((resolve, reject) => {
                conexao.query(
                    "SELECT id_est FROM estudante_inscricao WHERE bi = ?",
                    [req.body.biEstudante.trim().toUpperCase()],
                    (erro, resultados) => {
                        if (erro) reject(erro);
                        else resolve(resultados);
                    }
                );
            });

            if (verificarBI.length > 0) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Este BI já está cadastrado"
                });
            }
        }

        // Gerar código de verificação (6 dígitos)
        const codigo = Math.floor(100000 + Math.random() * 900000);
        const expiracao = Date.now() + 10 * 60 * 1000; // 10 minutos

        // Armazenar no cache em memória
        codigosVerificacao.set(emailEstudante.trim().toLowerCase(), {
            codigo: codigo.toString(),
            expiracao: expiracao,
            tentativas: 0,
            nome: nomeEstudante,
            contacto: contactoEstudante,
            bi: req.body.biEstudante
        });

        // Enviar email
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Código de Verificação - IMETRO</title>
                <style>
                    @media only screen and (max-width: 600px) {
                        .container { width: 100% !important; }
                        .padding { padding: 20px !important; }
                    }
                    .code-box {
                        background: #f4f4f4;
                        padding: 20px;
                        text-align: center;
                        font-size: 32px;
                        letter-spacing: 10px;
                        font-weight: bold;
                        border-radius: 8px;
                        font-family: monospace;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: #003366;
                        padding: 30px;
                        text-align: center;
                    }
                    .content {
                        padding: 35px 30px;
                        background: #ffffff;
                    }
                    .footer {
                        background: #002244;
                        padding: 25px;
                        text-align: center;
                    }
                </style>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
                <div class="container">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <tr>
                            <td class="header">
                                <h1 style="color: #B8860B; margin: 0; font-size: 22px; font-weight: 600;">IMETRO</h1>
                                <p style="color: #ffffff; margin: 8px 0 0 0; font-size: 12px;">Instituto Politécnico Superior Metropolitano de Angola</p>
                            </td>
                        </tr>
                        <tr>
                            <td class="content">
                                <h2 style="color: #003366; margin: 0 0 20px 0;">Olá ${nomeEstudante}!</h2>
                                <p style="color: #333333; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">Seu código de verificação para cadastro no IMETRO é:</p>
                                
                                <div class="code-box">${codigo}</div>
                                
                                <p style="margin-top: 25px; color: #333333; font-size: 14px;">Este código é válido por <strong>10 minutos</strong>.</p>
                                <p style="color: #666666; font-size: 13px;">Se você não solicitou este código, ignore este email.</p>
                            </td>
                        </tr>
                        <tr>
                            <td class="footer">
                                <p style="color: #B8860B; margin: 0 0 10px 0; font-size: 12px;">Instituto Politécnico Superior Metropolitano de Angola</p>
                                <p style="color: #ffffff; margin: 0; font-size: 11px;">Este é um email automático, por favor não responda.</p>
                            </td>
                        </tr>
                    </table>
                </div>
            </body>
            </html>
        `;

        await enviarEmail(emailEstudante, 'Código de Verificação - IMETRO', html);

        res.status(200).json({
            sucesso: true,
            mensagem: "Código de verificação enviado com sucesso!"
        });

    } catch (erro) {
        console.error("Erro ao enviar código:", erro);
        res.status(500).json({
            sucesso: false,
            mensagem: erro.message || "Erro ao enviar código de verificação"
        });
    }
});

// Rota para verificar código e completar cadastro
router.post("/verificarCodigoECompletarCadastro", async (req, res) => {
    uploadCombinadoAluno(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                sucesso: false,
                mensagem: err.message || "Erro no upload de arquivos"
            });
        }

        const {
            nomeEstudante, contactoEstudante, emailEstudante,
            biEstudante, sexoEstudante, periodoEstudante,
            idcurso, id_periodo, senhaEstudante, codigo,
            email
        } = req.body;

        // Pegar arquivos
        const foto = req.files?.foto ? req.files.foto[0].filename : null;
        const documentos = req.files?.documentos || [];

        // Função para limpar arquivos
        const limparArquivos = () => {
            if (foto) {
                const fs = require('fs');
                const path = require('path');
                const caminhoFoto = path.join(__dirname, '../../client/src/img/alunos', foto);
                if (fs.existsSync(caminhoFoto)) {
                    fs.unlinkSync(caminhoFoto);
                }
            }
            documentos.forEach(doc => {
                const fs = require('fs');
                const path = require('path');
                const caminhoDoc = path.join(__dirname, '../../client/src/img/alunos/documentos', doc.filename);
                if (fs.existsSync(caminhoDoc)) {
                    fs.unlinkSync(caminhoDoc);
                }
            });
        };

        try {
            // Validação de campos obrigatórios
            const camposObrigatorios = [
                { nome: "nomeEstudante", valor: nomeEstudante },
                { nome: "contactoEstudante", valor: contactoEstudante },
                { nome: "emailEstudante", valor: emailEstudante },
                { nome: "biEstudante", valor: biEstudante },
                { nome: "sexoEstudante", valor: sexoEstudante },
                { nome: "idcurso", valor: idcurso },
                { nome: "id_periodo", valor: id_periodo },
                { nome: "senhaEstudante", valor: senhaEstudante },
                { nome: "codigo", valor: codigo }
            ];

            for (const campo of camposObrigatorios) {
                if (!campo.valor || campo.valor.toString().trim() === "") {
                    limparArquivos();
                    return res.status(400).json({
                        sucesso: false,
                        mensagem: `O campo ${campo.nome} é obrigatório`
                    });
                }
            }

            // Validar nome
            if (nomeEstudante.length < 3 || nomeEstudante.length > 100) {
                limparArquivos();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Nome deve ter entre 3 e 100 caracteres"
                });
            }

            if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nomeEstudante)) {
                limparArquivos();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Nome deve conter apenas letras e espaços"
                });
            }

            // Validar BI
            if (biEstudante.length < 9 || biEstudante.length > 14) {
                limparArquivos();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "BI deve ter entre 9 e 14 caracteres"
                });
            }

            if (!/^[a-zA-Z0-9]+$/.test(biEstudante)) {
                limparArquivos();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "BI deve conter apenas letras e números"
                });
            }

            // Validar contacto
            if (!/^[0-9]{9,12}$/.test(contactoEstudante)) {
                limparArquivos();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Contacto deve ter entre 9 e 12 dígitos"
                });
            }

            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailEstudante)) {
                limparArquivos();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Email inválido"
                });
            }

            // Validar senha
            if (senhaEstudante.length < 6) {
                limparArquivos();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Senha deve ter pelo menos 6 caracteres"
                });
            }

            // Validar sexo
            const generosPermitidos = ["Masculino", "Feminino"];
            if (!generosPermitidos.includes(sexoEstudante)) {
                limparArquivos();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Sexo inválido"
                });
            }

            // Verificar código no cache em memória
            const emailKey = email.trim().toLowerCase();
            const dadosCache = codigosVerificacao.get(emailKey);

            if (!dadosCache) {
                limparArquivos();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Nenhum código de verificação encontrado. Solicite um novo."
                });
            }

            // Verificar expiração
            if (dadosCache.expiracao < Date.now()) {
                codigosVerificacao.delete(emailKey);
                limparArquivos();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Código expirado. Solicite um novo."
                });
            }

            // Verificar tentativas
            if (dadosCache.tentativas >= 3) {
                codigosVerificacao.delete(emailKey);
                limparArquivos();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Muitas tentativas. Solicite um novo código."
                });
            }

            // Verificar código
            if (dadosCache.codigo !== codigo.trim()) {
                dadosCache.tentativas += 1;
                codigosVerificacao.set(emailKey, dadosCache);
                
                limparArquivos();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: `Código inválido. Tentativas restantes: ${3 - dadosCache.tentativas}`
                });
            }

            // Verificações de unicidade no banco
            const verificarBI = await new Promise((resolve, reject) => {
                conexao.query(
                    "SELECT id_est FROM estudante_inscricao WHERE bi = ?",
                    [biEstudante.trim().toUpperCase()],
                    (erro, resultados) => {
                        if (erro) reject(erro);
                        else resolve(resultados);
                    }
                );
            });

            if (verificarBI.length > 0) {
                limparArquivos();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "BI já está cadastrado"
                });
            }

            const verificarEmail = await new Promise((resolve, reject) => {
                conexao.query(
                    "SELECT id_est FROM estudante_inscricao WHERE email = ?",
                    [email.trim().toLowerCase()],
                    (erro, resultados) => {
                        if (erro) reject(erro);
                        else resolve(resultados);
                    }
                );
            });

            if (verificarEmail.length > 0) {
                limparArquivos();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Email já está cadastrado"
                });
            }

            const verificarContacto = await new Promise((resolve, reject) => {
                conexao.query(
                    "SELECT id_est FROM estudante_inscricao WHERE contacto = ?",
                    [contactoEstudante.trim()],
                    (erro, resultados) => {
                        if (erro) reject(erro);
                        else resolve(resultados);
                    }
                );
            });

            if (verificarContacto.length > 0) {
                limparArquivos();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Contacto já está cadastrado"
                });
            }

            // Verificar curso e período - BUSCANDO O CAMPO 'curso' (não 'nome_curso')
            const verificarCurso = await new Promise((resolve, reject) => {
                conexao.query(
                    "SELECT id_curso, curso FROM curso WHERE id_curso = ? AND status = 'Ativo'",
                    [idcurso],
                    (erro, resultados) => {
                        if (erro) reject(erro);
                        else resolve(resultados);
                    }
                );
            });

            if (verificarCurso.length === 0) {
                limparArquivos();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Curso inválido ou inativo"
                });
            }

            // Armazenar o nome do curso para usar no email
            const nomeCurso = verificarCurso[0].curso;

            const verificarPeriodo = await new Promise((resolve, reject) => {
                conexao.query(
                    "SELECT id_periodo FROM periodo WHERE id_periodo = ? AND status = 'Ativo'",
                    [id_periodo],
                    (erro, resultados) => {
                        if (erro) reject(erro);
                        else resolve(resultados);
                    }
                );
            });

            if (verificarPeriodo.length === 0) {
                limparArquivos();
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Período inválido ou inativo"
                });
            }

            // Gerar ID e criptografar senha
            const id_est = gerarId();
            const codigoEstudante = gerarCodigoDezDigitos();
            const senhaCriptografada = await criptografarSenha(senhaEstudante);
            const nota = '--';

            // Inserir estudante
            await new Promise((resolve, reject) => {
                const sql = `INSERT INTO estudante_inscricao (
                    id_est, nome, contacto, genero, email, bi, 
                    status, id_curso, id_periodo, codigo, nota, 
                    senha, foto
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                conexao.query(sql, [
                    id_est,
                    nomeEstudante.trim(),
                    contactoEstudante.trim(),
                    sexoEstudante,
                    email.trim().toLowerCase(),
                    biEstudante.trim().toUpperCase(),
                    'Pendente',
                    idcurso,
                    id_periodo,
                    codigoEstudante,
                    nota,
                    senhaCriptografada,
                    foto
                ], (erro, resultado) => {
                    if (erro) reject(erro);
                    else resolve(resultado);
                });
            });

            // Inserir documentos
            for (let i = 0; i < documentos.length; i++) {
                const doc = documentos[i];
                const titulo = doc.originalname;
                const id_fei = gerarId();

                await new Promise((resolve, reject) => {
                    const sql = `INSERT INTO ficheiro_estudante_inscricao (
                        id_fei, titulo, doc, id_est
                    ) VALUES (?, ?, ?, ?)`;

                    conexao.query(sql, [
                        id_fei,
                        titulo,
                        doc.filename,
                        id_est
                    ], (erro, resultado) => {
                        if (erro) reject(erro);
                        else resolve(resultado);
                    });
                });
            }

            // Remover código do cache
            codigosVerificacao.delete(emailKey);

            // Enviar email de confirmação - USANDO O NOME DO CURSO
            const htmlConfirmacao = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Cadastro Realizado - IMETRO</title>
                    <style>
                        @media only screen and (max-width: 600px) {
                            .container { width: 100% !important; }
                            .padding { padding: 20px !important; }
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: #003366;
                            padding: 30px;
                            text-align: center;
                        }
                        .content {
                            padding: 35px 30px;
                            background: #ffffff;
                        }
                        .footer {
                            background: #002244;
                            padding: 25px;
                            text-align: center;
                        }
                        .info-box {
                            background-color: #f8f9fa;
                            padding: 20px;
                            border-radius: 6px;
                            margin: 0 0 20px 0;
                            border-left: 4px solid #B8860B;
                        }
                        .info-box p {
                            margin: 0 0 12px 0;
                            font-size: 14px;
                        }
                        .info-box p:last-child {
                            margin-bottom: 0;
                        }
                        .label {
                            color: #003366;
                            font-weight: bold;
                        }
                        .value {
                            color: #B8860B;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
                    <div class="container">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <tr>
                                <td class="header">
                                    <h1 style="color: #B8860B; margin: 0; font-size: 22px; font-weight: 600;">IMETRO</h1>
                                    <p style="color: #ffffff; margin: 8px 0 0 0; font-size: 12px;">Instituto Politécnico Superior Metropolitano de Angola</p>
                                </td>
                            </tr>
                            <tr>
                                <td class="content">
                                    <h2 style="color: #003366; margin: 0 0 20px 0;">Cadastro Realizado com Sucesso!</h2>
                                    <p style="color: #333333; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">Olá <strong style="color: #003366;">${nomeEstudante}</strong>,</p>
                                    <p style="color: #333333; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">Seu cadastro no IMETRO foi realizado com sucesso!</p>
                                    
                                    <div class="info-box">
                                        <p><span class="label">Seu código de estudante:</span> <span class="value">${codigoEstudante}</span></p>
                                        <p><span class="label">Status:</span> <span class="value">Pendente</span></p>
                                        <p><span class="label">Curso:</span> <span class="value">${nomeCurso}</span></p>
                                    </div>
                                    
                                    <p style="color: #333333; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">Sua inscrição está sendo analisada pela coordenação.</p>
                                    <p style="color: #666666; font-size: 13px; margin: 0;">Você será notificado quando seu status for atualizado.</p>
                                </td>
                            </tr>
                            <tr>
                                <td class="footer">
                                    <p style="color: #B8860B; margin: 0 0 10px 0; font-size: 12px;">Instituto Politécnico Superior Metropolitano de Angola</p>
                                    <p style="color: #ffffff; margin: 0; font-size: 11px;">Este é um email automático, por favor não responda.</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </body>
                </html>
            `;

            await enviarEmail(email, 'Cadastro Realizado com Sucesso - IMETRO', htmlConfirmacao);

            res.status(201).json({
                sucesso: true,
                titulo: "Cadastro realizado!",
                mensagem: `Estudante ${nomeEstudante} cadastrado com sucesso!`,
                redirect: "/login",
                dados: {
                    id: id_est,
                    nome: nomeEstudante,
                    email: email,
                    codigo: codigoEstudante,
                    status: "Pendente"
                }
            });

        } catch (erro) {
            limparArquivos();
            console.error("Erro ao completar cadastro:", erro);
            res.status(500).json({
                sucesso: false,
                mensagem: erro.message || "Erro ao completar cadastro"
            });
        }
    });
});

module.exports = router;