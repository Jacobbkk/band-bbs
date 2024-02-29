import { createApp } from 'vue';
import axios from 'axios';

import store from '@/store';
import userModel from '@/models/userModel';

const app = createApp();

class AxiosExtend {
  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NODE_ENV === 'production' ? '릴리즈서버 REST API URI' : 'http://127.0.0.1:3000',
      timeout: 10000,
      withCredentials: true,
    });

    this.instance.interceptors.request.use(
      config => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      response => response,
      async error => {
        const { config } = error;

        if (error.response?.status === 401) {
          if (!this.isAlreadyFetchingAccessToken) {
            this.isAlreadyFetchingAccessToken = true;

            try {
              const response = await axios.post('/users/authorize/token', {
                refreshToken: localStorage.getItem('refreshToken'),
              });

              const { data } = response;

              localStorage.setItem('refreshToken', data.refreshToken);
              localStorage.setItem('accessToken', data.accessToken);

              store.commit('authorize/setLogin', true);

              this.subscribers.forEach(callback => callback(data.accessToken));
            } catch (error) {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              config.headers.Authorization = null;

              store.commit('authorize/setLogin', false);
              store.commit('authorize/setUserInfo', null);
            } finally {
              this.isAlreadyFetchingAccessToken = false;
            }
          }

          return new Promise(resolve => {
            this.subscribers.push(accessToken => {
              config.headers.Authorization = `Bearer ${accessToken}`;
              resolve(axios(config));
            });
          });
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

const axiosInstance = new AxiosExtend();

app.provide('$axios', axiosInstance.instance);
app.mount('#app');

export default axiosInstance.instance;
