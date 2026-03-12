const { Router } = require("express");
const router = Router();
const conexao = require("../infra/conexao");

router.get('/totalcategoriacurso', (req,res)=>{
    const sql = "SELECT COUNT(*) as total_categorias FROM categoriacurso;";
    conexao.query(sql,(error,results)=>{
        if(error){
            console.log("Erro ao buscar categorias: ",error);
            res.status(500).json({
                erroe: "Erro interno do servidor",
                details: error.message
            });
        }else{
            res.json(results)
        }
    })
});

router.get('/totallicenciaturas', (req,res)=>{
    const sql = "SELECT COUNT(*) as total_licenciaturas FROM curso;";
    conexao.query(sql,(error,results)=>{
        if(error){
            console.log("Erro ao buscar licenciaturas: ",error);
            res.status(500).json({
                erroe: "Erro interno do servidor",
                details: error.message
            });
        }else{
            res.json(results)
        }
    })
});

router.get('/totaldisciplina', (req,res)=>{
    const sql = "SELECT COUNT(*) as total_disciplinas FROM disciplina";
    conexao.query(sql,(error,results)=>{
        if(error){
            console.log("Erro ao buscar disciplinas: ",error);
            res.status(500).json({
                erroe: "Erro interno do servidor",
                details: error.message
            });
        }else{
            res.json(results)
        }
    })
});

router.get('/dadosGraficosCategoria', (req, res) => {
    const sql = "SELECT categoriacurso.categoriacurso, COUNT(curso.idcurso) as total_cursos FROM categoriacurso LEFT JOIN curso ON categoriacurso.idcategoriacurso = curso.idcategoriacurso GROUP BY categoriacurso.idcategoriacurso, categoriacurso.categoriacurso ORDER BY total_cursos DESC LIMIT 100";
    
    conexao.query(sql, (error, results) => {
        if (error) {
            console.log("Erro ao buscar dados para gráfico: ", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.json(results);
        }
    });
});

router.get('/totalDisciplinasPorCurso', (req, res) => {
    const sql = `
        SELECT 
            c.curso,
            c.idcurso,
            COUNT(s.idsemestre) as total_disciplinas
        FROM curso c
        INNER JOIN semestre s ON c.idcurso = s.idcurso
        GROUP BY c.idcurso, c.curso
        ORDER BY total_disciplinas DESC
        LIMIT 100
    `;
    
    conexao.query(sql, (error, results) => {
        if (error) {
            console.log("Erro ao buscar total de disciplinas por curso: ", error);
            res.status(500).json({
                error: "Erro interno do servidor",
                details: error.message
            });
        } else {
            res.json(results);
        }
    });
});

router.get('/categoriaCurso', (req, res) => {
    const sql = "SELECT idcategoriacurso, categoriacurso FROM categoriacurso ORDER BY categoriacurso ASC";
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar categorias:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            res.status(200).json(result);
        }
    });
});

router.get('/Cursos', (req, res) => {
    const sql = "SELECT *FROM curso INNER JOIN categoriacurso ON categoriacurso.idcategoriacurso = curso.idcategoriacurso ORDER BY categoriacurso ASC LIMIT 100";
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar cursos:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            res.status(200).json(result);
        }
    });
});

router.get('/anosCurriculares', (req, res) => {
    const sql = "SELECT idanocurricular, anocurricular, idcurso FROM anocurricular ORDER BY anocurricular ASC";
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar anos curriculares:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            res.status(200).json(result);
        }
    });
});

router.get('/Disciplinas', (req, res) => {
    const sql = "SELECT iddisciplina, disciplina FROM disciplina ORDER BY disciplina ASC";
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar disciplinas:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            res.status(200).json(result);
        }
    });
});

router.get('/semestres', (req, res) => {
    const sql = "SELECT idsemestre, idcategoriacurso, idcurso, iddisciplina, semestre, idanocurricular FROM semestre ORDER BY semestre ASC";
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar semestres:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            res.status(200).json(result);
        }
    });
});

router.get('/periodos', (req, res) => {
    const sql = "SELECT idperiodo, idanocurricular, idcategoriacurso, idcurso, periodo, turma FROM periodo ORDER BY turma ASC";
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar períodos:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            res.status(200).json(result);
        }
    });
});

