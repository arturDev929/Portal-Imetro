/*const mysql = require("mysql2");

const conexao = mysql.createConnection({
  host: process.env.MYSQLHOST || process.env.DB_HOST,
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});*/

const { Sequelize } = require("sequelize");
const path = require("path");

require("dotenv").config({ path: path.resolve(".env") });

console.log(process.env.DATABASEUSER);

const conexao = new Sequelize(
  process.env.DATABASEURL,
  {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
);

(async () => {
  try {
    await conexao.authenticate();
    console.log("Conexão com o Supabase estabelecida!");
  } catch (error) {
    console.error("Não foi possível conectar:", error);
  }
})();


module.exports = conexao;
