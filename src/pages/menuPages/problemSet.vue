<template>
  <q-page
    class="flex flex-center"
    style="flex-wrap: wrap; flex-direction: column"
  >
    <div v-show="!show_loading" style="width: 900px">
      <div class="q-pa-md">
        <div style="display: flex" v-if="false">
          <p class="q-my-auto">搜索</p>
          <q-input rounded outlined v-model="text" class="q-my-auto">
            <template v-slot:prepend>
              <q-icon name="search"></q-icon>
            </template>
          </q-input>
        </div>

        <q-markup-table>
          <thead>
            <tr>
              <th class="text-left" style="width: 3%">状态</th>
              <th class="text-left" style="width: 5%">问题编号</th>
              <th class="text-left">标题</th>
              <th class="text-left">来源</th>
              <th class="text-left" style="width: 5%">通过</th>
              <th class="text-left" style="width: 5%">提交</th>
              <th class="text-left" style="width: 5%">通过率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in problem_list" :key="item">
              <td class="q-ma-none q-pa-none">
                <!--q-icon name="done" style="color: #00c853" size="md" class="q-mr-sm"></q-icon-->
                <q-icon
                  v-if="item.userStatus === 2"
                  name="done"
                  style="color: #00c853"
                  size="md"
                ></q-icon>
                <q-icon
                  v-if="item.userStatus === 1"
                  name="close"
                  style="color: red"
                  size="md"
                ></q-icon>
              </td>
              <td class="text-left">{{ item.problemIdString }}</td>
              <td class="text-left">
                <a
                  @click.prevent="
                    item.public ||
                    (user.info && user.info.permission !== 'user')
                      ? $router.push(
                          `/problem?type=0&&id=${item.problemIdString}`
                        )
                      : $q.notify({
                          type: 'negative',
                          message: '题目未公开',
                          progress: true,
                        })
                  "
                  :href="`/problem?type=0&&id=${item.problemIdString}`"
                  style="color: inherit; cursor: pointer; text-decoration: none"
                  >{{ item.title }}</a
                >
              </td>
              <td>
                <div v-for="sit in item.source" :key="sit">
                  <q-badge color="primary">{{ sit }}</q-badge>
                </div>
              </td>
              <td class="text-left">{{ item.accepted }}</td>
              <td class="text-left">{{ item.submitted }}</td>
              <td class="text-left">
                <q-linear-progress
                  size="15px"
                  :value="item.acPercent / 100"
                  color="primary"
                  class="q-my-sm progress_bar"
                  style="text-align: center"
                >
                  <div class="absolute-full flex flex-center progress_tip">
                    <q-badge
                      color="white"
                      text-color="primary"
                      :label="item.acPercent + '%'"
                    />
                  </div>
                </q-linear-progress>
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

    <loading-page :loading="show_loading" :message="err_msg"></loading-page>
  </q-page>
</template>

<script lang="js">
import { defineComponent, ref } from 'vue';
import {api as axios} from '@/boot/axios';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import LoadingPage from '@/components/loadingPage.vue';
import { useUserStore } from '@/stores/user';

export default defineComponent({
    name: 'problemSet',
    components: { LoadingPage },
    setup() {
        let this_route = useRoute();
        let this_router = useRouter();
        const $q = useQuasar();
        const problem_list = ref([{ 'Id': '0000', 'Title': 'test', 'Sovled': 6, 'Submited': 10, 'Rate': 6.6 }]);
        const current_page = ref(1);
        const maxPage = ref(1)
        const show_loading = ref(true)
        const err_msg = ref('')
        const user = useUserStore();

        const changePage = (newPage) => {
            this_router.push({
                path: '/problemSet',
                    // name: 'index',
                    query: {
                        page:newPage
                    }
            })
        }
        const getProblemList = () => {
            show_loading.value = true
            if (this_route.path.toLowerCase() !== '/problemSet'.toLowerCase()) return;
            let post_data = {};
            if (this_route.query.page === undefined) {
                post_data = { 'page': 1 };
                current_page.value = 1;
            } else {
                try {
                    post_data = { 'page': parseInt(this_route.query.page) };
                    current_page.value = parseInt(this_route.query.page);
                }
                catch (e)
                {
                    alert('页码错误')
                }
            }
            console.log(post_data)
            axios({
                method: 'post',
                url: '/problem/getList',
                data: post_data
            }) .then(data => {
                console.log('Success:', data);
                if (data.data.status === 1) // 列表获取成功
                {
                    console.log(data);
                    maxPage.value = data.data.maxPage;
                    problem_list.value = data.data.data;
                    show_loading.value = false;
                } else {
                    // alert(data.msg)
                    // showFailToast(data.data.msg)
                }
            })
                .catch((error) => {
                    console.error('Error:', error);
                    try{
                      if (error.response.status === 401) this_router.push('/userLogin?type=2')
                      else if (error.response.status === 400) err_msg.value = error.response.data.detail
                      else err_msg.value = error.response.status
                    }
                    catch{
                      err_msg.value = error.code
                    }
                });
        };
        return {
            changePage,
            getProblemList,
            show_loading,
            maxPage,
            current_page,
            problem_list,
            err_msg,
            user
        };
    },
    watch:{
        '$route' (to, from) {
            this.getProblemList()
        }
    },
    mounted() {
        this.getProblemList()
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
</style>