router.get('/categoriaCurso/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT idcategoriacurso, categoriacurso FROM categoriacurso WHERE idcategoriacurso = ?";
    
    conexao.query(sql, [id], (error, result) => {
        if(error){
            console.error("Erro ao buscar categoria:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            if(result.length === 0){
                res.status(404).json({ error: "Categoria não encontrada" });
            } else {
                res.status(200).json(result[0]);
            }
        }
    });
});

router.get('/curso/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT idcurso, curso, idcategoriacurso FROM curso WHERE idcurso = ?";
    
    conexao.query(sql, [id], (error, result) => {
        if(error){
            console.error("Erro ao buscar curso:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            if(result.length === 0){
                res.status(404).json({ error: "Curso não encontrado" });
            } else {
                res.status(200).json(result[0]);
            }
        }
    });
});

router.get('/disciplina/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT iddisciplina, disciplina FROM disciplina WHERE iddisciplina = ?";
    
    conexao.query(sql, [id], (error, result) => {
        if(error){
            console.error("Erro ao buscar disciplina:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            if(result.length === 0){
                res.status(404).json({ error: "Disciplina não encontrada" });
            } else {
                res.status(200).json(result[0]);
            }
        }
    });
});

router.get('/anoCurricular/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT idanocurricular, anocurricular, idcurso FROM anocurricular WHERE idcurso = ? ORDER BY anocurricular DESC LIMIT 100";
    
    conexao.query(sql, [id], (error, result) => {
        if(error){
            console.error("Erro ao buscar ano curricular:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            if(result.length === 0){
                res.status(404).json({ error: "Ano curricular não encontrado" });
            } else {
                res.status(200).json(result[0]);
            }
        }
    });
});

router.get('/semestre/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT idsemestre, idcategoriacurso, idcurso, iddisciplina, semestre, idanocurricular FROM semestre WHERE idsemestre = ?";
    
    conexao.query(sql, [id], (error, result) => {
        if(error){
            console.error("Erro ao buscar semestre:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            if(result.length === 0){
                res.status(404).json({ error: "Semestre não encontrado" });
            } else {
                res.status(200).json(result[0]);
            }
        }
    });
});

router.get('/periodo/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT idperiodo, idanocurricular, idcategoriacurso, idcurso, periodo, turma FROM periodo WHERE idperiodo = ?";
    
    conexao.query(sql, [id], (error, result) => {
        if(error){
            console.error("Erro ao buscar período:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            if(result.length === 0){
                res.status(404).json({ error: "Período não encontrado" });
            } else {
                res.status(200).json(result[0]);
            }
        }
    });
});

router.get('/ProfessoresDesativados', (req, res) => {
    const sql = "SELECT * FROM professor WHERE estado = 'Desativado' ORDER BY nomeprofessor ASC";
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar professores:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const professoresComFoto = result.map(professor =>({
                ...professor,
                fotoUrl: professor.fotoprofessor ? `${baseUrl}/api/img/professores/${professor.fotoprofessor}` : null
            }))
            res.status(200).json(professoresComFoto);
        }
    });
});
router.get('/Professores', (req, res) => {
    const sql = "SELECT * FROM professor WHERE estado = 'Ativo' ORDER BY nomeprofessor ASC";
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar professores:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const professoresComFoto = result.map(professor =>({
                ...professor,
                fotoUrl: professor.fotoprofessor ? `${baseUrl}/api/img/professores/${professor.fotoprofessor}` : null
            }))
            res.status(200).json(professoresComFoto);
        }
    });
});

router.get('/CategoriaCursosAno', (req, res) => {
    const sql = "SELECT categoriacurso.categoriacurso, categoriacurso.idcategoriacurso, curso.curso, curso.idcurso, anocurricular.anocurricular, anocurricular.idanocurricular FROM categoriacurso INNER JOIN curso ON categoriacurso.idcategoriacurso = curso.idcategoriacurso INNER JOIN anocurricular ON curso.idcurso = anocurricular.idcurso ORDER BY anocurricular.anocurricular AND curso.curso ASC LIMIT 500";
    
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar dados combinados:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            res.status(200).json(result);
        }
    });
});

