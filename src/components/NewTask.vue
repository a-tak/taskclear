<template>
  <div id="newtask">
    <v-container grid-list-md text-xs-center>
      <v-layout row align-center>
        <v-flex>
          <v-card>
            <v-layout
              v-bind="layoutAttributes"
              align-center
              justify-space-between
              fill-height
              pr-4
            >
              <v-flex ma-3 xs6 sm6 md7 lg8>
                <v-text-field
                  id="newtask-taskname"
                  placeholder="新しいタスクを追加"
                  single-line
                  outline
                  v-model="inputvalue_"
                  autofocus
                  clearable
                  hint="記載したらEnterか追加ボタン"
                  @keydown="keyDown($event)"
                  @keyup.enter="keyUpEnter()"
                  @keyup.esc="cancel"
                  @focus="startEditTaskName()"
                  @blur="endEditTaskName()"
                ></v-text-field>
              </v-flex>
              <v-flex>
                <v-btn
                  class="ma-3 accent"
                  min-width="120"
                  id="newtask-add"
                  @click.ctrl="addTaskPressedCtrl"
                  @click.exact="addTaskNormal"
                  >追加</v-btn
                >
                <v-btn class="ma-3" min-width="120" @click="cancel"
                  >キャンセル</v-btn
                >
              </v-flex>
            </v-layout>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit } from "vue-property-decorator"
import Task from "../lib/Task"
import DateUtil from "@/util/DateUtil"

@Component
export default class NewTask extends Vue {
  public inputvalue_: string = ""

  private keyDownCode_: number = 0

  public addTaskNormal(): void {
    const task = this.addTask()
    if (task != undefined) {
      // イベント発生
      this.addEnd(task)
    }
  }

  public addTaskPressedCtrl(): void {
    if (this.addTask() != undefined) {
      // イベント発生
      this.addEndCtrlPress()
    }
  }

  /**
   * キャンセル時はundefined応答
   */
  public addTask(): Task | undefined {
    if (this.inputvalue_.trim() === "") {
      return undefined
    }

    // 現在リストで開いている日付で時間は今の時間を使ってタスクを作成する
    const d: Date = new Date(this.$store.getters["taskList/targetDate"])
    const now = DateUtil.clearDate(new Date())
    const date = DateUtil.getDateObjectByDate(d, now)
    const task: Task = new Task(date, this.inputvalue_)
    this.$store.dispatch("taskList/set", task)

    this.inputvalue_ = ""
    return task
  }

  public cancel(): void {
    // イベント発生
    this.addEndCtrlPress()
    // 新しいVuetifyからblurイベントが発生しなくなったので強制発火
    this.endEditTaskName()
  }

  @Emit("start-edit-task-name-event")
  // tslint:disable-next-line:no-empty
  private startEditTaskName(): void {}

  @Emit("end-edit-task-name-event")
  // tslint:disable-next-line:no-empty
  private endEditTaskName(): void {}

  @Emit("addedEvent")
  // tslint:disable-next-line:no-empty
  private addEnd(task: Task): void {}

  @Emit("addedCtrlPressedEvent")
  // tslint:disable-next-line:no-empty
  private addEndCtrlPress(): void {}

  private keyDown(event: KeyboardEvent): void {
    this.keyDownCode_ = event.keyCode
  }

  /**
   * 日本語入力確定のEnterキーで以外で先に進むようにする
   */
  private keyUpEnter(): void {
    if (this.keyDownCode_ === 13) {
      this.addTaskNormal()
      // 新しいVuetifyからblurイベントが発生しなくなったので強制発火
      this.endEditTaskName()
      this.keyDownCode_ = 0
    }
  }

  private get layoutAttributes(): {} {
    // 画面サイズによって入力ボックスを横に並べるか縦に並べるか切り替える
    switch (this.$vuetify.breakpoint.name) {
      case "xs":
        return { column: true }
      case "sm":
        return { row: true }
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
}
</script>

<style scoped>
</style>


