<template>
  <div id="main">
    <div class="tasklist-fixed-header">
      <Header></Header>
      <div id="day-and-estimate">
        <v-layout v-bind="topRowLayoutAttributes" fill-height>
          <v-flex>
            <v-card class="elevation-5">
              <v-menu
                :close-on-content-click="false"
                v-model="menu2"
                :nudge-right="40"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                min-width="290px"
              >
                <v-text-field
                  slot="activator"
                  v-model="targetDate"
                  label="日付を選択してください"
                  prepend-icon="event"
                  readonly
                ></v-text-field>
                <v-date-picker
                  v-model="targetDate"
                  @input="menu2 = false"
                  locale="jp"
                  :day-format="date => new Date(date).getDate()"
                ></v-date-picker>
              </v-menu>
            </v-card>
          </v-flex>
          <v-flex>
            <EstimateList></EstimateList>
          </v-flex>
        </v-layout>
      </div>
    </div>
    <v-btn fab dark color="red" fixed floating bottom right @click="addTask()">
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-icon dark v-on="on">add</v-icon>
        </template>
        <span>Aキーでもタスク追加できます</span>
      </v-tooltip>
    </v-btn>
    <div id="list" v-bind="listClass">
      <v-slide-y-transition class="py-0" group tag="v-list">
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
    <div>
      <Footer></Footer>
    </div>
  </div>
</template>

<style>
.tasklist-fixed-header {
  position: fixed;
  width: 100%;
  z-index: 100;
}
.tasklist-listSp {
  padding-top: 210px;
}
.tasklist-listPc {
  padding-top: 150px;
}
</style>

