const db = require('../db/db.js');

class ModelBienes {
    constructor() {
        this.db = db;
    }

    getAllBienes() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM bienes', [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    agregarBienes(bienes) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO bienes (nombre, marca, modelo, grupo, subgrupo, numero_serie, incorporaciones, observaciones, seccion, concepto_movimiento, cantidad, numero_identificacion, departamento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [bienes.nombre, bienes.marca, bienes.modelo, bienes.grupo, bienes.subgrupo, bienes.numero_serie, bienes.incorporaciones, bienes.observaciones, bienes.seccion, bienes.concepto_movimiento, bienes.cantidad, bienes.numero_identificacion, bienes.departamento];
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        })
    }

    editarBienes(bienes, id) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE bienes SET nombre = ?, marca = ?, modelo = ?, grupo = ?, subgrupo = ?, numero_serie = ?, incorporaciones = ?, observaciones = ?, seccion = ?, concepto_movimiento = ?, cantidad = ?, numero_identificacion = ?, departamento = ? WHERE id = ?`;
            const params = [bienes.nombre, bienes.marca, bienes.modelo, bienes.grupo, bienes.subgrupo, bienes.numero_serie, bienes.incorporaciones, bienes.observaciones, bienes.seccion, bienes.concepto_movimiento, bienes.cantidad, bienes.numero_identificacion, bienes.departamento, id];
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        })
    }

    eliminarBienes(id) {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM bienes WHERE id = ?`;
            this.db.run(sql, [id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        })
    }
}

module.exports = ModelBienes;