import Section from '@/lib/Section'
import SectionConnector from '@/lib/SectionConnector'
import Store from '@/store/Store'
import DateUtil from '@/util/DateUtil'

const con: SectionConnector = new SectionConnector()

export interface State {
  list: Section[]
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
        return state.list
      },
  },
  mutations: {
    clear(state: State) {
      state.list = []
    },
    add(state: State, section: Section) {
      state.list.push(section)
    },
    delete(state: State, section: Section) {
      // ここで渡ってくるSectionオブジェクトは新規に作成されたものでメモリにあるものと別。indexOfでは探せない
      const index = state.list.findIndex((item) => item.id === section.id)
      state.list.splice(index, 1)
    },
    sort(state: State) {
      state.list.sort((a: Section, b: Section): number => {
        if (a.startTime == undefined) {
          return 1
        } else if (b.startTime == undefined) {
            return -1
        } else {
            return a.startTime.getTime() - b.startTime.getTime()
        }
      })
    },
  },
  actions: {
    startListner({ commit }: {commit: (name: string, payload?: Section) => void }): void {
      // ドキュメントの各変更に対応する処理
      const addedFunc: ((section: Section) => void) = (section: Section) => {
        commit('add', section)
      }
      const modifiedFunc: ((section: Section) => void) = (section: Section) => {
        // ソートするので一旦削除して追加するやり方でいく
        commit('delete', section)
        commit('add', section)
        commit('sort')
      }
      const removedFunc: ((section: Section) => void) = (section: Section) => {
        commit('delete', section)
      }

      commit('clear')
      // リスナースタート
      con.startListener(Store.getters['taskList/user'].uid, addedFunc, modifiedFunc, removedFunc)
    },
    stopListner({ commit }: {commit: (arg1: string, arg2: Section) => void }, section: Section) {
      con.stopListener()
    },
    // { commit }はオブジェクトを分割代入でうけとる引数の書き方
    // TypeScriptの型指定として「: {commit: (arg1: string, arg2: Section) => void }」という関数型の定義をしてしないとコンパイルできない😢
    set({ commit }: {commit: (arg1: string, arg2: Section) => void }, section: Section) {
      // Firestoreに書き込み
      con.set(Store.getters['taskList/user'].uid, section)
    },
    async delete({ commit }: {commit: (arg1: string, arg2: Section) => void }, section: Section) {
      await con.delete(Store.getters['taskList/user'].uid, section)
    },
    setFirst({ dispatch, commit, state }: {dispatch: (arg1: string, arg2: Section) => void ,
                                           commit: (arg1: string, arg2: Section) => void ,
                                           state: State },
             firstSection: Section) {
      // 一日の区切りとなるセクションは1990-01-01をセット
      firstSection.startTime = DateUtil.clearDate(firstSection.startTime)
      dispatch('set', firstSection)

      for (const section of state.list) {
        // 日付部分は一旦クリアする
        section.startTime = DateUtil.clearDate(section.startTime)
        if ( section.startTime < firstSection.startTime ) {
          // 一日の区切りのセクションより前の時間であれば次の日のセクションであると見なす
          section.startTime.setDate(2)
        }
        dispatch('set', section)
      }
    },
  },
}



