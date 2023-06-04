<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-lg" style="width: 80%">
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
          :loading="submiting"
          outline
          rounded
          color="primary"
          label="测试"
          @click="runCode"
          style="width: 140px; height: fit-content"
        >
          <template v-slot:loading>
            <q-spinner-hourglass class="on-left" />
            running...
          </template>
        </q-btn>
      </div>

      <div
        id="monaco_editor_container"
        style="
          height: 500px;
          width: 99%;
          margin-left: 0.5%;
          resize: vertical;
          overflow: hidden;
        "
      ></div>
      <q-separator></q-separator>
      <div>
        <div>输入</div>
        <textarea
          rows="10"
          style="width: 100%; resize: vertical"
          class="textbox_test"
          v-model="input_text"
        ></textarea>
        <div>输出</div>
        <div>
          <div v-if="runResult.err && runResult.err === true">
            <div class="text-h5">{{ runResult.errMsg.type }}</div>
            <p>{{ runResult.errMsg.msg }}</p>
          </div>
          <div v-else>
            <div v-if="runResult.msg">
              <div v-if="runResult.msg.errResult === true">
                <div class="text-h5">
                  {{ statusCovernt(runResult.msg.errCode)[1] }}
                </div>
              </div>
              <div v-else>
                <textarea
                  rows="10"
                  style="width: 100%; resize: vertical"
                  class="textbox_test"
                  v-model="output_text"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        <!-- <div>{{ runResult }}</div> -->
      </div>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, getCurrentInstance } from 'vue';
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
import LoadingPage from '@/components/loadingPage.vue';
import { useUserStore } from '@/stores/user';

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'problem',
  watch: {
    '$q.dark.isActive'(to, from) {
      monaco.editor.setTheme(to ? 'vs-dark' : 'vs-white');
    },
  },
  setup() {
    // const language_model = ref(null);
    const user = useUserStore();
    const { proxy } = getCurrentInstance();
    const language_model = ref('C++');
    const language_options = ref(['C++', 'Java', 'Python3']);
    const problem_info = ref({});
    const samplewidthTextLeft = ref('width:49%;margin-right:.5%');
    const samplewidthTextRight = ref('width:49%;margin-left:.5%');
    const sampledivStyle = ref('display: flex');
    const languageType = ref('C++');
    let ITextModel = null;
    const show_loading = ref(true);
    let this_route = useRoute();
    let this_router = useRouter();
    const $q = useQuasar();
    const miniMode = ref(false);
    const windowWidth = ref(10);
    const qmarkstyle = ref('');
    const tab_inited = ref({});
    const submiting = ref(false);
    const file_model = ref(null);
    let code_content = '';
    const tab = ref('problem');
    const err_msg = ref('');
    const input_text = ref('');
    const output_text = ref('');
    const runResult = ref({});

    const statusCovernt = (status) => {
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
    };
    const createEditor = () => {
      ITextModel = monaco.editor.create(
        document.getElementById('monaco_editor_container'),
        {
          value: '',
          language: 'cpp',
          // theme: 'vs-dark',
          theme: $q.dark.isActive ? 'vs-dark' : 'vs-white',
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
      windowWidth.value = window.innerWidth;
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
      if (window.innerWidth > 850) miniMode.value = false;
      else miniMode.value = true;

      if (window.innerWidth > 850) {
        qmarkstyle.value = '';
      } else {
        qmarkstyle.value = `max-width:${window.innerWidth * 0.95}px`;
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
    const runCode = async () => {
      if (submiting.value) return;
      submiting.value = true;
      output_text.value = '';
      axios({
        method: 'post',
        url: '/code/run',
        data: {
          codeLanguage: languageType.value,
          code: ITextModel.getValue(),
          input: input_text.value,
        },
      })
        .then((data) => {
          submiting.value = false;
          // tab.value = 'submissions';
          // refreshSubmission();
          console.log('submit Success:', data);
          runResult.value = data.data.data;

          $q.notify({
            type: 'possitive',
            message: '运行完成',
            progress: true,
          });
          try {
            output_text.value = runResult.value.msg.output;
          } catch {}
        })
        .catch((error) => {
          submiting.value = false;
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
          if (err_msg_notify !== '') {
            $q.notify({
              type: 'negative',
              message: err_msg_notify,
              progress: true,
            });
          }
        });
    };
    return {
      tab,
      languageType,
      show_loading,
      language_model,
      language_options,
      samplewidthTextLeft,
      samplewidthTextRight,
      sampledivStyle,
      // cancalDebounce,
      submiting,
      language_change,
      getWindowInfo,
      miniMode,
      windowWidth,
      qmarkstyle,
      tab_inited,
      err_msg,
      user,
      createEditor,
      input_text,
      output_text,
      runCode,
      runResult,
      statusCovernt,
    };
  },
  mounted() {
    // window.addEventListener('resize', this.cancalDebounce);
    window.addEventListener('resize', this.getWindowInfo);
    this.getWindowInfo();
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

.body--dark .textbox_test {
  background: transparent;
  color: white;
}

#monaco_editor_container {
  border: grey solid 1px;
}
</style>
