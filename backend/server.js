require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const commandeRoute = require('./routes/commandes');

const app = express();

const produitRoute = require('./routes/produits');
const authRoute = require('./routes/auth');

// CORS et middlewares de parsing EN PREMIER, avant toute route
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensuite seulement les routes
app.use('/api/auth', authRoute);
app.use('/api/produits', produitRoute);

// Servir le dossier images qui est à la racine du projet (un niveau au-dessus de back/)
app.use('/imageEcom', express.static(path.join(__dirname, '..', 'imageEcom')))

app.use('/api/commandes', commandeRoute);

// Le 404 catch-all TOUT EN DERNIER
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} introuvable` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur ecommerce lancé sur http://localhost:${PORT}`);
});