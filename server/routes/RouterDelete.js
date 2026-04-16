const { Router } = require("express");
const router = Router();
const sequelize = require("../infra/conexao");
const { Op } = require("sequelize");


const CategoriaCurso = require("../Models/categoriacursoModel");
const Curso = require("../Models/cursoModel");
const AnoCurricular = require("../Models/anoCurricularModel");
const Semestre = require("../Models/semestreModel");
const Disciplina = require("../Models/disciplinaModel");
const DiscProf = require("../Models/disc_profModel");
const Periodo = require("../Models/periodoModel");
const Funcionario = require("../Models/funcionarioModel");
const CargoFuncionarioRelation = require("../Models/cargoFuncionarioRelationModel");

// ========== DELETE CATEGORIA ==========
router.delete('/categoriaCurso/:id', async (req, res) => {
    const { id } = req.params;
    console.log("Tentando deletar categoria ID:", id);

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

    try {
        // Verificar se categoria existe
        const categoria = await CategoriaCurso.findByPk(id, {
            attributes: ['idcategoriacurso', 'categoriacurso'],
            raw: true
        });

        if (!categoria) {
            return res.status(404).json({
                success: false,
                error: 'Categoria não encontrada'
            });
        }

        // Verificar cursos vinculados
        const cursosVinculados = await Curso.count({
            where: { idcategoriacurso: id }
        });

        if (cursosVinculados > 0) {
            return res.status(400).json({
                success: false,
                error: `Não é possível excluir a categoria: A categoria "${categoria.categoriacurso}" possui ${cursosVinculados} curso(s) vinculado(s). Remova os cursos primeiro.`,
            });
        }

        // Deletar categoria
        const deleteResult = await CategoriaCurso.destroy({
            where: { idcategoriacurso: id }
        });

        if (deleteResult === 0) {
            return res.status(404).json({
                success: false,
                error: 'Categoria não encontrada para exclusão'
            });
        }

        res.status(200).json({
            success: true,
            message: `Categoria "${categoria.categoriacurso}" excluída com sucesso`,
            nomeExcluido: categoria.categoriacurso,
            affectedRows: deleteResult
        });

    } catch (error) {
        console.error('Erro ao deletar categoria:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao excluir categoria do banco de dados',
            details: error.message
        });
    }
});

// ========== DELETE CURSO ==========
router.delete('/curso/:id', async (req, res) => {
    const { id } = req.params;
    console.log("Tentando deletar curso ID:", id);

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

    try {
        // Verificar se curso existe
        const curso = await Curso.findByPk(id, {
            attributes: ['idcurso', 'curso'],
            raw: true
        });

        if (!curso) {
            return res.status(404).json({
                success: false,
                error: 'Curso não encontrado'
            });
        }

        // Verificar semestres vinculados
        const semestresVinculados = await Semestre.count({
            where: { idcurso: id }
        });

        if (semestresVinculados > 0) {
            return res.status(400).json({
                success: false,
                error: `Não é possível excluir o curso "${curso.curso}" pois possui ${semestresVinculados} disciplina(s) vinculada(s).`
            });
        }

        // Verificar anos curriculares vinculados
        const anosVinculados = await AnoCurricular.count({
            where: { idcurso: id }
        });

        if (anosVinculados > 0) {
            return res.status(400).json({
                success: false,
                error: `Não é possível excluir o curso "${curso.curso}" pois possui ${anosVinculados} ano(s) curricular(es) vinculado(s).`
            });
        }

        // Deletar curso
        const deleteResult = await Curso.destroy({
            where: { idcurso: id }
        });

        if (deleteResult === 0) {
            return res.status(404).json({
                success: false,
                error: 'Curso não encontrado para exclusão'
            });
        }

        res.status(200).json({
            success: true,
            message: `Curso "${curso.curso}" excluído com sucesso`,
            nomeExcluido: curso.curso,
            affectedRows: deleteResult
        });

    } catch (error) {
        console.error('Erro ao deletar curso:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao excluir curso do banco de dados',
            details: error.message
        });
    }
});

// ========== DELETE ANO CURRICULAR ==========
router.delete('/anocurricular/:id', async (req, res) => {
    const { id } = req.params;
    console.log("Tentando deletar ano curricular ID:", id);

    if (!id || id.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'ID do ano curricular é obrigatório'
        });
    }

    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
            success: false,
            error: 'ID do ano curricular inválido'
        });
    }

    try {
        // Verificar se ano curricular existe com dados do curso
        const anoCurricular = await AnoCurricular.findOne({
            where: { idanocurricular: id },
            include: [{
                model: Curso,
                attributes: ['curso']
            }],
            attributes: ['idanocurricular', 'anocurricular'],
            raw: true,
            nest: true
        });

        if (!anoCurricular) {
            return res.status(404).json({
                success: false,
                error: 'Ano curricular não encontrado'
            });
        }

        // Verificar semestres vinculados
        const semestresVinculados = await Semestre.count({
            where: { idanocurricular: id }
        });

        if (semestresVinculados > 0) {
            return res.status(400).json({
                success: false,
                error: `Não é possível excluir o ano curricular "${anoCurricular.anocurricular}" pois possui ${semestresVinculados} semestre(s) vinculado(s).`
            });
        }

        // Deletar ano curricular
        const deleteResult = await AnoCurricular.destroy({
            where: { idanocurricular: id }
        });

        if (deleteResult === 0) {
            return res.status(404).json({
                success: false,
                error: 'Ano curricular não encontrado para exclusão'
            });
        }

        res.status(200).json({
            success: true,
            message: `Ano curricular "${anoCurricular.anocurricular}" do curso "${anoCurricular.Curso?.curso || 'desconhecido'}" excluído com sucesso`,
            anoExcluido: anoCurricular.anocurricular,
            curso: anoCurricular.Curso?.curso || 'desconhecido',
            affectedRows: deleteResult
        });

    } catch (error) {
        console.error('Erro ao deletar ano curricular:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao excluir ano curricular do banco de dados',
            details: error.message
        });
    }
});

