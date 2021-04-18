import firebase from "firebase/app"
import TaskController from "../lib/TaskController"
import Task from "@/lib/Task"
import Repeat from "@/lib/Repeat"
import ITask from "@/lib/ITask"
import DateUtil from "./DateUtil"

export default class FirestoreUtil {
  /**
   * 指定日以降のリピート設定を取得する
   * @param uid uid
   * @param date 対象日付
   */
  public static async loadRepeatByDateFrom(
    uid: string,
    date: Date,
  ): Promise<Repeat[]> {
    const repeats: Repeat[] = []

    const { from } = DateUtil.getDateFromToTime(date)
    const query: firebase.firestore.QuerySnapshot = await firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("repeats")
      .where("from", "<=", firebase.firestore.Timestamp.fromDate(from))
      .get()

    query.forEach((doc: firebase.firestore.QueryDocumentSnapshot): void => {
      if (doc !== undefined) {
        const data: firebase.firestore.DocumentData | undefined = doc.data()
        repeats.push(this.converToRepeat(data))
      }
    })
    return repeats
  }

  /**
   * Firestoreから一日分のタスクを読み込み
   * @param uid
   */
  public static async loadTasks(
    uid: string,
    date: Date,
  ): Promise<TaskController> {
    const tc = new TaskController()

    const query: firebase.firestore.QuerySnapshot = await this.getQuery(
      uid,
      date,
    ).get()

    query.forEach((doc: firebase.firestore.QueryDocumentSnapshot): void => {
      if (doc !== undefined) {
        const data: firebase.firestore.DocumentData | undefined = doc.data()
        tc.tasks.push(this.converToTask(data))
      }
    })
    return tc
  }

  public static getQuery(uid: string, date: Date): firebase.firestore.Query {
    const { from, to } = DateUtil.getDateFromToTime(date)

    return firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("tasks")
      .where("date", ">=", firebase.firestore.Timestamp.fromDate(from))
      .where("date", "<", firebase.firestore.Timestamp.fromDate(to))
      .where("isDeleted", "==", false)
  }

  /**
   * Firestoreから削除済みタスクを含む一日分のタスクを読み込み
   * @param uid
   * @param date
   */
  public static async loadTasksIncluedDeleted(
    uid: string,
    date: Date,
  ): Promise<TaskController> {
    const tc = new TaskController()

    const query: firebase.firestore.QuerySnapshot = await this.getDeletedQuery(
      uid,
      date,
    ).get()

    query.forEach((doc: firebase.firestore.QueryDocumentSnapshot): void => {
      if (doc !== undefined) {
        const data: firebase.firestore.DocumentData | undefined = doc.data()
        tc.tasks.push(this.converToTask(data))
      }
    })
    return tc
  }

  /**
   * タスクの論理削除
   * @param uid ユーザーid
   * @param task 論理削除対象タスク
   */
  public static logicalDeleteTask(uid: string, task: Task): void {
    task.isDeleted = true

    this.setTask(uid, task).catch((error: Error) => {
      // tslint:disable-next-line:no-console
      console.error(`Delete Task error! task id=${task.id}`, error)
    })
  }

  /**
   * タスクの物理削除
   * 今の所どこでも使っていないはず(リピート変更時のタスク削除はbatchでやっていた)
   * @param uid ユーザーid
   * @param task 物理削除対象タスク
   */
  public static physicalDeleteTask(uid: string, task: Task): void {
    firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("tasks")
      .doc(task.id)
      .delete()
      .catch((error: Error) => {
        // tslint:disable-next-line:no-console
        console.error(`Delete Task error! task id=${task.id}`, error)
      })
  }

  public static async setTask(uid: string, task: Task): Promise<void> {
    // 保存時にTaskオブジェクトのupdateTimeも更新
    task.updateTime = new Date()
    firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("tasks")
      .doc(task.id)
      .set(this.getTaskLiteral(task))
  }

  /**
   * 指定したRepeat IDのタスクを削除する
   * @param uid
   * @param repeatId
   * @param dateFrom
   */
  public static async deleteRepeatTaskById(
    uid: string,
    repeatId: string,
    dateFrom: Date,
  ): Promise<void> {
    const batch: firebase.firestore.WriteBatch = firebase.firestore().batch()

    const { from } = DateUtil.getDateFromToTime(dateFrom)

    try {
      const snapshot = await firebase
        .firestore()
        .collection("users")
        .doc(uid)
        .collection("tasks")
        .where("date", ">=", firebase.firestore.Timestamp.fromDate(from))
        .where("repeatId", "==", repeatId)
        .get()

      snapshot.forEach(
        (doc: firebase.firestore.QueryDocumentSnapshot): void => {
          if (doc !== undefined) {
            // 念のために開始していないものだけを削除
            if (doc.data().startTime == undefined) {
              batch.delete(doc.ref)
            }
          }
        },
      )
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error(`削除エラー repeatId=${repeatId}`, e)
    }

    batch.commit().catch((error: Error) => {
      // tslint:disable-next-line:no-console
      console.error(`Write repeat error! repeat id = ${repeatId}`, error)
    })
  }

