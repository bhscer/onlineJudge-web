<template>
  <div class="bg_div" v-show="!show_loading">
    <div class="content_main">
      <q-card>
        <div style="display: flex; margin-bottom: 20px" class="q-mx-lg">
          <q-select
            rounded
            outlined
            v-model="language_model"
            :options="language_options"
            label="Select Your Language"
            dense
            options-dense
            style="width: 200px"
            @update:model-value="language_change"
          />
          <q-btn
            outline
            rounded
            color="primary"
            label="提交"
            @click="submitCode"
            size="xs"
          />
        </div>

        <div
          id="monaco_editor_container"
          style="height: 500px; width: 99%; margin-left: 0.5%"
        ></div>
      </q-card>
    </div>
  </div>
  <q-inner-loading :showing="show_loading">
    <q-spinner-gears size="50px" color="primary" />
    <p>loading...</p>
  </q-inner-loading>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { api as axios } from '@/boot/axios';
// import VueMarkdownEditor from "@kangc/v-md-editor";
import '@kangc/v-md-editor/lib/style/base-editor.css';
// import vuepressTheme from "@kangc/v-md-editor/lib/theme/vuepress.js";
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import * as monaco from 'monaco-editor';
// import MonacoEditor from 'monaco-editor-vue';
// import Prism from "prismjs";
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import SubmissionList from '@/components/submissionList.vue';

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'submitPage',
  watch: {
    $route(to, from) {
      this.getProblemInfo();
    },
  },
  setup() {
    // const language_model = ref(null);
    const language_model = ref('C++');
    const language_options = ['C++', 'Java', 'Python3'];
    const problem_info = ref({});
    const samplewidthTextLeft = ref('width:49%;margin-right:.5%');
    const samplewidthTextRight = ref('width:49%;margin-left:.5%');
    const sampledivStyle = ref('display: flex');
    const languageType = ref('CPP');
    let ITextModel = null;
    let firstTimeToSubmit = true;
    const show_loading = ref(true);
    let this_route = useRoute();
    let this_router = useRouter();
    const $q = useQuasar();
    const submitCode = () => {
      var code_content = ITextModel.getValue();
      var jdata;
      if (this_route.query.type === '0') {
        jdata = {
          submitType: this_route.query.type,
          problemId: this_route.query.id,
          codeLanguage: languageType.value,
          submitCode: code_content,
        };
      } else {
        jdata = {
          submitType: this_route.query.type,
          problemId: this_route.query.pid,
          contestId: this_route.query.cid,
          codeLanguage: languageType.value,
          submitCode: code_content,
        };
      }
      axios({
        method: 'post',
        url: '/problem/submit',
        data: jdata,
      })
        .then((data) => {
          console.log('Success:', data);
          if (data.data.status === 1) {
            // 列表获取成功
            console.log(data);
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
    };
    const createEditor = () => {
      ITextModel = monaco.editor.create(
        document.getElementById('monaco_editor_container'),
        {
          value: '',
          language: 'cpp',
          theme: 'vs-dark',
          editorOptions: {
            automaticLayout: true,
            autoIndent: true, //自动缩进
          },
          automaticLayout: true,
        }
      );
    };
    const language_change = (newtype) => {
      console.log('new type is', newtype);
      var true_type = '';
      switch (newtype) {
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
      languageType.value = newtype;
      monaco.editor.setModelLanguage(ITextModel.getModel(), true_type);
      ITextModel.IDim = 100;
    };
    const getWindowInfo = () => {
      if (window.innerWidth > 500) {
        samplewidthTextLeft.value = 'width:49%;margin-right:.5%';
        samplewidthTextRight.value = 'width:49%;margin-left:.5%';
        // sampledivStyle.value = "display: flex"
        // sampledivStyle.value = ""
      } else {
        samplewidthTextLeft.value = 'width:100%';
        samplewidthTextRight.value = 'width:100%';
        // sampledivStyle.value = ""
      }
    };
    const debounce = (fn, delay) => {
      let timer;
      return function () {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          fn();
        }, delay);
      };
    };
    const cancalDebounce = debounce(getWindowInfo, 500);
    const getProblemInfo = () => {
      show_loading.value = true;
      // console.log(this_route)
      console.log(this_route.path);
      if (this_route.path.toLowerCase() !== '/submitPage'.toLowerCase()) return;

      if (
        this_route.query.type === undefined ||
        (this_route.query.type === '0' && this_route.query.id === undefined) ||
        (this_route.query.type === '1' &&
          (this_route.query.cid === undefined ||
            this_route.query.pid === undefined))
      ) {
        alert('参数不完整');
        return;
      }
      var post_data;
      if (this_route.query.type === '0') {
        post_data = { type: '0', problemId: this_route.query.id };
      } else {
        post_data = {
          type: '1',
          contestId: this_route.query.cid,
          problemId: this_route.query.pid,
        };
      }
      console.log(post_data);
      axios({
        method: 'post',
        url: '/problem/getInfo',
        data: post_data,
      })
        .then((data) => {
          console.log('Success:', data);
          if (data.data.status === 1) {
            // 列表获取成功
            console.log(data);
            problem_info.value = data.data.data;
            show_loading.value = false;
          } else {
            // alert(data.msg)
            // showFailToast(data.data.msg)
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          if (error.request.status === 401) {
            this_router.push({ path: '/userLogin' }).then(() => {
              localStorage.removeItem('oj-auth-token');
              $q.notify({
                type: 'negative',
                message: '请先登录',
                progress: true,
              });
            });
          } else {
            // showFailToast('获取签到情况失败');
          }
        });
    };
    return {
      createEditor,
      getProblemInfo,
      submitCode,
      language_change,
      languageType,
      show_loading,
      language_model,
      language_options,
      samplewidthTextLeft,
      samplewidthTextRight,
      sampledivStyle,
      // cancalDebounce,
      getWindowInfo,
      problem_info,
    };
  },
  mounted() {
    /*
            var clipboard = new ClipboardJS('.btn_copy');
            clipboard.on('success', function(e) {
              console.info('Action:', e.action);
              console.info('Text:', e.text);
              console.info('Trigger:', e.trigger);

              e.clearSelection();
            });

            clipboard.on('error', function(e) {
              console.error('Action:', e.action);
              console.error('Trigger:', e.trigger);
            });

             */
    // window.addEventListener('resize', this.cancalDebounce);
    window.addEventListener('resize', this.getWindowInfo);
    /*
             type:0 非题目集 需要id
             type:1 题目集 cid && pid
            */
    this.getWindowInfo();
    this.getProblemInfo();
    this.createEditor();
  },
  beforeUnmount() {
    // window.removeEventListener('resize', this.cancalDebounce);
    window.removeEventListener('resize', this.getWindowInfo);
  },
});
</script>
<style>
.content_main {
  width: 800px;
}

.bg_div {
  padding: 15px;
  display: flex;
  justify-content: center;
}

.card_title {
  background-color: darkgrey;
  border-radius: 10px;
  padding-left: 10vh;
  padding-right: 10vh;
}

.sample_box {
  margin: 0.5em 0;
  padding: 0.3em 0.5em;
  border: #ddd solid 1px;
  background: #f8f8f8;
  border-radius: 3px;
  overflow: auto;
  font-size: 0.875em;
  font-family: monospace;
}
</style>
