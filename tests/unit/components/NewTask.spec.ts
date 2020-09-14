import Vue from "vue"
import Vuetify from "vuetify"
import Vuex, { ActionTree, mapGetters } from "vuex"

import NewTask from "@/components/NewTask.vue"

import {
  mount,
  createLocalVue,
  Wrapper,
  MountOptions,
  ThisTypedMountOptions,
} from "@vue/test-utils"

Vue.use(Vuetify)
const localVue = createLocalVue()
localVue.use(Vuex)

jest.mock("@/util/FirestoreUtil")

describe("NewTask.vue", () => {
  let vuetify: typeof Vuetify
  let state: {}
  let actions: ActionTree<any, unknown>
  let getters: {}
  let mutations: {}

  state = {}

  actions = {}

  mutations = {
    addTask: jest.fn()
  }

  getters = {
    user: () => {
      return { uid: "test002" }
    },
  }

  const store = new Vuex.Store({
    modules: {
      taskList: {
        namespaced: true,
        state,
        actions,
        getters,
        mutations,
      },
    },
  })

  const mountFunction = (options: object) => {
    return mount(NewTask, {
      localVue,
      vuetify,
      store: store,
      ...options,
    })
  }

  beforeEach(() => {
    vuetify = new Vuetify({
      breakpoint: {
        mobileBreakpoint: "md",
      },
    })
  })

  it("タスク名未入力の場合は登録イベント発生しない", () => {
    const wrapper = mountFunction({})
    const btn = wrapper.find("#newtask-add")
    btn.trigger("click")
    expect(wrapper.emitted("addedEvent")).toBeFalsy()
  })
  it("タスク名入力済みの場合は登録イベント発生する", () => {
    const wrapper = mountFunction({})
    const txt = wrapper.find("#newtask-taskname")
    txt.setValue("テスト入力")
    const btn = wrapper.find("#newtask-add")
    btn.trigger("click")
    expect(wrapper.emitted("addedEvent")).toBeTruthy()
  })
})
