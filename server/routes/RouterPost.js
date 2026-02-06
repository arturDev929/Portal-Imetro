const { Router } = require("express");
const router = Router();
const conexao = require("../infra/conexao");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const { createCanvas } = require("canvas");

const gerarImagemIniciais = (nome) => {
    try {
        const palavras = nome.trim().split(/\s+/);

        if (palavras.length === 0) return null;
        
        const primeiraLetra = palavras[0].charAt(0).toUpperCase();

        let segundaLetra;
        if (palavras.length > 1) {
            segundaLetra = palavras[1].charAt(0).toUpperCase();
        } else if (palavras[0].length > 1) {
            segundaLetra = palavras[0].charAt(1).toUpperCase();
        } else {
            segundaLetra = palavras[0].charAt(0).toUpperCase();
        }
        
        const iniciais = primeiraLetra + segundaLetra;
        
        const tamanho = 200;
        const canvas = createCanvas(tamanho, tamanho);
        const ctx = canvas.getContext('2d');

        const cores = [
            '#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#1abc9c',
            '#34495e', '#f39c12', '#d35400', '#16a085', '#27ae60'
        ];
        const corFundo = cores[Math.floor(Math.random() * cores.length)];

        ctx.fillStyle = corFundo;
        ctx.fillRect(0, 0, tamanho, tamanho);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${tamanho / 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText(iniciais, tamanho / 2, tamanho / 2);
        

        const nomeArquivo = `estudante_${iniciais}_${Date.now()}.png`;
        

        const pastaImagens = path.join(__dirname, '../../client/src/img/estudantes');
        const caminhoCompleto = path.join(pastaImagens, nomeArquivo);
        
        if (!fs.existsSync(pastaImagens)) {
            fs.mkdirSync(pastaImagens, { recursive: true });
        }

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(caminhoCompleto, buffer);
        
        console.log(`📸 Imagem gerada: ${nomeArquivo} com iniciais: ${iniciais}`);
        
        return nomeArquivo;
        
    } catch (erro) {
        console.error("Erro ao gerar imagem:", erro);
        return null;
    }
};

router.post('/registrarEstudante', async (req, res) => {
    try {
        const { 
            nomeEstudante, 
            contactoEstudante, 
            numEstudante, 
            idCursos, 
            senhaEstudante, 
            senhaConfirmar
        } = req.body;

        if (!nomeEstudante || !contactoEstudante || !numEstudante || !idCursos || !senhaEstudante) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Campos obrigatórios",
                mensagem: "Todos os campos são obrigatórios!"
            });
        }

        if (senhaEstudante !== senhaConfirmar) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Senhas não coincidem",
                mensagem: "As senhas não coincidem!"
            });
        }

        const verificarMatricula = "SELECT idEstudante FROM estudantes WHERE numEstudante = ?";
        conexao.query(verificarMatricula, [numEstudante], async (erro, resultados) => {
            if (erro) {
                console.error("Erro ao verificar matrícula:", erro);
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
                    titulo: "Matrícula existente",
                    mensagem: "Número de matrícula já está em uso!"
                });
            }

            try {
                const salt = await bcrypt.genSalt(10);
                const senhaCriptografada = await bcrypt.hash(senhaEstudante, salt);
                let nomeFoto = gerarImagemIniciais(nomeEstudante);
                
                if (!nomeFoto) {
                    console.log("Não foi possível gerar a imagem, usando padrão");
                    nomeFoto = `estudante_default_${Date.now()}.png`;
                }

                const sql = `
                    INSERT INTO estudantes 
                    (nomeEstudante, fotoEstudante, contactoEstudante, numEstudante, senhaEstudante, idCursos) 
                    VALUES (?, ?, ?, ?, ?, ?)
                `;

                const valores = [
                    nomeEstudante,
                    nomeFoto,
                    contactoEstudante,
                    numEstudante,
                    senhaCriptografada,
                    idCursos
                ];

                conexao.query(sql, valores, (erro, resultado) => {
                    if (erro) {
                        console.error("Erro ao inserir estudante:", erro);
                        console.error("SQL Message:", erro.sqlMessage);

                        if (nomeFoto && fs.existsSync(path.join(__dirname, '../../client/src/img/estudantes', nomeFoto))) {
                            fs.unlinkSync(path.join(__dirname, '../../client/src/img/estudantes', nomeFoto));
                            console.log("Imagem removida devido ao erro");
                        }
                        
                        return res.status(500).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Erro no cadastro",
                            mensagem: "Erro ao registrar estudante: " + erro.message
                        });
                    }

                    console.log("Estudante inserido com ID:", resultado.insertId);

                    res.status(201).json({
                        sucesso: true,
                        tipo: "sucesso",
                        titulo: "Cadastro realizado!",
                        mensagem: "Estudante registrado com sucesso!",
                        redirect: "/",
                        dados: {
                            idEstudante: resultado.insertId,
                            nomeEstudante,
                            numEstudante,
                            foto: nomeFoto 
                        }
                    });
                });

            } catch (erroHash) {
                console.error("Erro ao criptografar senha:", erroHash);
                res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro de segurança",
                    mensagem: "Erro interno do servidor"
                });
            }
        });

    } catch (erro) {
        console.error("Erro no endpoint de registro:", erro);
        res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro interno",
            mensagem: "Erro interno do servidor"
        });
    }
});

