const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_DIRS = {
    FUNCIONARIOS: path.join(__dirname, "../../client/src/img/funcionarios"),
    FUNCIONARIOS_DOCUMENTOS: path.join(__dirname, "../../client/src/img/funcionarios/documentos")
};

const criarPastaSeNaoExistir = (pasta) => {
    if (!fs.existsSync(pasta)) {
        fs.mkdirSync(pasta, { recursive: true });
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let pasta = UPLOAD_DIRS.FUNCIONARIOS;
        if (file.fieldname === "documentos") {
            pasta = UPLOAD_DIRS.FUNCIONARIOS_DOCUMENTOS;
        }
        criarPastaSeNaoExistir(pasta);
        cb(null, pasta);
    },
    filename: (req, file, cb) => {
        const extensao = path.extname(file.originalname);
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        const nome = `${file.fieldname}_${timestamp}_${random}${extensao}`;
        cb(null, nome);
    }
});

const uploadCombinado = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024, files: 11 },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "foto") {
            const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"];
            if (allowed.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error("Formato inválido para foto"), false);
            }
        } else if (file.fieldname === "documentos") {
            const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
            if (allowed.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error("Formato inválido para documento"), false);
            }
        } else {
            cb(null, true);
        }
    }
});

const deletarFotoFuncionario = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(UPLOAD_DIRS.FUNCIONARIOS, nomeArquivo);
        if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
    }
};

const deletarDocumentoFuncionario = (nomeArquivo) => {
    if (nomeArquivo) {
        const caminho = path.join(UPLOAD_DIRS.FUNCIONARIOS_DOCUMENTOS, nomeArquivo);
        if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
    }
};

module.exports = {
    uploadCombinado,
    deletarFotoFuncionario,
    deletarDocumentoFuncionario
};