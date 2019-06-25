<template>
  <v-card>
    <v-card-title class="title teal lighten-3 white--text">メモ</v-card-title>
    <v-card-text>テスト</v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import Task from '../lib/Task'

@Component
export default class MemoEdit extends Vue {
}
</script>