router.get('/obterImagem/:nomeArquivo', (req, res) => {
    const { nomeArquivo } = req.params;
    const caminhoImagem = path.join(__dirname, '../../client/src/img/estudantes', nomeArquivo);
    
    if (fs.existsSync(caminhoImagem)) {
        res.sendFile(caminhoImagem);
    } else {
        res.status(404).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Imagem não encontrada",
            mensagem: "Imagem não encontrada"
        });
    }
});

// Registrar categoria
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

// Registrar curso
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

// Registrar Ano Curricular
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
        const verificarCursoSQL = "SELECT idcurso FROM curso WHERE idcurso = ?";
        const [resultadosCurso] = await conexao.promise().query(verificarCursoSQL, [idcurso]);
        
        if (resultadosCurso.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Curso inválido",
                mensagem: "O curso selecionado não existe"
            });
        }

        const verificarAnoSQL = "SELECT idanocurricular FROM anocurricular WHERE anocurricular = ? AND idcurso = ?";
        const [resultadosAno] = await conexao.promise().query(verificarAnoSQL, [anocurricular, idcurso]);
        
        if (resultadosAno.length > 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Ano Curricular Duplicado",
                mensagem: `O ano ${anocurricular} já existe para este curso`
            });
        }

        const inserirSQL = "INSERT INTO anocurricular (anocurricular, idcurso) VALUES (?, ?)";
        const [resultados] = await conexao.promise().query(inserirSQL, [anocurricular, idcurso]);

        const [dadosCurso] = await conexao.promise().query(
            "SELECT curso as curso_nome FROM curso c WHERE c.idcurso = ?", 
            [idcurso]
        );

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

    } catch (erro) {
        console.error("Erro ao registrar Ano Curricular:", erro);
        
        if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
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
});

// Registrar disciplina
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

