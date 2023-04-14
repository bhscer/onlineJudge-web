<template>
  <div class="bg_div">
    <div class="content_main">
      <q-card class="q-pa-lg q-my-md">
        <div class="q-gutter-md">
          <div class="text-h2" style="font-weight: bold">
            {{ contest_info.contestTitle }}
          </div>
          <div style="display: flex; flex-wrap: wrap">
            <q-badge color="primary">public</q-badge>
            <q-badge color="orange">ended</q-badge>
          </div>
          <div style="display: flex; justify-content: space-between">
            <p>Start:{{ contest_info.contestTimeBegin }}</p>
            <p>End:{{ contest_info.contestTimeEnd }}</p>
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

        <q-separator />

        <q-tab-panels
          v-model="tab"
          animated
          @transition="tab_pannel_change"
          keep-alive
        >
          <q-tab-panel name="description">
            <v-md-preview :text="contest_info.descriptionMd" />
          </q-tab-panel>
          <q-tab-panel name="problems" style="padding: 0">
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
                  <td class="text-left">{{ item.accepted }}</td>
                  <td class="text-left">{{ item.submitted }}</td>
                </tr>
              </tbody>
            </q-markup-table>
          </q-tab-panel>
          <q-tab-panel name="submissions" style="padding: 0; margin: 0">
            <submission-list></submission-list>
          </q-tab-panel>
          <q-tab-panel name="rankList"></q-tab-panel>
          <q-tab-panel name="notes"></q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import {api as axios} from '@/boot/axios';
import { useRoute } from 'vue-router';
// import VueMarkdownEditor from "@kangc/v-md-editor";
import '@kangc/v-md-editor/lib/style/base-editor.css';
// import vuepressTheme from "@kangc/v-md-editor/lib/theme/vuepress.js";
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import SubmissionList from '@/components/submissionList.vue';

function dateStrChangeTimeTamp(dateStr) {
  dateStr = dateStr.substring(0, 19);
  dateStr = dateStr.replace(/-/g, '/');
  return new Date(dateStr).getTime();
}

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'contest',
  components: { SubmissionList },
  watch: {
    $route(to, from) {
      this.getContestInfo();
    },
  },
  setup() {
    const tab = ref('description');
    let this_route = useRoute();
    const contest_info = ref({});
    const show_loading = ref(true);
    const time_percent = ref(0);
    const qmarkstyle = ref('');
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
      var timeL = dateStrChangeTimeTamp(contest_info.value.contestTimeBegin);
      var timeR = dateStrChangeTimeTamp(contest_info.value.contestTimeEnd);
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
        },
      })
        .then((data) => {
          console.log('Success:', data);
          if (data.data.status === 1) {
            // 列表获取成功
            console.log(data);
            contest_info.value = data.data.data;
            changeTimePercent();
            cgTimeTimer = setInterval(changeTimePercent, 60 * 1000);
            show_loading.value = false;
          } else {
            // alert(data.msg)
            // showFailToast(data.data.msg)
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          if (error.request.status === 401) {
            // localStorage.removeItem('Authorization');
            // showFailToast("登录状态失效，请重新登录")
            // router.push('/login');
          } else {
            // showFailToast('获取签到情况失败');
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