// ========== DELETE DISCIPLINA DO SEMESTRE ==========
router.delete('/disciplinaSemestre/:idsemestre', async (req, res) => {
    const { idsemestre } = req.params;

    try {
        const deleteResult = await Semestre.destroy({
            where: { idsemestre: idsemestre }
        });

        if (deleteResult === 0) {
            return res.status(404).json({ 
                error: "Disciplina não encontrada no semestre" 
            });
        }

        res.status(200).json({
            message: "Disciplina removida do semestre com sucesso",
            affectedRows: deleteResult
        });

    } catch (error) {
        console.error("Erro ao excluir disciplina do semestre:", error);
        res.status(500).json({
            error: "Erro interno do servidor",
            details: error.message
        });
    }
});

// ========== DELETE DISCIPLINA (com cascade) ==========
router.delete('/disciplina/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Primeiro, deletar relações na tabela disc_prof (se houver)
        await DiscProf.destroy({
            where: { iddisciplina: id }
        });

        // Deletar semestres relacionados
        const semestresDeletados = await Semestre.destroy({
            where: { iddisciplina: id }
        });

        console.log(`Semestres deletados: ${semestresDeletados}`);

        // Deletar a disciplina
        const disciplinaDeletada = await Disciplina.destroy({
            where: { iddisciplina: id }
        });

        if (disciplinaDeletada === 0) {
            return res.status(404).json({
                error: "Disciplina não encontrada"
            });
        }

        res.status(200).json({
            message: "Disciplina deletada com Sucesso",
            disciplinaAfetada: disciplinaDeletada,
            semestresAfetados: semestresDeletados
        });

    } catch (error) {
        console.error("Erro ao excluir a disciplina:", error);
        res.status(500).json({
            error: "Erro interno do servidor",
            details: error.message
        });
    }
});

// ========== DESVINCULAR PROFESSOR DA DISCIPLINA ==========
router.delete('/desvincularProfessor/:iddisciplina/:idprofessor', async (req, res) => {
    const { iddisciplina, idprofessor } = req.params;

    try {
        const deleteResult = await DiscProf.destroy({
            where: {
                idprofessor: idprofessor,
                iddisciplina: iddisciplina
            }
        });

        if (deleteResult === 0) {
            return res.status(404).json({
                error: "Vínculo entre professor e disciplina não encontrado"
            });
        }

        res.status(200).json({
            message: "Professor desvinculado com sucesso",
            professoresAfetados: deleteResult
        });

    } catch (error) {
        console.error("Erro ao desvincular professor:", error);
        res.status(500).json({
            error: "Erro interno do servidor",
            details: error.message
        });
    }
});

// ========== DELETE TURMA (PERÍODO) ==========
router.delete('/turma/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deleteResult = await Periodo.destroy({
            where: { idperiodo: id }
        });

        if (deleteResult === 0) {
            return res.status(404).json({
                error: "Turma não encontrada"
            });
        }

        res.status(200).json({
            message: "Turma excluída com sucesso",
            affectedRows: deleteResult
        });

    } catch (error) {
        console.error("Erro ao excluir turma:", error);
        res.status(500).json({
            error: "Erro interno do servidor",
            details: error.message
        });
    }
});

// ========== DELETE FUNCIONÁRIO PERMANENTE (apenas desativados) ==========
router.delete('/funcionario/permanent/:id', async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "ID do funcionário inválido" });
    }

    try {
        // Verificar se funcionário existe e está desativado
        const funcionario = await Funcionario.findOne({
            where: {
                id_funcionario: id,
                estado_funcionario: 'Desativado'
            },
            attributes: ['id_funcionario', 'nome_funcionario'],
            raw: true
        });

        if (!funcionario) {
            return res.status(400).json({
                error: "Funcionário não encontrado ou não está desativado. Apenas funcionários desativados podem ser excluídos permanentemente."
            });
        }

        // Deletar relações com cargos primeiro
        await CargoFuncionarioRelation.destroy({
            where: { id_funcionario: id }
        });

        // Deletar funcionário
        const deleteResult = await Funcionario.destroy({
            where: {
                id_funcionario: id,
                estado_funcionario: 'Desativado'
            }
        });

        if (deleteResult === 0) {
            return res.status(404).json({
                error: "Funcionário não encontrado para exclusão"
            });
        }

        res.status(200).json({
            success: true,
            message: `Funcionário ${funcionario.nome_funcionario} excluído permanentemente com sucesso`,
            nomeExcluido: funcionario.nome_funcionario,
            affectedRows: deleteResult
        });

    } catch (error) {
        console.error("Erro ao excluir funcionário permanentemente:", error);
        res.status(500).json({
            error: "Erro interno do servidor",
            details: error.message
        });
    }
});

module.exports = router;