import Vue from "vue"
import Vuetify from "vuetify"
import Vuex from "vuex"

import NewTask from "@/components/TaskEdit.vue"
import TaskListStore from "@/store/TaskListStore"

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

// ストアが含まれているからだろうがテストが通らない
// → TypeError: Cannot read property 'split' of undefined
//
// https://tech.fusic.co.jp/web/vue-component-testing-with-vuex/


describe("NewTask.vue", () => {
//   let vuetify: typeof Vuetify
//   let state: {}
//   let actions: {}

//   state = {
//     taskCtrl: undefined,
//     user: undefined,
//     targetDate: new Date(),

//   }
//   actions = {
//     addTask: jest.fn()
//   }

//   const store = new Vuex.Store({
//     modules: {
//       taskList: {
//         state,
//         actions,
//         getters: TaskListStore.getters
//       }
//     }
//   })
  
//   const mountFunction = (options: object) => {
//     return mount(NewTask, {
//       localVue,
//       vuetify,
//       store: store,
//       ...options,
//     })
//   }

//   beforeEach(() => {
//     vuetify = new Vuetify({
//       breakpoint: {
//         mobileBreakpoint: "md",
//       },
//     })
//   })

//   it("登録イベント発生確認", () => {
//     const wrapper = mountFunction({})
//         const btn = wrapper.find('#newtask-add');
//         btn.trigger('click');
//     expect(wrapper.emitted("addedEvent")).toBeTruthy()

//   })
})
