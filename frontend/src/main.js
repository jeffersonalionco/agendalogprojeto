import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap' // se quiser tbm o js (dropdown, modal, tooltip e essas parada)
import router from './router'


window.app = createApp(App).use(router).mount('#app')
