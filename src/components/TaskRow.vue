<template>
    <v-container grid-list-md text-xs-center pa-2>
        <div id="next-task" v-if="task_.isNext === true"></div>
        <v-layout
        align-center
        row
        v-if="!isEdit_"
        >
            <v-flex>
                <v-card>
                    <v-layout align-center justify-space-between row fill-height>
                        <v-flex xs2 sm2 md1>
                            <v-btn v-bind:id="'start-btn-' + task_.id" icon ripple @click.stop="startTask(task_)" v-if="task_.isDoing === false && task_.endTime==undefined">
                                <v-icon color="purple">play_circle_filled</v-icon>
                            </v-btn>
                            <v-btn icon ripple @click.stop="startTask(task_)" v-else-if="task_.isDoing === false && task_.endTime!=undefined">
                                <v-icon color="grey darken-1">play_circle_filled</v-icon>
                            </v-btn>
                            <v-btn icon ripple @click.stop="stopTask(task_)" v-else-if="task_.isDoing === true">
                                <v-icon color="purple">pause_circle_filled</v-icon>
                            </v-btn>
                        </v-flex>
                        <v-flex nowrap sm5 xs9 md5>
                            <v-card-actions  @click.stop="startEdit()">
                                <div v-bind:class="{ done: task_.endTime!=undefined}" class="font-weight-bold">
                                    {{ task_.title }}
                                </div>
                            </v-card-actions>
                            <v-card-actions @click.stop="startEdit()">
                                <span>開始:{{ getTime(task_.startTime) }} / 終了: {{ getTime(task_.endTime)}} / 実績: {{ task_.actualTime }}分 / 見積: {{ task_.estimateTime }}分 予定時間帯: {{ task_.section }}〜</span>
                            </v-card-actions>
                        </v-flex>
                        <v-spacer></v-spacer>
                        <v-layout v-bind="topRowLayoutAttributes">
                            <v-flex xs4 sm2 md1 class="text-xs-right">
                                <v-menu
                                    :close-on-content-click="true"
                                    v-model="displayedTaskCal"
                                    :nudge-right="40"
                                    lazy
                                    transition="scale-transition"
                                    offset-y
                                    full-width
                                    min-width="290px"
                                >
                                <v-btn slot="activator" icon ripple @click.stop="displayedTaskCal = !displayedTaskCal">
                                    <v-icon color="grey darken-1">calendar_today</v-icon>
                                </v-btn>
                                <v-date-picker v-model="targetDate" @input="selectDate()" locale="jp" :day-format="date => new Date(date).getDate()"></v-date-picker>
                                </v-menu>
                            </v-flex>
                            <v-flex xs4 sm2 md1 class="text-xs-right">
                                <v-btn icon ripple @click.stop="editingRepeat_=!editingRepeat_">
                                    <v-icon v-if="task_.repeatId===''" color="grey darken-1">repeat</v-icon>
                                    <v-icon v-if="task_.repeatId!==''" color="purple">repeat</v-icon>
                                </v-btn>
                            </v-flex>
                            <v-flex xs4 sm2 md1 class="text-xs-right">
                                <v-btn icon ripple @click.stop="deleteTask(task_)">
                                    <v-icon color="grey darken-1">delete</v-icon>
                                </v-btn>
                            </v-flex>
                        </v-layout>
                    </v-layout>
                </v-card>
            </v-flex>
        </v-layout>
        <v-layout
        align-center
        row
        v-if="isEdit_"
        >
            <TaskEdit v-bind:task_="task_" v-on:endEditEvent="endEditEvent"></TaskEdit>
        </v-layout>
        <v-layout
        align-center
        row
        v-if="editingRepeat_"
        >
            <RepeatEdit v-bind:task_="task_" v-on:endRepeatEditEvent="endRepeatEditEvent"></RepeatEdit>
        </v-layout>
    </v-container>
</template>

<style>
.done {
    text-decoration: line-through;
}
</style>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator';
import NewTask from '@/components/NewTask.vue';
import TaskEdit from '@/components/TaskEdit.vue';
import RepeatEdit from '@/components/RepeatEdit.vue';
import DateUtil from '../util/DateUtil';
import Task from '../lib/Task';

@Component({
    components: {
        NewTask,
        TaskEdit,
        RepeatEdit,
    },
})

export default class TaskRow extends Vue {

    get displayedTaskCal(): boolean {
        return this.displayedTaskCal_;
    }
    set displayedTaskCal(value: boolean) {
        this.displayedTaskCal_ = value;
    }
    get targetDate(): string {
        return this.task_.date.toISOString().substr(0, 10);
    }

    set targetDate(value: string) {
        this.task_.date = new Date(value);
    }

    @Prop() public task_!: Task;
    @Prop() public index_!: number;

    private isEdit_: boolean = false;
    private editingRepeat_: boolean = false;

    private displayedTaskCal_: boolean = false;

    private targetDate_: Date = new Date();

    @Emit('clickStartButtomEvent')
    // tslint:disable-next-line:no-empty
    public startTask(task: Task): void {}

    @Emit('clickStopButtomEvent')
    // tslint:disable-next-line:no-empty
    public stopTask(task: Task): void {}

    @Emit('clickDeleteButtomEvent')
    // tslint:disable-next-line:no-empty
    public deleteTask(task: Task): void {}

    @Emit('endEditEvent')
    // tslint:disable-next-line:no-empty
    public endEdit(task: Task, index: number): void {}

    @Emit('changeTaskDateChangeEvent')
    // tslint:disable-next-line:no-empty
    public changeDate(task: Task): void {}

    public getTime(time: Date): string {
        let timeStr: string = '';
        if (time != undefined) {
            timeStr = DateUtil.getTimeString(time);
        }
        return timeStr;
    }

    public startEdit(): void {
        this.isEdit_ = true;
    }

    public endEditEvent(task: Task) {
        this.isEdit_ = false;
        this.endEdit(task, this.index_);
    }

    public endRepeatEditEvent(task: Task) {
        this.editingRepeat_ = false;
        this.endEdit(task, this.index_);
    }

    /**
     * タスクの日付を変更
     */
    public selectDate(): void {
        this.displayedTaskCal = false;
        this.changeDate(this.task_);
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

}
</script>