  /**
   * リピートを保存する
   * リピートは更新はせずに毎回削除&追加の動作
   * 新しいリピート設定にundefinedを指定すると古いリピートの削除のみ行われ新しいリピートが作られない。結果リピート設定の削除になる。
   * @param uid
   * @param repeat 新しいリピート設定
   * @param oldRepeat 古いリピート設定
   */
  public static saveRepeat(
    uid: string,
    repeat: Repeat | undefined,
    oldRepeat: Repeat | undefined,
  ): void {
    const batch: firebase.firestore.WriteBatch = firebase.firestore().batch()

    let newId: string = "Non New Rpeat"
    if (repeat !== undefined) {
      newId = repeat.id
      const newRef: firebase.firestore.DocumentReference = firebase
        .firestore()
        .collection("users")
        .doc(uid)
        .collection("repeats")
        .doc(repeat.id)
      batch.set(newRef, this.getRepeatLiteral(repeat))
    }

    let oldId: string = "Non Old Repeat"
    if (oldRepeat !== undefined) {
      oldId = oldRepeat.id
      const oldRef: firebase.firestore.DocumentReference = firebase
        .firestore()
        .collection("users")
        .doc(uid)
        .collection("repeats")
        .doc(oldRepeat.id)
      batch.delete(oldRef)
    }

    batch.commit().catch((error: Error) => {
      // tslint:disable-next-line:no-console
      console.error(
        `Write repeat error! repeat id = ${newId} delete repeat id = ${oldId}`,
        error,
      )
    })
  }

  /**
   * 指定されたIDのリピート情報を取得して返す
   * 該当のIDのリピート情報が存在しない場合はidを空にしたオブジェクトを返す
   * @param uid
   * @param repeatId
   */
  public static async loadRepeat(
    uid: string,
    repeatId: string,
  ): Promise<Repeat> {
    if (uid === "") {
      throw new Error("uid is empty!")
    }
    const doc = await firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("repeats")
      .doc(repeatId)
      .get()

    let repeat: Repeat = new Repeat()
    const data: firebase.firestore.DocumentData | undefined = doc.data()
    try {
      repeat = this.converToRepeat(data)
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.error(`load repeat error repeat id=${repeatId}`, error)
    }
    return repeat
  }

  /**
   * FirestoreのタイムスタンプからDateに変換
   * FirestoreからUndefinedを取得した場合はUndefinedで返す(つまり空も許容)
   * @param date 日付オブジェクト
   */
  public static toDateUndefinable(
    date: firebase.firestore.Timestamp | undefined,
  ): Date | undefined {
    if (date == undefined) {
      return undefined
    } else {
      return date.toDate()
    }
  }

  /**
   * FirestoreのタイムスタンプからDateに変換2
   * こちらはFirestoreからUndefineを取得した場合は今日の日付のオブジェクトを返す
   * 定義されていることが確実だったり、初期で今日の日付になっていて良いならこちらを使う
   * 逆にUndefineの時に特殊処理をしたければtoDateUndefinableを使って戻り値によって適切に処理を行う
   * @param date 日付オブジェクト
   */
  public static toDate(date: firebase.firestore.Timestamp | undefined): Date {
    if (date == undefined) {
      return new Date()
    } else {
      return date.toDate()
    }
  }

  /**
   * undefinedの場合は空文字を返す マイグレーション用
   * @param value
   */
  public static toString(value: string | undefined): string {
    if (value === undefined) {
      // ここにひっかかるということはキー名を間違っているか、古いデータで項目がない
      return ""
    } else {
      return value
    }
  }

  public static toNumber(value: string | undefined): number {
    if (value === undefined) {
      // ここにひっかかるということはキー名を間違っているか、古いデータで項目がない
      return 0
    } else {
      return parseInt(value, 10)
    }
  }

  public static toBoolean(value: boolean | undefined): boolean {
    if (value === undefined) {
      // ここにひっかかるということはキー名を間違っているか、古いデータで項目がない
      return false
    } else {
      return value
    }
  }

