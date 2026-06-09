const { Router } = require("express");
const router = Router();
const conexao = require("../../infra/conexao");
const verificarToken = require("../../middlewares/authMiddleware");
const { uploadCombinado, deletarFotoFuncionario, deletarDocumentoFuncionario } = require("../../utils/upload");
const { enviarCredenciaisFuncionario } = require("../../utils/email");
const { criptografarSenha, gerarId, gerarCodigo, gerarSenhaTemporaria } = require("../../utils/senhas");

router.post("/registrarfuncionario", verificarToken, uploadCombinado.fields([
    { name: "foto", maxCount: 1 },
    { name: "documentos", maxCount: 10 }
]), async (req, res) => {
    const { nome, contacto, bi, cargo, email, idAdm } = req.body;
    const foto = req.files?.foto ? req.files.foto[0].filename : null;
    const documentos = req.files?.documentos || [];
    const documentosTitulos = req.body.documentos_titulo || [];

    // Validações
    if (!nome?.trim()) {
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        return res.status(400).json({ sucesso: false, mensagem: "Nome é obrigatorio" });
    }
    if (!contacto?.trim()) {
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        return res.status(400).json({ sucesso: false, mensagem: "Contacto é obrigatorio" });
    }
    if (!bi?.trim()) {
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        return res.status(400).json({ sucesso: false, mensagem: "BI é obrigatorio" });
    }
    if (!cargo?.trim()) {
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        return res.status(400).json({ sucesso: false, mensagem: "Cargo é obrigatorio" });
    }
    if (!email?.trim()) {
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
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
            if (foto) deletarFotoFuncionario(foto);
            documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
            return res.status(400).json({ sucesso: false, mensagem: "Contacto ja em uso" });
        }

        const verificarBI = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_func FROM funcionario WHERE bi = ?", [bi.trim()], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (verificarBI.length > 0) {
            if (foto) deletarFotoFuncionario(foto);
            documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
            return res.status(400).json({ sucesso: false, mensagem: "BI ja em uso" });
        }

        const verificarEmail = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_func FROM funcionario WHERE email = ?", [email.trim()], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (verificarEmail.length > 0) {
            if (foto) deletarFotoFuncionario(foto);
            documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
            return res.status(400).json({ sucesso: false, mensagem: "Email ja em uso" });
        }

        const cargoResult = await new Promise((resolve, reject) => {
            conexao.query("SELECT id_cargo FROM cargo WHERE cargo = ?", [cargo], (erro, resultados) => {
                if (erro) reject(erro);
                else resolve(resultados);
            });
        });
        if (cargoResult.length === 0) {
            if (foto) deletarFotoFuncionario(foto);
            documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
            return res.status(400).json({ sucesso: false, mensagem: "Cargo nao encontrado" });
        }

        const id_cargo = cargoResult[0].id_cargo;
        const id_func = gerarId();
        const codigo = gerarCodigo();
        const senha_funcionario = gerarSenhaTemporaria();
        const senhaCriptografada = await criptografarSenha(senha_funcionario);
        const dataAtual = new Date().toISOString().split('T')[0];

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

        const emailEnviado = await enviarCredenciaisFuncionario(email, nome, senha_funcionario, cargo, codigo);

        res.status(201).json({
            sucesso: true,
            mensagem: `Funcionario registrado com sucesso! ${emailEnviado.sucesso ? 'Credenciais enviadas por email.' : 'Erro ao enviar email.'}`,
            dados: { id: id_func, nome, email, senha_original: senha_funcionario, codigo, cargo }
        });

    } catch (erro) {
        console.error("Erro ao registrar funcionario:", erro);
        if (foto) deletarFotoFuncionario(foto);
        documentos.forEach(doc => deletarDocumentoFuncionario(doc.filename));
        res.status(500).json({ sucesso: false, mensagem: "Erro interno ao registrar funcionario" });
    }
});

