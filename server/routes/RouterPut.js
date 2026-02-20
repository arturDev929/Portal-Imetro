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

router.put('/disciplina/:id', (req, res) => {
    const { id } = req.params;
    const { disciplina } = req.body;

    if (!id || isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "ID da disciplina inválido" });
    }
    
    if (!disciplina || !disciplina.trim()) {
        return res.status(400).json({ error: "Nome da disciplina é obrigatório" });
    }

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
    
    const numeroProfessor = id.toString().padStart(8, '0').slice(-8);
    
    const pastaDestino = path.join(__dirname, '../../client/src/img/professores');

    if (!fs.existsSync(pastaDestino)) {
        fs.mkdirSync(pastaDestino, { recursive: true });
        console.log('Pasta criada:', pastaDestino);
    }
    
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

    if (emailprofessor && typeof emailprofessor === 'string' && emailprofessor.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailprofessor.trim())) {
            console.log('Erro de validação: emailprofessor é inválido');
            return res.status(400).json({ error: "Email inválido" });
        }
    }

    if (telefoneprofessor && typeof telefoneprofessor === 'string' && telefoneprofessor.trim()) {
        const telefone = telefoneprofessor.replace(/\s+/g, '');
        const telefoneRegex = /^[0-9]{9}$/;
        if (!telefoneRegex.test(telefone)) {
            console.log('Erro de validação: telefoneprofessor é inválido');
            return res.status(400).json({ error: "Telefone inválido. Use 9 dígitos" });
        }
    }

    if (whatsappprofessor && typeof whatsappprofessor === 'string' && whatsappprofessor.trim()) {
        const whatsapp = whatsappprofessor.replace(/\s+/g, '');
        const whatsappRegex = /^[0-9]{9}$/;
        if (!whatsappRegex.test(whatsapp)) {
            console.log('Erro de validação: whatsappprofessor é inválido');
            return res.status(400).json({ error: "WhatsApp inválido. Use 9 dígitos" });
        }
    }
    
    console.log('Validação passada. Verificando duplicidade de dados...');

    const errosDuplicidade = [];
    let verificacoesPendentes = 0;

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
    
    function processarArquivos() {
        if (errosDuplicidade.length > 0) {
            console.log('Erros de duplicidade encontrados:', errosDuplicidade);
            return res.status(400).json({ error: errosDuplicidade.join('. ') });
        }
        
        let fotoFinal = bipdfprofessorExistente;
        let documentoFinal = bipdfprofessorExistente;
        
        if (foto && typeof foto === 'string' && foto.trim()) {
            if (foto.startsWith('data:image')) {
                try {
                    console.log('Processando nova foto...');

                    const matches = foto.match(/^data:image\/([a-zA-Z]+);base64,/);
                    const extensao = matches ? matches[1] : 'jpg';

                    const timestamp = Date.now().toString().slice(-13);

                    const nomeArquivo = `professor_${numeroProfessor}_foto_${timestamp}.${extensao}`;
                    const caminhoCompleto = path.join(pastaDestino, nomeArquivo);
                    
                    console.log('Salvando foto em:', caminhoCompleto);

                    const base64Data = foto.split(',')[1];
                    
                    if (base64Data) {
                        const buffer = Buffer.from(base64Data, 'base64');
                        fs.writeFileSync(caminhoCompleto, buffer);

                        fotoFinal = nomeArquivo;
                        console.log('Foto salva como:', nomeArquivo);

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

        if (curriculo && typeof curriculo === 'string' && curriculo.trim()) {
            console.log('Curriculo tem conteúdo, verificando se é base64...');
            console.log('Começa com data:', curriculo.startsWith('data:'));
            console.log('Contém base64:', curriculo.includes('base64'));

            if (curriculo.includes('base64')) {
                try {
                    console.log('Processando novo currículo/BI...');

                    let extensao = 'pdf';
                    if (curriculo.startsWith('data:application/pdf')) {
                        extensao = 'pdf';
                    } else if (curriculo.startsWith('data:application/msword')) {
                        extensao = 'doc';
                    } else if (curriculo.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
                        extensao = 'docx';
                    }

                    const timestamp = Date.now().toString().slice(-13);

                    const nomeArquivo = `professor_${numeroProfessor}_bi_${timestamp}.${extensao}`;
                    const caminhoCompleto = path.join(pastaDestino, nomeArquivo);

                    const partes = curriculo.split(',');
                    
                    if (partes.length > 1) {
                        const base64Data = partes[1];
                        
                        const buffer = Buffer.from(base64Data, 'base64');
                        
                        fs.writeFileSync(caminhoCompleto, buffer);

                        if (fs.existsSync(caminhoCompleto)) {
                            documentoFinal = nomeArquivo;
                        }
                    }
                } catch (error) {
                    documentoFinal = bipdfprofessorExistente;
                }
            } else {
                if (curriculo.includes('/')) {
                    const partes = curriculo.split('/');
                    documentoFinal = partes[partes.length - 1];
                } else {
                    documentoFinal = curriculo;
                }
            }
        } else {
            if (bipdfprofessorExistente && typeof bipdfprofessorExistente === 'string') {
                if (bipdfprofessorExistente.includes('/')) {
                    const partes = bipdfprofessorExistente.split('/');
                    documentoFinal = partes[partes.length - 1];
                } else {
                    documentoFinal = bipdfprofessorExistente;
                }
            } else {
                documentoFinal = null;
            }
        }
        
        atualizarProfessor(fotoFinal, documentoFinal);
    }

    function atualizarProfessor(fotoFinal, documentoFinal) {
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
            documentoFinal,
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
            fotoFinal,
            documentoFinal,
            id
        ];
        
        conexao.query(query, params, (err, result) => {
            if (err) {
                console.log('Erro ao atualizar professor:', err);
                return res.status(500).json({ error: 'Erro ao atualizar professor' });
            }
            
            res.json({ 
                success: true, 
                message: 'Professor atualizado com sucesso' 
            });
        });
    }

    verificarCampoUnico('nomeprofessor', nomeprofessor, 'Nome do professor');
    verificarCampoUnico('codigoprofessor', codigoprofessor, 'Código do professor');
    verificarCampoUnico('emailprofessor', emailprofessor, 'Email');
    verificarCampoUnico('nbiprofessor', nbiprofessor, 'Nº do BI');
    verificarCampoUnico('telefoneprofessor', telefoneprofessor, 'Telefone');
    verificarCampoUnico('whatsappprofessor', whatsappprofessor, 'WhatsApp');

    if (verificacoesPendentes === 0) {
        processarArquivos();
    }
});

router.put('/turma/:id', async (req, res) => {
    const { id } = req.params;
    console.log("ID recebido:", id);
    
    const { idanocurricular, idcurso, idcategoriacurso, turma, periodo, anoletivo } = req.body;
    
    if (!idanocurricular || !idcurso || !idcategoriacurso || !turma || !periodo || !anoletivo) {
        return res.status(400).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Por favor, preencha todos os campos obrigatórios"
        });
    }

    try {

        const verificarExistenciaSQL = "SELECT idperiodo FROM periodo WHERE idperiodo = ?";
        const [existe] = await conexao.promise().query(verificarExistenciaSQL, [id]);
        
        if (existe.length === 0) {
            return res.status(404).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Turma não encontrada",
                mensagem: "A turma que você está tentando editar não existe"
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
            SELECT idperiodo 
            FROM periodo 
            WHERE idanocurricular = ? 
                AND idcurso = ? 
                AND turma = ? 
                AND periodo = ? 
                AND anoletivo = ?
                AND idperiodo != ?
        `;
        const [resultadosDuplicado] = await conexao.promise().query(
            verificarDuplicadoSQL, 
            [idanocurricular, idcurso, turma, periodo, anoletivo, id]
        );
        
        if (resultadosDuplicado.length > 0) {
            return res.status(400).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Turma/Período Duplicado",
                mensagem: `Já existe outra turma "${turma}" no período "${periodo}" para este curso/ano`
            });
        }

        const updateSQL = `
            UPDATE periodo 
            SET idanocurricular = ?, 
                idcategoriacurso = ?, 
                idcurso = ?, 
                turma = ?, 
                periodo = ?, 
                anoletivo = ?
            WHERE idperiodo = ?
        `;
        const [resultados] = await conexao.promise().query(updateSQL, 
            [idanocurricular, idcategoriacurso, idcurso, turma, periodo, anoletivo, id]
        );

        const [dadosCompletos] = await conexao.promise().query(`
            SELECT 
                p.*,
                ac.anocurricular,
                c.curso,
                cc.categoriacurso
            FROM periodo p
            INNER JOIN anocurricular ac ON ac.idanocurricular = p.idanocurricular
            INNER JOIN curso c ON c.idcurso = p.idcurso
            INNER JOIN categoriacurso cc ON cc.idcategoriacurso = p.idcategoriacurso
            WHERE p.idperiodo = ?
        `, [id]);

        return res.status(200).json({
            sucesso: true,
            tipo: "sucesso",
            titulo: "Turma/Período Atualizado",
            mensagem: `Turma "${turma}" no período "${periodo}" atualizada com sucesso!`,
            dados: dadosCompletos[0]
        });

    } catch (erro) {
        console.error("Erro ao atualizar Turma/Período:", erro);
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
                mensagem: "Esta turma/período já existe para este curso/ano"
            });
        }

        return res.status(500).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Erro no servidor",
            mensagem: "Erro interno ao atualizar turma/período: " + (erro.message || "Erro desconhecido")
        });
    }
});

module.exports = router;