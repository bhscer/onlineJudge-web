<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md" style="width: 800px" v-if="!show_loading">
      <div v-if="false">{{ user_info }}</div>
      <q-card class="q-my-sm" v-if="user_info !== {}">
        <div style="display: flex" class="q-gutter-md q-pa-md">
          <q-avatar
            class="q-my-auto"
            size="100px"
            color="secondary"
            text-color="white"
          >
            <img
              :src="`https://cravatar.cn/avatar/${user_info.emailMd5}?d=mp&&s=100`"
            />
          </q-avatar>
          <div class="q-my-auto">
            <div class="text-h4">{{ user_info.nickname }}</div>
          </div>
          <q-btn
            v-if="user_info.id == user.info?.userDBId"
            class="q-my-auto"
            outline
            color="primary"
            label="个人设置"
            size="sm"
            @click="$router.push(`/userSettings`)"
          />
        </div>
      </q-card>
      <q-card class="q-my-sm q-pa-md">
        <div v-if="user_info.analyze">
          <p style="margin: 0; padding: 0">
            {{ `通过${user_info.analyze.solvedProblem}题` }}
          </p>
          <p style="margin: 0; padding: 0">
            {{ `尝试${user_info.analyze.triedProblem}题` }}
          </p>
          <p style="margin: 0; padding: 0">
            {{
              `已经注册${Math.ceil(
                (Date.now() / 1000 -
                  parseInt(user_info.id.substring(0, 8), 16)) /
                  (24 * 60 * 60)
              )}天`
            }}
          </p>
          <p style="margin: 0; padding: 0" v-if="user_info.analyze.cf_rating">
            {{ `Codeforces Rating:${user_info.analyze.cf_rating}` }}
          </p>
        </div>
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
const show_loading = ref(true);
const err_msg = ref('');
const user_info = ref({});

function getUserCfRating() {
  if (this_route.path.toLowerCase() !== '/userInfo'.toLowerCase()) return;
  let post_data = {};
  if (this_route.query.uid === undefined) {
    err_msg.value = '参数缺失';
    return;
  }

  console.log(post_data);
  axios({
    method: 'post',
    url: '/user/getUserCfRating',
    data: {
      id: this_route.query.uid,
    },
  })
    .then((data) => {
      console.log('Success:', data);
      console.log(data);
      user_info.value.analyze.cf_rating = data.data.cf_rating;
    })
    .catch((error) => {
      console.error('Error:', error);
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&&err=${error.response.data.detail}`
          );
        // else if (error.response.status === 400)
        //   err_msg.value = error.response.data.detail;
        // else err_msg.value = error.response.status;
      } catch {
        // err_msg.value = error.code;
      }
    });
}
function getUserInfo() {
  show_loading.value = true;
  if (this_route.path.toLowerCase() !== '/userInfo'.toLowerCase()) return;
  let post_data = {};
  if (this_route.query.uid === undefined) {
    err_msg.value = '参数缺失';
    return;
  }

  console.log(post_data);
  axios({
    method: 'post',
    url: '/user/getCommonInfo',
    data: {
      id: this_route.query.uid,
    },
  })
    .then((data) => {
      console.log('Success:', data);
      if (data.data.status === 1) {
        // 列表获取成功
        console.log(data);
        user_info.value = data.data.data;
        show_loading.value = false;
      } else {
        // alert(data.msg)
        // showFailToast(data.data.msg)
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&&err=${error.response.data.detail}`
          );
        else if (error.response.status === 400)
          err_msg.value = error.response.data.detail;
        else err_msg.value = error.response.status;
      } catch {
        err_msg.value = error.code;
      }
    });
}
onMounted(() => {
  getUserInfo();
  getUserCfRating();
});
</script>

<style scoped></style>
