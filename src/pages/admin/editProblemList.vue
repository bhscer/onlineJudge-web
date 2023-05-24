<template>
  <q-page
    class="flex flex-center"
    style="flex-wrap: wrap; flex-direction: column"
  >
    <div v-show="!show_loading" style="width: fit-content">
      <div class="q-pa-md">
        <div style="display: flex">
          <q-btn
            outline
            color="primary"
            label="新增"
            size="lg"
            style="width: 100%"
            padding="xs xs"
            @click.prevent="$router.push(`/admin/editProblem?add=1`)"
            href="/admin/editProblem?add=1"
          />
        </div>

        <q-markup-table>
          <thead>
            <tr>
              <th class="text-left" style="width: 5%">问题编号</th>
              <th class="text-left">标题</th>
              <th class="text-left">来源</th>
              <th class="text-left" style="width: 5%">通过</th>
              <th class="text-left" style="width: 5%">提交</th>
              <th class="text-left" style="width: 10%">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in problem_list" :key="item">
              <td class="text-left">{{ item.problemIdString }}</td>
              <td class="text-left">
                <a
                  @click.prevent="
                    $router.push(`/problem?type=0&&id=${item.problemIdString}`)
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
              <td>
                <q-badge color="primary" outline>
                  <a
                    @click.prevent="
                      $router.push(
                        `/admin/editProblemTestData?id=${item.problemIdString}`
                      )
                    "
                    :href="`/admin/editProblemTestData?id=${item.problemIdString}`"
                    style="
                      color: inherit;
                      cursor: pointer;
                      text-decoration: none;
                    "
                    >测试点管理</a
                  >
                </q-badge>
                <q-badge color="primary" outline class="q-ml-sm">
                  <a
                    @click.prevent="
                      $router.push(`/admin/editProblem?add=0&&id=${item.id}`)
                    "
                    :href="`/admin/editProblem?add=0&&id=${item.id}`"
                    style="
                      color: inherit;
                      cursor: pointer;
                      text-decoration: none;
                    "
                    >编辑</a
                  >
                </q-badge>

                <q-btn
                  class="q-my-auto q-ml-sm"
                  outline
                  color="red"
                  label="删除"
                  size="xs"
                  padding="xs xs"
                  @click="
                    showDeleteForm = true;
                    deleteInfo = item;
                  "
                />
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
  <q-dialog v-model="showDeleteForm" v-if="deleteInfo">
    <q-card class="q-pa-md">
      <div class="text-h4">你确定要删除？</div>
      <div>{{ deleteInfo.problemIdString }}</div>
      <div class="text-h6">
        <a
          @click.prevent="
            $router.push(`/problem?type=0&&id=${deleteInfo.problemIdString}`)
          "
          :href="`/problem?type=0&&id=${deleteInfo.problemIdString}`"
          style="color: inherit; cursor: pointer; text-decoration: none"
          >{{ deleteInfo.title }}</a
        >
      </div>
      <q-btn
        outline
        :loading="deleteing"
        color="red"
        label="删除"
        padding="xs xs"
        style="width: 100%"
        @click="deleteProblem(deleteInfo.id)"
      >
        <template v-slot:loading>
          <q-spinner-hourglass class="on-left" />
          删除中
        </template>
      </q-btn>
    </q-card>
  </q-dialog>
</template>

<script lang="js">
import { defineComponent, ref } from 'vue';
import {api as axios} from '@/boot/axios';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import LoadingPage from '@/components/loadingPage.vue';

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
        const err_msg = ref('')
        const showDeleteForm = ref(false)
        const deleteInfo = ref({})
        const deleteing = ref(false)

        const changePage = (newPage) => {
            this_router.push({
                path: '/admin/editProblemList',
                    // name: 'index',
                    query: {
                        page:newPage
                    }
            })
        }

        const deleteProblem = (id) => {
          deleteing.value = true
          axios({
            method: 'post',
            url: '/admin/problem/delete',
            data: {
              id:id
            },
          })
            .then((data) => {
              getProblemList();
              deleteing.value = false
              $q.notify({
                type: 'positive',
                message: '删除成功',
                progress: true,
              });
              showDeleteForm.value = false
            })
            .catch((error) => {
              // submiting.value = false;
              console.error('Error:', error);
              alert(error.response.data.detail);
              if (error.response.status === 401) {
                this_router.push('/userLogin?type=2')
              } else if (error.response.status === 400) {
                $q.notify({
                  type: 'negative',
                  message: error.response.data.detail,
                  progress: true,
                });
              } else {
                var err_code_info = ''
                try {
                  err_code_info = error.response.status;
                } catch {
                  err_code_info = error.code;
                }
                $q.notify({
                  type: 'negative',
                  message: `网络错误,code=${err_code_info}`,
                  progress: true,
                });
              }
            });
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
                url: '/admin/problem/getList',
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
                    try {
                      if (error.response.status === 401)
              this_router.push(`/userLogin?type=2&&err=${error.response.data.detail}`);
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
            getProblemList,
            show_loading,
            maxPage,
            current_page,
            problem_list,
            deleteInfo,
            showDeleteForm,
            deleteing,
            deleteProblem,
            err_msg
        };
    },
    watch:{
        '$route' (to, from) {
            this.getProblemList()
        }
    },
    mounted() {
        this.getProblemList()
    },

    components:{LoadingPage},
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
