<template>
  <nav class="navbar navbar-expand-lg bg-primary navbar-dark c1">
    <div class="container-fluid">
      <!-- LOGO DO PROJETO -->
      <a class="navbar-brand" href="#">
        <img :src="logo" alt="Logo do Projeto" class="logo-navbar">
      </a>

      <!-- BOTÃO SANDUÍCHE -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu-principal"
        aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- ITENS DE NAVEGAÇÃO -->
      <div class="collapse navbar-collapse c2" id="menu-principal">
        <ul class="navbar-nav">
          <li v-for="menu in menuFilter" :key="menu.path" class="nav-item">
            <router-link class="nav-link" :to="menu.path" active-class="active" exact>
              {{ menu.label }}
            </router-link>
          </li>

          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Mais páginas
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">Visualizar</a></li>
              <li><a class="dropdown-item" href="#">Lançar</a></li>
              <li><a class="dropdown-item" href="#">Remover</a></li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- Configurações do Usuário -->
      <ul class="navbar-nav ms-auto">
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Configurações
          </a>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <router-link class="dropdown-item" to="/configuracoes">Configurações</router-link>
            </li>
            <li>
              <router-link class="dropdown-item" to="/logout">Sair</router-link>
            </li>
          </ul>
        </li>
      </ul>


      <!-- PROFILE DO USUÁRIO -->
      <img :src="perfil" class="rounded-circle logoC1" alt="Perfil">
    </div>
  </nav>

  <router-view />
</template>

<script>
import { menus } from '@/config/menus'
import logoImg from '@/assets/logo.png'
import perfilImg from '@/assets/perfil.png'

export default {
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
      perfil: perfilImg
    }
  },
  computed: {
    menuFilter() {
      if (!this.user) return []
      // Filtra apenas os menus que o tipo do usuário tem acesso
      return menus.filter(menu => menu.roles.includes(this.user.tipo))
    }
  }
}
</script>

<style scoped>
.c1 {
  height: 100px;
}

.c2 {
  padding-left: 50px;
}

.logoC1 {
  height: 80px;
}

.logo-navbar {
  height: 100%;
  max-height: 80px;
  width: auto;
  object-fit: contain;
}
</style>
