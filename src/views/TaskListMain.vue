<template>
  <div id="main">
    <Header></Header>
    <div>
    <v-layout v-bind="topRowLayoutAttributes" fill-height>
      <v-flex>
        <v-card>
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
          <v-date-picker v-model="targetDate" @input="menu2 = false" locale="jp" :day-format="date => new Date(date).getDate()"></v-date-picker>
          </v-menu>
        </v-card>
      </v-flex>
      <v-flex>
        <EstimateList></EstimateList>
      </v-flex>
    </v-layout>
    <v-btn fab dark color="red" fixed floating bottom right @click="addTask()">
      <v-icon dark>add</v-icon>
    </v-btn>
      <v-slide-y-transition
        class="py-0"
        group
        tag="v-list"
      >
        <TaskRow
          v-for="(task, index) in tasks"
          :key="task.id"
          :task_="task"
          :index_="index"
          v-on:clickStartButtomEvent="startTask"
          v-on:clickStopButtomEvent="stopTask"
          v-on:endEditEvent="endEditTask"
          v-on:clickDeleteButtomEvent="deleteTask"
          v-on:changeTaskDateChangeEvent="changeTaskDate"
        >
        </TaskRow>
      </v-slide-y-transition>
      <NewTask v-if="addingTask_" v-on:addedEvent="addedTask"></NewTask>
    </div>
    <div>
      <Footer></Footer>
    </div>
  </div>
</template>

<style>
.done {
  text-decoration: line-through;
}
</style>

<script lang="ts">
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
      case 'xs': return {column: true};
      case 'sm': return {column: true};
      case 'md': return {row: true};
      case 'lg': return {row: true};
      case 'xl': return {row: true};
      default  : return {row: true};
    }
  }

  private addingTask_: boolean = false;
  private menu2_: boolean = false;

  // 日付を変更したのを監視してタスクを読み込み直し
  @Watch('targetDate')
  private onValueChange(newValue: string, oldValue: string): void {
    this.loadTasks();
  }

  private loadTasks(): void {

    const self: TaskListMain = this;

    // セクションを読み込み
    const sc: SectionConnector = new SectionConnector()
    sc.load(this.$store.getters['taskList/user'].uid)


    // 当日分のリピートタスクを作る
    const rc: RepeatCreator =
      new RepeatCreator(this.$store.getters['taskList/user'].uid, this.$store.getters['taskList/targetDate']);
    rc.creaetRepeat(1)
    .then((): void => {
        // 今日のデータを読み込み(同期的に)
        FirestoreUtil.loadTasks(self.$store.getters['taskList/user'].uid, self.$store.getters['taskList/targetDate'])
        .then((tc: TaskController): void => {
            tc.sort();
            self.$store.commit('taskList/setTaskCtrl', tc);
            },
        );
    });

    this.recreateRepeatTask();
  }

  private async recreateRepeatTask(): Promise<void> {
    // 非同期で明日以降1週間分のデータを作る
    const d = new Date(this.$store.getters['taskList/targetDate']);
    d.setDate(d.getDate() + 1);
    const rc2: RepeatCreator = new RepeatCreator(this.$store.getters['taskList/user'].uid, d);
    rc2.creaetRepeat(6)
    .catch((e): void => {
        // tslint:disable-next-line:no-console
        console.error(`repeate task create error! `, e);
    });

  }

  private deleteTask(task: Task): void {
    this.$store.commit('taskList/deleteTask', task);
    FirestoreUtil.logicalDeleteTask(this.$store.getters['taskList/user'].uid, task);
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
    FirestoreUtil.saveTasks(this.$store.getters['taskList/user'].uid, this.$store.getters['taskList/taskCtrl']);
  }

  private endEditTask(task: Task, index: number) {
    this.$set(this.tasks, index, task);
    this.$store.getters['taskList/taskCtrl'].sort();
    // needSaveフラグは子コンポーネントで設定しているのでここでは設定しない
    this.save();
    this.recreateRepeatTask();
  }

  private addTask(): void {
    this.addingTask_ = true;
    this.$nextTick(() => {
      this.$vuetify.goTo('#newtask', {duration: 350, easing: 'easeInOutCubic'});
    });
  }

  private addedTask(): void {
    this.addingTask_ = false;
  }

  private changeTaskDate(task: Task): void {

    // 編集中の日付と同じならば何もしない
    if (DateUtil.getDateString(task.date) === this.targetDate) { return; }

    // 変更先の日付のdocを取ってくる
    FirestoreUtil.loadTasks(this.$store.getters['taskList/user'].uid, task.date)
    .then((tc) => {
      // タスクを追加してsave
      task.needSave = true;
      tc.tasks.push(task);
      FirestoreUtil.saveTasks(this.$store.getters['taskList/user'].uid, tc);

      // 今開いている日付のdocから削除
      this.$store.commit('taskList/deleteTask', task);

    });
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
    firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
      this.$store.commit('taskList/setUser', user);
      Migration.run(this.$store.getters['taskList/user'].uid)
      .then((): void => {
        this.loadTasks();
      });
    });
  }

  private mounted(): void {
    document.onkeyup = (e: KeyboardEvent) => {
      if (e.key === 'd') {
        this.jumpToNextTask();
      } else if (e.key === 't') {
        this.jumpToTop();
      } else if (e.key === 'a') {
        this.addTask();
      }
    };
  }

  private beforeDestroy(): void {
    // tslint:disable-next-line:no-null-keyword
    document.onkeydown = null;
  }

  private jumpToNextTask(): void {
    this.$nextTick(() => {
      this.$vuetify.goTo('#next-task', {duration: 350, easing: 'easeInOutCubic'});
    });
  }
  private jumpToTop(): void {
    this.$nextTick(() => {
      this.$vuetify.goTo('#header', {duration: 350, easing: 'easeInOutCubic'});
    });
  }
}
</script>
