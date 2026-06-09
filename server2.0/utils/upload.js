const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_DIRS = {
    FUNCIONARIOS: path.join(__dirname, "../../client/src/img/funcionarios"),
    FUNCIONARIOS_DOCUMENTOS: path.join(__dirname, "../../client/src/img/funcionarios/documentos"),
    PROFESSORES: path.join(__dirname, "../../client/src/img/professores"),
    DOC_PROFESSORES: path.join(__dirname, "../../client/src/img/docprofessores")
};

const criarPastaSeNaoExistir = (pasta) => {
    if (!fs.existsSync(pasta)) {
        fs.mkdirSync(pasta, { recursive: true });
    }
};

// Inicializar todas as pastas
Object.values(UPLOAD_DIRS).forEach(pasta => {
    criarPastaSeNaoExistir(pasta);
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let pasta = UPLOAD_DIRS.PROFESSORES;
        
        // CORREÇÃO: DOC_PROFESSORES recebe TODOS os documentos (BI, certificados, diplomas, contratos)
        if (file.fieldname === "documentos" || file.fieldname === "bipdfprofessor" || 
            file.fieldname === "docprofessor" || file.fieldname === "documentoprofessor" ||
            file.fieldname === "certificadoprofessor" || file.fieldname === "diplomaprofessor" ||
            file.fieldname === "contratoprofessor") {
            pasta = UPLOAD_DIRS.DOC_PROFESSORES;
        } else if (file.fieldname === "fotoprofessor" || file.fieldname === "foto") {
            pasta = UPLOAD_DIRS.PROFESSORES;
        }
        
        criarPastaSeNaoExistir(pasta);
        cb(null, pasta);
    },
    
    filename: (req, file, cb) => {
        const extensao = path.extname(file.originalname).toLowerCase();
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        const campo = file.fieldname;
        
        const nome = `${campo}_${timestamp}_${random}${extensao}`;
        cb(null, nome);
    }
});

const fileFilter = (req, file, cb) => {
    // Fotos
    if (file.fieldname === "foto" || file.fieldname === "fotoprofessor") {
        const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Formato inválido para foto. Use JPEG, PNG, JPG, WEBP ou GIF"), false);
        }
    } 
    // TODOS os documentos vão para DOC_PROFESSORES
    else if (file.fieldname === "documentos" || file.fieldname === "bipdfprofessor" || 
             file.fieldname === "docprofessor" || file.fieldname === "documentoprofessor" ||
             file.fieldname === "certificadoprofessor" || file.fieldname === "diplomaprofessor" ||
             file.fieldname === "contratoprofessor") {
        const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Formato inválido para documento. Use PDF, JPEG, PNG ou JPG"), false);
        }
    } 
    else {
        cb(null, true);
    }
};

const uploadCombinado = multer({ 
    storage: storage,
    limits: { 
        fileSize: 10 * 1024 * 1024,  // 10MB
        files: 11 
    },
    fileFilter: fileFilter
});

const deletarArquivo = (caminhoCompleto) => {
    if (caminhoCompleto && fs.existsSync(caminhoCompleto)) {
        fs.unlinkSync(caminhoCompleto);
        return true;
    }
    return false;
};

const deletarFotoFuncionario = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(UPLOAD_DIRS.FUNCIONARIOS, nomeArquivo);
        return deletarArquivo(caminho);
    }
    return false;
};

const deletarDocumentoFuncionario = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(UPLOAD_DIRS.FUNCIONARIOS_DOCUMENTOS, nomeArquivo);
        return deletarArquivo(caminho);
    }
    return false;
};

const deletarFotoProfessor = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(UPLOAD_DIRS.PROFESSORES, nomeArquivo);
        return deletarArquivo(caminho);
    }
    return false;
};

const deletarDocumentoProfessor = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(UPLOAD_DIRS.DOC_PROFESSORES, nomeArquivo);
        return deletarArquivo(caminho);
    }
    return false;
};

const uploadProfessor = uploadCombinado.fields([
    { name: 'fotoprofessor', maxCount: 1 },
    { name: 'bipdfprofessor', maxCount: 1 },
    { name: 'certificadoprofessor', maxCount: 5 },
    { name: 'diplomaprofessor', maxCount: 5 },
    { name: 'contratoprofessor', maxCount: 3 },
    { name: 'documentoprofessor', maxCount: 10 }
]);

const uploadFuncionario = uploadCombinado.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'documentos', maxCount: 10 }
]);

module.exports = {
    UPLOAD_DIRS,
    uploadCombinado,
    uploadProfessor,
    uploadFuncionario,
    deletarFotoFuncionario,
    deletarDocumentoFuncionario,
    deletarFotoProfessor,
    deletarDocumentoProfessor,
    deletarArquivo
};