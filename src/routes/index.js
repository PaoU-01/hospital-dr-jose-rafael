
const express = require('express');
const router = express.Router();
const loginAuth = require('../controllers/loginController.js');
const authenticateToken = require('../middleware/auth.js');

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/panel', authenticateToken, (req, res) => {
  res.render('panel', { nombre: req.user.nombre });
}
);
router.get('/departamentos', (req, res) => {
  res.render('departamentos');
}
);

router.post('/login', (req, res) => {
  loginAuth(req, res);
}
)


module.exports = router;
