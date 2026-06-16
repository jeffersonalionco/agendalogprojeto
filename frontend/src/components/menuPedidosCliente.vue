<template>
  <div class="menu-acoes">
    <!-- desktop / tablet -->
    <div class="menu-acoes__desktop d-flex flex-wrap gap-2 align-items-center justify-content-end">
      <button
        v-if="podeCriar"
        class="btn btn-success btn-sm"
        type="button"
        :class="{ active: acaoAtual === 'criar' }"
        @click="emitAndClose('criar')"
        title="Criar novo pedido"
      >
        <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
        Criar Pedido
      </button>
      <button
        class="btn btn-outline-primary btn-sm"
        type="button"
        :class="{ active: acaoAtual === 'visualizar' }"
        :disabled="!temPedidoSelecionado"
        @click="emitAndClose('visualizar')"
        title="Visualizar pedido selecionado"
      >
        <i class="bi bi-eye me-1" aria-hidden="true"></i>
        Visualizar
      </button>
      <button
        class="btn btn-outline-success btn-sm"
        type="button"
        :class="{ active: acaoAtual === 'editar' }"
        :disabled="!temPedidoSelecionado"
        @click="emitAndClose('editar')"
        title="Editar pedido selecionado"
      >
        <i class="bi bi-pencil me-1" aria-hidden="true"></i>
        Editar
      </button>
      <button
        class="btn btn-outline-danger btn-sm"
        type="button"
        :class="{ active: acaoAtual === 'excluir' }"
        :disabled="!temPedidoSelecionado"
        @click="emitAndClose('excluir')"
        title="Excluir pedido selecionado"
      >
        <i class="bi bi-trash3 me-1" aria-hidden="true"></i>
        Excluir
      </button>
    </div>

    <!-- mobile: barra rápida + sheet opcional -->
    <div class="menu-acoes__mobile">
      <div
        class="menu-acoes__grid"
        :class="{ 'menu-acoes__grid--3': !podeCriar }"
        role="toolbar"
        aria-label="Ações do pedido"
      >
        <button
          v-if="podeCriar"
          type="button"
          class="menu-acoes__tile menu-acoes__tile--criar"
          :class="{ 'menu-acoes__tile--active': acaoAtual === 'criar' }"
          @click="emitAndClose('criar')"
        >
          <i class="bi bi-plus-circle-fill" aria-hidden="true"></i>
          <span>Criar</span>
        </button>
        <button
          type="button"
          class="menu-acoes__tile menu-acoes__tile--ver"
          :class="{ 'menu-acoes__tile--active': acaoAtual === 'visualizar' }"
          :disabled="!temPedidoSelecionado"
          @click="emitAndClose('visualizar')"
        >
          <i class="bi bi-eye-fill" aria-hidden="true"></i>
          <span>Ver</span>
        </button>
        <button
          type="button"
          class="menu-acoes__tile menu-acoes__tile--editar"
          :class="{ 'menu-acoes__tile--active': acaoAtual === 'editar' }"
          :disabled="!temPedidoSelecionado"
          @click="emitAndClose('editar')"
        >
          <i class="bi bi-pencil-square" aria-hidden="true"></i>
          <span>Editar</span>
        </button>
        <button
          type="button"
          class="menu-acoes__tile menu-acoes__tile--excluir"
          :class="{ 'menu-acoes__tile--active': acaoAtual === 'excluir' }"
          :disabled="!temPedidoSelecionado"
          @click="emitAndClose('excluir')"
        >
          <i class="bi bi-trash3-fill" aria-hidden="true"></i>
          <span>Excluir</span>
        </button>
      </div>

      <p v-if="!temPedidoSelecionado && podeCriar" class="menu-acoes__hint">
        Selecione um pedido na lista para ver, editar ou excluir.
      </p>
      <p v-else-if="!temPedidoSelecionado" class="menu-acoes__hint">
        Selecione um pedido na lista para gerenciar.
      </p>
      <p v-else-if="pedidoResumo" class="menu-acoes__hint menu-acoes__hint--pedido">
        <i class="bi bi-check2-circle" aria-hidden="true"></i>
        {{ pedidoResumo }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MenuPedidosCliente',
  props: {
    temPedidoSelecionado: {
      type: Boolean,
      default: false,
    },
    acaoAtual: {
      type: String,
      default: null,
    },
    podeCriar: {
      type: Boolean,
      default: true,
    },
    pedidoResumo: {
      type: String,
      default: '',
    },
  },
  emits: ['select'],
  methods: {
    emitAndClose(acao) {
      if (acao !== 'criar' && !this.temPedidoSelecionado) return
      this.$emit('select', acao)
    },
  },
}
</script>

<style scoped>
.menu-acoes {
  width: 100%;
}

.menu-acoes__desktop .btn.active {
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.85);
}

.menu-acoes__mobile {
  display: none;
  width: 100%;
}

.menu-acoes__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  width: 100%;
}

.menu-acoes__tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  min-height: 3.25rem;
  padding: 0.5rem 0.35rem;
  border: none;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.1;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  color: #fff;
}

.menu-acoes__tile i {
  font-size: 1.25rem;
}

.menu-acoes__tile:active:not(:disabled) {
  transform: scale(0.96);
}

.menu-acoes__tile:disabled {
  opacity: 0.38;
  cursor: not-allowed;
  filter: grayscale(0.3);
}

.menu-acoes__tile--criar {
  background: linear-gradient(145deg, #198754, #157347);
  box-shadow: 0 4px 12px rgba(25, 135, 84, 0.35);
}

.menu-acoes__tile--ver {
  background: linear-gradient(145deg, #0d6efd, #0a58ca);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

.menu-acoes__tile--editar {
  background: linear-gradient(145deg, #20c997, #1aa179);
  box-shadow: 0 4px 12px rgba(32, 201, 151, 0.3);
}

.menu-acoes__tile--excluir {
  background: linear-gradient(145deg, #dc3545, #b02a37);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.menu-acoes__tile--active {
  outline: 2px solid rgba(255, 255, 255, 0.95);
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.25);
}

.menu-acoes__hint {
  margin: 0.55rem 0 0;
  font-size: 0.78rem;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.88);
  text-align: center;
}

.menu-acoes__hint--pedido {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font-weight: 600;
}

@media (max-width: 767.98px) {
  .menu-acoes__desktop {
    display: none !important;
  }

  .menu-acoes__mobile {
    display: block;
  }

  .menu-acoes__grid--3 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .menu-acoes__mobile {
    display: none;
  }
}
</style>
