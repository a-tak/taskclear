<template>
  <v-toolbar color="teal lighten-3" id="header" >
    <v-toolbar-side-icon></v-toolbar-side-icon>
    <v-toolbar-title>TaskClear</v-toolbar-title>
    <v-btn @click="logout">ログアウト</v-btn>
    <v-spacer></v-spacer>
    <v-btn id="more" icon>
      <v-icon>more_vert</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import firebase from 'firebase';

@Component
export default class Header extends Vue {
  private logout(): void {
    firebase.auth().signOut().then(() => {
      this.$router.push('/login');
    });
  }
}
</script>