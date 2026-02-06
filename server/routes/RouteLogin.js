const express = require("express");
const router = express.Router();
const conexao = require("../infra/conexao");
const bcrypt = require("bcrypt");

router.post("/", (req, res) => {
    const { numEstudante, password } = req.body;

    if (!numEstudante || !password) {
        return res.status(400).json({ 
            sucesso: false,
            tipo: "erro",
            titulo: "Campos obrigatórios",
            mensagem: "Preencha todos os campos!"
        });
    }

    const sql = "SELECT * FROM admimetro WHERE emailAdm = ?";
    
    conexao.query(sql, [numEstudante], async (err, results) => {
        if (err) {
            console.error("Erro no banco:", err);
            return res.status(500).json({ 
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno no servidor."
            });
        }

        if (results.length === 0) {
            return res.status(401).json({ 
                sucesso: false,
                tipo: "erro",
                titulo: "Usuário não encontrado",
                mensagem: "Usuário não encontrado."
            });
        }

        const usuario = results[0];

        try {
            const senhaCorreta = await bcrypt.compare(password, usuario.senhaAdm);

            if (senhaCorreta) {
                return res.status(200).json({ 
                    sucesso: true,
                    tipo: "sucesso",
                    titulo: "Login realizado",
                    mensagem: "Login realizado com sucesso!",
                    dados: { 
                        id: usuario.idAdm, 
                        nome: usuario.nomeAdm,
                        email: usuario.emailAdm,
                        contacto: usuario.contactoAdm
                    }
                });
            } else {
                return res.status(401).json({ 
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Dados Incorreto",
                    mensagem: "Dados Incorreto."
                });
            }
        } catch (error) {
            return res.status(500).json({ 
                sucesso: false,
                tipo: "erro",
                titulo: "Erro ao verificar senha",
                mensagem: "Erro ao verificar senha."
            });
        }
    });
});

module.exports = router;