const { Router } = require("express");
const router = Router();
const conexao = require("../infra/conexao");
const fs = require('fs');
const path = require('path');
const bcrypt = require("bcryptjs");

router.put('/categoriaCurso/:id', (req, res) => {
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
});

router.put('/Curso/:id', (req, res) => {
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
    }
    
    if (!nomeprofessor || !nomeprofessor.trim()) {
        return res.status(400).json({ error: "Nome do professor é obrigatório" });
    }
    if (!nacionalidadeprofessor || !nacionalidadeprofessor.trim()) {
        return res.status(400).json({ error: "Nacionalidade do professor é obrigatória" });
    }
    if (!codigoprofessor || !codigoprofessor.trim()) {
        return res.status(400).json({ error: "Código do professor é obrigatório" });
    }
    if (!generoprofessor || !generoprofessor.trim()) {
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
            return res.status(400).json({ error: `${campo.nome} não pode estar vazio se for enviado` });
        }
    }

    if (emailprofessor && typeof emailprofessor === 'string' && emailprofessor.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailprofessor.trim())) {
            return res.status(400).json({ error: "Email inválido" });
        }
    }

    if (telefoneprofessor && typeof telefoneprofessor === 'string' && telefoneprofessor.trim()) {
        const telefone = telefoneprofessor.replace(/\s+/g, '');
        const telefoneRegex = /^[0-9]{9}$/;
        if (!telefoneRegex.test(telefone)) {
            return res.status(400).json({ error: "Telefone inválido. Use 9 dígitos" });
        }
    }

    if (whatsappprofessor && typeof whatsappprofessor === 'string' && whatsappprofessor.trim()) {
        const whatsapp = whatsappprofessor.replace(/\s+/g, '');
        const whatsappRegex = /^[0-9]{9}$/;
        if (!whatsappRegex.test(whatsapp)) {
            return res.status(400).json({ error: "WhatsApp inválido. Use 9 dígitos" });
        }
    }
    
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
                    errosDuplicidade.push(`Erro ao verificar ${label}`);
                } else if (results.length > 0) {
                    errosDuplicidade.push(`${label} já está em uso por outro professor`);
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
            return res.status(400).json({ error: errosDuplicidade.join('. ') });
        }
        
        let fotoFinal = null;
        let documentoFinal = null;
        
        conexao.query(
            'SELECT fotoprofessor, bipdfprofessor FROM professor WHERE idprofessor = ?',
            [id],
            (err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'Erro ao buscar dados do professor' });
                }
                
                const dadosAtuais = results[0] || {};
                fotoFinal = dadosAtuais.fotoprofessor;
                documentoFinal = dadosAtuais.bipdfprofessor;
                
                if (foto && typeof foto === 'string' && foto.trim()) {
                    if (foto.startsWith('data:image')) {
                        try {
                            const matches = foto.match(/^data:image\/([a-zA-Z]+);base64,/);
                            const extensao = matches ? matches[1] : 'jpg';
                            const timestamp = Date.now().toString().slice(-13);
                            const nomeArquivo = `professor_${numeroProfessor}_foto_${timestamp}.${extensao}`;
                            const caminhoCompleto = path.join(pastaDestino, nomeArquivo);
                            
                            const base64Data = foto.split(',')[1];
                            
                            if (base64Data) {
                                const buffer = Buffer.from(base64Data, 'base64');
                                fs.writeFileSync(caminhoCompleto, buffer);
                                fotoFinal = nomeArquivo;
                            }
                        } catch (error) {
                            console.log('Erro ao processar foto:', error);
                        }
                    } else {
                        if (foto.includes('/')) {
                            const partes = foto.split('/');
                            fotoFinal = partes[partes.length - 1];
                        } else {
                            fotoFinal = foto;
                        }
                    }
                }
                
                if (curriculo && typeof curriculo === 'string' && curriculo.trim()) {
                    const timestamp = Date.now().toString().slice(-13);
                    let extensao = 'pdf';
                    let buffer = null;
                    let nomeArquivoOriginal = null;
                    
                    if (curriculo.includes('base64')) {
                        if (curriculo.startsWith('data:application/pdf')) {
                            extensao = 'pdf';
                        } else if (curriculo.startsWith('data:application/msword')) {
                            extensao = 'doc';
                        } else if (curriculo.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
                            extensao = 'docx';
                        }
                        
                        const partes = curriculo.split(',');
                        if (partes.length > 1) {
                            buffer = Buffer.from(partes[1], 'base64');
                        }
                        
                    } else {
                        nomeArquivoOriginal = curriculo;
                        if (curriculo.includes('/')) {
                            const partes = curriculo.split('/');
                            nomeArquivoOriginal = partes[partes.length - 1];
                        }
                        
                        const partesExtensao = nomeArquivoOriginal.split('.');
                        if (partesExtensao.length > 1) {
                            extensao = partesExtensao[partesExtensao.length - 1];
                        }
                        
                        const caminhoArquivoExistente = path.join(pastaDestino, nomeArquivoOriginal);
                        
                        if (fs.existsSync(caminhoArquivoExistente)) {
                            buffer = fs.readFileSync(caminhoArquivoExistente);
                        }
                    }
                    
                    if (buffer) {
                        const novoNomeArquivo = `professor_${numeroProfessor}_bi_${timestamp}.${extensao}`;
                        const novoCaminho = path.join(pastaDestino, novoNomeArquivo);
                        
                        try {
                            fs.writeFileSync(novoCaminho, buffer);
                            documentoFinal = novoNomeArquivo;
                            
                            if (nomeArquivoOriginal && 
                                nomeArquivoOriginal !== novoNomeArquivo && 
                                fs.existsSync(path.join(pastaDestino, nomeArquivoOriginal))) {
                                fs.unlinkSync(path.join(pastaDestino, nomeArquivoOriginal));
                            }
                            
                        } catch (error) {
                            console.log('Erro ao salvar arquivo:', error);
                        }
                    }
                }
                
                atualizarProfessor(fotoFinal, documentoFinal);
            }
        );
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
            nacionalidadeprofessor || null,
            estadocivilprofessor || null,
            nomepaiprofessor || null,
            nomemaeprofessor || null,
            nbiprofessor || null,
            datanascimentoprofessor || null,
            residenciaprofessor || null,
            telefoneprofessor || null,
            whatsappprofessor || null,
            emailprofessor || null,
            anoexperienciaprofessor || null,
            titulacaoprofessor || null,
            dataadmissaoprofessor || null,
            tipocontratoprofessor || null,
            ibanprofessor || null,
            tiposanguineoprofessor || null,
            condicoesprofessor || null,
            contactoemergenciaprofessor || null,
            fotoFinal,
            documentoFinal,
            id
        ];
        
        conexao.query(query, params, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao atualizar professor' });
            }
            
            res.json({ 
                success: true, 
                message: 'Professor atualizado com sucesso',
                dados: {
                    foto: fotoFinal,
                    documento: documentoFinal
                }
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

router.put('/turma/:id', (req, res) => {
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

    const verificarExistenciaSQL = "SELECT idperiodo FROM periodo WHERE idperiodo = ?";
    
    conexao.query(verificarExistenciaSQL, [id], (erroExistencia, existe) => {
        if (erroExistencia) {
            console.error("Erro ao verificar existência:", erroExistencia);
            return res.status(500).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Erro no servidor",
                mensagem: "Erro interno do servidor"
            });
        }
        
        if (existe.length === 0) {
            return res.status(404).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Turma não encontrada",
                mensagem: "A turma que você está tentando editar não existe"
            });
        }

        const verificarAnoSQL = "SELECT idanocurricular, anocurricular FROM anocurricular WHERE idanocurricular = ?";
        
        conexao.query(verificarAnoSQL, [idanocurricular], (erroAno, resultadosAno) => {
            if (erroAno) {
                console.error("Erro ao verificar Ano:", erroAno);
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
                        WHERE idanocurricular = ? 
                            AND idcurso = ? 
                            AND turma = ? 
                            AND periodo = ? 
                            AND anoletivo = ?
                            AND idperiodo != ?
                    `;
                    
                    conexao.query(verificarDuplicadoSQL, [idanocurricular, idcurso, turma, periodo, anoletivo, id], (erroDuplicado, resultadosDuplicado) => {
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
                        
                        conexao.query(updateSQL, [idanocurricular, idcategoriacurso, idcurso, turma, periodo, anoletivo, id], (erroUpdate, resultados) => {
                            if (erroUpdate) {
                                console.error("Erro ao atualizar período:", erroUpdate);
                                
                                if (erroUpdate.code === 'ER_NO_REFERENCED_ROW_2') {
                                    return res.status(400).json({
                                        sucesso: false,
                                        tipo: "erro",
                                        titulo: "Chave estrangeira inválida",
                                        mensagem: "Uma das referências (ano curricular, curso ou categoria) não existe no sistema"
                                    });
                                }
                                
                                if (erroUpdate.code === 'ER_DUP_ENTRY') {
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
                                    mensagem: "Erro interno ao atualizar turma/período"
                                });
                            }

                            const buscaDadosSQL = `
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
                            `;
                            
                            conexao.query(buscaDadosSQL, [id], (erroBusca, dadosCompletos) => {
                                if (erroBusca) {
                                    console.error("Erro ao buscar dados completos:", erroBusca);
                                    return res.status(500).json({
                                        sucesso: false,
                                        tipo: "erro",
                                        titulo: "Erro no servidor",
                                        mensagem: "Erro interno ao buscar dados atualizados"
                                    });
                                }

                                return res.status(200).json({
                                    sucesso: true,
                                    tipo: "sucesso",
                                    titulo: "Turma/Período Atualizado",
                                    mensagem: `Turma "${turma}" no período "${periodo}" atualizada com sucesso!`,
                                    dados: dadosCompletos[0] || {
                                        idperiodo: id,
                                        idanocurricular,
                                        idcurso,
                                        idcategoriacurso,
                                        turma,
                                        periodo,
                                        anoletivo,
                                        anocurricular: resultadosAno[0].anocurricular,
                                        curso: resultadosCurso[0].curso,
                                        categoriacurso: resultadosCategoria[0].categoriacurso
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

router.put('/professor/desativar/:id', (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE professor SET estado = 'Desativado' WHERE idprofessor = ?";
    
    conexao.query(sql, [id], (error, result) => {
        if (error) {
            console.error("Erro ao desativar o professor:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            if (result.affectedRows === 0) {
                res.status(404).json({
                    error: "Professor não encontrado"
                });
            } else {
                res.status(200).json({
                    message: "Professor desativado com sucesso",
                    professoresAfetados: result.affectedRows
                });
            }
        }
    });
});

router.put('/professor/ativar/:id', (req, res) => {
    const { id } = req.params;
    const sql = "UPDATE professor SET estado = 'Ativo' WHERE idprofessor = ?";
    
    conexao.query(sql, [id], (error, result) => {
        if (error) {
            console.error("Erro ao ativar o professor:", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            if (result.affectedRows === 0) {
                res.status(404).json({
                    error: "Professor não encontrado"
                });
            } else {
                res.status(200).json({
                    message: "Professor ativado com sucesso",
                    professoresAfetados: result.affectedRows
                });
            }
        }
    });
});

router.put('/funcionario/:id', (req, res) => {
    const { id } = req.params;
    const { nome_funcionario, contacto_funcionario, bi_funcionario, cargo_funcionario, idAdm } = req.body;

    // Validações
    if (!id || id.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'ID do funcionário é obrigatório'
        });
    }

    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
            success: false,
            error: 'ID do funcionário inválido'
        });
    }

    if (!nome_funcionario || nome_funcionario.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'O nome do funcionário é obrigatório'
        });
    }

    if (!contacto_funcionario || contacto_funcionario.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'O contacto é obrigatório'
        });
    }

    if (!bi_funcionario || bi_funcionario.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'O BI é obrigatório'
        });
    }

    if (!cargo_funcionario || cargo_funcionario.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'O cargo é obrigatório'
        });
    }

    if (!idAdm) {
        return res.status(400).json({
            success: false,
            error: 'ID do administrador é obrigatório'
        });
    }

    conexao.beginTransaction((erroTransacao) => {
        if (erroTransacao) {
            console.error("Erro ao iniciar transação:", erroTransacao);
            return res.status(500).json({
                success: false,
                error: 'Erro ao iniciar transação'
            });
        }

        const checkSql = 'SELECT * FROM funcionario WHERE id_funcionario = ?';
        
        conexao.query(checkSql, [id], (checkError, checkResults) => {
            if (checkError) {
                return conexao.rollback(() => {
                    console.error('Erro ao verificar funcionário:', checkError);
                    return res.status(500).json({
                        success: false,
                        error: 'Erro ao verificar funcionário no banco de dados'
                    });
                });
            }

            if (checkResults.length === 0) {
                return conexao.rollback(() => {
                    return res.status(404).json({
                        success: false,
                        error: 'Funcionário não encontrado'
                    });
                });
            }

            const checkContactoSql = 'SELECT id_funcionario FROM funcionario WHERE contacto_funcionario = ? AND id_funcionario != ?';
            
            conexao.query(checkContactoSql, [contacto_funcionario.trim(), id], (contactoError, contactoResults) => {
                if (contactoError) {
                    return conexao.rollback(() => {
                        console.error('Erro ao verificar contacto:', contactoError);
                        return res.status(500).json({
                            success: false,
                            error: 'Erro ao verificar contacto no banco de dados'
                        });
                    });
                }

                if (contactoResults.length > 0) {
                    return conexao.rollback(() => {
                        return res.status(400).json({
                            success: false,
                            error: 'Este contacto já está em uso por outro funcionário'
                        });
                    });
                }

                const checkBISql = 'SELECT id_funcionario FROM funcionario WHERE bi_funcionario = ? AND id_funcionario != ?';
                
                conexao.query(checkBISql, [bi_funcionario.trim(), id], (BIError, BIResults) => {
                    if (BIError) {
                        return conexao.rollback(() => {
                            console.error('Erro ao verificar BI:', BIError);
                            return res.status(500).json({
                                success: false,
                                error: 'Erro ao verificar BI no banco de dados'
                            });
                        });
                    }

                    if (BIResults.length > 0) {
                        return conexao.rollback(() => {
                            return res.status(400).json({
                                success: false,
                                error: 'Este BI já está em uso por outro funcionário'
                            });
                        });
                    }

                    const updateSql = `
                        UPDATE funcionario 
                        SET nome_funcionario = ?, 
                            contacto_funcionario = ?, 
                            bi_funcionario = ?, 
                            idAdm = ? 
                        WHERE id_funcionario = ? AND estado_funcionario = 'Ativo'
                    `;
                    
                    conexao.query(updateSql, [
                        nome_funcionario.trim(),
                        contacto_funcionario.trim(),
                        bi_funcionario.trim(),
                        idAdm,
                        id
                    ], (updateError, updateResults) => {
                        if (updateError) {
                            return conexao.rollback(() => {
                                console.error('Erro ao atualizar funcionário:', updateError);
                                return res.status(500).json({
                                    success: false,
                                    error: 'Erro ao atualizar funcionário no banco de dados'
                                });
                            });
                        }

                        const buscarCargoSQL = "SELECT id_cargo FROM cargo_funcionario WHERE cargo = ?";
                        
                        conexao.query(buscarCargoSQL, [cargo_funcionario], (cargoError, cargoResult) => {
                            if (cargoError) {
                                return conexao.rollback(() => {
                                    console.error('Erro ao buscar cargo:', cargoError);
                                    return res.status(500).json({
                                        success: false,
                                        error: 'Erro ao verificar cargo no banco de dados'
                                    });
                                });
                            }

                            if (cargoResult.length === 0) {
                                return conexao.rollback(() => {
                                    return res.status(400).json({
                                        success: false,
                                        error: 'Cargo não encontrado'
                                    });
                                });
                            }

                            const id_cargo = cargoResult[0].id_cargo;

                            const updateRelacaoSQL = `
                                UPDATE cargo_funcionario_relation 
                                SET id_cargo = ? 
                                WHERE id_funcionario = ?
                            `;
                            
                            conexao.query(updateRelacaoSQL, [id_cargo, id], (relacaoError) => {
                                if (relacaoError) {
                                    return conexao.rollback(() => {
                                        console.error('Erro ao atualizar relação cargo:', relacaoError);
                                        return res.status(500).json({
                                            success: false,
                                            error: 'Erro ao atualizar cargo do funcionário'
                                        });
                                    });
                                }

                                conexao.commit((commitError) => {
                                    if (commitError) {
                                        return conexao.rollback(() => {
                                            console.error('Erro ao fazer commit:', commitError);
                                            return res.status(500).json({
                                                success: false,
                                                error: 'Erro ao finalizar transação'
                                            });
                                        });
                                    }

                                    res.status(200).json({
                                        success: true,
                                        message: 'Funcionário atualizado com sucesso',
                                        dados: {
                                            id: id,
                                            nome_funcionario: nome_funcionario.trim(),
                                            contacto_funcionario: contacto_funcionario.trim(),
                                            bi_funcionario: bi_funcionario.trim(),
                                            cargo_funcionario: cargo_funcionario,
                                            idAdm: idAdm
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

router.put('/funcionario/senha/:id', (req, res) => {
    const { id } = req.params;
    const { senha_funcionario } = req.body;

    // Validações
    if (!id || id.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'ID do funcionário é obrigatório'
        });
    }

    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
            success: false,
            error: 'ID do funcionário inválido'
        });
    }

    if (!senha_funcionario || senha_funcionario.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'A nova senha é obrigatória'
        });
    }

    if (senha_funcionario.trim().length < 4) {
        return res.status(400).json({
            success: false,
            error: 'A senha deve ter pelo menos 4 caracteres'
        });
    }

    // Verificar se o funcionário existe
    const checkSql = 'SELECT nome_funcionario FROM funcionario WHERE id_funcionario = ?';
    
    conexao.query(checkSql, [id], (checkError, checkResults) => {
        if (checkError) {
            console.error('Erro ao verificar funcionário:', checkError);
            return res.status(500).json({
                success: false,
                error: 'Erro ao verificar funcionário no banco de dados'
            });
        }

        if (checkResults.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Funcionário não encontrado'
            });
        }

        const nome_funcionario = checkResults[0].nome_funcionario;

        // Criptografar a nova senha
        bcrypt.genSalt(10, (saltError, salt) => {
            if (saltError) {
                console.error('Erro ao gerar salt:', saltError);
                return res.status(500).json({
                    success: false,
                    error: 'Erro interno de segurança'
                });
            }

            bcrypt.hash(senha_funcionario, salt, (hashError, senhaCriptografada) => {
                if (hashError) {
                    console.error('Erro ao criptografar senha:', hashError);
                    return res.status(500).json({
                        success: false,
                        error: 'Erro interno de segurança'
                    });
                }

                // Atualizar apenas a senha
                const updateSql = 'UPDATE funcionario SET senha_funcionario = ? WHERE id_funcionario = ?';
                
                conexao.query(updateSql, [senhaCriptografada, id], (updateError, updateResults) => {
                    if (updateError) {
                        console.error('Erro ao atualizar senha:', updateError);
                        return res.status(500).json({
                            success: false,
                            error: 'Erro ao atualizar senha no banco de dados'
                        });
                    }

                    if (updateResults.affectedRows === 0) {
                        return res.status(404).json({
                            success: false,
                            error: 'Funcionário não encontrado para atualização'
                        });
                    }

                    res.status(200).json({
                        success: true,
                        message: 'Senha alterada com sucesso',
                        dados: {
                            id: id,
                            nome_funcionario: nome_funcionario,
                            senha_alterada: true
                        }
                    });
                });
            });
        });
    });
});

router.put('/funcionario/desativar/:id', (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "ID do funcionário inválido" });
    }

    const checkSql = "SELECT nome_funcionario FROM funcionario WHERE id_funcionario = ? AND estado_funcionario = 'Ativo'";
    
    conexao.query(checkSql, [id], (checkError, checkResults) => {
        if (checkError) {
            console.error("Erro ao verificar funcionário:", checkError);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: checkError.message
            });
        }
        
        if (checkResults.length === 0) {
            return res.status(404).json({
                error: "Funcionário não encontrado ou já está desativado"
            });
        }

        const nome = checkResults[0].nome_funcionario;

        const sql = "UPDATE funcionario SET estado_funcionario = 'Desativado' WHERE id_funcionario = ?";
        
        conexao.query(sql, [id], (error, result) => {
            if (error) {
                console.error("Erro ao desativar funcionário:", error);
                res.status(500).json({
                    error: "Erro interno do servidor",
                    details: error.message
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: `Funcionário ${nome} desativado com sucesso`,
                    funcionario: nome,
                    affectedRows: result.affectedRows
                });
            }
        });
    });
});

router.put('/funcionario/ativar/:id', (req, res) => {
    const { id } = req.params;
    
    if (!id || isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "ID do funcionário inválido" });
    }

    const checkSql = "SELECT nome_funcionario FROM funcionario WHERE id_funcionario = ? AND estado_funcionario = 'Desativado'";
    
    conexao.query(checkSql, [id], (checkError, checkResults) => {
        if (checkError) {
            console.error("Erro ao verificar funcionário:", checkError);
            return res.status(500).json({
                error: "Erro interno do servidor",
                details: checkError.message
            });
        }
        
        if (checkResults.length === 0) {
            return res.status(404).json({
                error: "Funcionário não encontrado ou já está ativo"
            });
        }

        const nome = checkResults[0].nome_funcionario;

        const sql = "UPDATE funcionario SET estado_funcionario = 'Ativo' WHERE id_funcionario = ?";
        
        conexao.query(sql, [id], (error, result) => {
            if (error) {
                console.error("Erro ao ativar funcionário:", error);
                res.status(500).json({
                    error: "Erro interno do servidor",
                    details: error.message
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: `Funcionário ${nome} ativado com sucesso`,
                    funcionario: nome,
                    affectedRows: result.affectedRows
                });
            }
        });
    });
});

module.exports = router;