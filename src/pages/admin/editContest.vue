<template>
  <div class="bg_div" v-show="!show_loading">
    <div class="content_main">
      <div>{{ contest_info }}</div>
      <q-card class="q-pa-lg q-my-md">
        <div class="q-gutter-md">
          <q-input outlined v-model="contest_info.contestId" label="竞赛编号" />
          <q-input
            outlined
            v-model="contest_info.contestTitle"
            label="竞赛名称"
          />

          <q-input filled v-model="date_start" label="开始时间">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="date_start" mask="YYYY-MM-DD HH:mm">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-time
                    v-model="date_start"
                    mask="YYYY-MM-DD HH:mm"
                    format24h
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input filled v-model="date_end" label="结束时间">
            <template v-slot:prepend>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="date_end" mask="YYYY-MM-DD HH:mm">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:append>
              <q-icon name="access_time" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-time v-model="date_end" mask="YYYY-MM-DD HH:mm" format24h>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </q-card>

      <q-card class="q-pa-lg q-my-md">
        <div class="q-gutter-md">
          <q-checkbox
            dense
            v-model="contest_info.permission.needPwd"
            label="需要密码"
          />
          <q-input
            v-if="contest_info.permission.needPwd"
            outlined
            dense
            v-model="contest_info.pwdString"
            label="比赛密码"
          />
        </div>
      </q-card>

      <div>
        <div class="text-h5" style="font-weight: bold">描述</div>
        <v-md-editor
          v-model="contest_info.descriptionMd"
          height="400px"
        ></v-md-editor>
      </div>

      <div>
        <div class="text-h5" style="font-weight: bold">问题</div>
        <q-btn
          outline
          color="primary"
          label="一键修改序号(a,b..xyz)"
          size="xs"
          padding="xs xs"
          @click="changeProblemNo(0)"
        />
        <q-btn
          outline
          color="primary"
          label="一键修改序号(1,2..n)"
          size="xs"
          padding="xs xs"
          @click="changeProblemNo(1)"
        />
        <q-btn
          outline
          color="primary"
          label="在前方插入"
          size="xs"
          padding="xs xs"
          @click="
            contest_info.contestProblem.splice(0, 0, {
              problemNo: '',
              data: {
                sourceProblemId: '',
                isCustomTitle: false,
                customTitle: '',
              },
            })
          "
        />
        <div style="height: 400px; overflow: scroll; margin-top: 5px">
          <div
            v-for="(item, idx) in contest_info.contestProblem"
            :key="idx"
            style="padding-top: 20px"
          >
            <div>
              <strong>{{ `第${idx + 1}题` }}</strong>
              <q-btn
                outline
                color="red"
                label="删除"
                size="xs"
                padding="xs xs"
                @click="contest_info.contestProblem.splice(idx, 1)"
              />
              <q-btn
                outline
                color="primary"
                label="在前方插入"
                size="xs"
                padding="xs xs"
                @click="
                  contest_info.contestProblem.splice(idx, 0, {
                    problemNo: '',
                    data: {
                      sourceProblemId: '',
                      isCustomTitle: false,
                      customTitle: '',
                    },
                  })
                "
              />
            </div>
            <q-input outlined dense v-model="item.problemNo" label="题目序号" />
            <q-input
              outlined
              dense
              v-model="item.data.sourceProblemId"
              label="题目编号"
            />
            <q-checkbox
              dense
              v-model="item.data.isCustomTitle"
              label="自定题名"
            />
            <q-input
              v-if="item.data.isCustomTitle"
              outlined
              dense
              v-model="item.data.customTitle"
              label="自定题目名"
            />
          </div>
        </div>
      </div>

      <q-btn
        outline
        color="primary"
        label="提交"
        size="lg"
        style="width: 100%"
        padding="xs xs"
        @click="submitEdit()"
      />
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
import LoadingPage from '@/components/loadingPage.vue';

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
    const date_start = ref('2019-02-01 12:44');
    const date_end = ref('2019-02-01 12:44');
    const submitEdit = async () => {
      // submiting.value = true;
      // console.log('then',code_content)
      // 处理两个时间
      contest_info.value.contestTimeBeginStamp = parseInt(
        dateStrChangeTimeTamp(date_start.value) / 1000
      );
      contest_info.value.contestTimeEndStamp = parseInt(
        dateStrChangeTimeTamp(date_end.value) / 1000
      );
      axios({
        method: 'post',
        url: '/admin/contest/edit',
        data: {
          type: this_route.query.add,
          data: contest_info.value,
        },
      })
        .then((data) => {
          // submiting.value = false;
          console.log('submit Success:', data);
          $q.notify({
            type: 'positive',
            message: '提交成功',
            progress: true,
          });
        })
        .catch((error) => {
          // submiting.value = false;
          console.error('Error:', error);
          alert(error.response.data.detail);
          if (error.response.status === 401) {
            // localStorage.removeItem('Authorization');
            // showFailToast("登录状态失效，请重新登录")
            // router.push('/login');
          } else if (error.response.status === 400) {
            // showFailToast('获取签到情况失败');
            $q.notify({
              type: 'negative',
              message: error.response.data.detail,
              progress: true,
            });
          } else {
            $q.notify({
              type: 'negative',
              message: `网络错误,code=${error.response.status}`,
              progress: true,
            });
          }
        });
    };
    const changeProblemNo = (type) => {
      if (type === 0) {
        // a.b.c...z
        var csn = 1;
        for (var i = 0; i < contest_info.value.contestProblem.length; i++) {
          var csns = '';
          var csnt = csn;
          do {
            csns = String.fromCharCode(65 + ((csnt - 1) % 26)) + csns;
            csnt = parseInt((csnt - 1) / 26);
          } while (csnt);
          contest_info.value.contestProblem[i].problemNo = csns;
          csn++;
        }
      } else {
        for (var i = 0; i < contest_info.value.contestProblem.length; i++) {
          contest_info.value.contestProblem[i].problemNo = i + 1;
        }
      }
    };
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
      if (this_route.path.toLowerCase() !== '/admin/editContest'.toLowerCase())
        return;
      if (
        this_route.query.add === undefined ||
        (this_route.query.add === '0' && this_route.query.id === undefined)
      ) {
        alert('参数不完整');
        return;
      }
      if (this_route.query.add === '1') {
        contest_info.value = {
          contestId: '',
          contestTitle: '',
          permission: {
            isPublic: true,
            needPwd: false,
            pwdString: '',
            rangeOnly: false,
            stuRange: [],
            allowViewCodeAfterContest: true,
            languageLimit: false,
            languageList: [],
          },
          descriptionMd: '',
          contestTimeBeginStamp: parseInt(Date.now() / 1000 / 60) * 60,
          contestTimeEndStamp: parseInt(Date.now() / 1000 / 60) * 60,
          contestProblem: [
            /*
                    {
                      'problemNo':'',
                      'data':{
                        "sourceProblemId":"",
                        "isCustomTitle":false,
                        "customTitle":"",
                      }
                    }
                    */
          ],
        };
        date_start.value = timeStampTostring(
          contest_info.value.contestTimeBeginStamp
        );
        date_end.value = timeStampTostring(
          contest_info.value.contestTimeEndStamp
        );
        show_loading.value = false;
        return;
      }
      axios({
        method: 'post',
        url: '/admin/contest/getInfo',
        data: {
          id: this_route.query.id,
        },
      })
        .then((data) => {
          console.log('Success:', data);
          if (data.data.status === 1) {
            // 列表获取成功
            console.log(data);
            contest_info.value = data.data.data;
            date_start.value = timeStampTostring(
              contest_info.value.contestTimeBeginStamp
            );
            date_end.value = timeStampTostring(
              contest_info.value.contestTimeEndStamp
            );
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
          if (error.response.status === 401) {
            // localStorage.removeItem('Authorization');
            // showFailToast("登录状态失效，请重新登录")
            // router.push('/login');
          } else if (error.response.status === 400) {
            // showFailToast('获取签到情况失败');
            $q.notify({
              type: 'negative',
              message: error.response.data.detail,
              progress: true,
            });
          } else {
            $q.notify({
              type: 'negative',
              message: `网络错误，code=${error.response.status}`,
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
      date_start,
      date_end,
      changeProblemNo,
      submitEdit,
    };
  },
  mounted() {
    window.addEventListener('resize', this.getWindowInfo);
    this.date_start = this.date_end = this.timeStampTostring(
      parseInt(Date.now() / 1000 / 60) * 60
    );
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
  width: 800px;
}

.bg_div {
  padding: 15px;
  display: flex;
  justify-content: center;
}
</style>
