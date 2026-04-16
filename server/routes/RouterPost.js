const { Router } = require("express");
const router = Router();
const sequelize = require("../infra/conexao");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
require("dotenv").config({ quiet: true });

// Models
const CategoriaCurso = require("../Models/categoriacursoModel");
const Curso = require("../Models/cursoModel");
const AnoCurricular = require("../Models/anoCurricularModel");
const Disciplina = require("../Models/disciplinaModel");
const Semestre = require("../Models/semestreModel");
const Professor = require("../Models/professorModel");
const DiscProf = require("../Models/disc_profModel");
const Periodo = require("../Models/periodoModel");
const Funcionario = require("../Models/funcionarioModel");
const CargoFuncionario = require("../Models/cargoFuncionarioModel");
const CargoFuncionarioRelation = require("../Models/cargoFuncionarioRelationModel");
const EstudanteInscricao = require("../Models/EstudanteInscricaoModel");

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
                <p>Recebemos uma solicitação de nova Inscrição no Sistema de Gestão Acadêmica do <strong>IPS Metropolitano</strong>.</p>
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
                <h2 style="color: #333; text-align: center;">Inscrição Confirmada com Sucesso!</h2>
                <p>Olá <strong>${nome}</strong>,</p>
                <p>A sua inscrição no <strong>Sistema de Gestão Acadêmica do IPS Metropolitano</strong> foi realizada com sucesso!</p>
                <p>Abaixo estão suas credenciais de acesso. Guarde-as em local seguro:</p>
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #FFD700;">
                    <p style="margin: 5px 0;"><strong>Número de Inscrição:</strong></p>
                    <p style="font-size: 24px; color: #FFD700; margin: 5px 0; font-weight: bold;">${numEstudante}</p>
                    <p style="margin: 15px 0 5px 0;"><strong>Senha de Acesso:</strong></p>
                    <p style="font-size: 18px; background-color: #fff; padding: 10px; border-radius: 3px; font-family: monospace;">${senha}</p>
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

// ========== ROTA: Enviar código de verificação ==========
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
        const emailExistente = await EstudanteInscricao.findOne({
            where: { email_estudanteInscricao: emailEstudante }
        });

        if (emailExistente) {
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

// ========== ROTA: Verificar código e completar cadastro ==========
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

        const dadosVerificacao = codigosVerificacao.get(email);

        if (!dadosVerificacao) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Código expirado",
                mensagem: "Código não encontrado ou expirado. Solicite um novo código."
            });
        }

        if (dadosVerificacao.expiracao < Date.now()) {
            codigosVerificacao.delete(email);
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Código expirado",
                mensagem: "Código expirado. Solicite um novo código."
            });
        }

        if (dadosVerificacao.tentativas >= 3) {
            codigosVerificacao.delete(email);
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Muitas tentativas",
                mensagem: "Você excedeu o número de tentativas. Solicite um novo código."
            });
        }

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

