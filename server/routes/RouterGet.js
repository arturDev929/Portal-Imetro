const { Router } = require("express");
const router = Router();
const conexao = require("../infra/conexao");

// 1. Para ver as categorias registradas e editar e eliminar
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

// 2. Para ver todos os cursos registrados e editar e eliminar
router.get('/Cursos', (req, res) => {
    const sql = "SELECT *FROM curso INNER JOIN categoriacurso ON categoriacurso.idcategoriacurso = curso.idcategoriacurso ORDER BY curso ASC LIMIT 100";
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

// 3. Para ver quantos anos o curso tem e eliminares alguns anos
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

// 4. Para ver todas as disciplinas registradas e editar e eliminar
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

// 5. Para ver as disciplinas que um curso possui e poder remover elas
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

// 6. Para mostrar as turmas cadastradas e editar ou eliminar
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

// Rota para buscar uma categoria específica
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

// Rota para buscar um curso específico
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

// Rota para buscar uma disciplina específica
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

// Rota para buscar um ano curricular específico
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

// Rota para buscar um semestre específico
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

// Rota para buscar um período específico
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

// Rota para buscar professores (mantida para compatibilidade)
router.get('/Professores', (req, res) => {
    const sql = "SELECT * FROM professor ORDER BY nomeprofessor ASC";
    conexao.query(sql, (error, result) => {
        if(error){
            console.error("Erro ao buscar professores:", error);
            res.status(500).json({ 
                error: "Erro interno do servidor", 
                details: error.message 
            });
        }else{
            res.status(200).json(result);
        }
    });
});

// Rota para visualização combinada
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

// Atualize a rota /disciplinasPorCurso/:idcurso para retornar idsemestre
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
            // Se não houver resultados
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
            
            // Agrupar os resultados por ano curricular e semestre
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

// Rota para professores VINCULADOS a uma disciplina
router.get('/professorVinculado/:id', async (req,res)=>{
    const {id} = req.params;
    const sql = `
        SELECT 
            disc_prof.iddiscprof,
            professor.nomeprofessor,
            professor.fotoprofessor,
            disciplina.disciplina,
            disciplina.iddisciplina
        FROM disc_prof 
        INNER JOIN disciplina ON disc_prof.iddisciplina = disciplina.iddisciplina 
        INNER JOIN professor ON professor.idprofessor = disc_prof.idprofessor 
        WHERE disciplina.iddisciplina = ?
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
            const professoresComFoto = result.map(a =>({
                ...a,
                fotoUrl: a.fotoprofessor ? `http://localhost:8080/api/img/professores/${a.fotoprofessor}` : null
            }))
            res.status(200).json(result);
        }
    });
});

// Rota para professores NÃO VINCULADOS (disponíveis)
router.get('/professorDisponivel/:id', async (req,res)=>{
    const {id} = req.params;
    const sql = `
        SELECT 
            professor.idprofessor,
            professor.nomeprofessor,
            professor.fotoprofessor
        FROM professor
        WHERE professor.idprofessor NOT IN (
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
            res.status(200).json(result);
        }
    });
});


module.exports = router;