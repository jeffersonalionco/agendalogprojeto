import { createRouter, createWebHashHistory } from 'vue-router'
import { jwtDecode } from 'jwt-decode'

// Função para verificar se o token expirou
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
  { path: '/', redirect: '/login' }, // rota inicial
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
  // rota coringa para páginas não encontradas
  { path: '/:pathMatch(.*)*', redirect: '/' },
  {
    path: '/logout',
    name: 'logout',
    beforeEnter: (to, from, next) => {
      // Remove o usuário do localStorage
      localStorage.removeItem('user');
      // Redireciona para login
      next('/login');
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const userData = localStorage.getItem("user");
  const isLogged = !!userData;
  const user = isLogged ? JSON.parse(userData) : null;

  // Se tentar acessar login
  if (to.path === '/login') {
    if (isLogged) return next(`/${user.tipo}`); // redireciona usuário logado para sua rota
    return next();
  }

  // Rotas que exigem autenticação
  if (to.meta.requiresAuth) {
    if (!isLogged) {
      return next({ path: '/login', query: { error: true, type: 'semToken' } });
    }

    if (isTokenExpirado(user.token)) {
      localStorage.removeItem("user");
      return next({ path: '/login', query: { error: true, type: 'isTokenExpirado' } });
    }

    // Verifica role da rota
    if (to.meta.role && to.meta.role !== user.tipo) {
      return next(`/${user.tipo}`); // redireciona para a rota correta do usuário
    }
  }

  next(); // segue normalmente
});

export default router;
