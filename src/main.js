import Vue from 'vue'
import App from './App'
import store from './store'
import { Calendar } from 'vant'

Vue.config.productionTip = false
Vue.use(Calendar)

App.mpType = 'app'

const app = new Vue({
  store,
  ...App
})
app.$mount()
