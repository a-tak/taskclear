import Vue from "vue"
import Vuetify from "vuetify"

import SectionRow from "@/components/SectionRow.vue"
import Section from "@/lib/Section"

import { mount, createLocalVue } from "@vue/test-utils"

Vue.use(Vuetify)
const localVue = createLocalVue()

describe("SectionRow.vue", () => {
  let vuetify: typeof Vuetify

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
    // wrapper = mount(SectionRow, {
    //   mocks: {
    //     $vuetify: { breakpoint: {} },
    //   },
    //   propsData: {
    //     section_: section,
    //   },
    // })
  })

  it("propsが渡るか?", () => {
    const wrapper = mount(SectionRow, {
      localVue,
      vuetify,
    })
    expect(wrapper.props().section_.title).toBe(section.title)
  })

  it("タイトルテキストフィールドがあるか?", () => {
    const wrapper = mount(SectionRow, {
      localVue,
      vuetify,
    })
    const titleField = wrapper.find("#section-title-field-" + section.id)
    expect(titleField.element.tagName).toBe("INPUT")
  })

  // 今はvue-test-utilsの問題でうまくバインドされないらしい…
  // it('渡したsectionのタイトルが表示されるか?', () => {
  //   const titleField = wrapper.find('#section-title-field-' + section.id);
  //   expect(titleField.html()).toMatch(section.title);
  // });
})
