<template>
  <!-- menu so pra pagina de pedidos do cliente (nao e do fornecedor) -->
  <div class="menu-acoes">
    <!-- desktop/tablet: botoes separados -->
    <div class="menu-acoes__desktop d-flex gap-2 align-items-center">
      <button
        class="btn btn-success btn-sm"
        type="button"
        @click="emitAndClose('criar')"
        title="Criar novo pedido"
      >
        Criar Pedido
      </button>
      <button
        class="btn btn-outline-primary btn-sm"
        type="button"
        @click="emitAndClose('visualizar')"
        title="Visualizar pedido selecionado"
      >
        Visualizar
      </button>
      <button
        class="btn btn-outline-success btn-sm"
        type="button"
        @click="emitAndClose('editar')"
        title="Editar pedido selecionado"
      >
        Editar
      </button>
      <button
        class="btn btn-outline-danger btn-sm"
        type="button"
        @click="emitAndClose('excluir')"
        title="Excluir pedido selecionado"
      >
        Excluir
      </button>
    </div>

    <!-- mobile: menu unico (mais “profissional” no toque) -->
    <div class="menu-acoes__mobile" ref="root">
      <button
        class="btn btn-light btn-sm menu-acoes__trigger"
        type="button"
        :aria-expanded="open ? 'true' : 'false'"
        aria-haspopup="menu"
        @click="toggle"
      >
        <i class="bi bi-three-dots-vertical" aria-hidden="true"></i>
        <span class="menu-acoes__trigger-label">Ações</span>
      </button>

      <div v-if="open" class="menu-acoes__popover" role="menu">
        <button class="menu-acoes__item" type="button" role="menuitem" @click="emitAndClose('criar')">
          <i class="bi bi-plus-circle" aria-hidden="true"></i>
          <span>Criar pedido</span>
        </button>
        <button class="menu-acoes__item" type="button" role="menuitem" @click="emitAndClose('visualizar')">
          <i class="bi bi-eye" aria-hidden="true"></i>
          <span>Visualizar</span>
        </button>
        <button class="menu-acoes__item" type="button" role="menuitem" @click="emitAndClose('editar')">
          <i class="bi bi-pencil-square" aria-hidden="true"></i>
          <span>Editar</span>
        </button>
        <button class="menu-acoes__item menu-acoes__item--danger" type="button" role="menuitem" @click="emitAndClose('excluir')">
          <i class="bi bi-trash3" aria-hidden="true"></i>
          <span>Excluir</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SubMenu",
  data() {
    return {
      open: false,
    }
  },
  beforeUnmount() {
    document.removeEventListener('click', this.onDocumentClick, true)
    document.removeEventListener('keydown', this.onKeyDown, true)
  },
  mounted() {
    document.addEventListener('click', this.onDocumentClick, true)
    document.addEventListener('keydown', this.onKeyDown, true)
  },
  methods: {
    toggle() {
      this.open = !this.open
    },
    close() {
      this.open = false
    },
    emitAndClose(acao) {
      this.$emit('select', acao)
      this.close()
    },
    onDocumentClick(e) {
      if (!this.open) return
      const root = this.$refs.root
      if (!root) return
      if (root.contains(e.target)) return
      this.close()
    },
    onKeyDown(e) {
      if (!this.open) return
      if (e.key === 'Escape') {
        e.preventDefault()
        this.close()
      }
    }
  }
};
</script>

<style scoped>
.menu-acoes__mobile {
  position: relative;
}

.menu-acoes__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.menu-acoes__trigger-label {
  font-weight: 600;
}

.menu-acoes__popover {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  min-width: 200px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.18);
  padding: 0.4rem;
  z-index: 20;
}

.menu-acoes__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.7rem;
  border: none;
  background: transparent;
  border-radius: 10px;
  color: #2c3e50;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}

.menu-acoes__item:hover,
.menu-acoes__item:focus {
  outline: none;
  background: rgba(13, 110, 253, 0.08);
}

.menu-acoes__item--danger {
  color: #b02a37;
}

.menu-acoes__item--danger:hover,
.menu-acoes__item--danger:focus {
  background: rgba(220, 53, 69, 0.12);
}

/* responsivo: no mobile vira menu unico */
@media (max-width: 576px) {
  .menu-acoes__desktop {
    display: none !important;
  }
}

@media (min-width: 577px) {
  .menu-acoes__mobile {
    display: none;
  }
}
</style>