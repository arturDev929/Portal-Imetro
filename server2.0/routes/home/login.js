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

        console.log("Resultados encontrados em admin:", results.length);

        if (results.length === 0) {
            // Se não encontrou em admin, busca em funcionarios
            console.log("Procurando em funcionarios...");
            
            const sqlFuncionario = `
                SELECT 
                    funcionario.id_func as id,
                    funcionario.nome,
                    funcionario.bi,
                    funcionario.senha,
                    funcionario.contacto,
                    funcionario.email,
                    cargo.cargo as tipo_usuario
                FROM funcionario 
                INNER JOIN cargo ON funcionario.id_cargo = cargo.id_cargo
                WHERE funcionario.bi = ?
            `;
            
            conexao.query(sqlFuncionario, [email], async (errFunc, resultsFunc) => {
                if (errFunc) {
                    console.error("ERRO NA QUERY DE FUNCIONARIO:", errFunc.message);
                    return res.status(500).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Erro no servidor",
                        mensagem: errFunc.message
                    });
                }

                console.log("Resultados encontrados em funcionarios:", resultsFunc.length);

                if (resultsFunc.length === 0) {
                    return res.status(401).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Usuário não encontrado",
                        mensagem: "Usuário não encontrado."
                    });
                }

                const usuario = resultsFunc[0];
                console.log("Usuário encontrado:", usuario.email);
                console.log("Cargo:", usuario.tipo_usuario);

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

                    console.log("Gerando token para funcionario...");
                    const token = gerarToken(
                        { id: usuario.id, nome: usuario.nome },
                        usuario.tipo_usuario
                    );
                    console.log("Token gerado");

                    return res.status(200).json({
                        sucesso: true,
                        tipo: "sucesso",
                        titulo: "Login realizado",
                        mensagem: "Login realizado com sucesso!",
                        tipoUsuario: usuario.tipo_usuario,
                        token: token,
                        dados: {
                            id: usuario.id,
                            nome: usuario.nome,
                            email: usuario.email,
                            contacto: usuario.contacto,
                            bi: usuario.bi
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
            
        } else {
            // Usuário encontrado em admin
            const usuario = results[0];
            console.log("Usuário encontrado em admin:", usuario.email);

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

                console.log("Gerando token para admin...");
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
        }
    });
});

module.exports = router;