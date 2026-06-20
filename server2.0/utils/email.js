const nodemailer = require("nodemailer");
require("dotenv").config();
const path = require("path");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
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

const enviarEmail = async (destinatario, assunto, html) => {
    try {
        const mailOptions = {
            from: `"IPS Metropolitano" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: assunto,
            html: html
        };
        await transporter.sendMail(mailOptions);
        console.log(`Email enviado para: ${destinatario}`);
        return { sucesso: true };
    } catch (error) {
        console.error("Erro ao enviar email:", error);
        return { sucesso: false, erro: error.message };
    }
};

// Função corrigida - aceita 4 parâmetros (email, nome, senha, codigo)
const enviarCredenciaisFuncionario = async (email, nome, senha, codigo) => {
    const logoUrl = `${process.env.APP_URL || 'http://localhost:3000'}/api/img/imetro2.jpeg`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Credenciais de Acesso - IPS Metropolitano</title>
            <style>
                @media only screen and (max-width: 600px) {
                    .container { width: 100% !important; }
                    .padding { padding: 20px !important; }
                }
                .btn {
                    display: inline-block;
                    background-color: #B8860B;
                    color: #ffffff;
                    padding: 12px 25px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    margin-top: 15px;
                }
                .btn:hover {
                    background-color: #9a6e0a;
                }
            </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: #003366; padding: 30px; text-align: center;">
                            <img src="${logoUrl}" alt="Logo IPS Metropolitano" style="width: 80px; height: auto; margin-bottom: 15px; border-radius: 10px;">
                            <h1 style="color: #B8860B; margin: 10px 0 0 0; font-size: 22px; font-weight: 600;">IPS METROPOLITANO</h1>
                            <p style="color: #ffffff; margin: 8px 0 0 0; font-size: 12px;">Instituto Politécnico Superior Metropolitano de Angola</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 35px 30px;">
                            <h2 style="color: #003366; text-align: center; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">Bem-vindo ao IPS Metropolitano!</h2>
                            
                            <p style="color: #333333; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">Olá <strong style="color: #003366;">${nome}</strong>,</p>
                            <p style="color: #333333; font-size: 14px; line-height: 1.6; margin: 0 0 25px 0;">Foi criada uma conta para você no Sistema de Gestão Acadêmica do IPS Metropolitano.</p>
                            
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 0 0 20px 0; border-left: 4px solid #B8860B;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 12px 0; font-size: 13px; color: #666666;">Suas credenciais de acesso:</p>
                                        <p style="margin: 0 0 12px 0; font-size: 15px;"><strong style="color: #003366;">Código de Acesso:</strong> <span style="font-size: 22px; font-weight: bold; color: #B8860B;">${codigo}</span></p>
                                        <p style="margin: 0 0 12px 0; font-size: 15px;"><strong style="color: #003366;">Senha Temporária:</strong> <span style="font-size: 18px; font-weight: bold; color: #B8860B;">${senha}</span></p>
                                        <p style="margin: 0; font-size: 14px;"><strong style="color: #003366;">Acesso:</strong> Utilize seu código de acesso para entrar no sistema</p>
                                    </td>
                                </tr>
                            </table>
                            
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 0 0 20px 0;">
                                <tr>
                                    <td>
                                        <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.5;"><strong>⚠️ Recomendação de Segurança:</strong> Recomendamos alterar sua senha no primeiro acesso ao sistema.</p>
                                    </td>
                                </tr>
                            </table>
                            
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #e8f4f8; padding: 15px; border-radius: 6px; margin: 0 0 20px 0;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 8px 0; color: #003366; font-weight: 600; font-size: 14px;">📋 Como acessar o sistema:</p>
                                        <p style="margin: 0 0 5px 0; color: #333333; font-size: 13px; line-height: 1.5;">1. Acesse o portal do IPS Metropolitano</p>
                                        <p style="margin: 0 0 5px 0; color: #333333; font-size: 13px; line-height: 1.5;">2. Utilize seu Código de Acesso como usuário</p>
                                        <p style="margin: 0 0 5px 0; color: #333333; font-size: 13px; line-height: 1.5;">3. Digite a Senha Temporária fornecida</p>
                                        <p style="margin: 0; color: #333333; font-size: 13px; line-height: 1.5;">4. Altere sua senha no primeiro acesso</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="background-color: #002244; padding: 25px; text-align: center;">
                            <p style="color: #B8860B; margin: 0 0 10px 0; font-size: 12px;">Instituto Politécnico Superior Metropolitano de Angola</p>
                            <p style="color: #ffffff; margin: 0; font-size: 11px;">Este é um email automático, por favor não responda.</p>
                            <p style="color: #ffffff; margin: 8px 0 0 0; font-size: 11px;">© ${new Date().getFullYear()} IPS Metropolitano - Todos os direitos reservados</p>
                        </td>
                    </tr>
                </table>
            </div>
        </body>
        </html>
    `;
    return await enviarEmail(email, 'Suas Credenciais de Acesso - IPS Metropolitano', html);
};

module.exports = { 
    enviarEmail, 
    enviarCredenciaisFuncionario
};