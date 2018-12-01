import firebase, { firestore } from 'firebase';
import TaskController from '../lib/TaskController';
import Task from '@/lib/Task';
import Repeat from '@/lib/Repeat';
import ITask from '@/lib/ITask';

export default class FirebaseUtil {
    public static saveTasks(uid: string, date: Date, taskctrl: TaskController): void {
        const promises: Array<Promise<void>> = [];

        const start: number = Date.now();
        for (const task of taskctrl.tasks) {
            promises.push(this.setTask(uid, task));
        }

        Promise.all(promises)
        .then((): void => {
            // tslint:disable-next-line:no-console
            console.log(`Save time ${Date.now() - start} ms `);
        }).catch((error: Error): void => {
            // tslint:disable-next-line:no-console
            console.error(`Save Error! ${Date.now() - start} ms `, error);
        });
    }

    public static async loadRepeatByDateFrom(uid: string, dateFrom: Date): Promise<Repeat[]> {

        const repeats: Repeat[] = [];

        dateFrom.setHours(0, 0, 0, 0);
        const query: firestore.QuerySnapshot = await firebase
            .firestore()
            .collection('users')
            .doc(uid)
            .collection('repeats')
            .where('from', '<=', firestore.Timestamp.fromDate(dateFrom))
            .get();

        query.forEach((doc: firestore.QueryDocumentSnapshot): void => {
            if (doc !== undefined) {
                const data: firebase.firestore.DocumentData | undefined = doc.data();
                repeats.push(this.converToRepeat(data));
            }
        });
        return repeats;
    }

    /**
     * Firestoreから一日分のタスクを読み込み
     * @param uid
     * @param date
     */
    public static async loadTasks(uid: string, date: Date): Promise<TaskController> {
        const tc = new TaskController();

        const query: firestore.QuerySnapshot = await this.getQuery(uid, date).get();

        query.forEach((doc: firestore.QueryDocumentSnapshot): void => {
            if (doc !== undefined) {
                const data: firebase.firestore.DocumentData | undefined = doc.data();
                tc.tasks.push(this.converToTask(data));
            }
        });
        return tc;
    }

    public static getQuery(uid: string, date: Date): firestore.Query {
        // とりあえず今は一日の区切りを0時としてfrom,toを作る
        // 新たにnewしてセットしないと参照が書き換わるだけでendがおかしくなる
        const from: Date = new Date(date);
        from.setHours(0, 0, 0, 0);
        const to: Date = new Date(date);
        to.setDate(date.getDate() + 1);
        to.setHours(0, 0, 0, 0);

        return firebase
            .firestore()
            .collection('users')
            .doc(uid)
            .collection('tasks')
            .where('date', '>=', firestore.Timestamp.fromDate(from))
            .where('date', '<', firestore.Timestamp.fromDate(to))
            .where('isDeleted', '==', false);
    }

    /**
     * Firestoreから削除済みタスクを含む一日分のタスクを読み込み
     * @param uid
     * @param date
     */
    public static async loadTasksIncluedDeleted(uid: string, date: Date): Promise<TaskController> {
        const tc = new TaskController();

        const query: firestore.QuerySnapshot = await this.getDeletedQuery(uid, date).get();

        query.forEach((doc: firestore.QueryDocumentSnapshot): void => {
            if (doc !== undefined) {
                const data: firebase.firestore.DocumentData | undefined = doc.data();
                tc.tasks.push(this.converToTask(data));
            }
        });
        return tc;
    }

    /**
     * タスクの論理削除
     * @param uid ユーザーid
     * @param task 論理削除対象タスク
     */
    public static logicalDeleteTask(uid: string, task: Task): void {
        task.isDeleted = true;

        this.setTask(uid, task)
        .catch((error: Error) => {
            // tslint:disable-next-line:no-console
            console.error(`Delete Task error! task id=${task.id}`, error);
        });
    }

