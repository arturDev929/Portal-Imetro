const nodemailer = require("nodemailer");
require("dotenv").config();

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

const enviarEmail = async (destinatario, assunto, html) => {
    try {
        const mailOptions = {
            from: `"IPS Metropolitano" <${process.env.EMAIL_USER}>`,
            to: destinatario,
            subject: assunto,
            html: html
        };
        await transporter.sendMail(mailOptions);
        return { sucesso: true };
    } catch (error) {
        console.error("Erro ao enviar email:", error);
        return { sucesso: false, erro: error.message };
    }
};

const enviarCredenciaisFuncionario = async (email, nome, senha, cargo) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #FFD700; margin: 0;">IPS METROPOLITANO</h1>
                <p style="color: #666; font-size: 14px;">Instituto Politécnico Superior Metropolitano de Angola</p>
            </div>
            <h2 style="color: #333; text-align: center;">Bem-vindo ao IPS Metropolitano!</h2>
            <p>Olá <strong>${nome}</strong>,</p>
            <p>Foi criada uma conta para você no Sistema de Gestão Acadêmica.</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Email de Acesso:</strong> ${email}</p>
                <p><strong>Senha Temporária:</strong> <span style="font-size: 24px; color: #FFD700;">${senha}</span></p>
                <p><strong>Cargo:</strong> ${cargo}</p>
            </div>
            <p>Recomendamos alterar sua senha no primeiro acesso.</p>
            <hr>
            <p style="color: #999; font-size: 12px;">Este é um email automático, por favor não responda.</p>
        </div>
    `;
    return await enviarEmail(email, 'Suas Credenciais de Acesso - IPS Metropolitano', html);
};

module.exports = { enviarEmail, enviarCredenciaisFuncionario };