router.get('/disciplinasPorCurso/:idcurso', (req, res) => {
    const { idcurso } = req.params;
    
    const sql = `
        SELECT 
            d.iddisciplina,
            d.disciplina,
            s.idsemestre,
            s.semestre,
            a.anocurricular,
            c.curso,
            cc.categoriacurso
        FROM semestre s
        INNER JOIN disciplina d ON s.iddisciplina = d.iddisciplina
        INNER JOIN anocurricular a ON s.idanocurricular = a.idanocurricular
        INNER JOIN curso c ON s.idcurso = c.idcurso
        INNER JOIN categoriacurso cc ON s.idcategoriacurso = cc.idcategoriacurso
        WHERE s.idcurso = ?
        ORDER BY a.anocurricular ASC, s.semestre ASC, d.disciplina ASC
    `;
    
    conexao.query(sql, [idcurso], (error, result) => {
        if(error){
            console.error("Erro ao buscar disciplinas do curso:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            if (result.length === 0) {
                const sqlCurso = "SELECT c.curso, cc.categoriacurso FROM curso c INNER JOIN categoriacurso cc ON c.idcategoriacurso = cc.idcategoriacurso WHERE c.idcurso = ?";
                conexao.query(sqlCurso, [idcurso], (errorCurso, resultCurso) => {
                    if (errorCurso) {
                        res.status(200).json({
                            curso: 'Curso não identificado',
                            categoria: '',
                            totalDisciplinas: 0,
                            disciplinas: {}
                        });
                    } else {
                        res.status(200).json({
                            curso: resultCurso[0]?.curso || 'Curso não identificado',
                            categoria: resultCurso[0]?.categoriacurso || '',
                            totalDisciplinas: 0,
                            disciplinas: {}
                        });
                    }
                });
                return;
            }
            
            const disciplinasAgrupadas = result.reduce((acc, disciplina) => {
                const anoKey = `Ano ${disciplina.anocurricular}`;
                
                if (!acc[anoKey]) {
                    acc[anoKey] = {};
                }
                
                const semestreKey = `Semestre ${disciplina.semestre}`;
                
                if (!acc[anoKey][semestreKey]) {
                    acc[anoKey][semestreKey] = [];
                }
                
                acc[anoKey][semestreKey].push({
                    id: disciplina.iddisciplina,
                    idsemestre: disciplina.idsemestre,
                    nome: disciplina.disciplina
                });
                
                return acc;
            }, {});
            
            res.status(200).json({
                curso: result[0]?.curso || 'Curso não encontrado',
                categoria: result[0]?.categoriacurso || '',
                totalDisciplinas: result.length,
                disciplinas: disciplinasAgrupadas
            });
        }
    });
});

router.get('/professorVinculado/:id', async (req,res)=>{
    const {id} = req.params;
    const sql = `
        SELECT 
            disc_prof.iddiscprof,
            professor.nomeprofessor,
            professor.fotoprofessor,
            professor.idprofessor,
            professor.titulacaoprofessor,
            disciplina.disciplina,
            disciplina.iddisciplina
        FROM disc_prof 
        INNER JOIN disciplina ON disc_prof.iddisciplina = disciplina.iddisciplina 
        INNER JOIN professor ON professor.idprofessor = disc_prof.idprofessor 
        WHERE disciplina.iddisciplina = ? AND estado = 'Ativo'
        ORDER BY professor.nomeprofessor ASC
    `;
    
    conexao.query(sql, [id], (error, result) => {
        if(error){
            console.error("Erro ao buscar professores vinculados:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const professoresComFoto = result.map(a =>({
                ...a,
                fotoUrl: a.fotoprofessor ? `${baseUrl}/api/img/professores/${a.fotoprofessor}` : null
            }))
            res.status(200).json(result);
        }
    });
});

