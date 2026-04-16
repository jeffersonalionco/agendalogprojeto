import { createRouter, createWebHashHistory } from 'vue-router'
import { jwtDecode } from 'jwt-decode'

// funcao pra ver se o token ja era (expirou) ou ta suave ainda
function isTokenExpirado(token) {
  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch (error) {
    return true;
  }
}

const routes = [
  { path: '/', redirect: '/login' }, // rota inicialzinha
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/cliente',
    name: 'homeCliente',
    component: () => import('../views/HomeCliente.vue'),
    meta: { requiresAuth: true, role: 'cliente' }
  },
  {
    path: '/admin',
    name: 'homeAdmin',
    component: () => import('../views/HomeAdmin.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/fornecedor',
    name: 'homeFornecedor',
    component: () => import('../views/HomeFornecedor.vue'),
    meta: { requiresAuth: true, role: 'fornecedor' }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/pedidos',
    name: 'pedidos',
    component: () => import('../views/PedidosView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/configuracoes',
    name: 'configuracoes',
    component: () => import('../views/ConfiguracoesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/usuarios',
    name: 'gerenciarUsuarios',
    component: () => import('../views/GerenciarUsuariosView.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/produtos',
    name: 'gerenciarProdutos',
    component: () => import('../views/GerenciarProdutosView.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  // rota coringa pra quando o cara digita qualquer coisa e nao acha pagina
  { path: '/:pathMatch(.*)*', redirect: '/' },
  {
    path: '/logout',
    name: 'logout',
    beforeEnter: (to, from, next) => {
      // tiro o usuario do localStorage aqui
      localStorage.removeItem('user');
      // mando pro login dnv
      next('/login');
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// guard de navegacao (pra nao deixar entrar onde nao deve)
router.beforeEach((to, from, next) => {
  const userData = localStorage.getItem("user");
  let user = null;
  if (userData) {
    try {
      user = JSON.parse(userData);
    } catch (e) {
      localStorage.removeItem("user");
      user = null;
    }
  }

  const token = user?.token;
  const tipo = user?.tipo;
  const isLogged = !!token && !!tipo;

  // se o cara tentar ir pro login
  if (to.path === '/login') {
    if (isLogged) return next(`/${tipo}`); // joga usuario logado pra rota dele
    return next();
  }

  // rotas que pede autenticacao
  if (to.meta.requiresAuth) {
    if (!isLogged) {
      return next({ path: '/login', query: { error: true, type: 'semToken' } });
    }

    if (isTokenExpirado(token)) {
      localStorage.removeItem("user");
      return next({ path: '/login', query: { error: true, type: 'isTokenExpirado' } });
    }

    // confere role da rota (admin/cliente/fornecedor)
    if (to.meta.role && to.meta.role !== tipo) {
      return next(`/${tipo}`); // volto pra rota certa do usuario
    }
  }

  next(); // segue normal
});

export default router;
