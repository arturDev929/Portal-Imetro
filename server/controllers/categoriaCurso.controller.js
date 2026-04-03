const conexao = require("../infra/conexao");
const CategoriaCurso = require("../Models/categoriacursoModel");
const atualizarCategoriaCurso = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoriacurso } = req.body;

    console.log("ID recebido:", id);
    console.log("Dados recebidos:", { categoriacurso });

    if (!id || id.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "ID da categoria é obrigatório",
      });
    }

    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        error: "ID da categoria inválido",
      });
    }

    if (!categoriacurso || categoriacurso.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "O nome da categoria é obrigatório",
      });
    }

    if (categoriacurso.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: "O nome da categoria deve ter pelo menos 2 caracteres",
      });
    }

    if (categoriacurso.trim().length > 100) {
      return res.status(400).json({
        success: false,
        error: "O nome da categoria não pode exceder 100 caracteres",
      });
    }

    const categoria = await CategoriaCurso.findByPk(id);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        error: "Categoria não encontrada",
      });
    }

    const categoriaExistente = await CategoriaCurso.findOne({
      where: {
        categoriacurso: categoriacurso.trim(),
        idcategoriacurso: { [require("sequelize").Op.ne]: id },
      },
    });

    if (categoriaExistente) {
      return res.status(400).json({
        success: false,
        error: "Já existe uma categoria com este nome",
      });
    }

    await categoria.update({
      categoriacurso: categoriacurso.trim(),
    });

    return res.status(200).json({
      success: true,
      message: "Categoria atualizada com sucesso",
      id: categoria.idcategoriacurso,
      categoriacurso: categoria.categoriacurso,
    });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return res.status(500).json({
      success: false,
      error: "Erro interno do servidor",
    });
  }
};

module.exports = { atualizarCategoriaCurso };
