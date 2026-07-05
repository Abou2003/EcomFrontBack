<template>
  <aside class="cart-panel">
    <h2 class="section-title">
      Panier
      <span v-if="totalItems > 0" class="cart-badge">
        {{ totalItems }} article{{ totalItems > 1 ? 's' : '' }}
      </span>
    </h2>

    <div v-if="cartItems.length === 0">
      <slot name="empty" />
    </div>

    <div v-else>
      <div
        v-for="item in cartItems"
        :key="item.id"
        class="cart-item"
      >
        <div class="ci-top">
          <span class="ci-name">{{ item.nom }}</span>  <!-- nom au lieu de name -->
          <button class="btn-del" @click="$emit('remove-item', item.id)">Supprimer</button>
        </div>

        <div class="ci-bottom">
          <div class="qty-ctrl">
            <button class="btn-qty" @click="$emit('decrease-qty', item.id)">−</button>
            <span class="qty-val">{{ item.qty }}</span>
            <button class="btn-qty" @click="$emit('increase-qty', item.id)">+</button>
          </div>

          <div class="ci-prices">
            <span class="ci-unit">{{ item.prix.toLocaleString() }} FCFA / u</span>  <!-- prix FCFA -->
            <span class="ci-total">{{ (item.prix * item.qty).toLocaleString() }} FCFA</span>
          </div>
        </div>
      </div>

      <div class="cart-total">
        <span class="total-label">Total</span>
        <span class="total-amount">{{ totalAmount.toLocaleString() }} FCFA</span>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'Cart',

  props: {
    cartItems: {
      type: Array,
      required: true,
    },
  },

  emits: ['increase-qty', 'decrease-qty', 'remove-item'],

  computed: {
    totalItems() {
      return this.cartItems.reduce((sum, item) => sum + item.qty, 0)
    },
    totalAmount() {
      return this.cartItems.reduce((sum, item) => sum + item.prix * item.qty, 0)
    },
  },
}
</script>

<style scoped>
.cart-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  position: sticky;
  top: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-badge {
  font-size: 0.72rem;
  font-weight: 600;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 2px 10px;
  border-radius: 20px;
}

.cart-item {
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cart-item:last-of-type { border-bottom: none; }

.ci-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ci-name { font-size: 0.88rem; font-weight: 600; color: #1a1a2e; }

.btn-del {
  font-size: 0.75rem;
  color: #dc2626;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}
.btn-del:hover { color: #b91c1c; }

.ci-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.qty-ctrl { display: flex; align-items: center; gap: 6px; }

.btn-qty {
  width: 26px;
  height: 26px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
  color: #1a1a2e;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s;
}
.btn-qty:hover { background: #e5e7eb; }

.qty-val {
  font-size: 0.88rem;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
  color: #1a1a2e;
}

.ci-prices { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.ci-unit  { font-size: 0.75rem; color: #9ca3af; }
.ci-total { font-size: 0.9rem; font-weight: 700; color: #1a1a2e; }

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 2px solid #e5e7eb;
}
.total-label  { font-size: 0.95rem; font-weight: 600; color: #1a1a2e; }
.total-amount { font-size: 1.2rem; font-weight: 700; color: #2563eb; }
</style>