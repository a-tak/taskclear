import Section from '@/lib/Section';
import fs from '@/util/firestore/SectionUtil';
import Store from '@/store/Store';

export interface State {
  list: Section[];
  user: firebase.User;
}

/**
 * セクション管理ストア
 * 取得はまとめて、追加削除は一行ずつという方針
 */
export default {
  namespaced: true,
  state: {
    list: [],
  },
  getters: {
    // わざわざディープコピーしているのは参照先で変更されない為
    // こうするしかない?
    sections(state: State) {
      const list: Section[] = [];
      for (const section of state.list) {
        list.push(section.clone());
      }
      return list;
      },
  },
  mutations: {
    // 結局ここで参照渡しているからここでもディープコピーセットしないと変更できちゃうんだよな
    set(state: State, section: Section) {
      // Firestoreに書き込み
      fs.set(Store.getters['taskList/user'].uid, section);
    },
  },
  actions: {
    // { commit }はオブジェクトを分割代入でうけとる引数の書き方
    // TypeScriptの型指定として「: {commit: (arg1: string, arg2: Section) => void }」という関数型の定義をしてしないとコンパイルできない😢
    set({ commit }: {commit: (arg1: string, arg2: Section) => void }, section: Section) {
      commit('set', section);
    },
  },
};



