<template>
    <div id="newtask">
        <v-card>
            <v-layout row fill-height align-center justify-center>
                <v-flex mt-4 ml-2>
                    <v-text-field placeholder="新しいタスクを追加" single-line outline v-model="inputvalue_" autofocus clearable hint="記載したらEnterか追加ボタン" @keydown="keyDown($event)" @keyup.enter="keyUpEnter()" @keyup.esc="cancel"></v-text-field>
                </v-flex>
                <v-flex ma-2>
                    <v-btn @click="addTask">追加</v-btn>
                    <v-btn @click="cancel">キャンセル</v-btn>
                </v-flex>
            </v-layout>
        </v-card>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator';
import firebase, { firestore } from 'firebase';
import uuid from 'uuid';
import fb from '../util/FirebaseUtil';
import ITask from '../lib/ITask';
import Task from '../lib/Task';

@Component
export default class NewTask extends Vue {

    public inputvalue_: string = '';

    private keyDownCode_: number = 0;

    @Emit('addedEvent')
    // tslint:disable-next-line:no-empty
    public addEnd(): void {}


    public addTask(): void {
        if (this.inputvalue_.trim() === '') { return; }

        // ここがタスクの追加部分
        const d: Date = this.$store.getters.targetDate;
        // 一旦時間は0:00でセット。セクションを取り入れるときはここの時間をセクションの時間に変更する
        const date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        const task: Task = new Task(date, this.inputvalue_);
        this.$store.commit('addTask', task);

        fb.saveTasks(this.$store.getters.user.uid, this.$store.getters.taskCtrl);

        this.inputvalue_ = '';

        // イベント発生
        this.addEnd();

    }

    public cancel(): void {
        // イベント発生
        this.addEnd();
    }

    private keyDown(event: KeyboardEvent): void {
        this.keyDownCode_ = event.keyCode;
    }

    /**
     * 日本語入力確定のEnterキーで以外で先に進むようにする
     */
    private keyUpEnter(): void {
        if (this.keyDownCode_ === 13) {
            this.addTask();
            this.keyDownCode_ = 0;
        }
    }
}
</script>

<style>
</style>


