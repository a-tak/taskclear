import Task from '@/lib/Task'
import TaskController from '@/lib/TaskController'

export interface State {
  taskCtrl: TaskController
  user: firebase.User | undefined
  targetDate: Date
}

export default {
  namespaced: true,
  state: {
    taskCtrl: new TaskController(),
    // 認証ユーザー情報
    user: undefined,
    // タスク表示日付 コストラクタが簡単なヤツはこれで初期化して型決定できるんだけどなぁ
    targetDate: new Date(),
  },
  getters: {
    taskCtrl(state: State) { return state.taskCtrl; },
    user(state: State) { return state.user; },
    targetDate(state: State) { return state.targetDate; },
  },
  mutations: {
    addTask(state: State, task: Task) {
      state.taskCtrl.tasks.push(task)
    },
    deleteTask(state: State, task: Task) {
      const index = state.taskCtrl.tasks.indexOf(task)
      // todo deleteTaskByIndexと同じロジック。他のmutation呼び出せないか?
      state.taskCtrl.tasks.splice(index, 1)
    },
    setTaskCtrl(state: State, taskCtrl: TaskController) {
      state.taskCtrl = taskCtrl
    },
    setUser(state: State, user: firebase.User | undefined) {
      state.user = user
    },
    setTargetDate(state: State, date: Date) {
      state.targetDate = date
    },
    sortTask(state: State) {
      state.taskCtrl.sort()
    },
  },
  actions: {

  },
}



