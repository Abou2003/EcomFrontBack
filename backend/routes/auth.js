const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

router.post('/login', async (req, res) => {
    try {
        const { email, motDePasse } = req.body;

        if (!email || !motDePasse) {
            return res.status(400).json({ message: 'Email et mot de passe requis' });
        }

        const [rows] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        const admin = rows[0];
        const motDePasseValide = await bcrypt.compare(motDePasse, admin.mot_de_passe);

        if (!motDePasseValide) {
            return res.status(401).json({ message: 'Identifiants incorrects' });
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
    }
});

module.exports = router;