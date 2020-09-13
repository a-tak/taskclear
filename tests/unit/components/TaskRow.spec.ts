import Vue from "vue"
import Vuetify from "vuetify"

import TaskRow from "@/components/TaskRow.vue"
import Task from "@/lib/Task"

import {
  mount,
  createLocalVue,
  Wrapper,
  MountOptions,
  ThisTypedMountOptions,
} from "@vue/test-utils"

Vue.use(Vuetify)
const localVue = createLocalVue()

describe("TaskRow.vue", () => {
  let vuetify: typeof Vuetify

  const mountFunction = (options: object) => {
    return mount(TaskRow, {
      localVue,
      vuetify,
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

  it("propsが渡るか?", () => {
    const task = new Task(new Date(), "Unitテスト")
    const wrapper = mountFunction({
      propsData: { task_: task, index_: 1 },
    })
    expect(wrapper.props().index_).toBe(1)
    expect(wrapper.props().task_.title).toBe(task.title)
  })

  it("渡したtaskが表示されるか?", () => {
    const task = new Task(new Date(), "Unitテスト2")
    task.startTime = new Date("2018-01-01 10:52:00")
    const wrapper = mountFunction({
      propsData: { task_: task, index_: 1 },
    })
    expect(wrapper.text()).toMatch(task.title)
    expect(wrapper.text()).toMatch("開始:10:52")
  })

  it("開始ボタンの動作確認", () => {
    const task = new Task(new Date(), "Unitテスト3")
    task.startTime = new Date("2018-01-01 10:53:00")
    const wrapper = mountFunction({
      propsData: { task_: task, index_: 1 },
    })
    wrapper.find("#start-btn-" + task.id).trigger("click")
    // ボタンを押してUIか変わった事を確認したい
    // expect(wrapper.text()).toMatch('pause_circle_filled');
  })
})
