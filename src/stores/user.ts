import { defineStore } from 'pinia';
import { user } from '@/lib/api/user';
import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

// 第一个参数是应用程序中 store 的唯一 id
export const useUserStore = defineStore('user', () => {
  // 其它配置项
  const info = ref<null | user.UserInfo>(null);
  const exists = computed(() => info.value !== null);
  const auth_ing = ref(false);
  const loading_queue: any = {}; // uid=>bool 表示是否正在从服务器获取对应用户的info
  const router = useRouter();
  const $q = useQuasar();

  function login(form: user.LoginForm) {
    return new Promise<user.UserInfo>((resolve, reject) => {
      user
        .login(form)
        .then((d) => {
          const user = d.data;
          info.value = user;
          users.push(user);
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
  function back_login() {
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
      router.push({ path: '/userLogin' }).then(() => {
        $q.notify({
          type: 'negative',
          message: '请先登录',
          progress: true,
        });
      });
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
  if (localStorage.getItem('oj-auth-token')) {
    auth_ing.value = true;
    user
      .auth()
      .then((d) => {
        info.value = d.data;
        localStorage.setItem('oj-auth-token', d.data.token);
        users.push(d.data);
        auth_ing.value = false;
      })
      .catch((error) => {
        auth_ing.value = false;
        let err_msg = '';
        try {
          if (error.response.status === 401 || error.response.status === 400) {
            err_msg = error.response.data.detail;
            localStorage.removeItem('oj-auth-token');
          } else {
            err_msg = '错误:' + error.response.status;
          }
        } catch {
          err_msg = '错误:' + error.code;
        }
        $q.notify({
          type: 'negative',
          message: err_msg,
          progress: true,
        });
      });
  }

  function user_auth() {
    return new Promise<user.UserInfo>((resolve, reject) => {
      auth_ing.value = true;
      user
        .auth()
        .then((d) => {
          auth_ing.value = false;
          info.value = d.data;
          users.push(d.data);
          resolve(info.value);
        })
        .catch((error) => {
          auth_ing.value = false;
          reject(error);
        });
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
    back_login,
    auth_ing,
  };
});
