<template>
  <v-layout>
    <v-flex>
      <v-card>
        <v-card-title class="titlewhite--text primary">メモ</v-card-title>
        <v-layout ma-3>
          <v-flex>
            <v-textarea
              label="メモ"
              v-model="editNote_"
              @focus="startEditTaskName()"
              @blur="endEditTaskName()"
              v-on:keyup.enter.ctrl="save()"
              v-on:keyup.esc="cancel()"
              outline
              autofocus
              hint="control + enterで保存"
              ></v-textarea>
            <v-card-actions>
              <v-btn icon @click="save()"><v-icon color="accent">check</v-icon></v-btn>
              <v-btn icon @click="cancel()"><v-icon color="accent">cancel</v-icon></v-btn>
            </v-card-actions>
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<style scoped>
.wrap {
  white-space: pre-line;
}</style>

<script lang="ts">
import { Component, Vue, Prop, Emit } from "vue-property-decorator"

@Component
export default class Note extends Vue {

  @Prop() public note_!: string

  private get note(): string {
    const text = this.note_
    return text
  }

  private editNote_: string = ""

  @Emit("endEditEvent")
  // tslint:disable-next-line:no-empty
  private endEdit(note: string): void {}

  @Emit("start-edit-task-name-event")
  // tslint:disable-next-line:no-empty
  private startEditTaskName(): void {}

  @Emit("end-edit-task-name-event")
  // tslint:disable-next-line:no-empty
  private endEditTaskName(): void {}

  @Emit("close-dialog-event")
  // tslint:disable-next-line:no-empty
  private closeDialog(): void {}

  private created(): void {
    // 編集用オブジェクト作成
    this.editNote_ = this.note_
  }

  private save(): void {
    // 編集終了イベント発生
    this.endEdit(this.editNote_)
    this.endEditTaskName()
    this.closeDialog()
  }

  private cancel(): void {
    // 元に戻す
    this.editNote_ = this.note_
    this.closeDialog()
  }
}
</script>
