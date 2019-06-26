<template>
  <Note
    v-bind:note_="note"
    v-on:endEditEvent="endEditEvent"
    v-on:start-edit-task-name-event="startEditTaskName"
    v-on:end-edit-task-name-event="endEditTaskName"
    v-on:close-dialog-event="closeDialog"
  ></Note>
</template>

<style>
.wrap {
  white-space: pre-line;
}</style>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import Task from '@/lib/Task'
import Note from '@/components/Note.vue'

@Component({
  components: {
    Note,
  },
})
export default class TaskNote extends Vue {

  @Prop() public task_!: Task

  private get note(): string {
    const text = this.task_.note
    return text
  }

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

  private endEditEvent(note: string) {
    this.task_.note = note
    this.endEdit(this.task_)
  }
}
</script>
