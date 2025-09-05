<template>

  <nav class="navbar navbar-expand-lg bg-primary navbar-dark c1">
    <div class="container-fluid">

      <!-- LOGO DO PROJETO -->
      <a class="navbar-brand " href="#">
        <img src="../assets/logo.png" alt="Logo do Projeto" class="logo-navbar">
      </a>


      <!-- BOTAO SANDUICHE É ACIONADO-->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu-principal"
        aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>


      <!-- iTENS DE NAVEGAÇÃO DO NAVBAR-->
      <div class="collapse navbar-collapse c2" id="menu-principal">
        <ul class="navbar-nav">
          <li class="nav-item">
            <router-link class="nav-link active" aria-current="page" :to="'/'">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :to="'/pedidos'">Pedidos</router-link>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Mais paginas
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">Visualizar</a></li>
              <li><a class="dropdown-item" href="#">Lancar</a></li>
              <li><a class="dropdown-item" href="#">Remover</a></li>
            </ul>
          </li>
        </ul>
      </div>


      <!--Configurações do Usuario-->
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link">Configurações</a>
        </li>

      </ul>

      <!--PROFILE DO USUARIO-->
      <img
        src="../assets/perfil.png"
        class="rounded-circle logoC1" alt="Logo">
    </div>
  </nav>



  <router-view />

</template>


<script>


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
  height: 100%;         /* Faz a imagem ocupar toda a altura da navbar */
  max-height: 80px;     /* Define um limite (ajuste conforme o tamanho da navbar) */
  width: auto;          /* Mantém a proporção da imagem */
  object-fit: contain;  /* Garante que a logo não distorça */
}
</style>
