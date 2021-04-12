import Vue from "vue"
import Vuetify from "vuetify"

import SectionRow from "@/components/SectionRow.vue"
import Section from "@/lib/Section"

import { mount, createLocalVue, Wrapper, MountOptions } from "@vue/test-utils"

Vue.use(Vuetify)
const localVue = createLocalVue()

describe("SectionRow.vue", () => {
  let vuetify: Vuetify

  const time: string = "8:00"
  const section = new Section()
  section.title = "テストセクション"
  section.startTime = new Date("2018-01-02 " + time + ":00")

  beforeEach(() => {
    vuetify = new Vuetify({
      breakpoint: {
        mobileBreakpoint: "md"
      }
    })
  })

  it("propsが渡るか?", () => {
    const wrapper = mount(SectionRow, {
      localVue,
      vuetify,
      propsData: {
        section_: section,
      }
    })
    expect(wrapper.props().section_.title).toBe(section.title)
  })

  it("タイトルテキストフィールドがあるか?", () => {
    const wrapper = mount(SectionRow, {
      localVue,
      vuetify,
      propsData: {
        section_: section,
      }
    })
    const titleField = wrapper.find("#section-title-field-" + section.id)
    expect(titleField.element.tagName).toBe("INPUT")
  })
})