// ========== FUNÇÃO AUXILIAR: Completar cadastro do estudante ==========
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

        if (!nomeEstudante || !contactoEstudante || !emailEstudante || !biEstudante || 
            !sexoEstudante || !periodoEstudante || !idcurso || !senhaEstudante) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Campos obrigatórios",
                mensagem: "Todos os campos são obrigatórios!"
            });
        }

        if (!files.documentoEstudante || !files.fotoEstudante) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Arquivos obrigatórios",
                mensagem: "Documento (BI/Certificado) e Foto são obrigatórios!"
            });
        }

        // Gerar número de inscrição
        const anoAtual = new Date().getFullYear().toString();
        const gerarNumeroEstudante = () => anoAtual + Math.floor(100000 + Math.random() * 900000).toString();

        let numEstudante = gerarNumeroEstudante();
        let numeroExiste = true;
        let tentativas = 0;
        const maxTentativas = 10;

        while (numeroExiste && tentativas < maxTentativas) {
            const existe = await EstudanteInscricao.findOne({
                where: { numeroInscricao_estudanteInscricao: numEstudante }
            });
            if (!existe) {
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

        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senhaEstudante, salt);

        let nomeDocumento = null;
        let nomeFoto = null;

        const pastaEstudantes = path.join(__dirname, '../../client/src/img/estudantes');
        const pastaDocumentos = path.join(__dirname, '../../client/src/img/estudantes/documentos');
        
        if (!fs.existsSync(pastaEstudantes)) fs.mkdirSync(pastaEstudantes, { recursive: true });
        if (!fs.existsSync(pastaDocumentos)) fs.mkdirSync(pastaDocumentos, { recursive: true });

        // Processar documento
        if (files.documentoEstudante) {
            const documento = files.documentoEstudante;
            const extensao = path.extname(documento.name);
            nomeDocumento = `estudante_${numEstudante}_doc_${Date.now()}${extensao}`;
            await documento.mv(path.join(pastaDocumentos, nomeDocumento));
        }

        // Processar foto
        if (files.fotoEstudante) {
            const foto = files.fotoEstudante;
            const extensao = path.extname(foto.name);
            nomeFoto = `estudante_${numEstudante}_foto_${Date.now()}${extensao}`;
            await foto.mv(path.join(pastaEstudantes, nomeFoto));
        }

        // Criar estudante no banco
        const novoEstudante = await EstudanteInscricao.create({
            nome_estudanteInscricao: nomeEstudante,
            contacto_estudanteInscricao: contactoEstudante,
            email_estudanteInscricao: emailEstudante,
            bi_estudanteInscricao: biEstudante,
            numeroInscricao_estudanteInscricao: numEstudante,
            sexo_estudanteInscricao: sexoEstudante,
            periodo_estudanteInscricao: periodoEstudante,
            idcurso: idcurso,
            documento_estudanteInscricao: nomeDocumento,
            foto_estudanteInscricao: nomeFoto,
            senha_estudanteInscricao: senhaCriptografada
        });

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
                id: novoEstudante.id_estudanteInscricao,
                nome: nomeEstudante,
                numEstudante: numEstudante
            }
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

