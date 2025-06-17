
const express = require('express');
const router = express.Router();
const loginAuth = require('../controllers/loginController.js');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth.js');
const ControllerBienes = require('../controllers/controllerBienes.js');

const controllerBienes = new ControllerBienes();

router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/panel', authenticateToken, async (req, res) => {
  controllerBienes.mostrarBienes(req, res);
}
);

router.post('/bienes/agregar', authenticateToken, async (req, res) => {
  controllerBienes.agregarBienes(req, res);
}
);


router.post('/bienes/editar/:id', authenticateToken, async (req, res) => {
  controllerBienes.editarBienes(req, res);
}
);

router.post('/bienes/eliminar/:id', authenticateToken, async (req, res) => {
  controllerBienes.eliminarBienes(req, res);
}
);

router.get('/departamentos', authenticateToken, (req, res) => {
  controllerBienes.getAllDepartamentos(req, res);
}
);

router.post('/departamentos/agregar', authenticateToken, async (req, res) => {
  controllerBienes.agregarDepartamento(req, res)
});
router.post('/departamentos/editar/:id', authenticateToken, async (req, res) => { controllerBienes.editarDepartamento(req, res) });
router.post('/departamentos/eliminar/:id', authenticateToken, async (req, res) => { controllerBienes.eliminarDepartamento(req, res) });

router.get('/estadisticas', authenticateToken, async (req, res) => {
  controllerBienes.mostrarEstadisticas(req, res);
})

router.get('/bitacora', authenticateToken, async (req, res) => {
  controllerBienes.mostrarFormulario(req, res)
})


router.get('/usuarios', authenticateToken, authorizeAdmin, async (req, res) => {
  controllerBienes.mostrarUsuarios(req, res);
});


router.post('/bitacora/generar-excel', authenticateToken, async(req,res)=>{
  controllerBienes.exportarBitacora(req,res);
} );


router.post('/usuarios/agregar', authenticateToken, authorizeAdmin, async (req, res) => {
  controllerBienes.agregarUsuario(req, res);
}
);


router.post('/usuarios/editar/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  controllerBienes.editarUsuario(req, res);
}
);


router.post('/usuarios/eliminar/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  controllerBienes.eliminarUsuario(req, res);
}
);


router.get('/cerrar-sesion', async(req,res) => {
  controllerBienes.cerrarSesion(req,res);
}
);

router.get('/auditoria', authenticateToken, authorizeAdmin, async (req, res) => {
  controllerBienes.mostrarAuditoria(req, res);
}
);



router.post('/login', (req, res) => {
  loginAuth(req, res);
}
)


module.exports = router;
