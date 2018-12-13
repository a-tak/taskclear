import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import firebase from 'firebase';
import './registerServiceWorker';
import { RouteRecord } from 'vue-router';

Vue.config.productionTip = false;

const config = {
    apiKey: process.env.VUE_APP_API_KEY,
    authDomain: process.env.VUE_APP_AUTH_DOMAIN,
    databaseURL: process.env.VUE_APP_DATABASE_URL,
    projectId: process.env.VUE_APP_PROJECT_ID,
    storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID,
};
firebase.initializeApp(config);

Vue.use(Vuetify);

const firestore = firebase.firestore();
const settings = {timestampsInSnapshots: true};
firestore.settings(settings);

new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount('#app');

router.beforeEach((to, from, next) => {
  // isPublic でない場合(=認証が必要な場合)、かつ、ログインしていない場合
  if (to.matched.some((record: RouteRecord) => !record.meta.isPublic)) {
    console.log(`pulicではない`);
    firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
      if (user) {
        console.log(`認証済み`);
        next();
      } else {
        console.log(`認証してない`);
        next({ path: '/login', query: { redirect: to.fullPath }});
      }
    });
  } else {
    console.log(`pulicだ`);
    next();
  }
});
