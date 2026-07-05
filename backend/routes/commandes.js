const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST créer une commande à partir du panier
router.post('/', async (req, res) => {
    const { items } = req.body; // [{ id, qty }, ...]

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Le panier est vide' });
    }

    const connexion = await db.getConnection();

    try {
        await connexion.beginTransaction();

        let total = 0;
        const lignesCommande = [];

        // 1. Vérifier le stock de chaque produit et calculer le total
        for (const item of items) {
            const [rows] = await connexion.query(
                'SELECT * FROM produit WHERE id = ? FOR UPDATE',
                [item.id]
            );

            if (rows.length === 0) {
                throw new Error(`Produit introuvable (id: ${item.id})`);
            }

            const produit = rows[0];

            if (produit.stock < item.qty) {
                throw new Error(`Stock insuffisant pour "${produit.nom}" (disponible : ${produit.stock})`);
            }

            total += produit.prix * item.qty;
            lignesCommande.push({
                produit_id: produit.id,
                nom_produit: produit.nom,
                prix_unitaire: produit.prix,
                quantite: item.qty,
            });
        }

        // 2. Générer un numéro de commande unique
        const numero = `CMD-${Date.now()}`;

        // 3. Créer la commande
        const [resultCommande] = await connexion.query(
            'INSERT INTO commande (numero, total) VALUES (?, ?)',
            [numero, total]
        );
        const commandeId = resultCommande.insertId;

        // 4. Créer les lignes de commande + décrémenter le stock
        for (const ligne of lignesCommande) {
            await connexion.query(
                'INSERT INTO commande_ligne (commande_id, produit_id, nom_produit, prix_unitaire, quantite) VALUES (?, ?, ?, ?, ?)',
                [commandeId, ligne.produit_id, ligne.nom_produit, ligne.prix_unitaire, ligne.quantite]
            );

            await connexion.query(
                'UPDATE produit SET stock = stock - ? WHERE id = ?',
                [ligne.quantite, ligne.produit_id]
            );
        }

        await connexion.commit();

        res.status(201).json({ numero, total, commandeId });

    } catch (err) {
        await connexion.rollback();
        res.status(400).json({ message: err.message });
    } finally {
        connexion.release();
    }
});

module.exports = router;