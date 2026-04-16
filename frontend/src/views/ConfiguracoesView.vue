<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h4 class="mb-0"><i class="bi bi-gear-fill me-2"></i>Configurações do Perfil</h4>
            <button 
              @click="voltarParaHome"
              class="btn btn-light btn-sm"
              title="Voltar para a página inicial"
            >
              <i class="bi bi-arrow-left me-1"></i>Voltar
            </button>
          </div>
          <div class="card-body">
            <!-- mensagens de sucesso/erro -->
            <div v-if="mensagemSucesso" class="alert alert-success alert-dismissible fade show" role="alert">
              {{ mensagemSucesso }}
              <button type="button" class="btn-close" @click="mensagemSucesso = ''"></button>
            </div>
            <div v-if="mensagemErro" class="alert alert-danger alert-dismissible fade show" role="alert">
              {{ mensagemErro }}
              <button type="button" class="btn-close" @click="mensagemErro = ''"></button>
            </div>

            <!-- foto de perfil -->
            <div class="text-center mb-4">
              <div class="position-relative d-inline-block configuracoes-avatar-wrap">
                <AvatarUsuario
                  :src="imagemPerfilPreview"
                  alt="Foto de Perfil"
                  size="150"
                  class="rounded-circle border border-3 border-primary configuracoes-avatar"
                  @click="$refs.fileInput.click()"
                />
                <div class="position-absolute bottom-0 end-0">
                  <button 
                    class="btn btn-sm btn-primary rounded-circle"
                    @click="$refs.fileInput.click()"
                    title="Alterar foto"
                  >
                    <i class="bi bi-camera-fill"></i>
                  </button>
                </div>
              </div>
              <input 
                ref="fileInput"
                type="file" 
                accept="image/*" 
                @change="handleImageUpload"
                style="display: none;"
              />
              <p class="text-muted mt-2 small">Clique na imagem para alterar a foto de perfil</p>
            </div>

            <!-- formulario -->
            <form @submit.prevent="salvarPerfil">
              <div class="row">
                <!-- nome -->
                <div class="col-md-12 mb-3">
                  <label for="nome" class="form-label">Nome Completo</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="nome"
                    v-model="formData.nome"
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <!-- email (so leitura) -->
                <div class="col-md-6 mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email"
                    :value="formData.email"
                    disabled
                    readonly
                  />
                  <small class="text-muted">O email não pode ser alterado</small>
                </div>

                <!-- tipo de usuario (so leitura) -->
                <div class="col-md-6 mb-3">
                  <label for="tipo" class="form-label">Tipo de Usuário</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="tipo"
                    :value="formataTipoUsuario(formData.tipo)"
                    disabled
                    readonly
                  />
                </div>

                <!-- data de nascimento -->
                <div class="col-md-6 mb-3">
                  <label for="data_nascimento" class="form-label">Data de Nascimento</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    id="data_nascimento"
                    v-model="formData.data_nascimento"
                  />
                </div>

                <!-- telefone -->
                <div class="col-md-6 mb-3">
                  <label for="telefone" class="form-label">Telefone</label>
                  <input 
                    type="tel" 
                    class="form-control" 
                    id="telefone"
                    v-model="formData.telefone"
                    placeholder="(00) 00000-0000"
                    @input="formatarTelefone"
                  />
                </div>
              </div>

              <!-- botoes -->
              <div class="d-flex justify-content-between mt-4">
                <button 
                  type="button" 
                  class="btn btn-secondary"
                  @click="cancelarEdicao"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="salvando"
                >
                  <span v-if="salvando" class="spinner-border spinner-border-sm me-2"></span>
                  <span v-if="!salvando"><i class="bi bi-floppy-fill me-2"></i></span>{{ salvando ? 'Salvando...' : 'Salvar Alterações' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AvatarUsuario from '@/components/AvatarUsuario.vue'

const API_BASE_URL = 'http://localhost:3009/api'

export default {
  name: 'ConfiguracoesView',
  components: { AvatarUsuario },
  data() {
    return {
      formData: {
        nome: '',
        email: '',
        tipo: '',
        data_nascimento: '',
        telefone: '',
        imagem_perfil: ''
      },
      imagemPerfilPreview: null,
      salvando: false,
      mensagemSucesso: '',
      mensagemErro: '',
      dadosOriginais: null
    }
  },
  async mounted() {
    await this.carregarPerfil()
  },
  methods: {
    async carregarPerfil() {
      try {
        const userData = JSON.parse(localStorage.getItem('user'))
        if (!userData || !userData.token) {
          this.$router.push('/login')
          return
        }

        const response = await fetch(`${API_BASE_URL}/users/perfil`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        })

        // confiro o content-type da resposta (ja tomei html aqui e deu pau no json)
        const contentType = response.headers.get('content-type')

        if (!response.ok) {
          let errorMessage = 'Erro ao carregar perfil'
          
          // tento ler como json, se der ruim leio como texto
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json()
              errorMessage = errorData.error || errorData.message || errorMessage
            } catch (e) {
              console.error('Erro ao parsear JSON de erro:', e)
            }
          } else {
            // se nao for json, leio como texto (as vezes vem html de erro msm)
            const textError = await response.text()
            console.error('Resposta de erro não-JSON:', textError.substring(0, 200))
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
          
          throw new Error(errorMessage)
        }

        // confiro se a resposta e json antes de dar parse
        if (!contentType || !contentType.includes('application/json')) {
          const textResponse = await response.text()
          console.error('Resposta não-JSON recebida:', textResponse.substring(0, 200))
          throw new Error('Resposta inválida do servidor. Verifique se o servidor está rodando corretamente.')
        }

        const perfil = await response.json()
        
        // preencho o formulario com os dados do perfil
        this.formData = {
          nome: perfil.nome || '',
          email: perfil.email || '',
          tipo: perfil.tipo || '',
          data_nascimento: perfil.data_nascimento || '',
          telefone: perfil.telefone || '',
          imagem_perfil: perfil.imagem_perfil || ''
        }

        // seto a imagem de preview
        this.imagemPerfilPreview = perfil.imagem_perfil || null

        // salvo os dados originais pra poder cancelar (depois de setar tudo)
        this.dadosOriginais = JSON.parse(JSON.stringify(this.formData))
        this.dadosOriginais.imagemPerfilPreview = this.imagemPerfilPreview

      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        this.mensagemErro = 'Erro ao carregar dados do perfil. Tente novamente.'
      }
    },
    handleImageUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      // valido o tipo do arquivo
      if (!file.type.startsWith('image/')) {
        this.mensagemErro = 'Por favor, selecione uma imagem válida.'
        return
      }

      // valido o tamanho (max 5mb antes de comprimir)
      if (file.size > 5 * 1024 * 1024) {
        this.mensagemErro = 'A imagem deve ter no máximo 5MB.'
        return
      }

      // redimensiono e comprimo a img antes de virar base64
      this.comprimirImagem(file)
    },
    comprimirImagem(file) {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const img = new Image()
        
        img.onload = () => {
          // tamanho max (200x200) pra perfil, assim o base64 nao fica gigante
          const MAX_WIDTH = 200
          const MAX_HEIGHT = 200
          
          let width = img.width
          let height = img.height
          
          // calculo novas dimensoes mantendo proporcao
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = (height * MAX_WIDTH) / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = (width * MAX_HEIGHT) / height
              height = MAX_HEIGHT
            }
          }
          
          // crio um canvas pra redimensionar
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          
          // converto pra base64 com qualidade reduzida (0.7), pra ficar leve
          const base64 = canvas.toDataURL('image/jpeg', 0.7)
          
          // atualizo preview e dados do formulario
          this.imagemPerfilPreview = base64
          this.formData.imagem_perfil = base64
          
          // limpo msg de erro se tiver
          this.mensagemErro = ''
        }
        
        img.onerror = () => {
          this.mensagemErro = 'Erro ao processar a imagem. Tente outra imagem.'
        }
        
        img.src = e.target.result
      }
      
      reader.onerror = () => {
        this.mensagemErro = 'Erro ao ler o arquivo. Tente novamente.'
      }
      
      reader.readAsDataURL(file)
    },
    formatarTelefone(event) {
      let valor = event.target.value.replace(/\D/g, '')
      
      if (valor.length <= 10) {
        valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
      } else {
        valor = valor.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
      }
      
      this.formData.telefone = valor
    },
    formataTipoUsuario(tipo) {
      const tipos = {
        'admin': 'Administrador',
        'cliente': 'Cliente',
        'fornecedor': 'Fornecedor'
      }
      return tipos[tipo] || tipo
    },
    async salvarPerfil() {
      this.salvando = true
      this.mensagemErro = ''
      this.mensagemSucesso = ''

      try {
        const userData = JSON.parse(localStorage.getItem('user'))
        if (!userData || !userData.token) {
          this.$router.push('/login')
          return
        }

        // preparo os dados pra enviar
        const dadosEnvio = {
          nome: this.formData.nome || null,
          data_nascimento: this.formData.data_nascimento || null,
          telefone: this.formData.telefone || null,
          imagem_perfil: this.formData.imagem_perfil || null
        }

        const response = await fetch(`${API_BASE_URL}/users/perfil`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dadosEnvio)
        })

        // confiro o content-type da resposta
        const contentType = response.headers.get('content-type')
        
        if (!response.ok) {
          let errorMessage = 'Erro ao salvar perfil'
          
          // tento ler como json, se nao rolar leio como texto
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await response.json()
              errorMessage = errorData.error || errorData.message || errorMessage
            } catch (e) {
              console.error('Erro ao parsear JSON de erro:', e)
            }
          } else {
            // se nao for json, leio como texto (pode vir html)
            const textError = await response.text()
            console.error('Resposta de erro não-JSON:', textError.substring(0, 200))
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
          
          throw new Error(errorMessage)
        }

        // confiro se e json antes do parse
        if (!contentType || !contentType.includes('application/json')) {
          const textResponse = await response.text()
          console.error('Resposta não-JSON recebida:', textResponse.substring(0, 200))
          throw new Error('Resposta inválida do servidor. Verifique se o servidor está rodando corretamente.')
        }

        const perfilAtualizado = await response.json()
        
        // atualizo o localStorage com os novos dados (mantem token e tipo)
        const userAtualizado = {
          ...userData,
          nome: perfilAtualizado.nome,
          email: perfilAtualizado.email,
          tipo: perfilAtualizado.tipo,
          imagem_perfil: perfilAtualizado.imagem_perfil || null
        }
        localStorage.setItem('user', JSON.stringify(userAtualizado))
        
        // disparo um evento pra atualizar outros componentes
        window.dispatchEvent(new Event('storage'))

        // atualizo os dados do formulario e preview com o que salvou
        this.formData.imagem_perfil = perfilAtualizado.imagem_perfil || null
        this.imagemPerfilPreview = perfilAtualizado.imagem_perfil || null
        
        // atualizo os dados originais depois que salva de boa
        this.dadosOriginais = JSON.parse(JSON.stringify(this.formData))
        this.dadosOriginais.imagemPerfilPreview = this.imagemPerfilPreview

        this.mensagemSucesso = 'Perfil atualizado com sucesso!'
        
        // limpo a msg depois de 3s
        setTimeout(() => {
          this.mensagemSucesso = ''
        }, 3000)

      } catch (error) {
        console.error('Erro ao salvar perfil:', error)
        this.mensagemErro = error.message || 'Erro ao salvar perfil. Tente novamente.'
      } finally {
        this.salvando = false
      }
    },
    cancelarEdicao() {
      if (this.dadosOriginais) {
        // restauro todos os dados do formulario
        this.formData = {
          nome: this.dadosOriginais.nome || '',
          email: this.dadosOriginais.email || '',
          tipo: this.dadosOriginais.tipo || '',
          data_nascimento: this.dadosOriginais.data_nascimento || '',
          telefone: this.dadosOriginais.telefone || '',
          imagem_perfil: this.dadosOriginais.imagem_perfil || ''
        }
        
        // restauro a imagem de preview
        this.imagemPerfilPreview = this.dadosOriginais.imagem_perfil || this.dadosOriginais.imagemPerfilPreview || null
      } else {
        // se nao tiver dados originais, recarrega do servidor
        this.carregarPerfil()
      }
      
      // limpo msgs
      this.mensagemErro = ''
      this.mensagemSucesso = ''
    },
    voltarParaHome() {
      try {
        const userData = JSON.parse(localStorage.getItem('user'))
        if (userData && userData.tipo) {
          // redireciono pra home pelo tipo do usuario
          this.$router.push(`/${userData.tipo}`)
        } else {
          // se nao tiver tipo, vai pro login
          this.$router.push('/login')
        }
      } catch (e) {
        // se der erro, vai pro login
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style scoped>
.configuracoes-avatar-wrap .configuracoes-avatar {
  cursor: pointer;
}

.card {
  border-radius: 10px;
}

.card-header {
  border-radius: 10px 10px 0 0 !important;
}

.form-control:disabled {
  background-color: #e9ecef;
  opacity: 1;
}

input[type="file"] {
  display: none;
}

.rounded-circle {
  transition: transform 0.2s;
}

.rounded-circle:hover {
  transform: scale(1.05);
}
</style>

