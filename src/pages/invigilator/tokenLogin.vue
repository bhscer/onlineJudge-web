<template>
  <q-page class="flex flex-center">
    <loading-page
      :loading="show_loading"
      :message="err_msg"
      :loading_msg="message"
    ></loading-page>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { api as axios } from '@/boot/axios';
import { useUserStore } from '@/stores/user';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import LoadingPage from '@/components/loadingPage.vue';

export default defineComponent({
  name: 'tokenLogin',
  setup() {
    const user = useUserStore();
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();
    const show_loading = ref(true);
    // const err_detail = ref('');

    const message = ref('登录中');
    const err_msg = ref('');
    const token_login = () => {
      if (route.query.token) {
        localStorage.setItem('oj-auth-token', route.query.token.toString());
        user
          .user_auth()
          .then((result) => {
            router.push(`/invigilator/contest?cid=${route.query.cid}`);
          })
          .catch((error) => {
            // err_msg.value = '出现错误';
            // console.log(err);
            var err_msg_notify = '';
            try {
              if (error.response.status === 401)
                router.push(
                  `/userLogin?type=2&err=${error.response.data.detail}`
                );
              else if (error.response.status === 400)
                err_msg_notify = error.response.data.detail;
              else err_msg_notify = '错误码' + error.response.status;
            } catch {
              err_msg_notify = '错误码' + error.code;
            }
            err_msg.value = err_msg_notify;
            // err_detail.value = error;
          });
      } else {
        err_msg.value = 'token不存在，无法登录。';
      }
    };
    return {
      message,
      user,
      token_login,
      err_msg,
      show_loading,
      // err_detail,
    };
  },
  mounted() {
    // 先清空token
    this.user.logout();
    this.token_login();
  },
  components: { LoadingPage },
});
</script>
