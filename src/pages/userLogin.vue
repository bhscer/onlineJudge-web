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
        <q-tab name="login" label="login" />
        <q-tab name="register" label="register" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated keep-alive>
        <q-tab-panel name="login">
          <q-form>
            <div style="display: flex; flex-direction: column">
              <q-input
                outlined
                v-model="username"
                label="username"
                :rules="[(val) => val.length || 'Please input this field']"
              />
              <q-input
                outlined
                v-model="password"
                label="password"
                :type="showPwd ? 'password' : 'text'"
                hint=""
                :rules="[(val) => val.length || 'Please input this field']"
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
                label="Login"
                @click="loginFun"
              />
            </div>
          </q-form>
        </q-tab-panel>
        <q-tab-panel name="register">
          <div style="display: flex; flex-direction: column">
            <q-input
              outlined
              v-model="username"
              label="username"
              :rules="[(val) => val.length || 'Please input this field']"
            />
            <q-input
              outlined
              v-model="nickname"
              label="nickname"
              :rules="[(val) => val.length || 'Please input this field']"
            />
            <q-input
              outlined
              v-model="email"
              type="email"
              label="email"
              hint=""
              :rules="[(val) => val.length || 'Please input this field']"
            />
            <q-input
              outlined
              v-model="password"
              label="password"
              :type="showPwd ? 'password' : 'text'"
              :rules="[(val) => val.length || 'Please input this field']"
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
              label="Confirm password"
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
              label="Register"
              @click="registerFun"
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
      router.push('/');
    })
    .catch((resp) => {
      $q.notify({
        type: 'negative',
        message: resp.response.data.detail,
        progress: true,
      });
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
  user
    .register({
      username: username.value,
      nickname: nickname.value,
      email: email.value,
      pwd: password.value,
    })
    .then(() => {
      tab.value = 'login';
      $q.notify({
        type: 'positive',
        message: '注册成功',
        progress: true,
      });
    })
    .catch((resp) => {
      $q.notify({
        type: 'negative',
        message: resp.response.data.detail,
        progress: true,
      });
    });
};

onMounted(() => {
  if (route.query.type) {
    user.logout();
    if (user.info) {
      if (route.query.type === '1') {
        $q.notify({
          type: 'positive',
          message: '注销成功',
          progress: true,
        });
      } else {
        $q.notify({
          type: 'negative',
          message: '登录过期',
          progress: true,
        });
      }
    } else {
      $q.notify({
        type: 'negative',
        message: '请先登录',
        progress: true,
      });
    }
  }
});
</script>

<style scoped></style>
