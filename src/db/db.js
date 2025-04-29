
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./src/db/database.sql', (err) => {
    if (err) {
        console.error('Error al conectar a SQLite:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cedula TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            nombre TEXT NOT NULL,
            rol TEXT NOT NULL,
            password TEXT NOT NULL)
    `);

    db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (err) return console.error(err.message);
        if (row.count === 0) {
            const testPassword = bcrypt.hashSync('123456789', 10); 
            db.run(
                `INSERT INTO users (cedula, email, rol, nombre, password) 
                    VALUES (?, ?, ?, ?, ?)`,
                ['30406581', 'test@test.com', 1, 'Paola Uriarte', testPassword],
                (err) => {
                    if (err) return console.error('Error insertando usuario:', err.message);
                    console.log('Usuario de prueba creado:');
                    console.log('Email: test@example.com');
                    console.log('Contraseña: 123456789');
                }
            );
        }
    });

}


module.exports = db;