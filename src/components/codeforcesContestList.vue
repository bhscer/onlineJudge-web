<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-card v-if="!show_loading">
    <div class="text-h5 q-pl-sm q-py-sm">Codeforces近期比赛</div>
    <!-- <div>{{ cf_contest_list }}</div> -->
    <q-markup-table>
      <thead>
        <th class="text-left">比赛名</th>
        <th class="text-left">开始时间</th>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in cf_contest_list" :key="idx">
          <td>
            {{ item.name }}
          </td>
          <td>{{ timeStampTostring(item.startTimeSeconds) }}</td>
        </tr>
      </tbody>
    </q-markup-table>
  </q-card>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import md5 from 'js-md5';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { $t } from '@/boot/i18n';
import { axios } from '@/boot/axios';
import loadingPage from '@/components/loadingPage.vue';
import { useUserStore } from '@/stores/user';

const $q = useQuasar();
const this_router = useRouter();
const this_route = useRoute();
const show_loading = ref(true);
const err_msg = ref('');
const cf_contest_list = ref([]);

function timeStampTostring(tim) {
  var timestamp = tim ? tim : null;
  let date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear();
  let M =
    date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1;
  let D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  let h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  let m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  // return Y + M + D + h + m + s;
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

function getCfContestList() {
  axios({
    method: 'get',
    url: 'https://codeforces.com/api/contest.list',
  })
    .then((data) => {
      show_loading.value = false;
      if (data.data.status === 'OK') {
        cf_contest_list.value = [];
        data.data.result.forEach((item) => {
          // console.log(item);
          if (item.phase !== 'FINISHED') {
            if (
              item.startTimeSeconds - Date.now() / 1000 >= 0 &&
              item.startTimeSeconds - Date.now() / 1000 <= 7 * 60 * 60 * 24
            )
              cf_contest_list.value.push(item);
          }
        });
        cf_contest_list.value.sort((x, y) => {
          return x.startTimeSeconds < y.startTimeSeconds;
        });
        // console.log(cf_contest_list.value);
      }
    })
    .catch((error) => {
      // submiting.value = false;
      // console.error('Error:', error);
      // alert(error.response.data.detail);
      var err_msg_notify = '';
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&err=${error.response.data.detail}`
          );
        else if (error.response.status === 400)
          err_msg_notify = error.response.data.detail;
        else err_msg_notify = '错误码' + error.response.status;
      } catch {
        err_msg_notify = '错误码' + error.code;
      }
      // if (err_msg_notify !== '') {
      //   $q.notify({
      //     type: 'negative',
      //     message: err_msg_notify,
      //     progress: true,
      //   });
      // }
      err_msg.value = err_msg_notify;
    });
}
onMounted(() => {
  getCfContestList();
});
</script>

<style scoped></style>
