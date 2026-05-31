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

const gerarNomeArquivo = (prefixo, originalname) => {
    const extensao = path.extname(originalname);
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefixo}_${timestamp}_${random}${extensao}`;
};

const storage = (pasta) => multer.diskStorage({
    destination: (req, file, cb) => {
        criarPastaSeNaoExistir(pasta);
        cb(null, pasta);
    },
    filename: (req, file, cb) => {
        const prefixo = req.body.nome || file.fieldname;
        const nomeArquivo = gerarNomeArquivo(prefixo, file.originalname);
        cb(null, nomeArquivo);
    }
});

const fileFilterImagem = (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Formato inválido. Use JPEG, PNG, WEBP ou GIF"), false);
    }
};

const fileFilterDocumento = (req, file, cb) => {
    const allowedMimes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Formato inválido. Use PDF, JPEG ou PNG"), false);
    }
};

const uploadFuncionario = multer({
    storage: storage(UPLOAD_DIRS.FUNCIONARIOS),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilterImagem
});

const uploadFuncionarioDocumento = multer({
    storage: storage(UPLOAD_DIRS.FUNCIONARIOS_DOCUMENTOS),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilterDocumento
});

const deletarArquivo = (caminho) => {
    if (fs.existsSync(caminho)) {
        fs.unlinkSync(caminho);
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

module.exports = {
    UPLOAD_DIRS,
    uploadFuncionario,
    uploadFuncionarioDocumento,
    deletarFotoFuncionario,
    deletarDocumentoFuncionario,
    criarPastaSeNaoExistir
};