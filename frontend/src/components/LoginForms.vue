<template>
  <div class="login-forms">
    <div class="login-card">
      <header class="login-card__header">
        <div class="login-card__brand" aria-hidden="true">
          <span class="login-card__logo">
            <i class="bi bi-calendar-check"></i>
          </span>
        </div>
        <h1 class="login-card__title">AgendaLog</h1>
        <p class="login-card__subtitle">Entre na sua conta</p>
      </header>

      <form class="login-card__form" @submit.prevent="onClick">
        <div class="login-field">
          <label for="inputEmail" class="login-field__label">E-mail</label>
          <div class="login-field__control">
            <i class="bi bi-envelope login-field__icon" aria-hidden="true"></i>
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
        </div>

        <div class="login-field">
          <label for="inputPassword" class="login-field__label">Senha</label>
          <div class="login-field__control">
            <i class="bi bi-lock login-field__icon" aria-hidden="true"></i>
            <input
              v-model="inputPassword"
              type="password"
              class="login-field__input"
              id="inputPassword"
              placeholder="Sua senha"
              autocomplete="current-password"
              required
            />
          </div>
        </div>

        <div v-if="errorLogin" class="login-error" role="alert">
          <i class="bi bi-exclamation-circle" aria-hidden="true"></i>
          <span>{{ msgErro }}</span>
        </div>

        <button type="submit" class="login-submit" :disabled="loading">
          <span v-if="!loading" class="login-submit__label">
            Entrar
            <i class="bi bi-arrow-right-short" aria-hidden="true"></i>
          </span>
          <span v-else class="login-submit__spinner" aria-label="Entrando…"></span>
        </button>

        <p class="login-footer-text">
          <i class="bi bi-shield-check" aria-hidden="true"></i>
          Seus dados estão seguros. Nunca compartilhamos seu e-mail.
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import { getApiBaseUrl, parseApiJson } from '@/services/api.js'

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
      const loginUrl = `${getApiBaseUrl()}/auth/login`;
      try {
        const response = await fetch(loginUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: this.inputEmail,
            senha: this.inputPassword,
          }),
        });

        const data = await parseApiJson(response);

        if (!response.ok) {
          throw new Error(
            (data && data.error) ||
              `Erro ${response.status} ao acessar ${loginUrl}. Verifique VUE_APP_API_BASE_URL (deve terminar em /api) e faça novo build.`
          );
        }

        if (!data) {
          throw new Error(
            `Resposta inválida do servidor (${loginUrl}). URL correta: …/api/auth/login — reinicie o dev server ou rode npm run build de novo.`
          );
        }
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
/* login - padrao vale pros dois, mobile muda no @media */

/* card do formulario */
.login-forms {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

.login-card {
  background: #fff;
  border-radius: 16px;
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.18),
    0 8px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.login-card__header {
  position: relative;
  padding: 2rem 1.5rem 1.5rem;
  text-align: center;
  background: linear-gradient(165deg, #2c3e50 0%, #34495e 55%, #2c3e50 100%);
  color: #fff;
}

.login-card__header::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 48px;
  height: 3px;
  border-radius: 3px;
  background: #42b983;
}

.login-card__brand {
  display: flex;
  justify-content: center;
  margin-bottom: 0.85rem;
}

.login-card__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(66, 185, 131, 0.15);
  border: 2px solid rgba(66, 185, 131, 0.45);
  color: #42b983;
  font-size: 1.65rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.login-card__title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #fff;
}

.login-card__subtitle {
  margin: 0.4rem 0 0.5rem;
  font-size: 0.925rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.82);
}

.login-card__form {
  padding: 1.65rem 1.5rem 1.75rem;
}



/* campos email e senha */
.login-field {
  margin-bottom: 1.15rem;
}

.login-field__label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #2c3e50;
  opacity: 0.85;
}

.login-field__control {
  position: relative;
  display: flex;
  align-items: center;
}

.login-field__icon {
  position: absolute;
  left: 1rem;
  z-index: 1;
  font-size: 1.05rem;
  color: #6c757d;
  pointer-events: none;
  transition: color 0.2s;
}




