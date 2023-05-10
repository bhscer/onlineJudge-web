<template>
  <q-page style="display: flex; height: 100%" v-if="!show_loading">
    <div style="width: 70%">
      <q-card class="q-pa-md" :style="qmarkstyle">
        <div style="display: flex">
          <div class="text-h4" style="font-weight: bold">
            {{ contest_info.contestTitle }}
          </div>
          <q-badge
            color="orange"
            class="q-mt-auto q-ml-md"
            style="height: fit-content"
            >{{ ['Not start', 'Competing', 'Ended'][tstatus] }}</q-badge
          >
          <q-badge outline color="primary" class="q-mt-auto q-ml-md">{{
            countdown_text
          }}</q-badge>
          <div
            v-if="show_loading_mini"
            style="display: flex"
            class="q-mt-auto q-ml-md"
          >
            <q-spinner-gears size="20px" color="primary" />
            <p class="q-ma-none q-pa-none">刷新中</p>
          </div>
        </div>
      </q-card>
      <div style="display: flex; flex-wrap: wrap" class="q-ma-md">
        <div
          v-for="(item, idx) in contest_info.contestUser"
          :key="idx"
          class="q-pa-sm q-ma-sm"
          style="border-radius: 5px; width: 100px; cursor: default"
          :style="`background-color:${
            item.userOnline ? (item.userStatusErr ? 'red' : 'green') : 'grey'
          }`"
          @click="
            showUserDetail = true;
            userDetail_username = item.username;
            userDetail_dict = contest_info.contestUser[idx];
          "
        >
          <div class="text-h5" align="center">
            {{ item.username }}
          </div>
          <p align="center">{{ item.userOnline ? '在线' : '离线' }}</p>
          <p align="center">{{ item.userStatusErr ? '异常' : '正常' }}</p>
        </div>
      </div>
    </div>
    <div style="width: 30%; margin-left: auto">
      <InvigilatorUserDetail
        :username="userDetail_username"
        :contestId="userDetail_contestId"
        :userContestInfo="userDetail_dict"
      ></InvigilatorUserDetail>
    </div>
  </q-page>
  <q-page class="flex flex-center" v-if="show_loading">
    <loading-page :loading="show_loading" :message="err_msg"></loading-page>
  </q-page>
  <!-- <q-dialog v-model="showUserDetail">
    <q-card style="width: 600px">
      <InvigilatorUserDetail
        :username="userDetail_username"
        :contestId="userDetail_contestId"
      ></InvigilatorUserDetail>
    </q-card>
  </q-dialog> -->
</template>

<script>
import { ref, getCurrentInstance } from 'vue';
import { api as axios } from '@/boot/axios';
import { useRoute, useRouter } from 'vue-router';
// import VueMarkdownEditor from "@kangc/v-md-editor";
import '@kangc/v-md-editor/lib/style/base-editor.css';
// import vuepressTheme from "@kangc/v-md-editor/lib/theme/vuepress.js";
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import SubmissionList from '@/components/submissionList.vue';

import { useQuasar } from 'quasar';
import RankListComponent from '@/components/rankListComponent.vue';
import LoadingPage from '@/components/loadingPage.vue';
import InvigilatorUserDetail from '@/components/invigilatorUserDetail.vue';

function dateStrChangeTimeTamp(dateStr) {
  dateStr = dateStr.substring(0, 19);
  dateStr = dateStr.replace(/-/g, '/');
  return new Date(dateStr).getTime();
}

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'contest',
  watch: {
    $route(to, from) {
      console.log(to);
      this.getContestInfo();
    },
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const tab = ref('description');
    const $q = useQuasar();
    let this_route = useRoute();
    let this_router = useRouter();
    const contest_info = ref({});
    const show_loading = ref(true);
    const err_msg = ref('');
    const time_percent = ref(0);
    const qmarkstyle = ref('');
    const showPwdForm = ref(true);
    const tstatus = ref(0);
    const date_start = ref('2019-02-01 12:44');
    const date_end = ref('2019-02-01 12:44');
    const countdown_text = ref('');
    const use_custom_id = ref(false);
    let cgTimeTimerCountdown = null;
    const showUserDetail = ref('false');
    const userDetail_contestId = ref('');
    const userDetail_username = ref('');
    const show_loading_mini = ref(false);
    const userDetail_dict = ref({});

    let autoRefreshInfoTimer = null;

    const getWindowInfo = () => {
      // console.log(window.innerWidth)
      if (window.innerWidth > 850) {
        qmarkstyle.value = '';
      } else {
        qmarkstyle.value = `max-width:${window.innerWidth}px`;
      }
    };
    const timerCountdown = () => {
      var timeL = contest_info.value.contestTimeBeginStamp * 1000;
      var timeR = contest_info.value.contestTimeEndStamp * 1000;
      var curr = Date.now();
      var dit = parseInt((timeL - curr) / 1000);
      if (timeL <= curr) {
        // 已开始
        dit = parseInt((timeR - curr) / 1000);
      }
      var time_text = '';
      if (parseInt(dit / 3600 / 24))
        time_text += `${parseInt(dit / 3600 / 24)}天 `;
      dit %= 3600 * 24;
      time_text += `${parseInt(dit / 3600)}:`;
      dit %= 3600;
      time_text += `${parseInt(dit / 60)}:`;
      dit %= 60;
      time_text += `${parseInt(dit)}`;
      countdown_text.value = time_text;

      if (tstatus.value === 0 && timeL <= curr) {
        // 比赛开始，刷新网页
        getContestInfo();
        $q.notify({
          type: 'positive',
          message: '比赛开始',
          progress: true,
        });
      }
      if (tstatus.value == 1 && timeR <= curr) {
        $q.notify({
          type: 'negative',
          message: '比赛结束',
          progress: true,
        });
        countdown_text.value = '已结束';
        clearInterval(cgTimeTimerCountdown);
      }
    };

    const timeSecondToString = (tim) => {
      var s = '';
      console.log(tim);
      if (tim / (60 * 60 * 24)) s += `${parseInt(tim / (60 * 60 * 24))}天`;
      tim %= 60 * 60 * 24;
      if (tim / (60 * 60)) s += `${parseInt(tim / (60 * 60))}小时`;
      tim %= 60 * 60;
      if (tim % 60) s += `${parseInt(tim / 60)}分钟`;
      tim %= 60;
      if (tim) s += `${parseInt(tim)}秒`;
      return s;
    };
    const timeStampTostring = (tim) => {
      var timestamp = tim ? tim : null;
      let date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
      let Y = date.getFullYear();
      let M =
        date.getMonth() + 1 < 10
          ? '0' + (date.getMonth() + 1)
          : date.getMonth() + 1;
      let D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      let h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
      let m =
        date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
      let s =
        date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
      // return Y + M + D + h + m + s;
      return `${Y}-${M}-${D} ${h}:${m}:${s}`;
    };
    const getContestInfo = () => {
      show_loading_mini.value = true;
      // show_loading.value = true;
      // console.log(this_route)
      // console.log(this_route.path)
      if (
        this_route.path.toLowerCase() !==
        '/admin/invigilatorDetail'.toLowerCase()
      )
        return;
      if (this_route.query.id === undefined) {
        err_msg.value = '参数不完整';
        return;
      }
      axios({
        method: 'post',
        url: '/admin/invigilator/getInfo',
        data: {
          id: this_route.query.id,
        },
      })
        .then((data) => {
          // console.log('Success:', data);
          // 列表获取成功
          // console.log(data);
          contest_info.value = data.data;
          if (userDetail_contestId.value === '')
            userDetail_contestId.value = contest_info.value.contestId;
          if (userDetail_username.value === '')
            userDetail_username.value =
              contest_info.value.contestUser[0]['username'];
          if (userDetail_dict.value === {})
            userDetail_dict.value = contest_info.value.contestUser[0];
          if (
            contest_info.value['contestTimeBeginStamp'] >=
            Date.now() / 1000
          ) {
            tstatus.value = 0; // 未开始
          } else {
            if (
              contest_info.value['contestTimeEndStamp'] >=
              Date.now() / 1000
            ) {
              tstatus.value = 1; // 比赛中
            } else {
              tstatus.value = 2;
            }
          }
          timerCountdown();
          cgTimeTimerCountdown = setInterval(timerCountdown, 1000);

          document.title = `${contest_info.value.contestId}-${contest_info.value.contestTitle}-${proxy.$oj_name}`;
          show_loading.value = false;
          show_loading_mini.value = false;
        })
        .catch((error) => {
          console.error('Error:', error);
          try {
            if (error.response.status === 401) user.back_login();
            else if (error.response.status === 400)
              err_msg.value = error.response.data.detail;
            else err_msg.value = error.response.status;
          } catch {
            err_msg.value = error.code;
          }
        });
    };
    return {
      tab,
      show_loading,
      contest_info,
      time_percent,
      qmarkstyle,
      getContestInfo,
      getWindowInfo,
      showPwdForm,
      timeSecondToString,
      timeStampTostring,
      tstatus,
      date_start,
      date_end,
      use_custom_id,
      err_msg,
      timerCountdown,
      countdown_text,
      showUserDetail,
      userDetail_contestId,
      userDetail_username,
      show_loading_mini,
      autoRefreshInfoTimer,
      userDetail_dict,
    };
  },
  mounted() {
    window.addEventListener('resize', this.getWindowInfo);
    this.autoRefreshInfoTimer = setInterval(this.getContestInfo, 5 * 1000);
    this.getWindowInfo();
    this.getContestInfo();
  },
  unmounted() {
    window.removeEventListener('resize', this.getWindowInfo);
  },
  components: { LoadingPage, InvigilatorUserDetail },
};
</script>

<style scoped>
.content_main {
  width: 800px;
}

.bg_div {
  padding: 15px;
  display: flex;
  justify-content: center;
}
</style>
