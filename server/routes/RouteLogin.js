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

    // Primeiro tenta buscar na tabela admimetro (ADM)
    const sqlAdm = "SELECT * FROM admimetro WHERE emailAdm = ?";
    
    conexao.query(sqlAdm, [numEstudante], async (err, resultsAdm) => {
        if (err) {
            console.error("Erro no banco:", err);
            return res.status(500).json({ 
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno no servidor."
            });
        }

        // Se encontrou na tabela admimetro
        if (resultsAdm.length > 0) {
            const usuario = resultsAdm[0];

            try {
                const senhaCorreta = await bcrypt.compare(password, usuario.senhaAdm);

                if (senhaCorreta) {
                    return res.status(200).json({ 
                        sucesso: true,
                        tipo: "sucesso",
                        titulo: "Login realizado",
                        mensagem: "Login realizado com sucesso!",
                        tipoUsuario: "adm",
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
                        titulo: "Dados Incorretos",
                        mensagem: "Dados Incorretos."
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
        } else {
            // Se não encontrou na admimetro, busca na tabela funcionario
            const sqlFuncionario = `
                SELECT 
                    f.id_funcionario,
                    f.bi_funcionario,
                    f.nome_funcionario,
                    f.contacto_funcionario,
                    f.senha_funcionario,
                    f.estado_funcionario,
                    cf.id_cargo,
                    cf.cargo AS nome_cargo
                FROM funcionario f
                INNER JOIN cargo_funcionario_relation cfr ON f.id_funcionario = cfr.id_funcionario
                INNER JOIN cargo_funcionario cf ON cf.id_cargo = cfr.id_cargo
                WHERE f.bi_funcionario = ? AND f.estado_funcionario = 'Ativo'
            `;
            
            conexao.query(sqlFuncionario, [numEstudante], async (err, resultsFunc) => {
                if (err) {
                    console.error("Erro no banco:", err);
                    return res.status(500).json({ 
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Erro no servidor",
                        mensagem: "Erro interno no servidor."
                    });
                }

                if (resultsFunc.length === 0) {
                    return res.status(401).json({ 
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Usuário não encontrado",
                        mensagem: "Usuário não encontrado ou inativo."
                    });
                }

                const usuario = resultsFunc[0];

                try {
                    const senhaCorreta = await bcrypt.compare(password, usuario.senha_funcionario);

                    if (senhaCorreta) {
                        // Inicializa as variáveis
                        let rota = "/homefuncionario";
                        let tipoUsuario = "funcionario";
                        
                        // Verifica o cargo
                        if (usuario.nome_cargo === "Coordenador de Admissões e Matrículas") {
                            rota = "/homefuncionarioM";
                            tipoUsuario = "Coordenador de Admissões e Matrículas";
                        }

                        return res.status(200).json({ 
                            sucesso: true,
                            tipo: "sucesso",
                            titulo: "Login realizado",
                            mensagem: "Login realizado com sucesso!",
                            tipoUsuario: tipoUsuario,
                            rota: rota,
                            dados: { 
                                id: usuario.id_funcionario,
                                nome: usuario.nome_funcionario,
                                bi: usuario.bi_funcionario,
                                contacto: usuario.contacto_funcionario,
                                cargo: usuario.nome_cargo,
                                id_cargo: usuario.id_cargo
                            }
                        });
                    } else {
                        return res.status(401).json({ 
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Dados Incorretos",
                            mensagem: "Dados Incorretos."
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
        }
    });
});

module.exports = router;