  /**
   * 指定した日のタスクを読み込むクエリを生成する(論理削除済みタスクも読み込む)
   * @param uid ユーザーid
   * @param date 取込対象日付
   */
  private static getDeletedQuery(
    uid: string,
    date: Date,
  ): firebase.firestore.Query {
    // とりあえず今は一日の区切りを0時としてfrom,toを作る
    // 新たにnewしてセットしないと参照が書き換わるだけでendがおかしくなる
    const { from, to } = DateUtil.getDateFromToTime(date)

    return firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("tasks")
      .where("date", ">=", firebase.firestore.Timestamp.fromDate(from))
      .where("date", "<", firebase.firestore.Timestamp.fromDate(to))
  }

  /**
   * Firestore保存用にオブジェクトリテラルを作成する
   * @param task
   */
  private static getTaskLiteral(task: Task): ITask {
    const literal: ITask = {
      id: task.id,
      date: firebase.firestore.Timestamp.fromDate(task.date),
      title: task.title,
      isDoing: task.isDoing,
      // tslint:disable-next-line:no-null-keyword
      startTime: null,
      // tslint:disable-next-line:no-null-keyword
      endTime: null,
      estimateTime: task.estimateTime,
      actualTime: task.actualTime,
      repeatId: task.repeatId,
      isDeleted: task.isDeleted,
      estimateSeparateStart: task.estimateSeparateStart,
      estimateSeparateEnd: task.estimateSeparateEnd,
      createTime: firebase.firestore.Timestamp.fromDate(task.createTime),
      updateTime: firebase.firestore.Timestamp.fromDate(task.updateTime),
      note: task.note,
    }
    if (task.startTime != undefined) {
      literal.startTime = firebase.firestore.Timestamp.fromDate(task.startTime)
    } else {
      // tslint:disable-next-line:no-null-keyword
      literal.startTime = null
    }
    if (task.endTime != undefined) {
      literal.endTime = firebase.firestore.Timestamp.fromDate(task.endTime)
    } else {
      // tslint:disable-next-line:no-null-keyword
      literal.endTime = null
    }

    return literal
  }

  private static converToTask(data: firebase.firestore.DocumentData): Task {
    const task = new Task(data.date.toDate(), data.title)
    task.id = data.id
    task.startTime = this.toDateUndefinable(data.startTime)
    task.endTime = this.toDateUndefinable(data.endTime)
    task.estimateTime = data.estimateTime
    task.isDoing = data.isDoing
    task.repeatId = this.toString(data.repeatId)
    task.isDeleted = this.toBoolean(data.isDeleted)
    task.estimateSeparateStart = this.toBoolean(data.estimateSeparateStart)
    task.estimateSeparateEnd = this.toBoolean(data.estimateSeparateEnd)
    task.createTime = this.toDate(data.createTime)
    task.updateTime = this.toDate(data.updateTime)
    task.note = this.toString(data.note)
    return task
  }

  /**
   * 渡されたFirestoreの情報をRepeatオブジェクトに入れて返す
   * 注意 Firestoreから情報が取得できていない場合は、idが空のオブジェクトを返す
   * @param data
   */
  private static converToRepeat(
    data: firebase.firestore.DocumentData | undefined,
  ): Repeat {
    const repeat: Repeat = new Repeat()
    if (data !== undefined) {
      repeat.id = this.toString(data.id)
      repeat.title = this.toString(data.title)
      repeat.from = this.toDate(data.from)
      repeat.day = data.day
      repeat.estimateTime = this.toNumber(data.estimateTime)
      const section: Date | undefined = this.toDateUndefinable(data.section)
      if (section == undefined) {
        repeat.section = DateUtil.getMinDate()
      } else {
        repeat.section = section
      }
      repeat.estimateSeparateStart = this.toBoolean(data.estimateSeparateStart)
      repeat.estimateSeparateEnd = this.toBoolean(data.estimateSeparateEnd)
      repeat.note = this.toString(data.note)
    } else {
      // 仕様上存在しないrepeatIdが来ることもあるのでエラーとしないが、それを検知して処理するために空のidのRepeatを返す
      repeat.id = ""
    }
    return repeat
  }

  private static getRepeatLiteral(repeat: Repeat): object {
    return {
      id: repeat.id,
      title: repeat.title,
      from: repeat.from,
      day: repeat.day,
      estimateTime: repeat.estimateTime,
      section: repeat.section,
      estimateSeparateStart: repeat.estimateSeparateStart,
      estimateSeparateEnd: repeat.estimateSeparateEnd,
      note: repeat.note,
    }
  }
}
