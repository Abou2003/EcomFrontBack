<template>
  <div class="login-container">
    <form class="login-form" @submit.prevent="seConnecter">
      <h2>🔒 Connexion Admin</h2>
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="motDePasse" type="password" placeholder="Mot de passe" required />
      <button type="submit" class="btn-login">Se connecter</button>
      <p v-if="erreur" class="erreur-msg">{{ erreur }}</p>
    </form>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'Login',
  emits: ['connecte'],
  data() {
    return {
      email: '',
      motDePasse: '',
      erreur: '',
    }
  },
  methods: {
    async seConnecter() {
      this.erreur = ''
      try {
        const res = await api.post('/auth/login', {
          email: this.email,
          motDePasse: this.motDePasse,
        })
        localStorage.setItem('adminToken', res.data.token)
        this.$emit('connecte')
      } catch (err) {
        this.erreur = err.response?.data?.message || 'Erreur de connexion'
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f9fafb;
  padding: 2rem;
  border-radius: 12px;
  width: 300px;
}
.login-form h2 { text-align: center; margin-bottom: 8px; }
.login-form input {
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}
.btn-login {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.erreur-msg { color: #dc2626; font-size: 0.85rem; text-align: center; }
</style>