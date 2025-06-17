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

    getAuditoria() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM auditoria', [], (err, rows) => {
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
            estado,
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
                bienes.estado,
                    1,
                bienes.numero_identificacion,
                bienes.departamento_id,
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
            const sql = `UPDATE bienes SET nombre = ?, marca = ?, modelo = ?, grupo = ?, subgrupo = ?, numero_serie = ?, incorporaciones = ?, observaciones = ?, seccion = ?, numero_identificacion = ?, departamento_id = ?, costo = ? WHERE id = ?`;
            const params = [bienes.nombre, bienes.marca, bienes.modelo, bienes.grupo, bienes.subgrupo, bienes.numero_serie, bienes.incorporaciones, bienes.observaciones, bienes.seccion, bienes.numero_identificacion, bienes.departamento_id, bienes.costo, id];
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

    registrar({ usuario_cedula, usuario_nombre, usuario_rol, accion, tabla_afectada }) {
        const sql = `
      INSERT INTO auditoria (usuario_cedula, usuario_nombre, usuario_rol, accion, tabla_afectada)
      VALUES (?, ?, ?, ?, ?)
    `;
        return new Promise((resolve, reject) => {
            this.db.run(
                sql,
                [usuario_cedula, usuario_nombre, usuario_rol, accion, tabla_afectada],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }




    getTotalBienes() {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT COUNT(*) AS total FROM bienes',
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row.total);
                }
            );
        });
    }

    getPresupuestoTotal() {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT SUM(costo) AS total FROM bienes',
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row.total || 0);
                }
            );
        });
    }

    /*
    getDistribucionSeccion() {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT seccion, 
                COUNT(*) * 100.0 / (SELECT COUNT(*) FROM bienes) AS porcentaje 
                FROM bienes 
                GROUP BY seccion`,
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }*/

    getClasificacionTipo() {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT grupo, COUNT(*) AS cantidad FROM bienes GROUP BY grupo',
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }


    getDepartamentoById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM departamentos WHERE id = ?',
                [id],
                (err, row) => (err ? reject(err) : resolve(row))
            );
        });
    }

    getBienesPorDepartamento(deptoId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT 
           nombre, marca, modelo, grupo, subgrupo, numero_serie,
           incorporaciones, observaciones, seccion, estado,
           cantidad, numero_identificacion, costo
         FROM bienes
         WHERE departamento_id = ?`,
                [deptoId],
                (err, rows) => (err ? reject(err) : resolve(rows))
            );
        });
    }





    getUsuarios() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM users', [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }


    getUsuarioById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    getUsuarioByCedula(cedula) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE cedula = ?', [cedula], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    getUsuarioByEmail(email) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    createUsuario({ cedula, email, nombre, rol, password }) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO users (cedula, email, nombre, rol, password) 
                     VALUES (?, ?, ?, ?, ?)`;

            this.db.run(sql, [cedula, email, nombre, rol, password], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        cedula,
                        email,
                        nombre,
                        rol,
                        password
                    });
                }
            });
        });
    }

    // En src/models/modelBienes.js
    updateUsuario(id, updates) {
        return new Promise((resolve, reject) => {
            const { cedula, email, nombre, rol, password } = updates;

            const sql = `
            UPDATE users 
            SET cedula = ?, 
                email = ?, 
                nombre = ?, 
                rol = ?, 
                password = ? 
            WHERE id = ?
        `;

            this.db.run(sql, [cedula, email, nombre, rol, password, id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    // Eliminar usuario
    deleteUsuario(id) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id,
                        changes: this.changes
                    });
                }
            });
        });
    }






}

module.exports = ModelBienes;