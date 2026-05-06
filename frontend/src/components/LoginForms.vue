<template>
  <div class="login-forms">
    <div class="login-card">
      <header class="login-card__header">
        <h1 class="login-card__title">AgendaLog</h1>
        <p class="login-card__subtitle">Entre na sua conta</p>
      </header>

      <form class="login-card__form" @submit.prevent="onClick">
        <div class="login-field">
          <label for="inputEmail" class="login-field__label">E-mail</label>
          <input
            v-model="inputEmail"
            type="email"
            class="login-field__input"
            id="inputEmail"
            placeholder="seu@email.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="login-field">
          <label for="inputPassword" class="login-field__label">Senha</label>
          <input
            v-model="inputPassword"
            type="password"
            class="login-field__input"
            id="inputPassword"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </div>

        <div v-if="errorLogin" class="login-error" role="alert">
          {{ msgErro }}
        </div>

        <button type="submit" class="login-submit" :disabled="loading">
          <span v-if="!loading">Entrar</span>
          <span v-else class="login-submit__spinner"></span>
        </button>

        <p class="login-footer-text">
          Seus dados estão seguros. Nunca compartilhamos seu e-mail.
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { getApiBaseUrl } from '@/services/api.js'

export default {
  name: "LoginForms",
  data() {
    return {
      inputEmail: null,
      inputPassword: null,
      msgErro: "Usuário ou senha inválidos.",
      errorLogin: false,
      loading: false,
    };
  },
  methods: {
    async onClick() {
      this.errorLogin = false;
      this.loading = true;
      try {
        const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: this.inputEmail,
            senha: this.inputPassword,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao fazer login");
        }

        const data = await response.json();
        localStorage.setItem("user", JSON.stringify(data));

        const tipo = data.tipo;
        if (tipo) {
          this.$router.push(`/${tipo}`);
        } else {
          throw new Error("Tipo de usuário não encontrado na resposta");
        }
      } catch (err) {
        this.errorLogin = true;
        this.msgErro = err.message || "Usuário ou senha inválidos.";
        console.error("Erro no login:", err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* paleta mantida #2c3e50 (texto/header) #42b983 (destaque) e tal, nao quis inventar mto */
.login-forms {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

.login-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.login-card__header {
  padding: 1.75rem 1.5rem 1.25rem;
  text-align: center;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: #fff;
}

.login-card__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #fff;
}

.login-card__subtitle {
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.9);
}

.login-card__form {
  padding: 1.5rem 1.5rem 1.75rem;
}

.login-field {
  margin-bottom: 1.1rem;
}

.login-field__label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #2c3e50;
}

.login-field__input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  line-height: 1.4;
  color: #2c3e50;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  min-height: 48px;
}

.login-field__input::placeholder {
  color: #6c757d;
}

.login-field__input:hover {
  border-color: #adb5bd;
}

.login-field__input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
}

.login-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

.login-submit {
  width: 100%;
  padding: 0.85rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: #0d6efd;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  min-height: 48px;
  transition: background-color 0.2s, transform 0.1s;
  margin-top: 0.25rem;
}

.login-submit:hover:not(:disabled) {
  background: #0b5ed7;
}

.login-submit:active:not(:disabled) {
  transform: scale(0.99);
}

.login-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-submit__spinner {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: login-spin 0.7s linear infinite;
}

.login-footer-text {
  margin: 1rem 0 0;
  font-size: 0.75rem;
  color: #6c757d;
  text-align: center;
  line-height: 1.4;
}

@keyframes login-spin {
  to { transform: rotate(360deg); }
}

/* responsivo mobile primeiro */
@media (max-width: 480px) {
  .login-card__header {
    padding: 1.5rem 1.25rem 1rem;
  }
  .login-card__title {
    font-size: 1.35rem;
  }
  .login-card__form {
    padding: 1.25rem 1.25rem 1.5rem;
  }
  .login-field__input,
  .login-submit {
    min-height: 48px;
  }
}

@media (min-width: 768px) {
  .login-forms {
    padding: 1rem 0;
  }
  .login-card {
    border-radius: 14px;
    box-shadow: 0 14px 50px rgba(0, 0, 0, 0.12), 0 4px 14px rgba(0, 0, 0, 0.06);
  }
}

/* safe area pra celular com notch */
@supports (padding: max(0px)) {
  .login-forms {
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
  }
}
</style>
