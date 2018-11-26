<template>
    <div id="home">
        <v-container>
            <v-layout align-center justify-center column fill-height>
                <v-flex v-bind="logoSize" ma-5>
                    Taskclear
                </v-flex>
                <v-flex v-if="!isLoading_">
                    <v-btn @click="googleLogin">Googleアカウントでログイン</v-btn>
                </v-flex>
                <v-flex v-if="isLoading_">
                    <v-progress-circular
                        indeterminate
                        color="primary"
                    ></v-progress-circular>
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
import { Component, Vue, Prop } from 'vue-property-decorator';
import firebase from 'firebase';

@Component
export default class Login extends Vue {

    @Prop() public isLoading_!: boolean;

    private googleLogin(): void {
        firebase
            .auth()
            .signInWithRedirect(new firebase.auth.GoogleAuthProvider())
            .then()
            .catch();
    }

    get logoSize(): {} {
        // 画面サイズによって入力ボックスを横に並べるか縦に並べるか切り替える
        switch (this.$vuetify.breakpoint.name) {
            case 'xs': return {'display-3': true};
            case 'sm': return {'display-3': true};
            case 'md': return {'display-4': true};
            case 'lg': return {'display-4': true};
            case 'xl': return {'display-4': true};
            default  : return {'display-4': true};
        }
    }

}
</script>
