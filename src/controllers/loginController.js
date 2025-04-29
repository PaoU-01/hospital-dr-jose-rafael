const db = require('../db/db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginAuth = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Faltan credenciales' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        try {
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Contraseña o usuario incorrectos' });
            }

            const token = jwt.sign(
                { id: user.id, cedula: user.cedula, nombre: user.nombre, rol: user.rol, email: user.email },
                "test",
                { expiresIn: '2h' }
            );

            res.cookie('token', token, { httpOnly: true });
            res.redirect('/panel');
        } catch (error) {
            res.status(500).json({ error: 'Error en el servidor' });
        }
    });
};

module.exports = loginAuth;