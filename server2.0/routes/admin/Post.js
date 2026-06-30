const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const verificarToken = require("../../middlewares/authMiddleware");
const upload = require("../../utils/upload");
const { enviarCredenciaisFuncionario } = require("../../utils/email");
const { criptografarSenha, gerarId, gerarCodigo, gerarSenhaTemporaria } = require("../../utils/senhas");

const uploadCombinado = upload.uploadCombinado;
const uploadCombinadoProfessor = upload.uploadCombinadoProfessor;

router.post("/registrarfuncionario", verificarToken, uploadCombinado.fields([
    { name: "foto", maxCount: 1 },
    { name: "documentos", maxCount: 10 }
]), async (req, res) => {
    const { nome, contacto, bi, cargo, email, idAdm } = req.body;
    const foto = req.files?.foto ? req.files.foto[0].filename : null;
    const documentos = req.files?.documentos || [];
    const documentosTitulos = req.body.documentos_titulo || [];

    const limparArquivos = () => {
        if (foto) upload.deletarFotoFuncionario(foto);
        documentos.forEach(doc => upload.deletarDocumentoFuncionario(doc.filename));
    };

    if (!nome?.trim()) {
        limparArquivos();
        return res.status(400).json({ sucesso: false, mensagem: "Nome é obrigatorio" });
    }
    if (!contacto?.trim()) {
        limparArquivos();
        return res.status(400).json({ sucesso: false, mensagem: "Contacto é obrigatorio" });
    }
    if (!bi?.trim()) {
        limparArquivos();
        return res.status(400).json({ sucesso: false, mensagem: "BI é obrigatorio" });
    }
    if (!cargo?.trim()) {
        limparArquivos();
        return res.status(400).json({ sucesso: false, mensagem: "Cargo é obrigatorio" });
    }
    if (!email?.trim()) {
        limparArquivos();
        return res.status(400).json({ sucesso: false, mensagem: "Email é obrigatorio" });
    }

    try {
        const verificarContacto = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_func FROM funcionario WHERE contacto = ?", [contacto.trim()], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (verificarContacto.length > 0) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Contacto ja em uso" });
        }

        const verificarBI = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_func FROM funcionario WHERE bi = ?", [bi.trim()], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (verificarBI.length > 0) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "BI ja em uso" });
        }

        const verificarEmail = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_func FROM funcionario WHERE email = ?", [email.trim()], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (verificarEmail.length > 0) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Email ja em uso" });
        }

        const cargoResult = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_cargo FROM cargo WHERE cargo = ?", [cargo], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (cargoResult.length === 0) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Cargo nao encontrado" });
        }

        const id_cargo = cargoResult[0].id_cargo;
        const id_func = gerarId();
        const codigo = gerarCodigo();
        const senha_funcionario = gerarSenhaTemporaria();
        const senhaCriptografada = await criptografarSenha(senha_funcionario);
        const dataAtual = new Date().toISOString().split('T')[0];

        await new Promise((resolve, reject) => {
            const sql = `INSERT INTO funcionario (id_func, nome, contacto, bi, status, id_user, id_cargo, data_criacao, data_atualizacao, senha, foto, email, codigo) VALUES (?, ?, ?, ?, 'Ativo', ?, ?, ?, ?, ?, ?, ?, ?)`;
            conexao.query(sql, [id_func, nome.trim(), contacto.trim(), bi.trim(), idAdm, id_cargo, dataAtual, dataAtual, senhaCriptografada, foto, email.trim(), codigo], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });

        for (let i = 0; i < documentos.length; i++) {
            const doc = documentos[i];
            const titulo = documentosTitulos[i] || doc.originalname;
            const id_doc_func = gerarId();
            await new Promise((resolve, reject) => {
                const sql = `INSERT INTO doc_funcionario (id_doc_func, titulo, doc, status, id_user, id_func, data_criacao, data_atualizacao) VALUES (?, ?, ?, 'Ativo', ?, ?, ?, ?)`;
                conexao.query(sql, [id_doc_func, titulo, doc.filename, idAdm, id_func, dataAtual, dataAtual], (erro, resultado) => {
                    if (erro) reject(erro);
                    else resolve(resultado);
                });
            });
        }

        const emailEnviado = await enviarCredenciaisFuncionario(email, nome, senha_funcionario, codigo);

        res.status(201).json({
            sucesso: true,
            mensagem: `Funcionario registrado com sucesso! ${emailEnviado.sucesso ? 'Credenciais enviadas por email.' : 'Erro ao enviar email.'}`,
            dados: { id: id_func, nome, email, senha_original: senha_funcionario, codigo, cargo }
        });

    } catch (erro) {
        limparArquivos();
        res.status(500).json({ sucesso: false, mensagem: "Erro interno ao registrar funcionario: " + erro.message });
    }
});

