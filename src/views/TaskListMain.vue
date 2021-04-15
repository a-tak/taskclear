<template>
  <div id="main">
    <div class="fixed-header">
      <Header v-on:clickjumpToNextTaskButtomEvent="jumpToNextTask()"></Header>
      <div id="day-and-estimate">
        <v-row class="mt-1">
          <v-col cols="12" sm="12" md="6" lg="6" xf="6">
            <v-card class="elevation-5">
              <v-menu
                :close-on-content-click="false"
                v-model="menu2"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-on="on"
                    v-model="targetDate"
                    label="日付を選択してください"
                    prepend-icon="event"
                    readonly
                    class="pt-5 pl-5 pr-5"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="targetDate"
                  @input="menu2 = false"
                  locale="jp"
                  :day-format="date => new Date(date).getDate()"
                ></v-date-picker>
              </v-menu>
            </v-card>
          </v-col>
          <v-col cols="12" sm="12" md="6" lg="6" xf="6"  class="elevation-5">
            <EstimateList></EstimateList>
          </v-col>
        </v-row>
      </div>
    </div>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <div class="btns d-flex flex-column">
          <v-progress-circular
            v-if="saving_"
            indeterminate
            color="accent"
            class="ma-2"
          ></v-progress-circular>
          <v-btn
            v-on="on"
            fab
            dark
            color="accent"
            @click="addTask()"
            class="ma-2"
          >
            <v-icon dark>add</v-icon>
          </v-btn>
        </div>
      </template>
      <span>Aキーでもタスク追加できます</span>
    </v-tooltip>
    <div id="list" v-bind="listClass">
      <v-slide-y-transition class="py-0" group>
        <TaskRow
          v-for="(task, index) in tasks"
          :key="task.id"
          :task_="task"
          :index_="index"
          v-on:clickStartButtomEvent="startTask"
          v-on:clickStopButtomEvent="stopTask"
          v-on:endEditEvent="endEditTask"
          v-on:clickDeleteButtomEvent="deleteTask"
          v-on:clickCopyButtomEvent="copyTask"
          v-on:changeTaskDateChangeEvent="changeTaskDate"
          v-on:start-edit-task-name-event="startEditTaskName"
          v-on:end-edit-task-name-event="endEditTaskName"
        ></TaskRow>
      </v-slide-y-transition>
      <NewTask
        v-if="addingTask_"
        v-on:addedEvent="addedTask"
        v-on:start-edit-task-name-event="startEditTaskName"
        v-on:end-edit-task-name-event="endEditTaskName"
      ></NewTask>
    </div>
    <v-snackbar
      v-model="snackbarDisplay"
      :top="true"
      :timeout="5000"
      :multi-line="multiLine"
    >
      {{ snackbarText }}
      <v-btn color="primary" text @click="undoTask()">
        元に戻す
      </v-btn>
    </v-snackbar>
    <div>
      <Footer class="elevation-5"></Footer>
    </div>
  </div>
</template>

<style scoped>
.fixed-header {
  position: fixed;
  width: 100%;
  z-index: 100;
}
.listSp {
  padding-top: 200px;
}
.listPc {
  padding-top: 100px;
}
.btns {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 100;
}
</style>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator"
import firebase from "firebase/app"
import NewTask from "@/components/NewTask.vue"
import TaskRow from "@/components/TaskRow.vue"
import EstimateList from "@/components/EstimateList.vue"
import Header from "@/components/Header.vue"
import Footer from "@/components/Footer.vue"
import DateUtil from "@/util/DateUtil"
import FirestoreUtil from "@/util/FirestoreUtil"
import uuid from "uuid"
import Task from "@/lib/Task"
import TaskController from "@/lib/TaskController"
import Repeat from "@/lib/Repeat"
import RepeatCreator from "@/lib/RepeatCreator"
import Migration from "@/util/Migration"
import SectionConnector from "@/lib/SectionConnector"
import Util from "@/util/Util"

@Component({
  components: {
    NewTask,
    TaskRow,
    EstimateList,
    Header,
    Footer,
  },
})
export default class TaskListMain extends Vue {
  public get snackbarDisplay(): boolean {
    return this.snackbarDisplay_
  }

  public set snackbarDisplay(value: boolean) {
    this.snackbarDisplay_ = value
  }

  public get snackbarText(): string {
    return this.snackbarText_
  }

  get tasks(): Task[] {
    return this.$store.getters["taskList/taskCtrl"].tasks
  }

  set tasks(value: Task[]) {
    const tc: TaskController = new TaskController()
    tc.tasks = value
    this.$store.commit("taskList/setTaskCtrl", tc)
  }

