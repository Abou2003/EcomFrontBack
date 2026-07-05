<script setup>
import { ref, computed, onMounted } from 'vue'
import api from './services/api'
import Cart from './components/Cart.vue'
import ProductList from './components/ProductList.vue'

const produits = ref([])
const recherche = ref('')
const cartItems = ref([])

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
</script>

<template>
  <div class="app">

    <!-- Header -->
    <header class="header">
      <h1>🛒 Ma Boutique</h1>
      <span v-if="totalItems > 0" class="header-badge">{{ totalItems }}</span>
    </header>

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
</style>