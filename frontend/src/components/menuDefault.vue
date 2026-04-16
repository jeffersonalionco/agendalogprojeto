<template>
  <header class="navbar-saas">
    <nav class="navbar navbar-expand-lg">
      <div class="navbar-container">
        <router-link class="navbar-brand" :to="homePath">
          <img :src="logo" alt="AgendaLog" class="navbar-brand__logo" />
        </router-link>

        <button
          ref="togglerRef"
          class="navbar-toggler navbar-toggler-mobile"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menu-principal"
          aria-controls="menu-principal"
          :aria-expanded="menuAberto"
          aria-label="Abrir menu"
        >
          <span class="navbar-toggler-icon">
            <span class="toggler-line toggler-line--1"></span>
            <span class="toggler-line toggler-line--2"></span>
            <span class="toggler-line toggler-line--3"></span>
          </span>
        </button>

        <div
          ref="menuCollapse"
          class="collapse navbar-collapse navbar-collapse-saas"
          id="menu-principal"
          v-on="{
            'show.bs.collapse': onMenuCollapseShow,
            'hide.bs.collapse': onMenuCollapseHide,
          }"
        >
          <!-- mobile painel unico com tudo -->
          <div class="navbar-mobile-panel">
            <!-- sessao (mobile) -->
            <div class="navbar-mobile-session">
              <span class="navbar-mobile-session__item">
                <i class="bi bi-calendar3"></i>
                {{ dataAtual }}
              </span>
              <span class="navbar-mobile-session__item" :class="getTempoClass()">
                <i class="bi bi-clock"></i>
                {{ tempoRestante }}
              </span>
            </div>

            <!-- links com icones -->
            <ul class="navbar-nav navbar-nav-main">
              <li v-for="menu in menuFilter" :key="menu.path" class="nav-item">
                <router-link
                  class="nav-link nav-link-saas nav-link-mobile"
                  :to="menu.path"
                  active-class="active"
                  exact
                  @click="fecharMenuMobile"
                >
                  <i class="bi nav-link-mobile__icon" :class="getMenuIcon(menu.path)"></i>
                  <span>{{ menu.label }}</span>
                  <i class="bi bi-chevron-right nav-link-mobile__arrow"></i>
                </router-link>
              </li>
            </ul>

            <!-- tema + conta (mobile) -->
            <div class="navbar-mobile-actions">
              <button
                type="button"
                class="navbar-mobile-action"
                :title="isDark ? 'Tema claro' : 'Modo escuro'"
                @click="setTheme"
                aria-label="Alternar tema"
              >
                <i class="bi" :class="isDark ? 'bi-sun-fill' : 'bi-moon-stars-fill'"></i>
                <span>{{ isDark ? 'Tema claro' : 'Modo escuro' }}</span>
              </button>
              <router-link to="/configuracoes" class="navbar-mobile-action" @click="fecharMenuMobile">
                <i class="bi bi-gear"></i>
                <span>Configurações</span>
                <i class="bi bi-chevron-right"></i>
              </router-link>
              <router-link to="/logout" class="navbar-mobile-action navbar-mobile-action--danger" @click="fecharMenuMobile">
                <i class="bi bi-box-arrow-right"></i>
                <span>Sair</span>
                <i class="bi bi-chevron-right"></i>
              </router-link>
            </div>
          </div>

          <!-- desktop layout original -->
          <ul class="navbar-nav navbar-nav-main navbar-nav-desktop">
            <li v-for="menu in menuFilter" :key="menu.path" class="nav-item">
              <router-link class="nav-link nav-link-saas" :to="menu.path" active-class="active" exact>
                {{ menu.label }}
              </router-link>
            </li>
          </ul>
          <ul class="navbar-nav navbar-nav-end navbar-nav-desktop">
            <li class="nav-item nav-session">
              <div class="nav-session__info">
                <span class="nav-session__date"><i class="bi bi-calendar3"></i> {{ dataAtual }}</span>
                <span class="nav-session__timer" :class="getTempoClass()"><i class="bi bi-clock"></i> {{ tempoRestante }}</span>
              </div>
            </li>
            <li class="nav-item">
              <button type="button" class="btn btn-icon" :title="isDark ? 'Tema claro' : 'Modo escuro'" @click="setTheme" aria-label="Alternar tema">
                <i class="bi" :class="isDark ? 'bi-sun-fill' : 'bi-moon-stars-fill'"></i>
              </button>
            </li>
            <li class="nav-item dropdown dropdown-user">
              <a class="nav-link dropdown-toggle nav-link-user" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <AvatarUsuario :src="imagemPerfilUsuario" alt="Perfil" size="32" class="nav-user-avatar" />
                <span class="nav-user-name">Conta</span>
                <i class="bi bi-chevron-down nav-user-chevron"></i>
              </a>
              <ul class="dropdown-menu dropdown-menu-end dropdown-menu-saas dropdown-menu-user">
                <li class="dropdown-header">
                  <div class="dropdown-header__label">Sessão</div>
                  <div class="dropdown-header__date">{{ dataAtual }}</div>
                  <div class="dropdown-header__timer" :class="getTempoClass()">{{ tempoRestante }}</div>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <router-link class="dropdown-item dropdown-item-saas" to="/configuracoes"><i class="bi bi-gear"></i> Configurações</router-link>
                </li>
                <li>
                  <router-link class="dropdown-item dropdown-item-saas dropdown-item-danger" to="/logout"><i class="bi bi-box-arrow-right"></i> Sair</router-link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>

  <router-view />
