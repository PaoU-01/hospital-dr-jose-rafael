
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
    /*
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cedula TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            nombre TEXT NOT NULL,
            rol TEXT NOT NULL,
            password TEXT NOT NULL)
    `);


    db.run(`
    CREATE TABLE bienes IF NOT EXISTS (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    grupo TEXT NOT NULL,
    subgrupo TEXT NOT NULL,
    numero_serie TEXT NOT NULL,
    incorporaciones TEXT NOT NULL,
    observaciones TEXT NOT NULL,
    seccion INTEGER NOT NULL,
    concepto_movimiento TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    numero_identificacion TEXT UNIQUE NOT NULL,
    departamento TEXT NOT NULL);
`);
*/


}


module.exports = db;