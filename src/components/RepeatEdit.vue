<template>
  <v-container grid-list-md text-xs-center pa-2>
    <v-card class="ma-2">
      <v-card-title class="title teal lighten-3 white--text">リピート設定</v-card-title>
      <v-layout v-bind="layoutAttributes" fill-height align-center justify-center row>
        <v-flex ml-3>
          <v-layout v-bind="layoutAttributes" fill-height align-center justify-center>
            <v-flex>
              <v-checkbox v-model="selectedDay_" label="月曜日" value="1"></v-checkbox>
            </v-flex>
            <v-flex>
              <v-checkbox v-model="selectedDay_" label="火曜日" value="2"></v-checkbox>
            </v-flex>
            <v-flex>
              <v-checkbox v-model="selectedDay_" label="水曜日" value="3"></v-checkbox>
            </v-flex>
            <v-flex>
              <v-checkbox v-model="selectedDay_" label="木曜日" value="4"></v-checkbox>
            </v-flex>
            <v-flex>
              <v-checkbox v-model="selectedDay_" label="金曜日" value="5"></v-checkbox>
            </v-flex>
            <v-flex>
              <v-checkbox v-model="selectedDay_" label="土曜日" value="6"></v-checkbox>
            </v-flex>
            <v-flex>
              <v-checkbox v-model="selectedDay_" label="日曜日" value="0"></v-checkbox>
            </v-flex>
          </v-layout>
        </v-flex>
        <v-flex>
          <v-layout column fill-height align-center justify-center>
            <v-flex>
              <span>リピート開始日</span>
              <v-menu
                :close-on-content-click="false"
                v-model="menufrom_"
                :nudge-right="40"
                lazy
                transition="scale-transition"
                offset-y
                full-width
                min-width="290px"
              >
                <v-text-field
                  slot="activator"
                  v-model="dateFrom"
                  label="開始日"
                  prepend-icon="event"
                  readonly
                ></v-text-field>
                <v-date-picker
                  v-model="dateFrom"
                  @input="menufrom_ = false"
                  locale="jp"
                  :day-format="date => new Date(date).getDate()"
                ></v-date-picker>
              </v-menu>
            </v-flex>
            <v-flex>
              <span>見積時間(分)</span>
              <v-text-field
                type="number"
                placeholder="見積時間(分)"
                single-line
                outline
                mask="#####"
                hint="見積時間(分)を入力"
                v-model="estimateTime_"
                clearable
                @keyup.enter="save()"
              ></v-text-field>
            </v-flex>
            <v-flex>
              <span>予定時間帯</span>
              <v-combobox
                type="number"
                placeholder="予定時間帯"
                single-line
                outline
                mask="#####"
                hint="数字3または4桁。9時20分は「920」と入力"
                v-model="section_"
                :items="sectionList_"
                @keyup.enter="save()"
              ></v-combobox>
            </v-flex>
            <v-flex>
              <v-btn icon @click.stop="noteDialog_=true">
                <v-icon v-if="note_===''" color="grey darken-1">note</v-icon>
                <v-icon v-if="note_!==''" color="purple">note</v-icon>
              </v-btn>
            </v-flex>
            <v-flex>
              <v-checkbox v-model="estimateSeparateStart_" label="見積開始のタスクにする"></v-checkbox>
            </v-flex>
            <v-flex>
              <v-checkbox v-model="estimateSeparateEnd_" label="見積の区切りのタスクにする"></v-checkbox>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
      <v-layout row fill-height align-center justify-center>
        <v-flex>
          <v-btn @click.stop="save">保存</v-btn>
        </v-flex>
        <v-flex>
          <v-btn @click.stop="cancel">キャンセル</v-btn>
        </v-flex>
      </v-layout>
    </v-card>
    <v-dialog v-model="noteDialog_" max-width="500px">
      <Note
        v-bind:note_="note_"
        v-on:endEditEvent="endEditNoteEvent"
        v-on:start-edit-task-name-event="startEditTaskNameEvent"
        v-on:end-edit-task-name-event="endEditTaskNameEvent"
        v-on:close-dialog-event="noteDialog_=false"
      ></Note>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import Task from '../lib/Task'
import DateUtil from '../util/DateUtil'
import TaskController from '../lib/TaskController'
import Repeat from '../lib/Repeat'
import FirestoreUtil from '../util/FirestoreUtil'
import Section from '@/lib/Section'
import Note from '@/components/Note.vue'

@Component({
  components: {
    Note,
  },
})
export default class RepeatEdit extends Vue {
  get dateFrom(): string {
    return DateUtil.getDateString(this.from_)
  }
  set dateFrom(value: string) {
    this.from_ = new Date(value)
  }

  // 算出プロパティーでオブジェクトを返すと属性を展開してくれる
  get layoutAttributes(): {} {
    // 画面サイズによって入力ボックスを横に並べるか縦に並べるか切り替える
    switch (this.$vuetify.breakpoint.name) {
      case 'xs':
        return { column: true }
      case 'sm':
        return { column: true }
      case 'md':
        return { row: true }
      case 'lg':
        return { row: true }
      case 'xl':
        return { row: true }
      default:
        return { row: true }
    }
  }