    /**
     * タスクの物理削除
     * 今の所どこでも使っていないはず(リピート変更時のタスク削除はbatchでやっていた)
     * @param uid ユーザーid
     * @param task 物理削除対象タスク
     */
    public static physicalDeleteTask(uid: string, task: Task): void {
        firebase.firestore().collection('users').doc(uid)
        .collection('tasks').doc(task.id).delete()
        .catch((error: Error) => {
            // tslint:disable-next-line:no-console
            console.error(`Delete Task error! task id=${task.id}`, error);
        });

    }

    public static async setTask(uid: string, task: Task): Promise<void> {
        firebase.firestore().collection('users').doc(uid)
        .collection('tasks').doc(task.id).set(this.getTaskLiteral(task));
    }

    /**
     * 指定したRepeat IDのタスクを削除する
     * @param uid
     * @param repeatId
     * @param dateFrom
     */
    public static async deleteRepeatTaskById(uid: string, repeatId: string, dateFrom: Date): Promise<void> {

        const batch: firestore.WriteBatch = firestore().batch();

        try {
            const snapshot = await firebase.firestore().collection('users').doc(uid)
            .collection('tasks')
            .where('date', '>=', firestore.Timestamp.fromDate(dateFrom))
            .where('repeatId', '==', repeatId)
            .get();

            snapshot.forEach((doc: firestore.QueryDocumentSnapshot): void => {
                if (doc !== undefined) {
                    // 念のために開始していないものだけを削除
                    if (doc.data().startTime == null) {
                        batch.delete(doc.ref);
                    }
                }
            });
        } catch (e) {
            // tslint:disable-next-line:no-console
            console.error(`削除エラー repeatId=${repeatId}`, e);
        }

        batch.commit()
        .catch((error: Error) => {
            // tslint:disable-next-line:no-console
            console.error(`Write repeat error! repeat id = ${repeatId}`, error);
        });
    }

    /**
     * リピートを保存する
     * リピートは更新はせずに毎回削除&追加の動作
     * 新しいリピート設定にnullを指定すると古いリピートの削除のみ行われ新しいリピートが作られない。結果リピート設定の削除になる。
     * @param uid
     * @param repeat 新しいリピート設定
     * @param oldRepeat 古いリピート設定
     */
    public static saveRepeat(uid: string, repeat: Repeat | null, oldRepeat: Repeat | null): void {
        const batch: firestore.WriteBatch = firestore().batch();

        let newId: string = 'Non New Rpeat';
        if (repeat !== null ) {
            newId = repeat.id;
            const newRef: firestore.DocumentReference = firebase.firestore()
                .collection('users').doc(uid)
                .collection('repeats').doc(repeat.id);
            batch.set(newRef, this.getRepeatLiteral(repeat));
        }

        let oldId: string = 'Non Old Repeat';
        if (oldRepeat !== null) {
            oldId = oldRepeat.id;
            const oldRef: firestore.DocumentReference = firebase.firestore()
            .collection('users').doc(uid)
            .collection('repeats').doc(oldRepeat.id);
            batch.delete(oldRef);
        }

        batch.commit()
            .catch((error: Error) => {
                // tslint:disable-next-line:no-console
                console.error(`Write repeat error! repeat id = ${newId} delete repeat id = ${oldId}`, error);
            });

    }

    /**
     * 指定されたIDのリピート情報を取得して返す
     * 該当のIDのリピート情報が存在しない場合はidを空にしたオブジェクトを返す
     * @param uid
     * @param repeatId
     */
    public static async loadRepeat(uid: string, repeatId: string): Promise<Repeat> {
        const doc = await firebase
            .firestore()
            .collection('users')
            .doc(uid)
            .collection('repeats')
            .doc(repeatId)
            .get();

        let repeat: Repeat = new Repeat();
        const data: firestore.DocumentData | undefined = doc.data();
        try {
            repeat = this.converToRepeat(data);
        } catch (error) {
            // tslint:disable-next-line:no-console
            console.error(`load repeat error repeat id=${repeatId}`, error);
        }
        return repeat;
    }

