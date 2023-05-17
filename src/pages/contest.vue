<template>
  <div class="bg_div" v-show="!show_loading">
    <div class="content_main">
      <q-card class="q-pa-lg q-my-md">
        <div class="q-gutter-md">
          <div class="text-h2" style="font-weight: bold">
            {{ contest_info.contestTitle }}
          </div>
          <div style="display: flex; flex-wrap: wrap">
            <q-badge color="primary">{{
              `${contest_info.permission?.needPwd ? '需要密码' : '公开'}`
            }}</q-badge>
            <q-badge color="orange">{{
              ['未开始', '比赛中', '已封榜', '已结束'][tstatus]
            }}</q-badge>
          </div>
          <div style="display: flex; justify-content: space-between">
            <p>
              Start:{{ timeStampTostring(contest_info.contestTimeBeginStamp) }}
            </p>
            <p>End:{{ timeStampTostring(contest_info.contestTimeEndStamp) }}</p>
          </div>
          <q-linear-progress
            v-if="tstatus"
            size="15px"
            :value="time_percent"
            :color="`${tstatus === 2 ? 'light-blue-7' : 'primary'}`"
            class="q-my-sm"
            stripe
            style="text-align: center"
          >
          </q-linear-progress>
        </div>
      </q-card>
      <q-card v-if="!tstatus" class="q-py-lg">
        <div class="text-h6" align="center">距离开始还有</div>
        <div class="text-h4" align="center">
          {{ countdown_text }}
        </div>
      </q-card>
      <div
        class="q-mt-sm"
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
            <q-tab name="problems" label="problems" v-if="tstatus" />
            <q-tab name="submissions" label="submissions" v-if="tstatus" />
            <q-tab name="rankList" label="rankList" v-if="tstatus" />
            <q-tab name="notes" label="notes" v-if="tstatus" />
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
                        @click.prevent="
                          this.$router.push(
                            `/problem?type=1&&cid=${
                              contest_info.contestId
                            }&&pid=${item.problemNo}${
                              contest_info.permission.needPwd
                                ? this.$route.query.pwd
                                  ? '&&pwd=' + this.$route.query.pwd
                                  : ''
                                : ''
                            }`
                          )
                        "
                        style="
                          color: inherit;
                          cursor: pointer;
                          text-decoration: none;
                        "
                        :href="`/problem?type=1&&cid=${
                          contest_info.contestId
                        }&&pid=${item.problemNo}${
                          contest_info.permission.needPwd
                            ? this.$route.query.pwd
                              ? '&&pwd=' + this.$route.query.pwd
                              : ''
                            : ''
                        }`"
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
            <q-tab-panel name="rankList" class="q-ma-none q-pa-none">
              <rank-list-component
                class="q-ma-none q-pa-none"
                :contestInfo="contest_info"
              ></rank-list-component>
            </q-tab-panel>
            <q-tab-panel name="notes"></q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>
  </div>
  <q-page class="flex flex-center" v-show="show_loading">
    <loading-page :loading="show_loading" :message="err_msg"></loading-page>
  </q-page>
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
import form from '@/i18n/zh-CN/form';

function dateStrChangeTimeTamp(dateStr) {
  dateStr = dateStr.substring(0, 19);
  dateStr = dateStr.replace(/-/g, '/');
  return new Date(dateStr).getTime();
}

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'contest',
  components: { SubmissionList, RankListComponent, LoadingPage },
  watch: {
    $route(to, from) {
      console.log(to);
      this.getContestInfo();
    },
  },
  setup() {
    const tab = ref('description');
    const { proxy } = getCurrentInstance();
    const $q = useQuasar();
    let this_route = useRoute();
    let this_router = useRouter();
    const contest_info = ref({});
    const show_loading = ref(true);
    const time_percent = ref(0);
    const qmarkstyle = ref('');
    const showPwdForm = ref(true);
    const tstatus = ref(0);
    const err_msg = ref('');
    const countdown_text = ref('00:00:00');
    let cgTimeTimer = null;
    let cgTimeTimerCountdown = null;

    const getWindowInfo = () => {
      // console.log(window.innerWidth)
      if (window.innerWidth > 1000) {
        qmarkstyle.value = '';
      } else {
        qmarkstyle.value = `max-width:${window.innerWidth * 0.95}px`;
      }
    };
    const changeTimePercent = () => {
      var timeL = contest_info.value.contestTimeBeginStamp * 1000;
      var timeFrozen = contest_info.value.contestFrozeTimeStamp * 1000;
      var timeR = contest_info.value.contestTimeEndStamp * 1000;
      var curr = Date.now();
      var lenth = timeR - timeL + 1;
      // console.log(timeL,timeR,curr,lenth)
      if (timeL <= curr && curr <= timeR) {
        time_percent.value = (curr - timeL) / lenth;
        tstatus.value = 1;
        if (contest_info.value.needFroze && curr >= timeFrozen) {
          tstatus.value = 2;
        }
      }
      if (curr > timeR) {
        time_percent.value = 1;
        tstatus.value = 3;
        clearInterval(cgTimeTimer);
      }
    };
    const timerCountdown = () => {
      var timeL = contest_info.value.contestTimeBeginStamp * 1000;
      var curr = Date.now();
      var dit = parseInt((timeL - curr) / 1000);
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

      if (timeL <= curr) {
        // 比赛开始，刷新网页
        getContestInfo();
        $q.notify({
          type: 'positive',
          message: '比赛开始',
          progress: true,
        });
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
          urlType: 0,
        },
      })
        .then((data) => {
          console.log('Success:', data);
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
              if (
                contest_info.value['needFroze'] &&
                contest_info.value['contestFrozeTimeStamp'] <= Date.now() / 1000
              ) {
                tstatus.value = 2;
              }
            } else {
              tstatus.value = 3;
            }
          }
          if (tstatus.value) {
            changeTimePercent();
            cgTimeTimer = setInterval(changeTimePercent, 60 * 1000);
          } else {
            timerCountdown();
            cgTimeTimerCountdown = setInterval(timerCountdown, 1000);
          }
          document.title = `${contest_info.value.contestId}-${contest_info.value.contestTitle}-${proxy.$oj_name}`;
          show_loading.value = false;
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
      err_msg,
      timerCountdown,
      cgTimeTimerCountdown,
      cgTimeTimer,
      countdown_text,
    };
  },
  mounted() {
    window.addEventListener('resize', this.getWindowInfo);
    this.getWindowInfo();
    this.getContestInfo();
    if (
      this.$route.hash &&
      ['description', 'problems', 'submissions', 'rankList', 'notes'].indexOf(
        this.$route.hash.substring(1)
      ) !== -1
    ) {
      this.tab = this.$route.hash.substring(1);
    }
    console.log(this.$route.query);
  },
  unmounted() {
    window.removeEventListener('resize', this.getWindowInfo);
    if (this.cgTimeTimerCountdown !== null)
      clearInterval(this.cgTimeTimerCountdown);
    if (this.cgTimeTimer !== null) clearInterval(this.cgTimeTimer);
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
