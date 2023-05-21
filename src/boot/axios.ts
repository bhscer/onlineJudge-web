import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
// import { useUserStore } from '@/stores/user';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

// const user = useUserStore();

const api = axios.create({ baseURL: process.env.BASE_URL });
api.interceptors.request.use(
  (config) => {
    if (localStorage.getItem('oj-auth-token')) {
      config.headers.Authorization = localStorage.getItem('oj-auth-token');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (res) => {
    // 请求成功对响应数据做处理
    if (res.data && res.data.new_token) {
      // user.update_token(res.data.new_token)
      localStorage.setItem('oj-auth-token', res.data.new_token);
    }
    // 该返回的数据则是axios.then(res)中接收的数据
    return res;
  },
  (err) => {
    // 在请求错误时要做的事儿

    // 该返回的数据则是axios.catch(err)中接收的数据
    return Promise.reject(err);
  }
);

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  app.config.globalProperties.$api_url = process.env.BASE_URL;
});

export { api, axios };
