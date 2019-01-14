<template>
  <div id="main">
    <Header></Header>
    <span>セクション設定</span>
    <v-btn fab dark color="red" fixed floating bottom right @click="addSection()">
      <v-icon dark>add</v-icon>
    </v-btn>
    <v-slide-y-transition
      class="py-0"
      group
      tag="v-list"
    >
      <SectionRow
        v-for="(section, index) in sections"
        :key="section.id"
        :section_="section"
        :index_="index"
        v-on:clickDeleteButtomEvent="deleteSection"
        v-on:changeEvent="changeSection"
      >
      </SectionRow>
    </v-slide-y-transition>    
    <Footer></Footer>
  </div>
</template>
  
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import firebase, { firestore } from 'firebase';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import SectionRow from '@/components/SectionRow.vue';
import Section from '@/lib/Section';

@Component({
components: {
    Header,
    Footer,
    SectionRow,
},
})

export default class SectionList extends Vue {
  public get sections(): Section[] {
    return this.$store.getters['section/sections']
  }
  private created(): void {
    firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
      this.$store.commit('taskList/setUser', user);
      this.$store.dispatch('section/startListner');
    });
  }

  private destroyed(): void {
    this.$store.dispatch('section/stopListner');
  }

  private addSection(): void {
    console.log(`追加だよ`)
    this.$store.dispatch('section/set', new Section());
  }

  private deleteSection(section: Section): void {
    console.log(`削除ボタン押したのに`)
    this.$store.dispatch('section/delete', section);
  }

  private changeSection(section: Section, index: number): void {
    this.$store.dispatch('section/set', section);
  }
}
</script>