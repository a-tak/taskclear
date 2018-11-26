import Vue from 'vue';
import Vuex from 'vuex';
import Task from './lib/Task';
import TaskController from './lib/TaskController';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    taskCtrl: new TaskController(),
    // 認証ユーザー情報
    user: null,
    // タスク表示日付 コストラクタが簡単なヤツはこれで初期化して型決定できるんだけどなぁ
    targetDate: new Date(),
  },
  getters: {
    taskCtrl(state) { return state.taskCtrl; },
    user(state) { return state.user; },
    targetDate(state) { return state.targetDate; },
  },
  mutations: {
    addTask(state, task: Task) {
      state.taskCtrl.tasks.push(task);
    },
    deleteTask(state, task: Task) {
      const index = state.taskCtrl.tasks.indexOf(task);
      // todo deleteTaskByIndexと同じロジック。他のmutation呼び出せないか?
      state.taskCtrl.tasks.splice(index, 1);
    },
    setTaskCtrl(state, taskCtrl: TaskController) {
      state.taskCtrl = taskCtrl;
    },
    setUser(state, user) {
      state.user = user;
    },
    setTargetDate(state, date: Date) {
      state.targetDate = date;
    },
    sortTask(state) {
      state.taskCtrl.sort();
    },
  },
  actions: {

  },
});



