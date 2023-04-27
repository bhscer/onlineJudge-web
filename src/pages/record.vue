<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page class="flex flex-center q-pa-lg q-ma-lg">
    <div style="width: 800px; flex-direction: column" :v-show="!show_loading">
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
        keep-alive
        @transition="tab_pannel_change"
      >
        <q-tab-panel name="points">
          <div v-for="point in submission_info.submissionResultDetail" :key="point">
            <div :style="`background-color:${statusCovernt(point.result)[0]} ;`">
              {{statusCovernt(point.result)[1]}}
            </div>

          </div>
        </q-tab-panel>
        <q-tab-panel name="code">
          <div
                  id="monaco_editor_container"
                  style="height: 500px; width: 99%; margin-left: 0.5%;resize: vertical;overflow: hidden;"
                ></div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
    <q-inner-loading :showing="show_loading">
      <q-spinner-gears size="50px" color="primary" />
      <p>loading...</p>
  </q-inner-loading>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import md5 from 'js-md5';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { $t } from '@/boot/i18n';
import { api as axios } from '@/boot/axios';
import * as monaco from 'monaco-editor';

const $q = useQuasar();
const router = useRouter();
const this_route = useRoute();
const tab = ref('points');
const show_loading = ref(true);
const submission_info = ref({})
let firstTimeToCode = true

function getSubmissionInfo() {
  show_loading.value = true;
  // console.log(this_route)
  // console.log(this_route.path)
  if (this_route.path.toLowerCase() !== '/record'.toLowerCase()) return;
  if (this_route.query.sid === undefined) {
    alert('参数不完整');
    return;
  }
  axios({
    method: 'post',
    url: '/submission/getInfo',
    data: {
      submissionId: this_route.query.sid,
    },
  })
    .then((data) => {
      console.log('Success:', data);
        submission_info.value = data.data
        show_loading.value = false;
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
function createEditor() {
  var true_type = ''
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
  ITextModel = monaco.editor.create(
    document.getElementById('monaco_editor_container'),
    {
      value: '',
      language: true_type,
      // theme: 'vs-dark',
      theme: $q.dark.isActive ? 'vs-dark':'vs-white',
      editorOptions: {
        automaticLayout: true,
        autoIndent: true, //自动缩进
      },
      automaticLayout: true,
      value:submission_info.value.submissionCode
    }
  );
};
function tab_pannel_change (next, prev) {
  if (next == 'code' && firstTimeToCode) {
    firstTimeToCode = false;
    // console.log(document.getElementById('monaco_editor_container'));
    createEditor();
  }
};
function statusCovernt(status)
{
  if (status==10)
  {
    return ['#17b978','Accepted']
  }
  else if (status==11)
  {
    return ['red','WA']
  }
  else
  {
    var rest = [];
    rest.push('#ff8a5c')
    switch (status)
    {
      case 0: rest.push('UnknownError');break;
      case 1: rest.push('Pending');break;
      case 3: rest.push('CompileError');break;
      case 12: rest.push('FormatError');break;
      case 13: rest.push('TLE');break;
      case 14: rest.push('MLE');break;
      case 15: rest.push('RuntimeError');break;
      case 16: rest.push('OutputOverRange');break;
      case 17: rest.push('SystemError');break;
      case 18: rest.push('MultipleError');break;
      default: rest.push('UnknownError');
    }
    return rest
  }
}
onMounted(()=>{
  getSubmissionInfo()
})
</script>

<style scoped></style>
