/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify'
import router from '../router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import qs from 'qs'
import VueCryptojs from 'vue-cryptojs'

axios.defaults.baseURL = "https://se-phones-demo.lilikovych.name/"
axios.defaults.headers.common['X-Secret'] = 'secret API token'
axios.defaults.paramsSerializer = p => {
  return qs.stringify(p, { indices: false })
}

export function registerPlugins (app) {
  app
    .use(vuetify)
    .use(router)
    .use(VueCryptojs)
    .use(VueAxios, axios)
}
