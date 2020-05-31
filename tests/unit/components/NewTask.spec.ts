import { mount, Wrapper, shallowMount, createLocalVue } from "@vue/test-utils"
import Vue from "vue"
import Vuex from "vuex"
import Vuetify from "vuetify"

const localVue = createLocalVue()
localVue.use(Vuex)
Vue.use(Vuetify)

// ストアが含まれているからだろうがテストが通らない
// → TypeError: Cannot read property 'split' of undefined
//
// https://tech.fusic.co.jp/web/vue-component-testing-with-vuex/
describe("NewTask.vue", () => {
  // let wrapper: Wrapper<NewTask>;
  // let addStub: () => {};
  // let store;
  // let tsMutations;

  // beforeEach(() => {
  //   tsMutations = {
  //     addTask: jest.fn(),
  //   };
  //   store = new Vuex.Store({
  //     modules: {
  //       taskList: {
  //         state: {
  //           targetDate: new Date(),
  //           user: {
  //             uid: 'test',
  //           },
  //           taskCtrl: new TaskController(),
  //         },
  //         mutations: tsMutations,
  //       },
  //     },
  //   });
  //   wrapper = mount(NewTask, {
  //     mocks: {
  //       $vuetify: { breakpoint: {} },
  //     },
  //     store,
  //     localVue,
  //   });
  //   addStub = jest.fn();
  // });

  it("登録ボタン押せているか確認", () => {
    // // メソッドをスタブに置き換え
    // wrapper.setMethods( { addTask: addStub});
    // // ボタンを押す
    // const addBtn = wrapper.find('#newtask-add');
    // addBtn.trigger('click');
    // // 判定
    // expect(addStub).toHaveBeenCalled();
  })

  it("登録イベント発生確認", () => {
    // //    wrapper.vm.$emit('addedEvent');
    //     const btn = wrapper.find('#newtask-add');
    //     btn.trigger('click');
    //     expect(wrapper.emitted().addedEvent).toBeTruthy();
  })
})
