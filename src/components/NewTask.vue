<template>
    <div id="newtask">
      <v-card>
        <v-layout row fill-height align-center justify-center>
            <v-flex mt-4 ml-2>
                <v-text-field placeholder="新しいタスクを追加" single-line outline v-model="inputvalue_" autofocus clearable hint="記載したらEnterか追加ボタン" @keyup.enter="addTask" @keypress="setCanSubmit"></v-text-field>
            </v-flex>
            <v-flex ma-2>
                <v-btn @click="addTask">追加</v-btn>
            </v-flex>
        </v-layout>
      </v-card>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator';
import firebase,{ firestore } from 'firebase';
import uuid from 'uuid';
import fb from '../util/FirebaseUtil';
import ITask from '../ITask';
import Task from '../lib/Task';

@Component
export default class NewTask extends Vue {

  @Emit('addedEvent')
  addEnd(): void {}

  inputvalue_: string = "";
  canSubmit_: boolean = false;

  setCanSubmit() {
    this.canSubmit_ = true;
  }

  addTask() : void {
    console.log("addtask cansubmit=" + this.canSubmit_);
    if (this.inputvalue_.trim()=="" || this.canSubmit_ == false) return;

    //ここがタスクの追加部分
    const d: Date = this.$store.getters.targetDate;
    // 一旦時間は0:00でセット。セクションを取り入れるときはここの時間をセクションの時間に変更する
    const date = new Date(d.getFullYear(),d.getMonth(),d.getDate(),0,0,0,0);
    let task:Task = new Task(date,this.inputvalue_);
    this.$store.commit("addTask",task);

    fb.saveTasks(this.$store.getters.user.uid, this.$store.getters.targetDate,this.$store.getters.taskCtrl);

    this.inputvalue_ = "";
    this.canSubmit_ = false;

    //イベント発生
    this.addEnd();

  }


};
</script>

<style>
</style>


