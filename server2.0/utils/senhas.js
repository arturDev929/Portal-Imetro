const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const SALT_ROUNDS = 10;

async function criptografarSenha(senha) {
    if (!senha) throw new Error('Senha não fornecida');
    const hash = await bcrypt.hash(senha, SALT_ROUNDS);
    return hash;
}

async function compararSenhas(senha, hash) {
    if (!senha || !hash) throw new Error('Senha ou hash não fornecidos');
    const comparacao = await bcrypt.compare(senha, hash);
    return comparacao;
}

function gerarSenhaForte(tamanho = 12) {
    const maiusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const minusculas = 'abcdefghijklmnopqrstuvwxyz';
    const numeros = '0123456789';
    const especiais = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const todos = maiusculas + minusculas + numeros + especiais;
    
    let senha = '';
    senha += maiusculas[Math.floor(Math.random() * maiusculas.length)];
    senha += minusculas[Math.floor(Math.random() * minusculas.length)];
    senha += numeros[Math.floor(Math.random() * numeros.length)];
    senha += especiais[Math.floor(Math.random() * especiais.length)];
    
    for (let i = senha.length; i < tamanho; i++) {
        senha += todos[Math.floor(Math.random() * todos.length)];
    }
    
    return senha.split('').sort(() => Math.random() - 0.5).join('');
}

function criptografarSenhaSync(senha) {
    if (!senha) throw new Error('Senha não fornecida');
    const hash = bcrypt.hashSync(senha, SALT_ROUNDS);
    return hash;
}

function compararSenhasSync(senha, hash) {
    if (!senha || !hash) throw new Error('Senha ou hash não fornecidos');
    return bcrypt.compareSync(senha, hash);
}

function gerarId() {
    return uuidv4();
}

function gerarCodigo() {
    const caracteres = '0123456789';
    let codigo = '';
    for (let i = 0; i < 8; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
}

function gerarSenhaTemporaria() {
    const caracteres = '0123456789';
    let senha = '';
    for (let i = 0; i < 8; i++) {
        senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return senha;
}

// ========== NOVAS FUNÇÕES SOLICITADAS ==========

/**
 * Função 1: Gera código de 10 dígitos onde os 4 primeiros são o ano atual
 * @param {number} tamanho - Tamanho do código (padrão: 10)
 * @returns {string} Código com ano atual + dígitos aleatórios
 */
function gerarCodigoComAno(tamanho = 10) {
    if (tamanho < 4) throw new Error('O tamanho deve ser pelo menos 4 para incluir o ano');
    
    const anoAtual = new Date().getFullYear().toString();
    const caracteres = '0123456789';
    let codigo = anoAtual;
    
    // Gera os dígitos restantes aleatórios
    for (let i = codigo.length; i < tamanho; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    
    return codigo;
}

/**
 * Função 2: Gera código de 8 dígitos onde os 4 primeiros são o ano atual
 * @returns {string} Código de 8 dígitos com ano atual + 4 dígitos aleatórios
 */
function gerarCodigoOitoDigitos() {
    const anoAtual = new Date().getFullYear().toString();
    const caracteres = '0123456789';
    let codigo = anoAtual;
    
    // Gera 4 dígitos aleatórios (totalizando 8)
    for (let i = 0; i < 4; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    
    return codigo;
}

// Versão mais específica para 10 dígitos (mantendo compatibilidade)
function gerarCodigoDezDigitos() {
    return gerarCodigoComAno(10);
}

module.exports = {
    // Funções originais
    criptografarSenha,
    compararSenhas,
    gerarSenhaForte,
    criptografarSenhaSync,
    compararSenhasSync,
    gerarId,
    gerarCodigo,
    gerarSenhaTemporaria,
    
    // Novas funções
    gerarCodigoComAno,
    gerarCodigoOitoDigitos,
    gerarCodigoDezDigitos
};