  get targetDate(): string {
    return DateUtil.getDateString(this.$store.getters["taskList/targetDate"])
  }

  set targetDate(value: string) {
    this.$store.commit("taskList/setTargetDate", new Date(value))
  }

  get menu2(): boolean {
    return this.menu2_
  }

  set menu2(value: boolean) {
    this.menu2_ = value
  }

  get topRowLayoutAttributes(): {} {
    // 画面サイズによって入力ボックスを横に並べるか縦に並べるか切り替える
    switch (this.$vuetify.breakpoint.name) {
      case "xs":
        return { column: true }
      case "sm":
        return { column: true }
      case "md":
        return { row: true }
      case "lg":
        return { row: true }
      case "xl":
        return { row: true }
      default:
        return { row: true }
    }
  }

  get listClass(): {} {
    // 画面サイズによってツールバーとのマージンを変更
    switch (this.$vuetify.breakpoint.name) {
      case "xs":
        return { class: "listSp" }
      case "sm":
        return { class: "listSp" }
      case "md":
        return { class: "listPc" }
      case "lg":
        return { class: "listPc" }
      case "xl":
        return { class: "listPc" }
      default:
        return { class: "listPc" }
    }
  }

  get multiLine(): boolean {
    // 画面サイズによってツールバーとのマージンを変更
    switch (this.$vuetify.breakpoint.name) {
      case "xs":
        return true
      case "sm":
        return false
      case "md":
        return false
      case "lg":
        return false
      case "xl":
        return false
      default:
        return false
    }
  }

  private snackbarDisplay_: boolean = false
  private snackbarText_: string = ""
  private deletedTask_: Task | undefined = undefined
  private addingTask_: boolean = false
  private menu2_: boolean = false
  private saving_: boolean = false

  // 日付を変更したのを監視してタスクを読み込み直し
  @Watch("targetDate")
  private onValueChange(newValue: string, oldValue: string): void {
    this.deletedTask_ = undefined
    this.$store.dispatch("taskList/stopListner")
    this.loadTasks()
  }

  private async loadTasks(): Promise<void> {
    const self: TaskListMain = this

    // 当日分のリピートタスクを作る
    const rc: RepeatCreator = new RepeatCreator(
      this.$store.getters["taskList/user"].uid,
      this.$store.getters["taskList/targetDate"],
    )
    await rc.creaetRepeat(1)

    // 今日のデータを読み込み(同期的に) TODO:同期的に出来てないけどいけるか?
    this.$store.dispatch("taskList/startListner")

    // 実行中タスクにジャンプ
    this.jumpToNextTask()

    this.reCreateRepeatTask()
  }

  private async reCreateRepeatTask(): Promise<void> {
    // 非同期で明日以降1週間分のデータを作る
    const d = new Date(this.$store.getters["taskList/targetDate"])
    d.setDate(d.getDate() + 1)
    const rc2: RepeatCreator = new RepeatCreator(
      this.$store.getters["taskList/user"].uid,
      d,
    )
    try {
      rc2.creaetRepeat(6)
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(`repeate task create error! `, e)
    }
  }

  /**
   * タスクの論理削除
   */
  private deleteTask(task: Task): void {
    task.isDeleted = true
    this.$store.dispatch("taskList/set", task)

    // 元に戻したときの為にフラグ直しておく
    task.isDeleted = false
    this.deletedTask_ = task

    // 元に戻すボタン表示
    // タイムアウトリセットするため一度消す
    this.snackbarDisplay_ = false
    this.$nextTick(() => {
      // 画面更新がされたの待ってから処理しないとタイムアウトかリセットされない
      this.snackbarText_ = `「${task.title}」を削除しました`
      this.snackbarDisplay_ = true
    })
  }

  private undoTask(): void {
    if (this.deletedTask_ == undefined) {
      return
    }
    this.snackbarDisplay_ = false
    this.$store.dispatch("taskList/set", this.deletedTask_)
    this.$store.commit("taskList/sortTask")
    this.deletedTask_ = undefined
  }

  private copyTask(task: Task): void {
    const newTask: Task = task.createPauseTask()
    newTask.startTime = undefined
    newTask.endTime = undefined
    this.$store.dispatch("taskList/set", newTask)
    this.$store.commit("taskList/sortTask")
  }

