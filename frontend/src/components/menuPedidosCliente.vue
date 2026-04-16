<template>
  <!-- menu so pra pagina de pedidos do cliente (nao e do fornecedor) -->
  <div class="d-flex gap-2 align-items-center">
    <button 
      class="btn btn-success btn-sm" 
      @click="$emit('select', 'criar')"
      title="Criar novo pedido"
    >
      Criar Pedido
    </button>
    <button 
      class="btn btn-outline-primary btn-sm" 
      @click="$emit('select', 'visualizar')"
      title="Visualizar pedido selecionado"
    >
      Visualizar
    </button>
    <button 
      class="btn btn-outline-success btn-sm" 
      @click="$emit('select', 'editar')"
      title="Editar pedido selecionado"
    >
      Editar
    </button>
    <button 
      class="btn btn-outline-danger btn-sm" 
      @click="$emit('select', 'excluir')"
      title="Excluir pedido selecionado"
    >
      Excluir
    </button>
  </div>
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

/* ajuste pequeno pra deixar os botoes alinhado no meio */
.nav-item button {
  display: inline-flex;
  align-items: center;
}
</style>