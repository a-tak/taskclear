<template>
  <v-toolbar color="teal lighten-3" id="header" >
    <v-img src="/img/top-logo.svg" aspect-ratio="1" max-height="30px" max-width="30px"></v-img>
    <v-spacer></v-spacer>
    <v-menu offset-y class="menu">
      <v-btn id="more"
        slot="activator"
        icon>
          <v-icon>more_vert</v-icon>
      </v-btn>
      <v-list>
        <v-list-tile @click="jumpToTaskList()">
          <v-list-tile-title>タスクリスト</v-list-tile-title>
        </v-list-tile>
        <v-list-tile @click="jumpToSectionSetting()">
          <v-list-tile-title>セクション設定</v-list-tile-title>
        </v-list-tile>
        <v-list-tile @click="jumpToHelp()">
          <v-list-tile-title>ヘルプ</v-list-tile-title>
        </v-list-tile>
        <v-list-tile @click="logout()">
          <v-list-tile-title>ログアウト</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-toolbar>
</template>

<style>
.menu {
  z-index: 200;
}
</style>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import firebase from 'firebase';

@Component
export default class Header extends Vue {
  private logout(): void {
    firebase.auth().signOut().then(() => {
      this.$router.push('/login');
    });
  }

  private jumpToSectionSetting(): void {
    this.$router.push('/sectionlist');
  }

  private jumpToTaskList(): void {
    this.$router.push('/tasklist');
  }

  private jumpToHelp(): void {
    window.open('https://github.com/a-tak/taskclear/blob/master/help/README.md', 'newtab');
  }
}
</script>