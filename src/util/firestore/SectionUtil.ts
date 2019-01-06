import firebase, { firestore } from 'firebase';
import Section from '@/lib/Section';

export default class SectionUtil {
  public static async set(uid: string, section: Section): Promise<void> {
    // 保存時にTaskオブジェクトのupdateTimeも更新
    section.updateTime = new Date();
    firebase.firestore().collection('users').doc(uid)
    .collection('sections').doc(section.id).set(this.getLiteral(section));
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
