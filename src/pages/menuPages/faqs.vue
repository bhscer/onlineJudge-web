<template>
  <q-page class="flex flex-center">
    <div class="q-gutter-md">
      <q-card class="q-pa-md">
        <div class="text-h5">我如何更改头像？</div>
        <p>
          本网站不储存头像，我们使用了
          <a
            href="https://cravatar.cn/"
            style="color: inherit; cursor: pointer; text-decoration: none"
            >cravatar
          </a>
          的头像。
        </p>
        <p>
          同时如果你未在 Cravatar 设置头像，则会先尝试调用 Gravatar
          上的头像数据，其后是 QQ 头像，最后会返回平台为你准备的一组默认头像
        </p>
      </q-card>
      <q-card class="q-pa-md">
        <div class="text-h5">这个网站是用什么做的？</div>
        <p>前端:vue+quasar</p>
        <p>后端:fastapi</p>
        <p>数据库:MongoDB</p>
        <p>
          判题机:
          <a
            href="https://github.com/QingdaoU/JudgeServer"
            style="color: inherit; cursor: pointer; text-decoration: none"
            >QingdaoU/JudgeServer</a
          >
        </p>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'IndexPage',
});
</script>