  // !はundefinedやnullにならないことを示すもの
  @Prop() public task_!: Task

  private menufrom_: boolean = false
  private menuto_: boolean = false
  private selectedDay_: string[] = []
  private from_: Date = new Date()
  private estimateTime_: number = 0
  private repeat_: Repeat = new Repeat()
  private oldRepeat_: Repeat | undefined = undefined
  private sections_: Section[] = []
  private sectionList_: string[] = []
  private section_: string = ''
  private estimateSeparateStart_: boolean = false
  private estimateSeparateEnd_: boolean = false
  private note_: string = ''
  private noteDialog_: boolean = false

  @Emit('changeTaskDateChangeEvent')
  // tslint:disable-next-line:no-empty
  public changeDate(task: Task): void {}

  @Emit('start-edit-task-name-event')
  // tslint:disable-next-line:no-empty
  public startEditTaskNameEvent(): void {}

  @Emit('end-edit-task-name-event')
  // tslint:disable-next-line:no-empty
  public endEditTaskNameEvent(): void {}

  @Emit('endRepeatEditEvent')
  // tslint:disable-next-line:no-empty
  public endEdit(task: Task): void {}

  public save(): void {
    this.task_.needSave = true
    if (this.selectedDay_.length > 0) {
      this.repeat_.title = this.task_.title
      this.repeat_.from = this.from_
      this.repeat_.day = this.selectedDay_
      this.repeat_.estimateTime = this.estimateTime_
      this.repeat_.section = DateUtil.getDateObject(DateUtil.getMinDate() , this.section_)
      this.repeat_.estimateSeparateStart = this.estimateSeparateStart_
      this.repeat_.estimateSeparateEnd = this.estimateSeparateEnd_
      this.repeat_.note = this.note_
      FirestoreUtil.saveRepeat(
        this.$store.getters['taskList/user'].uid,
        this.repeat_,
        this.oldRepeat_,
      )
      this.task_.repeatId = this.repeat_.id
    } else {
      // 曜日の指定を全て外したらリピートを削除する
      FirestoreUtil.saveRepeat(
        this.$store.getters['taskList/user'].uid,
        undefined,
        this.oldRepeat_,
      )
      this.task_.repeatId = ''
    }

    // 旧repeat idのタスクを削除
    if (this.oldRepeat_ !== undefined) {
      FirestoreUtil.deleteRepeatTaskById(
        this.$store.getters['taskList/user'].uid,
        this.oldRepeat_.id,
        this.oldRepeat_.from,
      )
    }

    // 編集終了イベント発生
    this.endEdit(this.task_)
  }

  public cancel(): void {
    this.endEdit(this.task_)
  }

  public created(): void {
    this.sections_ = this.$store.getters['section/sections']
    this.sectionList_ = []
    for (const section of this.sections_) {
      this.sectionList_.push(DateUtil.get4digitTime(section.startTime))
    }

    const self: RepeatEdit = this
    if (this.task_.repeatId === '') {
      this.setNewRepeat()
      this.setMember()
    } else {
      // リピートが設定されているタスクであればリピート設定を読み込み
      FirestoreUtil.loadRepeat(
        this.$store.getters['taskList/user'].uid,
        this.task_.repeatId)
        .then((repeat: Repeat): void => {
          if (repeat.id === '') {
            // タスクに設定されているリピートが存在しない(リンクが外れて浮いている)場合も、今のタスクから情報セットする
            this.setNewRepeat()
          } else {
            self.oldRepeat_ = repeat
            self.repeat_ = repeat.copyNew()
          }
          this.setMember()
        })
        .catch((error) => {
          // tslint:disable-next-line:no-console
          console.error('Repeat load error!', error)
        })
    }
  }

  private setNewRepeat(): void {
    this.repeat_ = new Repeat()
    this.repeat_.title = this.task_.title
    this.repeat_.estimateTime = this.task_.estimateTime
    this.repeat_.section = this.task_.date
    this.repeat_.estimateSeparateStart = this.task_.estimateSeparateStart
    this.repeat_.estimateSeparateEnd = this.task_.estimateSeparateEnd
    this.repeat_.note = this.task_.note
    this.oldRepeat_ = undefined
  }

  private setMember() {
    this.selectedDay_ = this.repeat_.day
    this.from_ = this.repeat_.from
    this.estimateTime_ = this.repeat_.estimateTime
    this.section_ = DateUtil.get4digitTime(this.repeat_.section)
    this.estimateSeparateStart_ = this.repeat_.estimateSeparateStart
    this.estimateSeparateEnd_ = this.repeat_.estimateSeparateEnd
    this.note_ = this.repeat_.note
  }

  private endEditNoteEvent(note: string): void {
    this.note_ = note
  }
}
</script>

<style>
</style>


