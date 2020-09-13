import Vue from "vue"
import Vuetify from "vuetify"

import Footer from "@/components/Footer.vue"

import { mount, createLocalVue, Wrapper, MountOptions } from "@vue/test-utils"

Vue.use(Vuetify)
const localVue = createLocalVue()

describe("SectionRow.vue", () => {
  let vuetify: typeof Vuetify

  beforeEach(() => {
    vuetify = new Vuetify({
      breakpoint: {
        mobileBreakpoint: "md"
      }
    })
  })

  it("バージョンが表示されているか?", () => {
    const wrapper = mount(Footer, {
      localVue,
      vuetify,
    })

    const txt = wrapper.find("#ver")
    expect(txt.text().length).toBeGreaterThan(0)
  })
})
