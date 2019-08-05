import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from '@/store/Store'
import './registerServiceWorker'
import vuetify from './plugins/vuetify'
import firebase from 'firebase'
import { RouteRecord } from 'vue-router'

Vue.config.productionTip = false

const config = {
  apiKey: process.env.VUE_APP_API_KEY,
  authDomain: process.env.VUE_APP_AUTH_DOMAIN,
  databaseURL: process.env.VUE_APP_DATABASE_URL,
  projectId: process.env.VUE_APP_PROJECT_ID,
  storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID,
}
firebase.initializeApp(config)
firebase.firestore().enablePersistence()
  .catch((err) => {
    // tslint:disable-next-line: no-console
    console.error(err.code)
  })


const firestore = firebase.firestore()

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app')

router.beforeEach((to, from, next) => {
  // isPublic でない場合(=認証が必要な場合)、かつ、ログインしていない場合
  const notPublic: boolean = to.matched.some((record: RouteRecord) => !record.meta.isPublic)
  if (notPublic) {
    firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
      if (user) {
        next()
      } else {
        next({ path: '/login', query: { redirect: to.fullPath } })
      }
    })
  } else {
    next()
  }
})
