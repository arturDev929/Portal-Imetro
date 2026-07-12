// src/infra/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ========== DIRETÓRIOS EXISTENTES ==========
const DIR_FOTOS_FUNCIONARIO = path.join(__dirname, "../../client/src/img/funcionarios");
const DIR_DOCS_FUNCIONARIO = path.join(__dirname, "../../client/src/img/funcionarios/documentos");
const DIR_FOTOS_PROFESSOR = path.join(__dirname, "../../client/src/img/professores");
const DIR_DOCS_PROFESSOR = path.join(__dirname, "../../client/src/img/professores/documentos");
const DIR_FOTOS_ALUNO = path.join(__dirname, "../../client/src/img/alunos");
const DIR_DOCS_ALUNO = path.join(__dirname, "../../client/src/img/alunos/documentos");

// ========== NOVO DIRETÓRIO PARA TÓPICOS ==========
const DIR_TOPICOS = path.join(__dirname, "../../client/src/img/topicos");

// Garantir que todos os diretórios existem
const diretorios = [
    DIR_FOTOS_FUNCIONARIO,
    DIR_DOCS_FUNCIONARIO,
    DIR_FOTOS_PROFESSOR,
    DIR_DOCS_PROFESSOR,
    DIR_FOTOS_ALUNO,
    DIR_DOCS_ALUNO,
    DIR_TOPICOS // Adicionado
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
console.log("Tópicos:", DIR_TOPICOS); // Novo log

const gerarNomeUnico = (arquivo) => {
    const ext = path.extname(arquivo.originalname);
    const nomeSemExt = path.basename(arquivo.originalname, ext);
    const nomeLimpo = nomeSemExt.replace(/[^a-zA-Z0-9]/g, '_');
    const nomeFinal = `${Date.now()}-${nomeLimpo}${ext}`;
    console.log(`Nome gerado para ${arquivo.originalname}: ${nomeFinal}`);
    return nomeFinal;
};

// ========== CONFIGURAÇÕES PARA FUNCIONÁRIOS ==========
const storageFuncionario = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = DIR_DOCS_FUNCIONARIO;
        if (file.fieldname === "foto") {
            dest = DIR_FOTOS_FUNCIONARIO;
        }
        console.log(`[FUNCIONÁRIO] Salvando ${file.fieldname} em: ${dest}`);
        
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

// ========== CONFIGURAÇÕES PARA PROFESSORES ==========
const storageProfessor = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = DIR_DOCS_PROFESSOR;
        if (file.fieldname === "foto") {
            dest = DIR_FOTOS_PROFESSOR;
        }
        console.log(`[PROFESSOR] Salvando ${file.fieldname} em: ${dest}`);
        
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

// ========== CONFIGURAÇÕES PARA ALUNOS ==========
const storageAluno = multer.diskStorage({
    destination: (req, file, cb) => {
        let dest = DIR_DOCS_ALUNO;
        if (file.fieldname === "foto") {
            dest = DIR_FOTOS_ALUNO;
        }
        console.log(`[ALUNO] Salvando ${file.fieldname} em: ${dest}`);
        
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

const uploadCombinadoAluno = multer({ storage: storageAluno }).fields([
    { name: "foto", maxCount: 1 },
    { name: "documentos", maxCount: 10 },
]);

const uploadFotoAluno = multer({ storage: storageAluno }).single("foto");

// ========== NOVA CONFIGURAÇÃO PARA TÓPICOS ==========
const storageTopico = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(`[TÓPICO] Salvando ${file.fieldname} em: ${DIR_TOPICOS}`);
        
        if (!fs.existsSync(DIR_TOPICOS)) {
            fs.mkdirSync(DIR_TOPICOS, { recursive: true });
            console.log(`Diretório criado: ${DIR_TOPICOS}`);
        }
        
        cb(null, DIR_TOPICOS);
    },
    filename: (req, file, cb) => {
        const nomeUnico = gerarNomeUnico(file);
        cb(null, nomeUnico);
    },
});

// Upload para tópicos (apenas PDF)
const uploadTopico = multer({
    storage: storageTopico,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        // Aceitar apenas PDF
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos PDF são permitidos'), false);
        }
    }
}).single('arquivo');

// Upload para tópicos com múltiplos arquivos (caso necessário)
const uploadTopicoMultiple = multer({
    storage: storageTopico,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos PDF são permitidos'), false);
        }
    }
}).array('arquivos', 5);

// ========== HELPERS DE EXCLUSÃO ==========
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

// Deletar arquivos de funcionários
const deletarFotoFuncionario = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(DIR_FOTOS_FUNCIONARIO, nomeArquivo);
        deletarArquivo(caminho);
    }
};

const deletarDocumentoFuncionario = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(DIR_DOCS_FUNCIONARIO, nomeArquivo);
        deletarArquivo(caminho);
    }
};

// Deletar arquivos de professores
const deletarFotoProfessor = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(DIR_FOTOS_PROFESSOR, nomeArquivo);
        deletarArquivo(caminho);
    }
};

const deletarDocumentoProfessor = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(DIR_DOCS_PROFESSOR, nomeArquivo);
        deletarArquivo(caminho);
    }
};

// Deletar arquivos de alunos
const deletarFotoAluno = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(DIR_FOTOS_ALUNO, nomeArquivo);
        deletarArquivo(caminho);
    }
};

const deletarDocumentoAluno = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(DIR_DOCS_ALUNO, nomeArquivo);
        deletarArquivo(caminho);
    }
};

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

// ========== NOVOS HELPERS PARA TÓPICOS ==========
const deletarTopicoArquivo = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(DIR_TOPICOS, nomeArquivo);
        deletarArquivo(caminho);
    }
};

const deletarTopicosArquivos = (arquivosNomes = []) => {
    if (Array.isArray(arquivosNomes)) {
        arquivosNomes.forEach(arquivo => {
            if (arquivo) {
                deletarTopicoArquivo(arquivo);
            }
        });
    }
};

module.exports = {
    // Uploads existentes
    uploadCombinado,
    uploadCombinadoProfessor,
    uploadCombinadoAluno,
    uploadFotoAluno,
    
    // Uploads novos para tópicos
    uploadTopico,
    uploadTopicoMultiple,
    
    // Helpers existentes
    deletarFotoFuncionario,
    deletarDocumentoFuncionario,
    deletarFotoProfessor,
    deletarDocumentoProfessor,
    deletarFotoAluno,
    deletarDocumentoAluno,
    deletarArquivosAluno,
    
    // Helpers novos para tópicos
    deletarTopicoArquivo,
    deletarTopicosArquivos,
    
    // Helpers genéricos
    deletarArquivo,
    gerarNomeUnico,
    
    // Diretórios
    DIR_FOTOS_ALUNO,
    DIR_DOCS_ALUNO,
    DIR_FOTOS_FUNCIONARIO,
    DIR_DOCS_FUNCIONARIO,
    DIR_FOTOS_PROFESSOR,
    DIR_DOCS_PROFESSOR,
    DIR_TOPICOS // Exportar diretório de tópicos
};