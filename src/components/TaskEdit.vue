<template>
    <div id="task-edit">
        <v-card>
            <v-layout v-bind="layoutAttributes" fill-height align-center justify-center ma-1>
                <v-flex ma-1>
                    <span>タスク名</span>
                    <v-text-field placeholder="タスク名" single-line outline v-model="editTask_.title" clearable  @keyup.enter="save" @keypress="setCanSubmit"></v-text-field>
                </v-flex>
                <v-flex ma-1>
                    <span>開始時間</span>
                    <v-text-field type="number" placeholder="開始時間" single-line outline mask="####" hint="数字3または4桁。9時20分は「920」と入力" v-model="startTime_" clearable @keyup.enter="save"></v-text-field>
                </v-flex>
                <v-flex ma-1>
                    <span>終了時間</span>
                    <v-text-field type="number" placeholder="終了時間" single-line outline mask="####" hint="数字3または4桁。9時20分は「920」と入力" v-model="endTime_" clearable  @keyup.enter="save"></v-text-field>
                </v-flex>
                <v-flex ma-1>
                    <span>見積時間(分)</span>
                    <v-text-field type="number" placeholder="見積時間(分)" single-line outline mask="#####" hint="見積時間(分)を入力" v-model="estimateTime_" clearable @keyup.enter="save"> </v-text-field>
                </v-flex>
            </v-layout>
            <v-layout row fill-height align-center justify-center>
                <v-flex>
                    <v-btn @click.stop="save">保存</v-btn>
                </v-flex>
                <v-flex>
                    <v-btn @click.stop="cancel">キャンセル</v-btn>
                </v-flex>
            </v-layout>
        </v-card>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import Task from '../lib/Task';
import TaskController from '../lib/TaskController';
import Util from '../util/Util';
import DateUtil from '../util/DateUtil';

@Component
export default class TaskEdit extends Vue {

    public canSubmit_: boolean = false;
    public menu_: boolean = false;
    public startTime_: string = '';
    public endTime_: string = '';
    public estimateTime_: string = '';
    public backupedTask_!: Task;
    public editTask_!: Task;

    // !はundefinedやnullにならないことを示すもの
    @Prop() public task_!: Task;

    @Emit('endEditEvent')
    // tslint:disable-next-line:no-empty
    public endEdit(task: Task): void {}


    public save(): void {
        if (this.startTime_.trim() !== '' ) {
            this.editTask_.startTime = DateUtil.getDateObject(this.task_.date, this.startTime_);

            if (this.endTime_.trim() !== '') {
                this.editTask_.endTime = DateUtil.getDateObject(this.task_.date, this.endTime_);
                // 終了時間が入っていたら停止する
                this.editTask_.isDoing = false;
            } else {
                this.editTask_.endTime = null;
                // 開始時間入っていて終了が入っていなければタスクを開始状態にする
                this.editTask_.isDoing = true;
            }
        } else {
            this.editTask_.startTime = null;
            // 開始が入ってなければ終了時間も空にする
            this.editTask_.endTime = null;
            this.editTask_.isDoing = false;
        }

        if (Util.isNumber(this.estimateTime_)) {
            this.editTask_.estimateTime = Number(this.estimateTime_);
        } else {
            this.editTask_.estimateTime = 0;
        }

        // 編集終了イベント発生
        this.endEdit(this.editTask_);
    }

    public cancel(): void {
        this.editTask_ = this.backupedTask_;
        this.endEdit(this.backupedTask_);
    }

    public setCanSubmit(): void {
        this.canSubmit_ = true;
    }

    public created(): void {
        console.log('created!');
        // 編集前の値を待避
        this.backupedTask_ = this.task_.copy();
        // 編集用オブジェクト作成
        this.editTask_ = this.task_.copy();

        if (this.task_.startTime != null) {
            this.startTime_ = DateUtil.get4digitTime(this.task_.startTime);
        }
        if (this.task_.endTime != null) {
            this.endTime_ = DateUtil.get4digitTime(this.task_.endTime);
        }

        if (this.task_.estimateTime != null) {
            this.estimateTime_ = this.task_.estimateTime.toString();
        }

    }

    // 算出プロパティーでオブジェクトを返すと属性を展開してくれる
    get layoutAttributes(): {} {
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

<style>
</style>


