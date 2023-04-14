import { boot } from 'quasar/wrappers';

import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
// 引入你所使用的主题 此处以 github 主题为例
import githubTheme from '@kangc/v-md-editor/lib/theme/github';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/npm';
// import katex from 'katex';
import 'katex/dist/katex.css';
// highlightjs
import hljs from 'highlight.js';
import md5 from 'js-md5';
// import VueMarkdownEditor from "@kangc/v-md-editor";

import MonacoEditor from 'monaco-editor-vue';
import axios from 'axios';

export default boot(async ({ app }) => {
  app.config.globalProperties.$md5 = md5;
  VMdPreview.use(githubTheme, {
    Hljs: hljs,
  });
  VMdPreview.use(createKatexPlugin());
  app.use(VMdPreview);
  app.use(MonacoEditor);
  // console.log("loaded");
  // console.log(VMdPreview);
  axios.interceptors.request.use(
    (config) => {
      if (localStorage.getItem('oj-auth-token')) {
        config.headers.Authorization = localStorage.getItem('oj-auth-token');
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
});
