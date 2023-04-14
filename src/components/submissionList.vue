<template>
  <q-page
    style="
      width: 100%;
      width: auto;
      flex-wrap: wrap;
      flex-direction: column;
      margin: 0;
      padding: 0;
      min-height: auto;
    "
  >
    <div v-show="!show_loading" style="padding: 0; margin: 0">
      <div class="q-pa-md" style="padding: 0">
        <q-card class="q-pa-md" style="display: flex; flex-direction: column">
          <div class="" style="display: flex">
            <h3 style="margin: 0">过滤</h3>
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
          <q-checkbox v-model="filter_show_user_only" label="只看自己" />
          <div
            class="q-gutter-md"
            style="display: flex; flex-direction: row; flex-wrap: wrap"
          >
            <div
              :style="
                'display: flex; flex-direction: column;width:' +
                (display_small_mode ? '100%' : '20%')
              "
            >
              <p>由用户名/昵称</p>
              <q-input
                outlined
                v-model="filter_userLabel"
                class="q-my-auto"
              ></q-input>
            </div>
            <div
              :style="
                'display: flex; flex-direction: column;width:' +
                (display_small_mode ? '100%' : '20%')
              "
            >
              <p>由题目ID</p>
              <q-input
                outlined
                v-model="filter_problemId"
                class="q-my-auto"
              ></q-input>
            </div>
            <div
              :style="
                'display: flex; flex-direction: column;width:' +
                (display_small_mode ? '100%' : '20%')
              "
            >
              <p>由比赛</p>
              <q-input
                outlined
                v-model="filter_contest"
                class="q-my-auto"
              ></q-input>
            </div>
            <div
              :style="
                'display: flex; flex-direction: column;width:' +
                (display_small_mode ? '100%' : '20%')
              "
            >
              <p>由语言</p>
              <q-select
                outlined
                v-model="filter_language"
                :options="filter_options_language"
              />
            </div>

            <div
              :style="
                'display: flex; flex-direction: column;width:' +
                (display_small_mode ? '100%' : '30%')
              "
            >
              <p>由状态</p>
              <q-select
                outlined
                v-model="filter_status"
                :options="filter_options_status"
              />
            </div>
          </div>
        </q-card>

        <div v-show="empty_content">暂无提交记录~</div>
        <q-markup-table class="q-mt-md" v-show="!empty_content">
          <thead>
            <tr>
              <th class="text-left" style="width: 10%">Status</th>
              <th class="text-left">Problem Id</th>
              <th class="text-left" style="width: 5%">NickName</th>
              <th class="text-left" style="width: 5%">Memory</th>
              <th class="text-left" style="width: 4%">Run Time</th>
              <th class="text-left" style="width: 4%">Language</th>
              <th class="text-left" style="width: 8%">Submit Time</th>
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
                    :href="`/#/record?sid=${item.submissionId}`"
                  >
                    {{ item.boardText }}
                  </a>
                </div>
              </td>
              <td class="text-left">
                <a :href="`/#/problem?type=0&&id=${item.sourceProblemId}`">{{
                  `${item.sourceProblemId}:${item.sourceProblemTitle}`
                }}</a>
              </td>
              <td class="text-left">
                <a :href="`/#/user?uid=${item.userDBId}`">{{
                  item.nickname
                }}</a>
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

    <q-inner-loading :showing="show_loading">
      <q-spinner-gears size="50px" color="primary" />
      <p>loading...</p>
    </q-inner-loading>
  </q-page>
</template>

<script lang="js">
import { defineComponent, ref } from 'vue';
import {api as axios} from '@/boot/axios';
import { useRoute, useRouter } from 'vue-router';

