const conexao = require("../infra/conexao");
const Curso = require("../Models/cursoModel");
const { Op } = require("sequelize");
const CategoriaCurso = require("../Models/categoriacursoModel");

const atualizarCurso = async (req, res) => {
  try {
    const { id } = req.params;
    const { curso, idcategoriacurso } = req.body;

    console.log("ID do curso recebido:", id);
    console.log("Dados recebidos:", { curso, idcategoriacurso });

    if (!id || id.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "ID do curso é obrigatório",
      });
    }

    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID do curso inválido",
      });
    }

    if (!curso || curso.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "O nome do curso é obrigatório",
      });
    }

    if (curso.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "O nome do curso deve ter pelo menos 2 caracteres",
      });
    }

    if (curso.trim().length > 100) {
      return res.status(400).json({
        success: false,
        error: "O nome do curso não pode exceder 100 caracteres",
      });
    }

    if (isNaN(idcategoriacurso) || parseInt(idcategoriacurso) <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID do departamento inválido",
      });
    }

    const cursoExistente = await Curso.findByPk(id);

    if (!cursoExistente) {
      return res.status(404).json({
        success: false,
        error: "Curso não encontrado",
      });
    }

    const categoria = await CategoriaCurso.findByPk(idcategoriacurso);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        error: "Departamento não encontrado",
      });
    }

    const cursoDuplicado = await Curso.findOne({
      where: {
        curso: curso.trim(),
        idcurso: { [Op.ne]: id },
      },
    });

    if (cursoDuplicado) {
      return res.status(400).json({
        success: false,
        error: "Já existe um curso com este nome",
      });
    }

    await cursoExistente.update({
      curso: curso.trim(),
      idcategoriacurso,
    });

    return res.status(200).json({
      success: true,
      message: "Curso atualizado com sucesso",
      id: cursoExistente.idcurso,
      curso: cursoExistente.curso,
      idcategoriacurso: cursoExistente.idcategoriacurso,
    });
  } catch (error) {
    console.error("Erro ao atualizar curso:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
};

module.exports = { atualizarCurso };
