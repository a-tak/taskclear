import firebase, { firestore } from 'firebase'

export default class Migration {
  public static async run(uid: string): Promise<void> {
    if (uid === '') {
      // tslint:disable-next-line:no-console
      console.error('uid is empty')
      throw new Error('uid is empty!')
    }
    const doc = await firebase
      .firestore()
      .collection('users')
      .doc(uid)
      .collection('version')
      .doc('task-is-deleted-flag')
      .get()
    const data: firestore.DocumentData | undefined = doc.data()
    if (data === undefined) {
      // isDeletedフラグ追加実施
      await this.migrationIsDeletedAdd(uid)
    }

    return
  }

  /**
   * タスクにisDeletedフラグがないDBバージョンなので追加する
   * @param uid ユーザーid
   */
  private static async migrationIsDeletedAdd(uid: string): Promise<void> {
    let batch: firestore.WriteBatch = firestore().batch()

    const querySnapshot: firestore.QuerySnapshot =
      await firebase
        .firestore()
        .collection('users')
        .doc(uid)
        .collection('tasks')
        .get()

    let count = 0
    querySnapshot.forEach((async (doc: firestore.QueryDocumentSnapshot): Promise<void> => {
      const data: firebase.firestore.DocumentData | undefined = doc.data()
      if (data.isDeleted === undefined) {
        count++
        if (count > 500) {
          try {
            await batch.commit()
          } catch (e) {
            // tslint:disable-next-line:no-console
            console.error('is Deleted Flag Write Error!', e)
          }
          batch = firestore().batch()
          // カウンターリセット
          count = 0
        }
        batch.update(doc.ref, { isDeleted: false })
      }
    }))

    if (count > 0) {
      try {
        await batch.commit()
      } catch (e) {
        // tslint:disable-next-line:no-console
        console.error('is Deleted Flag Write Last Error!', e)
      }
    }
    // DBバージョン情報書き込み
    try {
      await firebase
        .firestore()
        .collection('users')
        .doc(uid)
        .collection('version')
        .doc('task-is-deleted-flag')
        .set({ done: true })
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.error('DB Version Write Error!', e)
    }
  }
}

