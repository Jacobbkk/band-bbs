import UserModel from '@/models/userModel';

export default {
  namespaced: true,
  state: () => ({
    isLogin: false,
    loginUser: {
      id: 0,
      nickname: '',
      auth: 0,
    },
  }),

  // mutations: state를 변경하기 위해 실행되는 것으로 비동기를 해야할 경우

  mutations: {
    setLogin(state) {
      state.isLogin = UserModel.isLogin();
    },

    //사용자의 정보를 저장합니다.

    setUserInfo(state, payload) {
      state.loginUser.id = payload?.id ?? 0;
      state.loginUser.nickname = payload?.nickname ?? '';
      state.loginUser.auth = payload?.auth ?? 0;
    },
  },

  getters: {
    isLogin(state) {
      return state.isLogin;
    },
    loginUser(state) {
      return state.loginUser;
    },
  },
};
