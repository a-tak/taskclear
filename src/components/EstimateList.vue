<template>
    <div id="estimate-list">
        <v-card>
            <v-layout row>
                <v-flex>
                    <v-layout column>
                        <v-flex v-for="(estimate, index) in estimates" v-if="index<=2" :key="estimate.dateStr">
                            <div v-if="index==0" class="headline">
                                ({{ estimate.dayLabel }}) {{ estimate.estimateTime}} 分
                            </div>
                            <div v-else>
                                ({{ estimate.dayLabel }}) {{ estimate.estimateTime}} 分
                            </div>
                        </v-flex>
                    </v-layout>
                </v-flex>
                <v-flex>
                    <v-layout column>
                        <v-flex v-for="(estimate, index) in estimates" v-if="3 <= index" :key="estimate.dateStr">
                            ({{ estimate.dayLabel }}) {{ estimate.estimateTime}} 分
                        </v-flex>
                    </v-layout>
                </v-flex>
            </v-layout>
        </v-card>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator';
import TaskController from '../lib/TaskController';
import FirebaseUtil from '../util/FirebaseUtil';
import { firestore } from 'firebase';
import Estimate from '../lib/Estimate';

@Component
export default class EstimateList extends Vue {

    private estimates_: Estimate[] = [];
    // 関数の配列!
    // ()で関数を表し=>でvoid戻り値。それらを()で括って[]で配列と定義
    private unsubscribes_: Array<() => void> = [];


    @Watch('targetDate')
    public onValueChange(newValue: string, oldValue: string): void {
        // 日付が変えられたときにリッスンを破棄
        for (const unsubscribe of this.unsubscribes_) {
            unsubscribe();
        }
        this.display();
    }

    public get targetDate(): Date {
        return this.$store.getters.targetDate;
    }


    get estimates(): Estimate[] {
        return this.estimates_;
    }

    public created(): void {
        this.display();
    }

    public display(): void {
        const fsdsPromises: Array<Promise<TaskController>> = new Array(6);
        this.estimates_ = [];

        // 見積時間の初期表示
        for (let n = 0; n <= 6; n++) {
            // 一日ずつ日付を進めてデータを取得
            const targetDate: Date = new Date();
            targetDate.setDate(this.targetDate.getDate() + n);

            // Promiseを配列に溜めておく
            fsdsPromises[n] = FirebaseUtil.loadTasks(this.$store.getters.user.uid, targetDate);

            // 非同期処理の登録
            fsdsPromises[n].then((tc: TaskController) => {
                const estimate = this.createEstimate(tc, targetDate);
                this.estimates_.push(estimate);
            }).catch((error: Error) => {
                // tslint:disable-next-line:no-console
                console.log('Error getting document:', error);
            });
        }

        // 1週間分のデータが全部非同期で取れたらソート
        // TaskControllerが各Promiseから返ってくるけど使ってない。単に処理が終わった事だけ検知して処理している。微妙。
        // おそらく画面も変な順番に並んだ後、ソートされていてぎこちない動きになってるかも
        Promise.all(fsdsPromises).then((tc) => {
            // 全部データ取得したら一旦ソート
            this.estimates_.sort((a: Estimate, b: Estimate): number => {
                if (a.date == null) {
                    return 1;
                } else if (b.date == null) {
                    return -1;
                } else {
                    return a.date.getTime() - b.date.getTime();
                }
            });

            // ドキュメントのリッスン
            for (let n = 0; n <= 6; n++) {
                // 一日ずつ日付を進めてデータを取得
                const targetDate: Date = new Date();
                targetDate.setDate(this.targetDate.getDate() + n);

                // リッスン破棄のために戻り値を配列で保存
                this.unsubscribes_.push(FirebaseUtil.getQuery(this.$store.getters.user.uid, targetDate)
                    .onSnapshot((query) => {
                        query.forEach((doc) => {
                            // 更新があったら見積時間を再計算
                            const firedoc: firebase.firestore.DocumentData | undefined  = doc.data();
                            if (firedoc !== undefined) {
                                FirebaseUtil.loadTasks(this.$store.getters.user.uid, targetDate)
                                .then((taskCtrl: TaskController) => {
                                    const estimate = this.createEstimate(taskCtrl, targetDate);
                                    for (const [index, item] of this.estimates_.entries()) {
                                        if (item.dateStr === estimate.dateStr) {
                                            this.$set(this.estimates_, index, estimate);
                                            break;
                                        }
                                    }
                                });
                            }
                        });
                    }),
                );
            }
        });
    }

    /**
     * 一日分のEstimateクラスをつくって返す
     * @param tc 計算対象の一日のデータが入ったTaskController
     */
    public createEstimate(tc: TaskController, targetDate: Date): Estimate {
        const estimate = new Estimate();
        estimate.date = targetDate;
        const weekday: string[] = [ '日', '月', '火', '水', '木', '金', '土' ] ;
        estimate.dayLabel = weekday[targetDate.getDay()];
        estimate.estimateTime = tc.getEstimateSum().toString();

        return estimate;
    }

}

</script>

<style>

</style>