</template>

<script>
import { menus } from '@/config/menus'
import logoImg from '@/assets/logo.png'
import { jwtDecode } from 'jwt-decode'
import AvatarUsuario from '@/components/AvatarUsuario.vue'

export default {
  components: { AvatarUsuario },
  inject: ['isDark', 'setTheme'],
  data() {
    let user = null
    try {
      user = JSON.parse(localStorage.getItem('user')) || null
    } catch (e) {
      user = null
    }
    return {
      user,
      logo: logoImg,
      imagemPerfilUsuario: null,
      dataAtual: '',
      tempoRestante: '--:--:--',
      intervaloData: null,
      intervaloTempo: null,
      tokenExpiraEm: null,
      menuAberto: false,
    }
  },
  computed: {
    menuFilter() {
      if (!this.user) return []
      return menus.filter((menu) => menu.roles.includes(this.user.tipo))
    },
    homePath() {
      if (!this.user || !this.user.tipo) return '/'
      const base = { admin: '/admin', cliente: '/cliente', fornecedor: '/fornecedor' }
      return base[this.user.tipo] || '/'
    },
  },
  mounted() {
    this.carregarImagemPerfil()
    this.inicializarTemporizador()
    this.atualizarData()
    window.addEventListener('storage', this.carregarImagemPerfil)
    this.intervaloData = setInterval(() => this.atualizarData(), 60000)
    this.intervaloTempo = setInterval(() => this.atualizarTempoRestante(), 1000)
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.carregarImagemPerfil)
    if (this.intervaloData) clearInterval(this.intervaloData)
    if (this.intervaloTempo) clearInterval(this.intervaloTempo)
  },
  methods: {
    carregarImagemPerfil() {
      try {
        const userData = JSON.parse(localStorage.getItem('user'))
        this.imagemPerfilUsuario = userData?.imagem_perfil || null
      } catch (e) {
        this.imagemPerfilUsuario = null
      }
    },
    inicializarTemporizador() {
      try {
        const userData = JSON.parse(localStorage.getItem('user'))
        if (userData?.token) {
          const decoded = jwtDecode(userData.token)
          if (decoded.exp) {
            this.tokenExpiraEm = decoded.exp * 1000
            this.atualizarTempoRestante()
          }
        }
      } catch (e) {
        this.tempoRestante = 'Erro'
      }
    },
    atualizarTempoRestante() {
      if (!this.tokenExpiraEm) {
        this.tempoRestante = '--:--:--'
        return
      }
      const diff = this.tokenExpiraEm - Date.now()
      if (diff <= 0) {
        this.tempoRestante = 'Expirado'
        setTimeout(() => {
          localStorage.removeItem('user')
          this.$router.push('/login')
        }, 2000)
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      this.tempoRestante = [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
    },
    atualizarData() {
      const agora = new Date()
      this.dataAtual = agora.toLocaleDateString('pt-BR', {
        weekday: 'short',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    },
    getTempoClass() {
      if (!this.tokenExpiraEm) return ''
      const min = (this.tokenExpiraEm - Date.now()) / 60000
      if (min < 5) return 'text-danger fw-semibold'
      if (min < 15) return 'text-warning fw-semibold'
      return 'text-muted'
    },
    getMenuIcon(path) {
      const icons = { '/admin': 'bi-house-door', '/cliente': 'bi-house-door', '/fornecedor': 'bi-house-door', '/pedidos': 'bi-cart', '/produtos': 'bi-box-seam', '/usuarios': 'bi-people', '/configuracoes': 'bi-gear' }
      return icons[path] || 'bi-link-45deg'
    },
    fecharMenuMobile() {
      const el = this.$refs.menuCollapse
      if (!el) return
      const Collapse = window.bootstrap?.Collapse
      if (Collapse) {
        const instance = Collapse.getInstance(el) || new Collapse(el, { toggle: false })
        instance.hide()
      }
    },
    onMenuCollapseShow() {
      this.menuAberto = true
    },
    onMenuCollapseHide() {
      this.menuAberto = false
    },
  },
  watch: {
    $route() {
      this.carregarImagemPerfil()
      this.inicializarTemporizador()
      this.fecharMenuMobile()
    },
    user: { handler() { this.inicializarTemporizador() }, deep: true },
  },
}
</script>

<style scoped>
.navbar-saas {
  background: #0066FF;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.15), 0 4px 12px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 1030;
}

.navbar-saas .navbar {
  padding: 0;
  --bs-navbar-padding-y: 0;
}

.navbar-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  text-decoration: none;
  transition: opacity 0.2s;
}
.navbar-brand:hover {
  opacity: 0.9;
}

.navbar-brand__logo {
  height: 36px;
  width: auto;
  max-height: 40px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.navbar-toggler {
  border-color: rgba(255, 255, 255, 0.25);
  padding: 0.4rem 0.6rem;
}
.navbar-toggler:focus {
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}
.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255, 0.9)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

/* mobile botao hamburger maior e animado (pra clicar facil) */
.navbar-toggler-mobile {
  min-width: 48px;
  min-height: 48px;
  padding: 12px;
  border-radius: 12px;
  -webkit-tap-highlight-color: transparent;
}
.navbar-toggler-mobile .navbar-toggler-icon {
  width: 24px;
  height: 18px;
  background: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
}
.toggler-line {
  display: block;
  height: 2px;
  background: #fff;
  border-radius: 1px;
  transition: transform 0.25s ease, opacity 0.2s ease;
}
.navbar-toggler[aria-expanded="true"] .toggler-line--1 {
  transform: translateY(8px) rotate(45deg);
}
.navbar-toggler[aria-expanded="true"] .toggler-line--2 {
  opacity: 0;
}
.navbar-toggler[aria-expanded="true"] .toggler-line--3 {
  transform: translateY(-8px) rotate(-45deg);
}

.navbar-collapse-saas {
  flex-grow: 1;
  justify-content: space-between;
  padding-left: 2rem;
}

.navbar-nav-main {
  gap: 0.25rem;
}

.nav-link-saas {
  color: rgba(255, 255, 255, 0.85) !important;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem !important;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}
.nav-link-saas:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.1);
}
.nav-link-saas.active {
  color: #fff !important;
  background: rgba(66, 185, 131, 0.35);
}

