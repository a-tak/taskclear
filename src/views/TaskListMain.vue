<template>
    <div id="top">
        <v-toolbar
        color="teal lighten-3"
        >
        <v-toolbar-side-icon></v-toolbar-side-icon>

        <v-toolbar-title>TaskClear</v-toolbar-title>

        <v-btn @click="logout">ログアウト</v-btn>
        <v-spacer></v-spacer>
        <v-btn icon>
            <v-icon>more_vert</v-icon>
        </v-btn>

        </v-toolbar>
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
            <v-footer
                color="teal lighten-3"
                height="auto"
                class="mt-2"
            >
                <v-card
                    flat
                    tile
                    color="teal lighten-3"
                >
                    <v-card-text>
                        &copy;2019 a-tak.com  ver. {{ version_ }}
                    </v-card-text>
                </v-card>
            </v-footer> 
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
import DateUtil from '../util/DateUtil';
import fb from '../util/FirebaseUtil';
import uuid from 'uuid';
import Task from '../lib/Task';
import TaskController from '../lib/TaskController';
import FirebaseUtil from '../util/FirebaseUtil';
import Repeat from '../lib/Repeat';
import RepeatCreator from '../lib/RepeatCreator';
import Migration from '../util/Migration';
import packageJson from '../../package.json';

@Component({
components: {
    NewTask,
    TaskRow,
    EstimateList,
},
})

export default class TaskListMain extends Vue {

    get tasks(): Task[] {
        return this.$store.getters.taskCtrl.tasks;
    }

    set tasks(value: Task[]) {
        const tc: TaskController = new TaskController();
        tc.tasks = value;
        this.$store.commit('setTaskCtrl', tc);
    }

    get targetDate(): string {
        return DateUtil.getDateString(this.$store.getters.targetDate);
    }

    set targetDate(value: string) {
        this.$store.commit('setTargetDate', new Date(value));
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
    private version_: string = '';

    // 日付を変更したのを監視してタスクを読み込み直し
    @Watch('targetDate')
    private onValueChange(newValue: string, oldValue: string): void {
        this.loadTasks();
    }

    private loadTasks(): void {

        const self: TaskListMain = this;

        // 当日分のリピートタスクを作る
        const rc: RepeatCreator = new RepeatCreator(this.$store.getters.user.uid, this.$store.getters.targetDate);
        rc.creaetRepeat(1)
        .then((): void => {
            // 今日のデータを読み込み(同期的に)
            fb.loadTasks(self.$store.getters.user.uid, self.$store.getters.targetDate)
            .then((tc: TaskController): void => {
                tc.sort();
                self.$store.commit('setTaskCtrl', tc);
                },
            );
        });

        this.recreateRepeatTask();
    }

    private async recreateRepeatTask(): Promise<void> {
        // 非同期で明日以降1週間分のデータを作る
        const d = new Date(this.$store.getters.targetDate);
        d.setDate(d.getDate() + 1);
        const rc2: RepeatCreator = new RepeatCreator(this.$store.getters.user.uid, d);
        rc2.creaetRepeat(6)
        .catch((e): void => {
            // tslint:disable-next-line:no-console
            console.error(`repeate task create error! `, e);
        });

    }

    private deleteTask(task: Task): void {
        this.$store.commit('deleteTask', task);
        FirebaseUtil.logicalDeleteTask(this.$store.getters.user.uid, task);
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
        if (task.endTime != null) {
            const newTask: Task = task.createPauseTask();
            newTask.isDoing = true;
            newTask.startTime = new Date();
            newTask.endTime = null;
            this.$store.commit('addTask', newTask);
        } else {
            task.needSave = true;
            task.isDoing = true;
            task.startTime = new Date();
        }

        this.$store.commit('sortTask');

        this.save();
    }

    private save(): void {
        fb.saveTasks(this.$store.getters.user.uid, this.$store.getters.taskCtrl);
    }

    private endEditTask(task: Task, index: number) {
        this.$set(this.tasks, index, task);
        this.$store.getters.taskCtrl.sort();
        // needSaveフラグは子コンポーネントで設定しているのでここでは設定しない
        this.save();
        this.recreateRepeatTask();

    }

    private logout(): void {
        firebase.auth().signOut().then(() => {
            this.$router.push('/login');
        });
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
        fb.loadTasks(this.$store.getters.user.uid, task.date)
        .then((tc) => {
            // タスクを追加してsave
            task.needSave = true;
            tc.tasks.push(task);
            fb.saveTasks(this.$store.getters.user.uid, tc);

            // 今開いている日付のdocから削除
            this.$store.commit('deleteTask', task);

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
        this.version_ = packageJson.version;
        Migration.run(this.$store.getters.user.uid)
        .then((): void => {
            this.loadTasks();
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
        document.onkeydown = null;
    }

    private jumpToNextTask(): void {
        this.$nextTick(() => {
            this.$vuetify.goTo('#next-task', {duration: 350, easing: 'easeInOutCubic'});
        });
    }
    private jumpToTop(): void {
        this.$nextTick(() => {
            this.$vuetify.goTo('#top', {duration: 350, easing: 'easeInOutCubic'});
        });
    }
}
</script>