    /**
     * 指定した日のタスクを読み込むクエリを生成する(論理削除済みタスクも読み込む)
     * @param uid ユーザーid
     * @param date 取込対象日付
     */
    private static getDeletedQuery(uid: string, date: Date): firestore.Query {
        // とりあえず今は一日の区切りを0時としてfrom,toを作る
        // 新たにnewしてセットしないと参照が書き換わるだけでendがおかしくなる
        const from: Date = new Date(date);
        from.setHours(0, 0, 0, 0);
        const to: Date = new Date(date);
        to.setDate(date.getDate() + 1);
        to.setHours(0, 0, 0, 0);

        return firebase
            .firestore()
            .collection('users')
            .doc(uid)
            .collection('tasks')
            .where('date', '>=', firestore.Timestamp.fromDate(from))
            .where('date', '<', firestore.Timestamp.fromDate(to));
    }

    /**
     * Firestore保存用にオブジェクトリテラルを作成する
     * @param task
     */
    private static getTaskLiteral(task: Task): ITask {
        const literal: ITask = {
            id: task.id,
            date: firestore.Timestamp.fromDate(task.date),
            title: task.title,
            isDoing: task.isDoing,
            startTime: null,
            endTime: null,
            estimateTime: task.estimateTime,
            actualTime: task.actualTime,
            repeatId: task.repeatId,
            sortNo: task.sortNo,
            isDeleted: task.isDeleted,
        };
        if (task.startTime != null) {
            literal.startTime = firestore.Timestamp.fromDate(task.startTime);
        } else {
            literal.startTime = null;
        }
        if (task.endTime != null) {
            literal.endTime = firestore.Timestamp.fromDate(task.endTime);
        } else {
            literal.endTime = null;
        }

        return literal;
    }

    /**
     * undefinedの場合は空文字を返す マイグレーション用
     * @param value
     */
    private static toString(value: string | undefined): string {
        if (value === undefined) {
            // ここにひっかかるということはキー名を間違っているか、古いデータで項目がない
            return '';
        } else {
            return value;
        }
    }

    private static toDate(date: firestore.Timestamp | undefined): Date | null {
        if (date === undefined || date === null) {
            return null;
        } else {
            return date.toDate();
        }
    }

    private static toNumber(value: string | undefined): number {
        if (value === undefined) {
            // ここにひっかかるということはキー名を間違っているか、古いデータで項目がない
            return 0;
        } else {
            return parseInt(value, 10);
        }
    }

    private static toBoolean(value: boolean | undefined): boolean {
        if (value === undefined) {
            // ここにひっかかるということはキー名を間違っているか、古いデータで項目がない
            return false;
        } else {
            return value;
        }
    }

    private static converToTask(data: firestore.DocumentData): Task {
        const task = new Task(data.date.toDate(), data.title);
        task.id = data.id;
        task.startTime =  this.toDate(data.startTime);
        task.endTime = this.toDate(data.endTime);
        task.estimateTime = data.estimateTime;
        task.isDoing = data.isDoing;
        task.repeatId = this.toString(data.repeatId);
        task.sortNo = this.toNumber(data.sortNo);
        task.isDeleted = this.toBoolean(data.isDeleted);
        return task;
    }

    /**
     * 渡されたFirestoreの情報をRepeatオブジェクトに入れて返す
     * 注意 Firestoreから情報が取得できていない場合は、idが空のオブジェクトを返す
     * @param data
     */
    private static converToRepeat(data: firestore.DocumentData | undefined): Repeat {
        const repeat: Repeat = new Repeat();
        if (data !== undefined) {
            repeat.id = this.toString(data.id);
            repeat.title = this.toString(data.title);
            const fromDate = this.toDate(data.from);
            if (fromDate !== null) {
                repeat.from = fromDate;
            } else {
                // repeatでfromがない場合はあり得ない
                throw new Error(`Repeat from undefined error repeatId=${data.id}`);
            }
            repeat.day = data.day;
            repeat.estimateTime = this.toNumber(data.estimateTime);
        } else {
            // 仕様上存在しないrepeatIdが来ることもあるのでエラーとしないが、それを検知して処理するために空のidのRepeatを返す
            repeat.id = '';
        }
        return repeat;
    }

    private static getRepeatLiteral(repeat: Repeat): object {
        return {
            id: repeat.id,
            title: repeat.title,
            from: repeat.from,
            day: repeat.day,
            estimateTime: repeat.estimateTime,
        };
    }
}