router.get('/professorDisponivel/:id', async (req,res)=>{
    const {id} = req.params;
    const sql = `
        SELECT 
            professor.idprofessor,
            professor.nomeprofessor,
            professor.titulacaoprofessor,
            professor.fotoprofessor
        FROM professor
        WHERE estado = 'Ativo' AND  professor.idprofessor NOT IN (
            SELECT disc_prof.idprofessor 
            FROM disc_prof 
            WHERE disc_prof.iddisciplina = ? 
        )
        ORDER BY professor.nomeprofessor ASC
    `;
    
    conexao.query(sql, [id], (error, result) => {
        if(error){
            console.error("Erro ao buscar professores disponíveis:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const professoresComFoto = result.map(a =>({
                ...a,
                fotoUrl: a.fotoprofessor ? `${baseUrl}/api/img/professores/${a.fotoprofessor}` : null
            }))
            res.status(200).json(professoresComFoto);
        }
    });
});

router.get('/estatisticasProfessores', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as totalProfessores,
            COUNT(CASE WHEN fotoprofessor IS NOT NULL THEN 1 END) as professoresComFoto,
            COUNT(CASE WHEN titulacaoprofessor IS NOT NULL AND titulacaoprofessor != '' THEN 1 END) as professoresComTitulacao
        FROM professor WHERE estado = 'Ativo'
    `;
    
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar estatísticas de professores:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            res.status(200).json(result[0] || {});
        }
    });
});

router.get('/distribuicaoTitulacao', (req, res) => {
    const sql = `
        SELECT 
            IFNULL(titulacaoprofessor, 'Não informado') as titulacao,
            COUNT(*) as quantidade
        FROM professor  WHERE estado = 'Ativo'
        GROUP BY IFNULL(titulacaoprofessor, 'Não informado')
        ORDER BY quantidade DESC
    `;
    
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar distribuição por titulação:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            res.status(200).json(result);
        }
    });
});

router.get('/professoresPorDisciplina', (req, res) => {
    const sql = `
        SELECT 
            d.disciplina,
            d.iddisciplina,
            COUNT(dp.idprofessor) as totalProfessores,
            GROUP_CONCAT(DISTINCT p.nomeprofessor SEPARATOR ', ') as professores
        FROM disc_prof dp
        RIGHT JOIN disciplina d ON dp.iddisciplina = d.iddisciplina
        LEFT JOIN professor p ON dp.idprofessor = p.idprofessor WHERE estado = 'Ativo'
        GROUP BY d.iddisciplina, d.disciplina
        ORDER BY totalProfessores DESC, d.disciplina ASC
    `;
    
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar professores por disciplina:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            res.status(200).json(result);
        }
    });
});

router.get('/disciplinasMaisMinistradas', (req, res) => {
    const sql = `
        SELECT 
            d.disciplina,
            COUNT(DISTINCT dp.idprofessor) as totalProfessores,
            GROUP_CONCAT(DISTINCT p.nomeprofessor SEPARATOR ', ') as professoresNomes
        FROM disc_prof dp
        INNER JOIN disciplina d ON dp.iddisciplina = d.iddisciplina
        INNER JOIN professor p ON dp.idprofessor = p.idprofessor WHERE estado = 'Ativo'
        GROUP BY d.iddisciplina, d.disciplina
        HAVING totalProfessores > 0
        ORDER BY totalProfessores DESC
        LIMIT 10
    `;
    
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar disciplinas mais ministradas:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            res.status(200).json(result);
        }
    });
});

router.get('/professoresMaisAtivos', (req, res) => {
    const sql = `
        SELECT 
            p.idprofessor,
            p.nomeprofessor,
            p.titulacaoprofessor,
            p.fotoprofessor,
            COUNT(DISTINCT dp.iddisciplina) as totalDisciplinas,
            GROUP_CONCAT(DISTINCT d.disciplina SEPARATOR ', ') as disciplinas
        FROM disc_prof dp
        INNER JOIN professor p ON dp.idprofessor = p.idprofessor
        INNER JOIN disciplina d ON dp.iddisciplina = d.iddisciplina 
        WHERE estado = 'Ativo'
        GROUP BY p.idprofessor, p.nomeprofessor, p.titulacaoprofessor
        HAVING totalDisciplinas > 0
        ORDER BY totalDisciplinas DESC
        LIMIT 10
    `;
    
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar professores mais ativos:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const professoresComFoto = result.map(a =>({
                ...a,
                fotoUrl: a.fotoprofessor ? `${baseUrl}/api/img/professores/${a.fotoprofessor}` : null
            }))
            res.status(200).json(professoresComFoto);
        }
    });
});

router.get('/professoresSemDisciplinas', (req, res) => {
    const sql = `
        SELECT 
            p.idprofessor,
            p.nomeprofessor,
            p.titulacaoprofessor
        FROM professor p
        LEFT JOIN disc_prof dp ON p.idprofessor = dp.idprofessor
        WHERE dp.idprofessor IS NULL AND estado = 'Ativo'
        ORDER BY p.nomeprofessor ASC
    `;
    
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar professores sem disciplinas:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            res.status(200).json(result);
        }
    });
});

router.get('/professorVinculadoDisciplinas/:id', async (req, res) => {
    const { id } = req.params;
    
    const sql = `
        SELECT 
            disc_prof.iddiscprof,
            disciplina.disciplina,
            disciplina.iddisciplina
        FROM disc_prof 
        INNER JOIN disciplina ON disc_prof.iddisciplina = disciplina.iddisciplina 
        WHERE disc_prof.idprofessor = ?
        ORDER BY disciplina.disciplina ASC
    `;
    
    conexao.query(sql, [id], (error, result) => {
        if (error) {
            console.error("Erro ao buscar disciplinas vinculadas:", error);
            return res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }
        
        res.status(200).json(result);
    });
});

router.get('/InformacoesProfessor/:id', async (req, res) => {
    const { id } = req.params;
    
    const sqlProfessor = `
        SELECT 
            p.idprofessor,
            p.nomeprofessor,
            p.fotoprofessor,
            p.codigoprofessor,
            p.generoprofessor,
            p.nacionalidadeprofessor,
            p.estadocivilprofessor,
            p.nomepaiprofessor,
            p.nomemaeprofessor,
            p.nbiprofessor,
            p.datanascimentoprofessor,
            p.bipdfprofessor,
            p.residenciaprofessor,
            p.telefoneprofessor,
            p.whatsappprofessor,
            p.emailprofessor,
            p.anoexperienciaprofessor,
            p.titulacaoprofessor,
            p.dataadmissaoprofessor,
            p.tiposanguineoprofessor,
            p.ibanprofessor,
            p.condicoesprofessor,
            contactoemergenciaprofessor
        FROM professor p
        WHERE p.idprofessor = ?
    `;
    
    const sqlDisciplinas = `
        SELECT 
            disciplina.iddisciplina,
            disciplina.disciplina
        FROM disc_prof 
        INNER JOIN disciplina ON disc_prof.iddisciplina = disciplina.iddisciplina 
        WHERE disc_prof.idprofessor = ?
        ORDER BY disciplina.disciplina ASC
    `;
    
    conexao.query(sqlProfessor, [id], (error, professorResult) => {
        if (error) {
            console.error("Erro ao buscar dados do professor:", error);
            return res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }
        
        if (professorResult.length === 0) {
            return res.status(404).json({ error: "Professor não encontrado" });
        }
        
        const professor = professorResult[0];
        
        conexao.query(sqlDisciplinas, [id], (error, disciplinasResult) => {
            if (error) {
                console.error("Erro ao buscar disciplinas:", error);
                return res.status(500).json({ 
                    error: "Erro interno do servidor", 
                    details: error.message 
                });
            }
            
            let curriculoUrl = null;
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            if (professor.bipdfprofessor) {
                curriculoUrl = `${baseUrl}/api/img/professores/${professor.bipdfprofessor}`;
            }
            
            const professorCompleto = {
                ...professor,
                fotoUrl: professor.fotoprofessor ? 
                    `${baseUrl}/api/img/professores/${professor.fotoprofessor}` : 
                    '/default-avatar.png',
                curriculoUrl: curriculoUrl,
                datanascimentoFormatada: professor.datanascimentoprofessor ? 
                    new Date(professor.datanascimentoprofessor).toISOString().split('T')[0] : 
                    null,
                dataadmissaoFormatada: professor.dataadmissaoprofessor ? 
                    new Date(professor.dataadmissaoprofessor).toISOString().split('T')[0] : 
                    null,
                disciplinas: disciplinasResult
            };
            
            res.status(200).json(professorCompleto);
        });
    });
});

router.get('/turmas', async (req,res)=>{
    const sql = `SELECT p.idperiodo, p.periodo, p.turma, p.anoletivo, ct.categoriacurso, c.curso, a.anocurricular FROM periodo p INNER JOIN categoriacurso ct ON p.idcategoriacurso = ct.idcategoriacurso INNER JOIN curso c ON p.idcurso = c.idcurso INNER JOIN anocurricular a ON p.idanocurricular = a.idanocurricular ORDER BY (p.anoletivo IS NOT NULL AND a.anocurricular IS NOT NULL) DESC,p.anoletivo ASC,a.anocurricular ASC,p.turma ASC LIMIT 10000`;
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar professores sem disciplinas:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            res.status(200).json(result);
        }
    });
})

router.get('/estatisticasProfessoresDesativados', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as totalProfessoresDesativados,
            COUNT(CASE WHEN titulacaoprofessor IS NOT NULL AND titulacaoprofessor != '' THEN 1 END) as desativadosComTitulacao
        FROM professor WHERE estado = 'Desativado'
    `;
    
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar estatísticas de professores desativados:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            res.status(200).json(result[0] || {});
        }
    });
});

