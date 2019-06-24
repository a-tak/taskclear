<template>
    <div id="home">
        <v-container>
            <v-layout align-center justify-center column fill-height>
                <v-flex ma-2>
                  <v-img src="/img/logo.svg" aspect-ratio="1" v-bind="logoSize" ></v-img>
                </v-flex>
                <v-flex v-bind="titleSize" ma-2>
                    Taskclear
                </v-flex>
                <v-flex v-if="!isLogin">
                    <v-btn @click="googleLogin">Googleアカウントでログイン</v-btn>
                </v-flex>
                <v-flex v-if="!isLoginChecked">
                    <v-progress-circular
                        indeterminate
                        color="primary"
                    ></v-progress-circular>
                    ログイン処理中
                </v-flex>
                <v-flex ma-5>
                    <v-card>
                        <v-card-title primary-title>
                            ご注意
                        </v-card-title>
                        <v-card-text class="text-xs-left">
                            <span>データを消す場合がありますのであくまでお試しの利用に限ってください</span><br>
                            <span>メールや登録したデータは管理者は見えてしまいますので、ほんとあくまでお試しで</span>
                        </v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import firebase from 'firebase'

@Component
export default class Login extends Vue {

  private isLoginChecked_: boolean = false
  public get isLoginChecked(): boolean {
    return this.isLoginChecked_
  }
  public set isLoginChecked(value: boolean) {
    this.isLoginChecked_ = value
  }

  private isLogin_: boolean = false
  public get isLogin(): boolean {
    return this.isLogin_
  }
  public set isLogin(value: boolean) {
    this.isLogin_ = value
  }

    private googleLogin(): void {
      firebase
          .auth()
          .signInWithRedirect(new firebase.auth.GoogleAuthProvider())
          .then()
          .catch()
    }

  private mounted(): void {
    firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
      this.isLoginChecked_ = true
      if (user) {
        this.isLogin = true
        this.$store.commit('taskList/setUser', user)
        this.$router.push('/tasklist')
      } else {
        this.isLogin = false
        this.$store.commit('taskList/setUser', undefined)
      }
    })
  }

    get titleSize(): {} {
        switch (this.$vuetify.breakpoint.name) {
            case 'xs': return {'display-2': true}
            case 'sm': return {'display-2': true}
            case 'md': return {'display-3': true}
            case 'lg': return {'display-3': true}
            case 'xl': return {'display-3': true}
            default  : return {'display-3': true}
        }
    }

    get logoSize(): {} {
        switch (this.$vuetify.breakpoint.name) {
            case 'xs': return {width: '250'}
            case 'sm': return {width: '400'}
            case 'md': return {width: '500'}
            case 'lg': return {width: '600'}
            case 'xl': return {width: '600'}
            default  : return {width: '600'}
        }
    }

}
</script>