  private startTask(task: Task): void {
    // 開始しているタスクがあれば中断処理する
    for (const otherTask of this.tasks) {
      if (otherTask.isDoing === true) {
        this.tasks.push(otherTask.createPauseTask())
        otherTask.title = otherTask.title + "(中断)"
        this.changeStopTask(otherTask)
      }
    }

    // 既に終了しているタスクであればコピーしてタスクを開始する
    if (task.endTime != undefined) {
      const newTask: Task = task.createPauseTask()
      newTask.isDoing = true
      newTask.startTime = new Date()
      newTask.endTime = undefined
      this.$store.dispatch("taskList/set", newTask)
    } else {
      task.isDoing = true
      task.startTime = new Date()
    }

    this.$store.commit("taskList/sortTask")

    this.$nextTick(() => {
      task.isProcessing = false
    })
  }

  private startEditTaskName() {
    this.deleteShortcut()
  }
  private endEditTaskName() {
    this.entryShortcut()
  }

  private endEditTask(task: Task, index: number) {
    Util.assertIsDefined(index)
    Util.assertIsDefined(task)

    this.$set(this.tasks, index, task)
    this.$store.dispatch("taskList/set", task)
    this.$store.getters["taskList/taskCtrl"].sort()
    this.reCreateRepeatTask()
  }

  private addTask(): void {
    this.addingTask_ = true
    this.$nextTick(() => {
      this.$vuetify.goTo("#newtask", {
        duration: 350,
        easing: "easeInOutCubic",
      })
    })
  }

  private addedTask(): void {
    this.addingTask_ = false
  }

  private changeTaskDate(task: Task): void {
    // 編集中の日付と同じならば何もしない
    if (DateUtil.getDateString(task.date) === this.targetDate) {
      return
    }
    this.$store.dispatch("taskList/set", task)
  }

  /**
   * 日付を一日進める
   */
  private forwardTargetDate(): void {
    const d = new Date(this.$store.getters["taskList/targetDate"])
    d.setDate(d.getDate() + 1)
    this.targetDate = d.toString()
  }

  /**
   * 日付を一日戻す
   */
  private returnTargetDate(): void {
    const d = new Date(this.$store.getters["taskList/targetDate"])
    d.setDate(d.getDate() - 1)
    this.targetDate = d.toString()
  }

  private stopTask(task: Task): void {
    this.changeStopTask(task)
    this.$nextTick(() => {
      task.isProcessing = false
    })
  }

  /**
   * タスクの状態を停止状態に変える(保存はしない)
   */
  private changeStopTask(task: Task): void {
    task.isDoing = false
    task.endTime = new Date()
  }

  private created(): void {
    this.initialLoad()
  }

  private destroyed(): void {
    this.$store.dispatch("taskList/stopListner")
  }

  private initialLoad() {
    firebase.auth().onAuthStateChanged(async (user: firebase.User | null) => {
      this.$store.commit("taskList/setUser", user)
      await Migration.run(this.$store.getters["taskList/user"].uid)
      // セクション読み込み
      await this.$store.dispatch("section/load")
      // 日付指定
      this.targetDate = DateUtil.calcBaseDate(new Date()).toString()
      this.loadTasks()
    })
  }
  private mounted(): void {
    this.entryShortcut()
  }

  /**
   * ショートカット有効化
   */
  private entryShortcut(): void {
    document.onkeyup = (e: KeyboardEvent) => {
      if (e.key === "d") {
        this.jumpToNextTask()
      } else if (e.key === "t") {
        this.jumpToTop()
      } else if (e.key === "a") {
        this.addTask()
      } else if (e.key === "f") {
        this.forwardTargetDate()
      } else if (e.key === "r") {
        this.returnTargetDate()
      } else if (e.key === "z") {
        this.undoTask()
      }
    }
  }

  /**
   * ショートカット無効化
   */
  private deleteShortcut(): void {
    // tslint:disable-next-line:no-empty
    document.onkeyup = (e: KeyboardEvent) => {}
  }

  private beforeDestroy(): void {
    // tslint:disable-next-line:no-null-keyword
    document.onkeydown = null
  }

  private jumpToNextTask(): void {
    let offsetValue: number = 0
    switch (this.$vuetify.breakpoint.name) {
      case "xs":
        offsetValue = 410
        break
      case "sm":
        offsetValue = 370
        break
      default:
        offsetValue = 230
    }
    this.$nextTick(() => {
      this.$vuetify.goTo("#next-task", {
        duration: 350,
        easing: "easeInOutCubic",
        offset: offsetValue,
      })
    })
  }
  private jumpToTop(): void {
    this.$nextTick(() => {
      this.$vuetify.goTo("#header", {
        duration: 350,
        easing: "easeInOutCubic",
      })
    })
  }
}
</script>
