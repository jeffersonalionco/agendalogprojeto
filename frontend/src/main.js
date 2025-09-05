import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap' // se quiser também o JS (dropdown, modal, tooltip etc.)
import router from './router'


window.app = createApp(App).use(router).mount('#app')
