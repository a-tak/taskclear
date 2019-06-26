<template>
  <v-card>
    <v-card-title class="title teal lighten-3 white--text">メモ</v-card-title>
    <v-layout v-if="!isEdit_">
      <v-card-text>
        <div class="wrap body-1 text-xs-left">
          {{ note }}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn icon @click="isEdit_=true"><v-icon color="purple">edit</v-icon></v-btn>
        <v-btn icon @click="closeDialog()" ><v-icon color="purple">close</v-icon></v-btn>
      </v-card-actions>
    </v-layout>
    <v-layout v-if="isEdit_" ma-3>
      <v-textarea
        v-model="editTask_.note"
        @focus="startEditTaskName()"
        @blur="endEditTaskName()"
        ></v-textarea>
      <v-card-actions>
        <v-btn icon @click="save()"><v-icon color="purple">check</v-icon></v-btn>
        <v-btn icon @click="cancel()"><v-icon color="purple">cancel</v-icon></v-btn>
      </v-card-actions>
    </v-layout>
  </v-card>
</template>

<style>
.wrap {
  white-space: pre-line;
}</style>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import Task from '../lib/Task'
import { privateDecrypt } from 'crypto';

@Component
export default class Note extends Vue {

  @Prop() public task_!: Task;

  private get note(): string {
    const text = this.editTask_.note
    return text
  }

  private isEdit_: boolean = false
  private editTask_!: Task

  @Emit('endEditEvent')
  // tslint:disable-next-line:no-empty
  private endEdit(task: Task): void {}

  @Emit('start-edit-task-name-event')
  // tslint:disable-next-line:no-empty
  private startEditTaskName(): void {}

  @Emit('end-edit-task-name-event')
  // tslint:disable-next-line:no-empty
  private endEditTaskName(): void {}

  @Emit('close-dialog-event')
  // tslint:disable-next-line:no-empty
  private closeDialog(): void {}

  private created(): void {
    // 編集用オブジェクト作成
    this.editTask_ = this.task_.clone()
  }

  private save(): void {
    this.editTask_.needSave = true
    // 編集終了イベント発生
    this.endEdit(this.editTask_)
    // 次の編集に備える
    this.isEdit_ = false
    this.editTask_.needSave = false
  }

  private cancel(): void {
    // 元に戻す
    this.editTask_ = this.task_.clone()
    this.isEdit_ = false
  }
}
</script>
