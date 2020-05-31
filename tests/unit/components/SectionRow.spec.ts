import { mount, Wrapper, shallowMount } from "@vue/test-utils"
import SectionRow from "@/components/SectionRow.vue"
import Vue from "vue"
import Vuetify from "vuetify"
import Section from "@/lib/Section"

Vue.use(Vuetify)

describe("SectionRow.vue", () => {
  const time: string = "8:00"
  const section = new Section()
  section.title = "テストセクション"
  section.startTime = new Date("2018-01-02 " + time + ":00")
  let wrapper: Wrapper<SectionRow>

  beforeEach(() => {
    wrapper = mount(SectionRow, {
      mocks: {
        $vuetify: { breakpoint: {} },
      },
      propsData: {
        section_: section,
      },
    })
  })

  it("propsが渡るか?", () => {
    expect(wrapper.props().section_.title).toBe(section.title)
  })

  it("タイトルテキストフィールドがあるか?", () => {
    const titleField = wrapper.find("#section-title-field-" + section.id)
    expect(titleField.element.tagName).toBe("INPUT")
  })

  // 今はvue-test-utilsの問題でうまくバインドされないらしい…
  // it('渡したsectionのタイトルが表示されるか?', () => {
  //   const titleField = wrapper.find('#section-title-field-' + section.id);
  //   expect(titleField.html()).toMatch(section.title);
  // });

})

