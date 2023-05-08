<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <q-page class="flex flex-center q-pa-lg q-ma-lg">
    <result-component
      v-if="!show_loading"
      :sid="$route.query.sid"
    ></result-component>
    <loading-page :loading="show_loading" :message="err_msg"></loading-page>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import md5 from 'js-md5';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { $t } from '@/boot/i18n';
import { api as axios } from '@/boot/axios';
import * as monaco from 'monaco-editor';
import loadingPage from '@/components/loadingPage.vue';
import ResultComponent from '@/components/resultComponent.vue';

const $q = useQuasar();
const this_router = useRouter();
const this_route = useRoute();
const show_loading = ref(true);
const err_msg = ref('');

onMounted(() => {
  if (this_route.path.toLowerCase() !== '/record'.toLowerCase()) return;
  if (this_route.query.sid === undefined) {
    // alert('参数不完整');
    show_loading.value = true;
    err_msg.value = '参数不完整';
    return;
  }
  show_loading.value = false;
});
</script>

<style scoped></style>
