<template>
  <div id="newtask">
    <v-card>
      <v-layout row fill-height align-center justify-center>
        <v-flex mt-4 ml-2>
          <v-text-field
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
        <v-flex ma-2>
          <v-btn id="newtask-add" @click="addTask">追加</v-btn>
          <v-btn @click="cancel">キャンセル</v-btn>
        </v-flex>
      </v-layout>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator'
import firebase, { firestore } from 'firebase'
import uuid from 'uuid'
import FirestoreUtil from '../util/FirestoreUtil'
import ITask from '../lib/ITask'
import Task from '../lib/Task'
import DateUtil from '@/util/DateUtil'

@Component
export default class NewTask extends Vue {
  public inputvalue_: string = ''

  private keyDownCode_: number = 0

  public addTask(): void {
    if (this.inputvalue_.trim() === '') {
      return
    }

    // 現在リストで開いている日付で時間は今の時間を使ってタスクを作成する
    const d: Date = new Date(this.$store.getters['taskList/targetDate'])
    const now = DateUtil.clearDate(new Date())
    const date = DateUtil.getDateObjectByDate(d, now)
    const task: Task = new Task(date, this.inputvalue_)
    this.$store.commit('taskList/addTask', task)

    FirestoreUtil.saveTasks(
      this.$store.getters['taskList/user'].uid,
      this.$store.getters['taskList/taskCtrl'])

    this.inputvalue_ = ''

    // イベント発生
    this.addEnd()
  }

  public cancel(): void {
    // イベント発生
    this.addEnd()
  }

  @Emit('start-edit-task-name-event')
  // tslint:disable-next-line:no-empty
  private startEditTaskName(): void {}

  @Emit('end-edit-task-name-event')
  // tslint:disable-next-line:no-empty
  private endEditTaskName(): void {}

  @Emit('addedEvent')
  // tslint:disable-next-line:no-empty
  private addEnd(): void {}

  private keyDown(event: KeyboardEvent): void {
    this.keyDownCode_ = event.keyCode
  }

  /**
   * 日本語入力確定のEnterキーで以外で先に進むようにする
   */
  private keyUpEnter(): void {
    if (this.keyDownCode_ === 13) {
      this.addTask()
      this.keyDownCode_ = 0
    }
  }
}
</script>

<style>
</style>


