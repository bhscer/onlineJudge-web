<template>
  <q-page
    style="
      width: max-content;
      flex-wrap: wrap;
      flex-direction: column;
      margin: 0;
      padding: 0;
      min-height: auto;
    "
  >
    <div v-show="!show_loading" style="padding: 0; margin: 0">
      <div v-if="hideMsg.length">{{ hideMsg }}</div>
      <div v-if="!hideMsg.length">
        <div class="q-pa-md" style="padding: 0; margin: 0">
          <q-markup-table
            class="q-mt-md"
            separator="cell"
            v-show="
              !empty_content &&
              !show_loading &&
              !show_loading_mini &&
              !err_msg.length
            "
          >
            <thead>
              <tr>
                <th class="text-left">Rank</th>
                <th class="text-left">Name</th>
                <th class="text-left">Score</th>
                <th
                  class="text-center"
                  v-for="item in contestInfo.contestProblem"
                  :key="item"
                >
                  {{ item.problemNo }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in rank_list" :key="item">
                <td class="text-left">{{ item.rank }}</td>
                <td class="text-left">{{ item.name }}</td>
                <td>
                  <div>
                    <strong>{{ item.solved }}</strong>
                    <span style="margin-left: 8px">{{
                      parseInt(item.timeCostWithPenalties / 60)
                    }}</span>
                  </div>
                </td>
                <td
                  class="text-left"
                  style="padding: 0; width: fit-content; height: fit-content"
                  v-for="itemrs in item.res"
                  :key="itemrs"
                >
                  <div
                    v-if="!itemrs.status"
                    align="center"
                    style="width: 60px; height: 50px"
                  ></div>
                  <div
                    v-if="itemrs.status"
                    align="center"
                    :style="`width: 60px;height:50px;margin:0;background-color:${
                      itemrs.status === 1
                        ? '#e87272'
                        : itemrs.status === 2
                        ? '#60e760'
                        : ''
                    };`"
                  >
                    <p style="padding: 0; margin-bottom: 0">
                      {{
                        itemrs.status === 2
                          ? parseInt(itemrs.timeCost / 60)
                          : ''
                      }}
                    </p>

                    <p style="margin-top: 6px; margin-bottom: 0">
                      {{
                        `${itemrs.tryCnt} ${
                          itemrs.tryCnt <= 1 ? 'try' : 'tries'
                        }`
                      }}
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </q-markup-table>
          <q-card
            class="q-mt-md q-"
            style="display: flex; justify-content: center"
          >
            <div class="text-h3">{{ err_msg }}</div>
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
    </div>

    <q-inner-loading :showing="show_loading">
      <q-spinner-gears size="50px" color="primary" />
      <p>loading...</p>
    </q-inner-loading>
  </q-page>
</template>

<script lang="js">
import { defineComponent, ref,defineExpose,toRefs } from 'vue';
import {api as axios} from '@/boot/axios';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

export default defineComponent({
    name: 'rankListComponent',
    setup(props) {
        let this_route = useRoute();
        let this_router = useRouter();
        const $q = useQuasar();

        const rank_list = ref([{ 'Id': '0000', 'Title': 'test', 'Sovled': 6, 'Submited': 10, 'Rate': 6.6 }]);
        const current_page = ref(1);
        const maxPage = ref(1)
        const show_loading = ref(true)
        const show_loading_mini = ref(true)
        const empty_content = ref(false)
        const display_small_mode = ref(false);
        const need_update = ref('false');
        const err_msg = ref('')
        const hideMsg = ref('')
        const {contestInfo} = toRefs(props)

        const getWindowInfo = () => {
          if (window.innerWidth > 500) {
            display_small_mode.value = false;
          } else {
            display_small_mode.value = true;
          }
        };

        const changePage = (newPage) => {
          // alert(newPage)
          current_page.value = newPage
          getRankList()
        }
        const getRankList = () => {
            if (!(this_route.path.toLowerCase() === '/rankList'.toLowerCase() || this_route.path.toLowerCase() === '/contest'.toLowerCase())){
              return;
            }
            // show_loading.value = true
            show_loading_mini.value = true
            err_msg.value = ''
            // alert(this_route.path)
            var post_data = {}
            post_data = { 'page': current_page.value };

            post_data['contestId'] = this_route.query.cid?this_route.query.cid:'All'

            console.log(post_data)
            axios({
                method: 'post',
                url: '/rank/getList',
                data: post_data
            }) .then(data => {
                console.log('Success:', data);
                if (data.data.status === 1) // 列表获取成功
                {
                    console.log(data);
                    maxPage.value = data.data.maxPage;
                    rank_list.value = [];
                    for (var i=0;i<data.data.data.length;i++)
                    {
                      var tmp_dict = data.data.data[i]
                      tmp_dict['res'] = []
                      for (var j=0;j<contestInfo.value.contestProblem.length;j++)
                      {
                        var tmp_tmp_dict = {}
                        if (data.data.data[i]['result'][contestInfo.value.contestProblem[j]['problemNo']]===undefined)
                        {
                          tmp_tmp_dict = {
                            'mark':0,
                            'status':0,
                            'timeCost':0,
                            'timeCostWithPenalties':0,
                            'tryCnt':0
                          }
                        }
                        else{
                          tmp_tmp_dict = data.data.data[i]['result'][contestInfo.value.contestProblem[j]['problemNo']]
                        }
                        tmp_dict['res'].push(tmp_tmp_dict)
                      }
                      rank_list.value.push(tmp_dict)
                    }
                    rank_list.value.sort(function(a,b){
                      if (a.res.solved != b.res.solved) return a.res.solved > b.res.solved
                      return a.res.timeCostWithPenalties < b.res.timeCostWithPenalties
                    })
                    for (var i=0;i<rank_list.value.length;i++)
                    {
                      rank_list.value[i]['rank'] = i+1
                    }

                    show_loading.value = false;
                    show_loading_mini.value = false;
                } else {
                    // alert(data.msg)
                    // showFailToast(data.data.msg)
                    hideMsg.value = data.data.msg;
                    show_loading.value = false;
                    show_loading_mini.value = false;
                }
            })
                .catch((error) => {
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
                      err_msg.value = error.response.data.detail
                    }
                    else
                    {
                      err_msg.value = `未知错误,代码为${error.request.status}`
                    }
                });
        };
        return {
            changePage,
            getRankList,
            show_loading,
            maxPage,
            current_page,
            rank_list,
            empty_content,
            getWindowInfo,
            display_small_mode,
            need_update,
            show_loading_mini,
            err_msg,
            hideMsg
        };



    },
    watch:{
        '$route' (to, from) {
            this.getRankList()
        },
        'need_update' (to,from) {
          this.need_update = false;
          this.getRankList()
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
        console.log(this.contestInfo)

        this.getRankList()
    },
    beforeUnmount() {
      // window.removeEventListener('resize', this.cancalDebounce);
      window.removeEventListener('resize', this.getWindowInfo);
    },
    props:[
      'contestInfo'
    ]
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
