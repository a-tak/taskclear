import Vue from "vue"
import Vuetify from "vuetify"

import TaskEdit from "@/components/TaskEdit.vue"
import Task from "@/lib/Task"
import Store from "@/store/Store"

import { mount, createLocalVue, Wrapper, MountOptions } from "@vue/test-utils"

Vue.use(Vuetify)
const localVue = createLocalVue()


describe("TaskEdit.vue", () => {
  let vuetify: typeof Vuetify

  const task: Task = new Task(new Date("2018-12-06 10:12:43"), "テストタスク")

  beforeEach(() => {
    vuetify = new Vuetify({
      breakpoint: {
        mobileBreakpoint: "md"
      }
    })
  })

  it("タイトルでescキーでキャンセルしてキャンセルイベントが発生するか?", () => {
    const wrapper = mount(TaskEdit, {
      localVue,
      vuetify,
      store: Store,
      propsData: {
        task_: task,
      },
    })
    const txtField = wrapper.find("#task-edit-title-field-" + task.id)
    txtField.trigger("keyup.esc")
    expect(wrapper.emitted("endEditEvent")).toBeTruthy()
    expect(wrapper.emitted("end-edit-task-name-event")).toBeTruthy()
  })

  it("開始時間のINPUTフィールドがあるか?", () => {
    const wrapper = mount(TaskEdit, {
      localVue,
      vuetify,
      store: Store,
      propsData: {
        task_: task,
      },
    })
    const txtField = wrapper.find("#task-edit-start-field-" + task.id)
    expect(txtField.element.tagName).toBe("INPUT")
  })

  it("開始時間でescキーでキャンセルしてキャンセルイベントが発生するか?", () => {
    const wrapper = mount(TaskEdit, {
      localVue,
      vuetify,
      store: Store,
      propsData: {
        task_: task,
      },
    })
    const txtField = wrapper.find("#task-edit-start-field-" + task.id)
    txtField.trigger("keyup.esc")
    expect(wrapper.emitted("endEditEvent")).toBeTruthy()
    expect(wrapper.emitted("end-edit-task-name-event")).toBeTruthy()
  })

  it("終了時間でescキーでキャンセルしてキャンセルイベントが発生するか?", () => {
    const wrapper = mount(TaskEdit, {
      localVue,
      vuetify,
      store: Store,
      propsData: {
        task_: task,
      },
    })
    const txtField = wrapper.find("#task-edit-end-field-" + task.id)
    txtField.trigger("keyup.esc")
    expect(wrapper.emitted("endEditEvent")).toBeTruthy()
    expect(wrapper.emitted("end-edit-task-name-event")).toBeTruthy()
  })

  it("見積時間でescキーでキャンセルしてキャンセルイベントが発生するか?", () => {
    const wrapper = mount(TaskEdit, {
      localVue,
      vuetify,
      store: Store,
      propsData: {
        task_: task,
      },
    })
    const txtField = wrapper.find("#task-edit-estimate-field-" + task.id)
    txtField.trigger("keyup.esc")
    expect(wrapper.emitted("endEditEvent")).toBeTruthy()
    expect(wrapper.emitted("end-edit-task-name-event")).toBeTruthy()
  })

  it("予定時間帯でescキーでキャンセルしてキャンセルイベントが発生するか?", () => {
    const wrapper = mount(TaskEdit, {
      localVue,
      vuetify,
      store: Store,
      propsData: {
        task_: task,
      },
    })
    const txtField = wrapper.find("#task-edit-section-field-" + task.id)
    txtField.trigger("keyup.esc")
    expect(wrapper.emitted("endEditEvent")).toBeTruthy()
    expect(wrapper.emitted("end-edit-task-name-event")).toBeTruthy()
  })

  it("ソート順でescキーでキャンセルしてキャンセルイベントが発生するか?", () => {
    const wrapper = mount(TaskEdit, {
      localVue,
      vuetify,
      store: Store,
      propsData: {
        task_: task,
      },
    })
    const txtField = wrapper.find("#task-edit-sortno-field-" + task.id)
    txtField.trigger("keyup.esc")
    expect(wrapper.emitted("endEditEvent")).toBeTruthy()
    expect(wrapper.emitted("end-edit-task-name-event")).toBeTruthy()
  })

})

