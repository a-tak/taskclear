<template>
  <v-card>
    <v-card-title class="title teal lighten-3 white--text">メモ</v-card-title>
    <v-card-text>{{ task_.title }}</v-card-text>
    <v-card-actions>
      <v-btn icon><v-icon color="purple">edit</v-icon></v-btn>
      <v-btn icon><v-icon color="purple">close</v-icon></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import Task from '../lib/Task'

@Component
export default class Note extends Vue {

  @Prop() public task_!: Task;

}
</script>