router.post("/registrarProfessor", verificarToken, uploadCombinadoProfessor, async (req, res) => {
    const { 
        nome, genero, nacionalidade, nomepai, nomemae, bi, contacto, 
        whatsapp, email, contactoemergencia, anoexperienca, titulacao, 
        iban, tiposangue, data_nascimento, data_admissao, estadocivil, 
        id_contrato, id_user 
    } = req.body;
    
    const foto = req.files?.foto ? req.files.foto[0].filename : null;
    const documentos = req.files?.documentos || [];
    const documentosTitulos = req.body.documentos_titulo || [];

    const limparArquivos = () => {
        if (foto) {
            upload.deletarFotoProfessor(foto);
        }
        documentos.forEach(doc => {
            upload.deletarDocumentoProfessor(doc.filename);
        });
    };

    try {
        const camposObrigatorios = [
            { nome: "nome", valor: nome },
            { nome: "bi", valor: bi },
            { nome: "contacto", valor: contacto },
            { nome: "email", valor: email },
            { nome: "genero", valor: genero },
            { nome: "data_nascimento", valor: data_nascimento },
            { nome: "data_admissao", valor: data_admissao },
            { nome: "id_contrato", valor: id_contrato }
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

        if (nome.length < 3 || nome.length > 100) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Nome deve ter entre 3 e 100 caracteres" });
        }

        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nome)) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Nome deve conter apenas letras e espaços" });
        }

        const generosPermitidos = ["Masculino", "Feminino", "Outro"];
        if (!generosPermitidos.includes(genero)) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Gênero inválido" });
        }

        if (bi.length < 9 || bi.length > 14) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "BI deve ter entre 9 e 14 caracteres" });
        }

        if (!/^[a-zA-Z0-9]+$/.test(bi)) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "BI deve conter apenas letras e números" });
        }

        if (!/^[0-9]{9,12}$/.test(contacto)) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Contacto deve conter apenas números e ter entre 9 e 12 dígitos" });
        }

        if (whatsapp && !/^[0-9]{9,12}$/.test(whatsapp)) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "WhatsApp deve conter apenas números e ter entre 9 e 12 dígitos" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Email inválido" });
        }

        if (email.length > 100) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Email deve ter no máximo 100 caracteres" });
        }

        const dataNascimento = new Date(data_nascimento);
        const dataAdmissao = new Date(data_admissao);
        const dataAtual = new Date();

        if (isNaN(dataNascimento.getTime())) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Data de nascimento inválida" });
        }

        if (isNaN(dataAdmissao.getTime())) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Data de admissão inválida" });
        }

        const idade = dataAtual.getFullYear() - dataNascimento.getFullYear();
        if (idade < 18 || idade > 100) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Idade deve estar entre 18 e 100 anos" });
        }

        if (dataAdmissao > dataAtual) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Data de admissão não pode ser futura" });
        }

        const verificarContacto = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_professor FROM professor WHERE contacto = ?", [contacto.trim()], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        
        if (verificarContacto.length > 0) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Contacto já em uso" });
        }

        const verificarBI = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_professor FROM professor WHERE bi = ?", [bi.trim()], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        
        if (verificarBI.length > 0) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "BI já em uso" });
        }

        const verificarEmail = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_professor FROM professor WHERE email = ?", [email.trim()], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        
        if (verificarEmail.length > 0) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Email já em uso" });
        }

        const verificarContrato = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_contrato FROM contrato WHERE id_contrato = ? AND status = 'Ativo'", [id_contrato], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        
        if (verificarContrato.length === 0) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Tipo de contrato inválido" });
        }

        const id_professor = gerarId();
        const codigo = gerarCodigo();
        const senha_funcionario = gerarSenhaTemporaria();
        const senhaCriptografada = await criptografarSenha(senha_funcionario);

        await new Promise((resolve, reject) => {
            const sql = `INSERT INTO professor (
                id_professor, nome, genero, nacionalidade, nomepai, nomemae, 
                bi, contacto, whatsapp, email, contactoemergencia, anoexperienca, 
                titulacao, iban, tiposangue, codigo, senha, data_nascimento, 
                data_admissao, id_contrato, id_user, foto, estadocivil
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            conexao.query(sql, [
                id_professor, nome, genero, nacionalidade, nomepai, nomemae, 
                bi, contacto, whatsapp, email, contactoemergencia, anoexperienca, 
                titulacao, iban, tiposangue, codigo, senhaCriptografada, 
                data_nascimento, data_admissao, id_contrato, id_user, foto, estadocivil
            ], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });

        for (let i = 0; i < documentos.length; i++) {
            const doc = documentos[i];
            const titulo = documentosTitulos[i] || doc.originalname;
            const id_doc_func = gerarId();
            
            await new Promise((resolve, reject) => {
                const sql = `INSERT INTO ficheiro_prof (id_ficheiro, ficheiro, id_professor, nome) VALUES (?, ?, ?, ?)`;
                conexao.query(sql, [id_doc_func, titulo, id_professor, doc.filename], (erro, resultado) => {
                    if (erro) reject(erro);
                    else resolve(resultado);
                });
            });
        }

        const emailEnviado = await enviarCredenciaisFuncionario(email, nome, senha_funcionario, codigo);

        res.status(201).json({
            sucesso: true,
            mensagem: `Professor registrado com sucesso! ${emailEnviado.sucesso ? 'Credenciais enviadas por email.' : 'Erro ao enviar email.'}`,
            dados: { 
                id: id_professor, 
                nome, 
                email, 
                senha_original: senha_funcionario, 
                codigo
            }
        });

    } catch (erro) {
        limparArquivos();
        res.status(500).json({ 
            sucesso: false, 
            mensagem: erro.message || "Erro interno ao registrar professor"
        });
    }
});

router.post('/registrercategoria', (req, res) => {
    const { categoriacurso, idAdm } = req.body;
    const id_categoria = gerarId();

    console.log("Dados recebidos para criação:", { categoriacurso, idAdm });

    if (!categoriacurso || categoriacurso.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'O nome da categoria é obrigatório'
        });
    }

    if (categoriacurso.trim().length < 2) {
        return res.status(400).json({
            success: false,
            error: 'O nome da categoria deve ter pelo menos 2 caracteres'
        });
    }

    if (categoriacurso.trim().length > 100) {
        return res.status(400).json({
            success: false,
            error: 'O nome da categoria não pode exceder 100 caracteres'
        });
    }

    if (!idAdm) {
        return res.status(400).json({
            success: false,
            error: 'ID do administrador é obrigatório'
        });
    }

    // Verifica se já existe categoria com mesmo nome
    const checkSql = 'SELECT * FROM categoria WHERE categoria = ?';
    conexao.query(checkSql, [categoriacurso.trim()], (checkError, checkResults) => {
        if (checkError) {
            console.error('Erro ao verificar duplicidade:', checkError);
            return res.status(500).json({
                success: false,
                error: 'Erro ao verificar se categoria já existe'
            });
        }

        if (checkResults.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Já existe uma categoria com este nome'
            });
        }

        const insertSql = 'INSERT INTO categoria (id_categoria,categoria, id_user) VALUES (?, ?, ?)';
        conexao.query(insertSql, [id_categoria,categoriacurso.trim(), idAdm], (error, results) => {
            if (error) {
                console.error('Erro ao criar categoria:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Erro ao criar categoria no banco de dados'
                });
            }

            const newId = results.insertId;

            // Busca a categoria criada
            const selectSql = 'SELECT id_categoria as idcategoriacurso, categoria as categoriacurso FROM categoria WHERE id_categoria = ?';
            conexao.query(selectSql, [newId], (selectError, selectResults) => {
                if (selectError) {
                    console.error('Erro ao buscar categoria criada:', selectError);
                    return res.status(500).json({
                        success: false,
                        error: 'Erro ao buscar categoria criada'
                    });
                }

                res.status(201).json({
                    success: true,
                    message: 'Categoria criada com sucesso',
                    categoriacurso: categoriacurso.trim(),
                    departamento: selectResults[0] || null
                });
            });
        });
    });
});

router.post('/registrarcurso', async (req, res) => {
    const { curso, idcategoriacurso,idAdm } = req.body;
    const id_curso = gerarId();
    
    if (!curso || !idcategoriacurso) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha todos os campos obrigatórios"
        });
    }

    const verificarCursoSQL = "SELECT id_curso FROM curso WHERE curso = ?";
    
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

        const verificarCategoriaSQL = "SELECT id_categoria FROM categoria WHERE id_categoria = ?";
        
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

            const inserirCursoSQL = "INSERT INTO curso (id_curso, curso, id_categoria, id_user) VALUES (?, ?, ?, ?)";
            
            conexao.query(inserirCursoSQL, [id_curso,curso, idcategoriacurso,idAdm], (erro, resultados) => {
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

router.post('/vincularProfessor', async (req, res) => {
    const { idprofessor, iddisciplina,idAdm } = req.body;
    const id_dp = gerarId()
    if (!idprofessor || !iddisciplina) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, selecione um professor e uma disciplina"
        });
    }

    try {
        const verificaSql = "SELECT * FROM disc_professor WHERE id_professor = ? AND id_disciplina = ?";
        
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
            
            const insertSql = "INSERT INTO disc_professor (id_dp, id_professor, id_disciplina,id_user) VALUES (?, ?, ?, ?)";
            
            conexao.query(insertSql, [id_dp,idprofessor, iddisciplina, idAdm], (insertError, result) => {
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

router.post('/registrardisciplina', async (req, res) => {
    const { disciplina, idAdm } = req.body;
    const id_disciplina = gerarId();
    if (!disciplina || !idAdm) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha todos os campos obrigatórios"
        });
    }

    const verificarDisciplinaSQL = "SELECT id_disciplina FROM disciplina WHERE disciplina = ?";
    
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

        const inserirDisciplinaSQL = "INSERT INTO disciplina (id_disciplina,disciplina, id_user) VALUES (?, ?, ?)";
        
        conexao.query(inserirDisciplinaSQL, [id_disciplina,disciplina, idAdm], (erro, resultados) => {
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

router.post('/registrarPeriodo', (req, res) => {
    const { id_anocurricular, id_curso, id_categoria, turma, periodo, anoletivo, idAdm } = req.body;
    
    if (!id_anocurricular || !id_curso || !id_categoria || !turma || !periodo || !anoletivo) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha todos os campos obrigatórios"
        });
    }

    // 1. Verificar Ano Curricular
    const verificarAnoSQL = "SELECT id_anocurricular, ano FROM anocurricular WHERE id_anocurricular = ?";

    conexao.query(verificarAnoSQL, [id_anocurricular], (erroAno, resultadosAno) => {
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

        // 2. Verificar Curso
        const verificarCursoSQL = "SELECT id_curso, curso, id_categoria FROM curso WHERE id_curso = ?";

        conexao.query(verificarCursoSQL, [id_curso], (erroCurso, resultadosCurso) => {
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

            // 3. Verificar Categoria
            const verificarCategoriaSQL = "SELECT id_categoria, categoria FROM categoria WHERE id_categoria = ?";

            conexao.query(verificarCategoriaSQL, [id_categoria], (erroCategoria, resultadosCategoria) => {
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

                // 4. Verificar se o curso pertence à categoria
                if (resultadosCurso[0].id_categoria !== id_categoria) {
                    return res.status(400).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Inconsistência de dados",
                        mensagem: "O curso selecionado não pertence à categoria informada"
                    });
                }

                // 5. Verificar se a turma já existe
                const verificarTurmaSQL = "SELECT id_turma FROM turma WHERE turma = ? AND id_curso = ?";

                conexao.query(verificarTurmaSQL, [turma, id_curso], (erroTurma, resultadosTurma) => {
                    if (erroTurma) {
                        console.error("Erro ao verificar Turma:", erroTurma);
                        return res.status(500).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Erro no servidor",
                            mensagem: "Erro interno do servidor"
                        });
                    }

                    let id_turma;

                    if (resultadosTurma.length === 0) {
                        // 5a. Criar nova turma
                        const id_turma_nova = gerarId();
                        const criarTurmaSQL = "INSERT INTO turma (id_turma, turma, status, id_user, id_curso) VALUES (?, ?, 'Ativo', ?, ?)";
                        
                        conexao.query(criarTurmaSQL, [id_turma_nova, turma, idAdm, id_curso], (erroCriarTurma) => {
                            if (erroCriarTurma) {
                                console.error("Erro ao criar turma:", erroCriarTurma);
                                return res.status(500).json({
                                    sucesso: false,
                                    tipo: "erro",
                                    titulo: "Erro no servidor",
                                    mensagem: "Erro ao criar turma"
                                });
                            }
                            id_turma = id_turma_nova;
                            criarPeriodo();
                        });
                    } else {
                        id_turma = resultadosTurma[0].id_turma;
                        criarPeriodo();
                    }

                    function criarPeriodo() {
                        // 6. Verificar duplicidade de período
                        const verificarDuplicadoSQL = `
                            SELECT id_periodo 
                            FROM periodo 
                            WHERE id_turma = ? AND periodo = ?
                        `;

                        conexao.query(verificarDuplicadoSQL, [id_turma, periodo], (erroDuplicado, resultadosDuplicado) => {
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
                                    titulo: "Período Duplicado",
                                    mensagem: `O período "${periodo}" já existe para esta turma`
                                });
                            }

                            // 7. Inserir Período
                            const id_periodo = gerarId();
                            const inserirPeriodoSQL = `
                                INSERT INTO periodo (id_periodo, periodo, status, id_user, id_turma) 
                                VALUES (?, ?, 'Ativo', ?, ?)
                            `;

                            conexao.query(inserirPeriodoSQL, [id_periodo, periodo, idAdm, id_turma], (erroInsercao) => {
                                if (erroInsercao) {
                                    console.error("Erro ao inserir período:", erroInsercao);
                                    return res.status(500).json({
                                        sucesso: false,
                                        tipo: "erro",
                                        titulo: "Erro no servidor",
                                        mensagem: "Erro interno ao registrar período"
                                    });
                                }

                                // 8. Inserir Ano Letivo (opcional, se fornecida)
                                if (anoletivo) {
                                    const id_anoletivo = gerarId();
                                    const inserirAnoLetivoSQL = `
                                        INSERT INTO anoletivo (id_anoletivo, ano, status, id_user, id_periodo) 
                                        VALUES (?, ?, 'Ativo', ?, ?)
                                    `;

                                    conexao.query(inserirAnoLetivoSQL, [id_anoletivo, anoletivo, idAdm, id_periodo], (erroAnoLetivo) => {
                                        if (erroAnoLetivo) {
                                            console.error("Erro ao inserir ano letivo:", erroAnoLetivo);
                                            // Não falha o registro, apenas loga o erro
                                        }
                                    });
                                }

                                res.status(201).json({
                                    sucesso: true,
                                    tipo: "sucesso",
                                    titulo: "Período Registrado",
                                    mensagem: `Período "${periodo}" registrado com sucesso!`,
                                    dados: {
                                        id_periodo: id_periodo,
                                        id_turma: id_turma,
                                        turma: turma,
                                        periodo: periodo,
                                        anoletivo: anoletivo || null
                                    }
                                });
                            });
                        });
                    }
                });
            });
        });
    });
});

router.post('/atribuirProfessorTurma', (req, res) => {
    const { id_periodo, id_disciplina, id_professor, id_anoletivo, idAdm } = req.body;
    
    // Validações
    if (!id_professor || !id_disciplina || !id_periodo || !id_anoletivo) {
        return res.status(400).json({
            success: false,
            message: 'Todos os campos são obrigatórios: id_professor, id_disciplina, id_periodo, id_anoletivo'
        });
    }
    
    // 1. Verificar se o período existe e obter id_turma
    const queryPeriodo = `
        SELECT id_periodo, id_turma 
        FROM periodo 
        WHERE id_periodo = ? AND status = 'Ativo'
    `;
    
    conexao.query(queryPeriodo, [id_periodo], (errorPeriodo, resultsPeriodo) => {
        if (errorPeriodo) {
            console.error('Erro ao verificar período:', errorPeriodo);
            return res.status(500).json({
                success: false,
                message: 'Erro ao verificar período',
                error: errorPeriodo.message
            });
        }
        
        if (resultsPeriodo.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Período não encontrado ou inativo'
            });
        }
        
        const id_turma = resultsPeriodo[0].id_turma;
        
        // 2. Verificar se o professor existe e está ativo
        const queryProfessor = `
            SELECT id_professor, nome, status 
            FROM professor 
            WHERE id_professor = ? AND status = 'Ativo'
        `;
        
        conexao.query(queryProfessor, [id_professor], (errorProf, resultsProf) => {
            if (errorProf) {
                console.error('Erro ao verificar professor:', errorProf);
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao verificar professor',
                    error: errorProf.message
                });
            }
            
            if (resultsProf.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Professor não encontrado ou inativo'
                });
            }
            
            // 3. Verificar se a disciplina existe e está ativa
            const queryDisciplina = `
                SELECT id_disciplina, disciplina, status 
                FROM disciplina 
                WHERE id_disciplina = ? AND status = 'Ativo'
            `;
            
            conexao.query(queryDisciplina, [id_disciplina], (errorDisc, resultsDisc) => {
                if (errorDisc) {
                    console.error('Erro ao verificar disciplina:', errorDisc);
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao verificar disciplina',
                        error: errorDisc.message
                    });
                }
                
                if (resultsDisc.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Disciplina não encontrada ou inativa'
                    });
                }
                
                // 4. Verificar se o ano letivo existe e está ativo
                const queryAnoLetivo = `
                    SELECT id_anoletivo, ano, status 
                    FROM anoletivo 
                    WHERE id_anoletivo = ? AND status = 'Ativo'
                `;
                
                conexao.query(queryAnoLetivo, [id_anoletivo], (errorAno, resultsAno) => {
                    if (errorAno) {
                        console.error('Erro ao verificar ano letivo:', errorAno);
                        return res.status(500).json({
                            success: false,
                            message: 'Erro ao verificar ano letivo',
                            error: errorAno.message
                        });
                    }
                    
                    if (resultsAno.length === 0) {
                        return res.status(400).json({
                            success: false,
                            message: 'Ano letivo não encontrado ou inativo'
                        });
                    }
                    
                    // 5. Verificar se já existe relação professor-disciplina (disc_professor)
                    const queryDiscProf = `
                        SELECT id_dp 
                        FROM disc_professor 
                        WHERE id_professor = ? AND id_disciplina = ? AND status = 'Ativo'
                    `;
                    
                    conexao.query(queryDiscProf, [id_professor, id_disciplina], (errorDP, resultsDP) => {
                        if (errorDP) {
                            console.error('Erro ao verificar disc_professor:', errorDP);
                            return res.status(500).json({
                                success: false,
                                message: 'Erro ao verificar relação professor-disciplina',
                                error: errorDP.message
                            });
                        }
                        
                        let id_dp;
                        
                        if (resultsDP.length === 0) {
                            // 5a. Criar nova relação professor-disciplina
                            const id_dp_novo = gerarId();
                            const queryInserirDP = `
                                INSERT INTO disc_professor (id_dp, status, id_professor, id_disciplina, id_user, data_criacao) 
                                VALUES (?, 'Ativo', ?, ?, ?, CURDATE())
                            `;
                            
                            conexao.query(queryInserirDP, [id_dp_novo, id_professor, id_disciplina, idAdm], (errorInsertDP) => {
                                if (errorInsertDP) {
                                    console.error('Erro ao criar relação professor-disciplina:', errorInsertDP);
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Erro ao criar relação professor-disciplina',
                                        error: errorInsertDP.message
                                    });
                                }
                                id_dp = id_dp_novo;
                                atribuirProfessorTurma();
                            });
                        } else {
                            id_dp = resultsDP[0].id_dp;
                            atribuirProfessorTurma();
                        }
                        
                        function atribuirProfessorTurma() {
                            // 6. Verificar se já existe esta atribuição na turma/período
                            const queryVerificar = `
                                SELECT id_ptd 
                                FROM prof_turma_disc 
                                WHERE id_dp = ? AND id_turma = ? AND id_periodo = ? AND id_anoletivo = ?
                            `;
                            
                            conexao.query(queryVerificar, [id_dp, id_turma, id_periodo, id_anoletivo], (errorVerif, resultsVerif) => {
                                if (errorVerif) {
                                    console.error('Erro ao verificar atribuição:', errorVerif);
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Erro ao verificar atribuição',
                                        error: errorVerif.message
                                    });
                                }
                                
                                if (resultsVerif.length > 0) {
                                    return res.status(400).json({
                                        success: false,
                                        message: 'Este professor já está atribuído a esta disciplina na turma/período'
                                    });
                                }
                                
                                // 7. Inserir atribuição na tabela prof_turma_disc
                                const id_ptd = gerarId();
                                const queryInserir = `
                                    INSERT INTO prof_turma_disc (id_ptd, status, id_dp, id_turma, id_periodo, id_anoletivo, id_user, data_criacao) 
                                    VALUES (?, 'Ativo', ?, ?, ?, ?, ?, CURDATE())
                                `;
                                
                                conexao.query(queryInserir, [id_ptd, id_dp, id_turma, id_periodo, id_anoletivo, idAdm], (errorInsert, result) => {
                                    if (errorInsert) {
                                        console.error('Erro ao atribuir professor:', errorInsert);
                                        return res.status(500).json({
                                            success: false,
                                            message: 'Erro ao atribuir professor',
                                            error: errorInsert.message
                                        });
                                    }
                                    
                                    res.status(201).json({
                                        success: true,
                                        message: 'Professor atribuído com sucesso',
                                        dados: {
                                            id_ptd: id_ptd,
                                            id_professor: id_professor,
                                            nome_professor: resultsProf[0].nome,
                                            id_disciplina: id_disciplina,
                                            disciplina: resultsDisc[0].disciplina,
                                            id_periodo: id_periodo,
                                            id_turma: id_turma,
                                            id_anoletivo: id_anoletivo,
                                            data_atribuicao: new Date().toISOString().split('T')[0]
                                        }
                                    });
                                });
                            });
                        }
                    });
                });
            });
        });
    });
});

router.post('/registrarAnoCurricular', (req, res) => {
    const { ano, id_curso, idAdm } = req.body;

    // 1. Validação dos campos obrigatórios
    if (!ano || !id_curso) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha o ano curricular e o curso"
        });
    }

    // 2. Verificar se o curso existe e está ativo
    const verificarCursoSQL = "SELECT id_curso, curso FROM curso WHERE id_curso = ? AND status = 'Ativo'";

    conexao.query(verificarCursoSQL, [id_curso], (erroCurso, resultadosCurso) => {
        if (erroCurso) {
            console.error("Erro ao verificar Curso:", erroCurso);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno ao verificar curso",
                detalhes: erroCurso.message
            });
        }

        if (resultadosCurso.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Curso inválido",
                mensagem: "O curso selecionado não existe ou está inativo"
            });
        }

        const nomeCurso = resultadosCurso[0].curso;

        // 3. Verificar se o ano curricular já existe para este curso
        const verificarAnoSQL = "SELECT id_anocurricular, ano FROM anocurricular WHERE ano = ? AND id_curso = ? AND status = 'Ativo'";

        conexao.query(verificarAnoSQL, [ano, id_curso], (erroAno, resultadosAno) => {
            if (erroAno) {
                console.error("Erro ao verificar Ano Curricular:", erroAno);
                return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro no servidor",
                    mensagem: "Erro interno ao verificar ano curricular",
                    detalhes: erroAno.message
                });
            }

            if (resultadosAno.length > 0) {
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Ano Curricular Duplicado",
                    mensagem: `O ano ${ano} já existe para o curso "${nomeCurso}"`
                });
            }

            // 4. Gerar UUID para o novo registro
            const id_anocurricular = gerarId();

            // 5. Inserir novo ano curricular
            const inserirSQL = `
                INSERT INTO anocurricular (id_anocurricular, ano, status, id_user, id_curso, data_criacao) 
                VALUES (?, ?, 'Ativo', ?, ?, CURDATE())
            `;

            conexao.query(inserirSQL, [id_anocurricular, ano, idAdm, id_curso], (erroInsercao, resultados) => {
                if (erroInsercao) {
                    console.error("Erro ao inserir Ano Curricular:", erroInsercao);

                    // Verificar erro de chave estrangeira
                    if (erroInsercao.code === 'ER_NO_REFERENCED_ROW_2') {
                        return res.status(400).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Curso inválido",
                            mensagem: "O curso selecionado não existe no sistema"
                        });
                    }

                    // Verificar erro de duplicidade (caso a verificação anterior não tenha capturado)
                    if (erroInsercao.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Ano Curricular Duplicado",
                            mensagem: `O ano ${ano} já existe para este curso`
                        });
                    }

                    return res.status(500).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Erro no servidor",
                        mensagem: "Erro interno ao registrar ano curricular",
                        detalhes: erroInsercao.message
                    });
                }

                // 6. Buscar dados completos para resposta
                const buscarDadosSQL = `
                    SELECT 
                        ac.id_anocurricular,
                        ac.ano,
                        ac.status,
                        ac.data_criacao,
                        c.id_curso,
                        c.curso AS curso_nome,
                        cat.id_categoria,
                        cat.categoria AS categoria_nome
                    FROM anocurricular ac
                    INNER JOIN curso c ON c.id_curso = ac.id_curso
                    INNER JOIN categoria cat ON cat.id_categoria = c.id_categoria
                    WHERE ac.id_anocurricular = ?
                `;

                conexao.query(buscarDadosSQL, [id_anocurricular], (erroBusca, dadosCompletos) => {
                    if (erroBusca) {
                        console.error("Erro ao buscar dados completos:", erroBusca);
                        // Retorna sucesso mesmo sem os dados completos
                        return res.status(201).json({
                            sucesso: true,
                            tipo: "sucesso",
                            titulo: "Ano Curricular Registrado",
                            mensagem: `Ano ${ano} registrado com sucesso para o curso "${nomeCurso}"!`,
                            dados: {
                                id_anocurricular: id_anocurricular,
                                ano: ano,
                                id_curso: id_curso,
                                curso_nome: nomeCurso,
                                status: "Ativo",
                                data_criacao: new Date().toISOString().split('T')[0]
                            }
                        });
                    }

                    return res.status(201).json({
                        sucesso: true,
                        tipo: "sucesso",
                        titulo: "Ano Curricular Registrado",
                        mensagem: `Ano ${ano} registrado com sucesso para o curso "${nomeCurso}"!`,
                        dados: dadosCompletos[0] || {
                            id_anocurricular: id_anocurricular,
                            ano: ano,
                            id_curso: id_curso,
                            curso_nome: nomeCurso,
                            status: "Ativo",
                            data_criacao: new Date().toISOString().split('T')[0]
                        }
                    });
                });
            });
        });
    });
});

router.post('/registrarDisciplinaCurso', (req, res) => {
    const { id_disciplina, id_anocurricular, id_curso, semestre, id_categoria, idAdm } = req.body;

    // 1. Validação dos campos obrigatórios
    if (!id_disciplina || !id_anocurricular || !id_curso || !semestre || !id_categoria) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha disciplina, ano curricular, curso, categoria e semestre"
        });
    }

    // 2. Validar semestre (1 a 8)
    if (semestre < 1 || semestre > 8) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Semestre inválido",
            mensagem: "O semestre deve ser um número entre 1 e 8"
        });
    }

    // 3. Verificar se a disciplina existe e está ativa
    const verificarDisciplinaSQL = "SELECT id_disciplina, disciplina FROM disciplina WHERE id_disciplina = ? AND status = 'Ativo'";

    conexao.query(verificarDisciplinaSQL, [id_disciplina], (erroDisciplina, resultadosDisciplina) => {
        if (erroDisciplina) {
            console.error("Erro ao verificar Disciplina:", erroDisciplina);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno ao verificar disciplina",
                detalhes: erroDisciplina.message
            });
        }

        if (resultadosDisciplina.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Disciplina inválida",
                mensagem: "A disciplina selecionada não existe ou está inativa"
            });
        }

        const nomeDisciplina = resultadosDisciplina[0].disciplina;

        // 4. Verificar se o ano curricular existe e está ativo
        const verificarAnoSQL = "SELECT id_anocurricular, ano FROM anocurricular WHERE id_anocurricular = ? AND status = 'Ativo'";

        conexao.query(verificarAnoSQL, [id_anocurricular], (erroAno, resultadosAno) => {
            if (erroAno) {
                console.error("Erro ao verificar Ano Curricular:", erroAno);
                return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro no servidor",
                    mensagem: "Erro interno ao verificar ano curricular",
                    detalhes: erroAno.message
                });
            }

            if (resultadosAno.length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Ano Curricular inválido",
                    mensagem: "O ano curricular selecionado não existe ou está inativo"
                });
            }

            const anoCurricular = resultadosAno[0].ano;

            // 5. Verificar se o curso existe e está ativo
            const verificarCursoSQL = "SELECT id_curso, curso, id_categoria FROM curso WHERE id_curso = ? AND status = 'Ativo'";

            conexao.query(verificarCursoSQL, [id_curso], (erroCurso, resultadosCurso) => {
                if (erroCurso) {
                    console.error("Erro ao verificar Curso:", erroCurso);
                    return res.status(500).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Erro no servidor",
                        mensagem: "Erro interno ao verificar curso",
                        detalhes: erroCurso.message
                    });
                }

                if (resultadosCurso.length === 0) {
                    return res.status(400).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Curso inválido",
                        mensagem: "O curso selecionado não existe ou está inativo"
                    });
                }

                const nomeCurso = resultadosCurso[0].curso;

                // 6. Verificar se a categoria existe e está ativa
                const verificarCategoriaSQL = "SELECT id_categoria, categoria FROM categoria WHERE id_categoria = ? AND status = 'Ativo'";

                conexao.query(verificarCategoriaSQL, [id_categoria], (erroCategoria, resultadosCategoria) => {
                    if (erroCategoria) {
                        console.error("Erro ao verificar Categoria:", erroCategoria);
                        return res.status(500).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Erro no servidor",
                            mensagem: "Erro interno ao verificar categoria",
                            detalhes: erroCategoria.message
                        });
                    }

                    if (resultadosCategoria.length === 0) {
                        return res.status(400).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Categoria inválida",
                            mensagem: "A categoria selecionada não existe ou está inativa"
                        });
                    }

                    // 7. Verificar se o curso pertence à categoria
                    if (resultadosCurso[0].id_categoria !== id_categoria) {
                        return res.status(400).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Inconsistência de dados",
                            mensagem: "O curso selecionado não pertence à categoria informada"
                        });
                    }

                    // 8. Verificar se já existe esta disciplina para o curso/ano/semestre
                    const verificarDuplicadoSQL = `
                        SELECT id_semestre 
                        FROM semestre 
                        WHERE id_disciplina = ? 
                          AND id_anocurricular = ? 
                          AND id_curso = ? 
                          AND semestre = ?
                          AND status = 'Ativo'
                    `;

                    conexao.query(verificarDuplicadoSQL, [id_disciplina, id_anocurricular, id_curso, semestre], (erroDuplicado, resultadosDuplicado) => {
                        if (erroDuplicado) {
                            console.error("Erro ao verificar duplicidade:", erroDuplicado);
                            return res.status(500).json({
                                sucesso: false,
                                tipo: "erro",
                                titulo: "Erro no servidor",
                                mensagem: "Erro interno ao verificar duplicidade",
                                detalhes: erroDuplicado.message
                            });
                        }

                        if (resultadosDuplicado.length > 0) {
                            return res.status(400).json({
                                sucesso: false,
                                tipo: "erro",
                                titulo: "Disciplina Duplicada",
                                mensagem: `A disciplina "${nomeDisciplina}" já está atribuída ao curso "${nomeCurso}" no ${semestre}º semestre do ano ${anoCurricular}`
                            });
                        }

                       
                        const id_semestre = gerarId();

                        // 11. Inserir no semestre
                        const inserirSQL = `
                            INSERT INTO semestre (
                                id_semestre, 
                                semestre, 
                                status, 
                                id_user, 
                                id_categoria, 
                                id_curso, 
                                id_disciplina, 
                                id_anocurricular,
                                data_criacao
                            ) 
                            VALUES (?, ?, 'Ativo', ?, ?, ?, ?, ?, CURDATE())
                        `;

                        conexao.query(inserirSQL, [
                            id_semestre, 
                            semestre, 
                            idAdm, 
                            id_categoria, 
                            id_curso, 
                            id_disciplina, 
                            id_anocurricular
                        ], (erroInsercao, resultados) => {
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
                                        mensagem: `A disciplina "${nomeDisciplina}" já foi atribuída a este curso/ano/semestre`
                                    });
                                }

                                return res.status(500).json({
                                    sucesso: false,
                                    tipo: "erro",
                                    titulo: "Erro no servidor",
                                    mensagem: "Erro interno ao registrar disciplina no curso",
                                    detalhes: erroInsercao.message
                                });
                            }

                            // 12. Buscar dados completos para resposta
                            const buscarDadosSQL = `
                                SELECT 
                                    s.id_semestre,
                                    s.semestre,
                                    s.status,
                                    s.data_criacao,
                                    d.id_disciplina,
                                    d.disciplina AS disciplina_nome,
                                    ac.id_anocurricular,
                                    ac.ano AS anocurricular,
                                    c.id_curso,
                                    c.curso AS curso_nome,
                                    cat.id_categoria,
                                    cat.categoria AS categoria_nome
                                FROM semestre s
                                INNER JOIN disciplina d ON d.id_disciplina = s.id_disciplina
                                INNER JOIN anocurricular ac ON ac.id_anocurricular = s.id_anocurricular
                                INNER JOIN curso c ON c.id_curso = s.id_curso
                                INNER JOIN categoria cat ON cat.id_categoria = s.id_categoria
                                WHERE s.id_semestre = ?
                            `;

                            conexao.query(buscarDadosSQL, [id_semestre], (erroBusca, dadosCompletos) => {
                                if (erroBusca) {
                                    console.error("Erro ao buscar dados completos:", erroBusca);
                                    return res.status(201).json({
                                        sucesso: true,
                                        tipo: "sucesso",
                                        titulo: "Disciplina Atribuída",
                                        mensagem: `Disciplina "${nomeDisciplina}" atribuída ao ${semestre}º semestre do ${anoCurricular} com sucesso!`,
                                        dados: {
                                            id_semestre: id_semestre,
                                            id_disciplina: id_disciplina,
                                            disciplina_nome: nomeDisciplina,
                                            id_anocurricular: id_anocurricular,
                                            anocurricular: anoCurricular,
                                            id_curso: id_curso,
                                            curso_nome: nomeCurso,
                                            id_categoria: id_categoria,
                                            categoria_nome: resultadosCategoria[0].categoria,
                                            semestre: semestre,
                                            status: "Ativo",
                                            data_criacao: new Date().toISOString().split('T')[0]
                                        }
                                    });
                                }

                                return res.status(201).json({
                                    sucesso: true,
                                    tipo: "sucesso",
                                    titulo: "Disciplina Atribuída",
                                    mensagem: `Disciplina "${nomeDisciplina}" atribuída ao ${semestre}º semestre do ${anoCurricular} com sucesso!`,
                                    dados: dadosCompletos[0]
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

router.post('/registrarPeriodo', (req, res) => {
    const { id_anocurricular, id_curso, id_categoria, turma, periodo, anoletivo, idAdm } = req.body;

    // 1. Validação dos campos obrigatórios
    if (!id_anocurricular || !id_curso || !id_categoria || !turma || !periodo || !anoletivo) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha todos os campos obrigatórios"
        });
    }

    // 2. Validar período (deve ser um dos valores permitidos)
    const periodosPermitidos = ['Manhã', 'Tarde', 'Noite', 'Diurno'];
    if (!periodosPermitidos.includes(periodo)) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Período inválido",
            mensagem: "O período deve ser: Manhã, Tarde, Noite ou Diurno"
        });
    }

    // 3. Verificar se o usuário está autenticado
    if (!req.user || !req.user.id_user) {
        return res.status(401).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Não autorizado",
            mensagem: "Usuário não autenticado"
        });
    }

    // 4. Verificar Ano Curricular
    const verificarAnoSQL = "SELECT id_anocurricular, ano FROM anocurricular WHERE id_anocurricular = ? AND status = 'Ativo'";

    conexao.query(verificarAnoSQL, [id_anocurricular], (erroAno, resultadosAno) => {
        if (erroAno) {
            console.error("Erro ao verificar Ano Curricular:", erroAno);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno ao verificar ano curricular",
                detalhes: erroAno.message
            });
        }

        if (resultadosAno.length === 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Ano Curricular inválido",
                mensagem: "O ano curricular selecionado não existe ou está inativo"
            });
        }

        const anoCurricular = resultadosAno[0].ano;

        // 5. Verificar Curso
        const verificarCursoSQL = "SELECT id_curso, curso, id_categoria FROM curso WHERE id_curso = ? AND status = 'Ativo'";

        conexao.query(verificarCursoSQL, [id_curso], (erroCurso, resultadosCurso) => {
            if (erroCurso) {
                console.error("Erro ao verificar Curso:", erroCurso);
                return res.status(500).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Erro no servidor",
                    mensagem: "Erro interno ao verificar curso",
                    detalhes: erroCurso.message
                });
            }

            if (resultadosCurso.length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Curso inválido",
                    mensagem: "O curso selecionado não existe ou está inativo"
                });
            }

            const nomeCurso = resultadosCurso[0].curso;

            // 6. Verificar Categoria
            const verificarCategoriaSQL = "SELECT id_categoria, categoria FROM categoria WHERE id_categoria = ? AND status = 'Ativo'";

            conexao.query(verificarCategoriaSQL, [id_categoria], (erroCategoria, resultadosCategoria) => {
                if (erroCategoria) {
                    console.error("Erro ao verificar Categoria:", erroCategoria);
                    return res.status(500).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Erro no servidor",
                        mensagem: "Erro interno ao verificar categoria",
                        detalhes: erroCategoria.message
                    });
                }

                if (resultadosCategoria.length === 0) {
                    return res.status(400).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Categoria inválida",
                        mensagem: "A categoria selecionada não existe ou está inativa"
                    });
                }

                // 7. Verificar se o curso pertence à categoria
                if (resultadosCurso[0].id_categoria !== id_categoria) {
                    return res.status(400).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Inconsistência de dados",
                        mensagem: "O curso selecionado não pertence à categoria informada"
                    });
                }

                // 8. Verificar se a turma já existe (buscar ou criar)
                const verificarTurmaSQL = "SELECT id_turma FROM turma WHERE turma = ? AND id_curso = ? AND status = 'Ativo'";

                conexao.query(verificarTurmaSQL, [turma, id_curso], (erroTurma, resultadosTurma) => {
                    if (erroTurma) {
                        console.error("Erro ao verificar Turma:", erroTurma);
                        return res.status(500).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Erro no servidor",
                            mensagem: "Erro interno ao verificar turma",
                            detalhes: erroTurma.message
                        });
                    }

                    const crypto = require('crypto');
                    let id_turma;

                    if (resultadosTurma.length === 0) {
                        // 8a. Criar nova turma
                        id_turma = gerarId();
                        const criarTurmaSQL = `
                            INSERT INTO turma (id_turma, turma, status, id_user, id_curso, data_criacao) 
                            VALUES (?, ?, 'Ativo', ?, ?, CURDATE())
                        `;

                        conexao.query(criarTurmaSQL, [id_turma, turma, idAdm, id_curso], (erroCriarTurma) => {
                            if (erroCriarTurma) {
                                console.error("Erro ao criar turma:", erroCriarTurma);
                                return res.status(500).json({
                                    sucesso: false,
                                    tipo: "erro",
                                    titulo: "Erro no servidor",
                                    mensagem: "Erro ao criar nova turma",
                                    detalhes: erroCriarTurma.message
                                });
                            }
                            continuarCriacaoPeriodo(id_turma);
                        });
                    } else {
                        id_turma = resultadosTurma[0].id_turma;
                        continuarCriacaoPeriodo(id_turma);
                    }

                    function continuarCriacaoPeriodo(id_turma_final) {
                        // 9. Verificar duplicidade de período na mesma turma
                        const verificarDuplicadoSQL = `
                            SELECT id_periodo 
                            FROM periodo 
                            WHERE id_turma = ? AND periodo = ? AND status = 'Ativo'
                        `;

                        conexao.query(verificarDuplicadoSQL, [id_turma_final, periodo], (erroDuplicado, resultadosDuplicado) => {
                            if (erroDuplicado) {
                                console.error("Erro ao verificar duplicidade:", erroDuplicado);
                                return res.status(500).json({
                                    sucesso: false,
                                    tipo: "erro",
                                    titulo: "Erro no servidor",
                                    mensagem: "Erro interno ao verificar duplicidade",
                                    detalhes: erroDuplicado.message
                                });
                            }

                            if (resultadosDuplicado.length > 0) {
                                return res.status(400).json({
                                    sucesso: false,
                                    tipo: "erro",
                                    titulo: "Período Duplicado",
                                    mensagem: `O período "${periodo}" já existe para a turma "${turma}"`
                                });
                            }

                            // 10. Gerar UUID para o período
                            const id_periodo = gerarId();

                            // 11. Inserir Período
                            const inserirPeriodoSQL = `
                                INSERT INTO periodo (id_periodo, periodo, status, id_user, id_turma, data_criacao) 
                                VALUES (?, ?, 'Ativo', ?, ?, CURDATE())
                            `;

                            conexao.query(inserirPeriodoSQL, [id_periodo, periodo, idAdm, id_turma_final], (erroInsercao, resultados) => {
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
                                            mensagem: "Este período já existe para esta turma"
                                        });
                                    }

                                    return res.status(500).json({
                                        sucesso: false,
                                        tipo: "erro",
                                        titulo: "Erro no servidor",
                                        mensagem: "Erro interno ao registrar período",
                                        detalhes: erroInsercao.message
                                    });
                                }

                                // 12. Inserir Ano Letivo
                                const id_anoletivo = gerarId();
                                const inserirAnoLetivoSQL = `
                                    INSERT INTO anoletivo (id_anoletivo, ano, status, id_user, id_periodo, data_criacao) 
                                    VALUES (?, ?, 'Ativo', ?, ?, CURDATE())
                                `;

                                conexao.query(inserirAnoLetivoSQL, [id_anoletivo, anoletivo, idAdm, id_periodo], (erroAnoLetivo) => {
                                    if (erroAnoLetivo) {
                                        console.error("Erro ao inserir ano letivo:", erroAnoLetivo);
                                        // Não falha o registro, apenas loga o erro
                                    }

                                    // 13. Buscar dados completos para resposta
                                    const buscarDadosSQL = `
                                        SELECT 
                                            p.id_periodo,
                                            p.periodo,
                                            p.status,
                                            p.data_criacao,
                                            t.id_turma,
                                            t.turma,
                                            c.id_curso,
                                            c.curso AS curso_nome,
                                            cat.id_categoria,
                                            cat.categoria AS categoria_nome,
                                            ac.id_anocurricular,
                                            ac.ano AS anocurricular,
                                            al.id_anoletivo,
                                            al.ano AS anoletivo
                                        FROM periodo p
                                        INNER JOIN turma t ON t.id_turma = p.id_turma
                                        INNER JOIN curso c ON c.id_curso = t.id_curso
                                        INNER JOIN categoria cat ON cat.id_categoria = c.id_categoria
                                        INNER JOIN anocurricular ac ON ac.id_anocurricular = ?
                                        LEFT JOIN anoletivo al ON al.id_periodo = p.id_periodo
                                        WHERE p.id_periodo = ?
                                    `;

                                    conexao.query(buscarDadosSQL, [id_anocurricular, id_periodo], (erroBusca, dadosCompletos) => {
                                        if (erroBusca) {
                                            console.error("Erro ao buscar dados completos:", erroBusca);
                                            return res.status(201).json({
                                                sucesso: true,
                                                tipo: "sucesso",
                                                titulo: "Período Registrado",
                                                mensagem: `Período "${periodo}" registrado com sucesso para a turma "${turma}"!`,
                                                dados: {
                                                    id_periodo: id_periodo,
                                                    periodo: periodo,
                                                    id_turma: id_turma_final,
                                                    turma: turma,
                                                    id_curso: id_curso,
                                                    curso_nome: nomeCurso,
                                                    id_categoria: id_categoria,
                                                    categoria_nome: resultadosCategoria[0].categoria,
                                                    id_anocurricular: id_anocurricular,
                                                    anocurricular: anoCurricular,
                                                    id_anoletivo: id_anoletivo,
                                                    anoletivo: anoletivo,
                                                    status: "Ativo",
                                                    data_criacao: new Date().toISOString().split('T')[0]
                                                }
                                            });
                                        }

                                        return res.status(201).json({
                                            sucesso: true,
                                            tipo: "sucesso",
                                            titulo: "Período Registrado",
                                            mensagem: `Período "${periodo}" registrado com sucesso para a turma "${turma}"!`,
                                            dados: dadosCompletos[0]
                                        });
                                    });
                                });
                            });
                        });
                    }
                });
            });
        });
    });
});

module.exports = router;