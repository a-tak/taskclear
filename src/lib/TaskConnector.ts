import firebase from "firebase/app"
import Task from "@/lib/Task"
import fsUtil from "@/util/FirestoreUtil"
import DateUtil from "@/util/DateUtil"

/**
 * セクションのFirebase操作を担うクラス
 * SectionStoreに全部まとめても良かったが、VuexのクラスをTypeScriptのクラス形式が書く方法が確立できていないので、
 * なるべくロジックは外に出すようにした。
 */
export default class TaskConnector {
  // リスナー破棄用のコールバック保持変数
  private unscribe_: (() => void) | undefined = undefined;

  /**
   * Firestoreのスナップショットリッスンを開始する
   * @param uid
   * @param addFunc Firestoreに項目が追加されたときに呼び出す関数。以下いずれもSectionオブジェクトが引数で渡る。
   * @param modifiedFunc Firestoreに項目が更新されたときに呼び出す関数
   * @param removedFunc Firestoreに項目が削除されたときに呼び出す関数
   */
  public async startListener(
    uid: string,
    date: Date,
    addedFunc: (task: Task) => void,
    modifiedFunc: (task: Task) => void,
    removedFunc: (task: Task) => void
  ): Promise<void> {
    // 既に接続していたら一旦切る
    if (this.unscribe_ != undefined) {
      // tslint:disable-next-line:no-console
      console.warn(`listener aleady running. ${this.unscribe_}`);
      this.unscribe_();
      this.unscribe_ = undefined;
    }

    // データ検索
    this.unscribe_ = this.getQuery(uid, date).onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(
        (change: firebase.firestore.DocumentChange) => {
          let task: Task;
          const firedoc:
            | firebase.firestore.DocumentData
            | undefined = change.doc.data();
          if (firedoc != undefined) {
            task = this.convertClass(firedoc);
            // データ変更時に呼び出す関数群
            if (change.type === "added") {
              addedFunc(task);
            } else if (change.type === "modified") {
              modifiedFunc(task);
            } else if (change.type === "removed") {
              removedFunc(task);
            }
          }
        },
        (error: Error) => {
          // tslint:disable-next-line:no-console
          console.error(`Section Read Error! ${error.name}`);
        }
      );
    });
  }

  public async stopListener() {
    if (this.unscribe_ != undefined) {
      this.unscribe_();
      this.unscribe_ = undefined;
    }
  }

  public async set(uid: string, section: Task): Promise<void> {
    // 保存時にTaskオブジェクトのupdateTimeも更新
    section.updateTime = new Date();
    firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("sections")
      .doc(section.id)
      .set(this.converLiteral(section));
  }
  public async delete(uid: string, section: Task): Promise<void> {
    try {
      await firebase
        .firestore()
        .collection("users")
        .doc(uid)
        .collection("sections")
        .doc(section.id)
        .delete();
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.error(`Delete Section error! Section id=${section.id}`, error);
    }
  }

  private getQuery(uid: string, date: Date): firebase.firestore.Query {
    const { from, to } = DateUtil.getDateFromToTime(date);

    return firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .collection("tasks")
      .where("date", ">=", firebase.firestore.Timestamp.fromDate(from))
      .where("date", "<", firebase.firestore.Timestamp.fromDate(to))
      .where("isDeleted", "==", false);
  }

  private converLiteral(section: Task): object {
    return {
      id: section.id,
      title: section.title,
      startTime: section.startTime,
      createTime: section.createTime,
      updateTime: section.updateTime,
    };
  }

  private convertClass(data: firebase.firestore.DocumentData): Task {
    const task = new Task(data.date.toDate(), data.title);
    task.id = data.id;
    task.startTime = fsUtil.toDateUndefinable(data.startTime);
    task.endTime = fsUtil.toDateUndefinable(data.endTime);
    task.estimateTime = data.estimateTime;
    task.isDoing = data.isDoing;
    task.repeatId = fsUtil.toString(data.repeatId);
    task.sortNo = fsUtil.toNumber(data.sortNo);
    task.isDeleted = fsUtil.toBoolean(data.isDeleted);
    task.needSave = false;
    task.estimateSeparateStart = fsUtil.toBoolean(data.estimateSeparateStart);
    task.estimateSeparateEnd = fsUtil.toBoolean(data.estimateSeparateEnd);
    task.createTime = fsUtil.toDate(data.createTime);
    task.updateTime = fsUtil.toDate(data.updateTime);
    task.note = fsUtil.toString(data.note);
    return task;
  }
}
