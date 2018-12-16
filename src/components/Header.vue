<template>
  <v-toolbar color="teal lighten-3" id="header" >
    <v-toolbar-side-icon></v-toolbar-side-icon>
    <v-toolbar-title>TaskClear</v-toolbar-title>
    <v-btn @click="logout">ログアウト</v-btn>
    <v-spacer></v-spacer>
    <v-menu offset-y>
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
      </v-list>
    </v-menu>
  </v-toolbar>
</template>

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