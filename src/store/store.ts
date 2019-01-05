import Vue from 'vue';
import Vuex from 'vuex';
import taskList from '@/store/TaskListStore.ts';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    taskList,
  },
});



