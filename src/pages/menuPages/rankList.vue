<template>
  <q-page
    class="flex flex-center"
    style="flex-wrap: wrap; flex-direction: column"
  >
    <q-card v-show="!show_loading">
      <q-markup-table>
        <thead>
          <tr>
            <th class="text-left" style="width: 10%">昵称</th>
            <th class="text-left" style="width: 8%">通过的问题数</th>
            <th class="text-left" style="width: 8%">尝试的问题数</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in total_rank_list" :key="item">
            <td class="text-left">
              <a
                @click.prevent="$router.push(`/userInfo?uid=${item.userDBId}`)"
                :href="`/userInfo?uid=${item.userDBId}`"
                style="color: inherit; cursor: pointer; text-decoration: none"
                >{{ item.nickname }}</a
              >
            </td>
            <td class="text-left">{{ item.solvedProblem }}</td>
            <td class="text-left">{{ item.triedProblem }}</td>
          </tr>
        </tbody>
      </q-markup-table>

      <div class="q-pa-lg">
        <q-pagination
          v-model="current_page"
          :max="maxPage"
          :max-pages="6"
          direction-links
          @update:model-value="changePage"
        />
      </div>
    </q-card>

    <loading-page :loading="show_loading" :message="err_msg"></loading-page>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { api as axios } from '@/boot/axios';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import LoadingPage from '@/components/loadingPage.vue';

export default defineComponent({
  name: 'rankList',
  components: { LoadingPage },
  setup() {
    const $q = useQuasar();
    let this_route = useRoute();
    let this_router = useRouter();

    const current_page = ref(1);
    const maxPage = ref(1);
    const show_loading = ref(true);
    const err_msg = ref('');
    const total_rank_list = ref([]);

    const changePage = (newPage) => {
      this_router.push({
        path: '/rankList',
        // name: 'index',
        query: {
          page: newPage,
        },
      });
    };

    const getTotalRankList = () => {
      show_loading.value = false;
      // return;
      show_loading.value = true;
      if (this_route.path.toLowerCase() !== '/rankList'.toLowerCase()) return;
      let post_data = {};
      if (this_route.query.page === undefined) {
        post_data = { page: 1 };
        current_page.value = 1;
      } else {
        if (parseInt(this_route.query.page)) {
          post_data = { page: parseInt(this_route.query.page) };
          current_page.value = parseInt(this_route.query.page);
        } else {
          show_loading.value = true;
          err_msg.value = '页码错误';
        }
      }
      console.log(post_data);
      axios({
        method: 'post',
        url: '/rank/getTotalList',
        data: post_data,
      })
        .then((data) => {
          // console.log('Success:', data);
          if (data.data.status === 1) {
            // 列表获取成功
            console.log(data);
            maxPage.value = data.data.maxPage;
            total_rank_list.value = data.data.data;
            show_loading.value = false;
          } else {
            // alert(data.msg)
            // showFailToast(data.data.msg)
            err_msg.value = data.data.msg;
            show_loading.value = false;
          }
        })
        .catch((error) => {
          console.error('Error:', error);
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
        });
    };

    return {
      current_page,
      changePage,
      maxPage,
      show_loading,
      err_msg,
      total_rank_list,
      getTotalRankList,
    };
  },
  mounted() {
    this.getTotalRankList();
  },
  watch: {
    $route(to, from) {
      this.getTotalRankList();
    },
  },
});
</script>
