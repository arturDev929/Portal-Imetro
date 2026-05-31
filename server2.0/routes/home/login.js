const express = require("express");
const router = express.Router();
const conexao = require("../../infra/conexao");
const bcrypt = require("bcrypt");
const { gerarToken } = require("../../utils/token");

router.post("/", (req, res) => {
    const { email, password } = req.body;

    console.log("Email:", email);
    console.log("Password existe:", !!password);

    if (!email || !password) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Campos obrigatórios",
            mensagem: "Preencha todos os campos!"
        });
    }

    const sql = "SELECT id_user, email, senha, nome FROM admin_user WHERE email = ?";

    conexao.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("ERRO NA QUERY:", err.message);
            console.error("CODIGO:", err.code);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: err.message
            });
        }

        console.log("Resultados encontrados:", results.length);

        if (results.length === 0) {
            return res.status(401).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Usuário não encontrado",
                mensagem: "Usuário não encontrado."
            });
        }

        const usuario = results[0];
        console.log("Usuário encontrado:", usuario.email);

        try {
            const senhaCorreta = await bcrypt.compare(password, usuario.senha);
            console.log("Senha correta:", senhaCorreta);

            if (!senhaCorreta) {
                return res.status(401).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Senha incorreta",
                    mensagem: "Senha inválida."
                });
            }

            console.log("Gerando token...");
            const token = gerarToken(
                { id: usuario.id_user, nome: usuario.nome },
                "admin"
            );
            console.log("Token gerado");

            return res.status(200).json({
                sucesso: true,
                tipo: "sucesso",
                titulo: "Login realizado",
                mensagem: "Login realizado com sucesso!",
                tipoUsuario: "adm",
                token: token,
                dados: {
                    id: usuario.id_user,
                    nome: usuario.nome,
                    email: usuario.email,
                    contacto: usuario.contacto
                }
            });

        } catch (error) {
            console.error("ERRO NO TRY/CATCH:", error.message);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro ao verificar senha",
                mensagem: error.message
            });
        }
    });
});

module.exports = router;