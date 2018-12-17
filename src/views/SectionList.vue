<template>
  <div id="main">
    <Header></Header>
    <span>セクション設定</span>
    <v-btn fab dark color="blue" fixed floating bottom right @click="addSection()">
      <v-icon dark>add</v-icon>
    </v-btn>
      <v-slide-y-transition
        class="py-0"
        group
        tag="v-list"
      >
        <SectionRow
          v-for="(section) in sections_"
          :key="section.id"
          :section_="section"
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
  private sections_: Section[] = [];

  private created(): void {
    this.sections_.push(new Section('テスト1', new Date('9:12')));
    this.sections_.push(new Section('テスト2', new Date('12:14')));
  }
}
</script>