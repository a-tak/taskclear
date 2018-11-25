<template>
  <div id="Home">
    <Login v-if="!isLogin" :loading_="loading_"></Login>
    <TaskListMain v-if="isLogin"></TaskListMain>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Login from "@/components/Login.vue"
import TaskListMain from "@/components/TaskListMain.vue"
import firebase from "firebase"

@Component({
  components: {
    Login,
    TaskListMain
  },
})
export default class Home extends Vue {
  isLogin: boolean = false;
  userData: firebase.User | null = null;
  loading_: boolean = true;

  created () : void {
    firebase.auth().onAuthStateChanged(user => {
    console.log(user);
    this.loading_ = false;
    if (user) {
      this.isLogin = true;
      this.$store.commit("setUser",user);
      this.userData = user;
    }else{
      this.isLogin = false;
      this.$store.commit("setUser",null);
      this.userData = null;
    };
  });
  }
}
</script>
