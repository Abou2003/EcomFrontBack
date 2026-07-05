/*const express = require("express");
const routeur = express.Router();
const db = require("../config/db");

// GET - Tous les produits
routeur.get("/", async (req, res) => {
    try {
        const [resultat] = await db.query("SELECT * FROM produit");
        res.status(200).json(resultat);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET - Un produit par ID
routeur.get("/:id", async (req, res) => {
    try {
        const [resultat] = await db.query(
            "SELECT * FROM produit WHERE id = ?",
            [req.params.id]
        );

        if (resultat.length === 0) {
            return res.status(404).json({
                message: "Produit introuvable"
            });
        }

        res.status(200).json(resultat[0]);
    } catch (err) {
        res.status(500).json(err);
    }
});

// POST - Ajouter un produit
routeur.post("/", async (req, res) => {
    try {
        const { nom, prix, stock, image } = req.body;

        const requete =
            "INSERT INTO produit(nom, prix, stock, image) VALUES(?, ?, ?, ?)";

        const [resultat] = await db.query(
            requete,
            [nom, prix, stock, image]
        );

        res.status(201).json({
            message: "Produit ajoute",
            id: resultat.insertId
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// PUT - Modifier un produit
routeur.put("/:id", async (req, res) => {
    try {
        const { nom, prix, stock, image } = req.body;

        const requete =
            "UPDATE produit SET nom=?, prix=?, stock=?, image=? WHERE id=?";

        const [resultat] = await db.query(
            requete,
            [nom, prix, stock, image, req.params.id]
        );

        if (resultat.affectedRows === 0) {
            return res.status(404).json({
                message: "Produit introuvable"
            });
        }

        res.status(200).json({
            message: "Produit modifie avec succes"
        });

    } catch (err) {
        res.status(500).json(err);
    }
});
routeur.delete("/:id", async (req, res) => {
    try {
        const [resultat] = await db.query(
            "DELETE FROM produit WHERE id=?",
            [req.params.id]
        );

        if (resultat.affectedRows === 0) {
            return res.status(404).json({
                message: "Produit introuvable"
            });
        }

        res.status(200).json({
            message: "Produit supprime avec succes"
        });

    } catch (err) {
        res.status(500).json(err);
    }
});*/

// module.exports = routeur;

const express = require('express');
const router = express.Router();
const db = require('../config/db'); // adapte selon ton fichier de connexion MySQL
const upload = require('../config/multer');
const fs = require('fs');
const path = require('path');
const verifierToken = require('../middlewares/verifierToken');


// GET tous les produits
router.get('/', async (req, res) => {
  try {
    const [produits] = await db.query('SELECT * FROM produit');
    res.json(produits);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

// GET un seul produit
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM produit WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

// POST créer un produit (avec upload d'image)
router.post('/', verifierToken, upload.single('image'), async (req, res) => {
  try {
    const { nom, prix, stock } = req.body;

    if (!nom || !prix || stock === undefined) {
      return res.status(400).json({ message: 'Champs nom, prix et stock requis' });
    }

    const image = req.file ? req.file.filename : null;

    const [result] = await db.query(
      'INSERT INTO produit (nom, prix, stock, image) VALUES (?, ?, ?, ?)',
      [nom, prix, stock, image]
    );

    res.status(201).json({ id: result.insertId, nom, prix, stock, image });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

// PUT modifier un produit (avec upload d'image optionnel)
router.put('/:id', verifierToken, upload.single('image'), async (req, res) => {
  try {
    const { nom, prix, stock } = req.body;
    const { id } = req.params;

    const [rows] = await db.query('SELECT * FROM produit WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }

    const ancienProduit = rows[0];
    let image = ancienProduit.image;

    // Si une nouvelle image est uploadée, on remplace et on supprime l'ancienne
    if (req.file) {
      image = req.file.filename;

      const ancienChemin = path.join(__dirname, '..', '..', 'imageEcom', ancienProduit.image);
      fs.unlink(ancienChemin, (err) => {
        if (err) console.log('Ancienne image non supprimée (peut-être déjà absente):', err.message);
      });
    }

    await db.query(
      'UPDATE produit SET nom = ?, prix = ?, stock = ?, image = ? WHERE id = ?',
      [nom, prix, stock, image, id]
    );

    res.json({ id, nom, prix, stock, image });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

// DELETE supprimer un produit
router.delete('/:id', verifierToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query('SELECT * FROM produit WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produit introuvable' });
    }

    const produit = rows[0];

    await db.query('DELETE FROM produit WHERE id = ?', [id]);

    // Supprime aussi le fichier image du disque
    if (produit.image) {
      const cheminImage = path.join(__dirname, '..', '..', 'imageEcom', produit.image);
      fs.unlink(cheminImage, (err) => {
        if (err) console.log('Image non supprimée (peut-être déjà absente):', err.message);
      });
    }

    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

module.exports = router;