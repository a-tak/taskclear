<template>
  <v-container grid-list-md text-xs-center pa-1>
    <v-layout row wrap>
      <v-flex text-left>
        <v-card>
          <v-card-title class="title teal lighten-3 white--text">タスク編集</v-card-title>
          <v-layout v-bind="layoutAttributes" fill-height align-center justify-space-between>
            <v-flex ma-2 grow>
              <span>タスク名</span>
              <v-text-field
                v-bind:id="'task-edit-title-field-' + editTask_.id"
                placeholder="タスク名"
                single-line
                outline
                v-model="editTask_.title"
                clearable
                @focus="startEditTaskName()"
                @blur="endEditTaskName()"
                @keydown="keyDown($event)"
                @keyup.enter="keyUp()"
                @keyup.esc="cancel()"
              ></v-text-field>
            </v-flex>
            <v-flex shrink>
              <v-checkbox hide-details v-model="estimateSeparateStart_" label="見積開始のタスクにする"></v-checkbox>
            </v-flex>
            <v-flex shrink>
              <v-checkbox hide-details v-model="estimateSeparateEnd_" label="見積の区切りのタスクにする"></v-checkbox>
            </v-flex>
          </v-layout>
          <v-layout v-bind="layoutAttributes" fill-height align-center justify-center>
            <v-flex ma-2>
              <span>開始時間</span>
              <v-text-field
                v-bind:id="'task-edit-start-field-' + editTask_.id"
                type="number"
                placeholder="開始時間"
                single-line
                outline
                hint="数字3または4桁。9時20分は「920」と入力"
                v-model="startTime_"
                clearable
                @keyup.enter="save"
                @keyup.esc="cancel()"
              ></v-text-field>
            </v-flex>
            <v-flex ma-2>
              <span>終了時間</span>
              <v-text-field
                v-bind:id="'task-edit-end-field-' + editTask_.id"
                type="number"
                placeholder="終了時間"
                single-line
                outline
                mask="####"
                hint="数字3または4桁。9時20分は「920」と入力"
                v-model="endTime_"
                clearable
                @keyup.enter="save"
                @keyup.esc="cancel()"
              ></v-text-field>
            </v-flex>
            <v-flex ma-2>
              <span>見積時間(分)</span>
              <v-text-field
                v-bind:id="'task-edit-estimate-field-' + editTask_.id"
                type="number"
                placeholder="見積時間(分)"
                single-line
                outline
                mask="#####"
                hint="見積時間(分)を入力"
                v-model="estimateTime_"
                clearable
                @keyup.enter="save"
                @keyup.esc="cancel()"
              ></v-text-field>
            </v-flex>
            <v-flex ma-2>
              <span>予定時間帯</span>
              <v-combobox
                :id="'task-edit-section-field-' + editTask_.id"
                type="number"
                placeholder="予定時間帯"
                single-line
                outline
                mask="#####"
                hint="数字3または4桁。9時20分は「920」と入力"
                v-model="section_"
                :items="sectionList_"
                @keyup.enter="save"
                @keyup.esc="cancel()"
              ></v-combobox>
            </v-flex>
            <v-flex ma-2>
              <span>ソート順</span>
              <v-text-field
                v-bind:id="'task-edit-sortno-field-' + editTask_.id"
                type="number"
                placeholder="ソート順"
                single-line
                outline
                mask="#####"
                hint="ソート順を番号で入力"
                v-model="sortNo_"
                @keyup.enter="save"
                @keyup.esc="cancel()"
              ></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row fill-height align-end justify-end pa-0>
            <v-btn class="ma-3 accent" min-width="120" @click.stop="save">保存</v-btn>
            <v-btn class="ma-3" min-width="120" v-bind:id="'task-edit-cancelbtn-' + editTask_.id" @click.stop="cancel">キャンセル</v-btn>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from "vue-property-decorator"
import Task from "../lib/Task"
import TaskController from "../lib/TaskController"
import Util from "../util/Util"
import DateUtil from "../util/DateUtil"
import Section from "@/lib/Section"

@Component
export default class TaskEdit extends Vue {
  // !はundefinedやnullにならないことを示すもの
  @Prop() public task_!: Task

  private menu_: boolean = false
  private startTime_: string = ""
  private endTime_: string = ""
  private estimateTime_: string = ""
  private section_: string = ""
  private sortNo_: number = 999
  private sections_: Section[] = []
  private sectionList_: string[] = []
  private estimateSeparateStart_: boolean = false
  private estimateSeparateEnd_: boolean = false

  private backupedTask_!: Task
  private editTask_!: Task
  private keyDownCode_: number = 0

