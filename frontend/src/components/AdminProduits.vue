<template>
  <section class="admin-panel">
    <h2 class="admin-title">🛠️ Gestion des produits</h2>

    <!-- Formulaire ajout/modification -->
    <form class="admin-form" @submit.prevent="soumettreFormulaire">
      <h3>{{ modeEdition ? 'Modifier le produit' : 'Ajouter un produit' }}</h3>

      <input v-model="formulaire.nom" type="text" placeholder="Nom du produit" required />
      <input v-model.number="formulaire.prix" type="number" placeholder="Prix (FCFA)" required min="0" />
      <input v-model.number="formulaire.stock" type="number" placeholder="Stock" required min="0" />

      <input type="file" accept="image/*" @change="gererFichier" />
      <p v-if="formulaire.image && !fichierImage" class="image-actuelle">
        Image actuelle : {{ formulaire.image }}
      </p>

      <div class="form-actions">
        <button type="submit" class="btn-primary">
          {{ modeEdition ? 'Enregistrer' : 'Ajouter' }}
        </button>
        <button v-if="modeEdition" type="button" class="btn-secondary" @click="annulerEdition">
          Annuler
        </button>
      </div>

      <p v-if="erreur" class="erreur-msg">{{ erreur }}</p>
    </form>

    <!-- Liste des produits -->
    <div class="admin-list">
      <div v-for="produit in produits" :key="produit.id" class="admin-item">
        <img
          :src="`${apiBaseUrl}/imageEcom/${produit.image}`"
          :alt="produit.nom"
          class="admin-item-img"
          @error="handleImgError"
        />
        <div class="admin-item-info">
          <strong>{{ produit.nom }}</strong>
          <span>{{ produit.prix.toLocaleString() }} FCFA — Stock : {{ produit.stock }}</span>
        </div>
        <div class="admin-item-actions">
          <button class="btn-edit" @click="editerProduit(produit)">Modifier</button>
          <button class="btn-delete" @click="confirmerSuppression(produit)">Supprimer</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import api from '../services/api'

export default {
  name: 'AdminProduits',
   emits: ['produit-modifie'],
  data() {
    return {
      apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
      produits: [],
      formulaire: { id: null, nom: '', prix: null, stock: null, image: '' },
      fichierImage: null,
      modeEdition: false,
      erreur: '',
    }
  },
  mounted() {
    this.chargerProduits()
  },
  methods: {
    async chargerProduits() {
      try {
        const res = await api.get('/produits')
        this.produits = res.data
      } catch (err) {
        console.error('Erreur chargement produits:', err)
      }
    },

    gererFichier(e) {
      this.fichierImage = e.target.files[0] || null
    },

    async soumettreFormulaire() {
      this.erreur = ''

      const data = new FormData()
      data.append('nom', this.formulaire.nom)
      data.append('prix', this.formulaire.prix)
      data.append('stock', this.formulaire.stock)
      if (this.fichierImage) {
        data.append('image', this.fichierImage)
      }

      try {
        if (this.modeEdition) {
          await api.put(`/produits/${this.formulaire.id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        } else {
          if (!this.fichierImage) {
            this.erreur = 'Veuillez sélectionner une image pour un nouveau produit'
            return
          }
          await api.post('/produits', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }

        await this.chargerProduits()
        this.reinitialiserFormulaire()
        this.$emit('produit-modifie')
      } catch (err) {
        this.erreur = err.response?.data?.message || 'Une erreur est survenue'
        console.error(err)
      }
    },

    editerProduit(produit) {
      this.modeEdition = true
      this.formulaire = { ...produit }
      this.fichierImage = null
    },

    annulerEdition() {
      this.reinitialiserFormulaire()
    },

    reinitialiserFormulaire() {
      this.formulaire = { id: null, nom: '', prix: null, stock: null, image: '' }
      this.fichierImage = null
      this.modeEdition = false
      this.erreur = ''
    },

    async confirmerSuppression(produit) {
      if (!confirm(`Supprimer "${produit.nom}" ? Cette action est irréversible.`)) return

      try {
        await api.delete(`/produits/${produit.id}`)
        await this.chargerProduits()
        this.$emit('produit-modifie')
      } catch (err) {
        console.error('Erreur suppression:', err)
        alert('Erreur lors de la suppression')
      }
    },

    handleImgError(e) {
      e.target.onerror = null
      e.target.src = `${this.apiBaseUrl}/imageEcom/placeholder.jpg`
    }
  }
}
</script>

<style scoped>
.admin-panel { padding: 1rem; max-width: 700px; margin: 0 auto; }
.admin-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 1rem; }
.admin-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}
.admin-form input {
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}
.form-actions { display: flex; gap: 8px; margin-top: 4px; }
.btn-primary {
  background: #2563eb; color: #fff; border: none; padding: 8px 16px;
  border-radius: 6px; cursor: pointer; font-weight: 600;
}
.btn-secondary {
  background: #e5e7eb; border: none; padding: 8px 16px;
  border-radius: 6px; cursor: pointer;
}
.erreur-msg { color: #dc2626; font-size: 0.85rem; }
.image-actuelle { font-size: 0.8rem; color: #6b7280; }

.admin-list { display: flex; flex-direction: column; gap: 10px; }
.admin-item {
  display: flex; align-items: center; gap: 12px;
  border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px;
}
.admin-item-img { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; }
.admin-item-info { flex: 1; display: flex; flex-direction: column; }
.admin-item-actions { display: flex; gap: 6px; }
.btn-edit, .btn-delete {
  border: none; padding: 6px 10px; border-radius: 6px;
  cursor: pointer; font-size: 0.8rem; font-weight: 600;
}
.btn-edit { background: #fbbf24; color: #1a1a2e; }
.btn-delete { background: #dc2626; color: #fff; }
</style>