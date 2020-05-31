<template>
  <v-app-bar app color="primary" id="header">
    <v-img src="/img/top-logo.svg" aspect-ratio="1" max-height="30px" max-width="30px"></v-img>
    <v-spacer></v-spacer>
    <v-btn id="go-doing"
      icon
      @click="junpToNextTask()"
    >
      <v-icon>forward</v-icon>
    </v-btn>
    <v-menu offset-y class="menu">
      <template v-slot:activator="{ on }">
        <v-btn id="more"
          v-on="on"
          icon
        >
          <v-icon>more_vert</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="jumpToTaskList()">
          <v-list-item-title>タスクリスト</v-list-item-title>
        </v-list-item>
        <v-list-item @click="jumpToSectionSetting()">
          <v-list-item-title>セクション設定</v-list-item-title>
        </v-list-item>
        <v-list-item @click="jumpToHelp()">
          <v-list-item-title>ヘルプ</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout()">
          <v-list-item-title>ログアウト</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<style scoped>
.menu {
  z-index: 200;
}
</style>

<script lang="ts">
import { Component, Vue, Emit } from "vue-property-decorator"
import firebase from "firebase"

@Component
export default class Header extends Vue {
  @Emit("clickjumpToNextTaskButtomEvent")
  // tslint:disable-next-line:no-empty
  private junpToNextTask(): void {}

  private logout(): void {
    firebase.auth().signOut().then(() => {
      this.$router.push("/login")
    })
  }

  private jumpToSectionSetting(): void {
    this.$router.push("/sectionlist")
  }

  private jumpToTaskList(): void {
    this.$router.push("/tasklist")
  }

  private jumpToHelp(): void {
    window.open("https://a-tak.github.io/taskclear/", "newtab")
  }
}
</script>