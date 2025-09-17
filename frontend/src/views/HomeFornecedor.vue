<template>
  <!-- Verificação se o usuário está logado -->

  <div>
<!-- Menu fixo no topo para todas as paginas -->
<menuDefault></menuDefault>


   <p>Tela de Fornecedor</p>


  </div>

</template>

<script>
// @ is an alias to /src
 import menuDefault from '@/components/menuDefault.vue'



export default {
  name: 'HomeFornecedor',
  components: { menuDefault },
  methods: {

  },
  data() {
    return {
     
    }
  }



}




</script>

<style scoped>
/* só para dar uma suavizada no layout */
</style>
