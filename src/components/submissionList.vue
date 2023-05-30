<template>
  <q-page v-if="show_loading" class="flex flex-center">
    <loading-page :loading="show_loading" :message="err_msg"></loading-page>
  </q-page>
  <div
    v-if="!show_loading"
    style="
      width: 100%;
      flex-wrap: wrap;
      flex-direction: column;
      margin: 0;
      padding: 0;
    "
  >
    <div style="padding: 0; margin: 0">
      <div class="q-pa-md" style="padding: 0; margin: 0">
        <q-card class="q-pa-md" style="display: flex; flex-direction: column">
          <div
            class="q-gutter-md q-mb-sm"
            style="display: flex; flex-wrap: wrap"
          >
            <div class="text-h4">过滤</div>
            <div
              v-if="show_loading_mini"
              class="q-ml-md q-my-auto"
              style="display: flex"
            >
              <q-spinner-gears size="40px" color="primary" />
              <p class="q-my-auto">loading...</p>
            </div>
            <div class="q-my-auto" style="margin-left: auto">
              <q-btn color="primary" label="过滤" @click="filter_func_query" />
              <q-btn
                color="white"
                label="重置"
                text-color="black"
                @click="filter_func_reset"
              />
            </div>
          </div>
          <q-checkbox
            class="q-ml-md"
            v-model="filter_show_user_only"
            label="只看自己"
            dense
            style="width: fit-content"
          />
          <div
            class="q-gutter-sm q-ml-sm"
            style="display: flex; flex-direction: row; flex-wrap: wrap"
          >
            <div
              :style="
                'display: flex; flex-direction: column;width:' +
                (display_small_mode ? '100%' : '20%')
              "
            >
              <p style="margin: 0; padding: 0">由用户名/昵称</p>
              <q-input
                outlined
                v-model="filter_userLabel"
                dense
                class="q-my-auto"
              ></q-input>
            </div>
            <div
              :style="
                'display: flex; flex-direction: column;width:' +
                (display_small_mode ? '100%' : '20%')
              "
            >
              <p style="margin: 0; padding: 0">由题目ID</p>
              <q-input
                outlined
                v-model="filter_problemId"
                dense
                class="q-my-auto"
              ></q-input>
            </div>
            <div
              :style="
                'display: flex; flex-direction: column;width:' +
                (display_small_mode ? '100%' : '20%')
              "
            >
              <p style="margin: 0; padding: 0">由比赛</p>
              <q-input
                outlined
                v-model="filter_contest"
                dense
                class="q-my-auto"
              ></q-input>
            </div>
            <div
              :style="
                'display: flex; flex-direction: column;width:' +
                (display_small_mode ? '100%' : '20%')
              "
            >
              <p style="margin: 0; padding: 0">由语言</p>
              <q-select
                outlined
                v-model="filter_language"
                dense
                :options="filter_options_language"
              />
            </div>

            <div
              :style="
                'display: flex; flex-direction: column;width:' +
                (display_small_mode ? '100%' : '30%')
              "
            >
              <p style="margin: 0; padding: 0">由状态</p>
              <q-select
                outlined
                v-model="filter_status"
                dense
                :options="filter_options_status"
              />
            </div>
          </div>
        </q-card>

        <q-markup-table
          class="q-mt-md"
          v-show="!empty_content && !show_loading && !err_msg.length"
        >
          <thead>
            <tr>
              <th class="text-left" style="width: 10%">结果</th>
              <th class="text-left">问题编号</th>
              <th class="text-left" style="width: 5%">昵称</th>
              <th class="text-left" style="width: 5%">内存</th>
              <th class="text-left" style="width: 4%">耗时</th>
              <th class="text-left" style="width: 4%">语言</th>
              <th class="text-left" style="width: 8%">提交时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in submission_list" :key="item">
              <td style="margin: 0; padding: 0">
                <div
                  :style="'margin: 0;padding: 0;width: 100%;height: 100%;border-radius: 5px;display:flex;flex-direction:row'"
                >
                  <div
                    :style="`background-color:${item.boardColor};width: 5px;height:100%`"
                  ></div>

                  <a
                    class="q-my-auto q-ml-md"
                    :style="`color:${item.boardColor}`"
                    @click.prevent="
                      /* $router.push(`/record?sid=${item.submissionId}`) */
                      submissionId = item.submissionId;
                      showSubmitResult = true;
                    "
                    :href="`/record?sid=${item.submissionId}`"
                  >
                    {{ item.boardText }}
                  </a>
                </div>
              </td>
              <td class="text-left">
                <a
                  @click.prevent="
                    $router.push(`/problem?type=0&id=${item.sourceProblemId}`)
                  "
                  :href="`/problem?type=0&id=${item.sourceProblemId}`"
                  >{{
                    `${item.sourceProblemId}: ${item.sourceProblemTitle}`
                  }}</a
                >
              </td>
              <td class="text-left">
                <a
                  @click.prevent="
                    $router.push(`/userInfo?uid=${item.userDBId}`)
                  "
                  :href="`/userInfo?uid=${item.userDBId}`"
                  >{{ item.nickname }}</a
                >
              </td>
              <td class="text-left">{{ item.submissionRunMem + 'KB' }}</td>
              <td class="text-left">{{ item.submissionRunTime + 'MS' }}</td>
              <td class="text-left">{{ item.submissionCodeLanguage }}</td>
              <td class="text-left">
                {{ timestampToTime(item.submitTimeStamp) }}
              </td>
            </tr>
          </tbody>
        </q-markup-table>
        <q-card class="q-mt-md q-pa-md" v-if="err_msg.length">
          <p class="q-ma-none q-pa-none">{{ err_msg }}</p>
        </q-card>
      </div>

      <div class="q-pa-lg">
        <q-pagination
          v-model="current_page"
          :max="maxPage"
          :max-pages="6"
          direction-links
          @update:model-value="changePage"
        />
      </div>
    </div>

    <q-dialog v-model="showSubmitResult">
      <q-card style="width: 600px">
        <result-component :sid="submissionId"></result-component>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="js">
