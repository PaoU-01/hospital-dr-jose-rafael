const modelBienes = require('../models/modelBienes.js');

class ControllerBienes {
    constructor() {
        this.modelBienes = new modelBienes();
    }

    async mostrarBienes(req, res) {
        try {
            const bienes = await this.modelBienes.getAllBienes();
            res.render('bienes', { nombre: req.user.nombre, bienes });
        } catch (error) {
            console.error('Error al obtener los bienes:', error);
            res.status(500).send('Error al obtener los bienes');
        }
    }

    async agregarBienes(req,res){
        try {
            const bienes = req.body;
            await this.modelBienes.agregarBienes(bienes);
            res.redirect('/panel');
        } catch (error) {
            console.error('Error al agregar el bien:', error);
            res.status(500).send('Error al agregar el bien');
        }
    }

    async editarBienes(req,res){
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

    async eliminarBienes(req,res){
        try {
            const { id } = req.params;
            await this.modelBienes.eliminarBienes(id);
            res.redirect('/panel');
        } catch (error) {
            console.error('Error al eliminar el bien:', error);
            res.status(500).send('Error al eliminar el bien');
        }
    }
}

module.exports = ControllerBienes ;