// ========== ROTA: Registrar estudante inscrição (versão direta) ==========
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

        if (!nomeEstudante || !contactoEstudante || !emailEstudante || !biEstudante || 
            !sexoEstudante || !periodoEstudante || !idcurso || !senhaEstudante) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Campos obrigatórios",
                mensagem: "Todos os campos são obrigatórios!"
            });
        }

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

        // Verificar duplicatas
        const emailExistente = await EstudanteInscricao.findOne({
            where: { email_estudanteInscricao: emailEstudante }
        });
        if (emailExistente) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Email existente",
                mensagem: "Este email já está registrado!"
            });
        }

        const contatoExistente = await EstudanteInscricao.findOne({
            where: { contacto_estudanteInscricao: contactoEstudante }
        });
        if (contatoExistente) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Contato existente",
                mensagem: "Este número de contato já está registrado!"
            });
        }

        const biExistente = await EstudanteInscricao.findOne({
            where: { bi_estudanteInscricao: biEstudante }
        });
        if (biExistente) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "BI existente",
                mensagem: "Este número de BI já está registrado!"
            });
        }

        // Gerar número de inscrição
        const anoAtual = new Date().getFullYear().toString();
        const gerarNumeroEstudante = () => anoAtual + Math.floor(100000 + Math.random() * 900000).toString();

        let numEstudante = gerarNumeroEstudante();
        let numeroExiste = true;
        let tentativas = 0;
        const maxTentativas = 10;

        while (numeroExiste && tentativas < maxTentativas) {
            const existe = await EstudanteInscricao.findOne({
                where: { numeroInscricao_estudanteInscricao: numEstudante }
            });
            if (!existe) {
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

        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senhaEstudante, salt);

        let nomeDocumento = null;
        let nomeFoto = null;

        const pastaEstudantes = path.join(__dirname, '../../client/src/img/estudantes');
        const pastaDocumentos = path.join(__dirname, '../../client/src/img/estudantes/documentos');
        
        if (!fs.existsSync(pastaEstudantes)) fs.mkdirSync(pastaEstudantes, { recursive: true });
        if (!fs.existsSync(pastaDocumentos)) fs.mkdirSync(pastaDocumentos, { recursive: true });

        // Processar documento
        if (files.documentoEstudante) {
            const documento = files.documentoEstudante;
            const extensao = path.extname(documento.name);
            nomeDocumento = `estudante_${numEstudante}_doc_${Date.now()}${extensao}`;
            await documento.mv(path.join(pastaDocumentos, nomeDocumento));
        }

        // Processar foto
        if (files.fotoEstudante) {
            const foto = files.fotoEstudante;
            const extensao = path.extname(foto.name);
            nomeFoto = `estudante_${numEstudante}_foto_${Date.now()}${extensao}`;
            await foto.mv(path.join(pastaEstudantes, nomeFoto));
        }

        // Criar estudante
        const novoEstudante = await EstudanteInscricao.create({
            nome_estudanteInscricao: nomeEstudante,
            contacto_estudanteInscricao: contactoEstudante,
            email_estudanteInscricao: emailEstudante,
            bi_estudanteInscricao: biEstudante,
            numeroInscricao_estudanteInscricao: numEstudante,
            sexo_estudanteInscricao: sexoEstudante,
            periodo_estudanteInscricao: periodoEstudante,
            idcurso: idcurso,
            documento_estudanteInscricao: nomeDocumento,
            foto_estudanteInscricao: nomeFoto,
            senha_estudanteInscricao: senhaCriptografada
        });

        res.status(201).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Inscrição Realizada!",
            mensagem: `Estudante registrado com sucesso! Nº de Inscrição: ${numEstudante}`,
            redirect: "/",
            dados: {
                id: novoEstudante.id_estudanteInscricao,
                nome: nomeEstudante,
                numEstudante: numEstudante,
                bi: biEstudante
            }
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

// ========== ROTA: Registrar categoria ==========
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

    try {
        const categoriaExistente = await CategoriaCurso.findOne({
            where: { categoriacurso: categoriacurso }
        });

        if (categoriaExistente) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Categoria Existe",
                mensagem: "Esta categoria já está registrada!"
            });
        }

        const novaCategoria = await CategoriaCurso.create({
            categoriacurso: categoriacurso,
            idAdm: idAdm
        });

        return res.status(201).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Categoria Registrada",
            mensagem: "Categoria registrada com sucesso!",
            dados: {
                id: novaCategoria.idcategoriacurso,
                categoriacurso: novaCategoria.categoriacurso,
                idAdm: novaCategoria.idAdm
            }
        });

    } catch (error) {
        console.error("Erro ao registrar categoria:", error);
        return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro no servidor",
            mensagem: "Erro interno do servidor"
        });
    }
});

// ========== ROTA: Registrar curso ==========
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

    try {
        const cursoExistente = await Curso.findOne({
            where: { curso: curso }
        });

        if (cursoExistente) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Curso Existente",
                mensagem: "Este curso já está registrado!"
            });
        }

        const categoriaExistente = await CategoriaCurso.findByPk(idcategoriacurso);
        if (!categoriaExistente) {
            return res.status(404).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Categoria não encontrada",
                mensagem: "A categoria selecionada não existe"
            });
        }

        const novoCurso = await Curso.create({
            curso: curso,
            idcategoriacurso: idcategoriacurso
        });

        return res.status(201).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Curso Registrado",
            mensagem: "Curso registrado com sucesso!",
            dados: {
                id: novoCurso.idcurso,
                curso: novoCurso.curso,
                idcategoriacurso: novoCurso.idcategoriacurso
            }
        });

    } catch (error) {
        console.error("Erro ao registrar curso:", error);
        return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro no servidor",
            mensagem: "Erro interno do servidor"
        });
    }
});

