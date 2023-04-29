<template>
  <div class="bg_div" v-show="!show_loading">
    <div class="content_main">
      <q-card class="q-pa-lg q-my-md">
        <div class="q-gutter-md">
          <div class="text-h2" style="font-weight: bold">
            {{ contest_info.contestTitle }}
          </div>
          <div style="display: flex; flex-wrap: wrap">
            <q-badge color="primary">public</q-badge>
            <q-badge color="orange">{{
              ['Not start', 'Competing', 'Ended'][tstatus]
            }}</q-badge>
          </div>
          <div style="display: flex; justify-content: space-between">
            <p>
              Start:{{ timeStampTostring(contest_info.contestTimeBeginStamp) }}
            </p>
            <p>End:{{ timeStampTostring(contest_info.contestTimeEndStamp) }}</p>
          </div>
          <q-linear-progress
            size="15px"
            :value="time_percent"
            color="primary"
            class="q-my-sm"
            stripe
            style="text-align: center"
          >
          </q-linear-progress>
        </div>
      </q-card>

      <div
        style="
          display: flex;
          flex-direction: column;
          flex-wrap: wrap;
          justify-content: space-between;
          padding: 0;
        "
      >
        <q-card :style="qmarkstyle">
          <q-tabs
            v-model="tab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
            outside-arrows
            mobile-arrows
          >
            <q-tab name="description" label="description" />
            <q-tab name="problems" label="problems" />
            <q-tab name="submissions" label="submissions" />
            <q-tab name="rankList" label="rankList" />
            <q-tab name="notes" label="notes" />
          </q-tabs>
        </q-card>
        <q-card class="q-mt-md" :style="`width: 100%;${qmarkstyle};padding:0`">
          <q-tab-panels
            class="q-pa-sm"
            v-model="tab"
            animated
            @transition="tab_pannel_change"
            keep-alive
            style="padding: 0"
          >
            <q-tab-panel name="description" class="q-pa-none">
              <v-md-preview :text="contest_info.descriptionMd" />
            </q-tab-panel>
            <q-tab-panel name="problems" style="padding: 0; margin: 0">
              <q-markup-table style="margin: 0" flat bordered>
                <thead>
                  <tr>
                    <th class="text-left" style="width: 8%">Status</th>
                    <th class="text-left" style="width: 8%">ProblemId</th>
                    <th class="text-left">Title</th>
                    <th class="text-left" style="width: 5%">Solved</th>
                    <th class="text-left" style="width: 5%">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in contest_info.contestProblem" :key="item">
                    <td>
                      <!--q-icon name="done" style="color: #00c853" size="md" class="q-mr-sm"></q-icon-->
                      <q-icon
                        v-if="item.userStatus === 2"
                        name="done"
                        style="color: #00c853"
                        size="md"
                        class="q-mr-sm"
                      ></q-icon>
                      <q-icon
                        v-if="item.userStatus === 1"
                        name="close"
                        style="color: red"
                        size="md"
                        class="q-mr-sm"
                      ></q-icon>
                    </td>
                    <td class="text-left">{{ item.problemNo }}</td>
                    <td class="text-left">
                      <a
                        @click="
                          this.$router.push(
                            `/problem?type=1&&cid=${contest_info.contestId}&&pid=${item.problemNo}`
                          )
                        "
                        style="
                          color: #0d47a1;
                          cursor: pointer;
                          text-decoration: none;
                        "
                        :href="`/#/problem?type=1&&cid=${contest_info.contestId}&&pid=${item.problemNo}`"
                        >{{ item.problemName }}</a
                      >
                    </td>
                    <td class="text-left">{{ item.accpetCnt }}</td>
                    <td class="text-left">{{ item.submitCnt }}</td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-tab-panel>
            <q-tab-panel name="submissions" style="padding: 0; margin: 0">
              <submission-list></submission-list>
            </q-tab-panel>
            <q-tab-panel name="rankList">
              <rank-list-component
                :contestInfo="contest_info"
                style="width: fit-content"
              ></rank-list-component>
            </q-tab-panel>
            <q-tab-panel name="notes"></q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>
  </div>
  <q-inner-loading :showing="show_loading">
    <q-spinner-gears size="50px" color="primary" />
    <p>loading...</p>
  </q-inner-loading>
