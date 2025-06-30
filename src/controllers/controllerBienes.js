const modelBienes = require('../models/modelBienes.js');
const Excel = require('exceljs');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const convertapi = require('convertapi')('ORZ5LZtqQ8Rg1vfZ3N5dFqjfrdcKgqDA');
const os = require('os'); // Para manejar rutas de archivos temporales

class ControllerBienes {
    constructor() {
        this.modelBienes = new modelBienes();
    }

    async agregarUsuario(req, res) {
        try {
            const { cedula, email, nombre, rol, password } = req.body;

            console.log(req.body);

            if (!cedula || !email || !nombre || !rol || !password) {
                return res.status(400).send('Todos los campos son obligatorios');
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            await this.modelBienes.createUsuario({ cedula, email, nombre, rol, password: hashedPassword });
            await this.modelBienes.registrar({
                usuario_cedula: req.user.cedula,
                usuario_nombre: req.user.nombre,
                usuario_rol: req.user.rol,
                accion: `Agregó un nuevo usuario con el nombre de (${nombre || 'desconocido'})`,
                tabla_afectada: 'usuarios'
            });

            res.redirect('/usuarios');
        }
        catch (error) {
            console.error('Error al agregar el usuario:', error);
            res.status(500).send('Error al agregar el usuario');
        }
    }


    async editarUsuario(req, res) {
        try {
            const { id } = req.params;
            const { cedula, email, nombre, rol, password } = req.body;
            if (!cedula || !email || !nombre || !rol) {
                return res.status(400).send('Todos los campos son obligatorios');
            }

            const updateData = { cedula, email, nombre, rol };

            if (password) {
                const saltRounds = 10;
                updateData.password = await bcrypt.hash(password, saltRounds);
            } else {
                const usuario = await this.modelBienes.getUsuarioById(id);
                updateData.password = usuario.password;
            }

            await this.modelBienes.updateUsuario(id, updateData);
            await this.modelBienes.registrar({
                usuario_cedula: req.user.cedula,
                usuario_nombre: req.user.nombre,
                usuario_rol: req.user.rol,
                accion: `Editó el usuario con ID ${id} (${nombre})`,
                tabla_afectada: 'usuarios'
            });

            res.redirect('/usuarios');
        } catch (error) {
            console.error('Error al editar el usuario:', error);
            res.status(500).send('Error al editar el usuario');
        }
    }
    async eliminarUsuario(req, res) {
        try {
            const { id } = req.params;
            await this.modelBienes.deleteUsuario(id);
            await this.modelBienes.registrar({
                usuario_cedula: req.user.cedula,
                usuario_nombre: req.user.nombre,
                usuario_rol: req.user.rol,
                accion: `Eliminó el usuario con ID ${id}`,
                tabla_afectada: 'usuarios'
            });
            res.redirect('/usuarios');
        }
        catch (error) {
            console.error('Error al eliminar el usuario:', error);
            res.status(500).send('Error al eliminar el usuario');
        }
    }


    async mostrarUsuarios(req, res) {
        try {

            const usuarios = await this.modelBienes.getUsuarios();
            res.render('usuarios', { nombre: req.user.nombre, usuarios });
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
            res.status(500).send('Error al obtener los usuarios');
        }
    }

    async cerrarSesion(req, res) {
        try {
            res.clearCookie('token');
            res.redirect('/');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            res.status(500).send('Error al cerrar sesión');
        }
    }





    async getAllDepartamentos(req, res) {
        try {
            const departamentos = await this.modelBienes.getAllDepartamentos();
            res.render('departamentos', { nombre: req.user.nombre, rol: req.user.rol, departamentos })
        } catch (error) {
            console.error('Error al obtener los departamentos:', error);
            res.status(500).send('Error al obtener los departamentos');
        }
    }

    async mostrarBienes(req, res) {
        try {
            const bienes = await this.modelBienes.getAllBienes();
            const departamentos = await this.modelBienes.getAllDepartamentos();
            res.render('bienes', { nombre: req.user.nombre, bienes, rol: req.user.rol, departamentos });
        } catch (error) {
            console.error('Error al obtener los bienes:', error);
            res.status(500).send('Error al obtener los bienes');
        }
    }

    async agregarBienes(req, res) {
        try {
            const bienes = req.body;
            await this.modelBienes.agregarBienes(bienes);
            await this.modelBienes.registrar({
                usuario_cedula: req.user.cedula,
                usuario_nombre: req.user.nombre,
                usuario_rol: req.user.rol,
                accion: `Agregó un nuevo bien con el nombre de (${bienes.nombre || 'desconocido'})`,
                tabla_afectada: 'bienes'
            });


            res.redirect('/panel');
        } catch (error) {
            console.error('Error al agregar el bien:', error);
            res.status(500).send('Error al agregar el bien');
        }
    }

    async editarBienes(req, res) {
        try {
            const bienes = req.body;
            const { id } = req.params;
            await this.modelBienes.editarBienes(bienes, id);
            await this.modelBienes.registrar({
                usuario_cedula: req.user.cedula,
                usuario_nombre: req.user.nombre,
                usuario_rol: req.user.rol,
                accion: `Editó el bien con ID ${id}`,
                tabla_afectada: 'bienes'
            });

            res.redirect('/panel');
        } catch (error) {
            console.error('Error al editar el bien:', error);
            res.status(500).send('Error al editar el bien');
        }
    }


    async mostrarAuditoria(req, res) {
        const auditoria = await this.modelBienes.getAuditoria();
        try {
            res.render('auditoria', { auditoria, rol: req.user.rol, nombre: req.user.nombre });
        } catch (error) {
            console.error('Error al obtener la auditoría:', error);
            res.status(500).send('Error al obtener la auditoría');
        }
    }

    async eliminarBienes(req, res) {
        try {
            const { id } = req.params;
            await this.modelBienes.eliminarBienes(id);

            await this.modelBienes.registrar({
                usuario_cedula: req.user.cedula,
                usuario_nombre: req.user.nombre,
                usuario_rol: req.user.rol,
                accion: `Eliminó el bien con él ID ${id}`,
                tabla_afectada: 'bienes'
            });
            res.redirect('/panel');
        } catch (error) {
            console.error('Error al eliminar el bien:', error);
            res.status(500).send('Error al eliminar el bien');
        }
    }

    async eliminarDepartamento(req, res) {
        try {
            const { id } = req.params;
            await this.modelBienes.deleteDepartamento(id);
            await this.modelBienes.registrar({
                usuario_cedula: req.user.cedula,
                usuario_nombre: req.user.nombre,
                usuario_rol: req.user.rol,
                accion: `Eliminó el departamento con ID ${id}`,
                tabla_afectada: 'departamentos'
            });

            res.redirect('/departamentos');
        } catch (error) {
            console.error('Error al eliminar el departamento:', error);
            res.status(500).send('Error al eliminar el departamento');
        }
    }


    async agregarDepartamento(req, res) {
        try {
            const { clasificacion, nombre, dependencia } = req.body;
            await this.modelBienes.addDepartamento({
                clasificacion,
                nombre,
                dependencia
            });
            await this.modelBienes.registrar({
                usuario_cedula: req.user.cedula,
                usuario_nombre: req.user.nombre,
                usuario_rol: req.user.rol,
                accion: `Agregó un nuevo departamento con el nombre de (${nombre || 'desconocido'})`,
                tabla_afectada: 'departamentos'
            });
            res.redirect('/departamentos');
        } catch (error) {
            console.error('Error al crear departamento:', error);
            res.status(500).send('Error al crear departamento');
        }
    }

    async editarDepartamento(req, res) {
        try {
            const { id } = req.params;
            const { clasificacion, nombre, dependencia } = req.body;
            await this.modelBienes.updateDepartamento(id, {
                clasificacion,
                nombre,
                dependencia
            });
            await this.modelBienes.registrar({
                usuario_cedula: req.user.cedula,
                usuario_nombre: req.user.nombre,
                usuario_rol: req.user.rol,
                accion: `Editó el departamento con ID ${id}`,
                tabla_afectada: 'departamentos'
            });
            res.redirect('/departamentos');
        } catch (error) {
            console.error('Error al actualizar departamento:', error);
            res.status(500).send('Error al actualizar departamento');
        }
    }


    async mostrarEstadisticas(req, res) {
        try {
            const [totalBienes, presupuestoTotal, clasificacionTipo] = await Promise.all([
                this.modelBienes.getTotalBienes(),
                this.modelBienes.getPresupuestoTotal(),
                this.modelBienes.getClasificacionTipo()
            ]);
            res.render('estadisticas', {
                rol: req.user.rol,
                totalBienes,
                presupuestoTotal,
                clasificacionTipo,
                nombre: req.user.nombre
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).send('Error al cargar las estadísticas');
        }
    }


    async mostrarFormulario(req, res) {
        try {
            const departamentos = await this.modelBienes.getAllDepartamentos();
            res.render('bitacora', { departamentos, rol: req.user.rol });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Error al cargar el formulario');
        }
    }

    async exportarBitacora(req, res) {
        try {
            const { departamento_id } = req.body;
            const departamento = await this.modelBienes.getDepartamentoById(departamento_id);
            const bienes = await this.modelBienes.getBienesPorDepartamento(departamento_id);

            await this.modelBienes.registrar({
                usuario_cedula: req.user.cedula,
                usuario_nombre: req.user.nombre,
                usuario_rol: req.user.rol,
                accion: `Exportó la bitácora del departamento ${departamento.nombre}`,
                tabla_afectada: 'Ninguna'
            });


            const workbook = new Excel.Workbook();
            await workbook.xlsx.readFile(path.resolve(__dirname, 'BM1_2022-hospital.xlsx'));
            const ws = workbook.getWorksheet('Hoja1');
            ws.getCell('I8').value = departamento.nombre;
            ws.getCell('F8').value = departamento.nombre;
            let fila = 15;
            for (const b of bienes) {
                ws.getCell(`A${fila}`).value = b.grupo;
                ws.getCell(`B${fila}`).value = b.subgrupo;
                ws.getCell(`C${fila}`).value = b.seccion;
                ws.getCell(`D${fila}`).value = b.cantidad;
                ws.getCell(`E${fila}`).value = b.numero_identificacion;
                ws.getCell(`F${fila}`).value = b.estado;
                ws.getCell(`G${fila}`).value = b.nombre;
                ws.getCell(`H${fila}`).value = b.costo;
                ws.getCell(`I${fila}`).value = b.cantidad * b.costo;
                fila++;
            }
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=Bitacora_${departamento.nombre}.xlsx`);
            await workbook.xlsx.write(res);
            res.end();
        } catch (err) {
            console.error(err);
            res.status(500).send('Error al generar la bitácora');
        }
    }
    async exportarBitacoraPdf(req, res) {
        try {
            const { departamento_id } = req.body;
            const departamento = await this.modelBienes.getDepartamentoById(departamento_id);
            const bienes = await this.modelBienes.getBienesPorDepartamento(departamento_id);

            await this.modelBienes.registrar({
                usuario_cedula: req.user.cedula,
                usuario_nombre: req.user.nombre,
                usuario_rol: req.user.rol,
                accion: `Exportó la bitácora del departamento ${departamento.nombre}`,
                tabla_afectada: 'Ninguna'
            });

            // 1. Crear Excel en archivo temporal
            const workbook = new Excel.Workbook();
            await workbook.xlsx.readFile(path.resolve(__dirname, 'BM1_2022-hospital.xlsx'));
            const ws = workbook.getWorksheet('Hoja1');
            ws.getCell('I8').value = departamento.nombre;
            ws.getCell('F8').value = departamento.nombre;

            let fila = 15;
            for (const b of bienes) {
                ws.getCell(`A${fila}`).value = b.grupo;
                ws.getCell(`B${fila}`).value = b.subgrupo;
                ws.getCell(`C${fila}`).value = b.seccion;
                ws.getCell(`D${fila}`).value = b.cantidad;
                ws.getCell(`E${fila}`).value = b.numero_identificacion;
                ws.getCell(`F${fila}`).value = b.estado;
                ws.getCell(`G${fila}`).value = b.nombre;
                ws.getCell(`H${fila}`).value = b.costo;
                ws.getCell(`I${fila}`).value = b.cantidad * b.costo;
                fila++;
            }

            // Archivo temporal .xlsx
            const tmpXlsxPath = path.join(os.tmpdir(), `bitacora_${departamento.nombre}.xlsx`);
            await workbook.xlsx.writeFile(tmpXlsxPath);

            // 2. Convertir a PDF con ConvertAPI
            const result = await convertapi.convert('pdf', {
                File: tmpXlsxPath
            }, 'xlsx');

            // 3. Guardar PDF temporalmente
            const tmpPdfPath = path.join(os.tmpdir(), `bitacora_${departamento.nombre}.pdf`);
            await result.files[0].save(tmpPdfPath);

            // 4. Enviar PDF al cliente
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Bitacora_${departamento.nombre}.pdf`);
            const fileStream = fs.createReadStream(tmpPdfPath);
            fileStream.pipe(res);
            fileStream.on('end', () => {
                // 5. Limpiar archivos temporales
                fs.unlink(tmpXlsxPath, () => { });
                fs.unlink(tmpPdfPath, () => { });
            });

        } catch (err) {
            console.error(err);
            res.status(500).send('Error al generar la bitácora PDF');
        }
    }


    async exportarBitacora2021(req, res) {
        try {
            const { departamento_id } = req.body;
            const departamento = await this.modelBienes.getDepartamentoById(departamento_id);
            const bienes = await this.modelBienes.getBienesPorDepartamento(departamento_id);

            await this.modelBienes.registrar({
                usuario_cedula: req.user.cedula,
                usuario_nombre: req.user.nombre,
                usuario_rol: req.user.rol,
                accion: `Exportó la bitácora del departamento ${departamento.nombre}`,
                tabla_afectada: 'Ninguna'
            });

            const workbook = new Excel.Workbook();
            await workbook.xlsx.readFile(path.resolve(__dirname, 'BM2_2021-hospital.xlsx'));
            const ws = workbook.getWorksheet('enero');
            let fila = 17;
            for (const b of bienes) {
                ws.getCell(`A${fila}`).value = b.grupo;
                ws.getCell(`B${fila}`).value = b.subgrupo;
                ws.getCell(`C${fila}`).value = b.seccion;
                ws.getCell(`E${fila}`).value = b.cantidad;
                ws.getCell(`F${fila}`).value = b.numero_identificacion;
                ws.getCell(`G${fila}`).value = b.nombre + ' ' + b.marca;
                ws.getCell(`H${fila}`).value = b.cantidad;
                fila++;
            }
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=Bitacora_${departamento.nombre}.xlsx`);
            await workbook.xlsx.write(res);
            res.end();
        } catch (err) {
            console.error(err);
            res.status(500).send('Error al generar la bitácora');
        }
    }

    async exportarBitacora2021PDF(req, res) {
        try {
            const { departamento_id } = req.body;
            const departamento = await this.modelBienes.getDepartamentoById(departamento_id);
            const bienes = await this.modelBienes.getBienesPorDepartamento(departamento_id);

            await this.modelBienes.registrar({
                usuario_cedula: req.user.cedula,
                usuario_nombre: req.user.nombre,
                usuario_rol: req.user.rol,
                accion: `Exportó la bitácora del departamento ${departamento.nombre}`,
                tabla_afectada: 'Ninguna'
            });

            const workbook = new Excel.Workbook();
            await workbook.xlsx.readFile(path.resolve(__dirname, 'BM2_2021-hospital.xlsx'));
            const ws = workbook.getWorksheet('enero');
            let fila = 17;
            for (const b of bienes) {
                ws.getCell(`A${fila}`).value = b.grupo;
                ws.getCell(`B${fila}`).value = b.subgrupo;
                ws.getCell(`C${fila}`).value = b.seccion;
                ws.getCell(`E${fila}`).value = b.cantidad;
                ws.getCell(`F${fila}`).value = b.numero_identificacion;
                ws.getCell(`G${fila}`).value = b.nombre + ' ' + b.marca;
                ws.getCell(`H${fila}`).value = b.cantidad;
                fila++;
            }


            const tmpXlsxPath = path.join(os.tmpdir(), `bitacora_${departamento.nombre}.xlsx`);
            await workbook.xlsx.writeFile(tmpXlsxPath);
            const result = await convertapi.convert('pdf', {
                File: tmpXlsxPath
            }, 'xlsx');

            const tmpPdfPath = path.join(os.tmpdir(), `bitacora_${departamento.nombre}.pdf`);
            await result.files[0].save(tmpPdfPath);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Bitacora-BM2_${departamento.nombre}.pdf`);
            const fileStream = fs.createReadStream(tmpPdfPath);
            fileStream.pipe(res);
            fileStream.on('end', () => {
                fs.unlink(tmpXlsxPath, () => { });
                fs.unlink(tmpPdfPath, () => { });
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error al generar la bitácora');
        }
    }


    async exportarBitacora2017(req, res) {
        try {
            const { departamento_id } = req.body;
            const departamento = await this.modelBienes.getDepartamentoById(departamento_id);
            const bienes = await this.modelBienes.getBienesPorDepartamento(departamento_id);

            await this.modelBienes.registrar({
                usuario_cedula: req.user.cedula,
                usuario_nombre: req.user.nombre,
                usuario_rol: req.user.rol,
                accion: `Exportó la bitácora del departamento ${departamento.nombre}`,
                tabla_afectada: 'Ninguna'
            });

            const workbook = new Excel.Workbook();
            await workbook.xlsx.readFile(path.resolve(__dirname, 'BM3_2017-hospital.xlsx'));
            const ws = workbook.getWorksheet('Hoja1');
            let fila = 18;
            for (const b of bienes) {
                ws.getCell(`A${fila}`).value = b.grupo;
                ws.getCell(`B${fila}`).value = b.subgrupo;
                ws.getCell(`C${fila}`).value = b.seccion;
                ws.getCell(`E${fila}`).value = b.nombre + ' ' + b.marca;
                ws.getCell(`H${fila}`).value = b.costo;
                ws.getCell(`I${fila}`).value = b.cantidad;
                fila++;
            }

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=Bitacora_${departamento.nombre}.xlsx`);
            await workbook.xlsx.write(res);
            res.end();
        } catch (err) {
            console.error(err);
            res.status(500).send('Error al generar la bitácora');
        }
    }

    
    async exportarBitacora2017PDF(req, res) {
        try {
            const { departamento_id } = req.body;
            const departamento = await this.modelBienes.getDepartamentoById(departamento_id);
            const bienes = await this.modelBienes.getBienesPorDepartamento(departamento_id);

            await this.modelBienes.registrar({
                usuario_cedula: req.user.cedula,
                usuario_nombre: req.user.nombre,
                usuario_rol: req.user.rol,
                accion: `Exportó la bitácora del departamento ${departamento.nombre}`,
                tabla_afectada: 'Ninguna'
            });

            const workbook = new Excel.Workbook();
            await workbook.xlsx.readFile(path.resolve(__dirname, 'BM3_2017-hospital.xlsx'));
            const ws = workbook.getWorksheet('Hoja1');
            let fila = 18;
            for (const b of bienes) {
                ws.getCell(`A${fila}`).value = b.grupo;
                ws.getCell(`B${fila}`).value = b.subgrupo;
                ws.getCell(`C${fila}`).value = b.seccion;
                ws.getCell(`E${fila}`).value = b.nombre + ' ' + b.marca;
                ws.getCell(`H${fila}`).value = b.costo;
                ws.getCell(`I${fila}`).value = b.cantidad;
                fila++;
            }

            const tmpXlsxPath = path.join(os.tmpdir(), `bitacora_${departamento.nombre}.xlsx`);
            await workbook.xlsx.writeFile(tmpXlsxPath);
            const result = await convertapi.convert('pdf', {
                File: tmpXlsxPath
            }, 'xlsx');

            const tmpPdfPath = path.join(os.tmpdir(), `bitacora_${departamento.nombre}.pdf`);
            await result.files[0].save(tmpPdfPath);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Bitacora-BM3_${departamento.nombre}.pdf`);
            const fileStream = fs.createReadStream(tmpPdfPath);
            fileStream.pipe(res);
            fileStream.on('end', () => {
                fs.unlink(tmpXlsxPath, () => { });
                fs.unlink(tmpPdfPath, () => { });
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error al generar la bitácora');
        }
    }


}

module.exports = ControllerBienes;
