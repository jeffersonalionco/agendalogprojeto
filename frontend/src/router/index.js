import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { jwtDecode } from 'jwt-decode'


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
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),

  },
  {
    path: '/pedidos',
    name: 'pedidos',
    component: () => import('../views/PedidosView.vue'),
    meta: { requiresAuth: true}
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})




// Aqui onde trabalho com a segurança das rotas---
router.beforeEach((to, from, next) => {

  const userData = localStorage.getItem("user");
  const isLogged = !!userData; // true se tiver algo no localStorage
  const user = isLogged ? JSON.parse(userData) : null;

  // const user = localStorage.getItem("user")
  // const tokenDecoded = jwt.verify(user.token, 'SDFBHHLASDGFÇUIHIU4325UIDSF')      /// implementar ainda
  // console.log(tokenDecoded)

   // 1️⃣ Se for rota de login
  if (to.path === '/login') {
    if (isLogged) return next('/'); // logado não pode acessar login
    return next();                 // rota livre se não logado
  }

if(to.meta.requiresAuth){
  
  if (!isLogged) {
    return next({
      path: '/login',
      query: { error: true, type: 'semToken', msgError: "Faça login, para acessar as rotas" }
    })
  }

  if (isLogged && isTokenExpirado(user.token)) {
    localStorage.removeItem("user");
    return next(
      {
        path: '/login',
        query: { error: true, type: 'isTokenExpirado', msgError: "Tempo Expirado, faça login Novamente...." }

      })
  }

}
  


  //if(to.meta.role && user?.role !== to.meta.role){
  //  return next('/login')
  // }


  next()
})



export default router
