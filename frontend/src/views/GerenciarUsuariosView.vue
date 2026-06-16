<template>
  <div class="admin-page">
    <menuDefault />

    <header class="admin-page__banner">
      <div class="admin-page__banner-inner">
        <p class="admin-page__banner-greet">Administração</p>
        <h1 class="admin-page__banner-title">Gerenciar Usuários</h1>
        <p class="admin-page__banner-sub">{{ resumoUsuarios }}</p>
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
          <i class="bi bi-people-fill" aria-hidden="true"></i>
          Lista de usuários
        </h2>
        <button
          type="button"
          class="btn admin-page__btn-primary"
          @click="abrirFormulario"
        >
          <i class="bi bi-person-plus-fill me-2"></i>
          Novo usuário
        </button>
      </div>

      <!-- busca -->
      <div v-if="!carregando && usuarios.length > 0" class="admin-page__search">
        <input
          v-model="termoBusca"
          type="search"
          enterkeyhint="search"
          autocomplete="off"
          class="admin-page__search-input"
          placeholder="Buscar por email, nome ou tipo..."
        />
        <span v-if="termoBusca && usuariosFiltrados.length !== usuarios.length" class="admin-page__search-hint">
          {{ usuariosFiltrados.length }} de {{ usuarios.length }} usuários
        </span>
      </div>

      <!-- formulário -->
      <div v-if="mostrarFormulario" class="admin-page__form-panel">
        <div
          class="admin-page__form-header"
          :class="editandoUsuario ? 'admin-page__form-header--edit' : 'admin-page__form-header--create'"
        >
          <i :class="editandoUsuario ? 'bi bi-pencil-fill' : 'bi bi-person-plus-fill'" aria-hidden="true"></i>
          {{ editandoUsuario ? 'Editar usuário' : 'Novo usuário' }}
        </div>
        <div class="admin-page__form-body">
          <form @submit.prevent="editandoUsuario ? atualizarUsuario() : criarUsuario()">
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label for="email" class="form-label">Email *</label>
                <input
                  id="email"
                  v-model="novoUsuario.email"
                  type="email"
                  class="form-control"
                  required
                  placeholder="usuario@exemplo.com"
                />
              </div>
              <div class="col-12 col-md-6">
                <label for="senha" class="form-label">
                  Senha {{ editandoUsuario ? '(deixe em branco para não alterar)' : '*' }}
                </label>
                <input
                  id="senha"
                  v-model="novoUsuario.senha"
                  type="password"
                  class="form-control"
                  :required="!editandoUsuario"
                  placeholder="Digite a senha"
                  minlength="4"
                />
              </div>
              <div class="col-12 col-md-6">
                <label for="tipo" class="form-label">Tipo *</label>
                <select id="tipo" v-model="novoUsuario.tipo" class="form-select" required>
                  <option value="">Selecione o tipo</option>
                  <option value="admin">Administrador</option>
                  <option value="cliente">Cliente</option>
                  <option value="fornecedor">Fornecedor</option>
                </select>
              </div>
              <div class="col-12 col-md-6">
                <label for="nome" class="form-label">Nome completo</label>
                <input
                  id="nome"
                  v-model="novoUsuario.nome"
                  type="text"
                  class="form-control"
                  placeholder="Nome completo"
                />
              </div>
              <div class="col-12 col-md-6">
                <label for="telefone" class="form-label">Telefone</label>
                <input
                  id="telefone"
                  v-model="novoUsuario.telefone"
                  type="tel"
                  class="form-control"
                  placeholder="(00) 00000-0000"
                  @input="formatarTelefone"
                />
              </div>
              <div class="col-12 col-md-6">
                <label for="data_nascimento" class="form-label">Data de nascimento</label>
                <input
                  id="data_nascimento"
                  v-model="novoUsuario.data_nascimento"
                  type="date"
                  class="form-control"
                />
              </div>
            </div>
            <div class="admin-page__form-actions">
              <button type="button" class="btn admin-page__btn-ghost" @click="cancelarEdicao">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn admin-page__btn-primary"
                :disabled="criando || atualizando"
              >
                <span v-if="criando || atualizando" class="spinner-border spinner-border-sm me-2"></span>
                {{ (criando || atualizando) ? 'Salvando...' : (editandoUsuario ? 'Atualizar' : 'Criar usuário') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- lista -->
      <section class="admin-page__section">
        <div class="admin-page__section-header admin-page__mobile-only">
          <h2 class="admin-page__section-title">Usuários</h2>
          <button
            type="button"
            class="btn btn-sm admin-page__btn-ghost"
            :disabled="carregando"
            @click="carregarUsuarios"
          >
            <span v-if="carregando" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
        <div class="admin-page__section-body">
          <div v-if="carregando" class="admin-page__loading">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 mb-0">Carregando usuários...</p>
          </div>
          <div v-else-if="usuarios.length === 0" class="admin-page__empty">
            <span class="admin-page__empty-icon">👥</span>
            <p class="mb-2">Nenhum usuário cadastrado.</p>
            <button type="button" class="btn admin-page__btn-primary" @click="abrirFormulario">
              Criar primeiro usuário
            </button>
          </div>
          <div v-else-if="termoBusca && usuariosFiltrados.length === 0" class="admin-page__empty">
            <p class="mb-0">Nenhum usuário para "{{ termoBusca }}"</p>
          </div>
          <template v-else>
            <!-- cards mobile -->
            <div class="admin-page__cards admin-page__mobile-only">
              <article
                v-for="usuario in usuariosFiltrados"
                :key="usuario.id"
                class="admin-page__item-card"
              >
                <div class="admin-page__item-card-top">
                  <h3 class="admin-page__item-card-title">{{ usuario.email }}</h3>
                  <span :class="getTipoBadgeClass(usuario.tipo)">{{ formatarTipo(usuario.tipo) }}</span>
                </div>
                <div class="admin-page__item-card-meta">
                  <span v-if="usuario.nome"><i class="bi bi-person me-1"></i>{{ usuario.nome }}</span>
                  <span v-if="usuario.telefone"><i class="bi bi-telephone me-1"></i>{{ usuario.telefone }}</span>
                  <span><i class="bi bi-hash me-1"></i>ID {{ usuario.id }}</span>
                </div>
                <div class="admin-page__item-card-actions">
                  <button type="button" class="btn btn-outline-primary btn-sm" @click="editarUsuario(usuario)">
                    <i class="bi bi-pencil-fill me-1"></i>Editar
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    :disabled="usuario.id === usuarioLogadoId"
                    @click="confirmarExclusao(usuario)"
                  >
                    <i class="bi bi-trash-fill me-1"></i>Excluir
                  </button>
                </div>
              </article>
            </div>

            <!-- tabela desktop -->
            <div class="admin-page__table-wrap admin-page__desktop-only">
              <table class="admin-page__table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Telefone</th>
                    <th>Nascimento</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
                    <td>{{ usuario.id }}</td>
                    <td><strong>{{ usuario.email }}</strong></td>
                    <td>{{ usuario.nome || '—' }}</td>
                    <td><span :class="getTipoBadgeClass(usuario.tipo)">{{ formatarTipo(usuario.tipo) }}</span></td>
                    <td>{{ usuario.telefone || '—' }}</td>
                    <td>{{ formatarData(usuario.data_nascimento) }}</td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button type="button" class="btn btn-outline-primary" title="Editar" @click="editarUsuario(usuario)">
                          <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-outline-danger"
                          :disabled="usuario.id === usuarioLogadoId"
                          :title="usuario.id === usuarioLogadoId ? 'Não é possível excluir sua própria conta' : 'Excluir'"
                          @click="confirmarExclusao(usuario)"
                        >
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

    <!-- FAB novo usuário (mobile) -->
    <button
      v-if="!mostrarFormulario"
      type="button"
      class="admin-page__fab admin-page__mobile-only"
      aria-label="Novo usuário"
      @click="abrirFormulario"
    >
      <i class="bi bi-person-plus-fill" aria-hidden="true"></i>
    </button>
  </div>
</template>

<script>
import menuDefault from '@/components/menuDefault.vue'
import { getApiBaseUrl } from '@/services/api.js'

export default {
  name: 'GerenciarUsuariosView',
  components: { menuDefault },
  data() {
    return {
      usuarios: [],
      carregando: false,
      criando: false,
      atualizando: false,
      mostrarFormulario: false,
      editandoUsuario: false,
      usuarioEditandoId: null,
      mensagemSucesso: '',
      mensagemErro: '',
      usuarioLogadoId: null,
      termoBusca: '',
      novoUsuario: {
        email: '',
        senha: '',
        tipo: '',
        nome: '',
        telefone: '',
        data_nascimento: '',
      },
    }
  },
  computed: {
    resumoUsuarios() {
      const n = this.usuarios.length
      if (n === 0) return 'Cadastre e gerencie contas do sistema'
      return `${n} usuário${n === 1 ? '' : 's'} cadastrado${n === 1 ? '' : 's'}`
    },
    usuariosFiltrados() {
      if (!this.termoBusca.trim()) return this.usuarios
      const termo = this.termoBusca.toLowerCase().trim()
      return this.usuarios.filter((u) => {
        return (
          String(u.id).includes(termo) ||
          (u.email && u.email.toLowerCase().includes(termo)) ||
          (u.nome && u.nome.toLowerCase().includes(termo)) ||
          (u.tipo && u.tipo.toLowerCase().includes(termo)) ||
          (u.telefone && u.telefone.includes(termo))
        )
      })
    },
  },
  async mounted() {
    try {
      const userData = JSON.parse(localStorage.getItem('user'))
      if (userData?.id) this.usuarioLogadoId = userData.id
    } catch (e) {
      console.error('Erro ao obter ID do usuário logado:', e)
    }
    await this.carregarUsuarios()
  },
  methods: {
    abrirFormulario() {
      this.editandoUsuario = false
      this.usuarioEditandoId = null
      this.limparFormulario()
      this.mostrarFormulario = true
      this.mensagemErro = ''
      this.$nextTick(() => {
        document.querySelector('.admin-page__form-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    },
    async carregarUsuarios() {
      this.carregando = true
      this.mensagemErro = ''
      try {
        const userData = JSON.parse(localStorage.getItem('user'))
        if (!userData?.token) {
          this.$router.push('/login')
          return
        }
        const response = await fetch(`${getApiBaseUrl()}/users`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${userData.token}`,
            'Content-Type': 'application/json',
          },
        })
        const contentType = response.headers.get('content-type')
        if (!response.ok) {
          let errorMessage = 'Erro ao carregar usuários'
          if (contentType?.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorData.message || errorMessage
          }
          throw new Error(errorMessage)
        }
        this.usuarios = await response.json()
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
        this.mensagemErro = error.message || 'Erro ao carregar usuários.'
      } finally {
        this.carregando = false
      }
    },
    async criarUsuario() {
      this.criando = true
      this.mensagemErro = ''
      this.mensagemSucesso = ''
      try {
        const userData = JSON.parse(localStorage.getItem('user'))
        if (!userData?.token) {
          this.$router.push('/login')
          return
        }
        if (!this.novoUsuario.email || !this.novoUsuario.senha || !this.novoUsuario.tipo) {
          this.mensagemErro = 'Email, senha e tipo são obrigatórios.'
          return
        }
        const response = await fetch(`${getApiBaseUrl()}/users`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userData.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.novoUsuario),
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || errorData.message || 'Erro ao criar usuário')
        }
        const usuarioCriado = await response.json()
        this.mensagemSucesso = `Usuário "${usuarioCriado.email}" criado com sucesso!`
        this.cancelarEdicao()
        await this.carregarUsuarios()
        setTimeout(() => { this.mensagemSucesso = '' }, 5000)
      } catch (error) {
        this.mensagemErro = error.message || 'Erro ao criar usuário.'
      } finally {
        this.criando = false
      }
    },
    limparFormulario() {
      this.novoUsuario = { email: '', senha: '', tipo: '', nome: '', telefone: '', data_nascimento: '' }
    },
    formatarTipo(tipo) {
      return { admin: 'Administrador', cliente: 'Cliente', fornecedor: 'Fornecedor' }[tipo] || tipo
    },
    getTipoBadgeClass(tipo) {
      return {
        admin: 'admin-page__badge admin-page__badge--admin',
        cliente: 'admin-page__badge admin-page__badge--cliente',
        fornecedor: 'admin-page__badge admin-page__badge--fornecedor',
      }[tipo] || 'admin-page__badge admin-page__badge--default'
    },
    formatarData(data) {
      if (!data) return '—'
      return new Date(data).toLocaleDateString('pt-BR')
    },
    formatarTelefone(event) {
      let valor = event.target.value.replace(/\D/g, '')
      if (valor.length <= 10) {
        valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
      } else {
        valor = valor.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
      }
      this.novoUsuario.telefone = valor
    },
    editarUsuario(usuario) {
      this.editandoUsuario = true
      this.usuarioEditandoId = usuario.id
      this.novoUsuario = {
        email: usuario.email || '',
        senha: '',
        tipo: usuario.tipo || '',
        nome: usuario.nome || '',
        telefone: usuario.telefone || '',
        data_nascimento: usuario.data_nascimento || '',
      }
      this.mostrarFormulario = true
      this.mensagemErro = ''
      this.mensagemSucesso = ''
      this.$nextTick(() => {
        document.querySelector('.admin-page__form-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    },
    cancelarEdicao() {
      this.editandoUsuario = false
      this.usuarioEditandoId = null
      this.mostrarFormulario = false
      this.limparFormulario()
    },
    async atualizarUsuario() {
      this.atualizando = true
      this.mensagemErro = ''
      this.mensagemSucesso = ''
      try {
        const userData = JSON.parse(localStorage.getItem('user'))
        if (!userData?.token) {
          this.$router.push('/login')
          return
        }
        if (!this.novoUsuario.email || !this.novoUsuario.tipo) {
          this.mensagemErro = 'Email e tipo são obrigatórios.'
          return
        }
        const dadosAtualizacao = {
          email: this.novoUsuario.email,
          tipo: this.novoUsuario.tipo,
          nome: this.novoUsuario.nome || null,
          telefone: this.novoUsuario.telefone || null,
          data_nascimento: this.novoUsuario.data_nascimento || null,
        }
        if (this.novoUsuario.senha?.trim()) {
          dadosAtualizacao.senha = this.novoUsuario.senha
        }
        const response = await fetch(`${getApiBaseUrl()}/users/${this.usuarioEditandoId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${userData.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dadosAtualizacao),
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || errorData.message || 'Erro ao atualizar usuário')
        }
        const usuarioAtualizado = await response.json()
        this.mensagemSucesso = `Usuário "${usuarioAtualizado.email}" atualizado com sucesso!`
        this.cancelarEdicao()
        await this.carregarUsuarios()
        setTimeout(() => { this.mensagemSucesso = '' }, 5000)
      } catch (error) {
        this.mensagemErro = error.message || 'Erro ao atualizar usuário.'
      } finally {
        this.atualizando = false
      }
    },
    confirmarExclusao(usuario) {
      if (usuario.id === this.usuarioLogadoId) {
        this.mensagemErro = 'Você não pode excluir seu próprio usuário.'
        return
      }
      if (confirm(`Excluir o usuário "${usuario.email}"?\n\nEsta ação não pode ser desfeita.`)) {
        this.excluirUsuario(usuario.id)
      }
    },
    async excluirUsuario(usuarioId) {
      this.mensagemErro = ''
      this.mensagemSucesso = ''
      try {
        const userData = JSON.parse(localStorage.getItem('user'))
        if (!userData?.token) {
          this.$router.push('/login')
          return
        }
        const response = await fetch(`${getApiBaseUrl()}/users/${usuarioId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${userData.token}`,
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || errorData.message || 'Erro ao excluir usuário')
        }
        this.mensagemSucesso = 'Usuário excluído com sucesso!'
        await this.carregarUsuarios()
        setTimeout(() => { this.mensagemSucesso = '' }, 5000)
      } catch (error) {
        this.mensagemErro = error.message || 'Erro ao excluir usuário.'
      }
    },
  },
}
</script>
