import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import { store } from './store';

import '@/plugins/formatter';
import mixins from '@/mixins';

// Axios 모듈 로드
import myAxios from '@/plugins/axios';
// import axios from 'axios';
import VueCookies from 'vue3-cookies';

const app = createApp(App);
app.config.globalProperties.$axios = myAxios;
app.config.globalProperties.$cookies = VueCookies;

app.config.globalProperties.$filters = {
  // 숫자 세자리 콤마
  numberFormat(value) {
    if (value === 0 || value === '0') return '0';

    const reg = /(^[+-]?\d+)(\d{3})/;
    let n = value + '';

    while (reg.test(n)) {
      n = n.replace(reg, '$1' + ',' + '$2');
    }

    return n;
  },
  // sns stle
  snsDateTime(value) {
    if (value === null || value === '') return;

    const today = new Date();
    let date = new Date(value);

    const elapsedTime = Math.trunc((today.getTime() - date.getTime()) / 1000);

    let elapsedText = '';
    if (elapsedTime < 10) {
      elapsedText = '방금 전';
    } else if (elapsedTime < 60) {
      elapsedText = elapsedTime + '초 전';
    } else if (elapsedTime < 60 * 60) {
      elapsedText = Math.trunc(elapsedTime / 60) + '분 전';
    } else if (elapsedTime < 60 * 60 * 24) {
      elapsedText = Math.trunc(elapsedTime / 60 / 60) + '시간 전';
    } else if (elapsedTime < 60 * 60 * 24 * 10) {
      elapsedText = Math.trunc(elapsedTime / 60 / 60 / 24) + '일 전';
    } else {
      elapsedText = value.dateFormat('yy/MM/dd');
      // elapsedText = '몰라';
    }
    return elapsedText;
  },
};

app.use(store).use(router).mixin(mixins).mount('#app');

// app.config.devtools = true;
