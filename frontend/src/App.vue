<script>
import { computed } from 'vue';
import ContainerNotificacoes from '@/components/ContainerNotificacoes.vue';

const THEME_KEY = 'theme';

export default {
  components: { ContainerNotificacoes },
  data() {
    const saved = typeof localStorage !== 'undefined' && localStorage.getItem(THEME_KEY) === 'dark';
    return { isDark: saved };
  },
  provide() {
    return {
      isDark: computed(() => this.isDark),
      setTheme: this.toggleTheme,
    };
  },
  mounted() {
    this.applyTheme();
  },
  methods: {
    toggleTheme() {
      this.isDark = !this.isDark;
      this.applyTheme();
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(THEME_KEY, this.isDark ? 'dark' : 'light');
      }
    },
    applyTheme() {
      const el = document.documentElement;
      if (this.isDark) el.classList.add('theme-dark');
      else el.classList.remove('theme-dark');
    },
  },
};
</script>

<template>
  <router-view />
  <!-- adicionei aqui para sempre carregar em todas as paginas -->
  <ContainerNotificacoes />
</template>

<style>
/* variaveis tema claro (padrao), deixei aqui pra nao virar bagunca */
:root {
  --app-bg: #f5f5f5;
  --app-text: #2c3e50;
  --card-bg: #ffffff;
  --card-border: rgba(0, 0, 0, 0.125);
  --input-bg: #ffffff;
  --input-border: #dee2e6;
  --input-text: #212529;
  --dropdown-bg: #ffffff;
  --dropdown-text: #212529;
  --border-color: #dee2e6;
  --muted: #6c757d;
}

/* tema escuro (pra nao cegar a noite) */
html.theme-dark {
  --app-bg: #1a1d21;
  --app-text: #e9ecef;
  --card-bg: #25282c;
  --card-border: rgba(255, 255, 255, 0.1);
  --input-bg: #2d3136;
  --input-border: #495057;
  --input-text: #e9ecef;
  --dropdown-bg: #25282c;
  --dropdown-text: #e9ecef;
  --border-color: #495057;
  --muted: #adb5bd;
}

body {
  background-color: var(--app-bg);
  color: var(--app-text);
}

html.theme-dark body {
  background-color: var(--app-bg);
  color: var(--app-text);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: var(--app-text);
  background-color: var(--app-bg);
  min-height: 100vh;
}

/* container e conteudo principal herda o fundo do tema, sem misterio */
html.theme-dark .container,
html.theme-dark .container-fluid {
  background-color: transparent;
}

/* home do cliente — garante contraste no tema escuro */
html.theme-dark .home-cliente__banner {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
}

html.theme-dark .home-cliente__stat-card,
html.theme-dark .home-cliente__card,
html.theme-dark .home-cliente__search-input,
html.theme-dark .home-cliente__detalhe {
  background: var(--card-bg);
  border-color: var(--card-border);
}

html.theme-dark .home-cliente__stat-num,
html.theme-dark .home-cliente__card-num,
html.theme-dark .home-cliente__detalhe-title {
  color: var(--app-text);
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: var(--app-text);
}

nav a.router-link-exact-active {
  color: #42b983;
}

/* override global pro tema escuro (bootstrap e umas parada), fiz na pressa msm */
html.theme-dark .card {
  background-color: var(--card-bg);
  border-color: var(--card-border);
  color: var(--app-text);
}

html.theme-dark .card-header {
  background-color: rgba(0, 0, 0, 0.2) !important;
  border-bottom-color: var(--card-border);
  color: var(--app-text);
}

html.theme-dark .card-body {
  background-color: var(--card-bg);
  color: var(--app-text);
}

/* bg-light usado em paines e card no tema escuro */
html.theme-dark .bg-light {
  background-color: var(--card-bg) !important;
  color: var(--app-text);
}

html.theme-dark .form-control,
html.theme-dark .form-select {
  background-color: var(--input-bg);
  border-color: var(--input-border);
  color: var(--input-text);
}

html.theme-dark .form-control::placeholder {
  color: var(--muted);
}

