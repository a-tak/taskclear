<template>
  <v-container grid-list-md text-left pa-1>
    <div id="next-task" v-if="task_.isNext === true"></div>
    <v-layout align-center row v-if="!isEdit_">
      <v-flex>
        <v-card v-bind="rowColor" class="elevation-3">
          <v-layout align-center justify-space-between row fill-height pr-4>
            <!-- Start/End Buttom -->
            <v-flex xs2 sm1 md1 lg1 xl1>
              <v-btn
                v-bind:id="'start-btn-' + task_.id"
                v-bind:disabled="task_.isProcessing"
                icon
                ripple
                @click.stop="startTask(task_)"
                v-if="task_.isDoing === false && task_.endTime==undefined"
              >
                <v-icon color="accent">play_circle_filled</v-icon>
              </v-btn>
              <v-btn
                v-bind:disabled="task_.isProcessing"
                icon
                ripple
                @click.stop="startTask(task_)"
                v-else-if="task_.isDoing === false && task_.endTime!=undefined"
              >
                <v-icon color="deactive">play_circle_filled</v-icon>
              </v-btn>
              <v-btn
                v-bind:disabled="task_.isProcessing"
                icon
                ripple
                @click.stop="stopTask(task_)"
                v-else-if="task_.isDoing === true"
              >
                <v-icon color="accent">pause_circle_filled</v-icon>
              </v-btn>
            </v-flex>
            <!-- TaskName -->
            <v-flex nowrap xs7 sm6 md7 lg8 xl8 pa-0>
              <v-card-actions @click.stop="startEdit()" class="pa-0">
                <div
                  v-bind:class="{ done: task_.endTime!=undefined}"
                  class="font-weight-bold subtitle-1"
                >{{ task_.title }}</div>
                <!-- note -->
                <v-btn icon @click.stop="noteDialog_=true">
                  <v-icon v-if="task_.note===''" color="deactive">note</v-icon>
                  <v-icon v-if="task_.note!==''" color="accent">note</v-icon>
                </v-btn>
              </v-card-actions>
              <v-card-actions @click.stop="startEdit()">
                <v-layout align-center justify-space-between row fill-height>
                  <span v-if="multiLine === false" class="body-2">開始:{{ getTime(task_.startTime) }} / 終了: {{ getTime(task_.endTime)}} / 実績: {{ task_.actualTime }}分 / 見積: {{ task_.estimateTime }}分 予定時間帯: {{ getTime(task_.date) }}〜</span>
                  <span v-if="multiLine === true" class="body-2">開始:{{ getTime(task_.startTime) }} / 終了: {{ getTime(task_.endTime)}}</span>
                  <span v-if="multiLine === true" class="body-2">実績: {{ task_.actualTime }}分 / 見積: {{ task_.estimateTime }}分</span>
                  <span v-if="multiLine === true" class="body-2">予定時間帯: {{ getTime(task_.date) }}〜</span>
                </v-layout>
              </v-card-actions>
            </v-flex>
            <!-- spacer -->
            <v-flex>
              <v-spacer></v-spacer>
            </v-flex>
            <!-- icon -->
            <v-flex xs2 sm4 md3 lg2 xl2>
              <v-layout row wrap>
                <v-flex xs6 sm2 md2 lg3 xl3>
                  <v-menu
                    :close-on-content-click="true"
                    v-model="displayedTaskCal"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on }">
                      <v-btn
                        v-on="on"
                        icon
                        ripple
                        @click.stop="displayedTaskCal = !displayedTaskCal"
                      >
                        <v-icon color="accent">calendar_today</v-icon>
                      </v-btn>
                    </template>
                    <v-date-picker
                      v-model="targetDate"
                      @input="selectDate()"
                      locale="jp"
                      :day-format="date => new Date(date).getDate()"
                    ></v-date-picker>
                  </v-menu>
                </v-flex>
                <v-flex xs6 sm2 md2 lg3 xl3>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on" icon ripple @click.stop="copyTask(task_)">
                        <v-icon color="accent">file_copy</v-icon>
                      </v-btn>
                    </template>
                    <span>タスクを複写</span>
                  </v-tooltip>
                </v-flex>
                <v-flex xs6 sm2 md2 lg3 xl3>
                  <v-btn icon ripple @click.stop="editingRepeat_=!editingRepeat_">
                    <v-icon v-if="task_.repeatId===''" color="deactive">repeat</v-icon>
                    <v-icon v-if="task_.repeatId!==''" color="accent">repeat</v-icon>
                  </v-btn>
                </v-flex>
                <v-flex xs6 sm2 md2 lg3 xl3>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn v-on="on" icon ripple @click.stop="deleteTask(task_)">
                        <v-icon color="accent">delete</v-icon>
                      </v-btn>
                    </template>
                    <span>タスクを削除</span>
                  </v-tooltip>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout align-center row v-if="isEdit_">
      <TaskEdit
        v-bind:task_="task_"
        v-on:endEditEvent="endEditEvent"
        v-on:start-edit-task-name-event="startEditTaskName"
        v-on:end-edit-task-name-event="endEditTaskName"
      ></TaskEdit>
    </v-layout>
    <v-layout align-center row v-if="editingRepeat_">
      <RepeatEdit
        v-bind:task_="task_"
        v-on:endRepeatEditEvent="endRepeatEditEvent"
        v-on:start-edit-task-name-event="startEditTaskName"
        v-on:end-edit-task-name-event="endEditTaskName"
      ></RepeatEdit>
    </v-layout>
    <v-dialog v-model="noteDialog_" max-width="500px">
      <TaskNote
        v-bind:task_="task_"
        v-on:endEditEvent="endEditEvent"
        v-on:start-edit-task-name-event="startEditTaskName"
        v-on:end-edit-task-name-event="endEditTaskName"
        v-on:close-dialog-event="noteDialog_=false"
      ></TaskNote>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.done {
  text-decoration: line-through;
  color: #aaaaaa;
}
</style>

