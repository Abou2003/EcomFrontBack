// ce fichier gere la connexion a la BD avec l'aide du module mysql2
const mysql = require('mysql2/promise');

const dbConnect = mysql.createPool({
    host     : process.env.DB_HOST     || 'localhost',
    user     : process.env.DB_USER     || 'root',
    password : process.env.DB_PASSWORD || '',
    database : process.env.DB_NAME     || 'ecommerce',
});

// Vérifier la connexion au démarrage
dbConnect.getConnection()
    .then(conn => {
        console.log('✅ Connecté à la base de données MySQL');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Erreur de connexion MySQL :', err.message);
        process.exit(1);
    });

module.exports = dbConnect;