import { store } from '@/store/index';
import axios from '@/plugins/axios';

const exportObject = {
  // 사용자의 로그인 여부를 확인
  isLogin: () => {
    const accessToken = localStorage.getItem('accessToken');
    // return !!(accessToken && accessToken !== 'undefined');
    return !!(accessToken && accessToken !== 'undefined');
  },

  // REST API 서버로 로그인 요청을 보냄.

  requestLogin: async payload => {
    return await axios
      .post('/users/authorize', {
        loginId: payload.loginId,
        loginPass: payload.loginPass,
      })
      .then(async res => {
        await exportObject.processLogin(res.data);
      });
  },

  // 로그인이 완료된 경우 응답데이터를 이용하여 클라이언트에 토큰 저장.

  processLogin: async result => {
    // AccessToken과 refreshToken 발급에 성공한 경우
    if (result?.accessToken && result?.refreshToken) {
      // LocalStorage에 accessToken과 refreshToken을 저장
      localStorage.setItem('accessToken', result?.accessToken);
      localStorage.setItem('refreshToken', result?.refreshToken);

      //vue 상태관리에서 현재 로그인 상태를 True로 변경
      store.commit('authorize/setLogin', true);

      // REST API에 내 정보를 요청합니다.

      await exportObject.requestMyInfo();
    }
    // 발급에 실패한 경우, 기존에 남아있는 데이터를 삭제합니다.
    else {
      // vues 상태관리에서 현재 로그인 상태를 false로 변경.
      store.commit('authorize/setLogin', false);

      // vuex 상태관리에서 현재 내정보를 빈값으로 변경
      store.commit('authorize/setUserInfo', null);

      // localStorage에 있는 데이타를 모두 삭제합니다
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      alert('사용자 로그인에 실패했습니다.');
    }
  },

  /**
   * 로그아웃 처리
   */
  processLogOut: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    store.commit('authorize/setLogin', false);
    store.commit('authorize/setUserInfo', null);
  },

  // REST API로 내 정보를 가져옵니다.

  requestMyInfo: async () => {
    return await axios.get('/users').then(res => {
      //vuex의 상태관리에서 현재 내 정보를 처리합니다.
      store.commit('authorize/setUserInfo', res.data);
    });
  },
};

export default exportObject;
