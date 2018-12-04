import { shallowMount } from '@vue/test-utils';
import Login from '@/components/Login.vue';

describe('Login.vue', () => {
  it('ログインボタンがでるかな?', () => {
    const wrapper = shallowMount(Login, {
      mocks: {
        $vuetify: { breakpoint: {} }
      }
    })
    expect(wrapper.contains('button')).toBeTruthy();
  });
});