router.post('/registrarDisciplinaCurso', async (req, res) => {
    const { iddisciplina, idanocurricular, idcurso, semestre, idcategoriacurso } = req.body;
    
    if (!iddisciplina || !idanocurricular || !idcurso || !semestre || !idcategoriacurso) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha disciplina, ano curricular, curso, categoria e semestre"
        });
    }

    try {
        const verificarDisciplinaSQL = "SELECT iddisciplina, disciplina FROM disciplina WHERE iddisciplina = ?";
        const [resultadosDisciplina] = await conexao.promise().query(verificarDisciplinaSQL, [iddisciplina]);
        
        if (resultadosDisciplina.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Disciplina inválida",
                mensagem: "A disciplina selecionada não existe"
            });
        }

        const verificarAnoSQL = "SELECT idanocurricular, anocurricular FROM anocurricular WHERE idanocurricular = ?";
        const [resultadosAno] = await conexao.promise().query(verificarAnoSQL, [idanocurricular]);
        
        if (resultadosAno.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Ano Curricular inválido",
                mensagem: "O ano curricular selecionado não existe"
            });
        }

        const verificarCursoSQL = "SELECT idcurso, curso, idcategoriacurso FROM curso WHERE idcurso = ?";
        const [resultadosCurso] = await conexao.promise().query(verificarCursoSQL, [idcurso]);
        
        if (resultadosCurso.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Curso inválido",
                mensagem: "O curso selecionado não existe"
            });
        }

        const verificarCategoriaSQL = "SELECT idcategoriacurso, categoriacurso FROM categoriacurso WHERE idcategoriacurso = ?";
        const [resultadosCategoria] = await conexao.promise().query(verificarCategoriaSQL, [idcategoriacurso]);
        
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
        const [resultadosDuplicado] = await conexao.promise().query(
            verificarDuplicadoSQL, 
            [iddisciplina, idanocurricular, idcurso, semestre]
        );
        
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
        const [resultados] = await conexao.promise().query(inserirSQL, [idcategoriacurso, iddisciplina, idanocurricular, idcurso, semestre]);

        const [dadosCompletos] = await conexao.promise().query(`
            SELECT 
                d.disciplina as disciplina_nome,
                ac.anocurricular as ano_nome,
                c.curso as curso_nome,
                cc.categoriacurso as categoria_nome
            FROM disciplina d
            INNER JOIN anocurricular ac ON ac.idanocurricular = ?
            INNER JOIN curso c ON c.idcurso = ?
            INNER JOIN categoriacurso cc ON cc.idcategoriacurso = ?
            WHERE d.iddisciplina = ?
        `, [idanocurricular, idcurso, idcategoriacurso, iddisciplina]);

        return res.status(201).json({
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
                semestre: semestre,
                disciplina_nome: dadosCompletos[0]?.disciplina_nome || resultadosDisciplina[0].disciplina,
                ano_nome: dadosCompletos[0]?.ano_nome || resultadosAno[0].anocurricular,
                curso_nome: dadosCompletos[0]?.curso_nome || resultadosCurso[0].curso,
                categoria_nome: dadosCompletos[0]?.categoria_nome || resultadosCategoria[0].categoriacurso
            }
        });

    } catch (erro) {
        console.error("Erro ao registrar Disciplina no Curso:", erro);
        console.error("Detalhes do erro:", erro.sqlMessage || erro.message);
        
        if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Chave estrangeira inválida",
                mensagem: "Uma das referências (disciplina, curso, categoria ou ano) não existe no sistema"
            });
        }
        
        if (erro.code === 'ER_DUP_ENTRY') {
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
            mensagem: "Erro interno ao registrar disciplina no curso: " + (erro.message || "Erro desconhecido")
        });
    }
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
            console.error("Campos obrigatórios faltando:", {
                nomeprofessore: !!nomeprofessore,
                genero: !!genero,
                biprofessor: !!biprofessor,
                idAdm: !!idAdm
            });
            
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
                    console.log("✅ Pasta criada:", pastaProfessores);
                }

                if (files.fotoprofessor) {
                    const foto = files.fotoprofessor;
                    const extensaoFoto = path.extname(foto.name);
                    nomeFoto = `professor_${codigoProfessor}_foto_${Date.now()}${extensaoFoto}`;
                    const caminhoFoto = path.join(pastaProfessores, nomeFoto);

                    foto.mv(caminhoFoto, (err) => {
                        if (err) {
                            console.error("Erro ao salvar foto:", err);
                        } else {
                            console.log("Foto salva:", nomeFoto);
                        }
                    });
                } else {
                    console.log("Nenhuma foto enviada");
                }

                if (files.bipdfprofessor) {
                    const pdf = files.bipdfprofessor;
                    const extensaoPDF = path.extname(pdf.name);
                    nomeBIPDF = `professor_${codigoProfessor}_bi_${Date.now()}${extensaoPDF}`;
                    const caminhoPDF = path.join(pastaProfessores, nomeBIPDF);

                    pdf.mv(caminhoPDF, (err) => {
                        if (err) {
                            console.error("Erro ao salvar PDF:", err);
                        } else {
                            console.log("PDF do BI salvo:", nomeBIPDF);
                        }
                    });
                } else {
                    console.log("Nenhum PDF do BI enviado");
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
                        console.error("SQL Message:", erro.sqlMessage);
                        
                        if (nomeFoto && fs.existsSync(path.join(pastaProfessores, nomeFoto))) {
                            fs.unlinkSync(path.join(pastaProfessores, nomeFoto));
                            console.log("Foto removida devido ao erro:", nomeFoto);
                        }
                        if (nomeBIPDF && fs.existsSync(path.join(pastaProfessores, nomeBIPDF))) {
                            fs.unlinkSync(path.join(pastaProfessores, nomeBIPDF));
                            console.log("PDF removido devido ao erro:", nomeBIPDF);
                        }
                        
                        return res.status(500).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Erro no cadastro",
                            mensagem: "Erro ao registrar professor: " + erro.message
                        });
                    }

                    console.log("Professor inserido com ID:", resultados.insertId);
                    console.log("Código do professor:", codigoProfessor);
                    console.log("Código de acesso (senha):", codigoAcesso);

                    setTimeout(() => {
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
                                biprofessor: biprofessor,
                                foto: nomeFoto,
                                bi_pdf: nomeBIPDF
                            }
                        });
                    }, 1000);

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
        console.error("Stack trace:", erro.stack);
        
        return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro interno",
            mensagem: "Erro interno do servidor: " + erro.message
        });
    }
});

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
        // Verificar se o professor existe
        const verificarProfessorSQL = "SELECT idprofessor, nomeprofessor FROM professor WHERE idprofessor = ?";
        const [resultadosProfessor] = await conexao.promise().query(verificarProfessorSQL, [idprofessor]);
        
        if (resultadosProfessor.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Professor inválido",
                mensagem: "O professor selecionado não existe"
            });
        }

        // Verificar se a disciplina existe
        const verificarDisciplinaSQL = "SELECT iddisciplina, disciplina FROM disciplina WHERE iddisciplina = ?";
        const [resultadosDisciplina] = await conexao.promise().query(verificarDisciplinaSQL, [iddisciplina]);
        
        if (resultadosDisciplina.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Disciplina inválida",
                mensagem: "A disciplina selecionada não existe"
            });
        }

        // Verificar se a disciplina já está atribuída a este professor
        const verificarDuplicadoSQL = `
            SELECT iddisciplina 
            FROM disc_prof 
            WHERE idprofessor = ? AND iddisciplina = ?
        `;
        const [resultadosDuplicado] = await conexao.promise().query(
            verificarDuplicadoSQL, 
            [idprofessor, iddisciplina]
        );
        
        if (resultadosDuplicado.length > 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Disciplina Duplicada",
                mensagem: `Esta disciplina já está atribuída a este professor`
            });
        }

        // Inserir na tabela de relação professor-disciplina
        const inserirSQL = `
            INSERT INTO disc_prof (idprofessor, iddisciplina) 
            VALUES (?, ?)
        `;
        const [resultados] = await conexao.promise().query(inserirSQL, [idprofessor, iddisciplina]);

        return res.status(201).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Disciplina Atribuída",
            mensagem: `Disciplina "${resultadosDisciplina[0].disciplina}" atribuída ao professor "${resultadosProfessor[0].nomeprofessor}" com sucesso!`,
            dados: {
                id: resultados.insertId,
                idprofessor: idprofessor,
                iddisciplina: iddisciplina,
                professor_nome: resultadosProfessor[0].nomeprofessor,
                disciplina_nome: resultadosDisciplina[0].disciplina
            }
        });

    } catch (erro) {
        console.error("Erro ao atribuir disciplina ao professor:", erro);
        console.error("Detalhes do erro:", erro.sqlMessage || erro.message);
        
        if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Chave estrangeira inválida",
                mensagem: "O professor ou disciplina não existe no sistema"
            });
        }
        
        if (erro.code === 'ER_DUP_ENTRY') {
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
            mensagem: "Erro interno ao atribuir disciplina ao professor: " + (erro.message || "Erro desconhecido")
        });
    }
});

