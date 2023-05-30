<template>
  <q-page
    class="flex flex-center"
    style="flex-wrap: wrap; flex-direction: column"
  >
    <q-card v-show="!show_loading" class="q-pa-md">
      <div class="text-h5 q-mb-sm">评测机状态</div>
      <p class="q-ma-none q-pa-none">
        {{ `CPU核心数:${judge_info.cpu_core}` }}
      </p>
      <p class="q-ma-none q-pa-none">{{ `CPU占用率:${judge_info.cpu}%` }}</p>
      <p class="q-ma-none q-pa-none">
        {{ `内存占用率:${judge_info.memory}%` }}
      </p>
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

    const show_loading = ref(true);
    const err_msg = ref('');
    const judge_info = ref({});

    const getJudgeStatus = () => {
      show_loading.value = false;
      // return;
      show_loading.value = true;
      if (this_route.path.toLowerCase() !== '/admin/judgeStatus'.toLowerCase())
        return;
      axios({
        method: 'post',
        url: '/admin/judger/status',
      })
        .then((data) => {
          // console.log('Success:', data);
          // 列表获取成功
          console.log(data);
          judge_info.value = data.data;
          show_loading.value = false;
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
      show_loading,
      err_msg,
      judge_info,
      getJudgeStatus,
    };
  },
  mounted() {
    this.getJudgeStatus();
  },
});
</script>