<script lang='ts'>
import { Component, Vue, Watch } from 'vue-property-decorator';
import firebase, { firestore } from 'firebase';
import NewTask from '@/components/NewTask.vue';
import TaskRow from '@/components/TaskRow.vue';
import EstimateList from '@/components/EstimateList.vue';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import DateUtil from '@/util/DateUtil';
import FirestoreUtil from '@/util/FirestoreUtil';
import uuid from 'uuid';
import Task from '@/lib/Task';
import TaskController from '@/lib/TaskController';
import Repeat from '@/lib/Repeat';
import RepeatCreator from '@/lib/RepeatCreator';
import Migration from '@/util/Migration';
import SectionConnector from '@/lib/SectionConnector';

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
  get tasks(): Task[] {
    return this.$store.getters['taskList/taskCtrl'].tasks;
  }

  set tasks(value: Task[]) {
    const tc: TaskController = new TaskController();
    tc.tasks = value;
    this.$store.commit('taskList/setTaskCtrl', tc);
  }

  get targetDate(): string {
    return DateUtil.getDateString(this.$store.getters['taskList/targetDate']);
  }

  set targetDate(value: string) {
    this.$store.commit('taskList/setTargetDate', new Date(value));
  }

  get menu2(): boolean {
    return this.menu2_;
  }

  set menu2(value: boolean) {
    this.menu2_ = value;
  }

  get topRowLayoutAttributes(): {} {
    // 画面サイズによって入力ボックスを横に並べるか縦に並べるか切り替える
    switch (this.$vuetify.breakpoint.name) {
      case 'xs':
        return { column: true };
      case 'sm':
        return { column: true };
      case 'md':
        return { row: true };
      case 'lg':
        return { row: true };
      case 'xl':
        return { row: true };
      default:
        return { row: true };
    }
  }

  get listClass(): {} {
    // 画面サイズによってツールバーとのマージンを変更
    switch (this.$vuetify.breakpoint.name) {
        case 'xs': return {class: 'tasklist-listSp'};
        case 'sm': return {class: 'tasklist-listSp'};
        case 'md': return {class: 'tasklist-listPc'};
        case 'lg': return {class: 'tasklist-listPc'};
        case 'xl': return {class: 'tasklist-listPc'};
        default  : return {class: 'tasklist-listPc'};
    }
  }

  private addingTask_: boolean = false;
  private menu2_: boolean = false;

  // 日付を変更したのを監視してタスクを読み込み直し
  @Watch('targetDate')
  private onValueChange(newValue: string, oldValue: string): void {
    this.loadTasks();
  }

  private async loadTasks(): Promise<void> {
    const self: TaskListMain = this;

    // 当日分のリピートタスクを作る
    const rc: RepeatCreator = new RepeatCreator(
      this.$store.getters['taskList/user'].uid,
      this.$store.getters['taskList/targetDate'],
    );
    await rc.creaetRepeat(1);
    // 今日のデータを読み込み(同期的に)
    const tc: TaskController = await FirestoreUtil.loadTasks(
      self.$store.getters['taskList/user'].uid,
      self.$store.getters['taskList/targetDate'],
    );
    tc.sort();
    self.$store.commit('taskList/setTaskCtrl', tc);

    this.reCreateRepeatTask();
  }

  private async reCreateRepeatTask(): Promise<void> {
    // 非同期で明日以降1週間分のデータを作る
    const d = new Date(this.$store.getters['taskList/targetDate']);
    d.setDate(d.getDate() + 1);
    const rc2: RepeatCreator = new RepeatCreator(
      this.$store.getters['taskList/user'].uid,
      d,
    );
    try {
      rc2.creaetRepeat(6);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(`repeate task create error! `, e);
    }
  }

  private deleteTask(task: Task): void {
    this.$store.commit('taskList/deleteTask', task);
    FirestoreUtil.logicalDeleteTask(
      this.$store.getters['taskList/user'].uid,
      task,
    );
  }

  private copyTask(task: Task): void {
    const newTask: Task = task.createPauseTask();
    newTask.startTime = undefined;
    newTask.endTime = undefined;
    this.$store.commit('taskList/addTask', newTask);
    this.$store.commit('taskList/sortTask');
    this.save();
  }

  private startTask(task: Task): void {
    // 開始しているタスクがあれば中断処理する
    for (const otherTask of this.tasks) {
      if (otherTask.isDoing === true) {
        this.tasks.push(otherTask.createPauseTask());
        otherTask.title = otherTask.title + '(中断)';
        this.changeStopTask(otherTask);
      }
    }

    // 既に終了しているタスクであればコピーしてタスクを開始する
    if (task.endTime != undefined) {
      const newTask: Task = task.createPauseTask();
      newTask.isDoing = true;
      newTask.startTime = new Date();
      newTask.endTime = undefined;
      this.$store.commit('taskList/addTask', newTask);
    } else {
      task.needSave = true;
      task.isDoing = true;
      task.startTime = new Date();
    }

    this.$store.commit('taskList/sortTask');

    this.save();
  }

  private save(): void {
    FirestoreUtil.saveTasks(
      this.$store.getters['taskList/user'].uid,
      this.$store.getters['taskList/taskCtrl'],
    );
  }

  private startEditTaskName() {
    this.deleteShortcut();
  }
  private endEditTaskName() {
    this.entryShortcut();
  }
  private endEditTask(task: Task, index: number) {
    this.$set(this.tasks, index, task);
    this.$store.getters['taskList/taskCtrl'].sort();
    // needSaveフラグは子コンポーネントで保存したときのみ設定しているのでここでは設定しない
    this.save();
    this.reCreateRepeatTask();
  }

  private addTask(): void {
    this.addingTask_ = true;
    this.$nextTick(() => {
      this.$vuetify.goTo('#newtask', {
        duration: 350,
        easing: 'easeInOutCubic',
      });
    });
  }

  private addedTask(): void {
    this.addingTask_ = false;
  }

  private changeTaskDate(task: Task): void {
    // 編集中の日付と同じならば何もしない
    if (DateUtil.getDateString(task.date) === this.targetDate) {
      return;
    }

    // 変更先の日付のdocを取ってくる
    FirestoreUtil.loadTasks(
      this.$store.getters['taskList/user'].uid,
      task.date,
    ).then((tc: TaskController) => {
      // タスクを追加してsave
      task.needSave = true;
      tc.tasks.push(task);
      FirestoreUtil.saveTasks(this.$store.getters['taskList/user'].uid, tc);

      // 今開いている日付のdocから削除
      this.$store.commit('taskList/deleteTask', task);
    });
  }

  /**
   * 日付を一日進める
   */
  private forwardTargetDate(): void {
    const d = new Date(this.$store.getters['taskList/targetDate']);
    d.setDate(d.getDate() + 1);
    this.targetDate = d.toString();
  }

  /**
   * 日付を一日戻す
   */
  private returnTargetDate(): void {
    const d = new Date(this.$store.getters['taskList/targetDate']);
    d.setDate(d.getDate() - 1);
    this.targetDate = d.toString();
  }

  private stopTask(task: Task): void {
    this.changeStopTask(task);
    this.save();
  }

  /**
   * タスクの状態を停止状態に変える(保存はしない)
   */
  private changeStopTask(task: Task): void {
    task.needSave = true;
    task.isDoing = false;
    task.endTime = new Date();
  }

  private created(): void {
    this.initialLoad();
  }

  private initialLoad() {
    firebase.auth().onAuthStateChanged(async (user: firebase.User | null) => {
      this.$store.commit('taskList/setUser', user);
      await Migration.run(this.$store.getters['taskList/user'].uid);
      // セクション読み込み
      await this.$store.dispatch('section/load');
      // 日付指定
      this.targetDate = DateUtil.calcBaseDate(new Date()).toString();
      this.loadTasks();
    });
  }
  private mounted(): void {
    this.entryShortcut();
  }

  /**
   * ショートカット有効化
   */
  private entryShortcut(): void {
    document.onkeyup = (e: KeyboardEvent) => {
      if (e.key === 'd') {
        this.jumpToNextTask();
      } else if (e.key === 't') {
        this.jumpToTop();
      } else if (e.key === 'a') {
        this.addTask();
      } else if (e.key === 'f') {
        this.forwardTargetDate();
      } else if (e.key === 'r') {
        this.returnTargetDate();
      }
    };
  }

  /**
   * ショートカット無効化
   */
  private deleteShortcut(): void {
    // tslint:disable-next-line:no-empty
    document.onkeyup = (e: KeyboardEvent) => {};
  }

  private beforeDestroy(): void {
    // tslint:disable-next-line:no-null-keyword
    document.onkeydown = null;
  }

  private jumpToNextTask(): void {
    this.$nextTick(() => {
      this.$vuetify.goTo('#next-task', {
        duration: 350,
        easing: 'easeInOutCubic',
        offset: 325,
      });
    });
  }
  private jumpToTop(): void {
    this.$nextTick(() => {
      this.$vuetify.goTo('#header', {
        duration: 350,
        easing: 'easeInOutCubic',
      });
    });
  }
}
</script>

