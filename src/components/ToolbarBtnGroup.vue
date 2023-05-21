<template>
  <!--
	<toolbar-add-btn
		v-if="user.permission.Event.canWrite || user.permission.Blog.canWrite"
	></toolbar-add-btn>-->

  <q-btn
    icon="fullscreen"
    size="lg"
    flat
    rounded
    @click="changFullscreen"
    v-if="$route.path.toLowerCase().substring(0, 12) !== '/invigilator'"
  />
  <switch-theme-btn></switch-theme-btn>

  <account-btn></account-btn>
</template>

<script setup lang="ts">
// import { useUserStore } from '@/stores/user';
import { useQuasar } from 'quasar';
import AccountBtn from './btn/AccountBtn.vue';
import SwitchThemeBtn from './btn/SwitchThemeBtn.vue';
// import ToolbarAddBtn from "./btn/ToolbarAddBtn.vue";

// const user = useUserStore();
let fullscreen = false;
const $q = useQuasar();

function changFullscreen() {
  if (!fullscreen) {
    $q.fullscreen
      .request()
      .then(() => {
        // success!
        fullscreen = true;
      })
      .catch((err) => {
        // oh, no!!!
      });
  } else {
    // 退出全屏模式：
    $q.fullscreen
      .exit()
      .then(() => {
        // success!
        fullscreen = false;
      })
      .catch((err) => {
        // oh, no!!!
      });
  }
}
</script>
