<script setup>
import { ref, computed, onMounted } from 'vue'
import api from './services/api'
import Cart from './components/Cart.vue'
import ProductList from './components/ProductList.vue'
import AdminProduits from './components/AdminProduits.vue'
import Login from './components/Login.vue'

const produits = ref([])
const recherche = ref('')
const cartItems = ref([])
const vueAdmin = ref(false)
const estConnecte = ref(!!localStorage.getItem('adminToken'))
const commandeEnCours = ref(false)
const messageCommande = ref('')
const erreurCommande = ref('')

const seDeconnecter = () => {
  localStorage.removeItem('adminToken')
  estConnecte.value = false
  vueAdmin.value = false
}

// computed → filtre les produits selon la recherche
const produitsFiltres = computed(() => {
  return produits.value.filter(p =>
    p.nom.toLowerCase().includes(recherche.value.toLowerCase())
  )
})

// computed → total articles dans le panier (badge header)
const totalItems = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.qty, 0)
})

// ─── API ───────────────────────────────────
const chargerProduits = async () => {
  const res = await api.get('/produits')
  produits.value = res.data
}

onMounted(() => {
  chargerProduits()
})

// ─── Panier ────────────────────────────────
const ajouterAuPanier = (produit) => {
  const existe = cartItems.value.find(item => item.id === produit.id)
  if (existe) {
    existe.qty++
  } else {
    cartItems.value.push({ ...produit, qty: 1 })
  }
}

const augmenterQty = (id) => {
  const item = cartItems.value.find(item => item.id === id)
  if (item) item.qty++
}

const diminuerQty = (id) => {
  const item = cartItems.value.find(item => item.id === id)
  if (item) {
    item.qty--
    if (item.qty === 0) supprimerItem(id)
  }
}

const supprimerItem = (id) => {
  cartItems.value = cartItems.value.filter(item => item.id !== id)
}

const validerCommande = async () => {
  if (cartItems.value.length === 0) return

  commandeEnCours.value = true
  erreurCommande.value = ''
  messageCommande.value = ''

  const items = cartItems.value.map(item => ({ id: item.id, qty: item.qty }))

  try {
    const res = await api.post('/commandes', { items })
    messageCommande.value = `Commande validée ! Numéro : ${res.data.numero}`
    cartItems.value = []
    await chargerProduits() // recharge le catalogue avec les stocks à jour
  } catch (err) {
    erreurCommande.value = err.response?.data?.message || 'Erreur lors de la validation de la commande'
  } finally {
    commandeEnCours.value = false
  }
}

</script>

<template>
<aside class="cart-section">
  <Cart
    :cartItems="cartItems"
    @increase-qty="augmenterQty"
    @decrease-qty="diminuerQty"
    @remove-item="supprimerItem"
  >
    <template #empty>
      <p class="cart-empty">Votre panier est vide 🛒</p>
    </template>
  </Cart>

  <button
    v-if="cartItems.length > 0"
    class="btn-valider-commande"
    :disabled="commandeEnCours"
    @click="validerCommande"
  >
    {{ commandeEnCours ? 'Traitement...' : 'Valider la commande' }}
  </button>

  <p v-if="messageCommande" class="commande-succes">{{ messageCommande }}</p>
  <p v-if="erreurCommande" class="commande-erreur">{{ erreurCommande }}</p>
</aside>
  
  <div class="app">

    <!-- Header -->
    <header class="header">
      <h1>🛒 Ma Boutique</h1>
      <span v-if="totalItems > 0" class="header-badge">{{ totalItems }}</span>
      <button class="btn-toggle-admin" @click="vueAdmin = !vueAdmin">
        {{ vueAdmin ? '← Retour boutique' : '⚙️ Admin' }}
      </button>
    </header>

    <!-- Vue Admin -->
    <AdminProduits v-if="vueAdmin && estConnecte" @produit-modifie="chargerProduits" />
    <Login v-else-if="vueAdmin && !estConnecte" @connecte="estConnecte = true" />

    <!-- Deconnection -->

    <button v-if="vueAdmin && estConnecte" class="btn-toggle-admin" @click="seDeconnecter">
  🚪 Déconnexion
    </button>

    <!-- Vue Boutique -->
    <template v-else>
      <!-- Barre de recherche -->
      <input
        v-model="recherche"
        class="search-input"
        placeholder="Rechercher un produit..."
      />

      <div class="layout">

        <!-- Colonne gauche : composant ProductList -->
        <main class="produits-section">
          <ProductList
            :produits="produitsFiltres"
            @add-to-cart="ajouterAuPanier"
          />
          <p v-if="produitsFiltres.length === 0" class="empty-msg">
            Aucun produit trouvé
          </p>
        </main>

        <!-- Colonne droite : composant Cart -->
        <aside class="cart-section">
          <Cart
            :cartItems="cartItems"
            @increase-qty="augmenterQty"
            @decrease-qty="diminuerQty"
            @remove-item="supprimerItem"
          >
            <template #empty>
              <p class="cart-empty">Votre panier est vide 🛒</p>
            </template>
          </Cart>
        </aside>

      </div>
    </template>

  </div>
</template>

<style scoped>
.app {
  font-family: 'Segoe UI', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
}

.header-badge {
  background: #2563eb;
  color: white;
  border-radius: 50%;
  padding: 2px 8px;
  font-size: 0.85rem;
  font-weight: 700;
}

.btn-toggle-admin {
  margin-left: auto;
  background: #1a1a2e;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
}
.btn-toggle-admin:hover { background: #2d2d4a; }

.search-input {
  width: 100%;
  padding: 0.6rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
  align-items: start;
}

.empty-msg {
  text-align: center;
  color: #9ca3af;
  padding: 2rem 0;
}

.cart-empty {
  text-align: center;
  color: #9ca3af;
  padding: 2rem 0;
  font-size: 0.88rem;
}
.btn-valider-commande {
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  background: #16a34a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn-valider-commande:hover:not(:disabled) { background: #15803d; }
.btn-valider-commande:disabled { background: #d1d5db; cursor: not-allowed; }

.commande-succes {
  margin-top: 10px;
  color: #16a34a;
  font-weight: 600;
  font-size: 0.85rem;
  text-align: center;
}
.commande-erreur {
  margin-top: 10px;
  color: #dc2626;
  font-weight: 600;
  font-size: 0.85rem;
  text-align: center;
}

</style>