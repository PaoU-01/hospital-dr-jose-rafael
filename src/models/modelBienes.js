const db = require('../db/db.js');

class ModelBienes {
    constructor() {
        this.db = db;
    }

    getAllDepartamentos() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM departamentos', [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            })
        })
    }



    addDepartamento(departamento) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO departamentos (clasificacion, nombre, dependencia) VALUES (?, ?, ?)',
                [departamento.clasificacion, departamento.nombre, departamento.dependencia],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }


    updateDepartamento(id, departamento) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE departamentos SET clasificacion = ?, nombre = ?, dependencia = ? WHERE id = ?',
                [departamento.clasificacion, departamento.nombre, departamento.dependencia, id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }

    deleteDepartamento(id) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'DELETE FROM departamentos WHERE id = ?',
                [id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
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
            const sql = `INSERT INTO bienes 
            (nombre, 
            marca, 
            modelo, 
            grupo, 
            subgrupo, 
            numero_serie, 
            incorporaciones, 
            observaciones, 
            seccion, 
            concepto_movimiento, 
            cantidad, 
            numero_identificacion, 
            departamento_id,
            costo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const params =
                [bienes.nombre,
                bienes.marca,
                bienes.modelo,
                bienes.grupo,
                bienes.subgrupo,
                bienes.numero_serie,
                bienes.incorporaciones,
                bienes.observaciones,
                bienes.seccion,
                bienes.concepto_movimiento,
                bienes.cantidad,
                bienes.numero_identificacion,
                bienes.departamento,
                bienes.costo];
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
            const sql = `UPDATE bienes SET nombre = ?, marca = ?, modelo = ?, grupo = ?, subgrupo = ?, numero_serie = ?, incorporaciones = ?, observaciones = ?, seccion = ?, concepto_movimiento = ?, cantidad = ?, numero_identificacion = ?, departamento_id = ?, costo = ? WHERE id = ?`;
            const params = [bienes.nombre, bienes.marca, bienes.modelo, bienes.grupo, bienes.subgrupo, bienes.numero_serie, bienes.incorporaciones, bienes.observaciones, bienes.seccion, bienes.concepto_movimiento, bienes.cantidad, bienes.numero_identificacion, bienes.departamento_id, bienes.costo, id];
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