<script lang='ts'>
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import NewTask from '@/components/NewTask.vue'
import TaskEdit from '@/components/TaskEdit.vue'
import RepeatEdit from '@/components/RepeatEdit.vue'
import TaskNote from '@/components/TaskNote.vue'
import DateUtil from '../util/DateUtil'
import Task from '../lib/Task'

@Component({
  components: {
    NewTask,
    TaskEdit,
    RepeatEdit,
    TaskNote,
  },
})
export default class TaskRow extends Vue {
  get displayedTaskCal(): boolean {
    return this.displayedTaskCal_
  }
  set displayedTaskCal(value: boolean) {
    this.displayedTaskCal_ = value
  }
  get targetDate(): string {
    return this.task_.date.toISOString().substr(0, 10)
  }

  set targetDate(value: string) {
    this.task_.date = new Date(value)
  }

  @Prop() public task_!: Task
  @Prop() public index_!: number

  private isEdit_: boolean = false
  private editingRepeat_: boolean = false

  private displayedTaskCal_: boolean = false

  private targetDate_: Date = new Date()

  private noteDialog_: boolean = false

  @Emit('clickStartButtomEvent')
  // tslint:disable-next-line:no-empty
  public startTask(task: Task): void {
    task.isProcessing = true
  }

  @Emit('clickStopButtomEvent')
  // tslint:disable-next-line:no-empty
  public stopTask(task: Task): void {
    task.isProcessing = true
  }

  @Emit('clickDeleteButtomEvent')
  // tslint:disable-next-line:no-empty
  public deleteTask(task: Task): void {}

  @Emit('clickCopyButtomEvent')
  // tslint:disable-next-line:no-empty
  public copyTask(task: Task): void {}

  @Emit('endEditEvent')
  // tslint:disable-next-line:no-empty
  public endEdit(task: Task, index: number): void {}

  @Emit('changeTaskDateChangeEvent')
  // tslint:disable-next-line:no-empty
  public changeDate(task: Task): void {}

  @Emit('start-edit-task-name-event')
  // tslint:disable-next-line:no-empty
  public startEditTaskNameEvent(): void {}

  @Emit('end-edit-task-name-event')
  // tslint:disable-next-line:no-empty
  public endEditTaskNameEvent(): void {}

  public getTime(time: Date): string {
    let timeStr: string = ''
    if (time != undefined) {
      timeStr = DateUtil.getTimeString(time)
    }
    return timeStr
  }

  public startEdit(): void {
    this.isEdit_ = true
  }

  public endEditEvent(task: Task) {
    this.isEdit_ = false
    this.endEdit(task, this.index_)
  }

  public endRepeatEditEvent(task: Task) {
    this.editingRepeat_ = false
    this.endEdit(task, this.index_)
  }

  public startEditTaskName() {
    this.startEditTaskNameEvent()
  }

  public endEditTaskName() {
    this.endEditTaskNameEvent()
  }

  /**
   * タスクの日付を変更
   */
  public selectDate(): void {
    this.displayedTaskCal = false
    this.changeDate(this.task_)
  }

  get topRowLayoutAttributes(): {} {
    // 画面サイズによって入力ボックスを横に並べるか縦に並べるか切り替える
    switch (this.$vuetify.breakpoint.name) {
      case 'xs':
        return { column: true }
      case 'sm':
        return { column: true }
      case 'md':
        return { row: true }
      case 'lg':
        return { row: true }
      case 'xl':
        return { row: true }
      default:
        return { row: true }
    }
  }

  private get multiLine(): boolean {
    // 画面サイズによってツールバーとのマージンを変更
    switch (this.$vuetify.breakpoint.name) {
        case 'xs': return true
        case 'sm': return false
        case 'md': return false
        case 'lg': return false
        case 'xl': return false
        default  : return false
    }
  }

  get rowColor(): {} {
    if (this.task_.estimateSeparateStart === true) {
      return { color: 'secondary lighten-1' }
    } else if (this.task_.estimateSeparateEnd === true) {
      return { color: 'secondary' }
    } else {
      return { color: 'white' }
    }
  }
}
</script>
