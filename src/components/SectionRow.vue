<template>
  <v-container grid-list-md text-xs-center pa-1>
    <v-layout row wrap>
      <v-flex>
        <v-card>
          <v-layout v-bind="layoutAttributes" fill-height align-center justify-space-between>
            <v-flex ma-2>
              <v-text-field v-bind:id="'section-title-field-' + section_.id" placeholder="セクション名" single-line outline v-model="section_.title" clearable ></v-text-field>
            </v-flex>
            <v-flex ma-2>
              <v-text-field v-bind:id="'section-start-field-' + section_.id" type="number" placeholder="開始時間" single-line outline hint="数字3または4桁。9時20分は「920」と入力" v-model="section_.startTime" clearable></v-text-field>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import Section from '@/lib/Section';

@Component
export default class SectionRow extends Vue {

  // !はundefinedやnullにならないことを示すもの
  @Prop() public section_!: Section;

  // 算出プロパティーでオブジェクトを返すと属性を展開してくれる
  get layoutAttributes(): {} {
      // 画面サイズによって入力ボックスを横に並べるか縦に並べるか切り替える
      switch (this.$vuetify.breakpoint.name) {
          case 'xs': return {column: true};
          case 'sm': return {column: true};
          case 'md': return {row: true};
          case 'lg': return {row: true};
          case 'xl': return {row: true};
          default  : return {row: true};
      }
  }
}
</script>

<style>
</style>


