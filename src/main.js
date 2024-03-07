import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store' // Import your Vuex store

const app = createApp(App)
app.use(router)
app.use(store) // Register your Vuex store
app.mount('#app')
