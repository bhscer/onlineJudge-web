<template>
  <q-page class="flex flex-center q-pa-lg q-ma-lg">
    <div style="width: max-content; flex-direction: column">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="login" label="登录" />
        <q-tab name="register" label="注册" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated keep-alive>
        <q-tab-panel name="login">
          <q-form>
            <div style="display: flex; flex-direction: column">
              <q-input
                outlined
                v-model="username"
                label="账号"
                :rules="[(val) => val.length || '请填写此项目']"
              />
              <q-input
                outlined
                v-model="password"
                label="密码"
                :type="showPwd ? 'password' : 'text'"
                hint=""
                :rules="[(val) => val.length || '请填写此项目']"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showPwd ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPwd = !showPwd"
                  />
                </template>
              </q-input>
              <q-btn
                class="q-my-md"
                color="primary"
                label="登录"
                @click="loginFun"
                :loading="logining"
              />
            </div>
          </q-form>
        </q-tab-panel>
        <q-tab-panel name="register">
          <div style="display: flex; flex-direction: column">
            <q-input
              outlined
              v-model="username"
              label="用户名（账号）"
              :rules="[(val) => val.length || '请填写此项目']"
            />
            <q-input
              outlined
              v-model="nickname"
              label="昵称"
              :rules="[(val) => val.length || '请填写此项目']"
            />
            <q-input
              outlined
              v-model="email"
              type="email"
              label="email"
              hint=""
              :rules="[(val) => val.length || '请填写此项目']"
            />
            <q-input
              outlined
              v-model="password"
              label="密码"
              :type="showPwd ? 'password' : 'text'"
              :rules="[(val) => val.length || '请填写此项目']"
            >
              <template v-slot:append>
                <q-icon
                  :name="showPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPwd = !showPwd"
                />
              </template>
            </q-input>
            <q-input
              outlined
              v-model="passwordConfirm"
              label="再次输入密码"
              :type="showPwdConfirm ? 'password' : 'text'"
              hint=""
              :rules="[
                (val) => val === password || 'inputted different password',
              ]"
            >
              <template v-slot:append>
                <q-icon
                  :name="showPwdConfirm ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPwdConfirm = !showPwdConfirm"
                />
              </template>
            </q-input>
            <q-btn
              class="q-my-md"
              color="primary"
              label="注册"
              @click="registerFun"
              :loading="registering"
            />
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import md5 from 'js-md5';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { $t } from '@/boot/i18n';
import { api as axios } from '@/boot/axios';
import { useUserStore } from '@/stores/user';

const user = useUserStore();
const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const tab = ref('login');
const username = ref('');
const nickname = ref('');
const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const showPwd = ref(true);
const showPwdConfirm = ref(true);
const registering = ref(false);
const logining = ref(false);

function IsEmail(str: string) {
  var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
  return reg.test(str);
}
function checkFormInputted(type: string) {
  if (type == 'login') {
    if (!(username.value.length && password.value.length)) {
      return '请填写所有表单项目';
    }
  } else {
    if (
      !(
        username.value.length &&
        nickname.value.length &&
        email.value.length &&
        password.value.length
      )
    ) {
      return '请填写所有表单项目';
    }
    if (password.value !== passwordConfirm.value) {
      return '两次输入的密码不一致';
    }
    if (password.value.length < 6) {
      return '密码过短请更换';
    }
    if (!IsEmail(email.value)) {
      return '邮箱错误';
    }
  }
  return false;
}

const loginFun = () => {
  var ckr = checkFormInputted('login');
  if (ckr) {
    $q.notify({
      type: 'negative',
      message: ckr,
      progress: true,
    });
    return;
  }

  logining.value = true;
  user
    .login({
      username: username.value,
      pwd: password.value,
    })
    .then(() => {
      // router.replace({ path: '/' }).then(() => {
      $q.notify({
        type: 'positive',
        message: '登陆成功',
        progress: true,
      });
      logining.value = false;

      if (router.options.history.state.back) {
        router.go(-1);
      } else {
        router.push('/');
      }
    })
    .catch((error) => {
      logining.value = false;

      var err_msg_notify = '';
      try {
        if (error.response.status === 401)
          router.push(`/userLogin?type=2&err=${error.response.data.detail}`);
        else if (error.response.status === 400)
          err_msg_notify = error.response.data.detail;
        else err_msg_notify = '错误码' + error.response.status;
      } catch {
        err_msg_notify = '错误码' + error.code;
      }
      if (err_msg_notify !== '') {
        $q.notify({
          type: 'negative',
          message: err_msg_notify,
          progress: true,
        });
      }
    });
};
const registerFun = () => {
  var ckr = checkFormInputted('register');
  if (ckr) {
    $q.notify({
      type: 'negative',
      message: ckr,
      progress: true,
    });
    return;
  }
  registering.value = true;
  user
    .register({
      username: username.value,
      nickname: nickname.value,
      email: email.value,
      pwd: password.value,
    })
    .then(() => {
      registering.value = false;
      tab.value = 'login';
      $q.notify({
        type: 'positive',
        message: '注册成功',
        progress: true,
      });
    })
    .catch((error) => {
      registering.value = false;
      var err_msg_notify = '';
      try {
        if (error.response.status === 401)
          router.push(`/userLogin?type=2&err=${error.response.data.detail}`);
        else if (error.response.status === 400)
          err_msg_notify = error.response.data.detail;
        else err_msg_notify = '错误码' + error.response.status;
      } catch {
        err_msg_notify = '错误码' + error.code;
      }
      if (err_msg_notify !== '') {
        $q.notify({
          type: 'negative',
          message: err_msg_notify,
          progress: true,
        });
      }
    });
};

onMounted(() => {
  if (route.query.type) {
    if (user.info) {
      user.logout();
    }
    $q.notify({
      type: 'negative',
      message: route.query.err ? route.query.err.toString() : '登录异常',
      progress: true,
    });
  }
});
</script>

<style scoped></style>
