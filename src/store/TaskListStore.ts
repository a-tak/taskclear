import Task from "@/lib/Task"
import TaskConnector from "@/lib/TaskConnector"
import TaskController from "@/lib/TaskController"
import Store from "@/store/Store"
import firebase from "firebase/app"

const con: TaskConnector = new TaskConnector()
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
    taskCtrl(state: State) {
      return state.taskCtrl
    },
    user(state: State) {
      return state.user
    },
    targetDate(state: State) {
      return state.targetDate
    },
  },
  mutations: {
    addTask(state: State, task: Task) {
      state.taskCtrl.tasks.push(task)
    },
    deleteTask(state: State, task: Task) {
      const index = state.taskCtrl.tasks.findIndex((item) => item.id === task.id)
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
    clearTask(state: State) {
      state.taskCtrl.tasks = []
    },
  },
  actions: {
    startListner({
      commit,
    }: {
      commit: (name: string, payload?: any) => void
    }): void {
      commit("setTaskCtrl", new TaskController())
      // ドキュメントの各変更に対応する処理
      const addedFunc: (task: Task) => void = (task: Task) => {
        // 配列の最後に追加されることになるが一旦UIのわかりやすさ優先でこの仕様にしておく
        // 厳密にやると今の時間で追加するので最後尾に来るとは限らない
        // 普通のオペレーションだと追加後に時間を設定し直すので、その時に正しい日付が設定されるはず
        // それか末尾に来るような時間をデフォルトでセットするかだな
        commit("addTask", task)
        commit("sortTask")
      }
      const modifiedFunc: (task: Task) => void = (task: Task) => {
        // ソートするので一旦削除して追加するやり方でいく
        commit("deleteTask", task)
        commit("addTask", task)
        commit("sortTask")
      }
      const removedFunc: (task: Task) => void = (task: Task) => {
        commit("deleteTask", task)
      }
      commit("clearTask")
      // リスナースタート
      con.startListener(
        Store.getters["taskList/user"].uid,
        Store.getters["taskList/targetDate"],
        addedFunc,
        modifiedFunc,
        removedFunc,
      )
    },
    stopListner(
      { commit }: { commit: (arg1: string, arg2: Task) => void },
      section: Task,
    ) {
      con.stopListener()
    },
    // { commit }はオブジェクトを分割代入でうけとる引数の書き方
    // TypeScriptの型指定として「: {commit: (arg1: string, arg2: Section) => void }」という関数型の定義をしてしないとコンパイルできない😢
    set(
      { commit }: { commit: (arg1: string, arg2: Task) => void },
      task: Task,
    ) {
      // Firestoreに書き込み
      con.set(Store.getters["taskList/user"].uid, task)
    },
    async delete(
      { commit }: { commit: (arg1: string, arg2: Task) => void },
      task: Task,
    ) {
      await con.delete(Store.getters["taskList/user"].uid, task)
    },
  },
}
