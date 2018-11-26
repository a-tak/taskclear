<template>
    <div id="repeat-edit">
        <v-card class="ma-2">
            <v-card-title>
                リピート設定
            </v-card-title>
            <v-layout v-bind="layoutAttributes" fill-height align-center justify-center row>
                <v-flex ml-3>
                    <v-layout column fill-height align-center justify-center>
                        <v-flex>
                            <v-checkbox v-model="selectedDay_" label="月曜日" value=1></v-checkbox>
                        </v-flex>
                        <v-flex>
                            <v-checkbox v-model="selectedDay_" label="火曜日" value=2></v-checkbox>
                        </v-flex>
                        <v-flex>
                            <v-checkbox v-model="selectedDay_" label="水曜日" value=3></v-checkbox>
                        </v-flex>
                        <v-flex>
                            <v-checkbox v-model="selectedDay_" label="木曜日" value=4></v-checkbox>
                        </v-flex>
                        <v-flex>
                            <v-checkbox v-model="selectedDay_" label="金曜日" value=5></v-checkbox>
                        </v-flex>
                        <v-flex>
                            <v-checkbox v-model="selectedDay_" label="土曜日" value=6></v-checkbox>
                        </v-flex>
                        <v-flex>
                            <v-checkbox v-model="selectedDay_" label="日曜日" value=0></v-checkbox>
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
                            <v-date-picker v-model="dateFrom" @input="menufrom_ = false" locale="jp" :day-format="date => new Date(date).getDate()"></v-date-picker>
                            </v-menu>
                        </v-flex>
                        <v-flex>
                            <span>見積時間(分)</span>
                            <v-text-field type="number" placeholder="見積時間(分)" single-line outline mask="#####" hint="見積時間(分)を入力" v-model="estimateTime_" clearable > </v-text-field>
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
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import Task from '../lib/Task';
import DateUtil from '../util/DateUtil';
import TaskController from '../lib/TaskController';
import Repeat from '../lib/Repeat';
import FirebaseUtil from '../util/FirebaseUtil';

@Component
export default class RepeatEdit extends Vue {

    get dateFrom(): string {
        return DateUtil.getDateString(this.from_);
    }
    set dateFrom(value: string) {
        this.from_ = new Date(value);
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

    // !はundefinedやnullにならないことを示すもの
    @Prop() public task_!: Task;

    private menufrom_: boolean = false;
    private menuto_: boolean = false;
    private selectedDay_: string[] = [];
    private from_: Date = new Date();
    private estimateTime_: number = 0;
    private repeat_: Repeat = new Repeat();
    private oldRepeat_: Repeat | null = null;

    @Emit('endRepeatEditEvent')
    // tslint:disable-next-line:no-empty
    public endEdit(task: Task): void {}

    public save(): void {
        if (this.selectedDay_.length > 0) {
            this.repeat_.title = this.task_.title;
            this.repeat_.from = this.from_;
            this.repeat_.day = this.selectedDay_;
            this.repeat_.estimateTime = this.estimateTime_;
            FirebaseUtil.saveRepeat(this.$store.getters.user.uid, this.repeat_, this.oldRepeat_);
            this.task_.repeatId = this.repeat_.id;
        } else {
            // 曜日の指定を全て外したらリピートを削除する
            FirebaseUtil.saveRepeat(this.$store.getters.user.uid, null, this.oldRepeat_);
            this.task_.repeatId = '';
        }

        // 旧repeat idのタスクを削除
        if (this.oldRepeat_ !== null) {
            FirebaseUtil.deleteRepeatTaskById(this.$store.getters.user.uid, this.oldRepeat_.id, this.oldRepeat_.from);
        }

        // 編集終了イベント発生
        this.endEdit(this.task_);
    }

    public cancel(): void {
        this.endEdit(this.task_);
    }

    public created(): void {
        const self: RepeatEdit = this;
        if (this.task_.repeatId === '') {
            this.setNewRepeat();
        } else {
            // リピートが設定されているタスクであればリピート設定を読み込み
            FirebaseUtil.loadRepeat(this.$store.getters.user.uid, this.task_.repeatId).then((repeat: Repeat): void => {
                if (repeat.id === '') {
                    // タスクに設定されているリピートが存在しない(リンクが外れて浮いている)場合も、今のタスクから情報セットする
                    this.setNewRepeat();
                } else {
                    self.oldRepeat_ = repeat;
                    self.repeat_ = repeat.copyNew();

                    self.selectedDay_ = self.repeat_.day;
                    self.from_ = self.repeat_.from;
                    self.estimateTime_ = self.repeat_.estimateTime;
                }
            });
        }

    }

    public setNewRepeat(): void {
        this.repeat_ = new Repeat();
        this.repeat_.title = this.task_.title;
        this.repeat_.estimateTime = 0;
        this.oldRepeat_ = null;
    }
}
</script>

<style>
</style>