// ========== ROTA: Registrar ano curricular ==========
router.post('/registrarAnoCurricular', async (req, res) => {
    const { anocurricular, idcurso } = req.body;

    if (!anocurricular || !idcurso) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha ano curricular e curso"
        });
    }

    try {
        const cursoExistente = await Curso.findByPk(idcurso);
        if (!cursoExistente) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Curso inválido",
                mensagem: "O curso selecionado não existe"
            });
        }

        const anoExistente = await AnoCurricular.findOne({
            where: { anocurricular: anocurricular, idcurso: idcurso }
        });

        if (anoExistente) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Ano Curricular Duplicado",
                mensagem: `O ano ${anocurricular} já existe para este curso`
            });
        }

        const novoAno = await AnoCurricular.create({
            anocurricular: anocurricular,
            idcurso: idcurso
        });

        return res.status(201).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Ano Curricular Registrado",
            mensagem: `Ano ${anocurricular} registrado com sucesso!`,
            dados: {
                id: novoAno.idanocurricular,
                anocurricular: novoAno.anocurricular,
                idcurso: novoAno.idcurso,
                curso_nome: cursoExistente.curso
            }
        });

    } catch (error) {
        console.error("Erro ao registrar ano curricular:", error);
        return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro no servidor",
            mensagem: "Erro interno do servidor"
        });
    }
});

// ========== ROTA: Registrar disciplina ==========
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

    try {
        const disciplinaExistente = await Disciplina.findOne({
            where: { disciplina: disciplina }
        });

        if (disciplinaExistente) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Disciplina Existe",
                mensagem: "Esta Disciplina já está registrada!"
            });
        }

        const novaDisciplina = await Disciplina.create({
            disciplina: disciplina,
            idAdm: idAdm
        });

        return res.status(201).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Disciplina Registrada",
            mensagem: "Disciplina registrada com sucesso!",
            dados: {
                id: novaDisciplina.iddisciplina,
                disciplina: novaDisciplina.disciplina,
                idAdm: novaDisciplina.idAdm
            }
        });

    } catch (error) {
        console.error("Erro ao registrar disciplina:", error);
        return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro no servidor",
            mensagem: "Erro interno do servidor"
        });
    }
});

// ========== ROTA: Registrar disciplina no curso ==========
router.post('/registrarDisciplinaCurso', async (req, res) => {
    const { iddisciplina, idanocurricular, idcurso, semestre, idcategoriacurso } = req.body;

    if (!iddisciplina || !idanocurricular || !idcurso || !semestre || !idcategoriacurso) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha todos os campos"
        });
    }

    try {
        const disciplina = await Disciplina.findByPk(iddisciplina);
        if (!disciplina) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Disciplina inválida",
                mensagem: "A disciplina selecionada não existe"
            });
        }

        const ano = await AnoCurricular.findByPk(idanocurricular);
        if (!ano) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Ano Curricular inválido",
                mensagem: "O ano curricular selecionado não existe"
            });
        }

        const curso = await Curso.findByPk(idcurso);
        if (!curso) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Curso inválido",
                mensagem: "O curso selecionado não existe"
            });
        }

        const categoria = await CategoriaCurso.findByPk(idcategoriacurso);
        if (!categoria) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Categoria inválida",
                mensagem: "A categoria selecionada não existe"
            });
        }

        if (curso.idcategoriacurso != idcategoriacurso) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Inconsistência de dados",
                mensagem: "O curso selecionado não pertence à categoria informada"
            });
        }

        const duplicado = await Semestre.findOne({
            where: { iddisciplina, idanocurricular, idcurso, semestre }
        });

        if (duplicado) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Disciplina Duplicada",
                mensagem: `Esta disciplina já está atribuída a este curso/ano no ${semestre}º semestre`
            });
        }

        const novo = await Semestre.create({
            idcategoriacurso,
            iddisciplina,
            idanocurricular,
            idcurso,
            semestre
        });

        res.status(201).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Disciplina Atribuída",
            mensagem: `Disciplina "${disciplina.disciplina}" atribuída ao ${semestre}º semestre do ${ano.anocurricular}º ano com sucesso!`,
            dados: {
                id: novo.idsemestre,
                iddisciplina,
                idanocurricular,
                idcurso,
                idcategoriacurso,
                semestre
            }
        });

    } catch (error) {
        console.error("Erro ao registrar disciplina no curso:", error);
        return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro no servidor",
            mensagem: "Erro interno do servidor"
        });
    }
});

