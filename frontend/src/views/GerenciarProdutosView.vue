<template>
  <div class="admin-page">
    <menuDefault />

    <header class="admin-page__banner">
      <div class="admin-page__banner-inner">
        <p class="admin-page__banner-greet">Administração</p>
        <h1 class="admin-page__banner-title">Gerenciar Produtos</h1>
        <p class="admin-page__banner-sub">{{ resumoProdutos }}</p>
      </div>
    </header>

    <div class="admin-page__content">
      <div v-if="mensagemSucesso" class="alert alert-success alert-dismissible fade show admin-page__alert">
        {{ mensagemSucesso }}
        <button type="button" class="btn-close" @click="mensagemSucesso = ''"></button>
      </div>
      <div v-if="mensagemErro" class="alert alert-danger alert-dismissible fade show admin-page__alert">
        {{ mensagemErro }}
        <button type="button" class="btn-close" @click="mensagemErro = ''"></button>
      </div>

      <div class="admin-page__toolbar admin-page__desktop-only">
        <h2 class="admin-page__toolbar-title">
          <i class="bi bi-box-seam" aria-hidden="true"></i>
          Catálogo de produtos
        </h2>
        <button type="button" class="btn admin-page__btn-primary" @click="abrirFormulario">
          <i class="bi bi-plus-circle me-2"></i>
          Novo produto
        </button>
      </div>

      <div v-if="!carregando && produtos.length > 0" class="admin-page__search">
        <input
          v-model="termoBusca"
          type="search"
          enterkeyhint="search"
          autocomplete="off"
          class="admin-page__search-input"
          placeholder="Buscar por código, descrição ou ID..."
        />
        <span v-if="termoBusca && produtosFiltrados.length !== produtos.length" class="admin-page__search-hint">
          {{ produtosFiltrados.length }} de {{ produtos.length }} produtos
        </span>
      </div>

      <!-- formulário -->
      <div v-if="mostrarFormulario" class="admin-page__form-panel">
        <div
          class="admin-page__form-header"
          :class="editandoId ? 'admin-page__form-header--edit' : 'admin-page__form-header--create'"
        >
          <i :class="editandoId ? 'bi bi-pencil-fill' : 'bi bi-plus-circle-fill'" aria-hidden="true"></i>
          {{ editandoId ? 'Editar produto' : 'Novo produto' }}
        </div>
        <div class="admin-page__form-body">
          <form @submit.prevent="editandoId ? salvarEdicao() : criarProduto()">
            <div class="row g-3">
              <div class="col-12 col-md-4">
                <label class="form-label">Código interno *</label>
                <input v-model="form.codigo_interno" type="text" class="form-control" required placeholder="Ex: ARRZ001" />
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label">Código de barras</label>
                <input v-model="form.codigo_barras" type="text" class="form-control" placeholder="Opcional" />
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label">Quantidade estoque *</label>
                <input v-model.number="form.quantidade_estoque" type="number" min="0" class="form-control" required />
              </div>
              <div class="col-12">
                <label class="form-label">Descrição *</label>
                <input v-model="form.descricao" type="text" class="form-control" required placeholder="Nome do produto" />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Valor de custo (R$) *</label>
                <input v-model.number="form.valor_custo" type="number" step="0.01" min="0" class="form-control" required />
              </div>
              <div class="col-12 col-md-6">
                <label class="form-label">Valor de venda (R$) *</label>
                <input v-model.number="form.valor_venda" type="number" step="0.01" min="0" class="form-control" required />
              </div>
            </div>
            <div class="admin-page__form-actions">
              <button type="button" class="btn admin-page__btn-ghost" @click="cancelarForm">Cancelar</button>
              <button type="submit" class="btn admin-page__btn-primary" :disabled="salvando">
                <span v-if="salvando" class="spinner-border spinner-border-sm me-2"></span>
                {{ editandoId ? 'Salvar alterações' : 'Criar produto' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- lista -->
      <section class="admin-page__section">
        <div class="admin-page__section-header admin-page__mobile-only">
          <h2 class="admin-page__section-title">Produtos</h2>
          <button type="button" class="btn btn-sm admin-page__btn-ghost" :disabled="carregando" @click="carregarProdutos">
            <span v-if="carregando" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
        <div class="admin-page__section-body">
          <div v-if="carregando" class="admin-page__loading">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 mb-0">Carregando produtos...</p>
          </div>
          <div v-else-if="produtos.length === 0" class="admin-page__empty">
            <span class="admin-page__empty-icon">📦</span>
            <p class="mb-2">Nenhum produto cadastrado.</p>
            <button type="button" class="btn admin-page__btn-primary" @click="abrirFormulario">
              Cadastrar produto
            </button>
          </div>
          <div v-else-if="termoBusca && produtosFiltrados.length === 0" class="admin-page__empty">
            <p class="mb-0">Nenhum produto para "{{ termoBusca }}"</p>
          </div>
          <template v-else>
            <div class="admin-page__cards admin-page__mobile-only">
              <article v-for="p in produtosFiltrados" :key="p.id" class="admin-page__item-card">
                <div class="admin-page__item-card-top">
                  <h3 class="admin-page__item-card-title">{{ p.descricao }}</h3>
                  <span class="admin-page__badge admin-page__badge--default">{{ p.codigo_interno }}</span>
                </div>
                <div class="admin-page__item-card-meta">
                  <span><i class="bi bi-box me-1"></i>Estoque: {{ p.quantidade_estoque }}</span>
                  <span><i class="bi bi-tag me-1"></i>Custo: R$ {{ formatarValor(p.valor_custo) }}</span>
                  <span><i class="bi bi-currency-dollar me-1"></i>Venda: R$ {{ formatarValor(p.valor_venda) }}</span>
                  <span v-if="p.codigo_barras"><i class="bi bi-upc me-1"></i>{{ p.codigo_barras }}</span>
                </div>
                <div class="admin-page__item-card-actions">
                  <button type="button" class="btn btn-outline-primary btn-sm" @click="editarProduto(p)">
                    <i class="bi bi-pencil-fill me-1"></i>Editar
                  </button>
                  <button type="button" class="btn btn-outline-danger btn-sm" @click="confirmarExcluir(p)">
                    <i class="bi bi-trash-fill me-1"></i>Excluir
                  </button>
                </div>
              </article>
            </div>

            <div class="admin-page__table-wrap admin-page__desktop-only">
              <table class="admin-page__table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Estoque</th>
                    <th>Custo</th>
                    <th>Venda</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in produtosFiltrados" :key="p.id">
                    <td>{{ p.id }}</td>
                    <td><strong>{{ p.codigo_interno }}</strong></td>
                    <td>{{ p.descricao }}</td>
                    <td>{{ p.quantidade_estoque }}</td>
                    <td>R$ {{ formatarValor(p.valor_custo) }}</td>
                    <td>R$ {{ formatarValor(p.valor_venda) }}</td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-outline-primary" title="Editar" @click="editarProduto(p)">
                          <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger" title="Excluir" @click="confirmarExcluir(p)">
                          <i class="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </section>
    </div>

    <button
      v-if="!mostrarFormulario"
      type="button"
      class="admin-page__fab admin-page__mobile-only"
      aria-label="Novo produto"
      @click="abrirFormulario"
    >
      <i class="bi bi-plus-lg" aria-hidden="true"></i>
    </button>
  </div>
</template>

<script>
import menuDefault from '@/components/menuDefault.vue'
import { produtosAPI } from '@/services/api.js'

export default {
  name: 'GerenciarProdutosView',
  components: { menuDefault },
  data() {
    return {
      produtos: [],
      carregando: false,
      salvando: false,
      mostrarFormulario: false,
      editandoId: null,
      mensagemSucesso: '',
      mensagemErro: '',
      termoBusca: '',
      form: {
        codigo_interno: '',
        codigo_barras: '',
        descricao: '',
        valor_venda: 0,
        valor_custo: 0,
        quantidade_estoque: 0,
      },
    }
  },
  computed: {
    resumoProdutos() {
      const n = this.produtos.length
      if (n === 0) return 'Cadastre itens do catálogo'
      return `${n} produto${n === 1 ? '' : 's'} no catálogo`
    },
    produtosFiltrados() {
      if (!this.termoBusca.trim()) return this.produtos
      const termo = this.termoBusca.toLowerCase().trim()
      return this.produtos.filter((p) => {
        return (
          String(p.id).includes(termo) ||
          (p.codigo_interno && p.codigo_interno.toLowerCase().includes(termo)) ||
          (p.codigo_barras && p.codigo_barras.toLowerCase().includes(termo)) ||
          (p.descricao && p.descricao.toLowerCase().includes(termo))
        )
      })
    },
  },
  mounted() {
    this.carregarProdutos()
  },
  methods: {
    abrirFormulario() {
      this.editandoId = null
      this.resetFormFields()
      this.mostrarFormulario = true
      this.$nextTick(() => {
        document.querySelector('.admin-page__form-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    },
    formatarValor(v) {
      return parseFloat(v || 0).toFixed(2)
    },
    resetFormFields() {
      this.form = {
        codigo_interno: '',
        codigo_barras: '',
        descricao: '',
        valor_venda: 0,
        valor_custo: 0,
        quantidade_estoque: 0,
      }
    },
    resetForm() {
      this.resetFormFields()
      this.editandoId = null
      this.mostrarFormulario = false
    },
    cancelarForm() {
      this.resetForm()
    },
    async carregarProdutos() {
      this.carregando = true
      this.mensagemErro = ''
      try {
        this.produtos = await produtosAPI.getAll()
      } catch (e) {
        this.mensagemErro = e.message || 'Erro ao carregar produtos.'
      } finally {
        this.carregando = false
      }
    },
    editarProduto(p) {
      this.editandoId = p.id
      this.form = {
        codigo_interno: p.codigo_interno,
        codigo_barras: p.codigo_barras || '',
        descricao: p.descricao,
        valor_venda: parseFloat(p.valor_venda),
        valor_custo: parseFloat(p.valor_custo),
        quantidade_estoque: p.quantidade_estoque,
      }
      this.mostrarFormulario = true
      this.$nextTick(() => {
        document.querySelector('.admin-page__form-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    },
    async criarProduto() {
      this.salvando = true
      this.mensagemErro = ''
      this.mensagemSucesso = ''
      try {
        await produtosAPI.create({
          codigo_interno: this.form.codigo_interno,
          codigo_barras: this.form.codigo_barras || null,
          descricao: this.form.descricao,
          valor_venda: this.form.valor_venda,
          valor_custo: this.form.valor_custo,
          quantidade_estoque: this.form.quantidade_estoque,
        })
        this.mensagemSucesso = 'Produto criado com sucesso.'
        this.resetForm()
        await this.carregarProdutos()
      } catch (e) {
        this.mensagemErro = e.message || 'Erro ao criar produto.'
      } finally {
        this.salvando = false
      }
    },
    async salvarEdicao() {
      this.salvando = true
      this.mensagemErro = ''
      this.mensagemSucesso = ''
      try {
        await produtosAPI.update(this.editandoId, {
          codigo_interno: this.form.codigo_interno,
          codigo_barras: this.form.codigo_barras || null,
          descricao: this.form.descricao,
          valor_venda: this.form.valor_venda,
          valor_custo: this.form.valor_custo,
          quantidade_estoque: this.form.quantidade_estoque,
        })
        this.mensagemSucesso = 'Produto atualizado com sucesso.'
        this.resetForm()
        await this.carregarProdutos()
      } catch (e) {
        this.mensagemErro = e.message || 'Erro ao atualizar produto.'
      } finally {
        this.salvando = false
      }
    },
    confirmarExcluir(p) {
      if (!confirm(`Excluir o produto "${p.descricao}"?`)) return
      this.excluirProduto(p.id)
    },
    async excluirProduto(id) {
      this.mensagemErro = ''
      this.mensagemSucesso = ''
      try {
        await produtosAPI.delete(id)
        this.mensagemSucesso = 'Produto excluído.'
        await this.carregarProdutos()
      } catch (e) {
        this.mensagemErro = e.message || 'Erro ao excluir produto.'
      }
    },
  },
}
</script>
