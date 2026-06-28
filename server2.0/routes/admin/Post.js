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

module.exports = router;