// ========== ROTA: Registrar professor ==========
router.post('/registrarprofessor', async (req, res) => {
    try {
        const body = req.body || {};
        const files = req.files || {};

        const {
            nomeprofessore, genero, nacionalidadeprofessor, estadocivilprofessor,
            nomepaiprofessor, nomemaeprofessor, biprofessor, datanascimentoprofessor,
            residenciaprofessor, telefoneprofessor, whatsappprofessor, emailprofessor,
            anoexprienciaprofessor, titulacaoprofessor, dataadmissaprofessor,
            tipocontratoprofessor, ibanprofessor, tiposanguineoprofessor,
            condicoesprofessor, contactoemergenciaprofessor, idAdm
        } = body;

        if (!nomeprofessore || !genero || !biprofessor || !idAdm) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Campos obrigatórios",
                mensagem: "Nome, gênero, BI e Administrador são obrigatórios!"
            });
        }

        const biExistente = await Professor.findOne({
            where: { nbiprofessor: biprofessor }
        });

        if (biExistente) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "BI existente",
                mensagem: "Este número de BI já está registrado!"
            });
        }

        // Gerar códigos únicos
        let codigoAcesso, codigoProfessor;
        let codigoUnico = false;
        let tentativas = 0;
        const maxTentativas = 10;

        while (!codigoUnico && tentativas < maxTentativas) {
            codigoAcesso = Math.floor(1000 + Math.random() * 9000).toString();
            const existe = await Professor.findOne({ where: { senhaprofessor: codigoAcesso } });
            if (!existe) codigoUnico = true;
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

        codigoUnico = false;
        tentativas = 0;

        while (!codigoUnico && tentativas < maxTentativas) {
            codigoProfessor = Math.floor(10000000 + Math.random() * 90000000).toString();
            const existe = await Professor.findOne({ where: { codigoprofessor: codigoProfessor } });
            if (!existe) codigoUnico = true;
            tentativas++;
        }

        if (!codigoUnico) {
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
        if (!fs.existsSync(pastaProfessores)) fs.mkdirSync(pastaProfessores, { recursive: true });

        if (files.fotoprofessor) {
            const foto = files.fotoprofessor;
            const extensaoFoto = path.extname(foto.name);
            nomeFoto = `professor_${codigoProfessor}_foto_${Date.now()}${extensaoFoto}`;
            await foto.mv(path.join(pastaProfessores, nomeFoto));
        }

        if (files.bipdfprofessor) {
            const pdf = files.bipdfprofessor;
            const extensaoPDF = path.extname(pdf.name);
            nomeBIPDF = `professor_${codigoProfessor}_bi_${Date.now()}${extensaoPDF}`;
            await pdf.mv(path.join(pastaProfessores, nomeBIPDF));
        }

        const converterParaNull = (valor) => (valor === "" ? null : valor);

        const novoProfessor = await Professor.create({
            codigoprofessor: codigoProfessor,
            fotoprofessor: nomeFoto,
            nomeprofessor: nomeprofessore,
            generoprofessor: genero,
            nacionalidadeprofessor: converterParaNull(nacionalidadeprofessor),
            estadocivilprofessor: converterParaNull(estadocivilprofessor),
            nomepaiprofessor: converterParaNull(nomepaiprofessor),
            nomemaeprofessor: converterParaNull(nomemaeprofessor),
            nbiprofessor: biprofessor,
            datanascimentoprofessor: converterParaNull(datanascimentoprofessor),
            bipdfprofessor: nomeBIPDF,
            residenciaprofessor: converterParaNull(residenciaprofessor),
            telefoneprofessor: converterParaNull(telefoneprofessor),
            whatsappprofessor: converterParaNull(whatsappprofessor),
            emailprofessor: converterParaNull(emailprofessor),
            anoexperienciaprofessor: converterParaNull(anoexprienciaprofessor),
            titulacaoprofessor: converterParaNull(titulacaoprofessor),
            dataadmissaoprofessor: converterParaNull(dataadmissaprofessor),
            tipocontratoprofessor: converterParaNull(tipocontratoprofessor),
            ibanprofessor: converterParaNull(ibanprofessor),
            tiposanguineoprofessor: converterParaNull(tiposanguineoprofessor),
            condicoesprofessor: converterParaNull(condicoesprofessor),
            contactoemergenciaprofessor: converterParaNull(contactoemergenciaprofessor),
            idAdm: idAdm,
            senhaprofessor: senhaCriptografada
        });

        res.status(201).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Professor Registrado!",
            mensagem: "Professor registrado com sucesso!",
            dados: {
                idprofessor: novoProfessor.idprofessor,
                nomeprofessore: nomeprofessore,
                codigoProfessor: codigoProfessor,
                codigoAcesso: codigoAcesso,
                biprofessor: biprofessor
            }
        });

    } catch (erro) {
        console.error("Erro ao registrar professor:", erro);
        return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro interno",
            mensagem: "Erro interno do servidor: " + erro.message
        });
    }
});

