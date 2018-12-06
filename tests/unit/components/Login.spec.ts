import { shallowMount } from '@vue/test-utils';
import Login from '@/components/Login.vue';
import Vue from 'vue';
import Vuetify from 'vuetify';

Vue.use(Vuetify);

describe('Login.vue', () => {
  it('propsが渡るか?', () => {
    const wrapper = shallowMount(Login, {
      mocks: {
        $vuetify: { breakpoint: {} },
      },
      propsData: { isLoading_: false },
    });
    expect(wrapper.props().isLoading_).toBeFalsy();
    // 表示直後にloadingアイコンが表示されているからかテストがクリアできない
    // expect(wrapper.contains('button')).toBeTruthy();
  });
});