/* mobile - input alto */
.login-field__input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.75rem;
  font-size: 1rem;
  line-height: 1.4;
  color: #2c3e50;
  background: #f8f9fa;
  border: 1.5px solid #e9ecef;
  border-radius: 12px;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  min-height: 52px;
  -webkit-tap-highlight-color: transparent;
}

.login-field__input::placeholder {
  color: #adb5bd;
}

.login-field__control:focus-within .login-field__icon {
  color: #42b983;
}

.login-field__input:focus {
  outline: none;
  background: #fff;
  border-color: #42b983;
  box-shadow: 0 0 0 4px rgba(66, 185, 131, 0.18);
}

.login-error {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.4;
}

.login-error i {
  flex-shrink: 0;
  margin-top: 0.1rem;
  font-size: 1rem;
}





/* botao entrar */
.login-submit {
  width: 100%;
  padding: 0.9rem 1.25rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #42b983 0%, #36a372 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  min-height: 52px;
  transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
  margin-top: 0.35rem;
  box-shadow: 0 4px 14px rgba(66, 185, 131, 0.4);
}

.login-submit__label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
}

.login-submit__label i {
  font-size: 1.35rem;
  line-height: 1;
}

.login-submit:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(66, 185, 131, 0.45);
}






/* mobile - apertou o botao */
.login-submit:active:not(:disabled) {
  transform: scale(0.98);
}

.login-submit:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.login-submit__spinner {
  display: inline-block;
  width: 1.35rem;
  height: 1.35rem;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: login-spin 0.7s linear infinite;
}

.login-footer-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  margin: 1.15rem 0 0;
  font-size: 0.75rem;
  color: #6c757d;
  text-align: center;
  line-height: 1.45;
}

.login-footer-text i {
  color: #42b983;
  font-size: 0.9rem;
  flex-shrink: 0;
}

@keyframes login-spin {
  to { transform: rotate(360deg); }
}




/* mobile - card maior, inputs maiores */
@media (max-width: 767px) {
  .login-forms {
    max-width: none;
    width: 100%;
    padding: 0;
  }

  .login-card {
    border-radius: 24px;
    box-shadow:
      0 32px 64px rgba(0, 0, 0, 0.28),
      0 0 0 1px rgba(255, 255, 255, 0.06) inset;
  }

  .login-card__header {
    padding: 2.25rem 1.5rem 1.75rem;
  }

  .login-card__header::after {
    width: 56px;
    height: 4px;
  }

  .login-card__logo {
    width: 64px;
    height: 64px;
    font-size: 1.85rem;
    border-radius: 18px;
  }

  .login-card__title {
    font-size: 1.75rem;
  }

  .login-card__subtitle {
    font-size: 1rem;
    margin-top: 0.5rem;
  }

  .login-card__form {
    padding: 1.75rem 1.35rem 2rem;
  }

  .login-field {
    margin-bottom: 1.25rem;
  }

  .login-field__input {
    min-height: 54px;
    font-size: 16px;
    border-radius: 14px;
  }

  .login-submit {
    min-height: 54px;
    border-radius: 14px;
    font-size: 1.0625rem;
    margin-top: 0.5rem;
  }

  .login-footer-text {
    font-size: 0.8125rem;
    padding: 0 0.25rem;
  }
}



/* mobile - tela bem pequena */
@media (max-width: 380px) {
  .login-card__form {
    padding-left: 1.15rem;
    padding-right: 1.15rem;
  }
}





/* desktop - card centralizado */
@media (min-width: 768px) {
  .login-forms {
    padding: 1rem 0;
  }

  .login-card {
    border-radius: 18px;
  }
}





/* mobile - encaixa no notch do celular */
@supports (padding: max(0px)) {
  .login-forms {
    padding-left: max(0px, env(safe-area-inset-left));
    padding-right: max(0px, env(safe-area-inset-right));
  }

  @media (max-width: 767px) {
    .login-forms {
      padding-bottom: max(0px, env(safe-area-inset-bottom));
    }
  }
}
</style>
