<template>
  <div class="login-view">
    <button
      type="button"
      class="login-theme-toggle"
      :title="isDark ? 'Ativar tema claro' : 'Ativar modo escuro'"
      @click="setTheme"
      aria-label="Alternar tema"
    >
      <i class="bi" :class="isDark ? 'bi-sun-fill' : 'bi-moon-stars-fill'"></i>
    </button>
    <LoginForms />
  </div>
</template>

<script>
import LoginForms from "@/components/LoginForms.vue";

export default {
  name: "LoginView",
  components: { LoginForms },
  inject: ['isDark', 'setTheme'],
};
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
  position: relative;
}

.login-theme-toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: background 0.2s;
}
.login-theme-toggle:hover {
  background: rgba(255, 255, 255, 0.25);
}
</style>
