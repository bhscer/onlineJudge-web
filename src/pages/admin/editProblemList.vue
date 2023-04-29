<template>
  <q-page
    class="flex flex-center"
    style="flex-wrap: wrap; flex-direction: column"
  >
    <div v-show="!show_loading" style="width: 800px">
      <div class="q-pa-md">
        <div style="display: flex">
          <q-btn
            outline
            color="primary"
            label="新增"
            size="lg"
            style="width: 100%"
            padding="xs xs"
            @click="this.$router.push(`/admin/editProblem?add=1`)"
          />
        </div>

        <q-markup-table>
          <thead>
            <tr>
              <th class="text-left" style="width: 5%">Problem Id</th>
              <th class="text-left">Title</th>
              <th class="text-left">Sources</th>
              <th class="text-left" style="width: 5%">Solved</th>
              <th class="text-left" style="width: 5%">Submitted</th>
              <th class="text-left" style="width: 10%">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in problem_list" :key="item">
              <td class="text-left">{{ item.problemIdString }}</td>
              <td class="text-left">
                <a
                  @click="
                    this.$router.push(
                      `/problem?type=0&&id=${item.problemIdString}`
                    )
                  "
                  :href="`/#/problem?type=0&&id=${item.problemIdString}`"
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
              <td>
                <a
                  @click="
                    this.$router.push(`/admin/editProblem?add=0&&id=${item.id}`)
                  "
                  :href="`/#/admin/editProblem?add=0&&id=${item.id}`"
                  style="color: inherit; cursor: pointer; text-decoration: none"
                  >Edit</a
                >
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
import { useQuasar } from 'quasar';

export default defineComponent({
    name: 'editProblemList',
    setup() {
        let this_route = useRoute();
        let this_router = useRouter();

        const $q = useQuasar();
        const problem_list = ref([{ 'Id': '0000', 'Title': 'test', 'Sovled': 6, 'Submited': 10, 'Rate': 6.6 }]);
        const current_page = ref(1);
        const maxPage = ref(1)
        const show_loading = ref(true)
        const changePage = (newPage) => {
            this_router.push({
                path: '/admin/editProblemList',
                    // name: 'index',
                    query: {
                        page:newPage
                    }
            })
        }
        const getProblemList = () => {
          console.log(this_route.path)
            show_loading.value = true
            if (this_route.path.toLowerCase() !== '/admin/editProblemList'.toLowerCase()) return;
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
                url: '/admin/problemList/getList',
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
                    }  else if (error.request.status === 400) {
                      // showFailToast('获取签到情况失败');
                      $q.notify({
                        type: 'negative',
                        message: error.response.data.detail,
                        progress: true,
                      });
                    }
                    else
                    {
                      $q.notify({
                        type: 'negative',
                        message: `网络错误，code=${error.request.status}`,
                        progress: true,
                      });
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
