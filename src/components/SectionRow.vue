<template>
  <v-container grid-list-md text-xs-center pa-1>
    <v-layout row wrap>
      <v-flex>
        <v-card>
          <v-layout v-bind="layoutAttributes" fill-height align-center justify-space-between>
            <v-flex ma-2>
              <v-text-field v-bind:id="'section-title-field-' + section_.id" placeholder="セクション名" single-line outline clearable v-model="section_.title" @change="changeSection(section_)" ></v-text-field>
            </v-flex>
            <v-flex ma-2>
              <v-text-field v-bind:id="'section-start-field-' + section_.id" type="number" placeholder="開始時間" single-line outline clearable hint="数字3または4桁。9時20分は「920」と入力" v-model="startTime_" @change="changeStartTime()"></v-text-field>
            </v-flex>
            <v-flex xs4 sm2 md1 class="text-xs-right">
              <v-btn icon ripple @click.stop="deleteSection(section_)">
                  <v-icon color="grey darken-1">delete</v-icon>
                </v-btn>
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
import DateUtil from '@/util/DateUtil';

@Component
export default class SectionRow extends Vue {
// !はundefinedやnullにならないことを示すもの
  @Prop() public section_!: Section;
  @Prop() public index_!: number;

  private startTime_: string = '';

  @Emit('clickDeleteButtomEvent')
  // tslint:disable-next-line:no-empty
  public deleteSection(section: Section): void {}
  @Emit('changeEvent')
  // tslint:disable-next-line:no-empty
  public changeSection(section: Section, index: number): void {}

  private created() {
    this.startTime_ = DateUtil.get4digitTime(this.section_.startTime);
  }

  private changeStartTime(): void {
    if (this.startTime_.trim() !== '' ) {
      // getDateObjectがbaseDateを求めるのでややこしいことになってる
      let baseDate: Date = new Date();
      const sectionDate: Date | undefined = this.section_.startTime;
      if (sectionDate !== undefined) {
        baseDate = sectionDate;
      }
      this.section_.startTime = DateUtil.getDateObject(baseDate , this.startTime_);
    }
    this.changeSection(this.section_, this.index_);
  }

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


