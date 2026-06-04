const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            sucesso: false,
            tipo: "erro",
            titulo: "Acesso negado",
            mensagem: "Token de autenticação não fornecido."
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({
                sucesso: false,
                tipo: "erro",
                titulo: "Token inválido",
                mensagem: "Token de autenticação inválido ou expirado."
            });
        }
        req.user = user;
        next();
    });
};

module.exports = authMiddleware;