<template>
  <q-page>
    <div class="text-h4">{{ contest_info.contestTitle }}</div>
    <q-checkbox
      v-model="view_real_rank"
      label="查看实时榜单（如果当前已封榜）"
    ></q-checkbox>
    <RankListComponent
      v-if="!show_loading"
      :contestInfo="contest_info"
      :queryType="view_real_rank === true ? 1 : 0"
    ></RankListComponent>
  </q-page>
</template>

<script setup>
import RankListComponent from '@/components/rankListComponent.vue';
import { api as axios } from '@/boot/axios';
import { onMounted, ref, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const contest_info = ref({});
const show_loading = ref(true);
const this_route = useRoute();
const this_router = useRouter();
const { proxy } = getCurrentInstance();
const view_real_rank = ref(false);

function getContestInfo() {
  show_loading.value = true;
  // console.log(this_route)
  // console.log(this_route.path)
  if (this_route.path.toLowerCase() !== '/admin/viewRank'.toLowerCase()) return;
  if (this_route.query.cid === undefined) {
    alert('参数不完整');
    return;
  }
  axios({
    method: 'post',
    url: '/contest/getInfo',
    data: {
      contestId: this_route.query.cid,
      pwd: this_route.query.pwd ? this_route.query.pwd : '',
      urlType: 0,
    },
  })
    .then((data) => {
      // console.log('Success:', data);
      // 列表获取成功
      console.log(data);
      contest_info.value = data.data.data;

      document.title = `${contest_info.value.contestId}-${contest_info.value.contestTitle}-${proxy.$oj_name}`;
      show_loading.value = false;
    })
    .catch((error) => {
      console.error('Error:', error);
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&&err=${error.response.data.detail}`
          );
        else if (error.response.status === 400)
          err_msg.value = error.response.data.detail;
        else err_msg.value = error.response.status;
      } catch {
        err_msg.value = error.code;
      }
    });
}
onMounted(() => {
  getContestInfo();
});
</script>
