<template>
  <div class="container-fluid mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex align-items-center gap-3">
        <button 
          @click="voltarParaHome"
          class="btn btn-outline-secondary btn-sm"
          title="Voltar para a página inicial"
        >
          <i class="bi bi-arrow-left me-1"></i>Voltar
        </button>
        <h3 class="mb-0"><i class="bi bi-people-fill me-2"></i>Gerenciar Usuários</h3>
      </div>
      <button 
        @click="mostrarFormulario = !mostrarFormulario" 
        class="btn btn-primary"
      >
        <i v-if="!mostrarFormulario" class="bi bi-plus-circle me-2"></i>
        <i v-else class="bi bi-x-circle me-2"></i>
        {{ mostrarFormulario ? 'Cancelar' : 'Criar Novo Usuário' }}
      </button>
    </div>

    <!-- mensagens de sucesso/erro -->
    <div v-if="mensagemSucesso" class="alert alert-success alert-dismissible fade show" role="alert">
      {{ mensagemSucesso }}
      <button type="button" class="btn-close" @click="mensagemSucesso = ''"></button>
    </div>
    <div v-if="mensagemErro" class="alert alert-danger alert-dismissible fade show" role="alert">
      {{ mensagemErro }}
      <button type="button" class="btn-close" @click="mensagemErro = ''"></button>
    </div>

    <!-- formulario de criacao/edicao -->
    <div v-if="mostrarFormulario" class="card shadow-sm mb-4">
      <div class="card-header" :class="editandoUsuario ? 'bg-warning text-dark' : 'bg-primary text-white'">
        <h5 class="mb-0">
          <i v-if="editandoUsuario" class="bi bi-pencil-fill me-2"></i>
          <i v-else class="bi bi-person-plus-fill me-2"></i>
          {{ editandoUsuario ? 'Editar Usuário' : 'Criar Novo Usuário' }}
        </h5>
      </div>
      <div class="card-body">
        <form @submit.prevent="editandoUsuario ? atualizarUsuario() : criarUsuario()">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="email" class="form-label">Email *</label>
              <input 
                type="email" 
                class="form-control" 
                id="email"
                v-model="novoUsuario.email"
                required
                placeholder="usuario@exemplo.com"
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="senha" class="form-label">
                Senha {{ editandoUsuario ? '(deixe em branco para não alterar)' : '*' }}
              </label>
              <input 
                type="password" 
                class="form-control" 
                id="senha"
                v-model="novoUsuario.senha"
                :required="!editandoUsuario"
                placeholder="Digite a senha"
                minlength="4"
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="tipo" class="form-label">Tipo de Usuário *</label>
              <select 
                class="form-select" 
                id="tipo"
                v-model="novoUsuario.tipo"
                required
              >
                <option value="">Selecione o tipo</option>
                <option value="admin">Administrador</option>
                <option value="cliente">Cliente</option>
                <option value="fornecedor">Fornecedor</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label for="nome" class="form-label">Nome Completo</label>
              <input 
                type="text" 
                class="form-control" 
                id="nome"
                v-model="novoUsuario.nome"
                placeholder="Nome completo do usuário"
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="telefone" class="form-label">Telefone</label>
              <input 
                type="tel" 
                class="form-control" 
                id="telefone"
                v-model="novoUsuario.telefone"
                placeholder="(00) 00000-0000"
                @input="formatarTelefone"
              />
            </div>
            <div class="col-md-6 mb-3">
              <label for="data_nascimento" class="form-label">Data de Nascimento</label>
              <input 
                type="date" 
                class="form-control" 
                id="data_nascimento"
                v-model="novoUsuario.data_nascimento"
              />
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button 
              type="button" 
              class="btn btn-secondary"
              @click="cancelarEdicao"
            >
              <i class="bi bi-x-circle me-2"></i>Cancelar
            </button>
            <button 
              type="submit" 
              class="btn"
              :class="editandoUsuario ? 'btn-warning' : 'btn-primary'"
              :disabled="criando || atualizando"
            >
              <span v-if="criando || atualizando" class="spinner-border spinner-border-sm me-2"></span>
              <span v-else><i class="bi bi-floppy-fill me-2"></i></span>
              {{ (criando || atualizando) ? (editandoUsuario ? 'Atualizando...' : 'Criando...') : (editandoUsuario ? 'Atualizar Usuário' : 'Criar Usuário') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- lista de usuarios -->
    <div class="card shadow-sm">
      <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Lista de Usuários</h5>
        <button 
          @click="carregarUsuarios" 
          class="btn btn-light btn-sm"
          :disabled="carregando"
        >
          <span v-if="carregando" class="spinner-border spinner-border-sm me-2"></span>
          Atualizar
        </button>
      </div>
      <div class="card-body">
        <div v-if="carregando" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
        </div>

        <div v-else-if="usuarios.length === 0" class="text-center py-4">
          <p class="text-muted">Nenhum usuário encontrado.</p>
        </div>

        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Telefone</th>
                  <th>Data Nascimento</th>
                  <th style="width: 150px;">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="usuario in usuarios" :key="usuario.id">
                  <td>{{ usuario.id }}</td>
                  <td>{{ usuario.email }}</td>
                  <td>{{ usuario.nome || '-' }}</td>
                  <td>
                    <span :class="getTipoClass(usuario.tipo)">
                      {{ formatarTipo(usuario.tipo) }}
                    </span>
                  </td>
                  <td>{{ usuario.telefone || '-' }}</td>
                  <td>{{ formatarData(usuario.data_nascimento) }}</td>
                  <td>
                    <div class="btn-group btn-group-sm" role="group">
                      <button 
                        @click="editarUsuario(usuario)"
                        class="btn btn-outline-primary"
                        title="Editar usuário"
                      >
                        <i class="bi bi-pencil-fill"></i>
                      </button>
                      <button 
                        @click="confirmarExclusao(usuario)"
                        class="btn btn-outline-danger"
                        :disabled="usuario.id === usuarioLogadoId"
                        :title="usuario.id === usuarioLogadoId ? 'Você não pode excluir seu próprio usuário' : 'Excluir usuário'"
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
import { getApiBaseUrl } from '@/services/api.js'

export default {
  name: 'GerenciarUsuariosView',
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
      novoUsuario: {
        email: '',
        senha: '',
        tipo: '',
        nome: '',
        telefone: '',
        data_nascimento: ''
      }
    }
  },
  async mounted() {
    // pego o id do usuario logado aqui (pra nao deixar excluir ele msm)
    try {
      const userData = JSON.parse(localStorage.getItem('user'))
      if (userData && userData.id) {
        this.usuarioLogadoId = userData.id
      }
    } catch (e) {
      console.error('Erro ao obter ID do usuário logado:', e)
    }
    await this.carregarUsuarios()
  },
  methods: {
    async carregarUsuarios() {
      this.carregando = true
      this.mensagemErro = ''

      try {
        const userData = JSON.parse(localStorage.getItem('user'))
        if (!userData || !userData.token) {
          this.$router.push('/login')
          return
        }

        const response = await fetch(`${getApiBaseUrl()}/users`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        })

        const contentType = response.headers.get('content-type')

        if (!response.ok) {
          let errorMessage = 'Erro ao carregar usuários'
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json()
              errorMessage = errorData.error || errorData.message || errorMessage
            } catch (e) {
              console.error('Erro ao parsear JSON de erro:', e)
            }
          } else {
            const textError = await response.text()
            console.error('Resposta de erro não-JSON:', textError.substring(0, 200))
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
          
          throw new Error(errorMessage)
        }

        if (!contentType || !contentType.includes('application/json')) {
          const textResponse = await response.text()
          console.error('Resposta não-JSON recebida:', textResponse.substring(0, 200))
          throw new Error('Resposta inválida do servidor.')
        }

        this.usuarios = await response.json()
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
        this.mensagemErro = error.message || 'Erro ao carregar usuários. Verifique se você tem permissão de administrador.'
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
        if (!userData || !userData.token) {
          this.$router.push('/login')
          return
        }

        // validacoes basicas
        if (!this.novoUsuario.email || !this.novoUsuario.senha || !this.novoUsuario.tipo) {
          this.mensagemErro = 'Email, senha e tipo são obrigatórios.'
          return
        }

        const response = await fetch(`${getApiBaseUrl()}/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.novoUsuario)
        })

        const contentType = response.headers.get('content-type')

        if (!response.ok) {
          let errorMessage = 'Erro ao criar usuário'
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json()
              errorMessage = errorData.error || errorData.message || errorMessage
            } catch (e) {
              console.error('Erro ao parsear JSON de erro:', e)
            }
          } else {
            const textError = await response.text()
            console.error('Resposta de erro não-JSON:', textError.substring(0, 200))
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
          
          throw new Error(errorMessage)
        }

        if (!contentType || !contentType.includes('application/json')) {
          const textResponse = await response.text()
          console.error('Resposta não-JSON recebida:', textResponse.substring(0, 200))
          throw new Error('Resposta inválida do servidor.')
        }

        const usuarioCriado = await response.json()
        
        this.mensagemSucesso = `Usuário "${usuarioCriado.email}" criado com sucesso!`
        this.limparFormulario()
        this.mostrarFormulario = false
        await this.carregarUsuarios()

        setTimeout(() => {
          this.mensagemSucesso = ''
        }, 5000)

      } catch (error) {
        console.error('Erro ao criar usuário:', error)
        this.mensagemErro = error.message || 'Erro ao criar usuário. Tente novamente.'
      } finally {
        this.criando = false
      }
    },
    limparFormulario() {
      this.novoUsuario = {
        email: '',
        senha: '',
        tipo: '',
        nome: '',
        telefone: '',
        data_nascimento: ''
      }
    },
    formatarTipo(tipo) {
      const tipos = {
        'admin': 'Administrador',
        'cliente': 'Cliente',
        'fornecedor': 'Fornecedor'
      }
      return tipos[tipo] || tipo
    },
    getTipoClass(tipo) {
      const classes = {
        'admin': 'badge bg-danger',
        'cliente': 'badge bg-primary',
        'fornecedor': 'badge bg-success'
      }
      return classes[tipo] || 'badge bg-secondary'
    },
    formatarData(data) {
      if (!data) return '-'
      const date = new Date(data)
      return date.toLocaleDateString('pt-BR')
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
        senha: '', // senha nao vem por seguranca, ai eu deixo vazio msm
        tipo: usuario.tipo || '',
        nome: usuario.nome || '',
        telefone: usuario.telefone || '',
        data_nascimento: usuario.data_nascimento || ''
      }
      this.mostrarFormulario = true
      this.mensagemErro = ''
      this.mensagemSucesso = ''
      
      // scroll pro formulario (pra nao ficar procurando)
      this.$nextTick(() => {
        const formElement = document.querySelector('.card.shadow-sm')
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
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
        if (!userData || !userData.token) {
          this.$router.push('/login')
          return
        }

        // validacoes basicas
        if (!this.novoUsuario.email || !this.novoUsuario.tipo) {
          this.mensagemErro = 'Email e tipo são obrigatórios.'
          return
        }

        // preparo os dados pra atualizar (tiro senha se tiver vazia)
        const dadosAtualizacao = {
          email: this.novoUsuario.email,
          tipo: this.novoUsuario.tipo,
          nome: this.novoUsuario.nome || null,
          telefone: this.novoUsuario.telefone || null,
          data_nascimento: this.novoUsuario.data_nascimento || null
        }

        // so mando senha se o cara digitou algo
        if (this.novoUsuario.senha && this.novoUsuario.senha.trim() !== '') {
          dadosAtualizacao.senha = this.novoUsuario.senha
        }

        const response = await fetch(`${getApiBaseUrl()}/users/${this.usuarioEditandoId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dadosAtualizacao)
        })

        const contentType = response.headers.get('content-type')

        if (!response.ok) {
          let errorMessage = 'Erro ao atualizar usuário'
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json()
              errorMessage = errorData.error || errorData.message || errorMessage
            } catch (e) {
              console.error('Erro ao parsear JSON de erro:', e)
            }
          } else {
            const textError = await response.text()
            console.error('Resposta de erro não-JSON:', textError.substring(0, 200))
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
          
          throw new Error(errorMessage)
        }

        if (!contentType || !contentType.includes('application/json')) {
          const textResponse = await response.text()
          console.error('Resposta não-JSON recebida:', textResponse.substring(0, 200))
          throw new Error('Resposta inválida do servidor.')
        }

        const usuarioAtualizado = await response.json()
        
        this.mensagemSucesso = `Usuário "${usuarioAtualizado.email}" atualizado com sucesso!`
        this.cancelarEdicao()
        await this.carregarUsuarios()

        setTimeout(() => {
          this.mensagemSucesso = ''
        }, 5000)

      } catch (error) {
        console.error('Erro ao atualizar usuário:', error)
        this.mensagemErro = error.message || 'Erro ao atualizar usuário. Tente novamente.'
      } finally {
        this.atualizando = false
      }
    },
    confirmarExclusao(usuario) {
      if (usuario.id === this.usuarioLogadoId) {
        this.mensagemErro = 'Você não pode excluir seu próprio usuário.'
        return
      }

      if (confirm(`Tem certeza que deseja excluir o usuário "${usuario.email}"?\n\nEsta ação não pode ser desfeita.`)) {
        this.excluirUsuario(usuario.id)
      }
    },
    async excluirUsuario(usuarioId) {
      this.mensagemErro = ''
      this.mensagemSucesso = ''

      try {
        const userData = JSON.parse(localStorage.getItem('user'))
        if (!userData || !userData.token) {
          this.$router.push('/login')
          return
        }

        const response = await fetch(`${getApiBaseUrl()}/users/${usuarioId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        })

        const contentType = response.headers.get('content-type')

        if (!response.ok) {
          let errorMessage = 'Erro ao excluir usuário'
          
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json()
              errorMessage = errorData.error || errorData.message || errorMessage
            } catch (e) {
              console.error('Erro ao parsear JSON de erro:', e)
            }
          } else {
            const textError = await response.text()
            console.error('Resposta de erro não-JSON:', textError.substring(0, 200))
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
          
          throw new Error(errorMessage)
        }

        this.mensagemSucesso = 'Usuário excluído com sucesso!'
        await this.carregarUsuarios()

        setTimeout(() => {
          this.mensagemSucesso = ''
        }, 5000)

      } catch (error) {
        console.error('Erro ao excluir usuário:', error)
        this.mensagemErro = error.message || 'Erro ao excluir usuário. Tente novamente.'
      }
    },
    voltarParaHome() {
      try {
        const userData = JSON.parse(localStorage.getItem('user'))
        if (userData && userData.tipo) {
          this.$router.push(`/${userData.tipo}`)
        } else {
          this.$router.push('/login')
        }
      } catch (e) {
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style scoped>
.card {
  border-radius: 10px;
}

.card-header {
  border-radius: 10px 10px 0 0 !important;
}

.badge {
  padding: 0.35em 0.65em;
  font-size: 0.875em;
}
</style>

