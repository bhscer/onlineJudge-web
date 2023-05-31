<template>
  <div class="bg_div" v-show="!show_loading">
    <!-- 题目 -->
    <div class="content_main">
      <div class="text-h5">
        <strong>{{
          this.$route.query.add === '0' ? '题目编辑' : '添加题目'
        }}</strong>
      </div>
      <a
        v-if="$route.query.add === '0'"
        @click.prevent="
          $router.push(`/problem?type=0&id=${problem_info.problemIdString}`)
        "
        :href="`/problem?type=0&id=${problem_info.problemIdString}`"
        style="color: inherit; cursor: pointer; text-decoration: none"
      >
        <q-icon name="arrow_back"></q-icon>
        <span>返回题目</span>
      </a>
      <div class="q-pa-lg q-my-md">
        <div class="q-gutter-md">
          <q-checkbox
            v-if="this.$route.query.add === '1'"
            v-model="use_custom_id"
            label="自定编号"
          ></q-checkbox>
          <!--新建题目的情况下出现选择是否自定（自定情况下出现编号修改），编辑时允许修改编号-->
          <q-input
            :readonly="
              this.$route.query.add === '0' ||
              (this.$route.query.add === '1' && !use_custom_id)
            "
            outlined
            v-model="problem_info.problemIdString"
            label="题目编号"
          />
          <q-checkbox v-model="problem_info.public" label="公开"></q-checkbox>
          <p class="q-my-none q-py-none">
            如果你选择公开，那么可以以题目编号直接访问，否则只能从比赛中访问
          </p>

          <q-input outlined v-model="problem_info.title" label="题目名称" />

          <div style="display: flex; flex-wrap: wrap">
            <q-input
              outlined
              dense
              v-model="problem_info.timeLimitNum"
              label="Time Limit (s)"
            />
            <q-input
              outlined
              dense
              v-model="problem_info.memoryLimitNum"
              label="Memory Limit (mb)"
            />
          </div>
        </div>
      </div>

      <div class="q-gutter-sm">
        <q-radio v-model="problem_info.uiType" val="html" label="html" />
        <q-radio
          v-model="problem_info.uiType"
          val="markdown"
          label="markdown"
        />
      </div>

      <div class="q-pa-md q-gutter-md">
        <div>
          <!--h2>题目描述</h2-->
          <div class="text-h5" style="font-weight: bold">题目描述</div>
          <div>
            <div v-if="problem_info.uiType === 'html'">
              <vue3-tinymce
                v-model="problem_info.description"
                :setting="$tinymce_config"
              />
            </div>
            <div v-if="problem_info.uiType === 'markdown'">
              <v-md-editor
                v-model="problem_info.description"
                height="400px"
              ></v-md-editor>
            </div>
          </div>
        </div>

        <div>
          <!--h2>输入格式</h2-->
          <div class="text-h5" style="font-weight: bold">输入格式</div>
          <div>
            <div v-if="problem_info.uiType === 'html'">
              <vue3-tinymce
                v-model="problem_info.inputFormat"
                :setting="$tinymce_config"
              />
            </div>
            <div v-if="problem_info.uiType === 'markdown'">
              <v-md-editor
                v-model="problem_info.inputFormat"
                height="400px"
              ></v-md-editor>
            </div>
          </div>
        </div>

        <div>
          <!--h2>输出格式</h2-->
          <div class="text-h5" style="font-weight: bold">输出格式</div>
          <div>
            <div v-if="problem_info.uiType === 'html'">
              <vue3-tinymce
                v-model="problem_info.outputFormat"
                :setting="$tinymce_config"
              />
            </div>
            <div v-if="problem_info.uiType === 'markdown'">
              <v-md-editor
                v-model="problem_info.outputFormat"
                height="400px"
              ></v-md-editor>
            </div>
          </div>
        </div>

        <div>
          <div style="display: flex">
            <div class="text-h5" style="font-weight: bold">输入输出样例</div>
            <q-btn
              outline
              color="primary"
              label="添加"
              size="xs"
              padding="xs xs"
              @click="
                problem_info['samples'].push({
                  input: '',
                  output: '',
                })
              "
            />
          </div>

          <div v-for="(item, idx) in problem_info.samples" :key="item">
            <div style="display: flex">
              <h5 style="margin: 0">{{ '样例#' + (idx + 1) }}</h5>
              <q-btn
                outline
                color="red"
                label="删除"
                size="xs"
                padding="xs xs"
                @click="problem_info['samples'].splice(idx, 1)"
              />
            </div>

            <div style="display: flex; flex-wrap: wrap">
              <div :style="samplewidthTextLeft">
                <strong>{{ '输入' }}</strong>
                <textarea v-model="item.input" class="sample_box"></textarea>
              </div>
              <div :style="samplewidthTextRight">
                <strong>{{ '输出' }}</strong>
                <textarea v-model="item.output" class="sample_box"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="text-h5" style="font-weight: bold">提示</div>
          <div>
            <div v-if="problem_info.uiType === 'html'">
              <vue3-tinymce
                v-model="problem_info.problemHint"
                :setting="$tinymce_config"
              />
            </div>
            <div v-if="problem_info.uiType === 'markdown'">
              <v-md-editor
                v-model="problem_info.problemHint"
                height="400px"
              ></v-md-editor>
            </div>
          </div>
        </div>
      </div>
      <q-btn
        outline
        color="primary"
        label="提交"
        size="lg"
        style="width: 100%"
        padding="xs xs"
        @click="submitEdit()"
      />
    </div>
  </div>
  <q-inner-loading :showing="show_loading">
    <q-spinner-gears size="50px" color="primary" />
    <p>loading...</p>
  </q-inner-loading>
