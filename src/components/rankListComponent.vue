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
    v-show="!show_loading"
  >
    <div style="padding: 0; margin: 0">
      <div v-if="hideMsg.length" class="q-pa-md">{{ hideMsg }}</div>
      <div v-if="!hideMsg.length">
        <div style="display: flex; flex-direction: row">
          <div>
            <p class="q-my-none q-pa-sm">
              {{ rank_type === 1 ? '已封榜' : '实时排名' }}
            </p>
            <q-checkbox
              v-model="auto_refresh_flag"
              label="自动刷新"
              @click="auto_refresh_flag ? getRankList : null"
            ></q-checkbox>
          </div>
          <div
            v-if="show_loading_mini"
            class="q-ml-md q-my-auto"
            style="display: flex"
          >
            <q-spinner-gears size="40px" color="primary" />
            <p class="q-my-auto">loading...</p>
          </div>
        </div>

        <div class="q-pa-md" style="padding: 0; margin: 0">
          <q-markup-table
            class="q-mt-md"
            separator="cell"
            v-show="!empty_content && !show_loading && !err_msg.length"
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
                    :style="`width: 60px;height:50px;margin:0;`"
                    :class="`bg-${
                      itemrs.status === 1
                        ? 'red-6'
                        : itemrs.status === 2
                        ? 'green-6'
                        : 'deep-purple-3'
                    }`"
                  >
                    <p style="padding: 0; margin-bottom: 0">
                      {{
                        itemrs.status === 2
                          ? parseInt(itemrs.timeCost / 60)
                          : '&ensp;'
                      }}
                    </p>
                    <p style="margin-top: 6px; margin-bottom: 0">
                      {{
                        `${itemrs.tryCnt}${
                          itemrs.tryCntAftFrozen !== undefined &&
                          itemrs.tryCntAftFrozen > 0
                            ? '+' + itemrs.tryCntAftFrozen
                            : ''
                        }${
                          (itemrs.tryCnt + itemrs.tryCntAftFrozen !==
                            undefined && itemrs.tryCntAftFrozen > 0
                            ? itemrs.tryCntAftFrozen
                            : 0) <= 1
                            ? 'try'
                            : 'tries'
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

        <!-- <div class="q-pa-lg">
          <q-pagination
            v-model="current_page"
            :max="maxPage"
            :max-pages="6"
            direction-links
            @update:model-value="changePage"
          />
        </div> -->
      </div>
    </div>
  </q-page>
  <q-page class="flex flex-center" v-if="show_loading">
    <loading-page :loading="show_loading" :message="err_msg"></loading-page>
  </q-page>
</template>

<script lang="js">
import { defineComponent, ref,defineExpose,toRefs } from 'vue';
import {api as axios} from '@/boot/axios';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import LoadingPage from './loadingPage.vue';
import ThemeOsDefaultIcon from './icons/theme-os-default-icon.vue';

export default defineComponent({
    name: 'rankListComponent',
    components:{LoadingPage},
    setup(props) {
        let this_route = useRoute();
        let this_router = useRouter();
        const $q = useQuasar();

        const rank_list = ref([{ 'Id': '0000', 'Title': 'test', 'Sovled': 6, 'Submited': 10, 'Rate': 6.6 }]);
        const rank_type = ref(0)
        const current_page = ref(1);
        const maxPage = ref(1)
        const show_loading = ref(true)
        const show_loading_mini = ref(true)
        const empty_content = ref(false)
        const display_small_mode = ref(false);
        const need_update = ref(false);
        const err_msg = ref('')
        const hideMsg = ref('')
        const auto_refresh_flag = ref(true)
        const {contestInfo,queryType} = toRefs(props)
        const page_show = ref(true)
        let refreshTimer = null

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
            if (!(this_route.path.toLowerCase() === '/invigilator/contest'.toLowerCase() || this_route.path.toLowerCase() === '/contest'.toLowerCase() || this_route.path.toLowerCase() === '/admin/viewRank'.toLowerCase())){
              return;
            }
            console.log('show:',page_show.value);
            if (refreshTimer!==null) clearInterval(refreshTimer)
            // show_loading.value = true
            show_loading_mini.value = true
            err_msg.value = ''
            // alert(this_route.path)
            var post_data = {}
            post_data = { 'page': current_page.value };

            post_data['contestId'] = this_route.query.cid
            // contestInfo.value.contestId // this_route.query.cid?this_route.query.cid:'All'
            post_data['queryType'] = queryType.value
            console.log(post_data)
            axios({
                method: 'post',
                url: '/rank/getList',
                data: post_data
            }) .then(data => {
                // console.log('Success:', data);
                if (data.data.status === 1) // 列表获取成功
                {
                    console.log(data);
                    maxPage.value = data.data.maxPage;
                    rank_type.value = data.data.type
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

                    if (auto_refresh_flag.value===true && page_show.value===true)
                    {
                      refreshTimer = setInterval(getRankList,5*1000);
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
                    try {
                      if (error.response.status === 401) route.push('/userLogin?type=2')
                      else if (error.response.status === 400)
                        err_msg.value = error.response.data.detail;
                      else err_msg.value = error.response.status;
                    } catch {
                      err_msg.value = error.code;
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
            hideMsg,
            rank_type,
            auto_refresh_flag,
            page_show
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
      if (this.auto_refresh_flag!==null) clearInterval(this.auto_refresh_flag)
    },
    watch:{
      queryType (to,from){
        console.log(from,'->',to)
        this.getRankList()
      },
      need_update (to,from) {
        this.need_update = false
        this.getRankList()
      }
    },
    props:{
      'contestInfo':{
        require:true
      },
      'queryType':{
        default:0
      }
    }
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
