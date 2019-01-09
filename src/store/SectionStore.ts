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
    sections(state: State) {
        // あえてディープコピーではなく参照をそのまま返す
        // これにより呼び出し元コンポーネントで監視し変更があったら画面に反映ができる
        return state.list;
      },
  },
  mutations: {
    set(state: State, section: Section) {
      // Firestoreに書き込み
      fs.set(Store.getters['taskList/user'].uid, section);
    },
    delete(state: State, section: Section) {
      fs.delete(Store.getters['taskList/user'].uid, section);
    },
  },
  actions: {
    // { commit }はオブジェクトを分割代入でうけとる引数の書き方
    // TypeScriptの型指定として「: {commit: (arg1: string, arg2: Section) => void }」という関数型の定義をしてしないとコンパイルできない😢
    set({ commit }: {commit: (arg1: string, arg2: Section) => void }, section: Section) {
      commit('set', section);
    },
    delete({ commit }: {commit: (arg1: string, arg2: Section) => void }, section: Section) {
      commit('delete', section);
    },
  },
};