router.post('/registrarprofessor', (req, res) => {
    console.log("=== INICIANDO REGISTRO DE PROFESSOR ===");
    console.log("Body recebido:", req.body);
    console.log("Files recebidos:", req.files ? Object.keys(req.files) : "Nenhum arquivo");
    
    upload.uploadCombinado(req, res, async (err) => {
        // Erro do multer
        if (err) {
            console.error("Erro no upload (multer):", err);
            
            if (err instanceof multer.MulterError) {
                if (err.code === 'FILE_TOO_LARGE') {
                    console.log("Arquivo muito grande");
                    return res.status(400).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Arquivo muito grande",
                        mensagem: "O arquivo excede o limite de 10MB"
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    console.log("Muitos arquivos");
                    return res.status(400).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "Muitos arquivos",
                        mensagem: "Número máximo de arquivos excedido"
                    });
                }
            }
            
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no upload",
                mensagem: err.message
            });
        }

        try {
            const body = req.body || {};
            const files = req.files || {};

            console.log("Dados após upload:");
            console.log("- nomeprofessore:", body.nomeprofessore);
            console.log("- genero:", body.genero);
            console.log("- biprofessor:", body.biprofessor);
            console.log("- emailprofessor:", body.emailprofessor);
            console.log("- idAdm:", body.idAdm);

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

            // VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS
            console.log("Validando campos obrigatórios...");
            if (!nomeprofessore || !genero || !biprofessor || !idAdm) {
                console.log("ERRO: Campos obrigatórios faltando");
                console.log("- nomeprofessore:", !!nomeprofessore);
                console.log("- genero:", !!genero);
                console.log("- biprofessor:", !!biprofessor);
                console.log("- idAdm:", !!idAdm);
                
                if (files.fotoprofessor) {
                    console.log("Deletando foto:", files.fotoprofessor[0].filename);
                    upload.deletarFotoProfessor(files.fotoprofessor[0].filename);
                }
                if (files.bipdfprofessor) {
                    console.log("Deletando documento:", files.bipdfprofessor[0].filename);
                    upload.deletarDocumentoProfessor(files.bipdfprofessor[0].filename);
                }
                
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Campos obrigatórios",
                    mensagem: "Nome, gênero, BI e Administrador são obrigatórios!"
                });
            }

            // VALIDAÇÃO DE EMAIL
            console.log("Validando email...");
            if (!emailprofessor) {
                console.log("ERRO: Email não fornecido");
                if (files.fotoprofessor) upload.deletarFotoProfessor(files.fotoprofessor[0].filename);
                if (files.bipdfprofessor) upload.deletarDocumentoProfessor(files.bipdfprofessor[0].filename);
                
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Email obrigatório",
                    mensagem: "Email é obrigatório para enviar as credenciais de acesso!"
                });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailprofessor)) {
                console.log("ERRO: Email inválido:", emailprofessor);
                if (files.fotoprofessor) upload.deletarFotoProfessor(files.fotoprofessor[0].filename);
                if (files.bipdfprofessor) upload.deletarDocumentoProfessor(files.bipdfprofessor[0].filename);
                
                return res.status(400).json({
                    sucesso: false,
                    tipo: "erro",
                    titulo: "Email inválido",
                    mensagem: "Formato de email inválido!"
                });
            }
            console.log("Email válido:", emailprofessor);

            // VERIFICAR BI
            console.log("Verificando se BI já existe:", biprofessor);
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
                    console.log("ERRO: BI já existe:", biprofessor);
                    if (files.fotoprofessor) upload.deletarFotoProfessor(files.fotoprofessor[0].filename);
                    if (files.bipdfprofessor) upload.deletarDocumentoProfessor(files.bipdfprofessor[0].filename);
                    
                    return res.status(400).json({
                        sucesso: false,
                        tipo: "erro",
                        titulo: "BI existente",
                        mensagem: "Este número de BI já está registrado!"
                    });
                }
                console.log("BI não existe, pode prosseguir");

                // VERIFICAR EMAIL
                console.log("Verificando se email já existe:", emailprofessor);
                const verificarEmailSQL = "SELECT id_professor FROM professor WHERE email = ?";
                conexao.query(verificarEmailSQL, [emailprofessor], async (erro, emailExiste) => {
                    if (erro) {
                        console.error("Erro ao verificar email:", erro);
                        return res.status(500).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Erro no servidor",
                            mensagem: "Erro interno do servidor"
                        });
                    }

                    if (emailExiste.length > 0) {
                        console.log("ERRO: Email já existe:", emailprofessor);
                        if (files.fotoprofessor) upload.deletarFotoProfessor(files.fotoprofessor[0].filename);
                        if (files.bipdfprofessor) upload.deletarDocumentoProfessor(files.bipdfprofessor[0].filename);
                        
                        return res.status(400).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Email existente",
                            mensagem: "Este email já está registrado!"
                        });
                    }
                    console.log("Email não existe, pode prosseguir");

                    try {
                        // GERAR CÓDIGO DO PROFESSOR
                        console.log("Gerando código do professor...");
                        let codigoProfessor;
                        let codigoProfessorUnico = false;
                        let tentativas = 0;
                        const maxTentativas = 10;

                        while (!codigoProfessorUnico && tentativas < maxTentativas) {
                            codigoProfessor = gerarCodigo();
                            console.log(`Tentativa ${tentativas + 1}: código gerado ${codigoProfessor}`);
                            
                            const verificarCodigoSQL = "SELECT id_professor FROM professor WHERE codigo = ?";
                            const [resultadosCodigo] = await conexao.promise().query(verificarCodigoSQL, [codigoProfessor]);
                            
                            if (resultadosCodigo.length === 0) {
                                codigoProfessorUnico = true;
                                console.log("Código único encontrado:", codigoProfessor);
                            }
                            tentativas++;
                        }

                        if (!codigoProfessorUnico) {
                            console.error("ERRO: Não foi possível gerar código único após", maxTentativas, "tentativas");
                            throw new Error("Não foi possível gerar um código único");
                        }

                        // GERAR SENHA TEMPORÁRIA
                        console.log("Gerando senha temporária...");
                        const senhaTemporaria = gerarSenhaTemporaria();
                        console.log("Senha temporária gerada:", senhaTemporaria);
                        
                        // CRIPTOGRAFAR SENHA
                        console.log("Criptografando senha...");
                        const senhaCriptografada = await criptografarSenha(senhaTemporaria);
                        console.log("Senha criptografada com sucesso");

                        // NOMES DOS ARQUIVOS
                        console.log("Processando arquivos...");
                        let nomeFoto = null;
                        let nomeBIPDF = null;
                        let outrosDocumentos = [];

                        if (files.fotoprofessor) {
                            nomeFoto = files.fotoprofessor[0].filename;
                            console.log("Foto salva como:", nomeFoto);
                        }

                        if (files.bipdfprofessor) {
                            nomeBIPDF = files.bipdfprofessor[0].filename;
                            console.log("BI PDF salvo como:", nomeBIPDF);
                        }

                        const camposDoc = ['certificadoprofessor', 'diplomaprofessor', 'contratoprofessor', 'documentoprofessor'];
                        camposDoc.forEach(campo => {
                            if (files[campo]) {
                                files[campo].forEach(file => {
                                    outrosDocumentos.push({
                                        tipo: campo,
                                        nome: file.filename
                                    });
                                    console.log(`Documento ${campo} salvo como:`, file.filename);
                                });
                            }
                        });

                        // INSERT DO PROFESSOR
                        console.log("Inserindo professor no banco de dados...");
                        const inserirProfessorSQL = `
                            INSERT INTO professor (
                                codigo, foto, nome, genero, 
                                nacionalidade, estadocivil, nomepai, 
                                nomemae, bi, data_nascimento, bi_pdf,
                                residencia, contacto, whatsapp, email, 
                                anoexperiencia, titulacao, data_admissao, 
                                tipo_contrato, iban, tipo_sangue, condicoes, 
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
                            emailprofessor,
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

                        console.log("Valores para inserção:", valores);

                        conexao.query(inserirProfessorSQL, valores, async (erro, resultados) => {
                            if (erro) {
                                console.error("Erro ao inserir professor:", erro);
                                console.error("SQL Error:", erro.sqlMessage);
                                
                                if (nomeFoto) upload.deletarFotoProfessor(nomeFoto);
                                if (nomeBIPDF) upload.deletarDocumentoProfessor(nomeBIPDF);
                                for (const doc of outrosDocumentos) {
                                    upload.deletarDocumentoProfessor(doc.nome);
                                }
                                
                                return res.status(500).json({
                                    sucesso: false,
                                    tipo: "erro",
                                    titulo: "Erro no cadastro",
                                    mensagem: "Erro ao registrar professor: " + erro.message
                                });
                            }

                            console.log("Professor inserido com sucesso! ID:", resultados.insertId);

                            // INSERIR DOCUMENTOS NA TABELA ficheiro_prof
                            if (outrosDocumentos.length > 0) {
                                console.log("Inserindo documentos na tabela ficheiro_prof...");
                                const inserirFicheiroSQL = `
                                    INSERT INTO ficheiro_prof (ficheiro, id_professor, nome) 
                                    VALUES (?, ?, ?)
                                `;
                                
                                for (const doc of outrosDocumentos) {
                                    await conexao.promise().query(inserirFicheiroSQL, [
                                        doc.nome,
                                        resultados.insertId,
                                        doc.tipo
                                    ]);
                                    console.log(`Documento ${doc.tipo} inserido`);
                                }
                            }

                            // ENVIAR EMAIL COM AS CREDENCIAIS
                            console.log("Enviando email com credenciais para:", emailprofessor);
                            const cargo = "Professor";
                            const emailEnviado = await enviarCredenciaisFuncionario(
                                emailprofessor,
                                nomeprofessore,
                                senhaTemporaria,
                                cargo,
                                codigoProfessor
                            );

                            if (!emailEnviado.sucesso) {
                                console.error("Erro ao enviar email:", emailEnviado.erro);
                                console.log("Retornando aviso - email não enviado");
                                return res.status(201).json({
                                    sucesso: true,
                                    tipo: "aviso",
                                    titulo: "Professor Registrado!",
                                    mensagem: "Professor registrado, mas houve erro ao enviar o email. Envie as credenciais manualmente.",
                                    dados: {
                                        idprofessor: resultados.insertId,
                                        nomeprofessore: nomeprofessore,
                                        codigoProfessor: codigoProfessor,
                                        senhaTemporaria: senhaTemporaria
                                    }
                                });
                            }

                            console.log("Email enviado com sucesso!");
                            console.log("=== REGISTRO CONCLUÍDO COM SUCESSO ===");
                            
                            // RESPOSTA FINAL
                            res.status(201).json({
                                sucesso: true,
                                tipo: "sucesso",
                                titulo: "Professor Registrado!",
                                mensagem: `Professor registrado com sucesso! As credenciais foram enviadas para ${emailprofessor}`,
                                dados: {
                                    idprofessor: resultados.insertId,
                                    nomeprofessore: nomeprofessore,
                                    codigoProfessor: codigoProfessor,
                                    email: emailprofessor
                                }
                            });
                        });

                    } catch (erro) {
                        console.error("Erro no processamento:", erro);
                        console.error("Stack trace:", erro.stack);
                        
                        if (files.fotoprofessor) {
                            console.log("Deletando foto devido a erro:", files.fotoprofessor[0].filename);
                            upload.deletarFotoProfessor(files.fotoprofessor[0].filename);
                        }
                        if (files.bipdfprofessor) {
                            console.log("Deletando documento devido a erro:", files.bipdfprofessor[0].filename);
                            upload.deletarDocumentoProfessor(files.bipdfprofessor[0].filename);
                        }
                        
                        return res.status(500).json({
                            sucesso: false,
                            tipo: "erro",
                            titulo: "Erro no processamento",
                            mensagem: "Erro ao processar dados: " + erro.message
                        });
                    }
                });
            });

        } catch (erro) {
            console.error("Erro no endpoint:", erro);
            console.error("Stack trace:", erro.stack);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro interno",
                mensagem: "Erro interno do servidor: " + erro.message
            });
        }
    });
});

module.exports = router;