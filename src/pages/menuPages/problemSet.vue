<template>
  <q-page
    class="flex flex-center"
    style="flex-wrap: wrap; flex-direction: column"
  >
    <div v-show="!show_loading" style="width: 1000px">
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
              <th class="text-left" style="width: 5%">Status</th>
              <th class="text-left" style="width: 5%">Problem Id</th>
              <th class="text-left">Title</th>
              <th class="text-left">Sources</th>
              <th class="text-left" style="width: 5%">Solved</th>
              <th class="text-left" style="width: 5%">Submitted</th>
              <th class="text-left" style="width: 5%">Accpect rate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in problem_list" :key="item">
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
              <td class="text-left">{{ item.problemIdString }}</td>
              <td class="text-left">
                <a
                  @click="
                    this.$router.push(
                      `/problem?type=0&&id=${item.problemIdString}`
                    )
                  "
                  :href="`/#/problem?type=0&&id=${item.problemIdString}`"
                  style="color: #0d47a1; cursor: pointer; text-decoration: none"
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
    name: 'problemSet',
    setup() {
        let this_route = useRoute();
        let this_router = useRouter();
        const problem_list = ref([{ 'Id': '0000', 'Title': 'test', 'Sovled': 6, 'Submited': 10, 'Rate': 6.6 }]);
        const current_page = ref(1);
        const maxPage = ref(1)
        const show_loading = ref(true)
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
                url: '/problemSet/getList',
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
            getProblemList,
            show_loading,
            maxPage,
            current_page,
            problem_list
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
