<!-- Todo codigo HTML sera escrito aqui-->
<template>
  <div class="container-principal">
    <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
      <form class="p-4 border rounded" style="min-width: 300px;" @submit.prevent="onClick">
        <div class="mb-3">
          <label for="inputEmail" class="form-label">Usuario (Email):</label>
          <input v-model="inputEmail" type="email" class="form-control" id="inputEmail" aria-describedby="emailHelp">
          <div id="emailHelp" class="form-text">Nunca compartilharemos seu e-mail com mais ninguém.</div>
        </div>
        <div class="mb-3">
          <label for="inputPassword" class="form-label">Password</label>
          <input v-model="inputPassword" type="password" class="form-control" id="inputPassword">
        </div>
        <div class="mb-3 form-check">
          <input type="checkbox" class="form-check-input" id="exampleCheck1">
          <label class="form-check-label" for="exampleCheck1">Aceita os Termos...</label>
        </div>
        <div class="form-text errorLogin" :class="typeError" v-if="errorLogin"> {{ msgErro }}</div>
        <button type="submit" class="btn btn-primary w-100">Login sistema</button>
      </form>


    </div>

  </div>

</template>


<!-- codigo javascript sera feito aqui -->
<script>

export default {
  data() {
    return {
      inputEmail: null,
      inputPassword: null,
      msgErro: 'Usuário ou Senha inválida!',
      errorLogin: false,
    }
  },
  methods: {
    async onClick() {
      try {
        const response = await fetch("http://localhost:3009/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: this.inputEmail, // 👈 certifique-se que existe no banco
            senha: this.inputPassword,       // 👈 backend espera "password" (não "senha")
          }),
        });

        if (!response.ok) throw new Error("Erro ao fazer login");

        const data = await response.json();
        this.users = data.user; // 👈 supondo que backend retorna { token, user }

        localStorage.setItem("user", JSON.stringify(data))


        alert(` ${data?.user?.email} Login bem-sucedido `)
        console.log("Login bem-sucedido:", data);
        location.reload();
        this.errorLogin = false;

      } catch (err) {
        this.errorLogin = true;
        alert("Inicio error" + err)
        this.error = err.message;
      } finally {
        this.loading = false;
      }


    }

  }

}

</script>


<!-- Todo arquivo css ou STYLE do elemento será escrito aqui-->
<style scoped>
.errorLogin {
  background-color: #f8d7da;
  /* vermelho claro */
  color: #721c24;
  /* vermelho escuro (texto) */
  border: 1px solid #f5c6cb;
  /* borda suave */
  padding: 12px 16px;
  margin-bottom: 10px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
}

</style>
