<template>
  <div class="bg_div" v-show="!show_loading">
    <!-- 题目 -->
    <div class="content_main">
      <q-card class="q-pa-lg q-my-md">
        <div class="q-gutter-md">
          <div class="text-h2" style="font-weight: bold">
            {{ problem_info.title }}
          </div>

          <q-badge
            color="primary"
            v-if="
              $route.path !== '/invigilator/problem' &&
              user.info &&
              $permissionDict[user.info.permission]['editProblem'] === true
            "
            ><a
              @click.prevent="
                $router.push(`/admin/editProblem?add=0&&id=${problem_info.id}`)
              "
              :href="`/admin/editProblem?add=0&&id=${problem_info.id}`"
              style="color: inherit; cursor: pointer; text-decoration: none"
              >编辑</a
            ></q-badge
          >
          <q-badge
            color="teal"
            v-if="
              $route.path !== '/invigilator/problem' &&
              user.info &&
              $permissionDict[user.info.permission]['editProblem'] === true
            "
            ><a
              @click.prevent="
                $router.push(
                  `/admin/editProblemTestData?id=${problem_info.problemIdString}`
                )
              "
              :href="`/admin/editProblemTestData?id=${problem_info.problemIdString}`"
              style="color: inherit; cursor: pointer; text-decoration: none"
              >测试数据</a
            ></q-badge
          >
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
      <div
        :style="`display: flex;flex-direction: row-reverse;flex-wrap: wrap;justify-content: ${
          miniMode ? 'center' : 'space-between;'
        }`"
      >
        <q-card
          :style="`width: ${
            miniMode ? '100%' : '20%'
          };height: fit-content;${qmarkstyle}`"
        >
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
            <q-tab name="problem" label="题面" icon="description" />
            <q-tab name="submit" label="提交" icon="code" />
            <q-tab
              name="submissions"
              label="记录"
              icon="reorder"
              @click="refreshSubmission()"
            />
            <q-tab
              name="solution"
              label="题解"
              icon="code"
              v-if="$route.path !== '/invigilator/problem'"
            />
          </q-tabs>
        </q-card>
        <q-card
          :style="`width: ${miniMode ? '100%' : '78%'};${qmarkstyle};${
            miniMode ? 'margin-top:15px' : ''
          }`"
          style="height: fit-content"
        >
          <q-tab-panels
            class="q-pa-sm"
            v-model="tab"
            animated
            :vertical="!miniMode"
            @transition="tab_pannel_change"
            style="height: fit-content"
            keep-alive
          >
            <q-tab-panel name="problem">
              <div class="q-pa-md q-gutter-md">
                <div
                  v-if="
                    problem_info.description && problem_info.description.length
                  "
                >
                  <!--h2>题目描述</h2-->
                  <div class="text-h5" style="font-weight: bold">题目描述</div>
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
                    problem_info.inputFormat && problem_info.inputFormat.length
                  "
                >
                  <!--h2>输入格式</h2-->
                  <div class="text-h5" style="font-weight: bold">输入格式</div>
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
                  <div class="text-h5" style="font-weight: bold">输出格式</div>
                  <v-md-preview
                    v-if="problem_info.uiType === 'markdown'"
                    :text="problem_info.outputFormat"
                  ></v-md-preview>
                  <div
                    v-if="problem_info.uiType === 'html'"
                    v-html="problem_info.outputFormat"
                  ></div>
                </div>

                <div v-if="problem_info.samples && problem_info.samples.length">
                  <div class="text-h5" style="font-weight: bold">
                    输入输出样例
                  </div>
                  <div v-for="(item, idx) in problem_info.samples" :key="item">
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
                    problem_info.problemHint && problem_info.problemHint.length
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
                  :loading="testing"
                  outline
                  rounded
                  color="primary"
                  label="测试"
                  @click="runCode"
                  style="width: 120px; height: fit-content"
                >
                  <template v-slot:loading>
                    <q-spinner-hourglass class="on-left" />
                    running...
                  </template>
                </q-btn>
                <q-btn
                  :loading="submiting"
                  outline
                  rounded
                  color="primary"
                  label="提交"
                  @click="submitCode"
                  style="width: 140px; height: fit-content"
                >
                  <template v-slot:loading>
                    <q-spinner-hourglass class="on-left" />
                    submiting...
                  </template>
                </q-btn>
              </div>
              <q-file
                class="q-mx-lg"
                rounded
                outlined
                dense
                bottom-slots
                v-model="file_model"
                label="submit code from file"
                counter
                style="width: fit-content"
              >
                <template v-slot:prepend>
                  <q-icon name="cloud_upload" @click.stop.prevent />
                </template>
                <template v-slot:append>
                  <q-icon
                    name="close"
                    @click.stop.prevent="file_model = null"
                    class="cursor-pointer"
                  />
                </template>
              </q-file>
              <div
                v-if="!file_model"
                id="monaco_editor_container"
                style="
                  height: 500px;
                  width: 99%;
                  margin-left: 0.5%;
                  resize: vertical;
                  overflow: hidden;
                "
              ></div>
              <div>
                <div>输入</div>
                <textarea
                  rows="10"
                  style="width: 100%; resize: vertical"
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
                          v-model="output_text"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- <div>{{ runResult }}</div> -->
              </div>
            </q-tab-panel>

            <q-tab-panel name="submissions" style="padding: 0; margin: 0">
              <submission-list ref="submissionRef"></submission-list>
            </q-tab-panel>
            <q-tab-panel name="solution">尽请期待</q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>
  </div>
  <q-dialog v-model="showSubmitResult">
    <q-card style="width: 600px">
      <result-component :sid="submissionId"></result-component>
    </q-card>
  </q-dialog>
  <q-page class="flex flex-center" v-if="show_loading">
    <loading-page :loading="show_loading" :message="err_msg"></loading-page>
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
import ResultComponent from '@/components/resultComponent.vue';

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'problem',
  watch: {
    $route(to, from) {
      this.getProblemInfo();
    },
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
    let firstTimeToSubmit = true;
    const show_loading = ref(true);
    let this_route = useRoute();
    let this_router = useRouter();
    const $q = useQuasar();
    const miniMode = ref(false);
    const windowWidth = ref(10);
    const qmarkstyle = ref('');
    const submissionRef = ref();
    const tab_inited = ref({});
    const submiting = ref(false);
    const testing = ref(false);
    const file_model = ref(null);
    let code_content = '';
    const tab = ref('problem');
    const err_msg = ref('');
    const showSubmitResult = ref(false);
    const submissionId = ref('');
    const runResult = ref({});
    const input_text = ref('');
    const output_text = ref('');

    const readCodeFromFile = async () => {
      var promise = new Promise((reslove) => {
        var reader = new FileReader();
        // result 属性中将包含一个字符串以表示所读取的文件内容。
        reader.readAsText(file_model.value);
        reader.onload = function () {
          reslove(this.result);
        };
      });
      await promise.then((res) => {
        code_content = res;
      });
    };

    const submitCode = async () => {
      if (submiting.value) return;
      submiting.value = true;
      if (file_model.value === null) {
        code_content = ITextModel.getValue();
      } else {
        await readCodeFromFile();
      }
      // console.log('then',code_content)
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
          // tab.value = 'submissions';
          // refreshSubmission();
          console.log('submit Success:', data);
          $q.notify({
            type: 'positive',
            message: '提交成功',
            progress: true,
          });
          showSubmitResult.value = true;
          submissionId.value = data.data.submissionId;
        })
        .catch((error) => {
          submiting.value = false;
          // console.error('Error:', error);
          // alert(error.response.data.detail);
          var err_msg_notify = '';
          try {
            if (error.response.status === 401)
              this_router.push(
                `/userLogin?type=2&&err=${error.response.data.detail}`
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

    const runCode = async () => {
      if (testing.value) return;
      testing.value = true;
      if (file_model.value === null) {
        code_content = ITextModel.getValue();
      } else {
        await readCodeFromFile();
      }
      // console.log('then',code_content)

      axios({
        method: 'post',
        url: '/code/run',
        data: {
          codeLanguage: languageType.value,
          code: code_content,
          input: input_text.value,
        },
      })
        .then((data) => {
          testing.value = false;
          // tab.value = 'submissions';
          // refreshSubmission();
          console.log('submit Success:', data);
          runResult.value = data.data.data;
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
                `/userLogin?type=2&&err=${error.response.data.detail}`
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
    const getProblemInfo = () => {
      show_loading.value = true;
      // console.log(this_route)
      console.log(this_route.path);
      if (
        this_route.path.toLowerCase() !== '/problem'.toLowerCase() &&
        this_route.path.toLowerCase() !== '/invigilator/problem'.toLowerCase()
      )
        return;
      console.log('jjjj');
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
        // 按题目编号
        post_data = {
          type: '0',
          problemId: this_route.query.id,
          pwd: this_route.query.pwd,
          urlType:
            this_route.path.toLowerCase() ===
            '/invigilator/problem'.toLowerCase()
              ? 1
              : 0,
        };
      } else {
        post_data = {
          type: '1',
          contestId: this_route.query.cid,
          problemId: this_route.query.pid,
          pwd: this_route.query.pwd,
          urlType:
            this_route.path.toLowerCase() ===
            '/invigilator/problem'.toLowerCase()
              ? 1
              : 0,
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
          console.log(data);
          problem_info.value = data.data.data;
          language_options.value = data.data.data.language;
          document.title = `${post_data.problemId}-${problem_info.value.title}-${proxy.$oj_name}`;
          show_loading.value = false;
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
    };
    const refreshSubmission = () => {
      if (!tab_inited.value['submissions']) return;
      // if (tab_inited.value['submissions'])
      submissionRef.value.need_update = true;
      // else
      //  submissionRef.value.getSubmissionList()
    };

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
      submiting,
      file_model,
      readCodeFromFile,
      err_msg,
      user,
      showSubmitResult,
      submissionId,
      testing,
      runCode,
      runResult,
      input_text,
      output_text,
    };
  },
  mounted() {
    // window.addEventListener('resize', this.cancalDebounce);
    window.addEventListener('resize', this.getWindowInfo);
    /*
             type:0 非题目集 需要id
             type:1 题目集 cid && pid
            */
    // document.title="问题加载中"
    this.getWindowInfo();
    this.getProblemInfo();
  },
  beforeUnmount() {
    // window.removeEventListener('resize', this.cancalDebounce);
    window.removeEventListener('resize', this.getWindowInfo);
  },
  components: { SubmissionList, LoadingPage, ResultComponent },
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