// ========== ROTA: Registrar disciplina para professor ==========
router.post('/registrerDisciplinaProfessor', async (req, res) => {
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
        const professor = await Professor.findByPk(idprofessor);
        if (!professor) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Professor inválido",
                mensagem: "O professor selecionado não existe"
            });
        }

        const disciplina = await Disciplina.findByPk(iddisciplina);
        if (!disciplina) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Disciplina inválida",
                mensagem: "A disciplina selecionada não existe"
            });
        }

        const duplicado = await DiscProf.findOne({
            where: { idprofessor, iddisciplina }
        });

        if (duplicado) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Disciplina Duplicada",
                mensagem: "Esta disciplina já está atribuída a este professor"
            });
        }

        const relacao = await DiscProf.create({ idprofessor, iddisciplina });

        return res.status(201).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Disciplina Atribuída",
            mensagem: `Disciplina "${disciplina.disciplina}" atribuída ao professor "${professor.nomeprofessor}" com sucesso!`,
            dados: {
                id: relacao.iddiscprof,
                idprofessor,
                iddisciplina
            }
        });

    } catch (error) {
        console.error("Erro ao atribuir disciplina:", error);
        return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro no servidor",
            mensagem: "Erro interno ao atribuir disciplina ao professor"
        });
    }
});

// ========== ROTA: Vincular professor (versão alternativa) ==========
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
        const existe = await DiscProf.findOne({
            where: { idprofessor, iddisciplina }
        });

        if (existe) {
            return res.status(409).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Vínculo existente",
                mensagem: "Este professor já está vinculado a esta disciplina"
            });
        }

        const vinculo = await DiscProf.create({ idprofessor, iddisciplina });

        return res.status(201).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Vinculação realizada",
            mensagem: "Professor vinculado à disciplina com sucesso",
            dados: {
                idVinculo: vinculo.iddiscprof,
                idprofessor,
                iddisciplina
            }
        });

    } catch (error) {
        console.error("Erro ao vincular professor:", error);
        return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro interno",
            mensagem: "Não foi possível vincular o professor à disciplina"
        });
    }
});

