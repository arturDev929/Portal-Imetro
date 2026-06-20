const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const verificarToken = require("../../middlewares/authMiddleware");
const upload = require("../../utils/upload");
const { enviarCredenciaisFuncionario } = require("../../utils/email");
const { criptografarSenha, gerarId, gerarCodigo, gerarSenhaTemporaria } = require("../../utils/senhas");

// Pega os middlewares já configurados
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

    console.log("=== REGISTRANDO FUNCIONÁRIO ===");
    console.log("Nome:", nome);
    console.log("Email:", email);
    console.log("Foto:", foto);
    console.log("Documentos:", documentos.map(d => d.filename));

    const limparArquivos = () => {
        if (foto) upload.deletarFotoFuncionario(foto);
        documentos.forEach(doc => upload.deletarDocumentoFuncionario(doc.filename));
    };

    // Validações
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
        // Verificações de unicidade
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

        console.log("ID Funcionário:", id_func);
        console.log("Código gerado:", codigo);
        console.log("Senha gerada:", senha_funcionario);

        // Inserir funcionário
        await new Promise((resolve, reject) => {
            const sql = `INSERT INTO funcionario (id_func, nome, contacto, bi, status, id_user, id_cargo, data_criacao, data_atualizacao, senha, foto, email, codigo) VALUES (?, ?, ?, ?, 'Ativo', ?, ?, ?, ?, ?, ?, ?, ?)`;
            conexao.query(sql, [id_func, nome.trim(), contacto.trim(), bi.trim(), idAdm, id_cargo, dataAtual, dataAtual, senhaCriptografada, foto, email.trim(), codigo], (erro, resultado) => {
                if (erro) reject(erro);
                else resolve(resultado);
            });
        });

        // Inserir documentos
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

        // CORRIGIDO: enviar apenas 4 parâmetros
        const emailEnviado = await enviarCredenciaisFuncionario(email, nome, senha_funcionario, codigo);
        console.log("Email enviado:", emailEnviado);

        res.status(201).json({
            sucesso: true,
            mensagem: `Funcionario registrado com sucesso! ${emailEnviado.sucesso ? 'Credenciais enviadas por email.' : 'Erro ao enviar email.'}`,
            dados: { id: id_func, nome, email, senha_original: senha_funcionario, codigo, cargo }
        });

    } catch (erro) {
        console.error("Erro ao registrar funcionario:", erro);
        limparArquivos();
        res.status(500).json({ sucesso: false, mensagem: "Erro interno ao registrar funcionario: " + erro.message });
    }
});

// Rota para registrar professor - CORRIGIDA
router.post("/registrarProfessor", verificarToken, uploadCombinadoProfessor, async (req, res) => {
    console.log("=== INICIANDO REGISTRO DE PROFESSOR ===");
    console.log("Body recebido:", req.body);
    console.log("Files recebidos:", req.files);
    
    const { 
        nome, genero, nacionalidade, nomepai, nomemae, bi, contacto, 
        whatsapp, email, contactoemergencia, anoexperienca, titulacao, 
        iban, tiposangue, data_nascimento, data_admissao, estadocivil, 
        id_contrato, id_user 
    } = req.body;
    
    // Pega o nome do arquivo gerado pelo multer
    const foto = req.files?.foto ? req.files.foto[0].filename : null;
    const documentos = req.files?.documentos || [];
    const documentosTitulos = req.body.documentos_titulo || [];

    console.log("Nome da foto salva:", foto);
    console.log("Documentos salvos:", documentos.map(d => ({ original: d.originalname, filename: d.filename })));

    const limparArquivos = () => {
        console.log("Limpando arquivos enviados...");
        if (foto) {
            console.log("Deletando foto:", foto);
            upload.deletarFotoProfessor(foto);
        }
        documentos.forEach(doc => {
            console.log("Deletando documento:", doc.filename);
            upload.deletarDocumentoProfessor(doc.filename);
        });
    };

    try {
        // Validações
        console.log("Validando campos obrigatórios...");
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
                console.log(`Erro: Campo obrigatório ausente - ${campo.nome}`);
                limparArquivos();
                return res.status(400).json({ 
                    sucesso: false, 
                    mensagem: `O campo ${campo.nome} é obrigatório` 
                });
            }
        }
        console.log("Campos obrigatórios validados com sucesso");

        // Validar nome
        if (nome.length < 3 || nome.length > 100) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Nome deve ter entre 3 e 100 caracteres" });
        }

        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nome)) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Nome deve conter apenas letras e espaços" });
        }

        // Validar gênero
        const generosPermitidos = ["Masculino", "Feminino", "Outro"];
        if (!generosPermitidos.includes(genero)) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Gênero inválido" });
        }

        // Validar BI
        if (bi.length < 9 || bi.length > 14) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "BI deve ter entre 9 e 14 caracteres" });
        }

        if (!/^[a-zA-Z0-9]+$/.test(bi)) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "BI deve conter apenas letras e números" });
        }

        // Validar contacto
        if (!/^[0-9]{9,12}$/.test(contacto)) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Contacto deve conter apenas números e ter entre 9 e 12 dígitos" });
        }

        // Validar WhatsApp
        if (whatsapp && !/^[0-9]{9,12}$/.test(whatsapp)) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "WhatsApp deve conter apenas números e ter entre 9 e 12 dígitos" });
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Email inválido" });
        }

        if (email.length > 100) {
            limparArquivos();
            return res.status(400).json({ sucesso: false, mensagem: "Email deve ter no máximo 100 caracteres" });
        }

        // Validar datas
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

        // Verificar se contacto já existe
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

        // Verificar se BI já existe
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

        // Verificar se email já existe
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

        // Verificar se contrato existe
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

        // Gerar dados
        const id_professor = gerarId();
        const codigo = gerarCodigo();
        const senha_funcionario = gerarSenhaTemporaria();
        const senhaCriptografada = await criptografarSenha(senha_funcionario);

        console.log("ID Professor:", id_professor);
        console.log("Código:", codigo);
        console.log("Senha:", senha_funcionario);

        // Inserir professor
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

        // Inserir documentos
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

        // Enviar email
        const emailEnviado = await enviarCredenciaisFuncionario(email, nome, senha_funcionario, codigo);
        console.log("Email enviado:", emailEnviado);

        console.log("=== REGISTRO CONCLUÍDO COM SUCESSO ===");
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
        console.error("=== ERRO NO REGISTRO DO PROFESSOR ===");
        console.error("Mensagem de erro:", erro.message);
        console.error("Stack trace:", erro.stack);
        
        limparArquivos();
        
        res.status(500).json({ 
            sucesso: false, 
            mensagem: erro.message || "Erro interno ao registrar professor"
        });
    }
});

module.exports = router;