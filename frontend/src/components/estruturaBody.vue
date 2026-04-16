<template>

  <!-- container principal da home -->
  <div class="container-fluid mt-4">
    <div class="row">

      <!-- coluna da esquerda (cards de pedidos) -->
      <div class="col-md-4 border-end pe-3">
        <div class="card border-0 shadow-sm rounded-3 mb-4">
          <!-- cabecalho -->
          <div class="card-header bg-primary text-white rounded-top">
            <h5 class="mb-0">LISTA DE PEDIDOS</h5>
          </div>

          <!-- corpo do card <CardDefault></CardDefault> -->
          <span>
            <!-- vai carregar o card se vier por props, se nao vier mostra msg padrao msm -->
            <component v-if="cards_components" :is="cards_components" />
            <p v-else class="aviso01">Não a conteudo para os cards no momento</p>
          </span>


        </div>
      </div>

      <!-- coluna da direita (outros dados / componentes) -->
      <div class="col-md-8">
        <div class="card border-0 shadow-sm rounded-3 mb-4">
          <div class="card-header bg-info text-white rounded-top">
            <!-- aqui fica o titulo ou o menu da pagina selecionada -->
            <component v-if="sub_menu" :is="sub_menu" @select="handeleSelect" ></component>
            <h5 v-else class="mb-0">Titulos ou menu de navegação aqui</h5>
          </div>
            <!-- aqui eu trato o que vai aparecer dentro dessa estrutura -->
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
      bodypedidos: 'Selecione uma opção do menu' // fiz isso so pra testar rapido
    }
  },
  props: {
    cards_components: { // qual componente pode renderizar aqui
      type: [Object, String]
    },
    sub_menu: { // qual componente pode renderizar aqui
      type: [Object, String]
    }
  },
  components: {
    CardDefault
  },
  methods: {
    // esse metodo roda toda vez q eu clico em alguma opcao do submenu (se existir)
    handeleSelect(action){
      if(action === 'visualizar'){
        this.bodypedidos = 'Pagina de Visualização' // exemplo bem tosco de como trocar conteudo qndo o user clica
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