html.theme-dark .form-control:focus,
html.theme-dark .form-select:focus {
  background-color: var(--input-bg);
  border-color: #42b983;
  color: var(--input-text);
}

html.theme-dark .form-control:disabled {
  background-color: var(--input-bg);
  opacity: 0.8;
}

html.theme-dark .form-label,
html.theme-dark .text-muted {
  color: var(--muted) !important;
}

html.theme-dark .dropdown-menu {
  background-color: var(--dropdown-bg);
  border-color: var(--card-border);
}

html.theme-dark .dropdown-item {
  color: var(--dropdown-text);
}

html.theme-dark .dropdown-item:hover,
html.theme-dark .dropdown-item:focus {
  background-color: rgba(255, 255, 255, 0.08);
  color: var(--dropdown-text);
}

html.theme-dark .dropdown-divider {
  border-color: var(--card-border);
}

html.theme-dark .table {
  color: var(--app-text);
}

html.theme-dark .table thead th {
  background-color: rgba(0, 0, 0, 0.2);
  border-color: var(--card-border);
  color: var(--app-text);
}

html.theme-dark .table tbody td {
  border-color: var(--card-border);
}

html.theme-dark .table-light {
  background-color: rgba(255, 255, 255, 0.05);
}

html.theme-dark .table-striped > tbody > tr:nth-of-type(odd) {
  background-color: rgba(255, 255, 255, 0.03);
}

html.theme-dark .table-hover tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.06);
}

html.theme-dark .table-bordered,
html.theme-dark .table-bordered th,
html.theme-dark .table-bordered td {
  border-color: var(--card-border);
}

html.theme-dark .alert-success {
  background-color: rgba(25, 135, 84, 0.2);
  border-color: rgba(25, 135, 84, 0.4);
  color: #75c997;
}

html.theme-dark .alert-danger {
  background-color: rgba(220, 53, 69, 0.2);
  border-color: rgba(220, 53, 69, 0.4);
  color: #f5a2a2;
}

html.theme-dark .alert-warning {
  background-color: rgba(255, 193, 7, 0.15);
  border-color: rgba(255, 193, 7, 0.4);
  color: #e6c35c;
}

html.theme-dark .list-group-item {
  background-color: var(--card-bg);
  border-color: var(--card-border);
  color: var(--app-text);
}

html.theme-dark .list-group-item:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
}

html.theme-dark .modal-content {
  background-color: var(--card-bg);
  border-color: var(--card-border);
  color: var(--app-text);
}

html.theme-dark .modal-header,
html.theme-dark .modal-footer {
  border-color: var(--card-border);
}

html.theme-dark .btn-close {
  filter: invert(1);
}

/* botao claro (atualizar e tal) no tema escuro */
html.theme-dark .btn-light {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--app-text);
}
html.theme-dark .btn-light:hover {
  background-color: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.3);
  color: var(--app-text);
}

/* pagina de login card e campos no tema escuro, ajeitei pra ficar ok */
html.theme-dark .login-card {
  background-color: var(--card-bg);
  color: var(--app-text);
}
html.theme-dark .login-card__header {
  background: linear-gradient(180deg, #1a252f 0%, #25282c 100%) !important;
  color: #fff;
}
html.theme-dark .login-card__subtitle {
  color: rgba(255, 255, 255, 0.85);
}
html.theme-dark .login-field__label {
  color: var(--app-text);
}
html.theme-dark .login-field__input {
  background-color: var(--input-bg);
  border-color: var(--input-border);
  color: var(--input-text);
}
html.theme-dark .login-footer-text {
  color: var(--muted);
}
html.theme-dark .login-field__control:focus-within .login-field__icon {
  color: #42b983;
}
html.theme-dark .login-field__icon {
  color: var(--muted);
}
html.theme-dark .login-card__logo {
  background: rgba(66, 185, 131, 0.12);
  border-color: rgba(66, 185, 131, 0.35);
}
html.theme-dark .login-error {
  background-color: rgba(220, 53, 69, 0.12);
  border-color: rgba(220, 53, 69, 0.35);
  color: #f8a5a5;
}
</style>
