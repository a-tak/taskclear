<template>
  <v-footer
    color="primary"
    class="mt-2"
  >
    <v-card
      flat
      tile
      color="primary"
    >
      <v-card-text>
        &copy;2019 a-tak.com  ver. <span id="ver">{{ version_ }}</span>
      </v-card-text>
    </v-card>
  </v-footer>
</template>

<style scoped>

</style>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import firebase from "firebase"
import packageJson from "../../package.json"

@Component
export default class Footer extends Vue {
  private version_: string = ""

  private created(): void {
    this.version_ = packageJson.version
  }

}
</script>
