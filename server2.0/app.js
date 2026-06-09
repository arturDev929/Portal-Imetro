const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const os = require('os');
const path = require("path");
const login = require('./routes/home/login');
const getAdmin = require('./routes/admin/Get');
const postAdmin = require('./routes/admin/Post');
const putAdmin = require('./routes/admin/Put');
const deleteAdmin = require('./routes/admin/Delete');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

function getLocalIP() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

const LOCAL_IP = getLocalIP();

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://portal-imetro.vercel.app',
    `http://${LOCAL_IP}:3000`,
    `http://localhost:${PORT}`,
    `http://${LOCAL_IP}:${PORT}`,
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
    /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return allowed === origin;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('Origem não permitida pelo CORS:', origin);
            callback(new Error('Não permitido pelo CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        mensagem: 'API do IPS Metropolitano',
        versao: '1.0.0',
        status: 'online',
        local_ip: LOCAL_IP
    });
});


app.use('/api/img/funcionarios', express.static(path.join(__dirname, '../client/src/img/funcionarios')));
app.use('/api/img/professores', express.static(path.join(__dirname, '../client/src/img/professores')));
app.use('/api/img/docprofessores', express.static(path.join(__dirname, '../client/src/img/docprofessores')));
app.use('/api/src/img', express.static(path.join(__dirname, '../client/src/img')));

app.use('/login', login);
app.use('/', getAdmin);
app.use('/', postAdmin);
app.use('/', putAdmin);
app.use('/', deleteAdmin);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    console.log(`Rede: http://${LOCAL_IP}:${PORT}`);
});