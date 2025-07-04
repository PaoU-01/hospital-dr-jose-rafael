const modelBienes = require('../models/modelBienes.js');
const Excel = require('exceljs');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const convertapi = require('convertapi')('ORZ5LZtqQ8Rg1vfZ3N5dFqjfrdcKgqDA');
const os = require('os'); // Para manejar rutas de archivos temporales
const PDFDocument = require('pdfkit'); // Para generar PDFs

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

    // Método para generar el PDF
    generarPDFTransferencia(datos) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', margin: 50 });
                const buffers = [];

                // Capturar el PDF en memoria
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });

                // Manejo de errores del documento
                doc.on('error', (error) => {
                    console.error('Error en PDFDocument:', error);
                    reject(error);
                });

                // Logo en la esquina superior izquierda
                try {
                    const logoPath = path.join(__dirname, '../public/images/Imagen1.png');
                    if (fs.existsSync(logoPath)) {
                        doc.image(logoPath, 50, 20, { width: 100, height: 80 });
                    }
                } catch (error) {
                    console.log('Logo no encontrado, continuando sin logo...');
                }

                doc.fontSize(8)
                    .text('REPÚBLICA BOLIVARIANA DE VENEZUELA', 50, 50, { width: 500, align: 'center' })
                    .text('GOBIERNO BOLIVARIANO DE ARAGUA', 50, 62, { width: 500, align: 'center' })
                    .text('GOBERNACIÓN DEL ESTADO ARAGUA', 50, 74, { width: 500, align: 'center' })
                    .text('COORDINACIÓN DE BIENES NACIONALES', 50, 86, { width: 500, align: 'center' });

                // Título principal (centrado)
                doc.fontSize(14)
                    .font('Helvetica-Bold')
                    .text('ORDEN DE TRANSFERENCIA', 50, 120, { width: 500, align: 'center' });

                // Fecha
                doc.fontSize(10)
                    .font('Helvetica')
                    .text('FECHA:', 50, 160)
                    .text(datos.fecha, 95, 160);

                // Determinar qué checkboxes marcar según el tipo seleccionado
                const tipoSeleccionado = datos.tipo;
                const yCheckbox = 180;

                // Resetear fuente antes de los checkboxes
                doc.fontSize(10).font('Helvetica');

                // Checkboxes - Tipo de operación
                doc.rect(50, yCheckbox, 10, 10).stroke()
                    .text('INTERNA', 70, yCheckbox + 2);
                if (tipoSeleccionado === 'INTERNA') {
                    doc.fontSize(8).text('X', 53, yCheckbox + 2);
                    doc.fontSize(10); // Restaurar tamaño
                }

                doc.rect(50, yCheckbox + 20, 10, 10).stroke()
                    .text('EXTERNA', 70, yCheckbox + 22);
                if (tipoSeleccionado === 'EXTERNA') {
                    doc.fontSize(8).text('X', 53, yCheckbox + 22);
                    doc.fontSize(10); // Restaurar tamaño
                }

                doc.rect(50, yCheckbox + 40, 10, 10).stroke()
                    .text('PERMANENTE', 70, yCheckbox + 42);
                if (tipoSeleccionado === 'PERMANENTE') {
                    doc.fontSize(8).text('X', 53, yCheckbox + 42);
                    doc.fontSize(10); // Restaurar tamaño
                }

                // Checkboxes - Préstamo/Reparación
                doc.rect(300, yCheckbox, 10, 10).stroke()
                    .text('PRÉSTAMO', 320, yCheckbox + 2);
                if (tipoSeleccionado === 'PRÉSTAMO') {
                    doc.fontSize(8).text('X', 303, yCheckbox + 2);
                    doc.fontSize(10); // Restaurar tamaño
                }

                doc.rect(300, yCheckbox + 20, 10, 10).stroke()
                    .text('REPARACIÓN', 320, yCheckbox + 22);
                if (tipoSeleccionado === 'REPARACIÓN') {
                    doc.fontSize(8).text('X', 303, yCheckbox + 22);
                    doc.fontSize(10); // Restaurar tamaño
                }

                // Texto legal
                const textoLegal = 'DE CONFORMIDAD CON LOS ART. 264 Y 265 DE LA LEY ORGÁNICA DE LA HACIENDA PÚBLICA NACIONAL Y POR REQUERIRLO ASÍ LA NECESIDAD DE LA DEPENDENCIA HOSPITAL DR. JOSÉ RANGEL, SE AUTORIZA LA TRANSFERENCIA DE LOS SIGUIENTES BIENES:';

                doc.fontSize(9)
                    .font('Helvetica')
                    .text(textoLegal, 50, 260, { width: 500, align: 'justify' });

                // Validar que hay datos en la tabla
                if (!datos.datosTabla || datos.datosTabla.length === 0) {
                    throw new Error('No hay datos de tabla para procesar');
                }

                // Tabla
                const tableTop = 320;
                const tableLeft = 50;
                const colWidths = [80, 200, 120, 100];
                const rowHeight = 25;

                // Headers de la tabla
                const headers = ['Número del Bien', 'Descripción', 'Servicio procedente', 'Destino'];

                // Dibujar headers
                let currentX = tableLeft;
                headers.forEach((header, i) => {
                    doc.rect(currentX, tableTop, colWidths[i], rowHeight).stroke();
                    doc.fontSize(8)
                        .font('Helvetica-Bold')
                        .text(header, currentX + 5, tableTop + 8, { width: colWidths[i] - 10 });
                    currentX += colWidths[i];
                });

                // Dibujar filas con datos del formulario
                datos.datosTabla.forEach((row, rowIndex) => {
                    const yPos = tableTop + rowHeight * (rowIndex + 1);
                    currentX = tableLeft;

                    row.forEach((cell, colIndex) => {
                        doc.rect(currentX, yPos, colWidths[colIndex], rowHeight).stroke();
                        doc.fontSize(7)
                            .font('Helvetica')
                            .text(String(cell || ''), currentX + 3, yPos + 5, {
                                width: colWidths[colIndex] - 6,
                                lineGap: 2
                            });
                        currentX += colWidths[colIndex];
                    });
                });

                // Observación
                const obsY = tableTop + rowHeight * (datos.datosTabla.length + 2);
                doc.fontSize(9)
                    .font('Helvetica-Bold')
                    .text('Observación', 50, obsY);


                // Texto de observación del formulario
                doc.fontSize(8)
                    .font('Helvetica')
                    .text(String(datos.observaciones || 'Sin observaciones adicionales'), 50, obsY + 20, {
                        width: 500,
                        align: 'justify'
                    });

                // Firmas - Centradas en la página
                const signaturesY = obsY + 100;
                const pageWidth = 595;
                const signatureWidth = 120;

                // Primera fila de firmas
                const leftSignX = (pageWidth / 4) - (signatureWidth / 2);
                const rightSignX = (3 * pageWidth / 4) - (signatureWidth / 2);

                doc.moveTo(leftSignX, signaturesY).lineTo(leftSignX + signatureWidth, signaturesY).stroke();
                doc.text('Director', leftSignX, signaturesY + 10, { width: signatureWidth, align: 'center' });

                doc.moveTo(rightSignX, signaturesY).lineTo(rightSignX + signatureWidth, signaturesY).stroke();
                doc.text('Coord. de Administración', rightSignX, signaturesY + 10, { width: signatureWidth, align: 'center' });

                // Segunda fila de firmas
                const signatures2Y = signaturesY + 60;
                doc.moveTo(leftSignX, signatures2Y).lineTo(leftSignX + signatureWidth, signatures2Y).stroke();
                doc.text('Coord. Bienes Nacionales', leftSignX, signatures2Y + 10, { width: signatureWidth, align: 'center' });

                doc.moveTo(rightSignX, signatures2Y).lineTo(rightSignX + signatureWidth, signatures2Y).stroke();
                doc.text('Servicio de procedencia', rightSignX, signatures2Y + 10, { width: signatureWidth, align: 'center' });

                // Tercera fila - Receptor (centrado en toda la página)
                const signatures3Y = signatures2Y + 60;
                const centerSignX = (pageWidth / 2) - (signatureWidth / 2);
                doc.moveTo(centerSignX, signatures3Y).lineTo(centerSignX + signatureWidth, signatures3Y).stroke();
                doc.text('Receptor', centerSignX, signatures3Y + 10, { width: signatureWidth, align: 'center' });

                // Finalizar el documento
                doc.end();

            } catch (error) {
                console.error('Error en generarPDFTransferencia:', error);
                reject(error);
            }
        });
    }

    async ordenTransferencia(req, res) {
        try {
            console.log('Datos recibidos RAW:', req.body);

            function normalizeToArray(value) {
                if (Array.isArray(value)) {
                    return value;
                } else if (value !== undefined && value !== null && value !== '') {
                    return [value];
                } else {
                    return [];
                }
            }

            const bienNum = normalizeToArray(req.body.bienNum);
            const descripcion = normalizeToArray(req.body.descripcion);
            const servicio = normalizeToArray(req.body.servicio);
            const destino = normalizeToArray(req.body.destino);
            const tipo = req.body.tipo;
            const observaciones = req.body.observaciones;

            console.log('Arrays normalizados:');
            console.log('bienNum:', bienNum);
            console.log('descripcion:', descripcion);
            console.log('servicio:', servicio);
            console.log('destino:', destino);
            console.log('tipo:', tipo);
            console.log('observaciones:', observaciones);

            // Validaciones mejoradas
            if (bienNum.length === 0) {
                return res.status(400).json({
                    error: 'Debe incluir al menos un bien para transferir'
                });
            }

            if (!tipo) {
                return res.status(400).json({
                    error: 'Debe seleccionar un tipo de transferencia'
                });
            }

            if (!observaciones || observaciones.trim() === '') {
                return res.status(400).json({
                    error: 'Debe incluir observaciones'
                });
            }

            // Construir tabla de datos
            const datosTabla = [];
            const maxLength = Math.max(bienNum.length, descripcion.length, servicio.length, destino.length);

            for (let i = 0; i < maxLength; i++) {
                const bien = bienNum[i] || '';
                const desc = descripcion[i] || '';
                const serv = servicio[i] || '';
                const dest = destino[i] || '';

                // Solo agregar filas que tengan todos los campos completos
                if (bien.trim() && desc.trim() && serv.trim() && dest.trim()) {
                    datosTabla.push([
                        String(bien).trim(),
                        String(desc).trim(),
                        String(serv).trim(),
                        String(dest).trim()
                    ]);
                }
            }

            console.log('Datos de tabla final:', datosTabla);

            if (datosTabla.length === 0) {
                return res.status(400).json({
                    error: 'Debe completar al menos una fila con todos los campos'
                });
            }

            const pdfBuffer = await this.generarPDFTransferencia({
                datosTabla,
                tipo: String(tipo).trim(),
                observaciones: String(observaciones).trim(),
                fecha: new Date().toLocaleDateString('es-VE')
            });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="orden_transferencia.pdf"');
            res.setHeader('Content-Length', pdfBuffer.length);

            // Enviar el PDF
            res.send(pdfBuffer);

        } catch (error) {
            console.error('Error completo en ordenTransferencia:', error);
            console.error('Stack trace:', error.stack);

            // Respuesta de error más detallada para debug
            res.status(500).json({
                error: 'Error interno del servidor al generar el PDF',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }






}

module.exports = ControllerBienes;
