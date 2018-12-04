import { shallowMount } from '@vue/test-utils';
import Login from '@/components/Login.vue';
import Vuetify from 'vuetify';

describe('Login.vue', () => {
  it('ログインボタンがでるかな?', () => {
    const wrapper = shallowMount(Login);
    expect(wrapper.contains('button')).toBeTruthy();
  });
});
