<template>

  <!-- Container principal da Home -->
  <div class="container-fluid mt-4">
    <div class="row">

      <!-- Coluna da esquerda (cards de pedidos) -->
      <div class="col-md-4 border-end pe-3">
        <div class="card border-0 shadow-sm rounded-3 mb-4">
          <!-- Cabeçalho -->
          <div class="card-header bg-primary text-white rounded-top">
            <h5 class="mb-0">LISTA DE PEDIDOS</h5>
          </div>

          <!-- Corpo do card <CardDefault></CardDefault> -->
          <span>
            <!-- Irá carregar o card se for passado por props porem se não, mostra uma mensagem padrao-->
            <component v-if="cards_components" :is="cards_components" />
            <p v-else class="aviso01">Não a conteudo para os cards no momento</p>
          </span>


        </div>
      </div>

      <!-- Coluna da direita (outros dados / componentes) -->
      <div class="col-md-8">
        <div class="card border-0 shadow-sm rounded-3 mb-4">
          <div class="card-header bg-info text-white rounded-top">
            <!-- Aqui sera o Titulo ou o menu da pagina selecionada-->
            <component v-if="sub_menu" :is="sub_menu" @select="handeleSelect" ></component>
            <h5 v-else class="mb-0">Titulos ou menu de navegação aqui</h5>
          </div>
            <!-- Aqui sera tratado o que podera aparecer dentro desta estrutura -->
          <div class="card-body bg-light">
            <div v-if="sub_menu"> {{ bodypedidos }}



            </div>     
            <p v-if="!sub_menu">Para esta Pagina o apenas o titulo Menu não existe</p>
            <p class="card-text">Aqui você pode renderizar outro componente ou exibir dados dinâmicos.</p>
            
          </div>
        </div>
      </div>

    </div>
  </div>
</template>



<script>
import CardDefault from '@/components/cardDefault.vue';

export default {
  data () {
    return {
      bodypedidos: 'Selecione uma opção do menu' // elemento criado apenas para teste
    }
  },
  props: {
    cards_components: { // Especificando qual componente pode renderizar aqui
      type: [Object, String]
    },
    sub_menu: { // Especificando qual componente pode renderizar aqui
      type: [Object, String]
    }
  },
  components: {
    CardDefault
  },
  methods: {
    // Este metodo é executado toda ve que eu clico em um opção do submenu se ele existir
    handeleSelect(action){
      if(action === 'visualizar'){
        this.bodypedidos = 'Pagina de Visualização' // <--- aqui um exemplo que como carregar componente ou conteudo na opção que o usuario escolhers
      }else if(action === 'editar'){
        this.bodypedidos = ' Pagina de Ediçãos'
      }else if(action === 'excluir'){
        this.bodypedidos = "Pagina de Eclussão"
      }
    }
  }
}

</script>

<style scoped>

.aviso01{
  margin-top: 30px;
  color: brown;
}
</style>