<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md" style="width: 800px">
      <div v-if="false">{{ user_info }}</div>
      <q-card class="q-my-sm q-pa-md">
        <div class="text-h5 q-mb-lg">修改密码</div>
        <q-input
          outlined
          dense
          v-model="passwordOld"
          label="输入原密码"
          :type="showPwdOld ? 'password' : 'text'"
          :rules="[(val) => val.length || 'Please input this field']"
        >
          <template v-slot:append>
            <q-icon
              :name="showPwdOld ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPwdOld = !showPwdOld"
            />
          </template>
        </q-input>
        <q-input
          outlined
          dense
          v-model="password"
          label="输入新密码"
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
          dense
          v-model="passwordConfirm"
          label="确认新密码"
          :type="showPwdConfirm ? 'password' : 'text'"
          :rules="[(val) => val === password || '两次输入的密码不同']"
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
          label="修改"
          @click="pwdChange"
        />
      </q-card>
      <q-card class="q-my-sm q-pa-md">
        <div class="text-h5 q-mb-lg">绑定/修改cf账号</div>
        <p>
          {{
            `${
              Object.keys(cf_status).length == 0
                ? '状态加载中'
                : cf_status.bind
                ? '已绑定:' + cf_status.account
                : '未绑定'
            }`
          }}
        </p>
        <q-input
          outlined
          dense
          v-model="cfAccount"
          type="text"
          label="输入新的cf账号"
          :rules="[(val) => val.length || 'Please input this field']"
        />
        <q-btn
          class="q-my-md"
          color="primary"
          label="修改"
          @click="cfAccountChange"
        />
      </q-card>
      <q-card class="q-my-sm q-pa-md">
        <div class="text-h5 q-mb-lg">修改昵称</div>
        <p>注意:昵称修改后,账户名依旧不变</p>
        <q-input
          outlined
          dense
          v-model="nickname"
          type="text"
          label="输入新的昵称"
          :rules="[(val) => val.length || 'Please input this field']"
        />
        <q-btn
          class="q-my-md"
          color="primary"
          label="修改"
          @click="nicknameChange"
        />
      </q-card>
      <q-card class="q-my-sm q-pa-md">
        <div class="text-h5 q-mb-lg">修改邮箱</div>
        <q-input
          outlined
          dense
          v-model="email"
          type="email"
          label="输入新的邮箱"
          :rules="[(val) => val.length || 'Please input this field']"
        />
        <q-btn
          class="q-my-md"
          color="primary"
          label="修改"
          @click="emailChange"
        />
      </q-card>
    </div>

    <loading-page :loading="show_loading" :message="err_msg"></loading-page>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import md5 from 'js-md5';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { $t } from '@/boot/i18n';
import { api as axios } from '@/boot/axios';
import loadingPage from '@/components/loadingPage.vue';
import { useUserStore } from '@/stores/user';

const $q = useQuasar();
const this_router = useRouter();
const this_route = useRoute();
const user = useUserStore();
const show_loading = ref(false);
const err_msg = ref('');
const user_info = ref({});
const passwordOld = ref('');
const password = ref('');
const passwordConfirm = ref('');
const showPwdOld = ref(true);
const showPwd = ref(true);
const showPwdConfirm = ref(true);
const email = ref('');
const nickname = ref('');
const cfAccount = ref('');
const cf_status = ref({});

function IsEmail(str) {
  var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
  return reg.test(str);
}

function pwdChange() {
  if (
    !(
      password.value.length &&
      passwordOld.value.length &&
      passwordConfirm.value.length
    )
  ) {
    $q.notify({
      type: 'negative',
      message: '请填写所有表单项目',
      progress: true,
    });
    return;
  }
  if (password.value !== passwordConfirm.value) {
    $q.notify({
      type: 'negative',
      message: '两次输入的密码不一致',
      progress: true,
    });
    return;
  }

  axios({
    method: 'post',
    url: '/user/setting/pwd',
    data: {
      oldPwd: md5(passwordOld.value),
      newPwd: md5(password.value),
    },
  })
    .then((data) => {
      $q.notify({
        type: 'positive',
        message: '修改成功,请重新登录',
        progress: true,
      });
      this_router.push('/userLogin?type=2');
    })
    .catch((error) => {
      // submiting.value = false;
      // console.error('Error:', error);
      // alert(error.response.data.detail);
      var err_msg_notify = '';
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&&err=${error.response.data.detail}`
          );
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
}

function emailChange() {
  if (!IsEmail(email.value)) {
    $q.notify({
      type: 'negative',
      message: '邮箱格式错误',
      progress: true,
    });
    return;
  }
  axios({
    method: 'post',
    url: '/user/setting/email',
    data: {
      email: email.value,
    },
  })
    .then((data) => {
      $q.notify({
        type: 'positive',
        message: '修改成功',
        progress: true,
      });
    })
    .catch((error) => {
      // submiting.value = false;
      // console.error('Error:', error);
      // alert(error.response.data.detail);
      var err_msg_notify = '';
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&&err=${error.response.data.detail}`
          );
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
}

function nicknameChange() {
  axios({
    method: 'post',
    url: '/user/setting/nickname',
    data: {
      nickname: nickname.value,
    },
  })
    .then((data) => {
      $q.notify({
        type: 'positive',
        message: '修改成功',
        progress: true,
      });
      user.user_auth();
    })
    .catch((error) => {
      // submiting.value = false;
      // console.error('Error:', error);
      // alert(error.response.data.detail);
      var err_msg_notify = '';
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&&err=${error.response.data.detail}`
          );
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
}
function cfAccountChange() {
  axios({
    method: 'post',
    url: '/user/setting/cf',
    data: {
      cfAccount: cfAccount.value,
    },
  })
    .then((data) => {
      $q.notify({
        type: 'positive',
        message: '修改成功',
        progress: true,
      });
      cf_status.value = { bind: true, account: cfAccount.value };
    })
    .catch((error) => {
      // submiting.value = false;
      // console.error('Error:', error);
      // alert(error.response.data.detail);
      var err_msg_notify = '';
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&&err=${error.response.data.detail}`
          );
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
}
function getCurrentUserCfAccount() {
  axios({
    method: 'post',
    url: '/user/query/cf',
  })
    .then((data) => {
      cf_status.value = data.data;
    })
    .catch((error) => {
      // submiting.value = false;
      // console.error('Error:', error);
      // alert(error.response.data.detail);
      var err_msg_notify = '';
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&&err=${error.response.data.detail}`
          );
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
}
onMounted(() => {
  getCurrentUserCfAccount();
});
</script>

<style scoped></style>