.navbar-nav-end {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-session__info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0.35rem 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.3;
}
.nav-session__date,
.nav-session__timer {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.nav-session__timer.text-muted {
  color: rgba(255, 255, 255, 0.7) !important;
}

.btn-icon {
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: background 0.2s, color 0.2s;
}
.btn-icon:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.nav-link-user {
  display: inline-flex !important;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.6rem !important;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9) !important;
  text-decoration: none;
  transition: background 0.2s;
  border: 1px solid transparent;
}
.nav-link-user:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff !important;
}
.nav-link-user[aria-expanded="true"] {
  background: rgba(255, 255, 255, 0.12);
  color: #fff !important;
}

.nav-user-avatar {
  width: 32px;
  height: 32px;
  border: 2px solid rgba(255, 255, 255, 0.35);
}
.nav-user-avatar :deep(.avatar-usuario__img),
.nav-user-avatar :deep(.avatar-usuario__placeholder) {
  border-radius: 50%;
}
.nav-user-name {
  font-size: 0.875rem;
  font-weight: 500;
}
.nav-user-chevron {
  font-size: 0.7rem;
  opacity: 0.8;
  transition: transform 0.2s;
}
.nav-link-user[aria-expanded="true"] .nav-user-chevron {
  transform: rotate(180deg);
}

