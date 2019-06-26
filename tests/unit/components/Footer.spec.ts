import { mount, Wrapper, shallowMount } from '@vue/test-utils'
import Vue from 'vue'
import Vuetify from 'vuetify'
import Footer from '@/components/Footer.vue'

Vue.use(Vuetify)

describe('SectionRow.vue', () => {
  let wrapper: Wrapper<Footer>

  beforeEach(() => {
    wrapper = mount(Footer, {
      mocks: {
        $vuetify: { breakpoint: {} },
      },
    })
  })

  it('バージョンが表示されているか?', () => {
    const txt = wrapper.find('#ver')
    expect(txt.text().length).toBeGreaterThan(0)
  })
})
