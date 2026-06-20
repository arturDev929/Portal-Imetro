const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Diretórios de destino - CORRIGIDOS (removido "../" extra)
const DIR_FOTOS_FUNCIONARIO = path.join(__dirname, "../../client/src/img/funcionarios");
const DIR_DOCS_FUNCIONARIO = path.join(__dirname, "../../client/src/img/funcionarios/documentos");
const DIR_FOTOS_PROFESSOR = path.join(__dirname, "../../client/src/img/professores");
const DIR_DOCS_PROFESSOR = path.join(__dirname, "../../client/src/img/professores/documentos");

// Garantir que os diretórios existem
const diretorios = [
    DIR_FOTOS_FUNCIONARIO,
    DIR_DOCS_FUNCIONARIO,
    DIR_FOTOS_PROFESSOR,
    DIR_DOCS_PROFESSOR,
];

diretorios.forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Diretório criado: ${dir}`);
    }
});

// Log dos diretórios para debug
console.log("=== DIRETÓRIOS CONFIGURADOS ===");
console.log("Fotos Funcionários:", DIR_FOTOS_FUNCIONARIO);
console.log("Docs Funcionários:", DIR_DOCS_FUNCIONARIO);
console.log("Fotos Professores:", DIR_FOTOS_PROFESSOR);
console.log("Docs Professores:", DIR_DOCS_PROFESSOR);

const gerarNomeUnico = (arquivo) => {
    const ext = path.extname(arquivo.originalname);
    const nomeSemExt = path.basename(arquivo.originalname, ext);
    const nomeLimpo = nomeSemExt.replace(/[^a-zA-Z0-9]/g, '_');
    const nomeFinal = `${Date.now()}-${nomeLimpo}${ext}`;
    console.log(`Nome gerado para ${arquivo.originalname}: ${nomeFinal}`);
    return nomeFinal;
};

// Configurações para Funcionários
const storageFuncionario = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = DIR_DOCS_FUNCIONARIO;
        if (file.fieldname === "foto") {
            dest = DIR_FOTOS_FUNCIONARIO;
        }
        console.log(`[FUNCIONÁRIO] Salvando ${file.fieldname} em: ${dest}`);
        
        // Verificar se o diretório existe antes de salvar
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
            console.log(`Diretório criado: ${dest}`);
        }
        
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const nomeUnico = gerarNomeUnico(file);
        cb(null, nomeUnico);
    },
});

const uploadCombinado = multer({ storage: storageFuncionario });

// Configurações para Professores
const storageProfessor = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = DIR_DOCS_PROFESSOR;
        if (file.fieldname === "foto") {
            dest = DIR_FOTOS_PROFESSOR;
        }
        console.log(`[PROFESSOR] Salvando ${file.fieldname} em: ${dest}`);
        
        // Verificar se o diretório existe antes de salvar
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
            console.log(`Diretório criado: ${dest}`);
        }
        
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const nomeUnico = gerarNomeUnico(file);
        cb(null, nomeUnico);
    },
});

const uploadCombinadoProfessor = multer({ storage: storageProfessor }).fields([
    { name: "foto", maxCount: 1 },
    { name: "documentos", maxCount: 10 },
]);

// Helpers de exclusão física de arquivos
const deletarArquivo = (caminho) => {
    if (!caminho) return;
    try {
        if (fs.existsSync(caminho)) {
            fs.unlinkSync(caminho);
            console.log(`Arquivo deletado: ${caminho}`);
        } else {
            console.log(`Arquivo não encontrado para deletar: ${caminho}`);
        }
    } catch (err) {
        console.error("Erro ao deletar arquivo:", caminho, err.message);
    }
};

const deletarFotoFuncionario = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(DIR_FOTOS_FUNCIONARIO, nomeArquivo);
        console.log(`Deletando foto de funcionário: ${caminho}`);
        deletarArquivo(caminho);
    }
};

const deletarDocumentoFuncionario = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(DIR_DOCS_FUNCIONARIO, nomeArquivo);
        console.log(`Deletando documento de funcionário: ${caminho}`);
        deletarArquivo(caminho);
    }
};

const deletarFotoProfessor = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(DIR_FOTOS_PROFESSOR, nomeArquivo);
        console.log(`Deletando foto de professor: ${caminho}`);
        deletarArquivo(caminho);
    }
};

const deletarDocumentoProfessor = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(DIR_DOCS_PROFESSOR, nomeArquivo);
        console.log(`Deletando documento de professor: ${caminho}`);
        deletarArquivo(caminho);
    }
};

module.exports = {
    uploadCombinado,
    uploadCombinadoProfessor,
    deletarFotoFuncionario,
    deletarDocumentoFuncionario,
    deletarFotoProfessor,
    deletarDocumentoProfessor,
};