/* dropdowns estilo saas */
.dropdown-menu-saas {
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 0.5rem;
  min-width: 200px;
  margin-top: 0.35rem;
}
.dropdown-item-saas {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}
.dropdown-item-saas .bi {
  font-size: 1rem;
  opacity: 0.85;
}
.dropdown-item-saas:hover {
  background: rgba(0, 0, 0, 0.06);
}
.dropdown-item-danger:hover {
  background: rgba(220, 53, 69, 0.12);
  color: #dc3545;
}

.dropdown-menu-user {
  min-width: 240px;
}
.dropdown-header {
  padding: 0.75rem 0.75rem 0.5rem;
}
.dropdown-header__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted, #6c757d);
  margin-bottom: 0.25rem;
}
.dropdown-header__date,
.dropdown-header__timer {
  font-size: 0.8rem;
  color: var(--app-text, #2c3e50);
}

.dropdown-divider {
  margin: 0.35rem 0;
}

/* tema escuro ajustes no navbar (mantem barra escura) */
:deep(html.theme-dark) .dropdown-menu-saas {
  background: var(--card-bg);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}
:deep(html.theme-dark) .dropdown-item-saas {
  color: var(--app-text);
}
:deep(html.theme-dark) .dropdown-item-saas:hover {
  background: rgba(255, 255, 255, 0.08);
}
:deep(html.theme-dark) .dropdown-header__label {
  color: var(--muted);
}
:deep(html.theme-dark) .dropdown-header__date,
:deep(html.theme-dark) .dropdown-header__timer {
  color: var(--app-text);
}

/* desktop esconde painel mobile */
.navbar-mobile-panel {
  display: none;
}

@media (max-width: 991px) {
  .navbar-nav-desktop {
    display: none !important;
  }

  .navbar-mobile-panel {
    display: block;
    padding: 1rem 0;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0));
  }

  .navbar-container {
    padding: 0 1rem;
    min-height: 56px;
  }

  .navbar-collapse-saas {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #0066FF;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
    padding: 0;
    margin: 0;
    border-radius: 0 0 16px 16px;
    max-height: calc(100vh - 56px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .navbar-collapse-saas.collapsing {
    transition: height 0.3s ease;
  }

  /* sessao no topo do painel mobile */
  .navbar-mobile-session {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.85rem 1.25rem;
    margin: 0 1rem 0.75rem;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.95);
  }
  .navbar-mobile-session__item {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  /* links como linhas grandes com icone */
  .navbar-nav-main {
    margin-bottom: 0.5rem;
    padding: 0 0.75rem;
  }
  .nav-link-mobile {
    display: flex !important;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1rem !important;
    min-height: 52px;
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.95) !important;
    font-weight: 500;
    font-size: 1rem;
    margin-bottom: 0.35rem;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.2s;
  }
  .nav-link-mobile:active {
    background: rgba(255, 255, 255, 0.15);
  }
  .nav-link-mobile.active {
    background: rgba(255, 255, 255, 0.2);
    color: #fff !important;
  }
  .nav-link-mobile__icon {
    font-size: 1.35rem;
    opacity: 0.95;
    width: 28px;
    text-align: center;
  }
  .nav-link-mobile__arrow {
    margin-left: auto;
    font-size: 0.9rem;
    opacity: 0.7;
  }

  /* bloco tema + configuracoes + sair */
  .navbar-mobile-actions {
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    padding: 0.75rem 0.75rem 0;
    margin-top: 0.5rem;
  }
  .navbar-mobile-action {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    padding: 1rem 1rem;
    min-height: 52px;
    border: none;
    border-radius: 12px;
    background: transparent;
    color: rgba(255, 255, 255, 0.95);
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    margin-bottom: 0.35rem;
    transition: background 0.2s;
    -webkit-tap-highlight-color: transparent;
    cursor: pointer;
    text-align: left;
  }
  .navbar-mobile-action:active {
    background: rgba(255, 255, 255, 0.12);
  }
  .navbar-mobile-action .bi:first-child {
    font-size: 1.35rem;
    width: 28px;
    text-align: center;
  }
  .navbar-mobile-action span {
    flex: 1;
  }
  .navbar-mobile-action .bi-chevron-right {
    font-size: 0.9rem;
    opacity: 0.7;
  }
  .navbar-mobile-action--danger {
    color: rgba(255, 200, 200, 0.98);
  }
  .navbar-mobile-action--danger:active {
    background: rgba(220, 53, 69, 0.25);
  }

  .dropdown-menu-saas {
    margin-top: 0.25rem;
  }
}
</style>
