<template>
  <q-page class="flex flex-center">
    <div>
      <h2 style="padding: 0; margin: 0"><strong>:)</strong></h2>
      <h5 style="padding-top: 30px; margin: 0">欢迎</h5>
      <div>
        <img
          v-if="$q.dark.isActive"
          src="@/assets/github-mark-white.svg"
          style="width: 20px"
        />
        <img
          v-if="!$q.dark.isActive"
          src="@/assets/github-mark.svg"
          style="width: 20px"
        />
        <a
          class="q-ml-sm"
          href="https://github.com/bhscer/onlineJudge-web"
          target="_blank"
          style="color: inherit; text-decoration: none"
          >bhscer/onlineJudge-web</a
        >
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'IndexPage',
});
</script>