</template>

<script>
import { ref } from 'vue';
import { api as axios } from '@/boot/axios';
import { useRoute, useRouter } from 'vue-router';
// import VueMarkdownEditor from "@kangc/v-md-editor";
import '@kangc/v-md-editor/lib/style/base-editor.css';
// import vuepressTheme from "@kangc/v-md-editor/lib/theme/vuepress.js";
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import SubmissionList from '@/components/submissionList.vue';

import { useQuasar } from 'quasar';
import RankListComponent from '@/components/rankListComponent.vue';

function dateStrChangeTimeTamp(dateStr) {
  dateStr = dateStr.substring(0, 19);
  dateStr = dateStr.replace(/-/g, '/');
  return new Date(dateStr).getTime();
}

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'contest',
  components: { SubmissionList, RankListComponent },
  watch: {
    $route(to, from) {
      console.log(to);
      this.getContestInfo();
    },
  },
  setup() {
    const tab = ref('description');

    const $q = useQuasar();
    let this_route = useRoute();
    let this_router = useRouter();
    const contest_info = ref({});
    const show_loading = ref(true);
    const time_percent = ref(0);
    const qmarkstyle = ref('');
    const showPwdForm = ref(true);
    const tstatus = ref(0);

    const getWindowInfo = () => {
      // console.log(window.innerWidth)
      if (window.innerWidth > 850) {
        qmarkstyle.value = '';
      } else {
        qmarkstyle.value = `max-width:${window.innerWidth * 0.95}px`;
      }
    };
    let cgTimeTimer = null;
    const changeTimePercent = () => {
      var timeL = contest_info.value.contestTimeBeginStamp * 1000;
      var timeR = contest_info.value.contestTimeEndStamp * 1000;
      var curr = Date.now();
      var lenth = timeR - timeL + 1;
      // console.log(timeL,timeR,curr,lenth)
      if (timeL <= curr && curr <= timeR) {
        time_percent.value = (curr - timeL) / lenth;
      }
      if (curr > timeR) {
        time_percent.value = 1;
        clearInterval(cgTimeTimer);
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
      show_loading.value = true;
      if (cgTimeTimer !== null) {
        clearInterval(cgTimeTimer);
      }
      // console.log(this_route)
      // console.log(this_route.path)
      if (this_route.path.toLowerCase() !== '/contest'.toLowerCase()) return;
      if (this_route.query.cid === undefined) {
        alert('参数不完整');
        return;
      }
      axios({
        method: 'post',
        url: '/contest/getInfo',
        data: {
          contestId: this_route.query.cid,
          pwd: this_route.query.pwd ? this_route.query.pwd : '',
        },
      })
        .then((data) => {
          console.log('Success:', data);
          if (data.data.status === 1) {
            // 列表获取成功
            console.log(data);
            contest_info.value = data.data.data;
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
            changeTimePercent();
            cgTimeTimer = setInterval(changeTimePercent, 60 * 1000);
            show_loading.value = false;
          } else {
            // alert(data.msg)
            // showFailToast(data.data.msg)
          }
          show_loading.value = false;
        })
        .catch((error) => {
          show_loading.value = false;
          console.error('Error:', error);
          if (error.request.status === 401) {
            // localStorage.removeItem('Authorization');
            // showFailToast("登录状态失效，请重新登录")
            // router.push('/login');
          } else if (error.request.status === 400) {
            // showFailToast('获取签到情况失败');
            $q.notify({
              type: 'negative',
              message: error.response.data.detail,
              progress: true,
            });
          } else {
            $q.notify({
              type: 'negative',
              message: `网络错误，code=${error.request.status}`,
              progress: true,
            });
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
    };
  },
  mounted() {
    window.addEventListener('resize', this.getWindowInfo);
    this.getWindowInfo();
    this.getContestInfo();
  },
  unmounted() {
    window.removeEventListener('resize', this.getWindowInfo);
  },
};
</script>

<style scoped>
.content_main {
  width: 1000px;
}

.bg_div {
  padding: 15px;
  display: flex;
  justify-content: center;
}
</style>
