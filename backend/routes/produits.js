const express = require("express");
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
});

module.exports = routeur;