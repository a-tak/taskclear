import firebase, { firestore } from 'firebase';
import Section from '@/lib/Section';
import fsUtil from '@/util/FirestoreUtil';

/**
 * セクションのFirebase操作を担うクラス
 * SectionStoreに全部まとめても良かったが、VuexのクラスをTypeScriptのクラス形式が書く方法が確立できていないので、
 * なるべくロジックは外に出すようにした。
 */
export default class SectionConnector {

  // リスナー破棄用のコールバック保持変数
  private unscribe_: (() => void) | undefined = undefined;

  /**
   * Firestoreのスナップショットリッスンを開始する
   * @param uid
   * @param addFunc Firestoreに項目が追加されたときに呼び出す関数。以下いずれもSectionオブジェクトが引数で渡る。
   * @param modifiedFunc Firestoreに項目が更新されたときに呼び出す関数
   * @param removedFunc Firestoreに項目が削除されたときに呼び出す関数
   */
  public async startListener(uid: string,
                             addedFunc: (section: Section) => void,
                             modifiedFunc: (section: Section) => void,
                             removedFunc: (section: Section) => void): Promise<void> {
    // 既に接続していたら一旦切る
    if (this.unscribe_ != undefined) {
      // tslint:disable-next-line:no-console
      console.warn(`listener aleady running. ${this.unscribe_}`)
      this.unscribe_()
      this.unscribe_ = undefined
    }

    // データ検索
    this.unscribe_ = firestore()
                    .collection('users')
                    .doc(uid)
                    .collection('sections')
                    .orderBy('startTime', 'asc')
                    .onSnapshot((snapshot) => {
                      snapshot.docChanges().forEach((change: firestore.DocumentChange) => {
                        let section: Section;
                        const firedoc: firebase.firestore.DocumentData | undefined  = change.doc.data();
                        if (firedoc != undefined) {
                          section = this.convertClass(firedoc);
                          // データ変更時に呼び出す関数群
                          if (change.type === 'added') {
                            addedFunc(section)
                          } else if (change.type === 'modified') {
                            modifiedFunc(section)
                          } else if (change.type === 'removed') {
                            removedFunc(section)
                          }
                        }
                      },
                      (error: Error) => {
                        // tslint:disable-next-line:no-console
                        console.error(`Section Read Error! ${error.name}`)
                      })
                    })
  }

  public async stopListener() {
    if (this.unscribe_ != undefined) {
      this.unscribe_()
      this.unscribe_ = undefined
    }
  }

  public async set(uid: string, section: Section): Promise<void> {
    // 保存時にTaskオブジェクトのupdateTimeも更新
    section.updateTime = new Date()
    firebase.firestore().collection('users').doc(uid)
    .collection('sections').doc(section.id).set(this.converLiteral(section))
  }
  public delete(uid: string, section: Section): void {
    firebase.firestore().collection('users').doc(uid)
    .collection('sections').doc(section.id).delete()
    .catch((error: Error) => {
        // tslint:disable-next-line:no-console
        console.error(`Delete Section error! Section id=${section.id}`, error)
    })
  }
  private converLiteral(section: Section): object {
    return {
        id: section.id,
        title: section.title,
        startTime: section.startTime,
        createTime: section.createTime,
        updateTime: section.updateTime,
    }
  }

  private convertClass(doc: firestore.DocumentData): Section {
    const section = new Section()
    section.id = doc.id;
    section.title = doc.title;
    section.startTime = fsUtil.toDate(doc.startTime);
    section.createTime = fsUtil.toDate(doc.createTime);
    section.updateTime = fsUtil.toDate(doc.updateTime);
    return section;
  }
}
