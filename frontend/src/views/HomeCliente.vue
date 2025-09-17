<template>
  <!-- Verificação se o usuário está logado -->

  <div>

    <!-- Menu fixo no topo para todas as paginas -->
    <menuDefault></menuDefault>

    <!-- Criei uma estrutura padrao, para as paginas-->
    <estruturaBody :cards_components="CardDefault"></estruturaBody>


  </div>

</template>

<script>
// @ is an alias to /src
import menuDefault from '@/components/menuDefault.vue'
import estruturaBody from '@/components/estruturaBody.vue';
import CardDefault from '@/components/cardDefault.vue';



export default {
  name: 'HomeCliente',
  components: { menuDefault, estruturaBody },
  methods: {

  },
  data() {
    return {
      CardDefault
    }
  }



}




</script>

<style scoped>
/* só para dar uma suavizada no layout */
</style>
