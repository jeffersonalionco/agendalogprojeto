<template>
  <div class="login-view">
    <div class="login-view__bg" aria-hidden="true">
      <span class="login-view__orb login-view__orb--1"></span>
      <span class="login-view__orb login-view__orb--2"></span>
    </div>

    <button
      type="button"
      class="login-theme-toggle"
      :title="isDark ? 'Ativar tema claro' : 'Ativar modo escuro'"
      @click="setTheme"
      aria-label="Alternar tema"
    >
      <i class="bi" :class="isDark ? 'bi-sun-fill' : 'bi-moon-stars-fill'"></i>
    </button>

    <main class="login-view__main">
      <LoginForms />
    </main>
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
/* fundo da pagina de login */

.login-view {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(160deg, #2c3e50 0%, #1a252f 45%, #243447 100%);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  padding: 1rem;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.login-view__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.login-view__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.35;
}

.login-view__orb--1 {
  width: 280px;
  height: 280px;
  top: -80px;
  right: -60px;
  background: #42b983;
}

.login-view__orb--2 {
  width: 220px;
  height: 220px;
  bottom: 10%;
  left: -70px;
  background: #34495e;
  opacity: 0.5;
}

.login-view__main {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  flex: 0 1 auto;
}

/* botao claro/escuro */
.login-theme-toggle {
  position: absolute;
  z-index: 2;
  top: max(1rem, env(safe-area-inset-top));
  right: max(1rem, env(safe-area-inset-right));
  width: 44px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: background 0.2s, transform 0.15s;
}

.login-theme-toggle:hover {
  background: rgba(255, 255, 255, 0.22);
}

.login-theme-toggle:active {
  transform: scale(0.94);
}

/* mobile - card embaixo */
@media (max-width: 767px) {
  .login-view {
    padding: 1.25rem 1rem 1.5rem;
    padding-top: max(3.5rem, calc(env(safe-area-inset-top) + 2.5rem));
    padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
    justify-content: flex-end;
  }

  .login-view__main {
    max-width: none;
  }

  .login-view__orb--1 {
    width: 200px;
    height: 200px;
    top: 8%;
    right: -40px;
    opacity: 0.28;
  }

  .login-view__orb--2 {
    width: 160px;
    height: 160px;
    bottom: 28%;
    left: -50px;
  }
}

/* desktop - card no meio */
@media (min-width: 768px) {
  .login-view {
    justify-content: center;
    padding: 2rem;
  }
}
</style>
