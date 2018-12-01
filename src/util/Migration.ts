import firebase, { firestore } from 'firebase';

export default class Migration {
    public static async run(uid: string): Promise<void> {

        const doc = await firebase
            .firestore()
            .collection('users')
            .doc(uid)
            .collection('version')
            .doc('task-is-deleted-flag')
            .get();
        const data: firestore.DocumentData | undefined = doc.data();
        if (data === undefined) {
            // isDeletedフラグ追加実施
            await this.migrationIsDeletedAdd(uid);
        }

        return;
    }

    /**
     * タスクにisDeletedフラグがないDBバージョンなので追加する
     * @param uid ユーザーid
     */
    private static async migrationIsDeletedAdd(uid: string): Promise<void> {
        const batch: firestore.WriteBatch = firestore().batch();

        firebase
        .firestore()
        .collection('users')
        .doc(uid)
        .collection('tasks')
        .get()
        .then((querySnapshot): void => {
            querySnapshot.forEach((doc: firestore.QueryDocumentSnapshot): void => {
                batch.update(doc.ref, {isDeleted: false});
            });
            batch.commit().then((): void => {
                firebase
                .firestore()
                .collection('users')
                .doc(uid)
                .collection('version')
                .doc('task-is-deleted-flag')
                .set({done: true});
                });
        });


    }
}

