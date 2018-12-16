<template>
  <v-footer
    color="teal lighten-3"
    height="auto"
    class="mt-2"
  >
    <v-card
      flat
      tile
      color="teal lighten-3"
    >
      <v-card-text>
        &copy;2019 a-tak.com  ver. {{ version_ }}
      </v-card-text>
    </v-card>
  </v-footer> 
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import firebase from 'firebase';

@Component
export default class Footer extends Vue {
}
</script>