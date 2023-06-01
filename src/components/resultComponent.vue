<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    class="q-gutter-md"
    style="flex-direction: column"
    v-show="!show_loading"
  >
    <div
      v-if="show_loading_mini"
      class="q-ml-md q-my-auto"
      style="display: flex"
    >
      <q-spinner-gears size="40px" color="primary" />
      <p class="q-my-auto">loading...</p>
    </div>
    <q-card class="q-pa-md">
      <div class="text-h5 q-mb-md">信息</div>
      <div>
        {{ `运行结果：` }}
        <span
          :style="`color:${
            statusCovernt(submission_info.submissionResultGeneral)[0]
          }`"
        >
          {{ statusCovernt(submission_info.submissionResultGeneral)[1] }}
        </span>
      </div>
      <div>{{ `提交用户昵称:${submission_info.userNickName}` }}</div>
      <div>
        {{ `提交时间:${timestampToTime(submission_info.submitTimeStamp)}` }}
      </div>
      <div>{{ `提交题目:${submission_info.sourceProblemId}` }}</div>
      <div>{{ `运行内存:${submission_info.submissionRunMem}KB` }}</div>
      <div>{{ `运行时间:${submission_info.submissionRunTime}ms` }}</div>
      <div>{{ `提交语言:${submission_info.submissionCodeLanguage}` }}</div>
    </q-card>
    <div
      v-if="
        submission_info.submissionResultGeneral !== 1 ||
        (submission_info.submissionResultGeneral === 0 &&
          submission_info.submissionResultErrMsg.length > 0)
      "
    >
      <q-card
        v-if="
          submission_info.submissionResultGeneral !== 3 &&
          submission_info.submissionResultGeneral !== 0
        "
      >
        <div class="text-h5 q-pt-md q-pl-md">测试点信息</div>
        <q-markup-table
          class="q-mt-md"
          v-show="!show_loading && !show_loading_mini && !err_msg.length"
          style="height: 200px; overflow: auto"
        >
          <thead>
            <tr>
              <th class="text-left" style="width: 10%">测试点序号</th>
              <th class="text-left">结果</th>
              <th class="text-left" style="width: 5%">内存</th>
              <th class="text-left" style="width: 5%">运行时间</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(point, idx) in submission_info.submissionResultDetail"
              :key="point"
            >
              <td>{{ idx }}</td>
              <td>
                <span :style="`color:${statusCovernt(point.result)[0]}`">
                  {{ statusCovernt(point.result)[1] }}
                </span>
              </td>
              <td>
                {{ `${parseInt(point.memory / 1024)}KB` }}
              </td>
              <td>
                <p class="q-pa-none q-ma-none">{{ `${point.time}ms` }}</p>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card>
      <q-card v-else>
        <div class="text-h5 q-pt-md q-pl-md">错误信息</div>
        <p class="q-mx-md q-pb-md">
          {{ submission_info.submissionResultErrMsg }}
        </p>
      </q-card>
    </div>

    <q-card>
      <div class="text-h5 q-py-md q-pl-md">代码</div>
      <div
        id="monaco_editor_container_resultPage"
        style="
          height: 300px;
          width: 99%;
          margin-left: 0.5%;
          resize: vertical;
          overflow: hidden;
        "
      ></div>
    </q-card>
  </div>
  <q-page class="flex flex-center" v-if="show_loading">
    <loading-page :loading="show_loading" :message="err_msg"></loading-page>
  </q-page>
</template>

<script setup>
import { onMounted, ref, defineProps, onUnmounted } from 'vue';
import md5 from 'js-md5';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { $t } from '@/boot/i18n';
import { api as axios } from '@/boot/axios';
import * as monaco from 'monaco-editor';
import loadingPage from '@/components/loadingPage.vue';

const $q = useQuasar();
const this_router = useRouter();
const this_route = useRoute();
const tab = ref('points');
const show_loading = ref(true);
const show_loading_mini = ref(true);
const submission_info = ref({});
const err_msg = ref('');
let ITextModel = null;
let refresh_timer = null;
const props = defineProps(['sid']);

function getSubmissionInfo() {
  if (refresh_timer !== null) clearInterval(refresh_timer);
  show_loading_mini.value = true;
  axios({
    method: 'post',
    url: '/submission/getInfo',
    data: {
      submissionId: props.sid,
      via:
        this_route.path === '/status' ||
        (this_route.path === '/problem' && this_route.query.type === '0')
          ? 0
          : 1,
      needCode: show_loading.value,
    },
  })
    .then((data) => {
      // console.log('Success:', data);
      submission_info.value = data.data;
      console.log('model is', ITextModel);
      if (ITextModel === null) createEditor();
      if (submission_info.value.submissionResultGeneral === 1) {
        refresh_timer = setInterval(getSubmissionInfo, 3 * 1000);
      } else {
        if (refresh_timer !== null) clearInterval(refresh_timer);
      }
      show_loading.value = false;
      show_loading_mini.value = false;
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
}
function createEditor() {
  var true_type = '';
  switch (submission_info.value.submissionCodeLanguage) {
    case 'C++':
      true_type = 'cpp';
      break;
    case 'Java':
      true_type = 'java';
      break;
    case 'Python3':
      true_type = 'python';
      break;
  }
  ITextModel = monaco.editor.create(
    document.getElementById('monaco_editor_container_resultPage'),
    {
      value: '',
      language: true_type,
      // theme: 'vs-dark',
      theme: $q.dark.isActive ? 'vs-dark' : 'vs-white',
      editorOptions: {
        automaticLayout: true,
        autoIndent: true, //自动缩进
      },
      automaticLayout: true,
      value: submission_info.value.submissionCode,
    }
  );
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
function timestampToTime(timestamp) {
  timestamp = timestamp ? timestamp : null;
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
onMounted(() => {
  getSubmissionInfo();
});
onUnmounted(() => {
  if (refresh_timer !== null) clearInterval(refresh_timer);
});
</script>

<style scoped>
#monaco_editor_container {
  border: grey solid 1px;
}
</style>
