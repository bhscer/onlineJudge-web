<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    class="q-gutter-md"
    style="flex-direction: column"
    v-show="!show_loading"
  >
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
    <q-card>
      <div class="text-h5 q-pt-md q-pl-md">测试点信息</div>
      <q-markup-table
        class="q-mt-md"
        v-show="
          !empty_content &&
          !show_loading &&
          !show_loading_mini &&
          !err_msg.length
        "
        style="height: 200px"
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

    <q-card>
      <div class="text-h5 q-py-md q-pl-md">代码</div>
      <div
        id="monaco_editor_container"
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
  <loading-page :loading="show_loading" :message="err_msg"></loading-page>
</template>

<script setup>
import { onMounted, ref, defineProps } from 'vue';
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
const submission_info = ref({});
const err_msg = ref('');
let ITextModel = null;

const props = defineProps(['sid']);

function getSubmissionInfo() {
  show_loading.value = true;
  axios({
    method: 'post',
    url: '/submission/getInfo',
    data: {
      submissionId: props.sid,
    },
  })
    .then((data) => {
      console.log('Success:', data);
      submission_info.value = data.data;
      createEditor();
      show_loading.value = false;
    })
    .catch((error) => {
      console.error('Error:', error);
      try {
        if (error.response.status === 401)
          this_router.push('/userLogin?type=2');
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
    case 'CPP':
      true_type = 'cpp';
      break;
    case 'Java':
      true_type = 'java';
      break;
    case 'Python3':
      true_type = 'python';
      break;
  }
  console.log(submission_info);
  ITextModel = monaco.editor.create(
    document.getElementById('monaco_editor_container'),
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
</script>

<style scoped></style>
