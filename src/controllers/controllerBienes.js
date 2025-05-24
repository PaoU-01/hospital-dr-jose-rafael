const modelBienes = require('../models/modelBienes.js');
const Excel = require('exceljs');
const fs = require('fs');
const path = require('path')

class ControllerBienes {
    constructor() {
        this.modelBienes = new modelBienes();
    }

    async getAllDepartamentos(req, res) {
        try {
            const departamentos = await this.modelBienes.getAllDepartamentos();
            res.render('departamentos', { nombre: req.user.nombre, departamentos })
        } catch (error) {
            console.error('Error al obtener los departamentos:', error);
            res.status(500).send('Error al obtener los departamentos');
        }
    }

    async mostrarBienes(req, res) {
        try {
            const bienes = await this.modelBienes.getAllBienes();
            const departamentos = await this.modelBienes.getAllDepartamentos();
            res.render('bienes', { nombre: req.user.nombre, bienes, departamentos });
        } catch (error) {
            console.error('Error al obtener los bienes:', error);
            res.status(500).send('Error al obtener los bienes');
        }
    }

    async agregarBienes(req, res) {
        try {
            const bienes = req.body;
            await this.modelBienes.agregarBienes(bienes);
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
            res.redirect('/panel');
        } catch (error) {
            console.error('Error al editar el bien:', error);
            res.status(500).send('Error al editar el bien');
        }
    }

    async eliminarBienes(req, res) {
        try {
            const { id } = req.params;
            await this.modelBienes.eliminarBienes(id);
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
            res.render('bitacora', { departamentos });
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
      const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile(path.resolve(__dirname, 'BM1_2022-hospital.xlsx'));
      const ws = workbook.getWorksheet('Hoja1');
      ws.getCell('H8').value = departamento.nombre;
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


 



}

module.exports = ControllerBienes;