export default defineComponent({
    name: 'submissionList',
    setup() {
        let this_route = useRoute();
        let this_router = useRouter();
        const submission_list = ref([{ 'Id': '0000', 'Title': 'test', 'Sovled': 6, 'Submited': 10, 'Rate': 6.6 }]);
        const current_page = ref(1);
        const maxPage = ref(1)
        const show_loading = ref(true)
        const empty_content = ref(false)
        const filter_options_language = ['All','CPP','Java','Python3']
        const filter_options_status = [
          'All','UnknownError','Pending','Judging','CompileError','AC','WA','FormatError','TLE','MLE','RuntimeError',
          'OutputOverRange', 'SystemError','MultipleError',
        ]
        const filter_options_status_dict = {}
        const filter_show_user_only = ref(false)
        const filter_userLabel = ref('')
        const filter_contest = ref('')
        const filter_problemId = ref('')
        const filter_language = ref('All')
        const filter_status = ref('All')
        const display_small_mode = ref(false);


        const filter_func_reset = ()  => {
          filter_userLabel.value = filter_contest.value = ''
          filter_language.value = 'All'
          filter_status.value = 'All'
        }
        const filter_func_query = () => {
          getSubmissionList()
        }
        const getWindowInfo = () => {
          if (window.innerWidth > 500) {
            display_small_mode.value = false;
          } else {
            display_small_mode.value = true;
          }
        };
        const timestampToTime = (timestamp) => {
          timestamp = timestamp ? timestamp : null;
          let date = new Date(timestamp*1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
          let Y = date.getFullYear();
          let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
          let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
          let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
          let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
          let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
          // return Y + M + D + h + m + s;
          return `${Y}-${M}-${D} ${h}:${m}:${s}`
        }
        const changePage = (newPage) => {
          // alert(newPage)
          current_page.value = newPage
          getSubmissionList()
        }
        const getSubmissionList = () => {
            if (!(this_route.path.toLowerCase() === '/status'.toLowerCase() || this_route.path.toLowerCase() === '/contest'.toLowerCase() || this_route.path.toLowerCase() === '/problem'.toLowerCase())){
              return;
            }
            show_loading.value = true
            // alert(this_route.path)
            var post_data = {}
            post_data = { 'page': current_page.value };

            post_data['filter'] = {
              showSelfOnly:filter_show_user_only.value,
              userLabel:filter_userLabel.value,
              contest:filter_contest.value,
              language:filter_language.value,
              status:filter_status.value,
              problem:filter_problemId.value
            }

            /*
            if (this_route.path.toLowerCase() === '/status'.toLowerCase())
            {
              post_data['filter']['source'] = 'status'
            }
            else if (this_route.path.toLowerCase() === '/contest'.toLowerCase())
            {
              post_data['filter']['source'] = 'contest'
            }
            else if (this_route.path.toLowerCase() === '/problem'.toLowerCase())
            {
              if (this_route.query.type === '0') {

                post_data['filter']['source'] = 'problem'
              } else {

                post_data['filter']['source'] = 'contestProblem'
              }
            }
            else return
            */
            console.log(post_data)
            axios({
                method: 'post',
                url: '/submission/getList',
                data: post_data
            }) .then(data => {
                console.log('Success:', data);
                if (data.data.status === 1) // 列表获取成功
                {
                    console.log(data);
                    maxPage.value = data.data.maxPage;
                    submission_list.value = data.data.data;
                    for (var i=0;i<submission_list.value.length;i++)
                    {
                      if (submission_list.value[i]['submissionResultGeneral']==10)
                      {
                        submission_list.value[i]['boardColor'] = '#17b978'
                        submission_list.value[i]['boardText'] = 'Accepted'
                      }
                      else if (submission_list.value[i]['submissionResultGeneral']==11)
                      {
                        submission_list.value[i]['boardColor'] = 'red'
                        submission_list.value[i]['boardText'] = `WA:${submission_list.value[i]['submissionPassRate']}%`
                      }
                      else
                      {
                        submission_list.value[i]['boardColor'] = '#ff8a5c'
                        switch (submission_list.value[i]['submissionResultGeneral'])
                        {
                          case 0: submission_list.value[i]['boardText'] = 'UnknownError';break;
                          case 1: submission_list.value[i]['boardText'] = 'Pending';break;
                          case 3: submission_list.value[i]['boardText'] = 'CompileError';break;
                          case 12: submission_list.value[i]['boardText'] = 'FormatError';break;
                          case 13: submission_list.value[i]['boardText'] = 'TLE';break;
                          case 14: submission_list.value[i]['boardText'] = 'MLE';break;
                          case 15: submission_list.value[i]['boardText'] = 'RuntimeError';break;
                          case 16: submission_list.value[i]['boardText'] = 'OutputOverRange';break;
                          case 17: submission_list.value[i]['boardText'] = 'SystemError';break;
                          case 18: submission_list.value[i]['boardText'] = 'MultipleError';break;
                          default: submission_list.value[i]['boardText'] = 'UnknownError';
                        }
                        submission_list.value[i]['boardText']+= `:${submission_list.value[i]['submissionPassRate']}%`
                      }
                    }
                    if (submission_list.value.length==0) empty_content.value = true;
                    show_loading.value = false;
                    console.log(submission_list.value)
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
            filter_problemId
        };
    },
    watch:{
        '$route' (to, from) {
            this.getSubmissionList()
        }
    },
    mounted() {
        window.addEventListener('resize', this.getWindowInfo);
        this.getWindowInfo()

        if (this.$route.path.toLowerCase() === '/contest'.toLowerCase())
        {
          console.log('???')
          this.filter_contest = this.$route.query.cid
        }
        else if (this.$route.path.toLowerCase() === '/problem'.toLowerCase())
        {
          if (this.$route.query.type === '0') {
            this.filter_problemId = this.$route.query.id
          } else {
            this.filter_contest = this.$route.query.cid
            this.filter_problemId = this.$route.query.pid
          }
        }

        this.getSubmissionList()
    },
  beforeUnmount() {
    // window.removeEventListener('resize', this.cancalDebounce);
    window.removeEventListener('resize', this.getWindowInfo);
  },
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
