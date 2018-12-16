<template>
  <div id="main">
    <Header></Header>
    <Footer></Footer>
  </div>
</template>
  
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import firebase, { firestore } from 'firebase';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

@Component({
components: {
    Header,
    Footer,
},
})

export default class SectionList extends Vue {
}
</script>