  @Emit("endEditEvent")
  // tslint:disable-next-line:no-empty
  private endEdit(task: Task): void {
    Util.assertIsDefined(task)
  }

  // このコンポーネントだけ足してもダメ。親TaskRow側でもイベントをうけて親のTaskListMainに返す必要がある
  @Emit("start-edit-task-name-event")
  // tslint:disable-next-line:no-empty
  private startEditTaskName(): void {}

  @Emit("end-edit-task-name-event")
  // tslint:disable-next-line:no-empty
  private endEditTaskName(): void {}

  // セクションが非同期で読み込まれるので読み込まれて変動したタイミングでリストを作るようにした
  @Watch("sections_")
  private onLoadSection() {
    // セクションリスト作成
    this.sectionList_ = []
    for (const section of this.sections_) {
      this.sectionList_.push(DateUtil.get4digitTime(section.startTime))
    }
  }

  private save(): void {
    // Vuetifyでxボタンを押すとnullになるみたい…
    if (this.startTime_ != undefined && this.startTime_.trim() !== "") {
      this.editTask_.startTime = DateUtil.getDateObject(
        this.$store.getters["taskList/targetDate"],
        this.startTime_,
      )

      if (this.endTime_ != undefined && this.endTime_.trim() !== "") {
        this.editTask_.endTime = DateUtil.getDateObject(
          this.$store.getters["taskList/targetDate"],
          this.endTime_,
        )
        // 終了時間が入っていたら停止する
        this.editTask_.isDoing = false
      } else {
        this.editTask_.endTime = undefined
        // 開始時間入っていて終了が入っていなければタスクを開始状態にする
        this.editTask_.isDoing = true
      }
    } else {
      this.editTask_.startTime = undefined
      // 開始が入ってなければ終了時間も空にする
      this.editTask_.endTime = undefined
      this.editTask_.isDoing = false
    }

    this.editTask_.date = DateUtil.calcTaskDate(
      this.$store.getters["taskList/targetDate"],
      DateUtil.getDateByTimeString(this.section_),
    )

    if (Util.isNumber(this.estimateTime_)) {
      this.editTask_.estimateTime = Number(this.estimateTime_)
    } else {
      this.editTask_.estimateTime = 0
    }

    this.editTask_.estimateSeparateStart = this.estimateSeparateStart_
    this.editTask_.estimateSeparateEnd = this.estimateSeparateEnd_
    this.editTask_.sortNo = this.sortNo_
    this.editTask_.needSave = true

    // 編集終了イベント発生
    Util.assertIsDefined(this.editTask_)
    this.endEdit(this.editTask_)
  }

  private cancel(): void {
    this.editTask_ = this.backupedTask_

    // 編集終了イベント発生
    Util.assertIsDefined(this.backupedTask_)
    this.endEdit(this.backupedTask_)
    this.endEditTaskName()
  }

  private created(): void {
    // 編集前の値を待避
    this.backupedTask_ = this.task_.clone()
    // 編集用オブジェクト作成
    this.editTask_ = this.task_.clone()

    if (this.task_.startTime != undefined) {
      this.startTime_ = DateUtil.get4digitTime(this.task_.startTime)
    }
    if (this.task_.endTime != undefined) {
      this.endTime_ = DateUtil.get4digitTime(this.task_.endTime)
    }
    if (this.task_.estimateTime != undefined) {
      this.estimateTime_ = this.task_.estimateTime.toString()
    }
    this.section_ = DateUtil.get4digitTime(this.task_.date)
    this.sortNo_ = this.task_.sortNo
    this.estimateSeparateStart_ = this.task_.estimateSeparateStart
    this.estimateSeparateEnd_ = this.task_.estimateSeparateEnd

    this.sections_ = this.$store.getters["section/sections"]
  }

  // 算出プロパティーでオブジェクトを返すと属性を展開してくれる
  get layoutAttributes(): {} {
    // 画面サイズによって入力ボックスを横に並べるか縦に並べるか切り替える
    switch (this.$vuetify.breakpoint.name) {
      case "xs":
        return { row: true }
      case "sm":
        return { row: true }
      case "md":
        return { row: true }
      case "lg":
        return { row: true }
      case "xl":
        return { row: true }
      default:
        return { row: true }
    }
  }

  private keyDown(event: KeyboardEvent): void {
    this.keyDownCode_ = event.keyCode
  }

  /**
   * 日本語入力確定のEnterキーで以外で先に進むようにする
   */
  private keyUp(): void {
    if (this.keyDownCode_ === 13) {
      this.save()
      this.keyDownCode_ = 0
      this.endEditTaskName()
    }
  }
}
</script>

<style scoped>
</style>


