const bcrypt = require("bcrypt");

const Admimetro = require("../Models/admimetroModel");
const Funcionario = require("../Models/funcionarioModel");
const CargoFuncionario = require("../Models/cargoFuncionarioModel");
const CargoFuncionarioRelation = require("../Models/cargoFuncionarioRelationModel");

const login = async (req, res) => {
  const { numEstudante, password } = req.body;

  if (!numEstudante || !password) {
    return res.status(400).json({
      sucesso: false,
      tipo: "erro",
      titulo: "Campos obrigatórios",
      mensagem: "Preencha todos os campos!",
    });
  }

  try {
    const adm = await Admimetro.findOne({
      where: { emailadm: numEstudante },
    });

    if (adm) {
      const senhaCorreta = await bcrypt.compare(password, adm.senhaadm);

      if (senhaCorreta) {
        return res.status(200).json({
          sucesso: true,
          tipo: "sucesso",
          titulo: "Login realizado",
          mensagem: "Login realizado com sucesso!",
          tipoUsuario: "adm",
          dados: {
            id: adm.idadm,
            nome: adm.nomeadm,
            email: adm.emailadm,
            contacto: adm.contactoadm,
          },
        });
      } else {
        return res.status(401).json({
          sucesso: false,
          tipo: "erro",
          titulo: "Dados Incorretos",
          mensagem: "Dados Incorretos.",
        });
      }
    }

    const funcionario = await Funcionario.findOne({
      where: {
        bi_funcionario: numEstudante,
        estado_funcionario: "Ativo",
      },
      include: [
        {
          model: CargoFuncionario,
          through: { attributes: [] },
          attributes: ["id_cargo", "cargo"],
        },
      ],
    });

    if (!funcionario) {
      return res.status(401).json({
        sucesso: false,
        tipo: "erro",
        titulo: "Usuário não encontrado",
        mensagem: "Usuário não encontrado ou inativo.",
      });
    }

    const senhaCorreta = await bcrypt.compare(
      password,
      funcionario.senha_funcionario,
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        sucesso: false,
        tipo: "erro",
        titulo: "Dados Incorretos",
        mensagem: "Dados Incorretos.",
      });
    }

    const cargo = funcionario.CargoFuncionarios?.[0];

    let rota = "/homefuncionario";
    let tipoUsuario = "funcionario";

    if (cargo?.cargo === "Coordenador de Admissões e Matrículas") {
      rota = "/homefuncionarioM";
      tipoUsuario = "Coordenador de Admissões e Matrículas";
    }

    return res.status(200).json({
      sucesso: true,
      tipo: "sucesso",
      titulo: "Login realizado",
      mensagem: "Login realizado com sucesso!",
      tipoUsuario,
      rota,
      dados: {
        id: funcionario.id_funcionario,
        nome: funcionario.nome_funcionario,
        bi: funcionario.bi_funcionario,
        contacto: funcionario.contacto_funcionario,
        cargo: cargo?.cargo,
        id_cargo: cargo?.id_cargo,
      },
    });
  } catch (error) {
    console.error("Erro no servidor:", error);
    return res.status(500).json({
      sucesso: false,
      tipo: "erro",
      titulo: "Erro no servidor",
      mensagem: "Erro interno no servidor.",
    });
  }
};

module.exports = { login };
