const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
require("dotenv").config({ quiet: true });

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

        const verificarBISQL = "SELECT id_professor FROM professor WHERE bi = ?";
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
                    
                    const verificarCodigoSQL = "SELECT id_professor FROM professor WHERE senha = ?";
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
                    
                    const verificarCodigoProfessorSQL = "SELECT id_professor FROM professor WHERE codigoprofessor = ?";
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

                const pastaPerfil = path.join(__dirname, '../../../client/src/img/professores/Perfil');
                const pastaDocBI = path.join(__dirname, '../../../client/src/img/professores/Doc BI');

                if (!fs.existsSync(pastaPerfil)) {
                    fs.mkdirSync(pastaPerfil, { recursive: true });
                }
                if (!fs.existsSync(pastaDocBI)) {
                    fs.mkdirSync(pastaDocBI, { recursive: true });
                }

                if (files.fotoprofessor) {
                    const foto = files.fotoprofessor;
                    const extensaoFoto = path.extname(foto.name);
                    nomeFoto = `professor_${codigoProfessor}_foto_${Date.now()}${extensaoFoto}`;
                    const caminhoFoto = path.join(pastaPerfil, nomeFoto);

                    await new Promise((resolve, reject) => {
                        foto.mv(caminhoFoto, (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }

                if (files.bipdfprofessor) {
                    const pdf = files.bipdfprofessor;
                    const extensaoPDF = path.extname(pdf.name);
                    nomeBIPDF = `professor_${codigoProfessor}_bi_${Date.now()}${extensaoPDF}`;
                    const caminhoPDF = path.join(pastaDocBI, nomeBIPDF);

                    await new Promise((resolve, reject) => {
                        pdf.mv(caminhoPDF, (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }

                const inserirProfessorSQL = `
                    INSERT INTO professor (
                        codigo, foto, nome, genero, 
                        nacionalidade, estadocivil, nomepai, 
                        nomemae, bi, data_nascimento, 
                        contacto, 
                        whatsapp, email, anoexperiencia, 
                        titulacao, data_admissao, tipo_contrato, 
                        iban, tipo_sangue, condicoes, 
                        contacto_emergencia, id_adm, senha
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
                        
                        if (nomeFoto && fs.existsSync(path.join(pastaPerfil, nomeFoto))) {
                            fs.unlinkSync(path.join(pastaPerfil, nomeFoto));
                        }
                        if (nomeBIPDF && fs.existsSync(path.join(pastaDocBI, nomeBIPDF))) {
                            fs.unlinkSync(path.join(pastaDocBI, nomeBIPDF));
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

router.post('/atribuirProfessorTurma', (req, res) => {
    const { idperiodo, iddisciplina, idprofessor } = req.body;
    
    // Validações
    if (!idprofessor || !iddisciplina || !idperiodo) {
        return res.status(400).json({
            success: false,
            message: 'Todos os campos são obrigatórios: idprofessor, iddisciplina, idperiodo'
        });
    }
    
    // Verificar se já existe esta atribuição
    const queryVerificar = `
        SELECT *FROM professor_turma_disciplina 
        WHERE idprofessor = ? AND iddisciplina = ? AND idperiodo = ?
    `;
    
    conexao.query(queryVerificar, [idprofessor, iddisciplina, idperiodo], (error, results) => {
        if (error) {
            console.error('Erro ao verificar atribuição:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao verificar atribuição',
                error: error.message
            });
        }
        
        if (results.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Este professor já está atribuído a esta disciplina na turma'
            });
        }
        
        // Inserir nova atribuição com data automática
        const queryInserir = `
            INSERT INTO professor_turma_disciplina (idprofessor, iddisciplina, idperiodo, data_atribuicao) 
            VALUES (?, ?, ?, NOW())
        `;
        
        conexao.query(queryInserir, [idprofessor, iddisciplina, idperiodo], (error, result) => {
            if (error) {
                console.error('Erro ao atribuir professor:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao atribuir professor',
                    error: error.message
                });
            }
            
            res.status(201).json({
                success: true,
                message: 'Professor atribuído com sucesso',
                id: result.insertId,
                data_atribuicao: new Date().toISOString()
            });
        });
    });
});

module.exports = router;

/**
 * @swagger
 * /registrercategoria:
 *   post:
 *     summary: Registrar uma nova categoria de curso
 *     tags: [Cursos - Categorias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoriacurso
 *               - idAdm
 *             properties:
 *               categoriacurso:
 *                 type: string
 *                 description: Nome da categoria
 *               idAdm:
 *                 type: integer
 *                 description: ID do administrador
 *     responses:
 *       201:
 *         description: Categoria registrada com sucesso
 *       400:
 *         description: Dados incompletos ou categoria já existe
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /registrarcurso:
 *   post:
 *     summary: Registrar um novo curso
 *     tags: [Cursos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - curso
 *               - idcategoriacurso
 *             properties:
 *               curso:
 *                 type: string
 *                 description: Nome do curso
 *               idcategoriacurso:
 *                 type: integer
 *                 description: ID da categoria do curso
 *     responses:
 *       201:
 *         description: Curso registrado com sucesso
 *       400:
 *         description: Dados incompletos ou curso já existe
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /registrarAnoCurricular:
 *   post:
 *     summary: Registrar um novo ano curricular para um curso
 *     tags: [Cursos - Ano Curricular]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - anocurricular
 *               - idcurso
 *             properties:
 *               anocurricular:
 *                 type: integer
 *                 description: Número do ano (1, 2, 3, 4)
 *               idcurso:
 *                 type: integer
 *                 description: ID do curso
 *     responses:
 *       201:
 *         description: Ano curricular registrado com sucesso
 *       400:
 *         description: Dados incompletos, curso inválido ou ano duplicado
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /registrardisciplina:
 *   post:
 *     summary: Registrar uma nova disciplina
 *     tags: [Disciplinas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - disciplina
 *               - idAdm
 *             properties:
 *               disciplina:
 *                 type: string
 *                 description: Nome da disciplina
 *               idAdm:
 *                 type: integer
 *                 description: ID do administrador
 *     responses:
 *       201:
 *         description: Disciplina registrada com sucesso
 *       400:
 *         description: Dados incompletos ou disciplina já existe
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /registrarDisciplinaCurso:
 *   post:
 *     summary: Vincular uma disciplina a um curso/ano/semestre
 *     tags: [Disciplinas - Cursos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - iddisciplina
 *               - idanocurricular
 *               - idcurso
 *               - semestre
 *               - idcategoriacurso
 *             properties:
 *               iddisciplina:
 *                 type: integer
 *               idanocurricular:
 *                 type: integer
 *               idcurso:
 *                 type: integer
 *               semestre:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 2
 *               idcategoriacurso:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Disciplina atribuída com sucesso
 *       400:
 *         description: Dados incompletos, inválidos ou duplicados
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /registrarprofessor:
 *   post:
 *     summary: Registrar um novo professor
 *     tags: [Professores]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nomeprofessore
 *               - genero
 *               - biprofessor
 *               - idAdm
 *             properties:
 *               nomeprofessore:
 *                 type: string
 *               genero:
 *                 type: string
 *                 enum: [M, F]
 *               biprofessor:
 *                 type: string
 *               idAdm:
 *                 type: integer
 *               nacionalidadeprofessor:
 *                 type: string
 *               estadocivilprofessor:
 *                 type: string
 *               nomepaiprofessor:
 *                 type: string
 *               nomemaeprofessor:
 *                 type: string
 *               datanascimentoprofessor:
 *                 type: string
 *                 format: date
 *               residenciaprofessor:
 *                 type: string
 *               telefoneprofessor:
 *                 type: string
 *               whatsappprofessor:
 *                 type: string
 *               emailprofessor:
 *                 type: string
 *                 format: email
 *               anoexprienciaprofessor:
 *                 type: string
 *               titulacaoprofessor:
 *                 type: string
 *               dataadmissaprofessor:
 *                 type: string
 *                 format: date
 *               tipocontratoprofessor:
 *                 type: string
 *               ibanprofessor:
 *                 type: string
 *               tiposanguineoprofessor:
 *                 type: string
 *               condicoesprofessor:
 *                 type: string
 *               contactoemergenciaprofessor:
 *                 type: string
 *               fotoprofessor:
 *                 type: string
 *                 format: binary
 *               bipdfprofessor:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Professor registrado com sucesso
 *       400:
 *         description: Campos obrigatórios faltando ou BI já existe
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /registrerDisciplinaProfessor:
 *   post:
 *     summary: Vincular uma disciplina a um professor
 *     tags: [Professores - Disciplinas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idprofessor
 *               - iddisciplina
 *             properties:
 *               idprofessor:
 *                 type: integer
 *               iddisciplina:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Disciplina atribuída ao professor com sucesso
 *       400:
 *         description: Dados incompletos, inválidos ou duplicados
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /vincularProfessor:
 *   post:
 *     summary: Vincular professor a uma disciplina (alternativo)
 *     tags: [Professores - Disciplinas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idprofessor
 *               - iddisciplina
 *             properties:
 *               idprofessor:
 *                 type: integer
 *               iddisciplina:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Professor vinculado à disciplina com sucesso
 *       400:
 *         description: Dados incompletos ou inválidos
 *       409:
 *         description: Vínculo já existente
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /registrarPeriodo:
 *   post:
 *     summary: Registrar uma nova turma/período
 *     tags: [Turmas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idanocurricular
 *               - idcurso
 *               - idcategoriacurso
 *               - turma
 *               - periodo
 *               - anoletivo
 *             properties:
 *               idanocurricular:
 *                 type: integer
 *               idcurso:
 *                 type: integer
 *               idcategoriacurso:
 *                 type: integer
 *               turma:
 *                 type: string
 *                 description: "Código da turma (ex: A, B, C)"
 *               periodo:
 *                 type: string
 *                 description: Período (Manhã, Tarde, Noite)
 *               anoletivo:
 *                 type: string
 *                 description: "Ano letivo (ex: 2024/2025)"
 *     responses:
 *       201:
 *         description: Turma/Período registrado com sucesso
 *       400:
 *         description: Dados incompletos, inválidos ou duplicados
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /registrarfuncionario:
 *   post:
 *     summary: Registrar um novo funcionário
 *     tags: [Funcionários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome_funcionario
 *               - contacto_funcionario
 *               - bi_funcionario
 *               - cargo_funcionario
 *               - idAdm
 *             properties:
 *               nome_funcionario:
 *                 type: string
 *               contacto_funcionario:
 *                 type: string
 *               bi_funcionario:
 *                 type: string
 *               cargo_funcionario:
 *                 type: string
 *                 description: "Nome do cargo (ex: Secretário, Coordenador)"
 *               idAdm:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Funcionário registrado com sucesso (senha gerada automaticamente)
 *       400:
 *         description: Dados incompletos, contacto/BI já existente ou cargo inválido
 *       500:
 *         description: Erro interno do servidor
 */
