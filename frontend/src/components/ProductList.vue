<template>
  <section class="product-list">
    <h2 class="section-title">Nos produits</h2>
    <div class="products-grid">
      <div
        v-for="produit in produits"
        :key="produit.id"
        class="product-card"
      >
        <img :src="`${apiBaseUrl}/imageEcom/${produit.image}`" :alt="produit.nom" class="product-img" @error="handleImgError" />
        <div class="product-body">
          <h3 class="product-name">{{ produit.nom }}</h3>
          <p class="product-price">{{ produit.prix.toLocaleString() }} FCFA</p>
          <p v-if="produit.stock > 0" class="product-stock">
            Stock : {{ produit.stock }}
          </p>
          <p v-else class="product-stock stock-out">
            ⚠️ Stock épuisé
          </p>
          <button
            class="btn-add"
            :disabled="produit.stock === 0"
            @click="$emit('add-to-cart', produit)"
          >
            {{ produit.stock === 0 ? 'Indisponible' : 'Ajouter au panier' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ProductList',
  props: {
    produits: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    }
  },
  emits: ['add-to-cart'],
 methods: {
  handleImgError(e) {
    e.target.onerror = null // empêche de redéclencher @error indéfiniment
    e.target.src = `${this.apiBaseUrl}/imageEcom/placeholder.jpg`
  }
},
  mounted() {
  console.log('apiBaseUrl:', this.apiBaseUrl)
  console.log('produits:', this.produits)
}
}
</script>

<style scoped>
.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1a1a2e;
}
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}
.product-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s;
}
.product-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.product-img {
  width: 100%;
  height: 130px;
  object-fit: cover;
  background: #f3f4f6;
}
.product-body {
  padding: 0.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.product-name  { font-size: 0.9rem; font-weight: 600; color: #1a1a2e; }
.product-price { font-size: 1rem; font-weight: 700; color: #2563eb; }
.product-stock { font-size: 0.78rem; color: #6b7280; }
.stock-out     { color: #dc2626; font-weight: 600; }
.btn-add {
  margin-top: auto;
  padding: 8px 0;
  font-size: 0.82rem;
  font-weight: 600;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-add:hover:not(:disabled) { background: #1d4ed8; }
.btn-add:disabled { background: #d1d5db; color: #9ca3af; cursor: not-allowed; }
</style>