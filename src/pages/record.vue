<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page class="flex flex-center q-pa-lg q-ma-lg">
    <div style="width: max-content; flex-direction: column">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="points" label="Points" />
        <q-tab name="code" label="Code" />
      </q-tabs>

      <q-separator />

      <q-tab-panels
        v-model="tab"
        animated
        @transition="tab_pannel_change"
        keep-alive
      >
        <q-tab-panel name="login"> </q-tab-panel>
        <q-tab-panel name="register"> </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { apiUrl } from 'src/self_configs';
import md5 from 'js-md5';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { $t } from '@/boot/i18n';
import {api as axios} from '@/boot/axios';

const $q = useQuasar();
const router = useRouter();
const this_route = useRoute();
const tab = ref('points');
const show_loading = ref(true);

function getSubmissionInfo() {
  show_loading.value = true;
  // console.log(this_route)
  // console.log(this_route.path)
  if (this_route.path.toLowerCase() !== '/contest'.toLowerCase()) return;
  if (this_route.query.cid === undefined) {
    alert('参数不完整');
    return;
  }
  axios({
    method: 'post',
    url: /*apiUrl +*/ '/submission/getInfo',
    data: {
      submissionId: this_route.query.sid,
    },
  })
    .then((data) => {
      console.log('Success:', data);
      if (data.data.status === 1) {
        // 列表获取成功
        console.log(data);
        // contest_info.value = data.data.data;
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
}
</script>

<style scoped></style>