import { defineComponent, ref,defineExpose } from 'vue';
import {api as axios} from '@/boot/axios';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import ResultComponent from './resultComponent.vue';
import LoadingPage from '@/components/loadingPage.vue';

export default defineComponent({
    name: "submissionList",
    setup() {
        let this_route = useRoute();
        let this_router = useRouter();
        const $q = useQuasar();
        const submission_list = ref([{ "Id": "0000", "Title": "test", "Sovled": 6, "Submited": 10, "Rate": 6.6 }]);
        const current_page = ref(1);
        const maxPage = ref(1);
        const show_loading = ref(true);
        const show_loading_mini = ref(true);
        const empty_content = ref(false);
        const filter_options_language = ["All", "CPP", "Java", "Python3"];
        const filter_options_status = [
            "All",
            "UnknownError",
            "Pending",
            "Judging",
            "CompileError",
            "AC",
            "WA",
            "FormatError",
            "TLE",
            "MLE",
            "RuntimeError",
            "OutputOverRange",
            "SystemError",
            "MultipleError",
        ];
        const filter_options_status_dict = {};
        const filter_show_user_only = ref(false);
        const filter_userLabel = ref("");
        const filter_contest = ref("");
        const filter_problemId = ref("");
        const filter_language = ref("All");
        const filter_status = ref("All");
        const display_small_mode = ref(false);
        const need_update = ref("false");
        const err_msg = ref("");
        const showSubmitResult = ref(false)
        const submissionId = ref('')
        let refresh_timer = null

        const filter_func_reset = () => {
            filter_userLabel.value = filter_contest.value = "";
            filter_language.value = "All";
            filter_status.value = "All";
        };
        const filter_func_query = () => {
            getSubmissionList();
        };
        const getWindowInfo = () => {
            if (window.innerWidth > 500) {
                display_small_mode.value = false;
            }
            else {
                display_small_mode.value = true;
            }
        };
        const timestampToTime = (timestamp) => {
            timestamp = timestamp ? timestamp : null;
            let date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
            let Y = date.getFullYear();
            let M = (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1);
            let D = (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
            let h = (date.getHours() < 10 ? "0" + date.getHours() : date.getHours());
            let m = (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());
            let s = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
            // return Y + M + D + h + m + s;
            return `${Y}-${M}-${D} ${h}:${m}:${s}`;
        };
        const changePage = (newPage) => {
            // alert(newPage)
            current_page.value = newPage;
            getSubmissionList();
        };
        const getSubmissionList = () => {
            if (!(this_route.path.toLowerCase() === "/invigilator/contest".toLowerCase() || this_route.path.toLowerCase() === "/status".toLowerCase() || this_route.path.toLowerCase() === "/contest".toLowerCase() || this_route.path.toLowerCase() === "/problem".toLowerCase() || this_route.path.toLowerCase() === "/invigilator/problem".toLowerCase())) {
                return;
            }
            if (refresh_timer!==null) clearInterval(refresh_timer)
            // show_loading.value = true
            show_loading_mini.value = true;
            err_msg.value = "";
            // alert(this_route.path)
            var post_data = {};
            post_data = { "page": current_page.value };
            post_data["filter"] = {
                showSelfOnly: filter_show_user_only.value,
                userLabel: filter_userLabel.value,
                contest: filter_contest.value,
                language: filter_language.value,
                status: filter_status.value,
                problem: filter_problemId.value
            };
            post_data['via'] = (this_route.path==='/status' || this_route.path==='/problem' && this_route.query.type==='0')?0:1
            console.log(post_data);
            axios({
                method: "post",
                url: "/submission/getList",
                data: post_data
            }).then(data => {
                console.log("Success:", data);
                if (data.data.status === 1) // 列表获取成功
                 {
                    console.log(data);
                    let havPending = false
                    maxPage.value = data.data.maxPage;
                    submission_list.value = data.data.data;
                    for (var i = 0; i < submission_list.value.length; i++) {
                      if (submission_list.value[i]["submissionResultGeneral"] == 1) havPending = true;
                        if (submission_list.value[i]["submissionResultGeneral"] == 10) {
                            submission_list.value[i]["boardColor"] = "#17b978";
                            submission_list.value[i]["boardText"] = "Accepted";
                        }
                        else if (submission_list.value[i]["submissionResultGeneral"] == 11) {
                            submission_list.value[i]["boardColor"] = "red";
                            submission_list.value[i]["boardText"] = `WA:${submission_list.value[i]["submissionPassRate"]}%`;
                        }
                        else if (submission_list.value[i]["submissionResultGeneral"] == 19) {
                            submission_list.value[i]["boardColor"] = "purple";
                            submission_list.value[i]["boardText"] = `Mystery`;
                        }
                        else {
                            submission_list.value[i]["boardColor"] = "#ff8a5c";
                            switch (submission_list.value[i]["submissionResultGeneral"]) {
                                case 0:
                                    submission_list.value[i]["boardText"] = "UnknownError";
                                    break;
                                case 1:
                                    submission_list.value[i]["boardText"] = "Pending";
                                    break;
                                case 3:
                                    submission_list.value[i]["boardText"] = "CompileError";
                                    break;
                                case 12:
                                    submission_list.value[i]["boardText"] = "FormatError";
                                    break;
                                case 13:
                                    submission_list.value[i]["boardText"] = "TLE";
                                    break;
                                case 14:
                                    submission_list.value[i]["boardText"] = "MLE";
                                    break;
                                case 15:
                                    submission_list.value[i]["boardText"] = "RuntimeError";
                                    break;
                                case 16:
                                    submission_list.value[i]["boardText"] = "OutputOverRange";
                                    break;
                                case 17:
                                    submission_list.value[i]["boardText"] = "SystemError";
                                    break;
                                case 18:
                                    submission_list.value[i]["boardText"] = "MultipleError";
                                    break;
                                default: submission_list.value[i]["boardText"] = "UnknownError";
                            }
                            submission_list.value[i]["boardText"] += `:${submission_list.value[i]["submissionPassRate"]}%`;
                        }
                    }
                    if (submission_list.value.length == 0) {
                        err_msg.value = `没有检索结果`;
                        empty_content.value = true;
                    }
                    if (havPending)
                    {
                      refresh_timer = setInterval(getSubmissionList,3*1000)
                    }
                    show_loading.value = false;
                    show_loading_mini.value = false;
                    console.log(submission_list.value);
                }
                else {
                    err_msg.value = data.data.msg
          submission_list.value = []

                }
            })
                .catch((error) => {
                console.error("Error:", error);
                try {
            if (error.response.status === 401)
              this_router.push(
                `/userLogin?type=2&err=${error.response.data.detail}`
              );
            else if (error.response.status === 400)
              err_msg.value = error.response.data.detail;
            else err_msg.value = error.response.status;
          } catch {
            err_msg.value = error.code;
          }
          show_loading_mini.value = false
          submission_list.value = []
            });
        };
        return {
            changePage,
            getSubmissionList,
            show_loading,
            maxPage,
            current_page,
            submission_list,
            timestampToTime,
            filter_show_user_only,
            filter_contest,
            filter_language,
            filter_status,
            filter_userLabel,
            filter_options_language,
            filter_options_status,
            empty_content,
            getWindowInfo,
            display_small_mode,
            filter_func_query,
            filter_func_reset,
            filter_problemId,
            need_update,
            show_loading_mini,
            err_msg,
            showSubmitResult,
            submissionId,
            refresh_timer
        };
    },
    watch: {
        "$route"(to, from) {
            this.getSubmissionList();
        },
        "need_update"(to, from) {
            this.need_update = false;
            this.getSubmissionList();
        }
    },
    mounted() {
        window.addEventListener("resize", this.getWindowInfo);
        this.getWindowInfo();
        if (this.$route.path.toLowerCase() === "/contest".toLowerCase() || this.$route.path.toLowerCase() === "/invigilator/contest".toLowerCase()) {
            this.filter_contest = this.$route.query.cid;
        }
        else if (this.$route.path.toLowerCase() === "/problem".toLowerCase() || this.$route.path.toLowerCase() === "/invigilator/problem".toLowerCase()) {
            if (this.$route.query.type === "0") {
                this.filter_problemId = this.$route.query.id;
            }
            else {
                this.filter_contest = this.$route.query.cid;
                this.filter_problemId = this.$route.query.pid;
            }
        }
        this.getSubmissionList();
    },
    beforeUnmount() {
        // window.removeEventListener('resize', this.cancalDebounce);
        window.removeEventListener("resize", this.getWindowInfo);
        if (this.refresh_timer!==null) clearInterval(this.refresh_timer)
    },
    components: { ResultComponent, LoadingPage }
});
</script>
<style>
.progress_tip {
  display: none;
}
.progress_bar:hover .progress_tip {
  display: flex;
}
a {
  text-decoration: none;
  color: inherit;
}
</style>
