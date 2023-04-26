<template>
  <div class="bg_div" v-show="!show_loading">
    <!-- 题目 -->
    <div class="content_main">
      <q-card class="q-pa-lg q-my-md">
        <div class="q-gutter-md">
          <div class="text-h2" style="font-weight: bold">
            {{ problem_info.title }}
          </div>
          <div style="display: flex; flex-wrap: wrap">
            <span class="q-mr-md">
              Time Limit
              <q-badge color="primary">{{ problem_info.timeLimit }}</q-badge>
            </span>
            <span class="q-mr-md">
              Memory Limit
              <q-badge color="orange">{{ problem_info.memoryLimit }}</q-badge>
            </span>
            <span class="q-mr-md">
              Submitted
              <q-badge color="secondary">{{ problem_info.submitted }}</q-badge>
            </span>
            <span>
              Accepted
              <q-badge color="teal">{{ problem_info.accepted }}</q-badge>
            </span>
          </div>
        </div>
      </q-card>
      <div :style="`display: flex;flex-direction: row-reverse;flex-wrap: wrap;justify-content: ${miniMode?'center':'space-between;'}`">
        <q-card :style="`width: ${miniMode?'100%':'20%'};height: fit-content;${qmarkstyle}`">
            <q-tabs
              v-model="tab"
              :vertical="!miniMode"
              :inline-label="miniMode"
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              :switch-indicator="!miniMode"
              outside-arrows
              mobile-arrows
            >
              <q-tab name="problem" label="problem" icon="description" />
              <q-tab name="submit" label="submit" icon="code"/>
              <q-tab
                name="submissions"
                label="submissions"
                icon="reorder"
                @click="refreshSubmission()"
              />
            </q-tabs>
        </q-card>
        <q-card :style="`width: ${miniMode?'100%':'78%'};${qmarkstyle};${miniMode?'margin-top:15px':''}`">

          <q-tab-panels
              class="q-pa-sm"
              v-model="tab"
              animated
              :vertical="!miniMode"
              @transition="tab_pannel_change"
              keep-alive

            >
              <q-tab-panel name="problem">
                <div class="q-pa-md q-gutter-md">
                  <div
                    v-if="
                      problem_info.description &&
                      problem_info.description.length
                    "
                  >
                    <!--h2>题目描述</h2-->
                    <div class="text-h5" style="font-weight: bold">
                      题目描述
                    </div>
                    <v-md-preview
                      v-if="problem_info.uiType === 'markdown'"
                      :text="problem_info.description"
                    ></v-md-preview>
                    <div
                      v-if="problem_info.uiType === 'html'"
                      v-html="problem_info.description"
                    ></div>
                  </div>

                  <div
                    v-if="
                      problem_info.inputFormat &&
                      problem_info.inputFormat.length
                    "
                  >
                    <!--h2>输入格式</h2-->
                    <div class="text-h5" style="font-weight: bold">
                      输入格式
                    </div>
                    <v-md-preview
                      v-if="problem_info.uiType === 'markdown'"
                      :text="problem_info.inputFormat"
                    ></v-md-preview>
                    <div
                      v-if="problem_info.uiType === 'html'"
                      v-html="problem_info.inputFormat"
                    ></div>
                  </div>

                  <div
                    v-if="
                      problem_info.outputFormat &&
                      problem_info.outputFormat.length
                    "
                  >
                    <!--h2>输出格式</h2-->
                    <div class="text-h5" style="font-weight: bold">
                      输出格式
                    </div>
                    <v-md-preview
                      v-if="problem_info.uiType === 'markdown'"
                      :text="problem_info.outputFormat"
                    ></v-md-preview>
                    <div
                      v-if="problem_info.uiType === 'html'"
                      v-html="problem_info.outputFormat"
                    ></div>
                  </div>

                  <div
                    v-if="problem_info.samples && problem_info.samples.length"
                  >
                    <div class="text-h5" style="font-weight: bold">
                      输入输出样例
                    </div>
                    <div
                      v-for="(item, idx) in problem_info.samples"
                      :key="item"
                    >
                      <div style="display: flex; flex-wrap: wrap">
                        <div :style="samplewidthTextLeft">
                          <strong>{{ '输入#' + (idx + 1) }}</strong>
                          <q-btn
                            outline
                            color="primary"
                            label="复制"
                            size="xs"
                            style="float: right"
                            padding="xs xs"
                            @click="copySample(0, idx)"
                          />
                          <pre class="sample_box">{{ item.input }}</pre>
                        </div>
                        <div :style="samplewidthTextRight">
                          <strong>{{ '输出#' + (idx + 1) }}</strong>
                          <q-btn
                            outline
                            color="primary"
                            label="复制"
                            size="xs"
                            style="float: right"
                            padding="xs xs"
                            @click="copySample(1, idx)"
                          />
                          <pre class="sample_box">{{ item.output }}</pre>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="
                      problem_info.problemHint &&
                      problem_info.problemHint.length
                    "
                  >
                    <!--h2>输出格式</h2-->
                    <div class="text-h5" style="font-weight: bold">提示</div>
                    <v-md-preview
                      v-if="problem_info.uiType === 'markdown'"
                      :text="problem_info.problemHint"
                    ></v-md-preview>
                    <div
                      v-if="problem_info.uiType === 'html'"
                      v-html="problem_info.problemHint"
                    ></div>
                  </div>
                </div>
              </q-tab-panel>

              <q-tab-panel name="submit">
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
                    label="提交"
                    @click="submitCode"
                    style="width: 140px;"
                  >
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      submiting...
                    </template>
                  </q-btn>
                </div>

                <div
                  id="monaco_editor_container"
                  style="height: 500px; width: 99%; margin-left: 0.5%;resize: vertical;overflow: hidden;"
                ></div>
              </q-tab-panel>

              <q-tab-panel name="submissions" style="padding: 0; margin: 0">
                <submission-list ref="submissionRef"></submission-list>
              </q-tab-panel>
            </q-tab-panels>
        </q-card>

        </div>
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
import SubmitPage from './submitPage.vue';

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'problem',
  watch: {
    $route(to, from) {
      this.getProblemInfo();
    },
    '$q.dark.isActive'(to,from) {
      monaco.editor.setTheme(to ? 'vs-dark':'vs-white')
    }
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
    const miniMode = ref(false);
    const windowWidth = ref(10)
    const qmarkstyle = ref('')
    const submissionRef = ref();
    const tab_inited = ref({})
    const submiting = ref(false)

    const tab = ref('problem')

    const submitCode = () => {
      if (submiting.value) return
      submiting.value = true;
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
          submiting.value = false;
          tab.value = 'submissions'
          refreshSubmission();
          console.log('submit Success:', data);
          $q.notify({
            type: 'positive',
            message: '提交成功',
            progress: true,
          });
        })
        .catch((error) => {
          submiting.value = false;
          console.error('Error:', error);
            alert(error.response.data.detail)
          if (error.request.status === 401) {
            // localStorage.removeItem('Authorization');
            // showFailToast("登录状态失效，请重新登录")
            // router.push('/login');
          } else if (error.request.status === 400) {
            // showFailToast('获取签到情况失败');
            $q.notify({
              type: 'negative',
              message: error.response.data.detail,
              progress: true,
            });
          }
          else
          {
            $q.notify({
              type: 'negative',
              message: `网络错误，code=${error.response.status}`,
              progress: true,
            });
          }
        });
    };
    const createEditor = () => {
      ITextModel = monaco.editor.create(
        document.getElementById('monaco_editor_container'),
        {
          value: '',
          language: 'cpp',
          // theme: 'vs-dark',
          theme: $q.dark.isActive ? 'vs-dark':'vs-white',
          editorOptions: {
            automaticLayout: true,
            autoIndent: true, //自动缩进
          },
          automaticLayout: true,
        }
      );
    };
    const tab_pannel_change = (next, prev) => {
      if (next == 'submit' && firstTimeToSubmit) {
        firstTimeToSubmit = false;
        // console.log(document.getElementById('monaco_editor_container'));
        createEditor();
      }
      tab_inited.value[next] = true;
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
    const copySample = async (type, idx) => {
      const textarea = document.createElement('textarea');
      textarea.setAttribute('readonly', 'readonly');
      if (type) {
        textarea.value = problem_info.value.samples[idx].output;
      } else {
        textarea.value = problem_info.value.samples[idx].input;
      }
      document.body.appendChild(textarea);
      textarea.select();
      if (document.execCommand('copy')) {
        document.execCommand('copy');
        // alert('复制成功');
        $q.notify({
            type: 'positive',
            message: '复制成功',
            progress: true,
          });
      }
      document.body.removeChild(textarea);
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
      if (window.innerWidth > 850)
        miniMode.value = false;
      else
        miniMode.value = true;


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
    const getProblemInfo = () => {
      show_loading.value = true;
      // console.log(this_route)
      // console.log(this_route.path)
      if (this_route.path.toLowerCase() !== '/problem'.toLowerCase()) return;
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
    const refreshSubmission = ()=>{
      if (!tab_inited.value['submissions']) return
      // if (tab_inited.value['submissions'])
        submissionRef.value.need_update = true;
      // else
      //  submissionRef.value.getSubmissionList()
    }
    return {
      tab,
      getProblemInfo,
      submitCode,
      language_change,
      languageType,
      show_loading,
      language_model,
      language_options,
      firstTimeToSubmit,
      tab_pannel_change,
      copySample,
      samplewidthTextLeft,
      samplewidthTextRight,
      sampledivStyle,
      // cancalDebounce,
      getWindowInfo,
      problem_info,
      refreshSubmission,
      submissionRef,
      miniMode,
      windowWidth,
      qmarkstyle,
      tab_inited,
      submiting
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
  },
  beforeUnmount() {
    // window.removeEventListener('resize', this.cancalDebounce);
    window.removeEventListener('resize', this.getWindowInfo);
  },
  components: { SubmissionList },
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


.body--light .sample_box {
  margin: 0.5em 0;
  padding: 0.3em 0.5em;
  border: #ddd solid 1px;
  background: #f8f8f8;
  border-radius: 3px;
  overflow: auto;
  font-size: 0.875em;
  font-family: monospace;
}
.body--dark .sample_box {
  margin: 0.5em 0;
  padding: 0.3em 0.5em;
  border: #ddd solid 1px;
  background: #111111;
  border-radius: 3px;
  overflow: auto;
  font-size: 0.875em;
  font-family: monospace;
}
</style>
