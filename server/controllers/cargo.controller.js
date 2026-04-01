const { CargoFuncionario } = require("../Models/cargoFuncionarioModel");

const cargosDisponiveis = async (req, res) => {
  try {
    const cargos = await CargoFuncionario.findAll({
      attributes: ["id_cargo", "cargo"],
      order: [["cargo", "ASC"]],
    });

    return res.status(200).json(cargos);

  } catch (error) {
    console.error("Erro ao buscar cargos disponíveis:", error);
    return res.status(500).json({
      error: "Erro interno do servidor",
    });
  }
};

module.exports = { cargosDisponiveis };