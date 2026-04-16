<template>
  <div>
    <menuDefault />
    <div class="container-fluid mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="d-flex align-items-center gap-3">
          <button
            class="btn btn-outline-secondary btn-sm"
            title="Voltar"
            @click="voltarParaHome"
          >
            <i class="bi bi-arrow-left me-1"></i>Voltar
          </button>
          <h3 class="mb-0"><i class="bi bi-box-seam me-2"></i>Gerenciar Produtos</h3>
        </div>
        <button
          class="btn btn-primary"
          @click="mostrarFormulario = !mostrarFormulario"
        >
          <i :class="mostrarFormulario ? 'bi bi-x-circle' : 'bi bi-plus-circle'" class="me-2"></i>
          {{ mostrarFormulario ? 'Cancelar' : 'Novo Produto' }}
        </button>
      </div>

      <div v-if="mensagemSucesso" class="alert alert-success alert-dismissible fade show">
        {{ mensagemSucesso }}
        <button type="button" class="btn-close" @click="mensagemSucesso = ''"></button>
      </div>
      <div v-if="mensagemErro" class="alert alert-danger alert-dismissible fade show">
        {{ mensagemErro }}
        <button type="button" class="btn-close" @click="mensagemErro = ''"></button>
      </div>

      <!-- formulario criar/editar -->
      <div v-if="mostrarFormulario" class="card shadow-sm mb-4">
        <div class="card-header" :class="editandoId ? 'bg-warning text-dark' : 'bg-primary text-white'">
          <h5 class="mb-0">
            <i :class="editandoId ? 'bi bi-pencil-fill' : 'bi bi-plus-circle-fill'" class="me-2"></i>
            {{ editandoId ? 'Editar Produto' : 'Novo Produto' }}
          </h5>
        </div>
        <div class="card-body">
          <form @submit.prevent="editandoId ? salvarEdicao() : criarProduto()">
            <div class="row">
              <div class="col-md-4 mb-3">
                <label class="form-label">Código interno *</label>
                <input
                  v-model="form.codigo_interno"
                  type="text"
                  class="form-control"
                  required
                  placeholder="Ex: ARRZ001"
                />
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Código de barras</label>
                <input
                  v-model="form.codigo_barras"
                  type="text"
                  class="form-control"
                  placeholder="Opcional"
                />
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Quantidade estoque *</label>
                <input
                  v-model.number="form.quantidade_estoque"
                  type="number"
                  min="0"
                  class="form-control"
                  required
                />
              </div>
              <div class="col-md-12 mb-3">
                <label class="form-label">Descrição *</label>
                <input
                  v-model="form.descricao"
                  type="text"
                  class="form-control"
                  required
                  placeholder="Nome do produto"
                />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Valor de custo (R$) *</label>
                <input
                  v-model.number="form.valor_custo"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  required
                />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Valor de venda (R$) *</label>
                <input
                  v-model.number="form.valor_venda"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  required
                />
              </div>
            </div>
            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" @click="cancelarForm">
                <i class="bi bi-x-circle me-1"></i>Cancelar
              </button>
              <button
                type="submit"
                class="btn"
                :class="editandoId ? 'btn-warning' : 'btn-primary'"
                :disabled="salvando"
              >
                <span v-if="salvando" class="spinner-border spinner-border-sm me-1"></span>
                {{ editandoId ? 'Salvar' : 'Criar' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- lista de produtos -->
      <div class="card shadow-sm">
        <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Lista de Produtos</h5>
          <button
            class="btn btn-light btn-sm"
            :disabled="carregando"
            @click="carregarProdutos"
          >
            <span v-if="carregando" class="spinner-border spinner-border-sm me-1"></span>
            Atualizar
          </button>
        </div>
        <div class="card-body">
          <div v-if="carregando" class="text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
          </div>
          <div v-else-if="produtos.length === 0" class="text-center py-4 text-muted">
            Nenhum produto cadastrado.
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Descrição</th>
                  <th>Estoque</th>
                  <th>Valor custo</th>
                  <th>Valor venda</th>
                  <th style="width: 120px;">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in produtos" :key="p.id">
                  <td>{{ p.id }}</td>
                  <td>{{ p.codigo_interno }}</td>
                  <td>{{ p.descricao }}</td>
                  <td>{{ p.quantidade_estoque }}</td>
                  <td>R$ {{ formatarValor(p.valor_custo) }}</td>
                  <td>R$ {{ formatarValor(p.valor_venda) }}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <button
                        type="button"
                        class="btn btn-outline-primary"
                        title="Editar"
                        @click="editarProduto(p)"
                      >
                        <i class="bi bi-pencil-fill"></i>
                      </button>
                      <button
                        type="button"
                        class="btn btn-outline-danger"
                        title="Excluir"
                        @click="confirmarExcluir(p)"
                      >
                        <i class="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
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
      form: {
        codigo_interno: '',
        codigo_barras: '',
        descricao: '',
        valor_venda: 0,
        valor_custo: 0,
        quantidade_estoque: 0
      }
    }
  },
  mounted() {
    this.carregarProdutos()
  },
  methods: {
    voltarParaHome() {
      this.$router.push('/admin')
    },
    formatarValor(v) {
      return parseFloat(v || 0).toFixed(2)
    },
    resetForm() {
      this.form = {
        codigo_interno: '',
        codigo_barras: '',
        descricao: '',
        valor_venda: 0,
        valor_custo: 0,
        quantidade_estoque: 0
      }
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
        quantidade_estoque: p.quantidade_estoque
      }
      this.mostrarFormulario = true
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
          quantidade_estoque: this.form.quantidade_estoque
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
          quantidade_estoque: this.form.quantidade_estoque
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
    }
  }
}
</script>
