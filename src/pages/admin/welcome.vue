<template>
  <q-page class="flex flex-center">
    <div>
      <h2 style="padding: 0; margin: 0"><strong>:)</strong></h2>
      <h5 style="padding-top: 30px; margin: 0">欢迎</h5>
      <p class="q-mt-sm">这是oj的管理后台,请小心执行每一个操作</p>
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
import { useUserStore } from '@/stores/user';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const user = useUserStore();
    return {
      user,
    };
  },
  mounted() {
    // if (
    //   !this.user.exists ||
    //   (this.user.exists && this.user.info?.permission === 'user')
    // ) {
    //   this.$router.push('/');
    //   this.$q.notify({
    //     type: 'negative',
    //     message: '非法进入，管理员请从首页进入',
    //     progress: true,
    //   });
    // }
  },
});
</script>
