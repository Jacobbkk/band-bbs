import { createStore } from 'vuex';

import authorizeStore from '@/store/auth';

export const store = createStore({
  // state: {},
  // getters: {},
  // mutations: {},
  // actions: {},
  modules: {
    authorize: authorizeStore,
  },
});
