require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const produitRoute = require('./routes/produits');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/produits', produitRoute);

app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} introuvable` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur ecommerce lancé sur http://localhost:${PORT}`);
});