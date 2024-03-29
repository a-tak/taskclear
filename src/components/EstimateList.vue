<template>
  <div id="estimate-list">
    <v-card class="elevation-5">
      <v-card-text>
        <v-row>
          <v-col cols="6" sm="6" md="6" lg="6" xl="6" class="pl-md-5">
            <v-row
              v-for="(estimate, index) in estimates1"
              :key="estimate.dateStr"
            >
              <div v-if="index == 0" class="headline">
                {{ estimate.dateStr }} ({{ estimate.dayLabel }})
                {{ estimate.estimateTime }}
              </div>
              <div v-else>
                {{ estimate.dateStr }} ({{ estimate.dayLabel }})
                {{ estimate.estimateTime }}
              </div>
            </v-row>
          </v-col>
          <v-col cols="6" sm="6" md="6" lg="6" xl="6" class="pl-5">
            <v-row
              v-for="estimate in estimates2"
              :key="estimate.dateStr"
              >{{ estimate.dateStr }} ({{ estimate.dayLabel }})
              {{ estimate.estimateTime }}</v-row
            >
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from "vue-property-decorator"
import TaskController from "@/lib/TaskController"
import FirestoreUtil from "@/util/FirestoreUtil"
import firebase from "firebase"
import Estimate from "@/lib/Estimate"
import DateUtil from "../util/DateUtil"

@Component
export default class EstimateList extends Vue {
  private estimates_: Estimate[] = []
  // 関数の配列!
  // ()で関数を表し=>でvoid戻り値。それらを()で括って[]で配列と定義
  private unsubscribes_: Array<() => void> = []

  @Watch("targetDate")
  public onValueChange(newValue: string, oldValue: string): void {
    // 日付が変えられたときにリッスンを破棄
    this.stopListen()
    this.display()
  }

  /**
   * タスクリストの現在の日付が変わった事を検知するためのプロパティ
   */
  get targetDate(): Date {
    return this.$store.getters["taskList/targetDate"]
  }

  get estimates1(): Estimate[] {
    return this.estimates_.slice(0, 3)
  }

  get estimates2(): Estimate[] {
    return this.estimates_.slice(3, 7)
  }

  public display(): void {
    const fsdsPromises: Array<Promise<TaskController>> = new Array(6)
    this.estimates_ = []

    // 見積時間の初期表示
    for (let n = 0; n <= 6; n++) {
      // 一日ずつ日付を進めてデータを取得
      const targetDate: Date = new Date(
        this.$store.getters["taskList/targetDate"],
      )
      targetDate.setDate(targetDate.getDate() + n)

      // Promiseを配列に溜めておく
      fsdsPromises[n] = FirestoreUtil.loadTasks(
        this.$store.getters["taskList/user"].uid,
        targetDate,
      )

      // 非同期処理の登録
      fsdsPromises[n]
        .then((tc: TaskController) => {
          const estimate = this.createEstimate(tc, targetDate)
          this.estimates_.push(estimate)
        })
        .catch((error: Error) => {
          // tslint:disable-next-line:no-console
          console.log("Error getting document:", error)
        })
    }

    // 1週間分のデータが全部非同期で取れたらソート
    // TaskControllerが各Promiseから返ってくるけど使ってない。単に処理が終わった事だけ検知して処理している。微妙。
    // おそらく画面も変な順番に並んだ後、ソートされていてぎこちない動きになってるかも
    Promise.all(fsdsPromises).then((tc) => {
      // 全部データ取得したら一旦ソート
      this.estimates_.sort((a: Estimate, b: Estimate): number => {
        if (a.date == undefined) {
          return 1
        } else if (b.date == undefined) {
          return -1
        } else {
          return a.date.getTime() - b.date.getTime()
        }
      })

      // ドキュメントのリッスン
      for (let n = 0; n <= 6; n++) {
        // 一日ずつ日付を進めてデータを取得
        const targetDate: Date = new Date(
          this.$store.getters["taskList/targetDate"],
        )
        targetDate.setDate(targetDate.getDate() + n)

        // リッスン破棄のために戻り値を配列で保存
        this.unsubscribes_.push(
          FirestoreUtil.getQuery(
            this.$store.getters["taskList/user"].uid,
            targetDate,
          ).onSnapshot((query) => {
            query.forEach((doc) => {
              // 更新があったら見積時間を再計算
              const firedoc:
                | firebase.firestore.DocumentData
                | undefined = doc.data()
              if (firedoc !== undefined) {
                FirestoreUtil.loadTasks(
                  this.$store.getters["taskList/user"].uid,
                  targetDate,
                ).then((taskCtrl: TaskController) => {
                  const estimate = this.createEstimate(taskCtrl, targetDate)
                  for (const [index, item] of this.estimates_.entries()) {
                    if (item.dateStr === estimate.dateStr) {
                      this.$set(this.estimates_, index, estimate)
                      break
                    }
                  }
                })
              }
            })
          }),
        )
      }
    })
  }

  /**
   * 一日分のEstimateクラスをつくって返す
   * @param tc 計算対象の一日のデータが入ったTaskController
   */
  public createEstimate(tc: TaskController, targetDate: Date): Estimate {
    const estimate = new Estimate()
    estimate.date = targetDate
    const weekday: string[] = ["日", "月", "火", "水", "木", "金", "土"]
    estimate.dayLabel = weekday[targetDate.getDay()]
    estimate.estimateTime = DateUtil.getTimeString(tc.getEstimateTime())

    return estimate
  }

  private created(): void {
    firebase.auth().onAuthStateChanged(async (user: firebase.User | null) => {
      this.$store.commit("taskList/setUser", user)
      // セクション読み込み
      // await this.$store.dispatch('section/load')
      this.display()
    })
  }

  private destroyed(): void {
    this.stopListen()
  }

  private stopListen(): void {
    for (const unsubscribe of this.unsubscribes_) {
      unsubscribe()
    }
  }
}
</script>

<style scoped></style>