router.post('/registrarPeriodo', async (req, res) => {
    const { idanocurricular, idcurso, idcategoriacurso, turma, periodo } = req.body;
    
    if (!idanocurricular || !idcurso || !idcategoriacurso || !turma || !periodo) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha todos os campos obrigatórios (ano curricular, curso, categoria, turma e período)"
        });
    }

    try {
        // Verificar se o ano curricular existe
        const verificarAnoSQL = "SELECT idanocurricular, anocurricular FROM anocurricular WHERE idanocurricular = ?";
        const [resultadosAno] = await conexao.promise().query(verificarAnoSQL, [idanocurricular]);
        
        if (resultadosAno.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Ano Curricular inválido",
                mensagem: "O ano curricular selecionado não existe"
            });
        }

        // Verificar se o curso existe
        const verificarCursoSQL = "SELECT idcurso, curso, idcategoriacurso FROM curso WHERE idcurso = ?";
        const [resultadosCurso] = await conexao.promise().query(verificarCursoSQL, [idcurso]);
        
        if (resultadosCurso.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Curso inválido",
                mensagem: "O curso selecionado não existe"
            });
        }

        // Verificar se a categoria existe
        const verificarCategoriaSQL = "SELECT idcategoriacurso, categoriacurso FROM categoriacurso WHERE idcategoriacurso = ?";
        const [resultadosCategoria] = await conexao.promise().query(verificarCategoriaSQL, [idcategoriacurso]);
        
        if (resultadosCategoria.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Categoria inválida",
                mensagem: "A categoria selecionada não existe"
            });
        }

        // Verificar consistência: curso pertence à categoria
        if (resultadosCurso[0].idcategoriacurso != idcategoriacurso) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Inconsistência de dados",
                mensagem: "O curso selecionado não pertence à categoria informada"
            });
        }

        // Verificar se a turma/periodo já existe para este ano/curso
        const verificarDuplicadoSQL = `
            SELECT idperiodo 
            FROM periodo 
            WHERE idanocurricular = ? AND idcurso = ? AND turma = ? AND periodo = ?
        `;
        const [resultadosDuplicado] = await conexao.promise().query(
            verificarDuplicadoSQL, 
            [idanocurricular, idcurso, turma, periodo]
        );
        
        if (resultadosDuplicado.length > 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Turma/Período Duplicado",
                mensagem: `Esta turma "${turma}" no período "${periodo}" já existe para este curso/ano`
            });
        }

        // Inserir na tabela periodo
        const inserirSQL = `
            INSERT INTO periodo (idanocurricular, idcategoriacurso, idcurso, turma, periodo) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const [resultados] = await conexao.promise().query(inserirSQL, 
            [idanocurricular, idcategoriacurso, idcurso, turma, periodo]
        );

        // Obter dados completos para a resposta
        const [dadosCompletos] = await conexao.promise().query(`
            SELECT 
                ac.anocurricular as ano_nome,
                c.curso as curso_nome,
                cc.categoriacurso as categoria_nome
            FROM anocurricular ac
            INNER JOIN curso c ON c.idcurso = ?
            INNER JOIN categoriacurso cc ON cc.idcategoriacurso = ?
            WHERE ac.idanocurricular = ?
        `, [idcurso, idcategoriacurso, idanocurricular]);

        return res.status(201).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Turma/Período Registrado",
            mensagem: `Turma "${turma}" no período "${periodo}" registrada com sucesso!`,
            dados: {
                id: resultados.insertId,
                idanocurricular: idanocurricular,
                idcurso: idcurso,
                idcategoriacurso: idcategoriacurso,
                turma: turma,
                periodo: periodo,
                ano_nome: dadosCompletos[0]?.ano_nome || resultadosAno[0].anocurricular,
                curso_nome: dadosCompletos[0]?.curso_nome || resultadosCurso[0].curso,
                categoria_nome: dadosCompletos[0]?.categoria_nome || resultadosCategoria[0].categoriacurso
            }
        });

    } catch (erro) {
        console.error("Erro ao registrar Turma/Período:", erro);
        console.error("Detalhes do erro:", erro.sqlMessage || erro.message);
        
        if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Chave estrangeira inválida",
                mensagem: "Uma das referências (ano curricular, curso ou categoria) não existe no sistema"
            });
        }
        
        if (erro.code === 'ER_DUP_ENTRY') {
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
            mensagem: "Erro interno ao registrar turma/período: " + (erro.message || "Erro desconhecido")
        });
    }
});

router.post('/registrarfuncionarioMatricular', async (req, res) => {
    const { nome, contacto, nbi, idAdm,cargo } = req.body;
    
    if (!nome || !contacto || !nbi || !idAdm || !cargo) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha todos os campos obrigatórios (Nome, Contacto, Nº B.I)"
        });
    }

    try {
        const verificarFuncionarioSQL = "SELECT idfuncionariomatricula FROM funcionariomatricula WHERE nbifuncionariomatricula = ?";
        const [resultadosFuncionario] = await conexao.promise().query(verificarFuncionarioSQL, [nbi]);
        
        if (resultadosFuncionario.length > 0) { 
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Funcionário Existente",
                mensagem: "Já existe um funcionário cadastrado com este número de BI!"
            });
        }

        const verificarFuncionarioSQL1 = "SELECT idfuncionariomatricula FROM funcionariomatricula WHERE nomefuncionariomatricula = ?";
        const [resultadosFuncionario1] = await conexao.promise().query(verificarFuncionarioSQL1, [nome]);
        
        if (resultadosFuncionario1.length > 0) { 
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Funcionário Existente",
                mensagem: "Já existe um funcionário cadastrado com este nome!"
            });
        }

        const verificarFuncionarioSQL2 = "SELECT idfuncionariomatricula FROM funcionariomatricula WHERE contactofuncionariomatricula = ?";
        const [resultadosFuncionario2] = await conexao.promise().query(verificarFuncionarioSQL2, [contacto]);
        
        if (resultadosFuncionario2.length > 0) { 
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Funcionário Existente",
                mensagem: "Já existe um funcionário cadastrado com este número de BI!"
            });
        }

        const senhaPadrao = "12345";
        
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senhaPadrao, salt);

        const inserirSQL = `
            INSERT INTO funcionariomatricula 
            (nomefuncionariomatricula, contactofuncionariomatricula, nbifuncionariomatricula, senhafuncionariomatricula, idAdm, cargo) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const [resultados] = await conexao.promise().query(inserirSQL, 
            [nome, contacto, nbi, senhaCriptografada, idAdm,cargo]
        );

        return res.status(201).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Funcionário Registrado com Sucesso",
            mensagem: `Funcionário "${nbi}" registrado com sucesso! Senha padrão: ${senhaPadrao}`,
            dados: {
                id: resultados.insertId,
                nome: nome,
                contacto: contacto,
                nbi: nbi,
                cargo:cargo,
                senha_padrao: senhaPadrao
            }
        });

    } catch (erro) {
        console.error("Erro ao registrar funcionário:", erro);
        console.error("Detalhes do erro:", erro.sqlMessage || erro.message);
        
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
            mensagem: "Erro interno ao registrar funcionário: " + (erro.message || "Erro desconhecido")
        });
    }
});



module.exports = router;