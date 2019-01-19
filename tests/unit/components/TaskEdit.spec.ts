import { shallowMount, Wrapper, mount } from '@vue/test-utils';
import TaskEdit from '@/components/TaskEdit.vue';
import Vue from 'vue';
import Vuetify from 'vuetify';
import Task from '@/lib/Task';

Vue.use(Vuetify);
Vue.config.silent = true;

describe('TaskEdit.vue', () => {


  const task: Task = new Task(new Date('2018-12-06 10:12:43'), 'テストタスク');
  let wrapper: Wrapper<TaskEdit>;
  let cancelStub: () => {};

  beforeEach(() => {
    wrapper = mount(TaskEdit, {
      mocks: {
        $vuetify: { breakpoint: {} },
      },
      propsData: {
        task_: task,
      },
    });

    cancelStub = jest.fn();

  });

  it('イベント発生確認', () => {
    wrapper.vm.$emit('endEditEvent');
    expect(wrapper.emitted().endEditEvent).toBeTruthy();
  });

  it('キャンセル押下確認', () => {
    wrapper.setMethods( { cancel: cancelStub});
    const cancelBtn = wrapper.find('#task-edit-cancelbtn-' + task.id);
    cancelBtn.trigger('click');
    expect(cancelStub).toHaveBeenCalled();
  });

  it('escでキャンセル タイトル', () => {
    wrapper.setMethods( { cancel: cancelStub});
    const txtField = wrapper.find('#task-edit-title-field-' + task.id);
    txtField.trigger('keyup.esc');
    expect(cancelStub).toHaveBeenCalled();
  });

  it('開始時間のINPUTフィールドがあるか?', () => {
    const txtField = wrapper.find('#task-edit-start-field-' + task.id);
    expect(txtField.element.tagName).toBe('INPUT');
  });

  it('escでキャンセル 開始時間', () => {
    wrapper.setMethods( { cancel: cancelStub});
    const txtField = wrapper.find('#task-edit-start-field-' + task.id);
    txtField.trigger('keyup.esc');
    expect(cancelStub).toHaveBeenCalled();
  });

  it('escでキャンセル 終了時間', () => {
    wrapper.setMethods( { cancel: cancelStub});
    const txtField = wrapper.find('#task-edit-end-field-' + task.id);
    txtField.trigger('keyup.esc');
    expect(cancelStub).toHaveBeenCalled();
  });

  it('escでキャンセル 見積時間', () => {
    wrapper.setMethods( { cancel: cancelStub});
    const txtField = wrapper.find('#task-edit-estimate-field-' + task.id);
    txtField.trigger('keyup.esc');
    expect(cancelStub).toHaveBeenCalled();
  });

  it('escでキャンセル 予定時間帯', () => {
    wrapper.setMethods( { cancel: cancelStub});
    const txtField = wrapper.find('#task-edit-section-field-' + task.id);
    txtField.trigger('keyup.esc');
    expect(cancelStub).toHaveBeenCalled();
  });

  it('escでキャンセル ソート順', () => {
    wrapper.setMethods( { cancel: cancelStub});
    const txtField = wrapper.find('#task-edit-sortno-field-' + task.id);
    txtField.trigger('keyup.esc');
    expect(cancelStub).toHaveBeenCalled();
  });

});

