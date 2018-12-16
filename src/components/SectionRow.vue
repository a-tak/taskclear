<template>
  <v-container grid-list-md text-xs-center pa-1>
    <v-layout row wrap>
      <v-flex>
        <v-card>
          <v-layout v-bind="layoutAttributes" fill-height align-center justify-space-between>
            <v-flex ma-2>
              <span>タスク名</span>
              <v-text-field v-bind:id="'task-edit-title-field-' + editTask_.id" placeholder="タスク名" single-line outline v-model="editTask_.title" clearable @keydown="keyDown($event)" @keyup.enter="keyUp()" @keyup.esc="cancel()"></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout v-bind="layoutAttributes" fill-height align-center justify-center>
            <v-flex ma-2>
              <span>開始時間</span>
              <v-text-field v-bind:id="'task-edit-start-field-' + editTask_.id" type="number" placeholder="開始時間" single-line outline hint="数字3または4桁。9時20分は「920」と入力" v-model="startTime_" clearable @keyup.enter="save" @keyup.esc="cancel()"></v-text-field>
            </v-flex>
            <v-flex ma-2>
              <span>終了時間</span>
              <v-text-field v-bind:id="'task-edit-end-field-' + editTask_.id" type="number" placeholder="終了時間" single-line outline mask="####" hint="数字3または4桁。9時20分は「920」と入力" v-model="endTime_" clearable  @keyup.enter="save" @keyup.esc="cancel()"></v-text-field>
            </v-flex>
            <v-flex ma-2>
              <span>見積時間(分)</span>
              <v-text-field v-bind:id="'task-edit-estimate-field-' + editTask_.id" type="number" placeholder="見積時間(分)" single-line outline mask="#####" hint="見積時間(分)を入力" v-model="estimateTime_" clearable @keyup.enter="save" @keyup.esc="cancel()"> </v-text-field>
            </v-flex>
            <v-flex ma-2>
              <span>ソート順</span>
              <v-text-field v-bind:id="'task-edit-sortno-field-' + editTask_.id" type="number" placeholder="ソート順" single-line outline mask="#####" hint="ソート順を番号で入力" v-model="sortNo_"  @keyup.enter="save" @keyup.esc="cancel()"> </v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row fill-height align-center justify-center>
            <v-flex>
              <v-btn @click.stop="save">保存</v-btn>
            </v-flex>
            <v-flex>
              <v-btn v-bind:id="'task-edit-cancelbtn-' + editTask_.id" @click.stop="cancel">キャンセル</v-btn>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import Task from '../lib/Task';
import TaskController from '../lib/TaskController';
import Util from '../util/Util';
import DateUtil from '../util/DateUtil';

@Component
export default class SectionRow extends Vue {

  public menu_: boolean = false;
  public startTime_: string = '';
  public endTime_: string = '';
  public estimateTime_: string = '';
  public backupedTask_!: Task;
  public editTask_!: Task;

  // !はundefinedやnullにならないことを示すもの
  @Prop() public task_!: Task;

  private keyDownCode_: number = 0;
  private sortNo_: number = 999;

  @Emit('endEditEvent')
  // tslint:disable-next-line:no-empty
  private endEdit(task: Task): void {}

  private save(): void {
      if (this.startTime_.trim() !== '' ) {
          this.editTask_.startTime = DateUtil.getDateObject(this.task_.date, this.startTime_);

          if (this.endTime_.trim() !== '') {
              this.editTask_.endTime = DateUtil.getDateObject(this.task_.date, this.endTime_);
              // 終了時間が入っていたら停止する
              this.editTask_.isDoing = false;
          } else {
              this.editTask_.endTime = null;
              // 開始時間入っていて終了が入っていなければタスクを開始状態にする
              this.editTask_.isDoing = true;
          }
      } else {
          this.editTask_.startTime = null;
          // 開始が入ってなければ終了時間も空にする
          this.editTask_.endTime = null;
          this.editTask_.isDoing = false;
      }

      if (Util.isNumber(this.estimateTime_)) {
          this.editTask_.estimateTime = Number(this.estimateTime_);
      } else {
          this.editTask_.estimateTime = 0;
      }

      this.editTask_.sortNo = this.sortNo_;
      this.editTask_.needSave = true;

      // 編集終了イベント発生
      this.endEdit(this.editTask_);
  }

  private cancel(): void {
      this.editTask_ = this.backupedTask_;
      this.endEdit(this.backupedTask_);
  }

  private created(): void {
      // 編集前の値を待避
      this.backupedTask_ = this.task_.copy();
      // 編集用オブジェクト作成
      this.editTask_ = this.task_.copy();

      if (this.task_.startTime != null) {
          this.startTime_ = DateUtil.get4digitTime(this.task_.startTime);
      }
      if (this.task_.endTime != null) {
          this.endTime_ = DateUtil.get4digitTime(this.task_.endTime);
      }
      if (this.task_.estimateTime != null) {
          this.estimateTime_ = this.task_.estimateTime.toString();
      }
      this.sortNo_ = this.task_.sortNo;
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

  private keyDown(event: KeyboardEvent): void {
      this.keyDownCode_ = event.keyCode;
  }

  /**
   * 日本語入力確定のEnterキーで以外で先に進むようにする
   */
  private keyUp(): void {
      if (this.keyDownCode_ === 13) {
          this.save();
          this.keyDownCode_ = 0;
      }
  }
}
</script>

<style>
</style>


