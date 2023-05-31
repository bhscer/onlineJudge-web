import { boot } from 'quasar/wrappers';

import '@kangc/v-md-editor/lib/style/base-editor.css';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import '@kangc/v-md-editor/lib/style/preview.css';
import VMdEditor from '@kangc/v-md-editor';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
// 引入你所使用的主题 此处以 github 主题为例
import githubTheme from '@kangc/v-md-editor/lib/theme/github';
import createKatexPlugin from '@kangc/v-md-editor/lib/plugins/katex/npm';
// import katex from 'katex';
import 'katex/dist/katex.css';
// highlightjs
import hljs from 'highlight.js';
import md5 from 'js-md5';
// import VueMarkdownEditor from "@kangc/v-md-editor";

import MonacoEditor from 'monaco-editor-vue';
import { inject } from '@vercel/analytics';
import 'font-awesome/css/font-awesome.css';
import 'viewerjs/dist/viewer.css';
import VueViewer from 'v-viewer';

// import axios from 'axios';

export default boot(async ({ app }) => {
  inject();
  app.config.globalProperties.$md5 = md5;
  app.config.globalProperties.$oj_name = 'Online Judge';
  app.config.globalProperties.$bar_name = 'Online Judge';
  app.config.globalProperties.$timeStampTostring = (timestamp: number) => {
    const date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    const Y = date.getFullYear();
    const M =
      date.getMonth() + 1 < 10
        ? '0' + (date.getMonth() + 1)
        : date.getMonth() + 1;
    const D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    const m =
      date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    const s =
      date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
    // return Y + M + D + h + m + s;
    return `${Y}-${M}-${D} ${h}:${m}:${s}`;
  };
  app.config.globalProperties.$permissionDict = {
    root: {
      editProblem: true,
      editContest: true,
      viewSubmission: true,
      viewTrueRank: true,
      editUser: true,
    },
    admin: {
      editProblem: true,
      editContest: true,
      viewSubmission: true,
      viewTrueRank: true,
      editUser: false,
    },
    user: {
      editProblem: false,
      editContest: false,
      viewSubmission: false,
      viewTrueRank: false,
      editUser: false,
    },
  };
  app.config.globalProperties.$tinymce_config = {
    height: 500,
    toolbar:
      'undo redo | fullscreen | blocks alignleft aligncenter alignright alignjustify | link unlink | numlist bullist | image media table | fontsize forecolor backcolor | bold italic underline strikethrough | indent outdent | superscript subscript | removeformat |',
    toolbar_mode: 'sliding',
    quickbars_selection_toolbar:
      'removeformat | bold italic underline strikethrough | fontsize forecolor backcolor',
    plugins: 'link image media table lists fullscreen quickbars',
    font_size_formats: '12px 14px 16px 18px',
    link_default_target: '_blank',
    link_title: false,
    nonbreaking_force_tab: true,
    language: 'zh-Hans',
    language_url:
      'https://unpkg.com/@jsdawn/vue3-tinymce@2.0.2/dist/tinymce/langs/zh-Hans.js',
  };
  VMdEditor.use(githubTheme, {
    Hljs: hljs,
  });
  VMdPreview.use(githubTheme, {
    Hljs: hljs,
  });
  VMdPreview.use(createKatexPlugin());
  app.use(VMdPreview);
  app.use(VMdEditor);
  app.use(MonacoEditor);
  app.use(VueViewer);
});
