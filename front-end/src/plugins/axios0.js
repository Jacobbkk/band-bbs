import Vue from 'vue';
//import { prototype } from "core-js/core/dict";
import $axios from 'axios';
import store from '@/store';
import userModel from '@/models/userModel';

class AxiosExtend {
  instance = null;

  isAlreadyFetchingAccessToken = false;

  subscribers = [];

  constructor() {
    this.instance = $axios.create({
      baseURL: process.env.NODE_ENV === 'production' ? '릴리즈서버 REST API URI' : 'http://127.0.0.1:3000',
      timeout: 10000,
      withCredentials: true,
    });

    this.instance.interceptors.request.use(
      config => {
        //  요청 헤더에 accessToken을 추가합니다.
        const accessToken = localStorage.getItem('accessToken');

        // 만일 accessToken이 있다면 헤더에 토큰을 추가합니다.
        if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
      },
      error => Promise.reject(error)
    );

    // REST API와의 통신에서 에러가 발생했을때 기본 처리
    this.instance.interceptors.response.use(
      response => {
        return response;
      },
      async error => {
        const { config } = error;
        const originalRequest = config; // 토큰 재발급후 원래 요청을 다시 보내기 위해 사용합니다.

        //응답 코드가 401일 경우에 처리합니다.
        if (error.response?.status === 401) {
          // 토큰재발급 요청을 보낸적이 없을경우
          if (!this.isAlreadyFetchingAccessToken) {
            this.isAlreadyFetchingAccessToken = true; // 토큰재발급 flag를 트루로 해불고
            //토큰 재발급 요청을 보낸다.
            await this.instance
              .post('/users/authorize/token', {
                refreshToken: localStorage.getItem('refreshToken'),
              })
              .then(r => {
                // 토큰 재발급 요청에 성공하면 flag는 다시 true로 변경해준다
                this.isAlreadyFetchingAccessToken = false;
                // LocalStorage 값을 업데이트 해준다.
                localStorage.setItem('refreshToken', r.data.refreshToken);
                localStorage.setItem('accessToken', r.data.accessToken);

                store.commit('authorize/setLogin', true);
                this.subscribers = this.subscribers.filter(callback => callback(r.data.accessToken));
              });
          }
          // 토큰 재발급을 이미 요청했는데도 401 응답이라면
          else {
            //토큰 재발금에 실패했으므로 저장되었던 데이터를 모두 날려불자.
            window.localStorage.removeItem('accessToken');
            window.localStorage.removeItem('refreshToken');
            originalRequest.headers.Authorization = null;

            store.commit('authorize/setLogin', false);
            store.commit('authorize/setUserInfo', null);
          }

          const retryOriginalRequest = new Promise(resolve => {
            this.subscribers.push(accessToken => {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              resolve(this.instance(originalRequest));
            });
            console.log(this.subscribers);
          });

          // 로그인된 상태라면 내 정보를 다시 가져옵니다.

          if (userModel.isLogin()) {
            await userModel.requestMyInfo();
          }

          return retryOriginalRequest;
        } else {
          let message;

          if (error.response?.data?.error) {
            message = error.response.data.error;
          } else {
            switch (error.response?.status) {
              case 0:
                message = 'REST API 서버에 접근할 수 없습니다\n서버관리자에게 문의하세요';
                break;
              case 400:
                message = '잘못된 요청입니다';
                break;
              case 404:
                message = '[404] REST API 요청에 실패했습니다.';
                break;
              case 500:
                message = '서버에서 처리중 오류가 발생하였습니다';
                break;

              default:
                message = '잘못된 요청입니다';
                break;
            }
          }
          alert(message);
          return Promise.reject(error);
        }
      }
    );
  }
}

const axios = new AxiosExtend();

Vue.prototype.$axios = axios.instance;

export default axios.instance;
