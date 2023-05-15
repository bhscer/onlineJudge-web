<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- <loading-page :loading="show_loading" :message="err_msg"></loading-page> -->
  <q-page class="flex flex-center" v-if="show_loading">
    <div v-if="show_loading && !err_msg?.length">
      <q-spinner-gears size="50px" color="primary" />
      <p>loading...</p>
    </div>
    <div v-if="err_msg?.length">
      <h2 style="padding: 0; margin: 0"><strong>:(</strong></h2>
      <h5 style="padding-top: 30px; margin: 0">出错了</h5>
      <p>{{ err_msg }}</p>
    </div>
  </q-page>

  <q-card
    class="q-gutter-sm"
    style="flex-direction: column; height: 100%"
    v-show="!show_loading"
  >
    <div class="q-pa-md">
      <div style="display: flex">
        <div class="text-h5 q-mb-md">信息</div>
        <div
          v-if="show_loading_mini"
          style="display: flex"
          class="q-pt-auto q-pl-sm"
        >
          <q-spinner-gears size="20px" color="primary" />
          <p class="q-ma-none q-pa-none">刷新中</p>
        </div>
      </div>
      <p class="q-ma-none q-pa-none">
        {{ `账号:${user_detail_info.username}` }}
      </p>
      <p class="q-ma-none q-pa-none">
        {{ `姓名:${props.userContestInfo.userRealName}` }}
      </p>
      <p class="q-ma-none q-pa-none">
        {{ `座位:${props.userContestInfo.userSeatNo}` }}
      </p>
      <p class="q-ma-none q-pa-none">
        {{ `${props.userContestInfo.userOnline ? '在线' : '离线'}` }}
      </p>
      <p class="q-ma-none q-pa-none">
        {{ `${props.userContestInfo.userStatusErr ? '异常' : '正常'}` }}
      </p>
    </div>

    <q-separator />
    <div class="q-pa-md">
      <div class="text-h5 q-mb-md">操作</div>

      <div class="q-gutter-sm">
        <q-input
          outlined
          v-model="send_msg_text"
          label="发送消息"
          :loading="msg_sending"
          :readonly="msg_sending"
          dense
        >
          <template v-slot:after>
            <q-btn
              round
              dense
              flat
              icon="send"
              :loading="msg_sending"
              @click="sendMsg"
            >
              <template v-slot:loading>
                <q-spinner-hourglass class="on-left" />
              </template>
            </q-btn>
          </template>
        </q-input>
        <q-btn
          outline
          color="primary"
          @click="getUserImg()"
          :loading="screenImgLoading"
          dense
        >
          立即截图
          <template v-slot:loading>
            <q-spinner-hourglass class="on-left" />
            截图中
          </template>
        </q-btn>
        <!-- <q-btn
        outline
        color="primary"
        label="获取近四张"
        size="lg"
        padding="xs xs"
        @click="queryUserImgList()"
      /> -->
      </div>
    </div>

    <q-separator />
    <div class="q-pa-md">
      <div class="text-h5 q-pb-md">截图</div>
      <p v-if="img_list.length === 0" class="q-pa-none q-ma-none">暂无截图</p>
      <table style="width: 100%">
        <tbody v-viewer>
          <tr>
            <td v-if="img_list[0]">
              <q-img
                :src="`${$api_url}admin/invigilator/query/screenImgFile/name/${img_list[0]['file_name']}/token/${user.info.token}`"
              >
                <q-tooltip>
                  {{
                    `${props.contestId} ${props.username} ${timeStampTostring(
                      img_list[0]['time']
                    )}`
                  }}
                </q-tooltip>
              </q-img>
            </td>
            <td v-if="img_list[1]">
              <q-img
                :src="`${$api_url}admin/invigilator/query/screenImgFile/name/${img_list[1]['file_name']}/token/${user.info.token}`"
              >
                <q-tooltip>
                  {{
                    `${props.contestId} ${props.username} ${timeStampTostring(
                      img_list[1]['time']
                    )}`
                  }}
                </q-tooltip>
              </q-img>
            </td>
          </tr>
          <tr>
            <td v-if="img_list[2]">
              <q-img
                :src="`${$api_url}admin/invigilator/query/screenImgFile/name/${img_list[2]['file_name']}/token/${user.info.token}`"
              >
                <q-tooltip>
                  {{
                    `${props.contestId} ${props.username} ${timeStampTostring(
                      img_list[2]['time']
                    )}`
                  }}
                </q-tooltip>
              </q-img>
            </td>
            <td v-if="img_list[3]">
              <q-img
                :src="`${$api_url}admin/invigilator/query/screenImgFile/name/${img_list[3]['file_name']}/token/${user.info.token}`"
              >
                <q-tooltip>
                  {{
                    `${props.contestId} ${props.username} ${timeStampTostring(
                      img_list[3]['time']
                    )}`
                  }} </q-tooltip
                >>
              </q-img>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- <div style="display: flex;flex-wrap: wrap;">
        <q-img v-for="item in img_list" :key="item" :src="`${$api_url}/admin/invigilator/query/screenImgFile/name/${item.file_name}/token/${user.info.token}`">
          <div class="absolute-bottom text-subtitle1 text-center">
            {{ `${props.contestId} ${props.username} ${timeStampTostring(item.time)}` }}
          </div>
        </q-img>
      </div> -->
    <q-separator />
    <div>
      <div class="text-h5 q-pt-md q-pl-md">日志</div>
      <div
        class="q-mt-md"
        v-show="
          !empty_content &&
          !show_loading &&
          !show_loading_mini &&
          !err_msg.length
        "
        style="height: 200px; overflow: scroll"
      >
        <div
          v-for="(log, idx) in user_detail_info.userLogs"
          :key="idx"
          class="q-pl-md"
        >
          <div class="q-my-none q-py-none" style="cursor: pointer">
            <q-icon
              name="label"
              :style="`color: ${
                log.type === 0 ? 'green' : log.type === 1 ? 'yellow' : 'red'
              };`"
            ></q-icon>
            {{ `${timestampToTime(log.time)} ${log.summary}` }}
            <p
              class="q-ma-none q-pa-none"
              style="word-wrap: break-word; word-break: normal"
              v-if="log.detail"
            >
              {{ `${log.detail}` }}
            </p>
            <div v-if="log.type !== 0">
              <q-btn
                outline
                color="primary"
                @click="
                  changeLogType(log.id);
                  log.type = 3 - log.type;
                "
                :loading="changeLogTypeLoading"
                dense
              >
                {{ `${log.type === 1 ? '重新报警' : '解除报警'}` }}
                <template v-slot:loading>
                  <q-spinner-hourglass class="on-left" />
                  更改中
                </template>
              </q-btn>
            </div>
            <q-img
              style="width: 50%"
              v-viewer
              v-if="log.withScreenImg"
              :src="`${$api_url}admin/invigilator/query/screenImgFile/name/${log.screenFileName}/token/${user.info.token}`"
            />
          </div>
          <q-separator></q-separator>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import {
  onMounted,
  ref,
  defineProps,
  getCurrentInstance,
  watch,
  onUnmounted,
} from 'vue';
import md5 from 'js-md5';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { $t } from '@/boot/i18n';
import { api as axios } from '@/boot/axios';
import * as monaco from 'monaco-editor';
import loadingPage from '@/components/loadingPage.vue';
import { useUserStore } from '@/stores/user';
import 'viewerjs/dist/viewer.css';
import { component as Viewer } from 'v-viewer';

const user = useUserStore();
const $q = useQuasar();
const this_router = useRouter();
const this_route = useRoute();
const tab = ref('points');
const show_loading = ref(true);
const user_detail_info = ref({});
const err_msg = ref('');
const img_list = ref([]);
const msg_sending = ref(false);
const send_msg_text = ref('');

const props = defineProps(['username', 'contestId', 'userContestInfo']);
const { proxy } = getCurrentInstance();
let waitImgUploadedTimer = null;
const screenImgLoading = ref(false);
const changeLogTypeLoading = ref(false);
const show_loading_mini = ref(true);
let queryDetailTimer = null;

// function showfullScreenImg(url)
// {
//   proxy.$viewerApi({
//     images: url,
//   })
// }
watch(
  () => props.username,
  (newVal) => {
    user_detail_info.value = {};
    img_list.value = [];
    getUserDetailInfo();
    queryUserImgList();
  }
);

watch(
  () => props.contestId,
  (newVal) => {
    user_detail_info.value = {};
    img_list.value = [];
    getSubmissionInfo();
    queryUserImgList();
  }
);

function timeStampTostring(tim) {
  var timestamp = tim ? tim : null;
  let date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear();
  let M =
    date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1;
  let D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  let h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  let m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  // return Y + M + D + h + m + s;
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}
function waitImgUploaded() {
  if (
    this_route.path.toLowerCase() !== '/admin/invigilatorDetail'.toLowerCase()
  )
    return;
  if (waitImgUploadedTimer !== null) {
    clearInterval(waitImgUploadedTimer);
  }
  axios({
    method: 'post',
    url: '/admin/invigilator/query/newScreenImgUploaded',
    data: {
      contestId: props.contestId,
      username: props.username,
      time: img_list.value[0]['time'],
    },
  })
    .then((data) => {
      console.log('Success:', data);
      clearInterval(waitImgUploadedTimer);
      screenImgLoading.value = false;
      queryUserImgList();
    })
    .catch((error) => {
      console.error('Error:', error);
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&&err=${error.response.data.detail}`
          );
        else waitImgUploadedTimer = setInterval(waitImgUploaded, 5 * 1000);
        // else if (error.response.status === 400)
        // err_msg.value = error.response.data.detail;
        // else err_msg.value = error.response.status;
      } catch {
        // err_msg.value = error.code;
        waitImgUploadedTimer = setInterval(waitImgUploaded, 5 * 1000);
      }
    });
}
function queryUserImgList() {
  if (
    this_route.path.toLowerCase() !== '/admin/invigilatorDetail'.toLowerCase()
  )
    return;
  axios({
    method: 'post',
    url: '/admin/invigilator/query/screenImgList',
    data: {
      contestId: props.contestId,
      username: props.username,
    },
  })
    .then((data) => {
      console.log('Success:', data);
      img_list.value = data.data;
      show_loading.value = false;
    })
    .catch((error) => {
      console.error('Error:', error);
      show_loading.value = true;
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
function sendMsg() {
  if (
    this_route.path.toLowerCase() !== '/admin/invigilatorDetail'.toLowerCase()
  )
    return;
  if (msg_sending.value) return;
  msg_sending.value = true;
  axios({
    method: 'post',
    url: '/admin/invigilator/actions/sendMsg',
    data: {
      contestId: props.contestId,
      username: props.username,
      msg: send_msg_text.value,
    },
  })
    .then((data) => {
      msg_sending.value = false;
      send_msg_text.value = '';
      console.log('Success:', data);
      $q.notify({
        type: 'positive',
        message: '请求成功',
        progress: true,
      });
    })
    .catch((error) => {
      msg_sending.value = false;
      console.error('Error:', error);
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

function changeLogType(dbId) {
  if (
    this_route.path.toLowerCase() !== '/admin/invigilatorDetail'.toLowerCase()
  )
    return;
  if (changeLogTypeLoading.value) return;
  changeLogTypeLoading.value = true;
  axios({
    method: 'post',
    url: '/admin/invigilator/actions/changeLogType',
    data: {
      id: dbId,
    },
  })
    .then((data) => {
      console.log('Success:', data);
      $q.notify({
        type: 'positive',
        message: '请求成功',
        progress: true,
      });
      changeLogTypeLoading.value = false;
    })
    .catch((error) => {
      console.error('Error:', error);
      changeLogTypeLoading.value = false;
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
function getUserImg() {
  if (
    this_route.path.toLowerCase() !== '/admin/invigilatorDetail'.toLowerCase()
  )
    return;
  if (screenImgLoading.value) return;
  screenImgLoading.value = true;
  axios({
    method: 'post',
    url: '/admin/invigilator/actions/getScreenImg',
    data: {
      contestId: props.contestId,
      username: props.username,
    },
  })
    .then((data) => {
      console.log('Success:', data);
      $q.notify({
        type: 'positive',
        message: '请求成功',
        progress: true,
      });
      screenImgLoading.value = true;
      waitImgUploadedTimer = setInterval(waitImgUploaded, 5 * 1000);
      waitImgUploaded();
    })
    .catch((error) => {
      console.error('Error:', error);
      screenImgLoading.value = false;
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
function getUserDetailInfo() {
  if (queryDetailTimer !== null) clearInterval(queryDetailTimer);
  show_loading_mini.value = true;
  axios({
    method: 'post',
    url: '/admin/invigilator/getUserDetail',
    data: {
      contestId: props.contestId,
      username: props.username,
    },
  })
    .then((data) => {
      console.log('Success:', data);
      user_detail_info.value = data.data;
      show_loading.value = false;
      show_loading_mini.value = false;
      queryUserImgList();
    })
    .catch((error) => {
      console.error('Error:', error);
      show_loading.value = true;
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&&err=${error.response.data.detail}`
          );
        else if (error.response.status === 400) {
          err_msg.value = error.response.data.detail;
        } else {
          err_msg.value = error.response.status;
        }
      } catch {
        err_msg.value = error.code;
      }
    });
  queryDetailTimer = setInterval(getUserDetailInfo, 5 * 1000);
}
function timestampToTime(timestamp) {
  timestamp = timestamp ? timestamp : null;
  let date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear();
  let M =
    date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1;
  let D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  let h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  let m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  // return Y + M + D + h + m + s;
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}
onMounted(() => {
  getUserDetailInfo();
  queryUserImgList();
});
onUnmounted(() => {
  if (queryDetailTimer !== null) clearInterval(queryDetailTimer);
  if (waitImgUploadedTimer !== null) clearInterval(waitImgUploadedTimer);
});
</script>

<style scoped></style>
