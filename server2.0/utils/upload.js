const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Diretórios de destino - CORRIGIDOS (removido "../" extra)
const DIR_FOTOS_FUNCIONARIO = path.join(__dirname, "../../client/src/img/funcionarios");
const DIR_DOCS_FUNCIONARIO = path.join(__dirname, "../../client/src/img/funcionarios/documentos");
const DIR_FOTOS_PROFESSOR = path.join(__dirname, "../../client/src/img/professores");
const DIR_DOCS_PROFESSOR = path.join(__dirname, "../../client/src/img/professores/documentos");
const DIR_FOTOS_ALUNO = path.join(__dirname, "../../client/src/img/alunos");
const DIR_DOCS_ALUNO = path.join(__dirname, "../../client/src/img/alunos/documentos");

// Garantir que os diretórios existem
const diretorios = [
    DIR_FOTOS_FUNCIONARIO,
    DIR_DOCS_FUNCIONARIO,
    DIR_FOTOS_PROFESSOR,
    DIR_DOCS_PROFESSOR,
    DIR_FOTOS_ALUNO,
    DIR_DOCS_ALUNO
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
console.log("Fotos Alunos:", DIR_FOTOS_ALUNO);
console.log("Docs Alunos:", DIR_DOCS_ALUNO);

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

// ========== NOVAS CONFIGURAÇÕES PARA ALUNOS ==========
// Configurações para Alunos (mesma estrutura de funcionários e professores)
const storageAluno = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = DIR_DOCS_ALUNO;
        if (file.fieldname === "foto") {
            dest = DIR_FOTOS_ALUNO;
        }
        console.log(`[ALUNO] Salvando ${file.fieldname} em: ${dest}`);
        
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

// Upload combinado para alunos (foto + documentos)
const uploadCombinadoAluno = multer({ storage: storageAluno }).fields([
    { name: "foto", maxCount: 1 },
    { name: "documentos", maxCount: 10 },
]);

// Upload apenas de foto para aluno (para compatibilidade)
const uploadFotoAluno = multer({ storage: storageAluno }).single("foto");

// ========== HELPERS DE EXCLUSÃO ==========
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

// ========== NOVOS HELPERS PARA ALUNOS ==========
const deletarFotoAluno = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(DIR_FOTOS_ALUNO, nomeArquivo);
        console.log(`Deletando foto de aluno: ${caminho}`);
        deletarArquivo(caminho);
    }
};

const deletarDocumentoAluno = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(DIR_DOCS_ALUNO, nomeArquivo);
        console.log(`Deletando documento de aluno: ${caminho}`);
        deletarArquivo(caminho);
    }
};

// Função para deletar todos os arquivos de um aluno
const deletarArquivosAluno = (fotoNome, documentosNomes = []) => {
    if (fotoNome) {
        deletarFotoAluno(fotoNome);
    }
    if (Array.isArray(documentosNomes)) {
        documentosNomes.forEach(doc => {
            if (doc) {
                deletarDocumentoAluno(doc);
            }
        });
    }
};

module.exports = {
    // Uploads existentes
    uploadCombinado,
    uploadCombinadoProfessor,
    
    // Uploads novos para alunos
    uploadCombinadoAluno,
    uploadFotoAluno,
    
    // Helpers existentes
    deletarFotoFuncionario,
    deletarDocumentoFuncionario,
    deletarFotoProfessor,
    deletarDocumentoProfessor,
    
    // Helpers novos para alunos
    deletarFotoAluno,
    deletarDocumentoAluno,
    deletarArquivosAluno,
    
    // Helpers genéricos
    deletarArquivo,
    gerarNomeUnico,
    
    // Exportar diretórios para uso externo
    DIR_FOTOS_ALUNO,
    DIR_DOCS_ALUNO,
    DIR_FOTOS_FUNCIONARIO,
    DIR_DOCS_FUNCIONARIO,
    DIR_FOTOS_PROFESSOR,
    DIR_DOCS_PROFESSOR
};