// ========== ROTA: Registrar período ==========
router.post('/registrarPeriodo', async (req, res) => {
    const { idanocurricular, idcurso, idcategoriacurso, turma, periodo, anoletivo } = req.body;

    if (!idanocurricular || !idcurso || !idcategoriacurso || !turma || !periodo || !anoletivo) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha todos os campos obrigatórios"
        });
    }

    try {
        const ano = await AnoCurricular.findByPk(idanocurricular);
        if (!ano) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Ano Curricular inválido",
                mensagem: "O ano curricular selecionado não existe"
            });
        }

        const curso = await Curso.findByPk(idcurso);
        if (!curso) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Curso inválido",
                mensagem: "O curso selecionado não existe"
            });
        }

        const categoria = await CategoriaCurso.findByPk(idcategoriacurso);
        if (!categoria) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Categoria inválida",
                mensagem: "A categoria selecionada não existe"
            });
        }

        if (curso.idcategoriacurso != idcategoriacurso) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Inconsistência de dados",
                mensagem: "O curso selecionado não pertence à categoria informada"
            });
        }

        const duplicado = await Periodo.findOne({
            where: { idanocurricular, idcurso, turma, periodo, anoletivo }
        });

        if (duplicado) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Turma/Período Duplicado",
                mensagem: `Esta turma "${turma}" no período "${periodo}" já existe para este curso/ano`
            });
        }

        const novoPeriodo = await Periodo.create({
            idanocurricular,
            idcategoriacurso,
            idcurso,
            turma,
            periodo,
            anoletivo
        });

        res.status(201).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Turma/Período Registrado",
            mensagem: `Turma "${turma}" no período "${periodo}" registrada com sucesso!`,
            dados: {
                id: novoPeriodo.idperiodo,
                idanocurricular,
                idcurso,
                anoletivo,
                idcategoriacurso,
                turma,
                periodo
            }
        });

    } catch (error) {
        console.error("Erro ao registrar período:", error);
        return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro no servidor",
            mensagem: "Erro interno ao registrar turma/período"
        });
    }
});

// ========== ROTA: Registrar funcionário ==========
router.post('/registrarfuncionario', async (req, res) => {
    const {
        nome_funcionario,
        contacto_funcionario,
        bi_funcionario,
        cargo_funcionario,
        idAdm
    } = req.body;

    if (!nome_funcionario?.trim()) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "O nome do funcionário é obrigatório!"
        });
    }

    if (!contacto_funcionario?.trim()) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "O contacto do funcionário é obrigatório!"
        });
    }

    if (!bi_funcionario?.trim()) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "O número do BI é obrigatório!"
        });
    }

    if (!cargo_funcionario?.trim()) {
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

    const transaction = await sequelize.transaction();

    try {
        const contactoExistente = await Funcionario.findOne({
            where: { contacto_funcionario: contacto_funcionario.trim() },
            transaction
        });

        if (contactoExistente) {
            await transaction.rollback();
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Contacto existente",
                mensagem: "Este contacto já está em uso por outro funcionário!"
            });
        }

        const biExistente = await Funcionario.findOne({
            where: { bi_funcionario: bi_funcionario.trim() },
            transaction
        });

        if (biExistente) {
            await transaction.rollback();
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

        const novoFuncionario = await Funcionario.create({
            nome_funcionario: nome_funcionario.trim(),
            contacto_funcionario: contacto_funcionario.trim(),
            bi_funcionario: bi_funcionario.trim(),
            senha_funcionario: senhaCriptografada,
            idadm: idAdm,
            estado_funcionario: "Ativo"
        }, { transaction });

        const cargo = await CargoFuncionario.findOne({
            where: { cargo: cargo_funcionario },
            transaction
        });

        if (!cargo) {
            await transaction.rollback();
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Cargo inválido",
                mensagem: "O cargo informado não existe no sistema"
            });
        }

        await CargoFuncionarioRelation.create({
            id_funcionario: novoFuncionario.id_funcionario,
            id_cargo: cargo.id_cargo
        }, { transaction });

        await transaction.commit();

        return res.status(201).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Funcionário Registrado com Sucesso",
            mensagem: `Funcionário ${nome_funcionario} registrado com sucesso!`,
            dados: {
                id: novoFuncionario.id_funcionario,
                nome: nome_funcionario,
                contacto: contacto_funcionario,
                bi: bi_funcionario,
                cargo: cargo_funcionario,
                senha_original: senha_funcionario
            }
        });

    } catch (erro) {
        await transaction.rollback();
        console.error("Erro ao registrar funcionário:", erro);
        return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro no servidor",
            mensagem: "Erro interno ao registrar funcionário"
        });
    }
});

module.exports = router;