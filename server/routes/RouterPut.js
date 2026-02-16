const { Router } = require("express");
const router = Router();
const conexao = require("../infra/conexao");
const fs = require('fs');
const path = require('path');

router.put('/categoriaCurso/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { categoriacurso } = req.body;

        console.log("ID recebido:", id);
        console.log("Dados recebidos:", { categoriacurso });

        // Validação do ID
        if (!id || id.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'ID da categoria é obrigatório'
            });
        }

        if (isNaN(id) || parseInt(id) <= 0) {
            return res.status(400).json({
                success: false,
                error: 'ID da categoria inválido'
            });
        }

        // Validação do nome
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

        // Verificar se a categoria existe
        const checkSql = 'SELECT * FROM categoriacurso WHERE idcategoriacurso = ?';
        
        conexao.query(checkSql, [id], (checkError, checkResults) => {
            if (checkError) {
                console.error('Erro ao verificar categoria:', checkError);
                return res.status(500).json({
                    success: false,
                    error: 'Erro ao verificar categoria no banco de dados'
                });
            }

            if (checkResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Categoria não encontrada'
                });
            }

            // Verificar se já existe outra categoria com o mesmo nome (exceto a atual)
            const duplicateSql = 'SELECT * FROM categoriacurso WHERE categoriacurso = ? AND idcategoriacurso != ?';
            
            conexao.query(duplicateSql, [categoriacurso.trim(), id], (duplicateError, duplicateResults) => {
                if (duplicateError) {
                    console.error('Erro ao verificar duplicidade:', duplicateError);
                    return res.status(500).json({
                        success: false,
                        error: 'Erro ao verificar se categoria já existe'
                    });
                }

                if (duplicateResults.length > 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Já existe uma categoria com este nome'
                    });
                }

                // Atualizar categoria
                const updateSql = 'UPDATE categoriacurso SET categoriacurso = ? WHERE idcategoriacurso = ?';
                const values = [categoriacurso.trim(), id];
                
                conexao.query(updateSql, values, (error, results) => {
                    if (error) {
                        console.error('Erro ao atualizar categoria:', error);
                        return res.status(500).json({ 
                            success: false,
                            error: 'Erro ao atualizar categoria no banco de dados'
                        });
                    }
                    
                    // Verificar se algo foi atualizado
                    if (results.affectedRows === 0) {
                        return res.status(404).json({
                            success: false,
                            error: 'Categoria não encontrada para atualização'
                        });
                    }
                    
                    res.status(200).json({
                        success: true,
                        message: 'Categoria atualizada com sucesso',
                        id: id,
                        categoriacurso: categoriacurso.trim(),
                        affectedRows: results.affectedRows
                    });
                });
            });
        });
    } catch (error) {
        console.error('Erro na rota PUT:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: error.message 
        });
    }
});
router.put('/Curso/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { curso, idcategoriacurso } = req.body;

        console.log("ID do curso recebido:", id);
        console.log("Dados recebidos:", { curso, idcategoriacurso });

        // Validação do ID do curso
        if (!id || id.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'ID do curso é obrigatório'
            });
        }

        if (isNaN(id) || parseInt(id) <= 0) {
            return res.status(400).json({
                success: false,
                error: 'ID do curso inválido'
            });
        }

        // Validação do nome do curso
        if (!curso || curso.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'O nome do curso é obrigatório'
            });
        }

        if (curso.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: 'O nome do curso deve ter pelo menos 2 caracteres'
            });
        }

        if (curso.trim().length > 100) {
            return res.status(400).json({
                success: false,
                error: 'O nome do curso não pode exceder 100 caracteres'
            });
        }

        // Validação do ID da categoria
        if (!idcategoriacurso || idcategoriacurso.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'O departamento é obrigatório'
            });
        }

        if (isNaN(idcategoriacurso) || parseInt(idcategoriacurso) <= 0) {
            return res.status(400).json({
                success: false,
                error: 'ID do departamento inválido'
            });
        }

        // Verificar se o CURSO existe
        const checkCursoSql = 'SELECT * FROM curso WHERE idcurso = ?';
        conexao.query(checkCursoSql, [id], (checkError, checkResults) => {
            if (checkError) {
                console.error('Erro ao verificar curso:', checkError);
                return res.status(500).json({
                    success: false,
                    error: 'Erro ao verificar curso no banco de dados'
                });
            }

            if (checkResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Curso não encontrado'
                });
            }

            // Verificar se o DEPARTAMENTO existe
            const checkCategoriaSql = 'SELECT categoriacurso FROM categoriacurso WHERE idcategoriacurso = ?';
            conexao.query(checkCategoriaSql, [idcategoriacurso], (catError, catResults) => {
                if (catError) {
                    console.error('Erro ao verificar departamento:', catError);
                    return res.status(500).json({
                        success: false,
                        error: 'Erro ao verificar departamento no banco de dados'
                    });
                }

                if (catResults.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Departamento não encontrado'
                    });
                }

                // Verificar se já existe outro curso com o mesmo nome (exceto o atual)
                const duplicateSql = 'SELECT * FROM curso WHERE curso = ? AND idcurso != ?';
                conexao.query(duplicateSql, [curso.trim(), id], (duplicateError, duplicateResults) => {
                    if (duplicateError) {
                        console.error('Erro ao verificar duplicidade:', duplicateError);
                        return res.status(500).json({
                            success: false,
                            error: 'Erro ao verificar se curso já existe'
                        });
                    }

                    if (duplicateResults.length > 0) {
                        return res.status(400).json({
                            success: false,
                            error: 'Já existe um curso com este nome'
                        });
                    }

                    // Atualizar CURSO (nome + departamento)
                    const updateSql = 'UPDATE curso SET curso = ?, idcategoriacurso = ? WHERE idcurso = ?';
                    const values = [curso.trim(), idcategoriacurso, id];
                    
                    conexao.query(updateSql, values, (error, results) => {
                        if (error) {
                            console.error('Erro ao atualizar curso:', error);
                            return res.status(500).json({ 
                                success: false,
                                error: 'Erro ao atualizar curso no banco de dados'
                            });
                        }
                        
                        // Verificar se algo foi atualizado
                        if (results.affectedRows === 0) {
                            return res.status(404).json({
                                success: false,
                                error: 'Curso não encontrado para atualização'
                            });
                        }
                        
                        res.status(200).json({
                            success: true,
                            message: 'Curso atualizado com sucesso',
                            id: id,
                            curso: curso.trim(),
                            idcategoriacurso: idcategoriacurso,
                            affectedRows: results.affectedRows
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error('Erro na rota PUT /Curso:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: error.message 
        });
    }
});
// PUT atualizar disciplina
router.put('/disciplina/:id', (req, res) => {
    const { id } = req.params;
    const { disciplina } = req.body;
    
    // Validações
    if (!id || isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "ID da disciplina inválido" });
    }
    
    if (!disciplina || !disciplina.trim()) {
        return res.status(400).json({ error: "Nome da disciplina é obrigatório" });
    }
    
    // Verificar se disciplina existe
    const checkSql = "SELECT * FROM disciplina WHERE iddisciplina = ?";
    conexao.query(checkSql, [id], (checkError, checkResults) => {
        if(checkError){
            console.error("Erro ao verificar disciplina:", checkError);
            return res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: checkError.message 
            });
        }
        
        if(checkResults.length === 0){
            return res.status(404).json({ error: "Disciplina não encontrada" });
        }
        
        const disciplinaAtual = checkResults[0];
        
        // Verificar se novo nome já existe (exceto para a própria disciplina)
        const checkNomeSql = "SELECT * FROM disciplina WHERE LOWER(disciplina) = LOWER(?) AND iddisciplina != ?";
        conexao.query(checkNomeSql, [disciplina.trim(), id], (nomeError, nomeResults) => {
            if(nomeError){
                console.error("Erro ao verificar nome da disciplina:", nomeError);
                return res.status(500).json({ 
                    error: "Erro interno do servidor", 
                    details: nomeError.message 
                });
            }
            
            if(nomeResults.length > 0){
                return res.status(400).json({ 
                    error: `A disciplina "${disciplina}" já existe no sistema` 
                });
            }
            
            // Atualizar disciplina
            const updateSql = "UPDATE disciplina SET disciplina = ? WHERE iddisciplina = ?";
            const values = [disciplina.trim(), id];
            
            conexao.query(updateSql, values, (updateError, updateResults) => {
                if(updateError){
                    console.error("Erro ao atualizar disciplina:", updateError);
                    res.status(500).json({ 
                        error: "Erro interno do servidor", 
                        details: updateError.message 
                    });
                } else {
                    if(updateResults.affectedRows === 0){
                        res.status(404).json({ error: "Disciplina não encontrada para atualização" });
                    } else {
                        res.status(200).json({ 
                            success: true,
                            message: `Disciplina "${disciplinaAtual.disciplina}" atualizada para "${disciplina}"`,
                            iddisciplina: id,
                            disciplina: disciplina.trim(),
                            alteracoes: {
                                nome: disciplinaAtual.disciplina !== disciplina
                            }
                        });
                    }
                }
            });
        });
    });
});
router.put('/atulizarprofessor/:id', (req, res) => {
    const { id } = req.params;
    const {
        codigoprofessor,
        nomeprofessor,
        generoprofessor,
        nacionalidadeprofessor,
        estadocivilprofessor,
        nomepaiprofessor,
        nomemaeprofessor,
        nbiprofessor,
        datanascimentoprofessor,
        bipdfprofessor: bipdfprofessorExistente,
        residenciaprofessor,
        telefoneprofessor,
        whatsappprofessor,
        emailprofessor,
        anoexperienciaprofessor,
        titulacaoprofessor,
        dataadmissaoprofessor,
        tipocontratoprofessor,
        ibanprofessor,
        tiposanguineoprofessor,
        condicoesprofessor,
        contactoemergenciaprofessor,
        curriculo,
        foto
    } = req.body;
    
    // LOGS PARA DEBUG
    console.log('=== DADOS RECEBIDOS ===');
    console.log('ID:', id);
    console.log('Nome:', nomeprofessor);
    console.log('Foto:', foto ? (foto.substring(0, 50) + '...') : 'Nenhuma');
    console.log('Curriculo:', curriculo ? (curriculo.substring(0, 50) + '...') : 'Nenhum');
    console.log('BI Existente:', bipdfprofessorExistente);
    console.log('Tipo do curriculo:', typeof curriculo);
    console.log('========================');
    
    // Extrair o número de 8 dígitos do ID do professor
    const numeroProfessor = id.toString().padStart(8, '0').slice(-8);
    
    // Caminho da pasta de destino
    const pastaDestino = path.join(__dirname, '../../client/src/img/professores');
    
    // Garantir que a pasta existe
    if (!fs.existsSync(pastaDestino)) {
        fs.mkdirSync(pastaDestino, { recursive: true });
        console.log('Pasta criada:', pastaDestino);
    }
    
    // Validações de campos obrigatórios
    if (!nomeprofessor || !nomeprofessor.trim()) {
        console.log('Erro de validação: nomeprofessor é obrigatório');
        return res.status(400).json({ error: "Nome do professor é obrigatório" });
    }
    if (!nacionalidadeprofessor || !nacionalidadeprofessor.trim()) {
        console.log('Erro de validação: nacionalidadeprofessor é obrigatória');
        return res.status(400).json({ error: "Nacionalidade do professor é obrigatória" });
    }
    if (!codigoprofessor || !codigoprofessor.trim()) {
        console.log('Erro de validação: codigoprofessor é obrigatório');
        return res.status(400).json({ error: "Código do professor é obrigatório" });
    }
    if (!generoprofessor || !generoprofessor.trim()) {
        console.log('Erro de validação: generoprofessor é obrigatório');
        return res.status(400).json({ error: "Gênero é obrigatório" });
    }

    // Validação de campos opcionais (não podem estar vazios se enviados)
    const camposOpcionais = [
        { valor: estadocivilprofessor, nome: 'Estado civil' },
        { valor: nomepaiprofessor, nome: 'Nome do pai' },
        { valor: nomemaeprofessor, nome: 'Nome da mãe' },
        { valor: nbiprofessor, nome: 'Nº do BI' },
        { valor: residenciaprofessor, nome: 'Residência' },
        { valor: telefoneprofessor, nome: 'Telefone' },
        { valor: whatsappprofessor, nome: 'WhatsApp' },
        { valor: emailprofessor, nome: 'Email' },
        { valor: anoexperienciaprofessor, nome: 'Anos de experiência' },
        { valor: titulacaoprofessor, nome: 'Titulação' },
        { valor: tipocontratoprofessor, nome: 'Tipo de contrato' },
        { valor: ibanprofessor, nome: 'IBAN' },
        { valor: tiposanguineoprofessor, nome: 'Tipo sanguíneo' },
        { valor: condicoesprofessor, nome: 'Condições' },
        { valor: contactoemergenciaprofessor, nome: 'Contato de emergência' }
    ];
    
    for (const campo of camposOpcionais) {
        if (campo.valor !== undefined && typeof campo.valor === 'string' && !campo.valor.trim()) {
            console.log(`Erro de validação: ${campo.nome} não pode estar vazio se for enviado`);
            return res.status(400).json({ error: `${campo.nome} não pode estar vazio` });
        }
    }
    
    // Validação de email
    if (emailprofessor && typeof emailprofessor === 'string' && emailprofessor.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailprofessor.trim())) {
            console.log('Erro de validação: emailprofessor é inválido');
            return res.status(400).json({ error: "Email inválido" });
        }
    }
    
    // Validação de telefone
    if (telefoneprofessor && typeof telefoneprofessor === 'string' && telefoneprofessor.trim()) {
        const telefone = telefoneprofessor.replace(/\s+/g, '');
        const telefoneRegex = /^[0-9]{9}$/;
        if (!telefoneRegex.test(telefone)) {
            console.log('Erro de validação: telefoneprofessor é inválido');
            return res.status(400).json({ error: "Telefone inválido. Use 9 dígitos" });
        }
    }

    // Validação de WhatsApp
    if (whatsappprofessor && typeof whatsappprofessor === 'string' && whatsappprofessor.trim()) {
        const whatsapp = whatsappprofessor.replace(/\s+/g, '');
        const whatsappRegex = /^[0-9]{9}$/;
        if (!whatsappRegex.test(whatsapp)) {
            console.log('Erro de validação: whatsappprofessor é inválido');
            return res.status(400).json({ error: "WhatsApp inválido. Use 9 dígitos" });
        }
    }
    
    console.log('Validação passada. Verificando duplicidade de dados...');
    
    // Array para armazenar erros de duplicidade
    const errosDuplicidade = [];
    let verificacoesPendentes = 0;
    
    // Função para verificar campo duplicado
    function verificarCampoUnico(campo, valor, label) {
        if (!valor || !valor.toString().trim()) return;
        
        verificacoesPendentes++;
        
        conexao.query(
            `SELECT idprofessor FROM professor WHERE ${campo} = ? AND idprofessor != ?`,
            [valor, id],
            (err, results) => {
                if (err) {
                    console.log(`Erro ao verificar ${campo}:`, err);
                    errosDuplicidade.push(`Erro ao verificar ${label}`);
                } else if (results.length > 0) {
                    errosDuplicidade.push(`${label} já está em uso por outro professor`);
                    console.log(`CONFLITO: ${label} '${valor}' já pertence ao professor ID: ${results[0].idprofessor}`);
                }
                
                verificacoesPendentes--;
                if (verificacoesPendentes === 0) {
                    processarArquivos();
                }
            }
        );
    }
    
    // Função para processar foto e currículo
    function processarArquivos() {
        if (errosDuplicidade.length > 0) {
            console.log('Erros de duplicidade encontrados:', errosDuplicidade);
            return res.status(400).json({ error: errosDuplicidade.join('. ') });
        }
        
        console.log('Todas as verificações passaram. Processando arquivos...');
        
        let fotoFinal = bipdfprofessorExistente; // Inicia com o valor existente
        let documentoFinal = bipdfprofessorExistente; // Inicia com o valor existente
        
        // PROCESSAR FOTO
        if (foto && typeof foto === 'string' && foto.trim()) {
            // Verificar se é uma nova foto (base64)
            if (foto.startsWith('data:image')) {
                try {
                    console.log('Processando nova foto...');
                    
                    // Extrair extensão
                    const matches = foto.match(/^data:image\/([a-zA-Z]+);base64,/);
                    const extensao = matches ? matches[1] : 'jpg';
                    
                    // Gerar timestamp de 13 dígitos
                    const timestamp = Date.now().toString().slice(-13);
                    
                    // Nome do arquivo: professor_8digtos_foto_13digtos.extensao
                    const nomeArquivo = `professor_${numeroProfessor}_foto_${timestamp}.${extensao}`;
                    const caminhoCompleto = path.join(pastaDestino, nomeArquivo);
                    
                    console.log('Salvando foto em:', caminhoCompleto);
                    
                    // Extrair dados base64
                    const base64Data = foto.split(',')[1];
                    
                    if (base64Data) {
                        const buffer = Buffer.from(base64Data, 'base64');
                        fs.writeFileSync(caminhoCompleto, buffer);
                        
                        // Salvar APENAS o nome do arquivo (sem caminho)
                        fotoFinal = nomeArquivo;
                        console.log('Foto salva como:', nomeArquivo);
                        
                        // Verificar se o arquivo foi realmente criado
                        if (fs.existsSync(caminhoCompleto)) {
                            console.log('✅ Arquivo de foto verificado no disco');
                        } else {
                            console.log('❌ Arquivo de foto NÃO encontrado no disco');
                        }
                    } else {
                        console.log('Erro: dados base64 da foto estão vazios');
                        fotoFinal = bipdfprofessorExistente;
                    }
                } catch (error) {
                    console.log('Erro ao processar foto:', error);
                    return res.status(500).json({ error: 'Erro ao processar foto' });
                }
            } else {
                // É uma foto já existente - extrair apenas o nome do arquivo se vier com caminho
                if (foto.includes('/')) {
                    const partes = foto.split('/');
                    fotoFinal = partes[partes.length - 1];
                } else {
                    fotoFinal = foto;
                }
                console.log('Mantendo foto existente:', fotoFinal);
            }
        } else {
            console.log('Nenhuma foto nova fornecida');
        }
        
        // PROCESSAR CURRÍCULO/BI
        console.log('=== PROCESSANDO CURRÍCULO ===');
        console.log('Curriculo recebido:', curriculo ? 'SIM' : 'NÃO');
        console.log('Tipo do curriculo:', typeof curriculo);
        console.log('BI existente:', bipdfprofessorExistente ? bipdfprofessorExistente : 'Nenhum');
        
        // Verifica se tem novo currículo
        if (curriculo && typeof curriculo === 'string' && curriculo.trim()) {
            console.log('Curriculo tem conteúdo, verificando se é base64...');
            console.log('Começa com data:', curriculo.startsWith('data:'));
            console.log('Contém base64:', curriculo.includes('base64'));
            
            // Verifica se é uma string base64 válida
            if (curriculo.includes('base64')) {
                try {
                    console.log('Processando novo currículo/BI...');
                    
                    // Determinar extensão
                    let extensao = 'pdf';
                    if (curriculo.startsWith('data:application/pdf')) {
                        extensao = 'pdf';
                        console.log('Extensão detectada: PDF');
                    } else if (curriculo.startsWith('data:application/msword')) {
                        extensao = 'doc';
                        console.log('Extensão detectada: DOC');
                    } else if (curriculo.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
                        extensao = 'docx';
                        console.log('Extensão detectada: DOCX');
                    } else {
                        console.log('Tipo MIME não reconhecido, usando extensão padrão:', extensao);
                    }
                    
                    // Gerar timestamp de 13 dígitos
                    const timestamp = Date.now().toString().slice(-13);
                    
                    // Nome do arquivo: professor_8digtos_bi_13digtos.extensao
                    const nomeArquivo = `professor_${numeroProfessor}_bi_${timestamp}.${extensao}`;
                    const caminhoCompleto = path.join(pastaDestino, nomeArquivo);
                    
                    console.log('Salvando currículo em:', caminhoCompleto);
                    
                    // Extrair dados base64
                    const partes = curriculo.split(',');
                    console.log('Número de partes após split:', partes.length);
                    
                    if (partes.length > 1) {
                        const base64Data = partes[1];
                        console.log('Tamanho dos dados base64:', base64Data.length);
                        
                        const buffer = Buffer.from(base64Data, 'base64');
                        console.log('Tamanho do buffer criado:', buffer.length);
                        
                        fs.writeFileSync(caminhoCompleto, buffer);
                        console.log('Arquivo escrito no disco');
                        
                        // Verificar se o arquivo foi realmente criado
                        if (fs.existsSync(caminhoCompleto)) {
                            console.log('✅ Arquivo de currículo verificado no disco');
                            
                            // Salvar APENAS o nome do arquivo (sem caminho)
                            documentoFinal = nomeArquivo;
                            console.log('Currículo/BI salvo como:', nomeArquivo);
                        } else {
                            console.log('❌ Arquivo de currículo NÃO encontrado no disco após escrita');
                        }
                    } else {
                        console.log('Erro: formato base64 inválido - não foi possível fazer split');
                        console.log('Primeiros 100 caracteres:', curriculo.substring(0, 100));
                    }
                } catch (error) {
                    console.log('Erro ao processar currículo:', error);
                    console.log('Stack trace:', error.stack);
                    // Em caso de erro, mantém o existente
                    documentoFinal = bipdfprofessorExistente;
                    console.log('Mantendo documento existente devido a erro');
                }
            } else {
                console.log('Currículo não está em formato base64, tratando como caminho existente');
                // Se não for base64, pode ser um caminho existente
                if (curriculo.includes('/')) {
                    const partes = curriculo.split('/');
                    documentoFinal = partes[partes.length - 1];
                } else {
                    documentoFinal = curriculo;
                }
                console.log('Mantendo currículo existente (como caminho):', documentoFinal);
            }
        } else {
            console.log('Nenhum novo currículo fornecido. Mantendo documento existente.');
            // Se o existente tiver caminho, extrair apenas o nome
            if (bipdfprofessorExistente && typeof bipdfprofessorExistente === 'string') {
                if (bipdfprofessorExistente.includes('/')) {
                    const partes = bipdfprofessorExistente.split('/');
                    documentoFinal = partes[partes.length - 1];
                } else {
                    documentoFinal = bipdfprofessorExistente;
                }
                console.log('Mantendo BI existente:', documentoFinal);
            } else {
                documentoFinal = null;
                console.log('Nenhum BI existente');
            }
        }
        
        console.log('Final do processamento:');
        console.log('- Foto final (nome apenas):', fotoFinal);
        console.log('- Documento final (nome apenas):', documentoFinal);
        console.log('=============================');
        
        // Prosseguir com atualização no banco
        atualizarProfessor(fotoFinal, documentoFinal);
    }
    
    // Função para atualizar o professor no banco
    function atualizarProfessor(fotoFinal, documentoFinal) {
        console.log('Atualizando professor no banco de dados...');
        console.log('Valores a serem salvos:');
        console.log('- fotoprofessor:', fotoFinal);
        console.log('- bipdfprofessor:', documentoFinal);
        
        const query = `
            UPDATE professor SET
                codigoprofessor = ?,
                nomeprofessor = ?,
                generoprofessor = ?,
                nacionalidadeprofessor = ?,
                estadocivilprofessor = ?,
                nomepaiprofessor = ?,
                nomemaeprofessor = ?,
                nbiprofessor = ?,
                datanascimentoprofessor = ?,
                bipdfprofessor = ?,
                residenciaprofessor = ?,
                telefoneprofessor = ?,
                whatsappprofessor = ?,
                emailprofessor = ?,
                anoexperienciaprofessor = ?,
                titulacaoprofessor = ?,
                dataadmissaoprofessor = ?,
                tipocontratoprofessor = ?,
                ibanprofessor = ?,
                tiposanguineoprofessor = ?,
                condicoesprofessor = ?,
                contactoemergenciaprofessor = ?,
                fotoprofessor = ?,
                bipdfprofessor = ?
            WHERE idprofessor = ?
        `;
        
        const params = [
            codigoprofessor,
            nomeprofessor,
            generoprofessor,
            nacionalidadeprofessor,
            estadocivilprofessor,
            nomepaiprofessor,
            nomemaeprofessor,
            nbiprofessor,
            datanascimentoprofessor,
            documentoFinal, // bipdfprofessor
            residenciaprofessor,
            telefoneprofessor,
            whatsappprofessor,
            emailprofessor,
            anoexperienciaprofessor,
            titulacaoprofessor,
            dataadmissaoprofessor,
            tipocontratoprofessor,
            ibanprofessor,
            tiposanguineoprofessor,
            condicoesprofessor,
            contactoemergenciaprofessor,
            fotoFinal, // fotoprofessor
            documentoFinal, // bipdfprofessor (segunda ocorrência)
            id
        ];
        
        console.log('Executando query de update...');
        
        conexao.query(query, params, (err, result) => {
            if (err) {
                console.log('Erro ao atualizar professor:', err);
                return res.status(500).json({ error: 'Erro ao atualizar professor' });
            }
            
            console.log('Professor atualizado com sucesso!');
            console.log('Resultado:', result);
            res.json({ 
                success: true, 
                message: 'Professor atualizado com sucesso' 
            });
        });
    }
    
    // Iniciar verificações para cada campo
    verificarCampoUnico('nomeprofessor', nomeprofessor, 'Nome do professor');
    verificarCampoUnico('codigoprofessor', codigoprofessor, 'Código do professor');
    verificarCampoUnico('emailprofessor', emailprofessor, 'Email');
    verificarCampoUnico('nbiprofessor', nbiprofessor, 'Nº do BI');
    verificarCampoUnico('telefoneprofessor', telefoneprofessor, 'Telefone');
    verificarCampoUnico('whatsappprofessor', whatsappprofessor, 'WhatsApp');
    
    // Se não houver verificações pendentes, processa arquivos
    if (verificacoesPendentes === 0) {
        processarArquivos();
    }
});


module.exports = router;