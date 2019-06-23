import Store from '@/store/Store'
import Section from '@/lib/Section';

export default class StoreUtil {
  public static getSectionList(): Section[] {
    return Store.getters['section/sections']
  }
}
