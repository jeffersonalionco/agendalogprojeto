<template>
   <!-- Menu fixo no topo para todas as paginas -->
    <menuDefault></menuDefault>

    <!-- Criei uma estrutura padrao, para as paginas-->
    <estruturaBody :sub_menu="menuPedidosCliente"> </estruturaBody>

</template>

<script >
import menuDefault from '../components/menuDefault.vue'
import estruturaBody from '@/components/estruturaBody.vue';
import menuPedidosCliente from '@/components/menuPedidosCliente.vue';

export default {
    data () {
        return {
            menuPedidosCliente
        }
    },
    components: {
        menuDefault, 
        estruturaBody
    }
}

</script>