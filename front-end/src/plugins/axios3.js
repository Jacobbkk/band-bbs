import { reactive } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'; // Import this if you're using Vue Router

const state = reactive({
  isAlreadyFetchingAccessToken: false,
  subscribers: [],
});

const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '릴리즈서버 REST API URI' : 'http://127.0.0.1:3000',
  timeout: 10000,
  withCredentials: true,
});

instance.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  error => Promise.reject(error)
);

instance.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const { config } = error;
    const originalRequest = config;
    const router = useRouter(); // Use this if you're using Vue Router

    if (error.response?.status === 401) {
      if (!state.isAlreadyFetchingAccessToken) {
        state.isAlreadyFetchingAccessToken = true;
        try {
          const res = await instance.post('/users/authorize/token', {
            refreshToken: localStorage.getItem('refreshToken'),
          });
          localStorage.setItem('refreshToken', res.data.refreshToken);
          localStorage.setItem('accessToken', res.data.accessToken);
          state.isAlreadyFetchingAccessToken = false;
          state.subscribers.forEach(callback => callback(res.data.accessToken));
        } catch (error) {
          // Handle error when token refresh fails
          console.error('Token refresh failed:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          originalRequest.headers.Authorization = null;
          router.push('/login'); // Redirect to login page
        }
      }

      return new Promise(resolve => {
        state.subscribers.push(accessToken => {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          resolve(instance(originalRequest));
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

export default instance;
