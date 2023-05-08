<template>
  <div>{{ message }}</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { api as axios } from '@/boot/axios';
import { useUserStore } from '@/stores/user';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  name: 'tokenLogin',
  setup() {
    const user = useUserStore();
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();
    const message = ref('登录中');

    const token_login = () => {
      if (route.query.token) {
        localStorage.setItem('oj-auth-token', route.query.token.toString());
        user
          .user_auth()
          .then((result) => {
            router.push('/invigilator/contestList');
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        message.value = 'token不存在，无法登录。';
      }
    };
    return {
      message,
      user,
      token_login,
    };
  },
  mounted() {
    // 先清空token
    this.user.logout();
    this.token_login();
  },
});
</script>