</template>

<script>
import { defineComponent, ref, getCurrentInstance } from 'vue';
import { api as axios } from '@/boot/axios';

import '@kangc/v-md-editor/lib/style/base-editor.css';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import * as monaco from 'monaco-editor';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import Vue3Tinymce from '@jsdawn/vue3-tinymce';

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
    const windowWidth = ref(10);
    const qmarkstyle = ref('');
    const submiting = ref(false);
    const tab = ref('problem');
    const use_custom_id = ref(false);

    const submitEdit = async () => {
      submiting.value = true;

      (problem_info.value.timeLimit = problem_info.value.timeLimitNum + 's'),
        (problem_info.value.memoryLimit =
          problem_info.value.memoryLimitNum + 's');
      // console.log('then',code_content)
      axios({
        method: 'post',
        url: '/admin/problem/edit',
        data: {
          type: this_route.query.add,
          data: problem_info.value,
          customId: use_custom_id.value,
        },
      })
        .then((data) => {
          submiting.value = false;
          console.log('submit Success:', data);
          if (this_route.query.add === '1') {
            this_router.replace(`/admin/editContest?add=0&id=${data.data.id}`);
          }
          $q.notify({
            type: 'positive',
            message: '提交成功',
            progress: true,
          });
        })
        .catch((error) => {
          submiting.value = false;
          console.error('Error:', error);
          alert(error.response.data.detail);
          if (error.response.status === 401) {
            // localStorage.removeItem('Authorization');
            // showFailToast("登录状态失效，请重新登录")
            // router.push('/login');
          } else if (error.response.status === 400) {
            // showFailToast('获取签到情况失败');
            $q.notify({
              type: 'negative',
              message: error.response.data.detail,
              progress: true,
            });
          } else {
            $q.notify({
              type: 'negative',
              message: `网络错误,code=${error.response.status}`,
              progress: true,
            });
          }
        });
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
      // console.log(this_route.path)
      if (this_route.path.toLowerCase() !== '/admin/editProblem'.toLowerCase())
        return;
      if (
        this_route.query.add === undefined ||
        (this_route.query.add === '0' && this_route.query.id === undefined) ||
        (this_route.query.add !== '1' && this_route.query.add !== '0')
      ) {
        alert('参数不完整');
        return;
      }

      if (this_route.query.add === '1') {
        problem_info.value = {
          problemIdString: '',
          public: true,
          privateRange: [],
          title: '',
          ReferredInfo: {
            isProblemReferred: false,
            problemReferredWebsite: '',
            problemReferredUrl: '',
            showToPublic: false,
          },
          submitted: 0,
          accepted: 0,
          timeLimitNum: '1',
          timeLimit: '?s',
          memoryLimitNum: '256',
          memoryLimit: '?mb',
          uiType: 'markdown',
          description: '',
          inputFormat: '',
          outputFormat: '',
          problemHint: '',
          source: [],
          samples: [],
        };

        axios({
          method: 'post',
          url: '/admin/problem/getCnt',
        })
          .then((data) => {
            // console.log('Success:', data);
            if (data.data.status === 1) {
              console.log(data);
              problem_info.value.problemIdString = data.data.problemIdString;
              show_loading.value = false;
            } else {
              // alert(data.msg)
              // showFailToast(data.data.msg)
            }
          })
          .catch((error) => {
            console.error('Error:', error);
            if (error.response.status === 401) {
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
        show_loading.value = false;
      } else {
        axios({
          method: 'post',
          url: '/admin/problem/getInfo',
          data: {
            id: this_route.query.id,
          },
        })
          .then((data) => {
            // console.log('Success:', data);
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
            if (error.response.status === 401) {
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
      }
    };

    return {
      tab,
      getProblemInfo,
      submitEdit,
      languageType,
      show_loading,
      language_model,
      language_options,
      firstTimeToSubmit,
      samplewidthTextLeft,
      samplewidthTextRight,
      sampledivStyle,
      // cancalDebounce,
      getWindowInfo,
      problem_info,
      miniMode,
      windowWidth,
      qmarkstyle,
      submiting,
      use_custom_id,
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
  components: {
    Vue3Tinymce,
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
