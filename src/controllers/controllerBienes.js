const modelBienes = require('../models/modelBienes.js');

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


}

module.exports = ControllerBienes;