router.get('/professoresDesativados', (req, res) => {
    const sql = "SELECT * FROM professor WHERE estado = 'Desativado' ORDER BY nomeprofessor ASC";
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar professores desativados:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const professoresComFoto = result.map(professor =>({
                ...professor,
                fotoUrl: professor.fotoprofessor ? `${baseUrl}/api/img/professores/${professor.fotoprofessor}` : null
            }))
            res.status(200).json(professoresComFoto);
        }
    });
});

router.get('/distribuicaoTitulacaoDesativados', (req, res) => {
    const sql = `
        SELECT 
            IFNULL(titulacaoprofessor, 'Não informado') as titulacao,
            COUNT(*) as quantidade
        FROM professor
        WHERE estado = 'Desativado'
        GROUP BY IFNULL(titulacaoprofessor, 'Não informado')
        ORDER BY quantidade DESC
    `;
    
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar distribuição por titulação de desativados:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            res.status(200).json(result);
        }
    });
});

router.get('/estatisticasFuncionarios', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as totalFuncionarios,
            COUNT(CASE WHEN bi_funcionario IS NOT NULL AND bi_funcionario != '' THEN 1 END) as funcionariosComBI,
            COUNT(CASE WHEN contacto_funcionario IS NOT NULL AND contacto_funcionario != '' THEN 1 END) as funcionariosComContacto
        FROM funcionario 
        WHERE estado_funcionario = 'Ativo'
    `;
    
    conexao.query(sql, (error, result) => {
        if(error) {
            console.error("Erro ao buscar estatísticas de funcionários:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        } else {
            res.status(200).json(result[0] || {});
        }
    });
});

router.get('/estatisticasFuncionariosDesativados', (req, res) => {
    const sql = "SELECT COUNT(*) as totalFuncionariosDesativados FROM funcionario WHERE estado_funcionario = 'Desativado'";
    
    conexao.query(sql, (error, result) => {
        if(error) {
            console.error("Erro ao buscar estatísticas de funcionários desativados:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        } else {
            res.status(200).json(result[0] || {});
        }
    });
});

router.get('/funcionarios', (req, res) => {
    const sql = "SELECT * FROM funcionario INNER JOIN cargo_funcionario_relation ON funcionario.id_funcionario = cargo_funcionario_relation.id_funcionario INNER JOIN cargo_funcionario ON cargo_funcionario.id_cargo = cargo_funcionario_relation.id_cargo WHERE funcionario.estado_funcionario = 'Ativo' ORDER BY funcionario.nome_funcionario ASC";
    
    conexao.query(sql, (error, result) => {
        if(error) {
            console.error("Erro ao buscar funcionários:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        } else {
            res.status(200).json(result);
        }
    });
});

router.get('/funcionariosDesativados', (req, res) => {
    const sql = "SELECT * FROM funcionario INNER JOIN cargo_funcionario_relation ON funcionario.id_funcionario = cargo_funcionario_relation.id_funcionario INNER JOIN cargo_funcionario ON cargo_funcionario.id_cargo = cargo_funcionario_relation.id_cargo WHERE funcionario.estado_funcionario = 'Desativado' ORDER BY funcionario.nome_funcionario ASC";
    
    conexao.query(sql, (error, result) => {
        if(error) {
            console.error("Erro ao buscar funcionários desativados:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        } else {
            res.status(200).json(result);
        }
    });
});

router.get('/funcionario/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM funcionario INNER JOIN cargo_funcionario_relation ON funcionario.id_funcionario = cargo_funcionario_relation.id_funcionario INNER JOIN cargo_funcionario ON cargo_funcionario.id_cargo = cargo_funcionario_relation.id_cargo WHERE funcionario.id_funcionario = ?";
    
    conexao.query(sql, [id], (error, result) => {
        if(error) {
            console.error("Erro ao buscar funcionário:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        } else {
            if(result.length === 0) {
                res.status(404).json({ error: "Funcionário não encontrado" });
            } else {
                res.status(200).json(result[0]);
            }
        }
    });
});

router.get('/funcionariosPorCargo/:id_cargo', (req, res) => {
    const { id_cargo } = req.params;
    const sql = "SELECT f.*, cf.cargo FROM funcionario f INNER JOIN cargo_funcionario_relation cfr ON f.id_funcionario = cfr.id_funcionario INNER JOIN cargo_funcionario cf ON cf.id_cargo = cfr.id_cargo WHERE cf.id_cargo = ? AND f.estado_funcionario = 'Ativo' ORDER BY f.nome_funcionario ASC";
    
    conexao.query(sql, [id_cargo], (error, result) => {
        if(error) {
            console.error("Erro ao buscar funcionários por cargo:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        } else {
            res.status(200).json(result);
        }
    });
});

router.get('/dashboardFuncionarios', (req, res) => {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM funcionario WHERE estado_funcionario = 'Ativo') as ativos,
            (SELECT COUNT(*) FROM funcionario WHERE estado_funcionario = 'Desativado') as desativados,
            (SELECT COUNT(*) FROM funcionario) as total
    `;
    
    conexao.query(sql, (error, result) => {
        if(error) {
            console.error("Erro ao buscar dashboard de funcionários:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        } else {
            const dados = result[0] || { ativos: 0, desativados: 0, total: 0 };
            const total = dados.total || 1;
            const percentAtivos = ((dados.ativos / total) * 100).toFixed(1);
            const percentDesativados = ((dados.desativados / total) * 100).toFixed(1);
            
            res.status(200).json({
                ...dados,
                percentAtivos,
                percentDesativados,
                dadosGrafico: [
                    { nome: 'Ativos', valor: dados.ativos, cor: '#003366' },
                    { nome: 'Desativados', valor: dados.desativados, cor: '#DC143C' }
                ]
            });
        }
    });
});

router.get('/cargosFuncionarios', (req, res) => {
    const sql = `
        SELECT 
            cargo_funcionario.cargo as cargo,
            COUNT(*) as quantidade
        FROM funcionario 
        INNER JOIN cargo_funcionario_relation ON funcionario.id_funcionario = cargo_funcionario_relation.id_funcionario 
        INNER JOIN cargo_funcionario ON cargo_funcionario.id_cargo = cargo_funcionario_relation.id_cargo
        WHERE estado_funcionario = 'Ativo'
        GROUP BY cargo_funcionario.cargo
        ORDER BY quantidade DESC LIMIT 100
    `;
    
    conexao.query(sql, (error, result) => {
        if(error) {
            console.error("Erro ao buscar cargos de funcionários:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        } else {
            res.status(200).json(result);
        }
    });
});

router.get('/cargosDisponiveis', (req, res) => {
    const sql = "SELECT id_cargo, cargo FROM cargo_funcionario ORDER BY cargo ASC";
    
    conexao.query(sql, (error, result) => {
        if(error) {
            console.error("Erro ao buscar cargos disponíveis:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        } else {
            res.status(200).json(result);
        }
    });
});
module.exports = router;