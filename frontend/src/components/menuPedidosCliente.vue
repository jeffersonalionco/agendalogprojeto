<template>
  <!-- Menu apenas para a pagina de  pedidos do cliente não do fornecedor-->
 <ul class="nav nav-pills">
    <li class="nav-item">
      <button 
        class="btn btn-outline-primary me-2" 
        @click="$emit('select', 'visualizar')">
        Visualizar
      </button>
    </li>
    <li class="nav-item">
      <button 
        class="btn btn-outline-success me-2" 
        @click="$emit('select', 'editar')">
        Editar
      </button>
    </li>
    <li class="nav-item">
      <button 
        class="btn btn-outline-danger" 
        @click="$emit('select', 'excluir')">
        Excluir
      </button>
    </li>
  </ul>
</template>

<script>
export default {
  name: "SubMenu"
};
</script>

<style scoped>
.nav {
  padding: 0;
  margin: 0;
}

/* Pequeno ajuste para que os botões fiquem alinhados verticalmente no meio */
.nav-item button {
  display: inline-flex;
  align-items: center;
}
</style>