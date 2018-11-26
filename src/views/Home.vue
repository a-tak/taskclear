<template>
  <div id="Home">
    <Login v-if="!isLogin_" :isLoading_="isLoading_"></Login>
    <TaskListMain v-if="isLogin_"></TaskListMain>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Login from '@/components/Login.vue';
import TaskListMain from '@/components/TaskListMain.vue';
import firebase from 'firebase';

@Component({
  components: {
    Login,
    TaskListMain,
  },
})
export default class Home extends Vue {
  private isLogin_: boolean = false;
  private userData_: firebase.User | null = null;
  private isLoading_: boolean = true;

  private created(): void {
    firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
    this.isLoading_ = false;
    if (user) {
      this.isLogin_ = true;
      this.$store.commit('setUser', user);
      this.userData_ = user;
    } else {
      this.isLogin_ = false;
      this.$store.commit('setUser', null);
      this.userData_ = null;
    }
  });
  }
}
</script>
