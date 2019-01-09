import firebase, { firestore } from 'firebase';
import Section from '@/lib/Section';

export default class SectionUtil {
  public static async set(uid: string, section: Section): Promise<void> {
    // 保存時にTaskオブジェクトのupdateTimeも更新
    section.updateTime = new Date();
    firebase.firestore().collection('users').doc(uid)
    .collection('sections').doc(section.id).set(this.getLiteral(section));
  }
  public static delete(uid: string, section: Section): void {
    firebase.firestore().collection('users').doc(uid)
    .collection('sections').doc(section.id).delete()
    .catch((error: Error) => {
        // tslint:disable-next-line:no-console
        console.error(`Delete Section error! Section id=${section.id}`, error);
    });

  }
  private static getLiteral(section: Section): object {
    return {
        id: section.id,
        title: section.title,
        startTime: section.startTime,
        createTime: section.createTime,
        updateTime: section.updateTime,
    };
  }
}
