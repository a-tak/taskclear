import Vue from 'vue';
import Router from 'vue-router';
import TaskListMain from '@/views/TaskListMain.vue';
import Login from '@/views/Login.vue';


Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    { path: '*', redirect: 'login' },
    { path: '/login', name: 'login', component: Login, meta: { isPublic: true} },
    { path: '/tasklist', name: 'tasklist', component: TaskListMain },
  ],
});



