<template>
  <q-page class="flex flex-center">
    <q-card>
    <q-markup-table class="q-mt-md" v-show="!show_loading && !err_msg.length">
          <thead>
            <tr>
              <th class="text-left" style="width: 10%">NickName</th>
              <th class="text-left" style="width: 8%">Solved Problem</th>
              <th class="text-left" style="width: 8%">Tried Problem</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in total_rank_list" :key="item">
              <td class="text-left">{{ item.nickname }}</td>
              <td class="text-left">{{ item.solvedProblem }}</td>
              <td class="text-left">{{ item.triedProblem }}</td>
            </tr>
          </tbody>
        </q-markup-table>

      <q-inner-loading :showing="show_loading">
      <q-spinner-gears size="50px" color="primary" />
      <p>loading...</p>
    </q-inner-loading>
  </q-card>

  </q-page>


</template>

<script>
import { defineComponent,ref } from 'vue';
import {api as axios} from '@/boot/axios'
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

export default defineComponent({
    name: "rankList",
    setup(){
      const $q = useQuasar();
      let this_route = useRoute();
      let this_router = useRouter();

      const current_page = ref(1);
      const maxPage = ref(1);
      const show_loading = ref(true);
      const err_msg = ref('')
      const total_rank_list = ref([])


      const getTotalRankList = () => {
          show_loading.value = false;
          // return;
          show_loading.value = true;
          if (this_route.path.toLowerCase() !== '/rankList'.toLowerCase())
            return;
          let post_data = {};
          if (this_route.query.page === undefined) {
            post_data = { page: 1 };
            current_page.value = 1;
          } else {
            try {
              post_data = { page: parseInt(this_route.query.page) };
              current_page.value = parseInt(this_route.query.page);
            } catch (e) {
              alert('页码错误');
            }
          }
          console.log(post_data);
          axios({
            method: 'post',
            url: '/rank/getTotalList',
            data: post_data,
          })
            .then((data) => {
              console.log('Success:', data);
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
                show_loading.value = false
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

      return{
        current_page,
        maxPage,
        show_loading,
        err_msg,
        total_rank_list,
        getTotalRankList
      }
    },
    mounted(){
      this.getTotalRankList();
    }
});
</script>
