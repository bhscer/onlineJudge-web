<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md" style="width: 800px" v-if="!show_loading">
      <div v-if="false">{{ user_info }}</div>
      <q-card class="q-my-sm" v-if="user_info !== {}">
        <div style="display: flex" class="q-gutter-md q-pa-md">
          <q-avatar
            class="q-my-auto"
            size="100px"
            color="secondary"
            text-color="white"
          >
            <img
              :src="`https://cravatar.cn/avatar/${user_info.emailMd5}?d=mp&&s=100`"
            />
          </q-avatar>
          <div class="q-my-auto">
            <div class="text-h4">{{ user_info.nickname }}</div>
          </div>
          <q-btn
            v-if="user_info.id == user.info?.userDBId"
            class="q-my-auto"
            outline
            color="primary"
            label="个人设置"
            size="sm"
            @click="$router.push(`/userSettings`)"
          />
        </div>
      </q-card>
      <q-card class="q-my-sm q-pa-md">
        <div v-if="user_info.analyze">
          <p style="margin: 0; padding: 0">
            {{ `通过${user_info.analyze.solvedProblem}题` }}
          </p>
          <p style="margin: 0; padding: 0">
            {{ `尝试${user_info.analyze.triedProblem}题` }}
          </p>
          <p style="margin: 0; padding: 0">
            {{
              `已经注册${Math.ceil(
                (Date.now() / 1000 -
                  parseInt(user_info.id.substring(0, 8), 16)) /
                  (24 * 60 * 60)
              )}天`
            }}
          </p>
          <p style="margin: 0; padding: 0" v-if="user_info.analyze.cf_rating">
            {{ `Codeforces Rating:${user_info.analyze.cf_rating}` }}
          </p>
        </div>
      </q-card>
      <q-card class="q-pa-sm" v-if="showChart">
        <div ref="chartPieDiv" style="width: 100%; height: 400px"></div>
      </q-card>
    </div>

    <loading-page :loading="show_loading" :message="err_msg"></loading-page>
  </q-page>
</template>

<script setup>
import { getCurrentInstance, onMounted, ref, watch } from 'vue';
import md5 from 'js-md5';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { $t } from '@/boot/i18n';
import { api as axios } from '@/boot/axios';
import loadingPage from '@/components/loadingPage.vue';
import { useUserStore } from '@/stores/user';
import * as echarts from 'echarts';

const $q = useQuasar();
const this_router = useRouter();
const this_route = useRoute();
const user = useUserStore();
const show_loading = ref(true);
const err_msg = ref('');
const user_info = ref({});
const { proxy } = getCurrentInstance();
let chartPie = null;
const chartPieDiv = ref();
const showChart = ref(false);

function getUserCfRating() {
  if (this_route.path.toLowerCase() !== '/userInfo'.toLowerCase()) return;
  let post_data = {};
  if (this_route.query.uid === undefined) {
    err_msg.value = '参数缺失';
    return;
  }

  console.log(post_data);
  axios({
    method: 'post',
    url: '/user/getUserCfRating',
    data: {
      id: this_route.query.uid,
    },
  })
    .then((data) => {
      // console.log('Success:', data);
      console.log(data);
      user_info.value.analyze.cf_rating = data.data.cf_rating;
    })
    .catch((error) => {
      console.error('Error:', error);
      try {
        if (error.response.status === 401)
          this_router.push(
            `/userLogin?type=2&&err=${error.response.data.detail}`
          );
        // else if (error.response.status === 400)
        //   err_msg.value = error.response.data.detail;
        // else err_msg.value = error.response.status;
      } catch {
        // err_msg.value = error.code;
      }
    });
}
function getUserInfo() {
  show_loading.value = true;
  if (this_route.path.toLowerCase() !== '/userInfo'.toLowerCase()) return;
  let post_data = {};
  if (this_route.query.uid === undefined) {
    err_msg.value = '参数缺失';
    return;
  }

  console.log(post_data);
  axios({
    method: 'post',
    url: '/user/getCommonInfo',
    data: {
      id: this_route.query.uid,
    },
  })
    .then((data) => {
      // console.log('Success:', data);
      if (data.data.status === 1) {
        // 列表获取成功
        console.log(data);
        user_info.value = data.data.data;
        show_loading.value = false;
        showChart.value = false;
        for (var i = 0; i <= 19; i++) {
          var value = user_info.value.analyze.submissions[i];
          if (value > 0) {
            showChart.value = true;
          }
        }
        getUserCfRating();
        if (showChart.value === true) drawChart();
      } else {
        // alert(data.msg)
        // showFailToast(data.data.msg)
      }
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
function statusCovernt(status) {
  if (status == 10) {
    return ['#17b978', 'AC'];
  } else if (status == 11) {
    return ['red', 'WA'];
  } else if (status == 19) {
    return ['purple', `Mystery`];
  } else {
    var rest = [];
    rest.push('#ff8a5c');
    switch (status) {
      case 0:
        rest.push('UnknownError');
        break;
      case 1:
        rest.push('Pending');
        break;
      case 3:
        rest.push('CompileError');
        break;
      case 12:
        rest.push('FormatError');
        break;
      case 13:
        rest.push('TLE');
        break;
      case 14:
        rest.push('MLE');
        break;
      case 15:
        rest.push('RuntimeError');
        break;
      case 16:
        rest.push('OutputOverRange');
        break;
      case 17:
        rest.push('SystemError');
        break;
      case 18:
        rest.push('MultipleError');
        break;
      default:
        rest.push('UnknownError');
    }
    return rest;
  }
}
function drawChart() {
  let newPromise = new Promise((resolve) => {
    resolve();
  });
  //然后异步执行echarts的初始化函数
  newPromise.then(() => {
    let chart_data = [];
    let legend_data = [];

    for (var i = 0; i <= 19; i++) {
      var key = i;
      var value = user_info.value.analyze.submissions[i];
      if (value > 0) {
        let str_key = statusCovernt(key)[1];
        chart_data.push({ value: value, name: str_key });
        legend_data.push(str_key);
      }
    }
    chartPie = echarts.init(chartPieDiv.value).dispose();
    chartPie = echarts.init(
      chartPieDiv.value,
      $q.dark.isActive ? 'dark' : 'light'
    );

    chartPie.setOption({
      backgroundColor: $q.dark.isActive ? '' : 'white',
      title: {
        text: '统计',
        subtext: user_info.value.nickname,
        x: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: legend_data,
        formatter: function (name) {
          let data = chart_data;
          // console.log(data, 'data')
          let total = 0;
          let tarValue;
          for (let i = 0; i < data.length; i++) {
            total += data[i].value;
            if (data[i].name == name) {
              tarValue = data[i].value;
            }
          }
          let v = tarValue;
          //计算出百分比
          let p = Math.round((tarValue / total) * 100) + '%';
          return `${name}: ${v}(${p})`;
          //name是名称，v是数值
        },
      },
      series: [
        {
          name: '状态',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: chart_data,
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            normal: {
              formatter: '{b}:{c}',
              textStyle: {
                fontWeight: 'normal',
                fontSize: 15,
              },
            },
          },
        },
      ],
    });
  });
}
onMounted(() => {
  getUserInfo();

  window.onresize = () => {
    if (chartPie !== null) chartPie.resize();
  };
});
watch(
  () => proxy.$route,
  (newVal) => {
    user_info.value = {};
    show_loading.value = true;
    getUserInfo();
  }
);
watch(
  () => $q.dark.isActive,
  (newVal) => {
    console.log('changed');
    drawChart();
  }
);
</script>

<style scoped></style>
