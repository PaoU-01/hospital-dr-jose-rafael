
const sqlite3 = require('sqlite3').verbose();

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


*/


    db.run(`
    CREATE TABLE IF NOT EXISTS bienes (
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
    departamento_id INTEGER NOT NULL,
    costo REAL NOT NULL,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id)
);
`);

    db.run(`
    CREATE TABLE IF NOT EXISTS departamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clasificacion INTEGER,
    nombre TEXT NOT NULL,
    dependencia TEXT NOT NULL
);
`);


}




module.exports = db;