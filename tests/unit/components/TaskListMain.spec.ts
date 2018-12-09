import { Wrapper, mount, createLocalVue } from '@vue/test-utils';
import TaskListMain from '@/components/TaskListMain.vue';
import Vue from 'vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);
Vue.config.silent = true;

describe('TaskListMain.vueテスト', () => {

  // let wrapper: Wrapper<TaskListMain>;
  // let clickStub: () => {};

  // beforeEach(() => {
  //   wrapper = mount(TaskListMain, {
  //     mocks: {
  //       $vuetify: { breakpoint: {} },
  //       $store: { getters: {}},
  //       NewTask: {},
  //     },
  //     });
  //   clickStub = jest.fn();
  // });

  it('helpクリック', () => {
  //   wrapper.setMethods( { help: clickStub});
  //   const moreIcon = wrapper.find('#more');
  //   moreIcon.trigger('click');
  //   const txtField = wrapper.find('#help');
  //   txtField.trigger('click');
  //   expect(clickStub).toHaveBeenCalled();
  });
});
