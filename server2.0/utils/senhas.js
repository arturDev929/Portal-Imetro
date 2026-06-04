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

module.exports = {
    criptografarSenha,
    compararSenhas,
    gerarSenhaForte,
    criptografarSenhaSync,
    compararSenhasSync,
    gerarId,
    gerarCodigo,
    gerarSenhaTemporaria
};