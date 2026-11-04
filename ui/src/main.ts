import { createApp } from 'vue'
import App from './App.vue'
import './styles/global.css'
import { vTip } from './lib/tooltip'

const app = createApp(App)
app.directive('tip', vTip)
app.mount('#app')
