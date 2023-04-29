import { defineStore } from 'pinia';
import { user } from '@/lib/api/user';
import { ref, computed, reactive } from 'vue';

// 第一个参数是应用程序中 store 的唯一 id
export const useUserStore = defineStore('user', () => {
  // 其它配置项
  const info = ref<null | user.UserInfo>(null);
  const exists = computed(() => info.value !== null);
  const loading_queue: any = {}; // uid=>bool 表示是否正在从服务器获取对应用户的info

  function login(form: user.LoginForm) {
    return new Promise<user.UserInfo>((resolve, reject) => {
      user
        .login(form)
        .then((d) => {
          const user = d.data;
          info.value = user;
          localStorage.setItem('oj-auth-token', d.data.token);
          resolve(user);
        })
        .catch(reject);
    });
  }
  function logout() {
    return new Promise((resolve, reject) => {
      /*
      user
        .logout()
        .then(() => {
          info.value = null;
          resolve(void 0);
        })
        .catch(reject);
      */
      localStorage.removeItem('oj-auth-token');
      info.value = null;
      resolve(void 0);
    });
  }
  function register(form: user.RegisterForm) {
    return new Promise<user.UserInfo>((resolve, reject) => {
      user
        .register(form)
        .then((d) => {
          const user = d.data;
          // info.value = user;
          resolve(user);
        })
        .catch(reject);
    });
  }
  const users = reactive<user.CommonUserInfo[]>([]);

  // auth
  user.auth().then((d) => {
    info.value = d.data;
    users.push(d.data);
  });
  function user_auth() {
    return new Promise<user.UserInfo>((resolve, reject) => {
      user
        .auth()
        .then((d) => {
          info.value = d.data;
          users.push(d.data);
          resolve(info.value);
        })
        .catch(reject);
    });
  }

  // load info 方法不对外暴露, 因为要维持一个loading queue
  function load_info(id: string) {
    return new Promise<user.CommonUserInfo>((resolve, reject) => {
      for (const user of users) {
        if (user.username === id) {
          resolve(user);
          return;
        }
      }
      if (!loading_queue[id]) {
        loading_queue[id] = true;
        user
          .info(id)
          .then((d) => {
            const user = d.data;
            users.push(user);
            resolve(user);
          })
          .catch(reject)
          .finally(() => {
            loading_queue[id] = false;
          });
      }
    });
  }

  function get_info(id: string) {
    const info = computed(() => users.find((v) => v.username === id));
    if (!info.value) load_info(id);
    return info;
  }

  return {
    users,
    info,
    exists,
    logout,
    login,
    register,
    get_info,
    user_auth,
  };
});
