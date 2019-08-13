import Vue from 'vue'
import Router from 'vue-router'
import TaskListMain from '@/views/TaskListMain.vue'
import Login from '@/views/Login.vue'
import SectionList from '@/views/SectionList.vue'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    { path: '*', redirect: 'login' },
    { path: '/login', name: 'login', component: Login, meta: { isPublic: true} },
    { path: '/tasklist', name: 'tasklist', component: TaskListMain },
    { path: '/sectionlist', name: 'sectionlist', component: SectionList },
  ],
})



